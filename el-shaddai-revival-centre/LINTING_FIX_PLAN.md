# Linting Fix Plan

## Summary of Linting Errors

Based on the eslint output, there are **147 problems (41 errors, 106 warnings)**:

### Error Types Breakdown:

1. **react/no-unescaped-entities**: 29 errors - Unescaped quotes and apostrophes in JSX
2. **react-hooks/set-state-in-effect**: 2 errors - Synchronous setState in useEffect
3. **@typescript-eslint/no-explicit-any**: 1 error - Explicit any type usage

### Warning Types Breakdown:

1. **@typescript-eslint/no-unused-vars**: ~60 warnings - Unused imports and variables
2. **react-hooks/exhaustive-deps**: ~18 warnings - Missing dependencies in useEffect
3. **@next/next/no-img-element**: ~10 warnings - Using <img> instead of next/image
4. **jsx-a11y/alt-text**: ~6 warnings - Missing alt props on images

---

## Fix Plan by Priority

### PHASE 1: Fix Errors (Must Fix)

#### 1.1 Fix react/no-unescaped-entities (29 errors)

**Files to fix:**

1. `src/app/about/page.tsx` (lines 157, 236, 286)
2. `src/app/about/team/page.tsx` (line 264)
3. `src/app/admin/settings/page.tsx` (lines 841, 842, 853, 894)
4. `src/app/admin/testimonies/page.tsx` (line 447)
5. `src/app/counselling/page.tsx` (line 176)
6. `src/app/financial-report/page.tsx` (line 384)
7. `src/app/give/page.tsx` (lines 65, 66)
8. `src/app/groups/page.tsx` (line 25)
9. `src/app/page.tsx` (line 223)
10. `src/app/plan-your-visit/page.tsx` (lines 65, 191, 250, 322)
11. `src/app/prayer/page.tsx` (lines 113, 114, 380, 384, 386)
12. `src/app/serve/page.tsx` (lines 206, 294)
13. `src/app/testimonies/page.tsx` (lines 136, 137, 312)
14. `src/components/InternationalDonationForm.tsx` (line 799)
15. `src/components/SplashScreen.tsx` (line 212 - also has no-explicit-any)

**Fix approach:** Replace unescaped characters:

- `'` → `&apos;` or `&#39;`
- `"` → `"` or `&#34;`

#### 1.2 Fix react-hooks/set-state-in-effect (2 errors)

**Files to fix:**

1. `src/components/ClientLayout.tsx` (line 11)
2. `src/components/SplashScreen.tsx` (line 18)

**Fix approach:** Move setState outside useEffect or use useLayoutEffect for synchronous operations.

#### 1.3 Fix @typescript-eslint/no-explicit-any (1 error)

**Files to fix:**

1. `src/components/SplashScreen.tsx` (line 212)

**Fix approach:** Replace `any` with proper type (`React.MouseEvent` or similar)

---

### PHASE 2: Fix Critical Warnings

#### 2.1 Fix react-hooks/exhaustive-deps (~18 warnings)

**Files to fix:**

1. `src/app/admin/calendar/page.tsx` (line 106) - Missing 'fetchEvents' dependency
2. `src/app/admin/events/page.tsx` (line 95) - Missing 'fetchEvents' dependency
3. `src/app/admin/layout.tsx` (line 66) - Missing 'fetchUser' dependency
4. `src/app/admin/media/page.tsx` (line 93) - Missing 'fetchMedia' dependency
5. `src/app/admin/page.tsx` (line 64) - Missing 'fetchDashboardData' dependency
6. `src/app/admin/sermons/page.tsx` (line 101) - Missing 'fetchSermons' dependency
7. `src/app/admin/teams/page.tsx` (line 86) - Missing 'fetchTeamMembers' dependency
8. `src/app/admin/testimonies/page.tsx` (line 96) - Missing 'fetchTestimonies' dependency
9. `src/app/events/page.tsx` (line 99) - Missing 'fetchEvents' dependency
10. `src/app/sermons/page.tsx` (lines 108, 113, 126) - Multiple missing dependencies

#### 2.2 Fix @typescript-eslint/no-unused-vars (~60 warnings)

**Files to fix:**

1. `src/app/about/page.tsx` (line 1) - 'Hero' is defined but never used
2. `src/app/about/team/page.tsx` (line 120) - 'selectedDepartment', 'setSelectedDepartment'
3. `src/app/admin/calendar/page.tsx` (lines 10, 41, 76, 97, 179, 204, 229, 247, 281) - Multiple unused vars
4. `src/app/admin/events/page.tsx` (lines 168, 200) - 'err' unused
5. `src/app/admin/login/page.tsx` (line 19) - 'router' unused
6. `src/app/admin/media/page.tsx` - Various unused imports
7. `src/app/admin/page.tsx` (lines 5, 9, 11) - Unused icon imports
8. `src/app/admin/sermons/page.tsx` (line 153) - 'err' unused
9. `src/app/admin/settings/page.tsx` (line 19) - 'Camera' unused
10. `src/app/admin/teams/page.tsx` (lines 159, 191) - 'err' unused
11. `src/app/api/auth/*` - Various unused imports
12. `src/app/api/*` routes - Various unused imports
13. `src/app/calendar/page.tsx` - Unused imports
14. `src/app/prayer/page.tsx` - Unused icon imports
15. `src/app/serve/page.tsx` - Unused icon imports
16. `src/app/testimonies/page.tsx` - Unused imports
17. `src/components/*` - Various unused imports
18. `src/lib/*` - Various unused imports
19. `src/middleware.ts` - Unused imports
20. `src/models/*` - Unused imports
21. `src/types/*` - Unused imports

---

### PHASE 3: Fix Recommended Warnings (Optional but Recommended)

#### 3.1 Fix @next/next/no-img-element (~10 warnings)

**Files to fix:**

1. `src/app/admin/media/page.tsx` (lines 240, 347, 407, 485, 533)
2. `src/app/admin/page.tsx` (lines 434, 460)
3. `src/app/admin/sermons/page.tsx` (line 295)
4. `src/app/admin/sermons/upload/page.tsx` (line 224)
5. `src/app/admin/teams/page.tsx` (line 305)
6. `src/components/CounsellingBooking.tsx` (lines 433, 701)
7. `src/components/SplashScreen.tsx` (line 127)
8. `src/components/SermonUpload.tsx` (line 186)

#### 3.2 Fix jsx-a11y/alt-text (~6 warnings)

**Files to fix:**

1. `src/app/admin/media/page.tsx` (lines 240, 407)
2. `src/app/admin/page.tsx` (lines 434, 460)
3. `src/app/admin/sermons/upload/page.tsx` (line 242)

---

## Execution Order

1. **First**: Fix all errors (react/no-unescaped-entities, set-state-in-effect, no-explicit-any)
2. **Second**: Fix react-hooks/exhaustive-deps warnings (prevents bugs)
3. **Third**: Fix unused-vars warnings (code cleanup)
4. **Fourth**: Fix img and alt-text warnings (performance and accessibility)

---

## Files to Edit (Detailed List)

### Error Fixes:

1. `/src/app/about/page.tsx` - Fix 3 unescaped entities
2. `/src/app/about/team/page.tsx` - Fix 1 unescaped entity
3. `/src/app/admin/settings/page.tsx` - Fix 10 unescaped entities
4. `/src/app/admin/testimonies/page.tsx` - Fix 1 unescaped entity
5. `/src/app/counselling/page.tsx` - Fix 1 unescaped entity
6. `/src/app/financial-report/page.tsx` - Fix 1 unescaped entity
7. `/src/app/give/page.tsx` - Fix 2 unescaped entities
8. `/src/app/groups/page.tsx` - Fix 1 unescaped entity
9. `/src/app/page.tsx` - Fix 1 unescaped entity
10. `/src/app/plan-your-visit/page.tsx` - Fix 5 unescaped entities
11. `/src/app/prayer/page.tsx` - Fix 7 unescaped entities
12. `/src/app/serve/page.tsx` - Fix 2 unescaped entities
13. `/src/app/testimonies/page.tsx` - Fix 4 unescaped entities
14. `/src/components/InternationalDonationForm.tsx` - Fix 1 unescaped entity
15. `/src/components/ClientLayout.tsx` - Fix set-state-in-effect
16. `/src/components/SplashScreen.tsx` - Fix set-state-in-effect and no-explicit-any

### Warning Fixes:

17. `/src/app/admin/calendar/page.tsx` - Fix useEffect deps and unused vars
18. `/src/app/admin/events/page.tsx` - Fix useEffect deps and unused vars
19. `/src/app/admin/layout.tsx` - Fix useEffect deps
20. `/src/app/admin/login/page.tsx` - Fix unused vars
21. `/src/app/admin/media/page.tsx` - Fix useEffect deps, unused vars, img elements, alt text
22. `/src/app/admin/page.tsx` - Fix useEffect deps, unused vars, img elements, alt text
23. `/src/app/admin/sermons/page.tsx` - Fix useEffect deps, unused vars, img elements
24. `/src/app/admin/sermons/upload/page.tsx` - Fix img elements, alt text
25. `/src/app/admin/teams/page.tsx` - Fix useEffect deps, unused vars, img elements
26. `/src/app/admin/testimonies/page.tsx` - Fix useEffect deps, unused vars
27. `/src/app/api/auth/*` routes - Fix unused imports
28. `/src/app/api/*` routes - Fix unused imports
29. `/src/app/calendar/page.tsx` - Fix unused imports
30. `/src/app/events/page.tsx` - Fix useEffect deps
31. `/src/app/prayer/page.tsx` - Fix unused imports
32. `/src/app/sermons/page.tsx` - Fix unused vars, useEffect deps
33. `/src/app/testimonies/page.tsx` - Fix unused imports, useEffect deps
34. `/src/components/CounsellingBooking.tsx` - Fix unused vars, img elements
35. `/src/components/DonationForm.tsx` - Fix unused vars
36. `/src/components/Header.tsx` - Fix unused vars
37. `/src/components/InternationalDonationForm.tsx` - Fix unused vars
38. `/src/components/LiveStream.tsx` - Fix unused vars
39. `/src/components/SermonCard.tsx` - Fix unused imports
40. `/src/components/SermonUpload.tsx` - Fix unused imports, img elements
41. `/src/components/TimeSlotPicker.tsx` - Fix unused vars
42. `/src/lib/auth.ts` - Fix unused vars
43. `/src/lib/database.ts` - Fix unused vars
44. `/src/lib/youtube.ts` - Fix unused vars, anonymous export
45. `/src/middleware.ts` - Fix unused imports
46. `/src/models/Counsellor.ts` - Fix unused vars
47. `/src/types/counselling.ts` - Fix unused imports

---

## Follow-up Steps

1. Run `npm run lint` to verify fixes
2. Fix any remaining issues
3. Run `npm run build` to ensure no build errors
4. Test the application functionality

---

## Estimated Time

- Phase 1 (Errors): 30 minutes
- Phase 2 (Critical Warnings): 45 minutes
- Phase 3 (Recommended Warnings): 30 minutes
- **Total: ~2 hours**
