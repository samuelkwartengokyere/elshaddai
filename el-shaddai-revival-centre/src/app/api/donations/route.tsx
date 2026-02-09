import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/database'
import Donation from '@/models/Donation'
import { initializeTransaction, verifyTransaction, generateReference } from '@/lib/paystack'

// Make this route dynamic - don't attempt static generation
export const dynamic = 'force-dynamic'

/**
 * POST /api/donations - Initialize a Paystack transaction
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
    const { amount, frequency, firstName, lastName, email } = body

    // Validate required fields
    if (!amount || !frequency || !firstName || !lastName || !email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Generate unique reference for this transaction
    const reference = generateReference('donation')

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
      currency: 'USD',
      frequency,
      donorName: `${firstName} ${lastName}`,
      donorEmail: email,
      paymentMethod: 'paystack',
      status: 'pending',
      paystackReference: reference,
      createdAt: new Date(),
      receiptSent: false
    })

    await donation.save()

    // Return the authorization URL for the frontend to redirect to
    return NextResponse.json({
      success: true,
      authorizationUrl: paystackResponse.data.authorization_url,
      reference: paystackResponse.data.reference,
      donationId: donation._id,
      message: 'Payment initialized successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('Error initializing donation:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to initialize donation'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const dbConnection = await connectDB()
    
    // Check if database connection is available
    if (!dbConnection) {
      return NextResponse.json(
        { error: 'Database connection not available. Please check your environment variables.' },
        { status: 503 }
      )
    }
    
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')
    const frequency = searchParams.get('frequency')
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

    // Execute query
    const donations = await Donation.find(query)
      .sort(sort as string)
      .skip(skip)
      .limit(limit)
      .lean()

    const total = await Donation.countDocuments(query)
    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      success: true,
      donations,
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
