# Paystack Configuration TODO

## ✅ Completed

- [x] Backend service (`src/lib/paystack.ts`)
- [x] Frontend integration (DonationForm, InternationalDonationForm)
- [x] API endpoints (/api/donations, /api/donations/verify)
- [x] Environment variables template (`.env.local.example`)
- [x] Updated TODO files

## ⏳ User Setup Required

- [ ] Copy `.env.local.example` → `.env.local`
- [ ] Add real Paystack keys:
  ```
  NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_...
  PAYSTACK_SECRET_KEY=sk_test_...
  PAYSTACK_CALLBACK_URL=https://yourdomain.com/api/donations/verify
  ```
- [ ] Restart dev server: `npm run dev`

## 🧪 Testing

- [ ] Visit `/give` page
- [ ] Submit test donation (use Paystack test cards)
- [ ] Verify donation recorded in Supabase
- [ ] Check email receipt sent

## 🚀 Production

- [ ] Switch to live keys (pk*live*_, sk*live*_)
- [ ] Update callback URL to production domain
- [ ] Test live flow
