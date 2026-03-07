import { NextRequest, NextResponse } from 'next/server'
import { settingsDb, isDbConfigured } from '@/lib/db'
import { 
  getInMemoryYouTubeSettings, 
  setInMemoryYouTubeSettings,
  getCachedYouTubeVideos,
  setCachedYouTubeVideos,
  setLastCacheUpdate
} from '@/lib/youtubeStorage'
import { fetchChannelDetails, fetchAllChannelVideos, youTubeVideoToSermon, extractChannelId, getChannelIdFromUsername, fetchChannelPlaylists, findSermonsPlaylist } from '@/lib/youtube'
import { getMaintenanceMode, setMaintenanceMode } from '@/lib/maintenance'

// Auto-sync YouTube videos function
async function syncYouTubeVideos(channelId: string, channelUrl: string, apiKey: string, playlistId: string = ''): Promise<{ success: boolean; videosCount: number; error?: string }> {
  try {
    // Get effective channel ID (only needed if not using playlistId)
    let effectiveChannelId = channelId || ''
    
    // If using a specific playlist, we don't need channel ID
    const isUsingPlaylist = !!playlistId
    
    if (!isUsingPlaylist && !effectiveChannelId && channelUrl) {
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
    
    // If using playlist, channelId is optional
    if (!isUsingPlaylist && !effectiveChannelId) {
      return { success: false, videosCount: 0, error: 'Could not resolve channel ID' }
    }
    
    if (!apiKey) {
      return { success: false, videosCount: 0, error: 'API key required' }
    }
    
    // If no specific playlist is configured but we have a channel, auto-detect sermons playlist
    if (!isUsingPlaylist && effectiveChannelId) {
      console.log('[Settings API] No specific playlist configured, attempting to auto-detect sermons playlist...')
      
      const playlistsResult = await fetchChannelPlaylists(effectiveChannelId, apiKey, { maxResults: 50 })
      
      if (playlistsResult.playlists.length > 0) {
        // Log all playlists for debugging
        playlistsResult.playlists.forEach(playlist => {
          console.log(`[Settings API] Found playlist: "${playlist.title}" (${playlist.id})`)
        })
        
        const sermonsPlaylist = findSermonsPlaylist(playlistsResult.playlists)
        
        if (sermonsPlaylist) {
          console.log(`[Settings API] Found sermons playlist: "${sermonsPlaylist.title}" (${sermonsPlaylist.id})`)
          playlistId = sermonsPlaylist.id
          
          // Update settings with detected playlist
          setInMemoryYouTubeSettings({ playlistId })
        } else {
          console.log('[Settings API] No sermons playlist found on channel')
        }
      }
    }
    
    // Fetch channel details only if not using playlist
    let channelDetails = null
    if (!isUsingPlaylist && effectiveChannelId) {
      channelDetails = await fetchChannelDetails(effectiveChannelId, apiKey)
    }
    
    // Fetch all videos (from playlist or channel uploads)
    const fetchSource = playlistId ? `playlist: ${playlistId}` : `channel: ${effectiveChannelId}`
    console.log(`[Settings API] Fetching videos from: ${fetchSource}`)
    
    const videos = await fetchAllChannelVideos(
      effectiveChannelId,
      apiKey,
      { maxVideos: 500, maxResultsPerPage: 50, playlistId: playlistId || undefined }
    )
    
    const sermonVideos = videos.map(youTubeVideoToSermon)
    
    // Update cache
    setCachedYouTubeVideos(sermonVideos)
    setLastCacheUpdate(new Date())
    
    // Update in-memory settings with channel name and sync status
    setInMemoryYouTubeSettings({
      channelId: effectiveChannelId,
      channelName: channelDetails?.title || '',
      channelUrl: channelUrl || (effectiveChannelId ? `https://www.youtube.com/channel/${effectiveChannelId}` : ''),
      apiKey: apiKey,
      playlistId: playlistId,
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

// Use globalThis to persist settings across serverless function invocations
const globalForSettings = globalThis as unknown as {
  inMemorySettings: Record<string, unknown> | undefined
}

// Default settings fallback
const defaultSettings = {
  churchName: 'El-Shaddai Revival Centre',
  churchTagline: 'The Church Of Pentecost',
  logoUrl: 'https://pentecost.ca/wp-content/uploads/2025/03/The-Church-Pentecost-Logo-1.png',
  maintenanceMode: false,
  maintenanceMessage: ''
}

// Initialize global settings if not exists
if (!globalForSettings.inMemorySettings) {
  globalForSettings.inMemorySettings = { ...defaultSettings }
}

let inMemorySettings: Record<string, unknown> = globalForSettings.inMemorySettings

function getInMemorySettings() {
  return { 
    ...inMemorySettings,
    youtube: getInMemoryYouTubeSettings()
  }
}

function setInMemorySettings(settings: Partial<{ churchName: string; churchTagline: string; logoUrl: string; maintenanceMode: boolean; maintenanceMessage: string }>) {
  if (settings.churchName !== undefined) {
    inMemorySettings = { ...inMemorySettings, churchName: settings.churchName }
  }
  if (settings.churchTagline !== undefined) {
    inMemorySettings = { ...inMemorySettings, churchTagline: settings.churchTagline }
  }
  if (settings.logoUrl !== undefined) {
    inMemorySettings = { ...inMemorySettings, logoUrl: settings.logoUrl }
  }
  if (settings.maintenanceMode !== undefined) {
    inMemorySettings = { ...inMemorySettings, maintenanceMode: settings.maintenanceMode }
    // Also update the shared maintenance state for middleware
    setMaintenanceMode(settings.maintenanceMode, (inMemorySettings.maintenanceMessage as string) || '')
  }
  if (settings.maintenanceMessage !== undefined) {
    inMemorySettings = { ...inMemorySettings, maintenanceMessage: settings.maintenanceMessage }
    // Also update the shared maintenance message for middleware
    setMaintenanceMode((inMemorySettings.maintenanceMode as boolean) || false, settings.maintenanceMessage)
  }
  // Persist to global to survive across invocations
  globalForSettings.inMemorySettings = inMemorySettings
}

export async function GET() {
  try {
    // Get maintenance mode from shared module
    const maintenanceState = getMaintenanceMode()
    
    // Try Supabase first, fall back to in-memory
    const supabaseConfigured = isDbConfigured()
    
    if (supabaseConfigured) {
      try {
        const dbSettings = await settingsDb.get('site_settings')
        if (dbSettings && dbSettings.value) {
          return NextResponse.json({
            success: true,
            settings: {
              ...dbSettings.value,
              youtube: getInMemoryYouTubeSettings(),
              maintenanceMode: maintenanceState.enabled,
              maintenanceMessage: maintenanceState.message
            },
            isInMemoryMode: false,
            isSupabaseMode: true
          })
        }
      } catch (dbError) {
        console.error('[Settings API] Database error, falling back to in-memory:', dbError)
      }
    }
    
    // Fall back to in-memory settings
    return NextResponse.json({
      success: true,
      settings: {
        ...getInMemorySettings(),
        maintenanceMode: maintenanceState.enabled,
        maintenanceMessage: maintenanceState.message
      },
      isInMemoryMode: true,
      isSupabaseMode: false
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
    const { churchName, churchTagline, logoUrl, youtube, maintenanceMode, maintenanceMessage } = body

    // Try Supabase first, fall back to in-memory
    const supabaseConfigured = isDbConfigured()
    
    // Build settings object for Supabase
    const siteSettings: Record<string, unknown> = {}
    let useSupabase = false
    
    if (supabaseConfigured) {
      try {
        // Get existing settings from Supabase
        const existingSettings = await settingsDb.get('site_settings')
        const existingValue = existingSettings?.value || {}
        
        // Merge with new settings
        if (churchName !== undefined) {
          siteSettings.churchName = churchName || defaultSettings.churchName
        }
        if (churchTagline !== undefined) {
          siteSettings.churchTagline = churchTagline || defaultSettings.churchTagline
        }
        if (logoUrl !== undefined) {
          siteSettings.logoUrl = logoUrl || defaultSettings.logoUrl
        }
        
        // Save to Supabase
        await settingsDb.set('site_settings', {
          ...existingValue,
          ...siteSettings
        })
        
        useSupabase = true
        console.log('[Settings API] Settings saved to Supabase')
      } catch (dbError) {
        console.error('[Settings API] Database error, falling back to in-memory:', dbError)
      }
    }
    
    // Always update in-memory for immediate availability
    if (churchName !== undefined) {
      setInMemorySettings({ churchName: churchName || defaultSettings.churchName })
    }
    if (churchTagline !== undefined) {
      setInMemorySettings({ churchTagline: churchTagline || defaultSettings.churchTagline })
    }
    if (logoUrl !== undefined) {
      setInMemorySettings({ logoUrl: logoUrl || defaultSettings.logoUrl })
    }
    
    // Update maintenance mode settings (keep in sync)
    if (maintenanceMode !== undefined) {
      setInMemorySettings({ maintenanceMode: maintenanceMode })
    }
    if (maintenanceMessage !== undefined) {
      setInMemorySettings({ maintenanceMessage: maintenanceMessage })
    }
    
    // Update YouTube settings if explicitly provided (always in-memory for now)
    if (youtube !== undefined) {
      // First save the settings
      setInMemoryYouTubeSettings({
        channelId: youtube.channelId || '',
        channelName: youtube.channelName || '',
        channelUrl: youtube.channelUrl || '',
        apiKey: youtube.apiKey || '',
        playlistId: youtube.playlistId || '',  // Save the playlist ID
        autoSync: youtube.autoSync || false,
        syncInterval: youtube.syncInterval || 6,
        lastSync: youtube.lastSync ? new Date(youtube.lastSync) : null,
        syncStatus: youtube.syncStatus || 'idle',
        syncError: youtube.syncError || ''
      })
      
      // Auto-sync YouTube videos after saving settings (if channel info + API key OR playlistId are provided)
      const channelId = youtube.channelId || ''
      const channelUrl = youtube.channelUrl || ''
      const apiKey = youtube.apiKey || ''
      const playlistId = youtube.playlistId || ''  // Get playlist ID
      
      // Only auto-sync if we have channel info + API key OR just a playlist ID + API key
      if ((channelId || channelUrl || playlistId) && apiKey) {
        console.log('[Settings API] YouTube configuration detected, triggering auto-sync...')
        
        // Set status to syncing
        setInMemoryYouTubeSettings({
          syncStatus: 'syncing',
          syncError: ''
        })
        
        // Trigger sync (don't await - let it run in background)
        syncYouTubeVideos(channelId, channelUrl, apiKey, playlistId).then(syncResult => {
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
      message: useSupabase ? 'Settings updated successfully (Supabase)' : 'Settings updated successfully (In-Memory)',
      settings: getInMemorySettings(),
      isInMemoryMode: !useSupabase,
      isSupabaseMode: useSupabase
    }, { status: 200 })

  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    )
  }
}
