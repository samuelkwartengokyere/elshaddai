# Project Fixes & Supabase Migration Plan

## Objective

Fix all broken/not-working features AND replace MongoDB with Supabase

## Tasks

### Phase 1: Supabase Database Migration (HIGH PRIORITY)

- [ ] 1. Set up Supabase project and get credentials
- [ ] 2. Create Supabase client configuration
- [ ] 3. Create database schema for all collections:
  - [ ] Admins
  - [ ] Calendar Events
  - [ ] Counselling Bookings
  - [ ] Counsellors
  - [ ] Donations
  - [ ] Events
  - [ ] Media
  - [ ] Sermons
  - [ ] Settings
  - [ ] Team Members
  - [ ] Testimonies
- [ ] 4. Update all API routes to use Supabase instead of MongoDB
- [ ] 5. Remove mongoose/database.ts dependencies

### Phase 2: Remove Stripe (HIGH PRIORITY)

- [ ] 1. Delete stripe.ts library file
- [ ] 2. Delete stripe API routes
- [ ] 3. Delete stripe webhook route
- [ ] 4. Remove stripe from package.json
- [ ] 5. Remove Stripe from InternationalDonationForm.tsx
- [ ] 6. Remove Stripe from Donation.ts model

### Phase 3: Complete YouTube Auto-Fetch (HIGH PRIORITY)

- [ ] 1. Modify YouTube API route to auto-sync on startup
- [ ] 2. Implement background periodic sync
- [ ] 3. Test auto-sync functionality

### Phase 4: Test Payment Integrations (MEDIUM PRIORITY)

- [ ] 1. Configure Paystack public key
- [ ] 2. Test Paystack payment flow
- [ ] 3. Test International Donation form
- [ ] 4. Verify donations recorded correctly

### Phase 5: Test Admin Login Flow (MEDIUM PRIORITY)

- [ ] 1. Test login flow
- [ ] 2. Test token refresh
- [ ] 3. Verify error messages
- [ ] 4. Verify route protection works

### Phase 6: Verify Partially Complete Features (MEDIUM PRIORITY)

- [ ] 1. Test YouTube video modal
- [ ] 2. Test admin sermons pagination
- [ ] 3. Test event image upload
- [ ] 4. Test calendar functionality
- [ ] 5. Test media gallery
- [ ] 6. Test events tabs

## Files to Edit

### Delete (Stripe)

- `src/lib/stripe.ts`
- `src/app/api/donations/stripe/route.tsx`
- `src/app/api/donations/stripe-webhook/route.tsx`
- `.env.stripe.example`

### Create/Edit (Supabase)

- `src/lib/supabase.ts` (new)
- All API routes in `src/app/api/*`

### Edit (Stripe Removal)

- `package.json`
- `src/components/InternationalDonationForm.tsx`
- `src/models/Donation.ts`
- `src/app/api/donations/route.tsx`

### Edit (YouTube Auto-Fetch)

- `src/app/api/sermons/youtube/route.tsx`
- `src/app/api/sermons/route.tsx`
