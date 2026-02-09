import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/database'
import Donation from '@/models/Donation'
import { verifyTransaction } from '@/lib/paystack'

// Make this route dynamic
export const dynamic = 'force-dynamic'

/**
 * GET /api/donations/verify?reference=xxx - Verify a Paystack transaction
 * This endpoint is called after the user returns from Paystack
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const reference = searchParams.get('reference')
    const status = searchParams.get('status')

    // Check if Paystack redirect status
    if (status === 'success' && reference) {
      // Verify the transaction with Paystack
      const verifyResponse = await verifyTransaction(reference)

      if (verifyResponse.data.status === 'success') {
        // Find and update the donation record
        const donation = await Donation.findOneAndUpdate(
          { paystackReference: reference },
          {
            status: 'completed',
            paystackTransactionId: verifyResponse.data.id.toString(),
            authorizationCode: verifyResponse.data.authorization?.authorization_code,
            last4Card: verifyResponse.data.authorization?.last4,
            cardType: `${verifyResponse.data.authorization?.exp_month}/${verifyResponse.data.authorization?.exp_year}`,
            updatedAt: new Date()
          },
          { new: true }
        )

        if (donation) {
          return NextResponse.json({
            success: true,
            donation,
            message: 'Donation verified successfully'
          })
        }

        return NextResponse.json(
          { error: 'Donation record not found' },
          { status: 404 }
        )
      } else {
        // Mark as failed
        await Donation.findOneAndUpdate(
          { paystackReference: reference },
          {
            status: 'failed',
            updatedAt: new Date()
          }
        )

        return NextResponse.json(
          { error: 'Payment was not successful' },
          { status: 400 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Invalid request parameters' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Error verifying donation:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to verify donation'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

