# YouTube Auto-Fetch Implementation Plan

## Information Gathered

Based on analysis of the codebase:

1. **Current YouTube Settings API** (`/api/settings/route.tsx`):

   - Saves YouTube configuration to in-memory storage
   - Triggers auto-sync when channel info + API key are provided
   - Currently has `autoSync: false` and empty channel/API key values

2. **YouTube Sync API** (`/api/sermons/youtube/route.tsx`):

   - Has auto-sync functions that run on startup if `autoSync` is enabled
   - Has 5-minute cache duration
   - Auto-sync runs in background with configurable interval (default 6 hours)

3. **YouTube Storage** (`/lib/youtubeStorage.ts`):

   - Uses globalThis for persistence across serverless invocations
   - Stores channel config, cached videos, and last sync time

4. **Main Sermons API** (`/api/sermons/route.tsx`):
   - Fetches YouTube videos from `/api/sermons/youtube`
   - By default includes YouTube videos

## Issue Identified

The current settings have:

- `autoSync: false`
- Empty `channelId`, `channelUrl`, `apiKey`

For auto-fetch to work, you need to configure valid YouTube settings with:

1. A valid YouTube Channel ID or URL
2. A valid YouTube Data API v3 key
3. Set `autoSync: true`

## Plan

### Step 1: Update YouTube Settings with Valid Configuration

Configure YouTube settings with:

```json
{
  "youtube": {
    "channelId": "UCxxxxxxx", // Your YouTube channel ID
    "channelUrl": "https://www.youtube.com/@yourchannel", // or channel URL
    "apiKey": "YOUR_YOUTUBE_API_KEY",
    "autoSync": true,
    "syncInterval": 6
  }
}
```

### Step 2: Auto-Sync Will Trigger

Once valid settings are saved:

- Settings API will detect channel + API key
- It will trigger `syncYouTubeVideos()` in background
- The YouTube API route will fetch all videos and cache them
- Videos will be available at `/api/sermons/youtube` and `/api/sermons`

### Step 3: Verify

- Check `/api/settings` returns your YouTube config
- Check `/api/sermons/youtube` returns videos
- Check `/api/sermons` includes YouTube videos

## Files That Already Support Auto-Fetch

- ✅ `/api/settings/route.tsx` - Triggers sync on config save
- ✅ `/api/sermons/youtube/route.tsx` - Has auto-sync on startup
- ✅ `/api/sermons/route.tsx` - Fetches YouTube videos by default

The implementation is complete! You just need to configure valid YouTube settings.
