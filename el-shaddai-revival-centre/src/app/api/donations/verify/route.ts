import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { verifyTransaction } from '@/lib/paystack';
import { sendEmail } from '@/lib/email';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const reference = searchParams.get('reference');
    const status = searchParams.get('status');

    if (!reference || status !== 'success') {
      return NextResponse.json({ success: false, error: 'Invalid reference or status' }, { status: 400 });
    }

    // Fetch donation
    const supabaseAdmin = await getSupabaseAdmin();
    if (!supabaseAdmin) {
      return NextResponse.json({ success: false, error: 'Database not configured' }, { status: 500 });
    }

    const { data: donation, error: fetchError } = await supabaseAdmin
      .from('donations')
      .select('*')
      .eq('reference', reference)
      .eq('status', 'pending')
      .single();

    if (fetchError || !donation) {
      console.error('Donation fetch error:', fetchError);
      return NextResponse.json({ success: false, error: 'Donation not found or already processed' }, { status: 404 });
    }

    // Verify Paystack transaction
    const paystackVerification = await verifyTransaction(reference);
    if (!paystackVerification.status || paystackVerification.data.status !== 'success') {
      return NextResponse.json({ success: false, error: 'Payment verification failed' }, { status: 400 });
    }

    const verifiedTx = paystackVerification.data;
    const amount = verifiedTx.amount / 100; // Convert kobo to currency unit

    // Update donation status
    const { error: updateError } = await supabaseAdmin
      .from('donations')
      .update({
        status: 'success',
        paystack_tx_id: verifiedTx.id,
        verified_amount: amount,
        verified_currency: verifiedTx.currency,
        updated_at: new Date().toISOString(),
      })
      .eq('id', donation.id);

    if (updateError) {
      console.error('Update error:', updateError);
      return NextResponse.json({ success: false, error: 'Failed to update donation' }, { status: 500 });
    }

    // 1. Send receipt to donor
    const receiptSubject = `Donation Receipt - Ref: ${reference}`;
    const receiptHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Thank You for Your Generous Donation!</h2>
        <p>Dear ${donation.donor_name},</p>
        <p>Thank you for supporting El-Shaddai Revival Centre.</p>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Reference:</strong> ${reference}</p>
          <p><strong>Amount:</strong> ${amount.toFixed(2)} ${donation.currency.toUpperCase()}</p>
          <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
          <p><strong>Type:</strong> ${donation.donation_type || 'General'}</p>
        </div>
        <p>This donation is tax-deductible. Please save this receipt.</p>
        <hr>
        <p>Blessings,<br>El-Shaddai Revival Centre Team</p>
      </div>
    `;

    const receiptSent = await sendEmail({
      to: [donation.donor_email],
      subject: receiptSubject,
      html: receiptHtml,
    });

    // 2. Send notification to payment team
    const paymentSubject = `New Donation Received [${reference}] - ${amount.toFixed(2)} ${donation.currency.toUpperCase()}`;
    const paymentHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>New Successful Donation</h2>
        <p>A new donation has been received and verified.</p>
        <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #0ea5e9;">
          <p><strong>Reference:</strong> ${reference}</p>
          <p><strong>Donor:</strong> ${donation.donor_name}</p>
          <p><strong>Email:</strong> ${donation.donor_email}</p>
          <p><strong>Amount:</strong> ${amount.toFixed(2)} ${donation.currency.toUpperCase()}</p>
          <p><strong>Paystack ID:</strong> ${verifiedTx.id}</p>
          <p><strong>Frequency:</strong> ${donation.frequency}</p>
          <p><strong>Type:</strong> ${donation.donation_type || 'General'}</p>
          <p><strong>Phone:</strong> ${donation.phone || 'N/A'}</p>
          <p><strong>Country:</strong> ${donation.country || 'N/A'}</p>
        </div>
        <p>Please review in admin dashboard if needed.</p>
        <hr>
        <p>Payment Processing Team<br>El-Shaddai Revival Centre</p>
      </div>
    `;

    const paymentSent = await sendEmail({
      to: ['payment.copelshaddai@gmail.com'],
      subject: paymentSubject,
      html: paymentHtml,
    });

    if (receiptSent && paymentSent) {
      return NextResponse.json({ success: true, donation });
    } else {
      // Don't fail on email issues
      console.warn('Some emails failed but transaction verified');
      return NextResponse.json({ success: true, donation, warning: 'Transaction success, some emails failed' });
    }

  } catch (error) {
    console.error('Verify API error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
