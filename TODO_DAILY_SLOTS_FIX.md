# Daily Slots Fix - TODO

## Issues Found:

1. **Database fallback bug in `getByDate`**: Fallback `getById('counselling_slots', date)` looks up by UUID `id` but passes `date` string - will never find anything
2. **Missing client-side validation**: No validation of `max_slots` range before API calls
3. **Poor error/success state management**: Messages persist between operations; fetch errors only logged to console
4. **Missing UX features**: No delete slot, no visual edit indication, no bulk update confirmation
5. **Loading state collision**: `loadingSlots` shared between table loading and action loading

## Steps:

### Step 1: Fix `src/lib/db.ts` - Database Layer

- [x] Fix `getByDate` fallback to query by `date` column instead of UUID `id`
- [x] Add proper date-based query function

### Step 2: Fix `src/app/admin/counselling/page.tsx` - Admin Page

- [ ] Separate `actionLoading` state from `loadingSlots`
- [ ] Add client-side validation for `max_slots` (0-100)
- [ ] Improve error/success message management (clear before new ops)
- [ ] Add `handleDeleteSlot` with confirmation
- [ ] Add visual edit mode indication
- [ ] Add bulk update confirmation dialog
- [ ] Improve `fetchSlots` error handling (show to user)
- [ ] Add scroll-to-form on edit

### Step 3: Fix `src/app/api/counselling-slots/route.ts` - API Route

- [ ] Add DB configuration check
- [ ] Improve error handling consistency

### Step 4: Testing

- [ ] Test slot creation
- [ ] Test slot editing
- [ ] Test bulk update
- [ ] Test delete slot
- [ ] Test error handling
