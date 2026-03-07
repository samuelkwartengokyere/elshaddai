# YouTube Playlist Configuration Implementation

## Task

Configure YouTube to fetch sermon videos from a specific playlist (labeled "sermons") from the YouTube channel and display them on the sermon page.

## Plan

### Step 1: Update youtubeStorage.ts

- [x] Add `playlistId` field to YouTubeConfigType interface
- [x] Add `playlistId` to defaultYouTubeSettings

### Step 2: Update youtube.ts

- [x] Modify `fetchChannelVideos` to accept optional playlistId parameter
- [x] If playlistId is provided, fetch directly from playlist instead of channel uploads
- [x] Update `fetchAllChannelVideos` to pass playlistId
- [x] Add `fetchChannelPlaylists` function to fetch all playlists from a channel
- [x] Add `findSermonsPlaylist` function to auto-detect "sermons" playlist

### Step 3: Update settings/route.tsx

- [x] Handle `playlistId` field when saving YouTube settings
- [x] Add auto-detection of sermons playlist when syncing

### Step 4: Update sermons/youtube/route.tsx

- [x] Pass playlistId to fetch functions
- [x] Update getEffectiveChannelId logic for playlist mode
- [x] Support playlist-only configuration (no channel ID needed)
- [x] Add autoDetectSermonsPlaylist function
- [x] Auto-detect sermons playlist during sync

### Step 5: Update admin/settings/page.tsx

- [x] Add Playlist ID input field to YouTube settings tab
- [x] Update state handling for playlistId

## Implementation Status

- [x] All changes implemented

## How It Works

### Automatic Sermons Playlist Detection

The system now automatically detects and fetches from a playlist labeled "sermons" on your YouTube channel:

1. When you configure your YouTube channel URL and API key in Admin Settings → YouTube
2. The system will automatically fetch all playlists from your channel
3. It will search for a playlist with "sermon" or "sermons" in the title
4. Once found, it will use that playlist to fetch sermon videos
5. The detected playlist ID is saved for future syncs

### Usage Instructions

#### Option 1: Auto-Detect Sermons Playlist (Recommended)

1. Go to Admin Settings → YouTube
2. Enter your YouTube Channel URL (e.g., `https://www.youtube.com/@yourchannel`)
3. Enter your YouTube Data API v3 key
4. Click "Save Settings"
5. The system will automatically find and fetch from your "Sermons" playlist

#### Option 2: Manual Playlist ID

1. Go to Admin Settings → YouTube
2. Enter your YouTube Playlist ID in the "Sermons Playlist ID" field
   - Find the playlist ID from the URL: `https://www.youtube.com/playlist?list=PLxxxxxxxxxxxxx`
3. Enter your YouTube Data API v3 key
4. Click "Save Settings"

#### Option 3: All Channel Uploads

1. Leave the Playlist ID field empty
2. Enter your Channel URL or Channel ID
3. Enter your YouTube Data API v3 key
4. Click "Save Settings"
5. The sermons will fetch from all channel uploads

### Environment Variables Support

You can also configure via environment variables:

- `YOUTUBE_CHANNEL_URL` - Your YouTube channel URL
- `YOUTUBE_API_KEY` - Your YouTube Data API v3 key
- `YOUTUBE_PLAYLIST_ID` - (Optional) Set a specific playlist ID
