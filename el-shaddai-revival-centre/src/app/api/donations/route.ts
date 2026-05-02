import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { initializeTransaction, generateReference } from '@/lib/paystack';
import { sendEmail } from '@/lib/email';
import { convertCurrency, normalizeDonationCurrency } from '@/lib/currency';
import {
  paystackChannelsForGiveMethod,
  shouldRetryPaystackInitializeWithoutChannels,
} from '@/lib/paystackChannels';
import type { Currency } from '@/types/donation';

function isPaystackMerchantCurrencyRejected(message: string): boolean {
  return /currency\s+not\s+supported/i.test(message);
}

/** Optional: always settle in GHS on Paystack when donor chooses USD (avoids rejected USD). */
function forceSettlementGhanaUsd(): boolean {
  return process.env.PAYSTACK_SETTLEMENT_CURRENCY?.trim().toUpperCase() === 'GHS';
}

function fallbackUsdToGhsDisabled(): boolean {
  return ['1', 'true', 'yes'].includes(
    process.env.PAYSTACK_DISABLE_USD_TO_GHS_FALLBACK?.trim().toLowerCase() || ''
  );
}
function donationCallbackUrl(request: NextRequest): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '');
  const origin = fromEnv || new URL(request.url).origin;
  return `${origin}/give`;
}

/** PostgREST: unknown/missing columns or stale schema cache. */
function isLikelyMissingDonationColumnsError(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false;
  const o = err as { code?: string; message?: string };
  const m = `${o.code ?? ''} ${o.message ?? ''} ${JSON.stringify(err)}`.toLowerCase();
  return o.code === 'PGRST204' || /could not find|schema cache|PGRST20|unknown column|\bcolumns\b/i.test(m);
}

function bankTransferFallbackNotes(
  existingNotes: string | null | undefined,
  bankName: string,
  accountHolderName: string,
  accountDigits: string
): string {
  const line = `[Bank transfer] Bank: ${bankName}; Holder: ${accountHolderName}; Account: ${accountDigits}`;
  const base = (existingNotes || '').trim();
  return base ? `${base}\n${line}` : line;
}

interface DonationData {
  amount: number | string;
  currency: string;
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
  bankAccountNumber?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data: DonationData = body;

    const amountNum =
      typeof data.amount === 'string' ? parseFloat(data.amount) : Number(data.amount);

    // Validation
    if (
      data.amount === '' ||
      data.amount === undefined ||
      data.amount === null ||
      Number.isNaN(amountNum) ||
      amountNum <= 0 ||
      !data.email ||
      !data.firstName ||
      !data.lastName
    ) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const currencyNorm = normalizeDonationCurrency(data.currency);
    if (!currencyNorm.ok) {
      return NextResponse.json({ success: false, error: currencyNorm.error }, { status: 400 });
    }
    const currencyCode = currencyNorm.currency;

    if (data.paymentMethod === 'bank_transfer') {
      const bn = data.bankName?.trim();
      const acc = data.bankAccountNumber?.replace(/\s/g, '') ?? '';
      const holder = data.accountHolderName?.trim();
      if (!bn) {
        return NextResponse.json({ success: false, error: 'Bank name is required for bank transfer' }, { status: 400 });
      }
      if (!acc || !/^\d{8,18}$/.test(acc)) {
        return NextResponse.json(
          { success: false, error: 'A valid bank account number (8–18 digits) is required for bank transfer' },
          { status: 400 }
        );
      }
      if (!holder) {
        return NextResponse.json(
          { success: false, error: 'Account holder full name is required for bank transfer' },
          { status: 400 }
        );
      }
    }

    const reference = generateReference('donation');

    // Insert pending donation
    const supabaseAdmin = await getSupabaseAdmin();
    if (!supabaseAdmin) {
      return NextResponse.json({ success: false, error: 'Database not configured' }, { status: 500 });
    }

    const rowBase = {
      paystack_reference: reference,
      amount: amountNum,
      currency: currencyCode,
      donor_email: data.email,
      donor_name: `${data.firstName} ${data.lastName}`,
      frequency: 'one-time',
      status: 'pending' as const,
      payment_method: data.paymentMethod,
      payment_channel: data.paymentChannel || 'paystack',
      donor_phone: data.phone || null,
      donor_country: data.country || null,
      donation_type: data.donationType,
      is_anonymous: data.isAnonymous || false,
      notes: data.notes || null,
      receipt_sent: false,
    };

    const bankCols =
      data.paymentMethod === 'bank_transfer'
        ? {
            donor_bank_name: data.bankName!.trim(),
            donor_bank_account_number: data.bankAccountNumber!.replace(/\s/g, ''),
            donor_bank_account_holder: data.accountHolderName!.trim(),
          }
        : null;

    let donation: { id: string; paystack_reference: string | null } | null = null;
    let dbError: unknown = null;

    const firstInsert =
      bankCols === null
        ? await supabaseAdmin.from('donations').insert(rowBase).select('id, paystack_reference').single()
        : await supabaseAdmin
            .from('donations')
            .insert({ ...rowBase, ...bankCols })
            .select('id, paystack_reference')
            .single();

    donation = firstInsert.data;
    dbError = firstInsert.error;

    if (
      (dbError || !donation) &&
      bankCols !== null &&
      isLikelyMissingDonationColumnsError(dbError)
    ) {
      const acctDigits = bankCols.donor_bank_account_number;
      const fb = bankTransferFallbackNotes(
        rowBase.notes ?? undefined,
        bankCols.donor_bank_name,
        bankCols.donor_bank_account_holder,
        acctDigits
      );
      const second = await supabaseAdmin
        .from('donations')
        .insert({
          ...rowBase,
          notes: fb,
        })
        .select('id, paystack_reference')
        .single();
      donation = second.data;
      dbError = second.error;
      if (!dbError && donation) {
        console.warn(
          'donations.insert: donor_bank_* columns unavailable — saved bank transfer details on notes instead. Run SUPABASE_SCHEMA alters.'
        );
      }
    }

    if (dbError || !donation) {
      console.error('DB insert error:', JSON.stringify(dbError));
      const dbg =
        process.env.NODE_ENV === 'development' && dbError && typeof dbError === 'object' && 'message' in dbError
          ? { debug: String((dbError as { message: unknown }).message) }
          : {};
      return NextResponse.json({ success: false, error: 'Failed to create donation record', ...dbg }, { status: 500 });
    }

    let settleCurrency: Currency = currencyCode;
    let settleAmount = amountNum;
    const donorChosenUsd = currencyCode === 'USD';

    if (donorChosenUsd && forceSettlementGhanaUsd()) {
      settleCurrency = 'GHS';
      settleAmount = convertCurrency(amountNum, 'USD', 'GHS');
      const convNote = `Donor chose USD ${amountNum.toFixed(2)}; Paystack settles in GHS (${settleAmount.toFixed(2)}).`;

      await supabaseAdmin
        .from('donations')
        .update({
          currency: 'GHS',
          amount: settleAmount,
          notes: data.notes ? `${data.notes}\n${convNote}` : convNote,
        })
        .eq('id', donation.id);
    }

    const metaBase = {
      donation_payment_method: data.paymentMethod || 'card',
      ...(donorChosenUsd &&
        settleCurrency === 'GHS' && {
          donor_requested_currency: 'USD',
          donor_requested_amount: amountNum,
        }),
    };

    const initDonationPaystack = async (opts: {
      amount: number;
      currency: Currency;
      metadataExtra: Record<string, unknown>;
    }) => {
      const channels = paystackChannelsForGiveMethod(data.paymentMethod);
      const base = {
        email: data.email,
        amount: opts.amount,
        firstName: data.firstName,
        lastName: data.lastName,
        frequency: 'one-time',
        reference,
        callbackUrl: donationCallbackUrl(request),
        currency: opts.currency,
        metadataExtra: opts.metadataExtra,
      };

      const tryWithChannels = async () =>
        initializeTransaction({
          ...base,
          ...(channels?.length ? { channels } : {}),
        });

      try {
        let res = await tryWithChannels();
        if (
          !res.status &&
          channels &&
          channels.length > 0 &&
          shouldRetryPaystackInitializeWithoutChannels(res.message, true)
        ) {
          res = await initializeTransaction({ ...base });
        }
        return res;
      } catch (err) {
        const msg = err instanceof Error ? err.message : '';
        if (
          channels &&
          channels.length > 0 &&
          shouldRetryPaystackInitializeWithoutChannels(msg, true)
        ) {
          return initializeTransaction({ ...base });
        }
        throw err;
      }
    };

    let paystackData;
    try {
      paystackData = await initDonationPaystack({
        amount: settleAmount,
        currency: settleCurrency,
        metadataExtra: metaBase,
      });
    } catch (firstErr) {
      const msg = firstErr instanceof Error ? firstErr.message : '';
      const canFallback =
        donorChosenUsd &&
        settleCurrency === 'USD' &&
        !fallbackUsdToGhsDisabled() &&
        isPaystackMerchantCurrencyRejected(msg);

      if (!canFallback) throw firstErr;

      settleCurrency = 'GHS';
      settleAmount = convertCurrency(amountNum, 'USD', 'GHS');
      const convNote = `Donor chose USD ${amountNum.toFixed(2)}; merchant settled in GHS (${settleAmount.toFixed(2)}) — USD not activated on Paystack.`;

      const { error: updErr } = await supabaseAdmin
        .from('donations')
        .update({
          currency: 'GHS',
          amount: settleAmount,
          notes: data.notes ? `${data.notes}\n${convNote}` : convNote,
        })
        .eq('id', donation.id);

      if (updErr) {
        console.error('Donation update before GHS retry:', updErr);
      }

      paystackData = await initDonationPaystack({
        amount: settleAmount,
        currency: 'GHS',
        metadataExtra: {
          donation_payment_method: data.paymentMethod || 'card',
          donor_requested_currency: 'USD',
          donor_requested_amount: amountNum,
        },
      });
    }

    // Hosted checkout is narrowed to the donor’s chosen method via `channels`; if Paystack rejects that list we retry without it.
    if (!paystackData.status || !paystackData.data?.authorization_url) {
      return NextResponse.json(
        { success: false, error: paystackData.message || 'Failed to initialize payment' },
        { status: 500 }
      );
    }

    const checkoutUrl = paystackData.data.authorization_url;

    // Send init email with the real Paystack link (donors may close the tab or delay—email must not imply a mystery “other” link).
    const initSubject = `Complete your donation on Paystack — Ref: ${reference}`;
    const initHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Thank You for Starting Your Donation!</h2>
        <p>Dear ${data.firstName} ${data.lastName},</p>
        <p>Your gift is not finished until you complete <strong>Paystack&apos;s secure checkout</strong> below. Reference: <strong>${reference}</strong></p>
        <p><strong>Amount:</strong> ${settleAmount.toFixed(2)} ${settleCurrency}</p>
        <p style="margin:28px 0;text-align:center;">
          <a href="${checkoutUrl}" style="display:inline-block;padding:14px 26px;background:#041f20;color:#fff;text-decoration:none;border-radius:8px;font-weight:bold;">
            Open Paystack to pay
          </a>
        </p>
        <p style="font-size:13px;color:#444;line-height:1.5;">
          On Paystack you will enter your payment details (card, mobile money, bank, or Apple Pay — depending on what you chose) and approve the charge.
          If you already left the checkout page, use the button above — this is the same Paystack session for this donation.
        </p>
        <p style="font-size:12px;color:#666;word-break:break-all;">If the button doesn&apos;t work, copy this link:<br>${checkoutUrl}</p>
        ${
          data.paymentMethod === 'bank_transfer'
            ? '<p style="margin-top:16px;font-size:14px;color:#444;">We have recorded the bank name, account number, and account holder you entered on our form. Follow Paystack&apos;s screens to authorise payment from your bank.</p>'
            : ''
        }
        <hr>
        <p>Blessings,<br>El-Shaddai Revival Centre</p>
      </div>
    `;
    await sendEmail({
      to: [data.email],
      subject: initSubject,
      html: initHtml,
    });

    const usdConvertedToGhs = donorChosenUsd && settleCurrency === 'GHS';

    return NextResponse.json({
      success: true,
      reference: paystackData.data.reference || reference,
      donationId: donation.id,
      authorization_url: paystackData.data.authorization_url,
      ...(usdConvertedToGhs && {
        paystack_charge_currency: settleCurrency,
        paystack_charge_amount: settleAmount,
        donor_requested_usd_amount: amountNum,
      }),
    });

  } catch (error) {
    console.error('Donations API error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
