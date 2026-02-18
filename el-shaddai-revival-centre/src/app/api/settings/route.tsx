import { NextRequest, NextResponse } from 'next/server'
import { 
  getInMemoryYouTubeSettings, 
  setInMemoryYouTubeSettings,
  getCachedYouTubeVideos,
  setCachedYouTubeVideos,
  setLastCacheUpdate
} from '@/lib/youtubeStorage'
import { fetchChannelDetails, fetchAllChannelVideos, youTubeVideoToSermon, extractChannelId, getChannelIdFromUsername } from '@/lib/youtube'

// Auto-sync YouTube videos function
async function syncYouTubeVideos(channelId: string, channelUrl: string, apiKey: string): Promise<{ success: boolean; videosCount: number; error?: string }> {
  try {
    // Get effective channel ID
    let effectiveChannelId = channelId || ''
    
    if (!effectiveChannelId && channelUrl) {
      const extractedId = extractChannelId(channelUrl)
      if (extractedId) {
        effectiveChannelId = extractedId
      } else if (apiKey) {
        const atMatch = channelUrl.match(/youtube\.com\/@([a-zA-Z0-9_-]+)/)
        const cMatch = channelUrl.match(/youtube\.com\/c\/([a-zA-Z0-9_-]+)/)
        const userMatch = channelUrl.match(/youtube\.com\/user\/([a-zA-Z0-9_-]+)/)
        
        const usernameMatch = atMatch || cMatch || userMatch
        
        if (usernameMatch) {
          const resolvedId = await getChannelIdFromUsername(usernameMatch[1], apiKey)
          if (resolvedId) {
            effectiveChannelId = resolvedId
          }
        }
      }
    }
    
    if (!effectiveChannelId) {
      return { success: false, videosCount: 0, error: 'Could not resolve channel ID' }
    }
    
    if (!apiKey) {
      return { success: false, videosCount: 0, error: 'API key required' }
    }
    
    // Fetch channel details
    const channelDetails = await fetchChannelDetails(effectiveChannelId, apiKey)
    
    // Fetch all videos
    const videos = await fetchAllChannelVideos(
      effectiveChannelId,
      apiKey,
      { maxVideos: 500, maxResultsPerPage: 50 }
    )
    
    const sermonVideos = videos.map(youTubeVideoToSermon)
    
    // Update cache
    setCachedYouTubeVideos(sermonVideos)
    setLastCacheUpdate(new Date())
    
    // Update in-memory settings with channel name and sync status
    setInMemoryYouTubeSettings({
      channelId: effectiveChannelId,
      channelName: channelDetails?.title || '',
      channelUrl: channelUrl || `https://www.youtube.com/channel/${effectiveChannelId}`,
      apiKey: apiKey,
      lastSync: new Date(),
      syncStatus: 'success',
      syncError: ''
    })
    
    console.log(`[Settings API] Auto-synced ${sermonVideos.length} YouTube videos`)
    return { success: true, videosCount: sermonVideos.length }
    
  } catch (error) {
    console.error('[Settings API] YouTube sync error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    setInMemoryYouTubeSettings({
      syncStatus: 'error',
      syncError: errorMessage
    })
    return { success: false, videosCount: 0, error: errorMessage }
  }
}

// Default settings fallback
const defaultSettings = {
  churchName: 'El-Shaddai Revival Centre',
  churchTagline: 'The Church Of Pentecost',
  logoUrl: 'https://pentecost.ca/wp-content/uploads/2025/03/The-Church-Pentecost-Logo-1.png'
}

// In-memory storage for settings (replaces MongoDB)
let inMemorySettings: Record<string, unknown> = { ...defaultSettings }

function getInMemorySettings() {
  return { 
    ...inMemorySettings,
    youtube: getInMemoryYouTubeSettings()
  }
}

function setInMemorySettings(settings: Partial<{ churchName: string; churchTagline: string; logoUrl: string }>) {
  if (settings.churchName !== undefined) {
    inMemorySettings = { ...inMemorySettings, churchName: settings.churchName }
  }
  if (settings.churchTagline !== undefined) {
    inMemorySettings = { ...inMemorySettings, churchTagline: settings.churchTagline }
  }
  if (settings.logoUrl !== undefined) {
    inMemorySettings = { ...inMemorySettings, logoUrl: settings.logoUrl }
  }
}

export async function GET() {
  try {
    // Return in-memory settings
    return NextResponse.json({
      success: true,
      settings: getInMemorySettings(),
      isInMemoryMode: true
    })

  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json(
      { success: true, settings: defaultSettings, isDefault: true },
      { status: 200 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { churchName, churchTagline, logoUrl, youtube } = body
    
    // Update settings from body
    if (churchName !== undefined) {
      setInMemorySettings({ churchName: churchName || defaultSettings.churchName })
    }
    if (churchTagline !== undefined) {
      setInMemorySettings({ churchTagline: churchTagline || defaultSettings.churchTagline })
    }
    if (logoUrl !== undefined) {
      setInMemorySettings({ logoUrl: logoUrl || defaultSettings.logoUrl })
    }
    
    // Update YouTube settings if explicitly provided
    if (youtube !== undefined) {
      // First save the settings
      setInMemoryYouTubeSettings({
        channelId: youtube.channelId || '',
        channelName: youtube.channelName || '',
        channelUrl: youtube.channelUrl || '',
        apiKey: youtube.apiKey || '',
        autoSync: youtube.autoSync || false,
        syncInterval: youtube.syncInterval || 6,
        lastSync: youtube.lastSync ? new Date(youtube.lastSync) : null,
        syncStatus: youtube.syncStatus || 'idle',
        syncError: youtube.syncError || ''
      })
      
      // Auto-sync YouTube videos after saving settings (if channel and API key are provided)
      const channelId = youtube.channelId || ''
      const channelUrl = youtube.channelUrl || ''
      const apiKey = youtube.apiKey || ''
      
      // Only auto-sync if we have channel info and API key
      if ((channelId || channelUrl) && apiKey) {
        console.log('[Settings API] YouTube configuration detected, triggering auto-sync...')
        
        // Set status to syncing
        setInMemoryYouTubeSettings({
          syncStatus: 'syncing',
          syncError: ''
        })
        
        // Trigger sync (don't await - let it run in background)
        syncYouTubeVideos(channelId, channelUrl, apiKey).then(syncResult => {
          if (syncResult.success) {
            console.log(`[Settings API] Auto-sync complete: ${syncResult.videosCount} videos fetched`)
          } else {
            console.log(`[Settings API] Auto-sync failed: ${syncResult.error}`)
          }
        }).catch(syncError => {
          console.error('[Settings API] Auto-sync error:', syncError)
        })
      }
    }
    
    return NextResponse.json({
      success: true,
      message: 'Settings updated successfully',
      settings: getInMemorySettings(),
      isInMemoryMode: true
    }, { status: 200 })

  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    )
  }
}
