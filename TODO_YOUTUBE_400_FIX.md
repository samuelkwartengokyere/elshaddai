# TODO: Fix YouTube API 400 Error

## Task

Fix the YouTube API 400 BAD_REQUEST error in the live stream fetch functionality.

## Steps

- [x] 1. Analyze the error and understand the root cause
- [x] 2. Add error handling in `fetchLiveStreams` function to catch and log actual API error
- [x] 3. Add API key validation before making the request
- [x] 4. Return informative error messages for graceful fallback
- [x] 5. Test the fix (Code passes linting with no errors)

## Notes

- The error is in `src/lib/youtube.ts` in the `fetchLiveStreams` function
- The 400 error comes from YouTube Data API when:
  - API key is missing/invalid
  - API quota exceeded
  - API key doesn't have proper permissions
- The fix adds better error handling and allows graceful fallback to time-based detection
- The API route already handles errors gracefully by falling back to time-based detection
