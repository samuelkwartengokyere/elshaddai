# Logo Management Implementation - TODO

## Phase 1: Backend Setup ✅

- [x] 1. Create Settings Model (`/src/models/Settings.ts`)
- [x] 2. Create Settings API routes (`/src/app/api/settings/route.tsx`)

## Phase 2: Admin Settings Page ✅

- [x] 3. Create Admin Settings page (`/src/app/admin/settings/page.tsx`)
- [x] 4. Add Settings link to Admin navigation

## Phase 3: Frontend Updates ✅

- [x] 5. Update Header component to use dynamic logo
- [x] 6. Update Admin Layout to show logo in sidebar
- [x] 7. Use default logo image in admin sidebar (instead of icon) for consistent branding

## Implementation Details

- Default logo URL: https://pentecost.ca/
- Settings collection: single document (singleton pattern)

## Files Created

- `/src/models/Settings.ts` - Settings model
- `/src/app/api/settings/route.tsx` - Settings API
- `/src/app/admin/settings/page.tsx` - Admin settings page

## Files Modified

- `/src/components/Header.tsx` - Now fetches logo from settings API
- `/src/app/admin/layout.tsx` - Shows logo in sidebar with settings link
