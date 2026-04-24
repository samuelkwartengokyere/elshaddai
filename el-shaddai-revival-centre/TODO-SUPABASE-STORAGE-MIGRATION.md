# Supabase Storage Migration for Admin Media Uploads

## Current Status: [In Progress - Code Complete, Needs Bucket Config]

## Goal

Migrate all admin media uploads (images, videos, audio, docs) from local `public/uploads/` to Supabase Storage buckets with CDN.

## Steps:

### 1. [x] Create Supabase Storage Buckets (via script)

Run: `node scripts/make-buckets-public.js`

This creates and configures:
- `media` bucket (public)
- `avatars` bucket (public)

### 2. [x] Implement src/lib/storage.ts [x]

- uploadToBucket(file, bucket, path): Promise<string> (returns publicUrl)
- deleteFromBucket(bucket, path): Promise<void>
- getPublicUrl(bucket, path): string
- isBucketPublic(bucket): Promise<boolean>
- checkBucketStatus(): Promise<void>
- SUPPORTED_MIME_TYPES / MAX_FILE_SIZES / BUCKETS constants

### 3. [x] Migrate /api/media/route.ts [x]

**POST:** Uses uploadToBucket, validation, publicUrl in DB. Warns if bucket not public.
**DELETE:** Parses url to path, deleteFromBucket + DB delete
**GET:** Returns media with Supabase public URLs

### 4. [x] Update ImageUpload.tsx → MediaUpload [x]

- Renamed to MediaUpload, props: type/category/title
- Dynamic accept/video preview/maxsize
- Used in admin media (type='image'|video|etc)

### 5. [x] Migrate Other Endpoints [x]

- [x] /api/admins/profile-image/ → 'avatars' bucket
- [x] /api/teams/upload-image/ → 'avatars' bucket

### 6. [x] Diagnostics API [x]

**GET /api/diagnostics/storage** - Returns bucket status, test URLs, fix instructions

### 7. [ ] Make Buckets Public (REQUIRED FOR IMAGES TO DISPLAY)

```bash
# Option 1: Run the automated script
node scripts/make-buckets-public.js

# Option 2: Manual via Supabase Dashboard
# 1. Go to https://supabase.com/dashboard > Your Project > Storage
# 2. Click "media" bucket → Toggle "Public bucket" ON
# 3. Click "avatars" bucket → Toggle "Public bucket" ON
```

### 8. [ ] Test Uploads [ ]

```bash
npm run dev
# → /admin/media → upload image
# → Check browser console for: [Storage] Uploaded to media/...
# → /gallery → verify image displays
# → If broken: open browser devtools > Network tab > check for 403 errors
```

### 9. [ ] Migrate Existing Local Files (if any) [ ]

```bash
# Check if any local files exist:
ls -la public/uploads/media/
# If files exist, run migration script (to be created)
```

## 🔧 FIX FOR "IMAGES NOT DISPLAYING ON GALLERY"

**Root Cause:** Supabase Storage buckets are private by default. The gallery loads images directly via `<img src="...">` from Supabase URLs. If the bucket is private, the browser gets a 403 Forbidden error.

**Solution:** Make the `media` bucket public (see Step 7 above).

**Verify:**
```bash
curl http://localhost:3000/api/diagnostics/storage
```

**Or check browser console when uploading:**
```
⚠️ [Media API] Bucket "media" is NOT PUBLIC. Images will not display on the website.
```

## Files Modified

- `src/lib/storage.ts` - Supabase Storage utilities
- `src/app/api/media/route.tsx` - Upload/delete with Storage
- `src/app/gallery/page.tsx` - Better error logging
- `src/app/api/diagnostics/storage/route.ts` - Diagnostic endpoint
- `scripts/make-buckets-public.js` - Automated bucket configuration
- `scripts/test-supabase-storage.js` - Storage test script

## Next Steps After Bucket Config

1. Restart Next.js: `npm run dev`
2. Upload test image in `/admin/media`
3. Visit `/gallery` to verify
4. Check browser Network tab - images should load with 200 status


