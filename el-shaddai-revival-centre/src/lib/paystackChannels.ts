import type { PaymentMethodType } from '@/types/donation';

/**
 * Paystack `transaction/initialize` `channels` values (see Paystack Transaction API).
 * Restricts hosted checkout so donors land on the instrument they chose on the Give page.
 */
export function paystackChannelsForGiveMethod(
  paymentMethod: string | undefined
): string[] | undefined {
  if (
    ['1', 'true', 'yes'].includes(process.env.PAYSTACK_DISABLE_METHOD_CHANNELS?.trim().toLowerCase() || '')
  ) {
    return undefined;
  }

  const m = (paymentMethod || 'card').toLowerCase() as PaymentMethodType;

  switch (m) {
    case 'card':
      return ['card'];
    case 'mobile_money':
      return ['mobile_money'];
    case 'apple_pay':
      return ['apple_pay'];
    case 'bank_transfer':
      // Pay with Bank (`bank`) vs Pay with Transfer (`bank_transfer`) — include both so the right flow appears when enabled.
      return ['bank', 'bank_transfer'];
    default:
      return ['card'];
  }
}

/** When Paystack rejects a narrowed `channels` list, retry without `channels` (all enabled instruments). */
export function shouldRetryPaystackInitializeWithoutChannels(
  paystackMessage: string | undefined,
  hadChannels: boolean
): boolean {
  if (!hadChannels) return false;
  const msg = (paystackMessage || '').toLowerCase();
  return (
    /no\s+active\s+channel/.test(msg) ||
    /channel.*(not\s+enabled|inactive|unavailable|invalid|unsupported)/.test(msg) ||
    /(not\s+enabled|inactive|unavailable).*(channel|payment)/.test(msg)
  );
}
