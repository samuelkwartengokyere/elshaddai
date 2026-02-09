# YouTube Auto-Fetch Implementation Plan

## Phase 1: Core Infrastructure

- [x] 1. Update Settings model with YouTube config fields
- [x] 2. Create YouTube API service (src/lib/youtube.ts)
- [x] 3. Create YouTube sync API route

## Phase 2: Backend Integration

- [x] 4. Update sermons API to include YouTube videos
- [ ] 5. Add caching for YouTube API responses

## Phase 3: Frontend Updates

- [x] 6. Update SermonCard component for YouTube videos
- [x] 7. Update sermons page for YouTube embeds
- [x] 8. Add YouTube tab in admin settings

## Phase 4: Admin Controls

- [ ] 9. Add YouTube sync button in admin sermons page
- [ ] 10. Display sync status in settings

## Testing

- [ ] 11. Test YouTube video fetching
- [ ] 12. Verify sermons display correctly
- [ ] 13. Test manual sync functionality
