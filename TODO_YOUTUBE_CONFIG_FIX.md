# YouTube Configuration Fix

## Issue

The Settings API (`api/settings/route.tsx`) only saves `churchName`, `churchTagline`, and `logoUrl` - it does NOT save YouTube settings.

Additionally, on Vercel (serverless deployment), the in-memory storage gets reset between function invocations, causing YouTube settings and cached videos to be lost.

## Root Cause (Vercel Deployment)

On Vercel's serverless platform:

- Each function invocation may run in a different container/instance
- Module-level in-memory variables (like `inMemorySettings` and `cachedYouTubeVideos`) are reset between invocations
- Without a persistent database (`MONGODB_URI`), settings and cached videos are lost immediately

## Solution

### Option 1: Add MongoDB (Recommended for Production)

Add `MONGODB_URI` to your Vercel project environment variables:

1. Create a MongoDB Atlas account (free tier)
2. Get your connection string
3. Add `MONGODB_URI` to Vercel project settings → Environment Variables

### Option 2: Use Vercel KV (Redis) for Caching

For serverless environments without MongoDB, use Vercel KV for persistent caching.

## Plan

- [x] Fix Settings API POST route to save YouTube configuration
- [x] Fix client-side state management to properly synchronize YouTube settings
- [x] Add settings reload after profile updates to maintain consistency
- [x] Add warning for Vercel deployments without database
- [ ] Test the YouTube configuration workflow

## Steps Completed

1. Updated the Settings API to properly save YouTube settings:

   - Added `inMemoryYouTubeSettings` storage for in-memory mode
   - Added `setInMemoryYouTubeSettings()` helper function
   - Updated `getInMemorySettings()` to include YouTube settings
   - Updated POST endpoint to extract and save YouTube configuration
   - YouTube settings now saved when database is connected or in-memory mode

2. Fixed client-side state management:

   - Updated `handleSave` function to properly construct the settings object
   - Ensured YouTube settings are always explicitly provided when saving
   - Added response handling to update local state after successful save
   - Added `fetchSettings()` call after profile updates to maintain consistency

3. Enhanced fetchSettings function:
   - Properly converts date strings to Date objects
   - Ensures all YouTube fields have proper defaults
   - Separates settings state from YouTube settings state for cleaner updates

## Vercel Deployment Note

⚠️ **Important**: For YouTube sync to work on Vercel, you MUST have a persistent database:

1. **MongoDB Atlas (Recommended)**:

   - Sign up at https://www.mongodb.com/atlas
   - Create a free cluster
   - Get connection string (replace password)
   - Add to Vercel: `MONGODB_URI=mongodb+srv://...`

2. **Environment Variable Setup**:
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add `MONGODB_URI` with your MongoDB connection string
   - Redeploy the project

Without `MONGODB_URI`, the app falls back to in-memory storage which doesn't persist between serverless function calls.
