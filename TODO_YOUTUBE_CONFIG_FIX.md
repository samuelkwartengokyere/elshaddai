# YouTube Configuration Fix

## Issue
The Settings API (`api/settings/route.tsx`) only saves `churchName`, `churchTagline`, and `logoUrl` - it does NOT save YouTube settings.

## Plan
- [x] Fix Settings API POST route to save YouTube configuration
- [ ] Test the YouTube configuration workflow

## Steps Completed
1. Updated the Settings API to properly save YouTube settings:
   - Added `inMemoryYouTubeSettings` storage for in-memory mode
   - Added `setInMemoryYouTubeSettings()` helper function
   - Updated `getInMemorySettings()` to include YouTube settings
   - Updated POST endpoint to extract and save YouTube configuration
   - YouTube settings now saved when database is connected or in-memory mode

