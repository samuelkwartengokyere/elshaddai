# International Payments Implementation TODO

## ✅ Phase 1: Enhanced Paystack Integration - COMPLETED

- [x] 1.1 Update Donation model with new fields for mobile money, bank transfers, and multi-currency
- [x] 1.2 Create enhanced Paystack service with mobile money and bank transfer support
- [x] 1.3 Update donation API to handle different payment channels
- [x] 1.4 Add currency conversion and formatting utilities

## ✅ Phase 2: Stripe Integration (Global Coverage) - COMPLETED

- [x] 2.1 Create Stripe service (`src/lib/stripe.ts`)
- [x] 2.2 Create Stripe checkout API route (`src/app/api/donations/stripe/route.tsx`)
- [x] 2.3 Create Stripe webhook handler (`src/app/api/donations/stripe-webhook/route.tsx`)
- [x] 2.4 Update main donation API for multi-channel support

## ✅ Phase 3: UI/UX Updates - COMPLETED

- [x] 3.1 Create new international donation form (`src/components/InternationalDonationForm.tsx`)
- [x] 3.2 Add currency selector with real-time conversion display
- [x] 3.3 Implement mobile money payment flow
- [x] 3.4 Implement bank transfer instructions
- [x] 3.5 Update give page with international payment options
- [x] 3.6 Add multi-currency donation type definitions

## 🔲 Phase 4: Installation & Testing - TO DO

### Installation Steps

1. **Install Stripe SDK**:

   ```bash
   cd el-shaddai-revival-centre
   npm install stripe @stripe/stripe-js
   ```

2. **Configure Environment Variables**:

   Copy `.env.stripe.example` to `.env.local`:

   ```bash
   cp .env.stripe.example .env.local
   ```

   Add your Stripe keys to `.env.local`:

   ```
   STRIPE_SECRET_KEY=sk_test_your_secret_key
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
   ```

3. **Get Stripe Keys**:

   - Go to https://dashboard.stripe.com/apikeys
   - Copy your test keys for development
   - For production, use live keys

4. **Configure Webhook**:
   - Go to https://dashboard.stripe.com/webhooks
   - Add endpoint: `https://your-domain.com/api/donations/stripe-webhook`
   - Select events: `checkout.session.completed`, `payment_intent.succeeded`, `payment_intent.payment_failed`, `charge.refunded`
   - Copy the webhook signing secret to `STRIPE_WEBHOOK_SECRET`

### Testing Checklist

- [ ] Test card payments in USD
- [ ] Test card payments in GHS
- [ ] Test card payments in other currencies (GBP, EUR)
- [ ] Test mobile money option (Ghana/Nigeria)
- [ ] Test bank transfer recording
- [ ] Test Stripe checkout redirect
- [ ] Test webhook events
- [ ] Verify currency conversion display
- [ ] Verify donation records in database
- [ ] Test email receipts

## 🔲 Phase 5: Optional Enhancements - TO DO

- [ ] Add real-time exchange rates from API (e.g., Open Exchange Rates)
- [ ] Add Apple Pay/Google Pay buttons
- [ ] Add recurring donation management
- [ ] Add donation history dashboard
- [ ] Add tax receipt generation

## Supported Payment Methods

### Paystack (Africa-focused) ✅ Active

- Cards (Visa, Mastercard)
- Mobile Money (M-Pesa, Airtel Money, Tigo Cash, Vodafone Cash, MTN Mobile Money)
- Bank Transfer
- USSD
- QR Code

### Stripe (Global) 🔲 Requires Setup

- Cards (Visa, Mastercard, Amex, etc.)
- Apple Pay
- Google Pay
- Bank Debits (SEPA, ACH)

### Manual Methods ✅ Active

- Wire Transfer (SWIFT/IBAN)
- Direct Bank Deposit
- Cheque/Money Order

## Supported Currencies

- USD ($) - US Dollar
- GHS (₵) - Ghana Cedi
- NGN (₦) - Nigerian Naira
- GBP (£) - British Pound
- EUR (€) - Euro
- CAD (C$) - Canadian Dollar
- AUD (A$) - Australian Dollar
- KES (KSh) - Kenyan Shilling
- ZAR (R) - South African Rand

## Files Modified/Created

### New Files

- `src/lib/stripe.ts` - Stripe service
- `src/lib/currency.ts` - Currency utilities and payment methods
- `src/components/InternationalDonationForm.tsx` - Main donation form
- `src/app/api/donations/stripe/route.tsx` - Stripe API route
- `src/app/api/donations/stripe-webhook/route.tsx` - Stripe webhook handler
- `.env.stripe.example` - Environment template

### Modified Files

- `src/models/Donation.ts` - Enhanced donation model
- `src/types/donation.ts` - Updated type definitions
- `src/app/api/donations/route.tsx` - Multi-channel support
- `src/app/give/page.tsx` - International giving page
