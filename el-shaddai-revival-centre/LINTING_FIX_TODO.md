# Linting Fix Progress

## ✅ FIXED - None yet

## 🔄 IN PROGRESS - None yet

## 📋 DETAILED FIX PLAN

### Error Summary

- **react/no-unescaped-entities**: 29 errors
- **@typescript-eslint/no-explicit-any**: ~10 errors
- **react-hooks/set-state-in-effect**: 2 errors
- **@typescript-eslint/no-unused-vars**: 1 error
- **scripts/create-super-admin.js**: 2 errors (require() imports)

---

## PHASE 1: Fix react/no-unescaped-entities

### 1.1 src/app/about/page.tsx (14 errors)

Lines with errors:

- Line 25: `You've` → `You&apos;ve`
- Line 65: `doesn't` → `doesn&apos;t` (2 occurrences)
- Line 176: `don't` → `don&apos;t`
- Line 191: `Here's` → `Here&apos;s`
- Line 223: `You're` → `You&apos;re`
- Line 236: `There's` → `There&apos;s`
- Line 250: `it's` → `it&apos;s`
- Line 264: `it's` → `it&apos;s`
- Line 286: `You're` → `You&apos;re`
- Line 294: `you're` → `you&apos;re`
- Line 312: `you're` → `you&apos;re` (2 occurrences)
- Line 322: `you're` → `you&apos;re`

### 1.2 src/app/admin/settings/page.tsx (12 errors)

Lines with errors:

- Line 157: `doesn't` → `doesn&apos;t`
- Line 236: `It's` → `It&apos;s`
- Line 286: `You're` → `You&apos;re`
- Line 841: `"` → `"` (2 occurrences)
- Line 842: `"` → `"` (4 occurrences)
- Line 853: `don't` → `don&apos;t`
- Line 894: `"` → `"` (2 occurrences)

### 1.3 src/components/Hero.tsx (1 error)

- Line 447: `Christ's` → `Christ&apos;s`

### 1.4 src/components/InternationalDonationForm.tsx (1 error)

- Line 206: `you're` → `you&apos;re`

---

## PHASE 2: Fix @typescript-eslint/no-explicit-any

### 2.1 src/lib/database.ts

- Replace `Record<string, unknown>` with proper typed interfaces
- Line with `any`: Change `Record<string, unknown>` to proper type or keep as needed

### 2.2 src/middleware.ts

- Line with `any`: Replace with `JWTPayload` interface

### 2.3 src/lib/auth.ts

- Find lines with `any` and replace with proper types

### 2.4 src/lib/youtube.ts

- Find lines with `any` and replace with proper types

### 2.5 src/app/api/settings/route.tsx

- Line 95: `error` is declared but never used (also a no-unused-vars error)

### 2.6 src/app/api/sermons/route.tsx

- Line 212: Replace `any` with proper type

### 2.7 src/app/api/sermons/youtube/route.tsx

- Replace `any` types with proper interfaces

---

## PHASE 3: Fix react-hooks/set-state-in-effect

### 3.1 src/components/ClientLayout.tsx (Line 11)

- Issue: Synchronous setState in useEffect
- Fix: Move setState outside useEffect or use useLayoutEffect

### 3.2 src/components/SplashScreen.tsx (Line 18)

- Issue: Synchronous setState in useEffect
- Fix: Move setState outside useEffect or use useLayoutEffect

---

## PHASE 4: Fix scripts/create-super-admin.js

### 4.1 Convert require() to ES imports

- `require('mongoose')` → `import mongoose from 'mongoose'`
- `require('bcryptjs')` → `import bcrypt from 'bcryptjs'`

---

## PHASE 5: Fix remaining warnings (optional but recommended)

### 5.1 @typescript-eslint/no-unused-vars

- Remove unused `error` variable in src/app/api/settings/route.tsx line 95

---

## Files to Edit (Priority Order)

1. `src/app/admin/settings/page.tsx` - 12 errors
2. `src/app/about/page.tsx` - 14 errors
3. `src/components/Hero.tsx` - 1 error
4. `src/components/InternationalDonationForm.tsx` - 1 error
5. `src/components/ClientLayout.tsx` - 1 error
6. `src/components/SplashScreen.tsx` - 1 error
7. `src/lib/database.ts` - 1 error
8. `src/middleware.ts` - 1 error
9. `src/lib/auth.ts` - multiple errors
10. `src/lib/youtube.ts` - multiple errors
11. `src/app/api/settings/route.tsx` - 1 error
12. `src/app/api/sermons/route.tsx` - 1 error
13. `src/app/api/sermons/youtube/route.tsx` - multiple errors
14. `scripts/create-super-admin.js` - 2 errors
