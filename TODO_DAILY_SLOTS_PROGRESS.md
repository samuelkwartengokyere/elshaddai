# Daily Slots Fix - Progress

## Step 1: Fix `src/lib/db.ts` - Database Layer

- [x] Fix `getByDate` fallback to handle duplicate rows
- [x] Add `max_slots` validation in `setMaxSlots`

## Step 2: Fix `src/app/admin/counselling/page.tsx` - Admin Page

- [ ] Add timezone-safe helpers
- [ ] Replace UTC date usage with local date helpers
- [ ] Add edit mode clearing on date change
- [ ] Reset bulk form after success
- [ ] Add AbortController to fetchSlots

## Step 3: Fix `src/app/api/counselling-slots/route.ts` - API Route

- [ ] Add `max_slots` NaN/finite validation in POST/PUT
- [ ] Add `days` range validation in GET

## Step 4: Testing

- [ ] Test slot creation
- [ ] Test slot editing
- [ ] Test bulk update
- [ ] Test delete slot
- [ ] Test error handling
