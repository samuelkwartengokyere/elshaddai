import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/database'
import Donation from '@/models/Donation'
import { initializeTransaction, verifyTransaction, generateReference } from '@/lib/paystack'
import { convertCurrency } from '@/lib/currency'

// Make this route dynamic - don't attempt static generation
export const dynamic = 'force-dynamic'

/**
 * POST /api/donations - Initialize a donation payment
 */
export async function POST(request: NextRequest) {
  try {
    const dbConnection = await connectDB()
    
    // Check if database connection is available
    if (!dbConnection) {
      return NextResponse.json(
        { error: 'Database connection not available. Please check your environment variables.' },
        { status: 503 }
      )
    }
    
    const body = await request.json()
    const {
      amount,
      currency = 'USD',
      frequency,
      firstName,
      lastName,
      email,
      phone,
      country,
      donationType,
      paymentChannel = 'paystack',
      isAnonymous = false,
      notes,
    } = body

    // Validate required fields
    if (!amount || !frequency || !firstName || !lastName || !email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate payment channel
    const validChannels = ['paystack', 'bank_transfer', 'mobile_money', 'manual']
    if (!validChannels.includes(paymentChannel)) {
      return NextResponse.json(
        { error: 'Invalid payment channel' },
        { status: 400 }
      )
    }

    const donorName = `${firstName} ${lastName}`
    const amountUSD = convertCurrency(parseFloat(amount), currency as 'USD', 'USD')

    // Handle different payment channels
    switch (paymentChannel) {
      case 'paystack':
      case 'mobile_money': {
        return await initializePaystackPayment({
          amount,
          currency,
          frequency,
          donorName,
          email,
          phone,
          country,
          donationType,
          paymentChannel,
          isAnonymous,
          notes,
        })
      }

      case 'bank_transfer':
      case 'manual': {
        return await createManualDonation({
          amount,
          currency,
          amountUSD,
          frequency,
          donorName,
          email,
          phone,
          country,
          donationType,
          paymentChannel,
          isAnonymous,
          notes,
        })
      }

      default:
        return NextResponse.json(
          { error: 'Unsupported payment channel' },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('Error initializing donation:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to initialize donation'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

/**
 * Initialize Paystack payment (including mobile money)
 */
async function initializePaystackPayment(params: {
  amount: string
  currency: string
  frequency: string
  donorName: string
  email: string
  phone?: string
  country?: string
  donationType?: string
  paymentChannel: string
  isAnonymous: boolean
  notes?: string
}) {
  const {
    amount,
    currency,
    frequency,
    donorName,
    email,
    phone,
    country,
    donationType,
    paymentChannel,
    isAnonymous,
    notes,
  } = params

  // Generate unique reference for this transaction
  const reference = generateReference('donation')

  // Split donorName to get first and last name
  const nameParts = donorName.split(' ')
  const firstName = nameParts[0] || ''
  const lastName = nameParts.slice(1).join(' ') || ''

  // Initialize Paystack transaction
  const paystackResponse = await initializeTransaction({
    email,
    amount: parseFloat(amount),
    firstName,
    lastName,
    frequency,
    reference
  })

  // Create pending donation record
  const donation = new Donation({
    amount: parseFloat(amount),
    amountUSD: convertCurrency(parseFloat(amount), currency as 'USD', 'USD'),
    currency,
    exchangeRate: 1,
    frequency,
    donorName,
    donorEmail: email,
    donorPhone: phone,
    donorCountry: country,
    paymentMethod: 'online',
    paymentChannel: paymentChannel as 'paystack' | 'mobile_money',
    status: 'pending',
    paystackReference: reference,
    donationType,
    isAnonymous,
    notes,
    createdAt: new Date(),
    receiptSent: false
  })

  await donation.save()

  // Return the authorization URL for the frontend to redirect to
  return NextResponse.json({
    success: true,
    paymentChannel: 'paystack',
    authorizationUrl: paystackResponse.data.authorization_url,
    reference: paystackResponse.data.reference,
    donationId: donation._id,
    message: 'Payment initialized successfully'
  }, { status: 201 })
}

/**
 * Create manual donation record (bank transfer, etc.)
 */
async function createManualDonation(params: {
  amount: string
  currency: string
  amountUSD: number
  frequency: string
  donorName: string
  email: string
  phone?: string
  country?: string
  donationType?: string
  paymentChannel: string
  isAnonymous: boolean
  notes?: string
}) {
  const {
    amount,
    currency,
    amountUSD,
    frequency,
    donorName,
    email,
    phone,
    country,
    donationType,
    paymentChannel,
    isAnonymous,
    notes,
  } = params

  // Generate reference for tracking
  const reference = generateReference('manual')

  // Create pending donation record
  const donation = new Donation({
    amount: parseFloat(amount),
    amountUSD,
    currency,
    exchangeRate: 1,
    frequency,
    donorName,
    donorEmail: email,
    donorPhone: phone,
    donorCountry: country,
    paymentMethod: 'manual',
    paymentChannel: paymentChannel as 'bank_transfer' | 'manual',
    status: 'pending',
    transactionReference: reference,
    donationType,
    isAnonymous,
    notes,
    createdAt: new Date(),
    receiptSent: false
  })

  await donation.save()

  return NextResponse.json({
    success: true,
    paymentChannel: 'manual',
    donationId: donation._id,
    reference,
    message: 'Donation recorded. Please complete your bank transfer and email us at finance@elshaddai.org with your transfer details.',
    bankDetails: {
      currency,
      instructions: 'Please include your name and email in the transfer reference.',
    }
  }, { status: 201 })
}

/**
 * GET /api/donations - Fetch donations with filtering and pagination
 */
export async function GET(request: NextRequest) {
  try {
    const dbConnection = await connectDB()
    const isReady = dbConnection !== null
    
    // Use fallback mode if database is not connected
    if (!dbConnection || !isReady) {
      console.warn('Database not connected, using fallback mode for donations')
      return NextResponse.json({
        success: true,
        donations: [],
        totals: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false
        },
        fallback: true,
        message: 'Database unavailable - showing empty donations'
      })
    }
    
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')
    const frequency = searchParams.get('frequency')
    const paymentChannel = searchParams.get('paymentChannel')
    const currency = searchParams.get('currency')
    const sort = searchParams.get('sort') || '-createdAt'

    const skip = (page - 1) * limit

    // Build query
    const query: Record<string, unknown> = {}

    if (status) {
      query.status = status
    }

    if (frequency) {
      query.frequency = frequency
    }

    if (paymentChannel) {
      query.paymentChannel = paymentChannel
    }

    if (currency) {
      query.currency = currency
    }

    // Execute query
    const donations = await Donation.find(query)
      .sort(sort as string)
      .skip(skip)
      .limit(limit)
      .lean()

    const total = await Donation.countDocuments(query)
    const totalPages = Math.ceil(total / limit)

    // Calculate totals by currency
    const totals = await Donation.aggregate([
      { $match: { status: 'completed' } },
      {
        $group: {
          _id: '$currency',
          total: { $sum: '$amountUSD' },
          count: { $sum: 1 }
        }
      }
    ])

    return NextResponse.json({
      success: true,
      donations,
      totals,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    })

  } catch (error) {
    console.error('Error fetching donations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch donations' },
      { status: 500 }
    )
  }
}
