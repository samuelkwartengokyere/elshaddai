# ESLint Fix Plan - Get to max-warnings=0

## Files with ERRORS (must fix):

### 1. src/app/admin/settings/page.tsx

- Line 575: Fix `Unexpected any` - need proper typing

### 2. src/app/admin/testimonies/page.tsx

- Line 565: Fix `react/no-unescaped-entities` - escape apostrophe

### 3. src/app/api/counsellors/route.tsx

- Line 85: Change `let` to `const` for `inMemoryCounsellors`

### 4. src/app/api/sermons/route.tsx

- Line 65: Change `let` to `const` for `sermons`

### 5. src/app/api/sermons/youtube/route.tsx

- Line 149: Change `let` to `const` for `effectiveChannelId`
- Line 323: Change `let` to `const` for `effectiveChannelId`
- Line 18: Remove unused `isInitialized`
- Line 90: Remove unused `settingsError`
- Line 302: Remove unused `settingsError`

## Files with WARNINGS (many to fix):

### Admin Pages:

- calendar/page.tsx: lines 94, 177, 248, 282
- counselling/page.tsx: lines 216, 248, 413
- events/page.tsx: lines 13, 70, 181, 216, 352, 611
- media/page.tsx: lines 62, 249, 356, 416, 496, 544
- page.tsx (admin): lines 457, 483
- sermons/page.tsx: lines 70, 155, 304
- sermons/upload/page.tsx: lines 224, 242
- settings/page.tsx: lines 103, 104, 110, 113, 122, 271
- teams/page.tsx: lines 56, 161, 193, 314
- testimonies/page.tsx: lines 73, 241, 308, 565, 664

### API Routes:

- api/auth/login/route.tsx: line 9
- api/auth/logout/route.tsx: line 1
- api/calendar/seed/route.tsx: line 227
- api/counselling/route.tsx: lines 2, 6
- api/donations/verify/route.tsx: line 2
- api/events/calendar/route.tsx: line 3
- api/live/route.tsx: line 321
- api/sermons/youtube/route.tsx: lines 18, 90, 302

## Fix Strategy:

1. First fix all ERRORS (blocking issues)
2. Then fix WARNINGS systematically
3. Use appropriate fixes:
   - Remove unused variables
   - Change `let` to `const` where appropriate
   - Use proper TypeScript types instead of `any`
   - Escape special characters in JSX
   - Add alt props to images
   - Replace `<img>` with Next.js `<Image>` component
   - Remove unused imports

## Execution:

- Edit files one by one to fix issues
- Run eslint after each batch to verify
