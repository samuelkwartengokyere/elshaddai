# Bulk Image Upload (ZIP) - TODO

## Task

Enable admin to upload bulk images at a go by uploading a zip file with images on the media page.

## Plan & Progress

### 1. Install Dependencies

- [ ] Install `jszip` for server-side ZIP extraction

### 2. Create Bulk Upload API Route

- [ ] Create `src/app/api/media/bulk-upload/route.tsx`
  - Accept POST with ZIP file, category, description
  - Extract images from ZIP using jszip
  - Validate each image (type, size)
  - Upload each to Supabase Storage (`media` bucket)
  - Save metadata to DB for each
  - Return summary: total, uploaded, failed, results

### 3. Update Admin Media Page

- [ ] Edit `src/app/admin/media/page.tsx`
  - Add "Bulk Upload (ZIP)" button
  - Add bulk upload modal
  - ZIP file input, category selector, optional description
  - Progress indicator during upload
  - Results summary after upload (success/failure per file)
  - Refresh media grid on completion

### 4. Testing & Validation

- [ ] Run `npm run type-check` to verify no TypeScript errors
- [ ] Verify API route works with test ZIP

## Files to Modify

1. `package.json` - add `jszip` dependency
2. `src/app/api/media/bulk-upload/route.tsx` - new file
3. `src/app/admin/media/page.tsx` - edit existing
