# TODO: Auto-Fetch YouTube Videos for Sermons

## Plan

### Information Gathered

- Current system requires manual "Sync Now" click to fetch YouTube videos
- Videos are cached in-memory for 5 minutes
- Settings can be configured in Admin → Settings → YouTube tab
- YouTube configuration includes: channelId, channelUrl, apiKey, autoSync, syncInterval

### Implementation Steps

1. **Modify YouTube API route** (`/src/app/api/sermons/youtube/route.tsx`)

   - [ ] Add auto-sync on server startup if configured
   - [ ] Implement background periodic sync
   - [ ] Ensure first access triggers sync if no cached videos

2. **Modify main sermons API** (`/src/app/api/sermons/route.tsx`)

   - [ ] Ensure YouTube videos are always fetched by default
   - [ ] Trigger sync if cache is empty

3. **Test the implementation**
   - [ ] Verify auto-sync works on startup
   - [ ] Verify background sync works
   - [ ] Verify first access triggers sync

### Files to Edit

- `el-shaddai-revival-centre/src/app/api/sermons/youtube/route.tsx`
- `el-shaddai-revival-centre/src/app/api/sermons/route.tsx`
