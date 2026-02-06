# Fix Build Error for /api/sermons/upload

## Status: ✅ COMPLETED

## Issues Found:

1. Database connection fails during build when MONGODB_URI is not defined
2. Server-side dependencies cause issues during static analysis
3. Type mismatch between upload route and Sermon model
4. Footer.tsx missing 'use client' directive for Framer Motion

## Fixes Implemented:

- [x] Fix 1: Update database.ts to handle missing MONGODB_URI gracefully
- [x] Fix 2: Update upload route to handle missing database connection
- [x] Fix 3: Add videoUrl handling to match Sermon model (not needed - model is correct)
- [x] Fix 4: Add 'use client' directive to Footer.tsx for Framer Motion

## Summary:

All API routes now gracefully handle missing database connections during build time. The build completes successfully with:

- 13 static pages generated
- 4 dynamic API routes (donations, media, sermons, sermons/upload)
- No build errors

## Changes Made:

1. **lib/database.ts**: Modified to return null instead of throwing error when MONGODB_URI is missing during build
2. **app/api/sermons/upload/route.tsx**: Added database connection check
3. **app/api/sermons/route.tsx**: Added database connection check for GET and POST
4. **app/api/donations/route.tsx**: Added database connection check for GET and POST
5. **app/api/media/route.tsx**: Added database connection check for GET and POST
6. **components/Footer.tsx**: Added 'use client' directive for Framer Motion support
