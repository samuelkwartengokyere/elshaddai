# Daily Slots Admin Fix - Implementation TODO

## Plan Approved - Implementing fixes to src/app/admin/counselling/page.tsx

### Steps:

- [x] 1. Create TODO tracking file
- [x] 2. Add separate `actionLoading` state for Set/Bulk/Delete actions
- [x] 3. Add `editingSlotDate` state for visual edit mode indication
- [x] 4. Add client-side validation function for slot form
- [x] 5. Add `handleDeleteSlot` with confirmation dialog
- [x] 6. Add `handleCancelEdit` to reset form and exit edit mode
- [x] 7. Improve error/success message management (clear before ops, auto-clear success)
- [x] 8. Add bulk update confirmation dialog
- [x] 9. Improve `fetchSlots` error handling (show to user)
- [x] 10. Add scroll-to-form on edit
- [x] 11. Add validation error UI (red borders, inline errors)
- [x] 12. Update TODO as complete

## Summary of Changes in `src/app/admin/counselling/page.tsx`:

1. **Added `useRef` import** for scroll-to-form functionality
2. **Added `actionLoading` state** — separates button loading from table loading so the table doesn't disappear during actions
3. **Added `editingSlotDate` state** — visually indicates when editing an existing slot (blue ring border, "Editing Slot for..." header, "Update" button)
4. **Added `slotFormError` state** + `validateSlotForm()` — validates date format and max_slots range (0-100) before API call
5. **Added `clearMessages()` helper** — resets error/success/form-error before every operation
6. **Added `handleDeleteSlot(date)`** — confirms with user, calls DELETE API, refreshes table, auto-cancels edit if deleting edited slot
7. **Added `handleCancelEdit()`** — resets form and exits edit mode
8. **Added bulk confirmation** — `confirm()` dialog shows "Set X slots for Y day(s) starting from Z?"
9. **Improved `fetchSlots()`** — now calls `setError()` on API or network failure instead of silently failing
10. **Added scroll-to-form** — `slotFormRef` + `scrollIntoView({ behavior: 'smooth' })` when clicking Edit
11. **Added validation UI** — red borders on invalid fields, inline error banner below header
12. **Added selected-date preview** — shows "5 day(s) selected (2024-01-01 to 2024-01-05)" below bulk inputs
