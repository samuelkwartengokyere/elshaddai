import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import connectDB from '@/lib/database'
import Donation from '@/models/Donation'
import { constructWebhookEvent } from '@/lib/stripe'

// Make this route dynamic
export const dynamic = 'force-dynamic'

/**
 * POST /api/donations/stripe-webhook - Handle Stripe webhook events
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    
    // Get Stripe signature from headers
    const headersList = await headers()
    const signature = headersList.get('stripe-signature')

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing Stripe signature' },
        { status: 400 }
      )
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

    if (!webhookSecret) {
      console.error('Stripe webhook secret not configured')
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      )
    }

    // Verify and construct the event
    const event = constructWebhookEvent(body, signature, webhookSecret)

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as {
          id: string
          payment_intent: string
          amount_total: number
          currency: string
          customer_email: string
          metadata: Record<string, string>
        }

        // Create or update donation record
        await handleCheckoutCompleted(session)
        break
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as {
          id: string
          amount: number
          currency: string
          receipt_email: string
          metadata: Record<string, string>
        }

        await handlePaymentSucceeded(paymentIntent)
        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as {
          id: string
          amount: number
          currency: string
          last_payment_error: { message: string }
        }

        await handlePaymentFailed(paymentIntent)
        break
      }

      case 'charge.refunded': {
        const charge = event.data.object as {
          payment_intent: string
          amount: number
          refunded: boolean
        }

        await handleRefund(charge)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('Error processing Stripe webhook:', error)
    const errorMessage = error instanceof Error ? error.message : 'Webhook processing failed'
    return NextResponse.json(
      { error: errorMessage },
      { status: 400 }
    )
  }
}

/**
 * Handle successful checkout session
 */
async function handleCheckoutCompleted(session: {
  id: string
  payment_intent: string
  amount_total: number
  currency: string
  customer_email: string
  metadata: Record<string, string>
}) {
  const {
    payment_intent,
    amount_total,
    currency,
    customer_email,
    metadata,
  } = session

  // Check if donation already exists
  const existingDonation = await Donation.findOne({
    stripePaymentIntentId: payment_intent,
  })

  if (existingDonation) {
    // Update existing donation
    await Donation.findOneAndUpdate(
      { stripePaymentIntentId: payment_intent },
      {
        status: 'completed',
        updatedAt: new Date(),
      }
    )
    console.log(`Donation ${existingDonation._id} marked as completed`)
  } else {
    // Create new donation record
    const donation = new Donation({
      amount: amount_total / 100, // Convert from cents
      currency: currency.toUpperCase(),
      amountUSD: amount_total / 100,
      frequency: (metadata.frequency as 'one-time' | 'weekly' | 'monthly' | 'yearly') || 'one-time',
      donorName: metadata.donorName || customer_email,
      donorEmail: customer_email,
      paymentMethod: 'card',
      paymentChannel: 'stripe',
      status: 'completed',
      stripePaymentIntentId: payment_intent,
      donationType: metadata.donationType || 'general',
      isAnonymous: false,
      receiptSent: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    await donation.save()
    console.log(`New donation ${donation._id} created from checkout session`)
  }
}

/**
 * Handle successful payment intent
 */
async function handlePaymentSucceeded(paymentIntent: {
  id: string
  amount: number
  currency: string
  receipt_email: string
  metadata: Record<string, string>
}) {
  const { id, amount, currency, receipt_email, metadata } = paymentIntent

  await Donation.findOneAndUpdate(
    { stripePaymentIntentId: id },
    {
      status: 'completed',
      amountUSD: amount / 100,
      currency: currency.toUpperCase(),
      updatedAt: new Date(),
    }
  )

  console.log(`Payment intent ${id} succeeded`)
}

/**
 * Handle failed payment
 */
async function handlePaymentFailed(paymentIntent: {
  id: string
  amount: number
  currency: string
  last_payment_error: { message: string }
}) {
  const { id, last_payment_error } = paymentIntent

  await Donation.findOneAndUpdate(
    { stripePaymentIntentId: id },
    {
      status: 'failed',
      notes: `Payment failed: ${last_payment_error?.message || 'Unknown error'}`,
      updatedAt: new Date(),
    }
  )

  console.log(`Payment intent ${id} failed: ${last_payment_error?.message}`)
}

/**
 * Handle refund
 */
async function handleRefund(charge: {
  payment_intent: string
  amount: number
  refunded: boolean
}) {
  await Donation.findOneAndUpdate(
    { stripePaymentIntentId: charge.payment_intent },
    {
      status: 'refunded',
      updatedAt: new Date(),
    }
  )

  console.log(`Charge ${charge.payment_intent} refunded`)
}

