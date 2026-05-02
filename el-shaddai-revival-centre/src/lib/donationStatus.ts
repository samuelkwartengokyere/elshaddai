/**
 * Donation payment lifecycle in DB: pending → success | failed (and cancelled for user abandon).
 * Legacy rows may still use `completed`; treat it like `success` for reporting.
 */

export type DonationPaymentStatus = 'pending' | 'success' | 'failed' | 'cancelled' | 'completed';

export function isPaidDonationStatus(status: string | null | undefined): boolean {
  if (!status) return false;
  const s = status.toLowerCase();
  return s === 'success' || s === 'completed';
}

export function isTerminalDonationStatus(status: string | null | undefined): boolean {
  if (!status) return false;
  return !['pending'].includes(status.toLowerCase());
}

/** Paystack transaction `data.status` after verify (lowercased). */
export function mapPaystackTransactionStatus(
  paystackDataStatus: string | undefined | null
): 'success' | 'failed' | 'pending' {
  const u = (paystackDataStatus || '').toLowerCase();
  if (!u) return 'pending';
  if (u === 'success') return 'success';
  if (u === 'failed' || u === 'abandoned' || u === 'reversed') return 'failed';
  if (u === 'ongoing' || u === 'pending' || u === 'processing' || u === 'open') return 'pending';
  return 'pending';
}

/** `?status=` on return URL from Paystack hosted checkout. */
export function mapUrlReturnStatusToDonation(
  urlStatus: string | null | undefined
): 'failed' | 'cancelled' | null {
  if (!urlStatus) return null;
  const u = urlStatus.toLowerCase();
  if (u === 'failed') return 'failed';
  if (u === 'abandoned' || u === 'cancelled') return 'cancelled';
  return null;
}
