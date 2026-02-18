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

// Auto-sync state
let autoSyncInterval: NodeJS.Timeout | null = null
let isInitialized = false
let initializationAttempted = false

// Initialize YouTube settings from environment variables on startup
// This is the PRIMARY source - environment variables are always available on server start
function initializeYouTubeFromEnv(): YouTubeConfigType {
  // Check both YOUTUBE_CHANNEL_ID and NEXT_PUBLIC_YOUTUBE_CHANNEL_ID
  let envChannelId = process.env.YOUTUBE_CHANNEL_ID || process.env.NEXT_PUBLIC_YOUTUBE_CHANNEL_ID
  const envApiKey = process.env.YOUTUBE_API_KEY || process.env.NEXT_PUBLIC_YOUTUBE_API_KEY
  const envChannelUrl = process.env.YOUTUBE_CHANNEL_URL || process.env.NEXT_PUBLIC_YOUTUBE_URL
  
  // Check if the channel ID is actually a YouTube handle (starts with @)
  // Handles need to be resolved to channel IDs using the API
  let resolvedChannelUrl = envChannelUrl || ''
  
  if (envChannelId && envChannelId.startsWith('@')) {
    // It's a handle! Convert to URL format for resolution
    // Store as channelUrl so it gets resolved later
    resolvedChannelUrl = `https://www.youtube.com/${envChannelId}`
    console.log('[YouTube Init] Detected YouTube handle, converting to URL:', resolvedChannelUrl)
    // Clear the channelId since we need to resolve it
    envChannelId = ''
  }
  
  const settings: YouTubeConfigType = {
    channelId: envChannelId || '',
    channelName: '',
    channelUrl: resolvedChannelUrl,
    apiKey: envApiKey || '',
    autoSync: true, // Enable auto-sync by default when env vars are set
    syncInterval: 6,
    lastSync: null,
    syncStatus: 'idle',
    syncError: ''
  }
  
  if (envChannelId || resolvedChannelUrl || envApiKey) {
    console.log('[YouTube Init] Found environment variables, configuring YouTube...')
    console.log('[YouTube Init] Channel ID:', envChannelId || '(needs resolution)')
    console.log('[YouTube Init] Channel URL:', resolvedChannelUrl)
    console.log('[YouTube Init] Has API Key:', !!envApiKey)
    setInMemoryYouTubeSettings(settings)
  }
  
  return settings
}

// Fetch settings from Settings API
async function fetchSettingsFromAPI(origin: string): Promise<YouTubeConfigType | null> {
  try {
    const settingsResponse = await fetch(`${origin}/api/settings`, { 
      cache: 'no-store'
    })
    
    if (settingsResponse.ok) {
      const settingsData = await settingsResponse.json()
      
      if (settingsData.success && settingsData.settings?.youtube) {
        const ytSettings = settingsData.settings.youtube
        return {
          channelId: ytSettings.channelId || '',
          channelName: ytSettings.channelName || '',
          channelUrl: ytSettings.channelUrl || '',
          apiKey: ytSettings.apiKey || '',
          autoSync: ytSettings.autoSync ?? true,
          syncInterval: ytSettings.syncInterval ?? 6,
          lastSync: ytSettings.lastSync ? new Date(ytSettings.lastSync) : null,
          syncStatus: ytSettings.syncStatus || 'idle',
          syncError: ytSettings.syncError || ''
        }
      }
    }
  } catch (settingsError) {
    console.log('[YouTube Init] Settings API not available, using env vars')
  }
  return null
}

// Get effective channel ID from config (resolves from URL if needed)
async function getEffectiveChannelId(config: YouTubeConfigType): Promise<string> {
  // If we already have a channel ID, use it
  if (config.channelId) {
    return config.channelId
  }
  
  // Try to extract from URL
  if (config.channelUrl) {
    // First try direct extraction (for /channel/ URLs)
    const extractedId = extractChannelId(config.channelUrl)
    if (extractedId) {
      console.log('[YouTube] Extracted channel ID from URL:', extractedId)
      return extractedId
    }
    
    // For @username URLs, need to use API to resolve
    if (config.apiKey) {
      const atMatch = config.channelUrl.match(/youtube\.com\/@([a-zA-Z0-9_-]+)/)
      const cMatch = config.channelUrl.match(/youtube\.com\/c\/([a-zA-Z0-9_-]+)/)
      const userMatch = config.channelUrl.match(/youtube\.com\/user\/([a-zA-Z0-9_-]+)/)
      
      const usernameMatch = atMatch || cMatch || userMatch
      
      if (usernameMatch) {
        console.log(`[YouTube] Resolving channel ID from username: ${usernameMatch[1]}`)
        const resolvedId = await getChannelIdFromUsername(usernameMatch[1], config.apiKey)
        if (resolvedId) {
          console.log('[YouTube] Resolved channel ID:', resolvedId)
          return resolvedId
        }
      }
    }
  }
  
  return ''
}

// Auto-sync function to fetch videos from YouTube
async function performAutoSync(): Promise<{ success: boolean; videosCount: number; error?: string }> {
  try {
    const youtubeConfig = getInMemoryYouTubeSettings()
    
    // Check if we have required config
    if (!youtubeConfig.channelId && !youtubeConfig.channelUrl) {
      return { success: false, videosCount: 0, error: 'No channel configured' }
    }
    
    if (!youtubeConfig.apiKey) {
      return { success: false, videosCount: 0, error: 'No API key configured' }
    }
    
    // Get effective channel ID
    let effectiveChannelId = await getEffectiveChannelId(youtubeConfig)
    
    if (!effectiveChannelId) {
      return { success: false, videosCount: 0, error: 'Could not resolve channel ID' }
    }
    
    console.log(`[Auto-Sync] Fetching videos from channel: ${effectiveChannelId}`)
    
    // Fetch videos
    const videos = await fetchAllChannelVideos(
      effectiveChannelId,
      youtubeConfig.apiKey,
      { maxVideos: 500, maxResultsPerPage: 50 }
    )
    
    const sermonVideos = videos.map(youTubeVideoToSermon)
    setCachedYouTubeVideos(sermonVideos)
    setLastCacheUpdate(new Date())
    
    // Update sync status
    setInMemoryYouTubeSettings({
      lastSync: new Date(),
      syncStatus: 'success',
      syncError: ''
    })
    
    console.log(`[Auto-Sync] Successfully synced ${sermonVideos.length} videos from YouTube`)
    return { success: true, videosCount: sermonVideos.length }
    
  } catch (error) {
    console.error('[Auto-Sync] Error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    setInMemoryYouTubeSettings({
      syncStatus: 'error',
      syncError: errorMessage
    })
    return { success: false, videosCount: 0, error: errorMessage }
  }
}

// Start auto-sync interval
function startAutoSync(intervalHours: number = 6) {
  // Clear existing interval if any
  if (autoSyncInterval) {
    clearInterval(autoSyncInterval)
    autoSyncInterval = null
  }
  
  // Convert hours to milliseconds
  const intervalMs = intervalHours * 60 * 60 * 1000
  
  // Start the interval
  autoSyncInterval = setInterval(async () => {
    const config = getInMemoryYouTubeSettings()
    if (config.autoSync && config.apiKey && (config.channelId || config.channelUrl)) {
      console.log(`[Auto-Sync] Starting scheduled sync (every ${intervalHours} hours)...`)
      await performAutoSync()
    }
  }, intervalMs)
  
  console.log(`[Auto-Sync] Started with interval: ${intervalHours} hours`)
}

// Initialize auto-sync based on settings
async function initializeAutoSync(origin: string) {
  if (initializationAttempted) return
  initializationAttempted = true
  
  // First, initialize from environment variables
  const envSettings = initializeYouTubeFromEnv()
  
  // Then try to get settings from Settings API (overrides env vars if available)
  const apiSettings = await fetchSettingsFromAPI(origin)
  
  let config: YouTubeConfigType
  
  if (apiSettings && (apiSettings.channelId || apiSettings.channelUrl) && apiSettings.apiKey) {
    // Use API settings if available
    console.log('[Auto-Sync] Using settings from Settings API')
    config = apiSettings
    setInMemoryYouTubeSettings(config)
  } else if (envSettings.apiKey && (envSettings.channelId || envSettings.channelUrl)) {
    // Use environment variable settings
    console.log('[Auto-Sync] Using settings from environment variables')
    config = envSettings
  } else {
    // No settings available
    console.log('[Auto-Sync] No YouTube configuration found')
    isInitialized = true
    return
  }
  
  if (config.autoSync && (config.channelId || config.channelUrl) && config.apiKey) {
    // Perform initial sync
    console.log('[Auto-Sync] Performing initial sync on startup...')
    
    // Try to resolve channel ID if needed
    const effectiveChannelId = await getEffectiveChannelId(config)
    
    if (effectiveChannelId) {
      // Update config with effective channel ID
      setInMemoryYouTubeSettings({ channelId: effectiveChannelId })
      
      await performAutoSync()
      
      // Start periodic sync
      const intervalHours = config.syncInterval || 6
      startAutoSync(intervalHours)
    } else {
      console.log('[Auto-Sync] Could not resolve channel ID, skipping initial sync')
    }
  }
  
  isInitialized = true
}

// GET - Fetch cached YouTube videos or sync status
export async function GET(request: NextRequest) {
  // Initialize on first request
  if (!initializationAttempted) {
    await initializeAutoSync(request.nextUrl.origin)
  }
  
  try {
    const searchParams = request.nextUrl.searchParams
    const forceRefresh = searchParams.get('refresh') === 'true'
    
    // Ensure env vars are always loaded as fallback
    const envSettings = initializeYouTubeFromEnv()
    
    // Try to get YouTube config from Settings API first
    let youtubeConfig = getInMemoryYouTubeSettings()
    
    try {
      const settingsResponse = await fetch(`${request.nextUrl.origin}/api/settings`, { cache: 'no-store' })
      const settingsData = await settingsResponse.json()
      
      if (settingsData.success && settingsData.settings?.youtube) {
        const ytSettings = settingsData.settings.youtube
        // Merge Settings API values with in-memory defaults
        youtubeConfig = {
          ...youtubeConfig,
          channelId: ytSettings.channelId || youtubeConfig.channelId,
          channelUrl: ytSettings.channelUrl || youtubeConfig.channelUrl,
          apiKey: ytSettings.apiKey || youtubeConfig.apiKey,
          channelName: ytSettings.channelName || youtubeConfig.channelName,
          autoSync: ytSettings.autoSync ?? youtubeConfig.autoSync,
          syncInterval: ytSettings.syncInterval ?? youtubeConfig.syncInterval,
          lastSync: ytSettings.lastSync ? new Date(ytSettings.lastSync) : youtubeConfig.lastSync,
          syncStatus: ytSettings.syncStatus || youtubeConfig.syncStatus,
          syncError: ytSettings.syncError || youtubeConfig.syncError
        }
      }
    } catch (settingsError) {
      console.log('[YouTube API] Settings API not available, using env vars')
      // Use env settings as fallback
      if (envSettings.apiKey && (envSettings.channelId || envSettings.channelUrl)) {
        youtubeConfig = { ...youtubeConfig, ...envSettings }
      }
    }

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

    // Get effective channel ID (resolve from URL if needed)
    let effectiveChannelId = await getEffectiveChannelId(youtubeConfig)

    if (!effectiveChannelId) {
      return NextResponse.json({
        success: false,
        error: 'Could not extract channel ID from configuration. Please check your channel URL or provide a channel ID.',
        videos: [],
        configured: true,
        needsChannelId: true,
        config: {
          channelId: youtubeConfig.channelId,
          channelUrl: youtubeConfig.channelUrl,
          hasApiKey: !!youtubeConfig.apiKey
        }
      }, { status: 400 })
    }

    // Update in-memory with resolved channel ID
    if (effectiveChannelId !== youtubeConfig.channelId) {
      setInMemoryYouTubeSettings({ channelId: effectiveChannelId })
    }

    // Check cache
    const now = new Date()
    const lastUpdate = getLastCacheUpdate()
    const cachedVideos = getCachedYouTubeVideos()
    const cacheExpired = !lastUpdate || 
      (now.getTime() - lastUpdate.getTime()) > CACHE_DURATION_MS

    // Auto-sync: If no cached videos and we have config, trigger sync automatically
    if (cachedVideos.length === 0 && youtubeConfig.apiKey) {
      console.log('[YouTube API] No cached videos found, triggering auto-sync...')
      
      // Fetch videos from YouTube
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
        configured: true,
        autoSynced: true,
        channelId: effectiveChannelId
      })
    }

    if (!forceRefresh && cachedVideos.length > 0 && !cacheExpired) {
      return NextResponse.json({
        success: true,
        videos: cachedVideos,
        cached: true,
        lastUpdate: lastUpdate,
        configured: true,
        channelId: effectiveChannelId
      })
    }

    // Fetch videos from YouTube (cache expired or force refresh)
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
        configured: true,
        channelId: effectiveChannelId
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
    
    let { channelId, apiKey, channelUrl } = body

    // If settings are not provided in body, try to fetch from Settings API
    if (!channelId && !channelUrl) {
      try {
        const settingsResponse = await fetch(`${request.nextUrl.origin}/api/settings`)
        const settingsData = await settingsResponse.json()
        
        if (settingsData.success && settingsData.settings?.youtube) {
          const ytSettings = settingsData.settings.youtube
          channelId = ytSettings.channelId || ''
          channelUrl = ytSettings.channelUrl || ''
          apiKey = ytSettings.apiKey || ''
          
          console.log('Fetched YouTube settings from Settings API:', { channelId, channelUrl, hasApiKey: !!apiKey })
        }
      } catch (settingsError) {
        console.error('Failed to fetch settings from Settings API:', settingsError)
      }
    }
    
    // Fall back to environment variables if still not available
    if (!channelId && !channelUrl) {
      const envSettings = initializeYouTubeFromEnv()
      if (envSettings.apiKey && (envSettings.channelId || envSettings.channelUrl)) {
        channelId = envSettings.channelId
        channelUrl = envSettings.channelUrl
        apiKey = envSettings.apiKey
        console.log('Using YouTube settings from environment variables')
      }
    }

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
          console.log(`[POST] Resolving channel ID from username: ${usernameMatch[1]}`)
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

    console.log(`[POST] Using channel ID: ${finalChannelId}`)

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

    // Check if autoSync is enabled and start auto-sync
    const bodyAutoSync = body.autoSync !== undefined ? body.autoSync : true
    const bodySyncInterval = body.syncInterval || 6
    
    if (bodyAutoSync && apiKey) {
      setInMemoryYouTubeSettings({
        autoSync: true,
        syncInterval: bodySyncInterval
      })
      startAutoSync(bodySyncInterval)
    }

    return NextResponse.json({
      success: true,
      message: 'YouTube videos synced successfully',
      channel: channelDetails,
      videosSynced: sermonVideos.length,
      videos: sermonVideos,
      autoSyncEnabled: bodyAutoSync
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

