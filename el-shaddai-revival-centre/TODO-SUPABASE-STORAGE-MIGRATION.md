# Supabase Storage Migration for Admin Media Uploads

## Current Status: [Not Started]

## Goal

Migrate all admin media uploads (images, videos, audio, docs) from local `public/uploads/` to Supabase Storage buckets with CDN.

## Steps:

### 1. [ ] Create Supabase Storage Buckets

```
# In Supabase Dashboard > Storage
- Create 'media' bucket (public)
- Create 'avatars' bucket (public)
```

Or via SQL:

```sql
-- Enable public bucket access
```

### 2. [x] Implement src/lib/storage.ts [x]

- uploadFile(file: File, path: string): Promise<{url: string}>
- deleteFile(path: string): Promise<void>
- getPublicUrl(path: string): string

### 3. [x] Migrate /api/media/route.ts [x]

**POST:** Uses uploadToBucket, validation, publicUrl in DB
**DELETE:** Parses url to path, deleteFromBucket + DB delete

### 4. [x] Update ImageUpload.tsx → MediaUpload [x]

 - Renamed to MediaUpload, props: type/category/title
 - Dynamic accept/video preview/maxsize
 - Used in admin media (type='image'|video|etc)

### 5. [ ] Migrate Other Endpoints [ ]

 - [x] /api/admins/profile-image/ → 'avatars' bucket (Supabase Storage, validation)
 - [x] /api/teams/upload-image/ → 'avatars' bucket (teams/ folder)

### 6. [ ] Test Uploads [ ]

```
npm run dev
→ /admin/media → upload image/video → verify in Supabase Storage + DB url + frontend display
```

### 7. [ ] Migrate Existing Local Files (if any) [ ]

```
# Script to upload public/uploads/* to Supabase + update DB urls
```

### 8. [ ] Update TODOs [ ]

- TODO_MEDIA_GALLERY.md
- TODO_EVENT_IMAGE_UPLOAD.md etc.

### 9. [ ] Deploy & Verify [ ]

**Benefits:** CDN, auto-scaling, persistence across deploys, global access.

**Start:** Step 1 complete → check-off → proceed.
