# Admin Page Fixes - Implementation Plan

## Issues Identified:

1. **YouTube Videos Not Showing**

   - YouTube API requires configuration (channel URL and optionally API key)
   - The LiveStream component only uses env var `NEXT_PUBLIC_YOUTUBE_CHANNEL_ID`
   - Settings need to be properly saved and loaded

2. **Database Not Connecting**

   - Missing `MONGODB_URI` in environment variables
   - No clear guidance to user about what's needed

3. **Admin Error Messages**
   - Not showing specific actionable errors

## Fix Plan:

### Step 1: Fix LiveStream Component

- Use YouTube channel ID from settings API instead of just env var
- Add fallback to environment variable
- Improve error handling

### Step 2: Fix Settings Flow

- Ensure YouTube settings are properly saved and loaded
- Fix any issues in the settings API

### Step 3: Improve Admin Dashboard Errors

- Make database errors more actionable
- Show specific guidance on what's needed

## Files to Edit:

1. `/src/components/LiveStream.tsx` - Use settings API for channel ID
2. `/src/app/admin/page.tsx` - Improve error messages

## Testing:

- Verify build succeeds
- Test admin page loads correctly
- Test YouTube embed works when configured
