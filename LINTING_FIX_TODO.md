# Linting Fix Plan

## Phase 1: Critical Errors (set-state-in-effect, no-explicit-any)

### 1.1 Fix ClientLayout.tsx (line 11)

- [ ] Fix set-state-in-effect error in useEffect

### 1.2 Fix SplashScreen.tsx (lines 18, 212)

- [ ] Fix set-state-in-effect error in useEffect
- [ ] Fix no-explicit-any for positions type

### 1.3 Fix prefer-const errors

- [ ] Fix in admin settings/page.tsx (lines 85, 149, 323)
- [ ] Fix in admin counselling/page.tsx (lines 65)

## Phase 2: react/no-unescaped-entities Errors

### 2.1 Fix src/app/about/page.tsx

- [ ] Line 286: Fix unescaped entity

### 2.2 Fix src/app/about/team/page.tsx

- [ ] Line 264: Fix unescaped entity

### 2.3 Fix src/app/admin/settings/page.tsx

- [ ] Lines 841, 842, 853, 894: Fix unescaped entities

### 2.4 Fix src/app/admin/testimonies/page.tsx

- [ ] Line 447: Fix unescaped entity

### 2.5 Fix src/app/counselling/page.tsx

- [ ] Line 176: Fix unescaped entity

### 2.6 Fix src/app/financial-report/page.tsx

- [ ] Line 384: Fix unescaped entity

### 2.7 Fix src/app/give/page.tsx

- [ ] Lines 65, 66: Fix unescaped entities

### 2.8 Fix src/app/groups/page.tsx

- [ ] Line 25: Fix unescaped entity

### 2.9 Fix src/app/page.tsx

- [ ] Line 223: Fix unescaped entity

### 2.10 Fix src/app/plan-your-visit/page.tsx

- [ ] Lines 65, 191, 250, 322: Fix unescaped entities

### 2.11 Fix src/app/prayer/page.tsx

- [ ] Lines 113, 114, 380, 384, 386: Fix unescaped entities

### 2.12 Fix src/app/serve/page.tsx

- [ ] Lines 206, 294: Fix unescaped entities

### 2.13 Fix src/app/testimonies/page.tsx

- [ ] Lines 136, 137, 312: Fix unescaped entities

### 2.14 Fix src/components/InternationalDonationForm.tsx

- [ ] Line 799: Fix unescaped entity

## Phase 3: Warnings (After Errors are Fixed)

- Will address warnings after fixing all errors
