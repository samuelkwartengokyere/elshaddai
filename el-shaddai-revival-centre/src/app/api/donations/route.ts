import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { initializeTransaction, generateReference } from '@/lib/paystack';
import { sendEmail } from '@/lib/email';

interface DonationData {
  amount: number;
  currency: string;
  frequency: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  country?: string;
  donationType?: string;
  paymentMethod?: string;
  paymentChannel?: string;
  isAnonymous?: boolean;
  notes?: string;
  mobileMoneyProvider?: string;
  accountHolderName?: string;
  bankName?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data: DonationData = body;

    // Validation
    if (!data.amount || data.amount <= 0 || !data.email || !data.firstName || !data.lastName) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const reference = generateReference('donation');

    // Insert pending donation
    const supabaseAdmin = await getSupabaseAdmin();
    if (!supabaseAdmin) {
      return NextResponse.json({ success: false, error: 'Database not configured' }, { status: 500 });
    }

    const { data: donation, error: dbError } = await supabaseAdmin
      .from('donations')
      .insert({
        reference,
        amount: data.amount,
        currency: data.currency || 'USD',
        donor_email: data.email,
        donor_name: `${data.firstName} ${data.lastName}`,
        frequency: data.frequency || 'one-time',
        status: 'pending',
        payment_method: data.paymentMethod,
        payment_channel: data.paymentChannel || 'paystack',
        phone: data.phone,
        country: data.country,
        donation_type: data.donationType,
        is_anonymous: data.isAnonymous || false,
        notes: data.notes,
        metadata: {
          mobile_money_provider: data.mobileMoneyProvider,
          account_holder_name: data.accountHolderName,
          bank_name: data.bankName,
          ...body
        }
      })
      .select('id, reference')
      .single();

    if (dbError || !donation) {
      console.error('DB insert error:', dbError);
      return NextResponse.json({ success: false, error: 'Failed to create donation record' }, { status: 500 });
    }

    // Initialize Paystack (skip for manual bank_transfer)
    let paystackData = null;
    if (data.paymentChannel !== 'manual' && data.paymentChannel !== 'bank_transfer') {
      paystackData = await initializeTransaction({
        email: data.email,
        amount: data.amount,
        firstName: data.firstName,
        lastName: data.lastName,
        frequency: data.frequency,
        reference,
      });
      
      if (!paystackData.status) {
        return NextResponse.json({ success: false, error: 'Failed to initialize payment' }, { status: 500 });
      }
    }

    // Send init confirmation email to donor
    const initSubject = `Donation Started - Ref: ${reference}`;
    const initHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Thank You for Starting Your Donation!</h2>
        <p>Dear ${data.firstName} ${data.lastName},</p>
        <p>We've received your donation request. Reference: <strong>${reference}</strong></p>
        <p>Complete payment at the link sent to continue.</p>
        <p>Amount: ${data.amount.toFixed(2)} ${data.currency.toUpperCase()}</p>
        <hr>
        <p>Blessings,<br>El-Shaddai Revival Centre</p>
      </div>
    `;
    await sendEmail({
      to: [data.email],
      subject: initSubject,
      html: initHtml,
    });

    return NextResponse.json({ 
      success: true, 
      reference: paystackData?.data?.reference || reference,
      donationId: donation.id,
      authorization_url: paystackData?.data?.authorization_url 
    });

  } catch (error) {
    console.error('Donations API error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
