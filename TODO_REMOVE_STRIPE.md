# Stripe Removal Plan

## Objective

Remove Stripe from the system and keep Paystack for Ghana and global transactions.

## Files to Modify

### 1. Delete Files

- [ ] `src/lib/stripe.ts` - Stripe library
- [ ] `src/app/api/donations/stripe-webhook/route.tsx` - Stripe webhook handler
- [ ] `src/app/api/donations/stripe/route.tsx` - Stripe API routes
- [ ] `.env.stripe.example` - Stripe environment template

### 2. Modify `src/components/InternationalDonationForm.tsx`

- [ ] Remove Stripe payment channel logic
- [ ] Remove payment methods: `apple_pay`, `google_pay`, `sepa_debit`, `ach_debit`
- [ ] Keep only: `card`, `mobile_money`, `bank_transfer`, `ussd`, `qr_code`
- [ ] Update `getPaymentChannelFromMethod` to use `paystack` for card
- [ ] Remove Stripe-specific redirect logic
- [ ] Update payment channel references from `stripe` to `paystack`

### 3. Modify `src/models/Donation.ts`

- [ ] Remove `stripe` from paymentChannel enum
- [ ] Remove Stripe-specific fields: `stripePaymentIntentId`, `stripeCustomerId`, `stripePaymentMethodId`

### 4. Modify `src/app/api/donations/route.tsx`

- [ ] Remove Stripe import
- [ ] Remove `initializeStripePayment` function
- [ ] Remove `stripe` case from switch statement
- [ ] Update `validChannels` to remove `stripe`
- [ ] Keep only Paystack integration

### 5. Modify `package.json`

- [ ] Remove `stripe` dependency
- [ ] Remove `@stripe/stripe-js` dependency

### 6. Update Environment Variables

- [ ] Remove Stripe keys from `.env.local`
- [ ] Keep Paystack keys only

## Updated Payment Methods

After removal, supported payment methods will be:

- **Card** (via Paystack) - Visa, Mastercard, etc.
- **Mobile Money** (via Paystack) - M-Pesa, MTN, etc.
- **Bank Transfer** (Manual)
- **USSD** (via Paystack)
- **QR Code** (via Paystack)

## Currencies Supported

Paystack supports:

- GHS (Ghana Cedis)
- NGN (Naira)
- USD (US Dollars)
- EUR (Euros)
- GBP (British Pounds)
