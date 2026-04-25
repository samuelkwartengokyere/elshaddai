# Team Member Image Upload Fix

## Problem

The teams page on the admin panel shows a success message when creating a team member and uploading an image, but the image doesn't show afterwards.

## Root Cause

Field name mismatches between frontend and backend:

1. Upload route returns `url`, frontend expects `imageUrl`
2. Frontend sends `body.image`, POST/PUT routes expect `body.imageUrl`
3. GET route returns `imageUrl`, frontend/public pages expect `image`

## Steps

- [x] Fix `src/app/api/teams/upload-image/route.tsx` — return `imageUrl` instead of `url`
- [x] Fix `src/app/api/teams/route.ts` GET — return `image` instead of `imageUrl`
- [x] Fix `src/app/api/teams/route.ts` POST — accept `body.image` (fallback to `body.imageUrl`)
- [x] Fix `src/app/api/teams/route.ts` PUT — accept `body.image` (fallback to `body.imageUrl`)
- [x] Fix `src/app/api/teams/route.ts` POST/PUT response — return `image` instead of `imageUrl`
- [x] Fix `src/app/api/teams/[id]/route.tsx` PUT — accept `body.image`, return `image`

## Status: Complete
