# YouTube Database Disconnect Fix

## Task

Remove database dependency from YouTube integration to make it work independently.

## Plan

- [x] 1. Update `api/sermons/youtube/route.tsx` to remove database dependency
- [x] 2. Add environment variable fallback for YouTube configuration
- [x] 3. Update sermons API to remove Settings import
- [ ] 4. Test the changes

## Changes made:

### 1. api/sermons/youtube/route.tsx

- Removed all database imports (connectDB, isConnectionReady, Settings)
- Removed all database-related code (findOne, findOneAndUpdate)
- Added environment variable initialization for YouTube settings (YOUTUBE_CHANNEL_ID, YOUTUBE_API_KEY, YOUTUBE_CHANNEL_URL)
- Now uses in-memory storage only

### 2. api/sermons/route.tsx

- Removed Settings import (no longer needed)

## How to use:

### Option 1: Set via Admin Panel

Configure YouTube channel in the admin panel at `/admin/media`. The settings will be stored in memory.

### Option 2: Environment Variables

Set the following environment variables for automatic YouTube configuration:

- `YOUTUBE_CHANNEL_ID` - Your YouTube channel ID (e.g., UC...)
- `YOUTUBE_API_KEY` - Your YouTube Data API key
- `YOUTUBE_CHANNEL_URL` - Your channel URL (optional)

Note: In-memory storage means settings are lost on server restart. For persistent settings, keep the database connected.
