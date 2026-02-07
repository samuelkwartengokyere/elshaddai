import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/database'
import Donation from '@/models/Donation'

// Make this route dynamic - don't attempt static generation
export const dynamic = 'force-dynamic'

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
    const { amount, frequency, firstName, lastName, email, timestamp } = body

    // Validate required fields
    if (!amount || !frequency || !firstName || !lastName || !email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create donation record
    const donation = new Donation({
      amount: parseFloat(amount),
      currency: 'USD',
      frequency,
      donorName: `${firstName} ${lastName}`,
      donorEmail: email,
      paymentMethod: 'credit_card',
      status: 'completed', // For demo purposes, mark as completed
      createdAt: timestamp ? new Date(timestamp) : new Date(),
      receiptSent: false
    })

    await donation.save()

    return NextResponse.json({
      success: true,
      donation,
      message: 'Donation processed successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('Error processing donation:', error)
    return NextResponse.json(
      { error: 'Failed to process donation' },
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
