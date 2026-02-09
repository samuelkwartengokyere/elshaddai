import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/database'
import Donation from '@/models/Donation'
import { createCheckoutSession, createPaymentIntent, verifyPaymentIntent, cancelPaymentIntent } from '@/lib/stripe'
import { generateReference } from '@/lib/paystack'

// Make this route dynamic
export const dynamic = 'force-dynamic'

/**
 * POST /api/donations/stripe - Create Stripe checkout session or payment intent
 */
export async function POST(request: NextRequest) {
  try {
    const dbConnection = await connectDB()
    
    if (!dbConnection) {
      return NextResponse.json(
        { error: 'Database connection not available' },
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
      paymentMethod = 'card',
      useCheckout = true, // Use checkout page or embedded payment intent
    } = body

    // Validate required fields
    if (!amount || !frequency || !firstName || !lastName || !email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const donorName = `${firstName} ${lastName}`
    const reference = generateReference('stripe')

    // Create metadata for tracking
    const metadata = {
      frequency,
      firstName,
      lastName,
      donorName,
      donationType: donationType || 'general',
      country: country || '',
      reference,
    }

    let paymentData

    if (useCheckout) {
      // Create Stripe Checkout Session
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
      
      const session = await createCheckoutSession({
        amount: parseFloat(amount),
        currency,
        email,
        name: donorName,
        successUrl: `${baseUrl}/give?stripe_success=true&session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${baseUrl}/give?stripe_cancelled=true`,
        metadata,
      })

      paymentData = {
        success: true,
        checkoutUrl: session.url,
        sessionId: session.id,
        reference,
        message: 'Stripe checkout session created successfully',
      }
    } else {
      // Create Payment Intent for embedded payment
      const paymentIntent = await createPaymentIntent({
        amount: parseFloat(amount),
        currency,
        email,
        name: donorName,
        phone,
        metadata,
      })

      // Create pending donation record
      const donation = new Donation({
        amount: parseFloat(amount),
        currency,
        frequency,
        donorName,
        donorEmail: email,
        donorPhone: phone,
        donorCountry: country,
        paymentMethod: 'card',
        paymentChannel: 'stripe',
        status: 'pending',
        stripePaymentIntentId: paymentIntent.id,
        donationType: donationType || 'general',
        createdAt: new Date(),
        receiptSent: false,
      })

      await donation.save()

      paymentData = {
        success: true,
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        reference,
        donationId: donation._id,
        message: 'Stripe payment intent created successfully',
      }
    }

    return NextResponse.json(paymentData, { status: 201 })

  } catch (error) {
    console.error('Error creating Stripe payment:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to create payment'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

/**
 * GET /api/donations/stripe - Verify Stripe payment
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const sessionId = searchParams.get('session_id')
    const paymentIntentId = searchParams.get('payment_intent')

    if (!sessionId && !paymentIntentId) {
      return NextResponse.json(
        { error: 'Missing session_id or payment_intent parameter' },
        { status: 400 }
      )
    }

    let paymentStatus

    if (sessionId) {
      // For checkout sessions, verify through our database
      const donation = await Donation.findOne({
        stripePaymentIntentId: { $regex: new RegExp(`_${sessionId.slice(-10)}$`) },
      }).sort({ createdAt: -1 })

      if (donation && donation.status === 'completed') {
        paymentStatus = {
          success: true,
          status: 'completed',
          donation: {
            id: donation._id,
            amount: donation.amount,
            currency: donation.currency,
            donorName: donation.donorName,
          },
        }
      } else {
        paymentStatus = {
          success: false,
          status: 'pending',
          message: 'Payment verification in progress',
        }
      }
    } else if (paymentIntentId) {
      // For payment intents, verify with Stripe
      const paymentIntent = await verifyPaymentIntent(paymentIntentId)

      const isSucceeded = paymentIntent.status === 'succeeded'
      const isProcessing = paymentIntent.status === 'processing'

      // Update donation status in database
      await Donation.findOneAndUpdate(
        { stripePaymentIntentId: paymentIntentId },
        {
          status: isSucceeded ? 'completed' : isProcessing ? 'pending' : 'failed',
          updatedAt: new Date(),
        }
      )

      paymentStatus = {
        success: isSucceeded,
        status: paymentIntent.status,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency.toUpperCase(),
      }
    }

    return NextResponse.json(paymentStatus)

  } catch (error) {
    console.error('Error verifying Stripe payment:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to verify payment'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/donations/stripe - Cancel a pending payment intent
 */
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const paymentIntentId = searchParams.get('payment_intent')

    if (!paymentIntentId) {
      return NextResponse.json(
        { error: 'Missing payment_intent parameter' },
        { status: 400 }
      )
    }

    // Cancel the payment intent with Stripe
    await cancelPaymentIntent(paymentIntentId)

    // Update donation status in database
    await Donation.findOneAndUpdate(
      { stripePaymentIntentId: paymentIntentId },
      {
        status: 'cancelled',
        updatedAt: new Date(),
      }
    )

    return NextResponse.json({
      success: true,
      message: 'Payment cancelled successfully',
    })

  } catch (error) {
    console.error('Error cancelling Stripe payment:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to cancel payment'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

