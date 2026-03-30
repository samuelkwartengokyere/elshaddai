# ESLint Fixes Progress - El-Shaddai Revival Centre

## Plan Status

- [x] Plan approved by user
- [x] Create TODO.md ✅ **DONE**

## Priority 1: Parsing/Syntax Errors (0/2)

- [ ] Fix \`/src/app/admin/financial-report/page.tsx\` parsing
- [ ] Fix \`/src/app/api/admin/financial-report/audit/route.ts\` parsing

## Priority 2: Team Pages (2/2)

- [x] \`/src/app/about/team/[department]/page.tsx\` (unused imports/vars, useEffect) ✅
- [x] \`/src/app/about/team/page.tsx\` (unused error state) ✅

## Priority 3: Admin Pages - Hooks/Images (3/6)

- [x] \`/src/app/admin/media/page.tsx\` (useEffect, err vars) ✅
- [x] \`/src/app/admin/events/page.tsx\` (img → Image) ✅
- [x] \`/src/app/admin/sermons/page.tsx\` (img → Image) ✅
- [ ] \`/src/app/admin/teams/page.tsx\` (unused vars, img)
- [ ] \`/src/app/admin/testimonies/page.tsx\` (img → Image)
- [ ] \`/src/app/admin/calendar/page.tsx\` (unused err)

## Priority 4: Components & Other Pages (0/10)

- [ ] CounsellingBooking\*.tsx (unused vars, img → Image)
- [ ] Header\*.tsx (parsing/unused)
- [ ] HomeContent.tsx (any/no-explicit-any, unescaped)
- [ ] Financial-report public page (unescaped ')
- [ ] Others (prayer, serve, testimonies pages)

## Priority 5: API/Lib Files (0/15)

- [ ] Remove unused imports/vars in API routes
- [ ] Fix lib/youtube.ts anonymous export

## Follow-up

- [ ] Run \`npx eslint . --fix\`
- [ ] Manual test key pages (admin, team, financial)
- [ ] Full lint pass: \`npx eslint src/ --max-warnings 0\`
- [ ] **COMPLETED** ✅

**Progress: 1/45 files | Next: Parsing errors**
