# Media Upload Fix TODO — COMPLETED

## Problem
1. Media uploads duplicate on admin dashboard (two DB entries per upload)
2. No feature image support for uploaded media
3. Upload failing with "File uploaded but DB save failed" due to missing `is_featured` column in existing Supabase database

## Changes Made

### 1. Fixed Duplication — `src/app/admin/media/page.tsx`
- Removed the `MediaUpload` component import and usage
- Replaced with a native `<input type="file">` that stores the selected `File` in state
- On submit, sends `File` + metadata in **one single POST request** to `/api/media`
- No more second metadata-only POST = no more duplicates

### 2. Added Feature Image Support

**`src/types/media.ts`** — Added `isFeatured?: boolean` to `Media` interface

**`src/lib/db.ts`** — Added `is_featured?: boolean` to `DbMedia` interface

**`SUPABASE_SCHEMA.sql`** — Added `is_featured BOOLEAN DEFAULT true` to `media` table

**`src/app/api/media/route.tsx`** — 
- All new uploads now set `is_featured: true` by default
- **Fallback**: If `is_featured` column doesn't exist in the database yet, the API catches the error and retries without that column (graceful degradation)
- GET response includes `isFeatured` field
- PUT endpoint supports toggling `isFeatured`

**`src/app/admin/media/page.tsx`** — Added a yellow "Featured" badge with Star icon on media cards

## Database Migration
Run this SQL on your Supabase database to add the column properly:

```sql
ALTER TABLE media ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT true;
```

If you don't run this, uploads will still work — they just won't save the `is_featured` flag (the API handles this gracefully).

## Files Modified
1. `src/types/media.ts`
2. `src/lib/db.ts`
3. `SUPABASE_SCHEMA.sql`
4. `src/app/api/media/route.tsx`
5. `src/app/admin/media/page.tsx`
