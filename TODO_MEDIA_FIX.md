# Media Upload Fix TODO

## Problem

1. Media uploads duplicate on admin dashboard (two DB entries per upload)
2. No feature image support for uploaded media

## Plan

- [x] 1. Add `is_featured` to `DbMedia` type in `src/lib/db.ts`
- [x] 2. Add `isFeatured` to `Media` type in `src/types/media.ts`
- [x] 3. Update `SUPABASE_SCHEMA.sql` with `is_featured` column
- [x] 4. Update API `src/app/api/media/route.tsx` to set `is_featured: true` by default and include it in responses
- [x] 5. Fix admin page `src/app/admin/media/page.tsx` to eliminate double POST duplication and show featured badge
- [x] 6. Add `is_featured` support to PUT endpoint

## Database Migration

Run this SQL on your Supabase database to add the column to existing tables:

```sql
ALTER TABLE media ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT true;
```

## Changes Summary

### Files Modified

1. `src/types/media.ts` - Added `isFeatured?: boolean` to `Media` interface
2. `src/lib/db.ts` - Added `is_featured?: boolean` to `DbMedia` interface
3. `SUPABASE_SCHEMA.sql` - Added `is_featured BOOLEAN DEFAULT true` to media table
4. `src/app/api/media/route.tsx` - Set `is_featured: true` on create, include `isFeatured` in GET/PUT responses, support toggling via PUT
5. `src/app/admin/media/page.tsx` - Replaced `MediaUpload` component with native file input to eliminate double POST; added featured badge display

### Root Cause of Duplication

The `MediaUpload` component internally called `/api/media` POST (creating DB record #1), then the admin page `handleSubmit` called `/api/media` POST again with the returned URL in metadata-only mode (creating DB record #2). Fixed by using a single file upload flow where the admin page sends the file + metadata in one request.
