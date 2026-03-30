# COUNSELLING DAILY SLOTS IMPLEMENTATION

## Status: [IN PROGRESS]

Approved Plan:

- Global slots (not per-counsellor)
- Default max_slots: 10 per day
- Supabase table: counselling_slots

### Breakdown Steps:

1. **[✅]** SUPABASE_MIGRATION-COUNSELLING-SLOTS.sql created & run
2. **[✅]** src/types/counselling.ts - Added CounsellingSlot types
3. **[✅]** src/lib/database.ts - Added counsellingSlotsDb CRUD operations
4. **[✅]** Created src/app/api/counselling-slots/route.ts - Admin CRUD (GET/POST/PUT)
5. **[IN PROGRESS]** src/app/admin/counselling/page.tsx - Adding Slots tab
6. **[PENDING]** src/app/api/counselling/route.tsx - Replace fake slots with real DB logic (check/decrement)
7. **[PENDING]** Update CounsellingBooking.tsx - Show slots remaining (optional)
8. **[PENDING]** Test end-to-end + migrate Supabase
9. **[PENDING]** Update TODOs as COMPLETE

**Next Step:** 1. Database migration SQL
