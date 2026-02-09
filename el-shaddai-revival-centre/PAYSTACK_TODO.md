# Paystack Integration TODO

## Phase 1: Setup

- [x] 1. Install Paystack SDK (`npm install @paystack/inline-js`) - DONE
- [x] 2. Add Paystack environment variables to `.env.local.example` - DONE

## Phase 2: Backend

- [x] 3. Create Paystack service (`src/lib/paystack.ts`) - DONE
- [x] 4. Update Donation model with Paystack fields (`src/models/Donation.ts`) - DONE
- [x] 5. Update API route for Paystack integration (`src/app/api/donations/route.tsx`) - DONE
- [x] 6. Create verify endpoint (`src/app/api/donations/verify/route.tsx`) - DONE

## Phase 3: Frontend

- [x] 7. Update DonationForm with Paystack inline (`src/components/DonationForm.tsx`) - DONE
- [ ] 8. Add NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY to environment - PENDING USER ACTION

## Phase 4: Testing

- [ ] 9. Test the Paystack payment flow
- [ ] 10. Verify donations are recorded correctly

## Setup Instructions

1. Copy `.env.local.example` to `.env.local`
2. Add your Paystack public key:
   ```
   NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_your_public_key_here
   ```
3. Restart the development server
