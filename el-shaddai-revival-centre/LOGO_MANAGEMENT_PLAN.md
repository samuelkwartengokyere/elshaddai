# Logo Management Implementation Plan

## Objective

Allow admins to upload/change the church logo from the admin panel and use it on the Header.

## Information Gathered

1. **Current State:**

   - Header.tsx uses a hardcoded Google Images URL for logo
   - Admin layout has a placeholder Church icon
   - Media library exists but no Settings model
   - Database uses MongoDB with mongoose

2. **Existing Components:**
   - `/api/media/route.tsx` - handles media uploads
   - `/models/Media.ts` - media model
   - Admin layout with sidebar navigation

## Plan

### Step 1: Create Settings Model

- Create `/src/models/Settings.ts`
- Store church logo URL and other church info
- Use singleton pattern (only one settings document)

### Step 2: Create Settings API Routes

- Create `/src/app/api/settings/route.tsx`
- GET: Retrieve current settings (with fallback)
- POST: Update settings (logo upload)

### Step 3: Create Admin Settings Page

- Create `/src/app/admin/settings/page.tsx`
- Logo upload form
- Church name and description fields
- Preview of current logo

### Step 4: Update Header Component

- Modify `/src/components/Header.tsx`
- Fetch logo from settings API
- Use dynamic logo instead of hardcoded URL

### Step 5: Update Admin Layout

- Modify `/src/app/admin/layout.tsx`
- Display church logo in sidebar
- Fetch from settings API

## Files to Create

1. `/src/models/Settings.ts` - Settings model
2. `/src/app/api/settings/route.tsx` - Settings API
3. `/src/app/admin/settings/page.tsx` - Admin settings page

## Files to Modify

1. `/src/components/Header.tsx` - Use dynamic logo
2. `/src/app/admin/layout.tsx` - Show logo in sidebar
3. `/src/app/admin/page.tsx` - Add settings link

## Follow-up Steps

1. Test logo upload functionality
2. Verify logo displays correctly on Header
3. Ensure fallback logo works when no settings exist
