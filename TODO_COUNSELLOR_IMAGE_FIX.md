# Counsellor Image Face Display Fix

## Objective

Ensure counsellor faces display properly on both admin page and main website by adjusting `object-position` on all counsellor images.

## Files to Edit

- [x] `src/components/CounsellorCard.tsx` - Main website card image
- [x] `src/app/admin/counselling/page.tsx` - Admin card grid image
- [x] `src/components/CounsellingBooking.tsx` - Booking flow images (3 places)
- [x] `src/components/CounsellingBooking-fixed.tsx` - Booking flow images (2 places)
- [x] `src/components/CounsellingBooking-fixed2.tsx` - Booking flow images (2 places)

## Changes

- Rectangular card images: `object-cover` → `object-cover object-[center_20%]`
- Circular avatar images: `object-cover` → `object-cover object-top`
