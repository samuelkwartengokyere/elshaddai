# Media Upload Fix TODO — COMPLETED

## Problem
1. Media uploads duplicate on admin dashboard (two DB entries per upload)
2. No feature image support for uploaded media
3. Upload failing with "File uploaded but DB save failed" due to missing `is_featured` column
4. Admin uploads not displaying on the public gallery page

## Changes Made

### 1. Fixed Duplication — `src/app/admin/media/page.tsx`
- Removed the `MediaUpload` component import and usage
- Replaced with a native `<input type="file">` that stores the selected `File` in state
- On submit, sends `File` + metadata in **one single POST request** to `/api/media`

### 2. Added Feature Image Support

**`src/types/media.ts`** — Added `isFeatured?: boolean` to `Media` interface

**`src/lib/db.ts`** — Added `is_featured?: boolean` to `DbMedia` interface

**`SUPABASE_SCHEMA.sql`** — Added `is_featured BOOLEAN DEFAULT true` to `media` table

**`src/app/api/media/route.tsx`** — 
- All new uploads set `is_featured: true` by default
- **Graceful fallback**: If `is_featured` column doesn't exist in the database yet, the API catches the error and retries without that column
- GET/PUT responses include `isFeatured`

**`src/app/admin/media/page.tsx`** — Added yellow "Featured" badge with Star icon on media cards

### 3. Fixed "File uploaded but DB save failed"
- API now retries DB insert without `is_featured` if the column is missing
- Console warning tells you to run the migration SQL

### 4. Connected Admin Uploads to Public Gallery — `src/app/gallery/page.tsx`
- Gallery now fetches from `/api/media?type=image,video` (same endpoint as admin)
- **Category alignment**: Gallery dropdown now uses the same categories as admin (`service`, `event`, `ministry`, `other`)
- **Auto-refetch**: Changing the category dropdown automatically re-fetches media
- **Search support**: Gallery search box now works (API filters by title/description)
- **Newest-first**: Gallery now shows most recent uploads first by default
- **Fixed display**: Uses `description` from API response for captions (was broken due to `caption`/`description` mismatch)

## Database Migration
Run this SQL on your Supabase database:

```sql
ALTER TABLE media ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT true;
```

If you don't run this, uploads will still work via the graceful fallback.

## Files Modified
1. `src/types/media.ts`
2. `src/lib/db.ts`
3. `SUPABASE_SCHEMA.sql`
4. `src/app/api/media/route.tsx`
5. `src/app/admin/media/page.tsx`
6. `src/app/gallery/page.tsx`

