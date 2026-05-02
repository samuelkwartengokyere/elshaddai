import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { verifyTransaction } from '@/lib/paystack';
import { sendEmail } from '@/lib/email';
import { mailboxes } from '@/lib/mailboxes';
import {
  isPaidDonationStatus,
  mapPaystackTransactionStatus,
  mapUrlReturnStatusToDonation,
} from '@/lib/donationStatus';

type DonationRow = Record<string, unknown> & {
  id: string;
  status: string;
  paystack_reference: string | null;
  donor_name: string;
  donor_email: string;
  donor_phone: string | null;
  donor_country: string | null;
  frequency: string | null;
  donation_type: string | null;
  currency: string;
  payment_method?: string | null;
  donor_bank_name?: string | null;
  donor_bank_account_number?: string | null;
  donor_bank_account_holder?: string | null;
};

function escapeHtmlEmail(s: string | null | undefined): string {
  if (s == null) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function maskBankAccountForEmail(value: string | null | undefined): string {
  if (value == null || value === '') return '—';
  const d = String(value).replace(/\s/g, '');
  if (d.length <= 4) return '••••';
  return `••••${d.slice(-4)}`;
}

function refVariants(ref: string): string[] {
  const t = ref.trim();
  if (!t) return [];
  return [...new Set([t, t.toUpperCase(), t.toLowerCase()])];
}

function orderedPaystackRefVariants(refs: string[]): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const r of refs) {
    for (const v of refVariants(r)) {
      if (seen.has(v)) continue;
      seen.add(v);
      out.push(v);
    }
  }
  return out;
}

function refsMatch(a: string | null | undefined, b: string | null | undefined): boolean {
  if (a == null || b == null) return false;
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

async function findDonationByPaystackRefs(
  supabase: NonNullable<Awaited<ReturnType<typeof getSupabaseAdmin>>>,
  refs: string[]
): Promise<DonationRow | null> {
  for (const v of orderedPaystackRefVariants(refs)) {
    const { data, error } = await supabase
      .from('donations')
      .select('*')
      .eq('paystack_reference', v)
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Donation lookup error:', v, error);
      continue;
    }
    if (data) return data as DonationRow;
  }
  return null;
}

async function setPendingDonationStatus(
  supabase: NonNullable<Awaited<ReturnType<typeof getSupabaseAdmin>>>,
  donation: DonationRow,
  status: 'failed' | 'cancelled'
): Promise<void> {
  if (donation.status !== 'pending') return;
  await supabase.from('donations').update({ status }).eq('id', donation.id);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const refQ = searchParams.get('reference')?.trim() ?? '';
    const trxQ = searchParams.get('trxref')?.trim() ?? '';
    const paymentUrlStatus = searchParams.get('status');

    const urlRefCandidates = [...new Set([trxQ, refQ].filter(Boolean))];

    if (urlRefCandidates.length === 0) {
      return NextResponse.json({ success: false, error: 'Missing payment reference' }, { status: 400 });
    }

    const supabaseAdmin = await getSupabaseAdmin();
    if (!supabaseAdmin) {
      return NextResponse.json({ success: false, error: 'Database not configured' }, { status: 500 });
    }

    // User returned from checkout with Paystack signalling abandon / gateway failure — persist `failed` or `cancelled`
    const urlDerivedState = mapUrlReturnStatusToDonation(paymentUrlStatus);
    if (urlDerivedState) {
      const row = await findDonationByPaystackRefs(supabaseAdmin, urlRefCandidates);
      if (row) await setPendingDonationStatus(supabaseAdmin, row, urlDerivedState);
      return NextResponse.json({ success: false, error: 'Payment was not completed' }, { status: 400 });
    }

    // Paid already (idempotent — no Paystack call)
    let donation = await findDonationByPaystackRefs(supabaseAdmin, urlRefCandidates);
    if (donation && isPaidDonationStatus(donation.status)) {
      return NextResponse.json({ success: true, donation });
    }

    if (donation && donation.status !== 'pending') {
      return NextResponse.json(
        { success: false, error: 'Donation cannot be verified in its current state' },
        { status: 400 }
      );
    }

    let paystackVerification: Awaited<ReturnType<typeof verifyTransaction>> | null = null;
    let lastPaystackResponse: Awaited<ReturnType<typeof verifyTransaction>> | null = null;

    for (const candidate of urlRefCandidates) {
      try {
        const v = await verifyTransaction(candidate);
        lastPaystackResponse = v;

        if (!v.data) continue;

        const gatewayTxnStatus = typeof v.data.status === 'string' ? v.data.status.toLowerCase() : '';

        if (v.status && gatewayTxnStatus === 'success') {
          paystackVerification = v;
          break;
        }

        const resolvedRef = String(v.data.reference || candidate).trim();
        const rowForOutcome = await findDonationByPaystackRefs(supabaseAdmin, [
          resolvedRef,
          ...urlRefCandidates,
        ]);

        const mappedDb = mapPaystackTransactionStatus(v.data.status);
        if (rowForOutcome && rowForOutcome.status === 'pending' && mappedDb === 'failed') {
          await supabaseAdmin.from('donations').update({ status: 'failed' }).eq('id', rowForOutcome.id);
        }
      } catch (e) {
        console.warn('Paystack verify attempt failed for ref:', candidate, e);
      }
    }

    if (!paystackVerification) {
      if (lastPaystackResponse?.status && lastPaystackResponse.data) {
        const mapped = mapPaystackTransactionStatus(lastPaystackResponse.data.status);
        if (mapped === 'pending') {
          return NextResponse.json(
            { success: false, error: 'Payment is still processing. Please try again shortly.' },
            { status: 400 }
          );
        }
      }
      return NextResponse.json({ success: false, error: 'Payment verification failed' }, { status: 400 });
    }

    const verifiedTx = paystackVerification.data;
    const canonicalRef = String(verifiedTx.reference || urlRefCandidates[0]).trim();

    if (!donation || !refsMatch(String(donation.paystack_reference), canonicalRef)) {
      donation = await findDonationByPaystackRefs(supabaseAdmin, [canonicalRef, ...urlRefCandidates]);
    }

    if (!donation) {
      console.error('Donation not found after Paystack success. canonicalRef:', canonicalRef);
      return NextResponse.json({ success: false, error: 'Donation not found' }, { status: 404 });
    }

    if (!refsMatch(String(donation.paystack_reference), canonicalRef)) {
      return NextResponse.json(
        { success: false, error: 'Donation record does not match this payment' },
        { status: 400 }
      );
    }

    if (isPaidDonationStatus(donation.status)) {
      return NextResponse.json({ success: true, donation });
    }

    if (donation.status !== 'pending') {
      return NextResponse.json(
        { success: false, error: 'Donation cannot be verified in its current state' },
        { status: 400 }
      );
    }

    const rawMinor =
      typeof verifiedTx.amount === 'number'
        ? verifiedTx.amount
        : Number.parseInt(String(verifiedTx.amount), 10);
    if (!Number.isFinite(rawMinor)) {
      return NextResponse.json(
        { success: false, error: 'Payment amount could not be read from gateway' },
        { status: 502 }
      );
    }
    const amount = Math.round((rawMinor / 100) * 100) / 100;
    if (amount <= 0 || amount > 99_999_999.99) {
      return NextResponse.json(
        { success: false, error: 'Payment amount is out of range' },
        { status: 400 }
      );
    }

    const currencyOut = (verifiedTx.currency || donation.currency || 'GHS').toUpperCase();

    const payloadFull = {
      status: 'success' as const,
      amount,
      currency: currencyOut,
      transaction_reference: String(verifiedTx.id),
    };

    let updateError = (await supabaseAdmin.from('donations').update(payloadFull).eq('id', donation.id))
      .error;

    if (updateError) {
      const msg = updateError.message || '';
      const retryWithoutTxnRef =
        /transaction_reference|PGRST204|Could not find|column/i.test(msg);
      if (retryWithoutTxnRef) {
        const { error: e2 } = await supabaseAdmin
          .from('donations')
          .update({
            status: 'success',
            amount,
            currency: currencyOut,
          })
          .eq('id', donation.id);
        updateError = e2;
      }
    }

    if (updateError) {
      console.error('Donations verify update failed:', JSON.stringify(updateError));
      const code =
        typeof updateError === 'object' &&
        updateError !== null &&
        'code' in updateError &&
        typeof (updateError as { code: unknown }).code === 'string'
          ? (updateError as { code: string }).code
          : undefined;
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to update donation',
          ...(code && { code }),
          ...(process.env.NODE_ENV === 'development' && {
            debug: typeof updateError.message === 'string' ? updateError.message : undefined,
          }),
        },
        { status: 500 }
      );
    }

    const displayRef = canonicalRef;

    const receiptSubject = `Donation Receipt - Ref: ${displayRef}`;
    const receiptHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Thank You for Your Generous Donation!</h2>
        <p>Dear ${donation.donor_name},</p>
        <p>Thank you for supporting El-Shaddai Revival Centre.</p>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Reference:</strong> ${displayRef}</p>
          <p><strong>Amount:</strong> ${amount.toFixed(2)} ${currencyOut}</p>
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

    const paymentSubject = `New Donation Received [${displayRef}] - ${amount.toFixed(2)} ${currencyOut}`;
    const paymentHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>New Successful Donation</h2>
        <p>A new donation has been received and verified.</p>
        <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #0ea5e9;">
          <p><strong>Reference:</strong> ${displayRef}</p>
          <p><strong>Donor:</strong> ${donation.donor_name}</p>
          <p><strong>Email:</strong> ${donation.donor_email}</p>
          <p><strong>Amount:</strong> ${amount.toFixed(2)} ${currencyOut}</p>
          <p><strong>Paystack ID:</strong> ${verifiedTx.id}</p>
          <p><strong>Type:</strong> ${donation.donation_type || 'General'}</p>
          <p><strong>Phone:</strong> ${donation.donor_phone || 'N/A'}</p>
          <p><strong>Country:</strong> ${donation.donor_country || 'N/A'}</p>
          ${
            String(donation.payment_method || '') === 'bank_transfer' &&
            (donation.donor_bank_name || donation.donor_bank_account_holder)
              ? `<p><strong>Donor bank (from Give form):</strong> ${escapeHtmlEmail(donation.donor_bank_name)}</p>
          <p><strong>Account holder (from Give form):</strong> ${escapeHtmlEmail(donation.donor_bank_account_holder)}</p>
          <p><strong>Account number (masked):</strong> ${maskBankAccountForEmail(donation.donor_bank_account_number)}</p>`
              : ''
          }
        </div>
        <p>Please review in admin dashboard if needed.</p>
        <hr>
        <p>Payment Processing Team<br>El-Shaddai Revival Centre</p>
      </div>
    `;

    const paymentSent = await sendEmail({
      to: [mailboxes.payments],
      subject: paymentSubject,
      html: paymentHtml,
    });

    const emailsOk = !!(receiptSent && paymentSent);
    await supabaseAdmin
      .from('donations')
      .update({ receipt_sent: emailsOk })
      .eq('id', donation.id);

    const donationOut = {
      ...donation,
      status: 'success' as const,
      amount,
      currency: currencyOut,
      transaction_reference: String(verifiedTx.id),
      receipt_sent: emailsOk,
    };

    if (emailsOk) {
      return NextResponse.json({ success: true, donation: donationOut });
    }
    console.warn('Some emails failed but transaction verified');
    return NextResponse.json({
      success: true,
      donation: donationOut,
      warning: 'Transaction success, some emails failed',
    });
  } catch (error) {
    console.error('Verify API error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
