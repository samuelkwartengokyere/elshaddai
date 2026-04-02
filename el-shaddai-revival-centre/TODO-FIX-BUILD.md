# TypeScript Build Error Fix Plan & Progress

## Current Status: [In Progress]

## Steps:

### 1. Create Missing Type Files [ ]

- [ ] src/types/CalendarEvent.ts
- [ ] src/types/Event.ts (with IEvent)
- [ ] src/types/Sermon.ts
- [ ] src/types/TeamMember.ts
- [ ] src/types/Testimony.ts

### 2. Fix Existing Types [ ]

- [ ] src/types/counselling.ts - Add isActive?: boolean to Counsellor

### 3. Fix Header Components [ ]

- [ ] src/components/Header-fixed.tsx - Add missing loading/setLoading useState

### 4. Fix Supabase Admin Usage [ ]

- [ ] src/app/api/admin/financial-report/route.ts - Remove invalid import
- [ ] src/app/api/counsellors/route.ts - Replace all supabaseAdmin destructuring with getSupabaseAdmin()
- [ ] Other API files (teams, testimonies, etc.)

### 5. Fix Event Typing [ ]

- [ ] src/app/api/events/calendar/route.tsx - Type event params, fix import

### 6. Fix Teams Type Mismatch [ ]

- [ ] src/app/api/teams/route.ts - Fix bio nullability

### 7. Verify [ ]

- [ ] Run `npx tsc --noEmit`
- [ ] Run `npm run build`

## Notes

- Use getSupabaseAdmin() async for admin clients
- Update imports from models/_ to types/_
