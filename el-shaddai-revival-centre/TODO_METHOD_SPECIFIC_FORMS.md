# TODO: Method-Specific Form Sections for InternationalDonationForm

## Objective

Modify InternationalDonationForm.tsx to show different form sections based on the selected payment method.

## Tasks

- [x] 1. Update FormData interface to include new method-specific fields
- [x] 2. Update FormErrors interface for new validation
- [x] 3. Add state for showing method-specific sections
- [x] 4. Create method-specific form components:
     - [x] Mobile Money provider selection
     - [x] Phone number for USSD/QR/Mobile Money
     - [x] ACH Direct Debit fields (routing, account, type)
     - [x] SEPA Direct Debit fields (IBAN, BIC, holder name)
     - [x] Bank Transfer fields (holder name, bank name)
- [x] 5. Add validation for method-specific fields
- [x] 6. Update handlePayment to include new fields in API calls
- [ ] 7. Update API to handle new donation fields

## Method-Specific Fields

| Method        | Additional Fields                            |
| ------------- | -------------------------------------------- |
| Card          | None (handled by Stripe)                     |
| Mobile Money  | Provider (M-Pesa, Airtel, etc.), Phone       |
| USSD          | Phone                                        |
| QR Code       | Phone                                        |
| Bank Transfer | Account Holder Name, Bank Name               |
| ACH           | Routing Number, Account Number, Account Type |
| SEPA          | IBAN, BIC, Account Holder Name               |
| Apple Pay     | None                                         |
| Google Pay    | None                                         |

## Progress

- [x] Task 1: Updated FormData interface
- [x] Task 2: Updated FormErrors interface
- [x] Task 3: Added method-specific section state
- [x] Task 4: Created form components
- [x] Task 5: Added validation
- [x] Task 6: Updated handlePayment API calls
- [ ] Task 7: Update API routes to save new fields (optional enhancement)
