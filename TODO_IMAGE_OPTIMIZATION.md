# Image Optimization Implementation TODO

## Steps:

- [x] Step 1: Install `sharp` dependency
- [x] Step 2: Create `src/lib/image-optimization.ts` utility
- [x] Step 3: Update `src/app/api/media/route.tsx` POST handler
- [x] Step 4: Update `src/app/api/teams/upload-image/route.tsx`
- [x] Step 5: Update `src/app/api/admins/profile-image/route.tsx`
- [x] Step 6: Update `src/app/api/media/bulk-upload/route.tsx`
- [x] Step 7: Run `npm install` to install sharp
- [ ] Step 8: Verify build (`npm run build`)

## Plan Summary

- Install sharp for server-side image processing
- Create reusable optimization utility with presets (general 1920px, avatar 800px)
- Convert to WebP with 80% quality
- Update all admin image upload API routes
