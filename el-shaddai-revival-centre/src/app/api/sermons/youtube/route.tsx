import { NextRequest, NextResponse } from 'next/server'
import { 
  YouTubeConfigType, 
  getInMemoryYouTubeSettings, 
  setInMemoryYouTubeSettings,
  getCachedYouTubeVideos,
  setCachedYouTubeVideos,
  getLastCacheUpdate,
  setLastCacheUpdate,
  clearYouTubeCache
} from '@/lib/youtubeStorage'
import { fetchChannelDetails, fetchAllChannelVideos, youTubeVideoToSermon, extractChannelId, getChannelIdFromUsername } from '@/lib/youtube'

const CACHE_DURATION_MS = 5 * 60 * 1000 // 5 minutes

// Initialize YouTube settings from environment variables on startup
function initializeYouTubeFromEnv() {
  // Check both YOUTUBE_CHANNEL_ID and NEXT_PUBLIC_YOUTUBE_CHANNEL_ID
  const envChannelId = process.env.YOUTUBE_CHANNEL_ID || process.env.NEXT_PUBLIC_YOUTUBE_CHANNEL_ID
  const envApiKey = process.env.YOUTUBE_API_KEY
  const envChannelUrl = process.env.YOUTUBE_CHANNEL_URL || process.env.NEXT_PUBLIC_YOUTUBE_URL
  
  if (envChannelId || envChannelUrl || envApiKey) {
    const currentSettings = getInMemoryYouTubeSettings()
    setInMemoryYouTubeSettings({
      channelId: envChannelId || currentSettings.channelId,
      channelUrl: envChannelUrl || currentSettings.channelUrl,
      apiKey: envApiKey || currentSettings.apiKey,
    })
  }
}

// Call initialization on module load
initializeYouTubeFromEnv()

// GET - Fetch cached YouTube videos or sync status
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const forceRefresh = searchParams.get('refresh') === 'true'
    
    // Get YouTube config from in-memory storage only (no database)
    const youtubeConfig = getInMemoryYouTubeSettings()

    // Check if we have either channelId or channelUrl
    const hasChannelConfig = !!(youtubeConfig.channelId || youtubeConfig.channelUrl)

    if (!hasChannelConfig) {
      return NextResponse.json({
        success: false,
        error: 'YouTube channel not configured',
        videos: [],
        configured: false
      }, { status: 400 })
    }

    // Get effective channel ID (extract from URL if needed)
    let effectiveChannelId = youtubeConfig.channelId || ''
    
    if (!effectiveChannelId && youtubeConfig.channelUrl) {
      // Try to extract channel ID from URL (for /channel/ URLs)
      const extractedId = extractChannelId(youtubeConfig.channelUrl)
      if (extractedId) {
        effectiveChannelId = extractedId
      } else if (youtubeConfig.apiKey) {
        // For @username, /c/, or /user/ URLs, need to use API to get channel ID
        const atMatch = youtubeConfig.channelUrl.match(/youtube\.com\/@([a-zA-Z0-9_-]+)/)
        const cMatch = youtubeConfig.channelUrl.match(/youtube\.com\/c\/([a-zA-Z0-9_-]+)/)
        const userMatch = youtubeConfig.channelUrl.match(/youtube\.com\/user\/([a-zA-Z0-9_-]+)/)
        
        const usernameMatch = atMatch || cMatch || userMatch
        
        if (usernameMatch) {
          const resolvedId = await getChannelIdFromUsername(usernameMatch[1], youtubeConfig.apiKey)
          if (resolvedId) {
            effectiveChannelId = resolvedId
            // Update the channelId in memory with the resolved ID
            setInMemoryYouTubeSettings({ channelId: resolvedId })
          }
        }
      }
    }

    // If channelId looks like a handle (@username), try to resolve it
    if (!effectiveChannelId && youtubeConfig.channelId?.startsWith('@')) {
      const handle = youtubeConfig.channelId.replace('@', '')
      if (youtubeConfig.apiKey) {
        const resolvedId = await getChannelIdFromUsername(handle, youtubeConfig.apiKey)
        if (resolvedId) {
          effectiveChannelId = resolvedId
          // Update the channelId in memory with the resolved ID
          setInMemoryYouTubeSettings({ channelId: resolvedId })
        }
      }
    }

    if (!effectiveChannelId) {
      return NextResponse.json({
        success: false,
        error: 'Could not extract channel ID from configuration',
        videos: [],
        configured: true,
        needsChannelId: true
      }, { status: 400 })
    }

    // Check cache
    const now = new Date()
    const lastUpdate = getLastCacheUpdate()
    const cachedVideos = getCachedYouTubeVideos()
    const cacheExpired = !lastUpdate || 
      (now.getTime() - lastUpdate.getTime()) > CACHE_DURATION_MS

    if (!forceRefresh && cachedVideos.length > 0 && !cacheExpired) {
      return NextResponse.json({
        success: true,
        videos: cachedVideos,
        cached: true,
        lastUpdate: lastUpdate,
        configured: true
      })
    }

    // Fetch videos from YouTube
    if (youtubeConfig.apiKey) {
      const videos = await fetchAllChannelVideos(
        effectiveChannelId,
        youtubeConfig.apiKey,
        { maxVideos: 500, maxResultsPerPage: 50 }
      )

      // Transform to sermon format and update cache
      const sermonVideos = videos.map(youTubeVideoToSermon)
      setCachedYouTubeVideos(sermonVideos)
      setLastCacheUpdate(now)

      // Update sync status in in-memory storage
      setInMemoryYouTubeSettings({
        lastSync: new Date(),
        syncStatus: 'success',
        syncError: ''
      })

      return NextResponse.json({
        success: true,
        videos: sermonVideos,
        cached: false,
        lastUpdate: now,
        configured: true
      })
    } else {
      // Try without API key (limited requests)
      return NextResponse.json({
        success: false,
        error: 'YouTube API key required for fetching videos',
        videos: [],
        configured: true,
        needsApiKey: true
      }, { status: 400 })
    }

  } catch (error) {
    console.error('YouTube sync error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch YouTube videos',
      videos: []
    }, { status: 500 })
  }
}

// POST - Trigger manual sync
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const { channelId, apiKey, channelUrl } = body

    // If channelUrl is provided but channelId is not, try to extract channel ID from URL
    let finalChannelId = channelId || ''
    
    if (!finalChannelId && channelUrl) {
      // Try to extract channel ID from URL (for /channel/ URLs)
      const extractedId = extractChannelId(channelUrl)
      if (extractedId) {
        finalChannelId = extractedId
      } else if (apiKey) {
        // For @username, /c/, or /user/ URLs, need to use API to get channel ID
        // Extract the username part from various URL formats
        const atMatch = channelUrl.match(/youtube\.com\/@([a-zA-Z0-9_-]+)/)
        const cMatch = channelUrl.match(/youtube\.com\/c\/([a-zA-Z0-9_-]+)/)
        const userMatch = channelUrl.match(/youtube\.com\/user\/([a-zA-Z0-9_-]+)/)
        
        const usernameMatch = atMatch || cMatch || userMatch
        
        if (usernameMatch) {
          finalChannelId = await getChannelIdFromUsername(usernameMatch[1], apiKey)
        }
      }
    }

    if (!finalChannelId) {
      // Check if it's a username URL that needs API key
      const isUsernameUrl = channelUrl && (
        channelUrl.includes('/@') || 
        channelUrl.includes('/c/') || 
        channelUrl.includes('/user/')
      )
      
      if (isUsernameUrl && !apiKey) {
        return NextResponse.json({
          success: false,
          error: 'YouTube API key is required when using @username or custom URL format. Please add your API key to enable video sync.',
          videosSynced: 0,
          needsApiKey: true
        }, { status: 400 })
      }
      
      return NextResponse.json({
        success: false,
        error: 'Could not extract channel ID from the provided URL. Please provide a valid YouTube Channel ID (UC...) or Channel URL.',
        videosSynced: 0,
        needsChannelId: true
      }, { status: 400 })
    }

    // Update settings with new channel info (in-memory only)
    const newChannelConfig = {
      channelId: finalChannelId,
      channelUrl: channelUrl || `https://www.youtube.com/channel/${finalChannelId}`,
      apiKey: apiKey || '',
      syncStatus: 'syncing' as const,
      syncError: ''
    }
    
    setInMemoryYouTubeSettings(newChannelConfig)

    // If no API key, we can't fetch videos
    if (!apiKey) {
      // Clear cache and mark as needing API key
      clearYouTubeCache()
      
      // Save to in-memory storage
      setInMemoryYouTubeSettings({
        syncStatus: 'idle',
        syncError: 'API key required for video sync'
      })

      return NextResponse.json({
        success: true,
        message: 'Channel configured. Add API key to enable video sync.',
        videosSynced: 0,
        needsApiKey: true
      })
    }

    // Fetch channel details first
    const channelDetails = await fetchChannelDetails(finalChannelId, apiKey)
    
    // Fetch ALL videos using pagination
    const videos = await fetchAllChannelVideos(finalChannelId, apiKey, { maxVideos: 500, maxResultsPerPage: 50 })
    const sermonVideos = videos.map(youTubeVideoToSermon)

    // Update cache
    setCachedYouTubeVideos(sermonVideos)
    setLastCacheUpdate(new Date())

    // Update settings with channel name and sync status (in-memory only)
    setInMemoryYouTubeSettings({
      channelName: channelDetails?.title || '',
      channelId: finalChannelId,
      channelUrl: channelUrl || `https://www.youtube.com/channel/${finalChannelId}`,
      apiKey: apiKey,
      lastSync: new Date(),
      syncStatus: 'success',
      syncError: ''
    })

    return NextResponse.json({
      success: true,
      message: 'YouTube videos synced successfully',
      channel: channelDetails,
      videosSynced: sermonVideos.length,
      videos: sermonVideos
    })

  } catch (error) {
    console.error('YouTube sync error:', error)
    
    // Update error status in in-memory storage
    setInMemoryYouTubeSettings({
      syncStatus: 'error',
      syncError: error instanceof Error ? error.message : 'Unknown error'
    })

    return NextResponse.json({
      success: false,
      error: 'Failed to sync YouTube videos',
      videosSynced: 0
    }, { status: 500 })
  }
}

// DELETE - Clear YouTube cache
export async function DELETE() {
  clearYouTubeCache()

  return NextResponse.json({
    success: true,
    message: 'YouTube cache cleared'
  })
}

