import { NextRequest, NextResponse } from 'next/server'
import { settingsDb, isDbConfigured } from '@/lib/db'
import {
  getInMemoryYouTubeSettings,
  setInMemoryYouTubeSettings,
  getCachedYouTubeVideos,
  setCachedYouTubeVideos,
  setLastCacheUpdate,
  youTubeConfigFromJson,
  youTubeConfigToJson,
  deriveIsYoutubeConfigured
} from '@/lib/youtubeStorage'
import { mergeYoutubeFromAdminPost, persistYoutubeSiteSettings } from '@/lib/persistSiteSettingsYoutube'
import {
  fetchChannelDetails,
  fetchAllChannelVideos,
  youTubeVideoToSermon,
  extractChannelId,
  getChannelIdFromUsername,
  resolveSermonsPlaylistId,
  YOUTUBE_NO_SERMONS_PLAYLIST_HINT
} from '@/lib/youtube'
import { getMaintenanceMode, parseMaintenanceEnabled, parseMaintenanceMessage, setMaintenanceMode } from '@/lib/maintenance'

// Auto-sync YouTube videos function
async function syncYouTubeVideos(channelId: string, channelUrl: string, apiKey: string, playlistIdIn: string = ''): Promise<{ success: boolean; videosCount: number; error?: string }> {
  try {
    let effectiveChannelId = channelId || ''
    let playlistId = (playlistIdIn || '').trim()
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

    if (!isUsingPlaylist && !effectiveChannelId) {
      return { success: false, videosCount: 0, error: 'Could not resolve channel ID' }
    }

    if (!apiKey) {
      return { success: false, videosCount: 0, error: 'API key required' }
    }

    if (!isUsingPlaylist && effectiveChannelId) {
      console.log('[Settings API] Resolving Sermons playlist on channel...')
      const detected = await resolveSermonsPlaylistId(effectiveChannelId, apiKey)
      if (!detected) {
        return { success: false, videosCount: 0, error: YOUTUBE_NO_SERMONS_PLAYLIST_HINT }
      }
      playlistId = detected
      setInMemoryYouTubeSettings({ playlistId })
    }

    if (!playlistId) {
      return {
        success: false,
        videosCount: 0,
        error:
          'No sermons playlist. Ensure your channel has a public playlist named "Sermons" or paste a playlist URL in settings.'
      }
    }

    let channelDetails = null
    if (effectiveChannelId) {
      channelDetails = await fetchChannelDetails(effectiveChannelId, apiKey)
    }

    console.log(`[Settings API] Fetching videos from playlist: ${playlistId}`)

    const videos = await fetchAllChannelVideos(effectiveChannelId, apiKey, {
      maxVideos: 500,
      maxResultsPerPage: 50,
      playlistId
    })

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

    await persistYoutubeSiteSettings()

    console.log(`[Settings API] Auto-synced ${sermonVideos.length} YouTube videos`)
    return { success: true, videosCount: sermonVideos.length }

  } catch (error) {
    console.error('[Settings API] YouTube sync error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    setInMemoryYouTubeSettings({
      syncStatus: 'error',
      syncError: errorMessage
    })
    await persistYoutubeSiteSettings()
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
  const base = {
    ...inMemorySettings,
    youtube: getInMemoryYouTubeSettings()
  } as Record<string, unknown>
  return {
    ...base,
    isYoutubeConfigured: deriveIsYoutubeConfigured(base)
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
    const maintenanceState = getMaintenanceMode()
    
    const supabaseConfigured = isDbConfigured()
    
    if (supabaseConfigured) {
      try {
        const dbSettings = await settingsDb.get('site_settings')
        if (dbSettings && dbSettings.value) {
          const value = dbSettings.value as Record<string, unknown>
          const maintenanceMode = parseMaintenanceEnabled(value.maintenanceMode)
          const maintenanceMessage = parseMaintenanceMessage(value.maintenanceMessage)
          setMaintenanceMode(maintenanceMode, maintenanceMessage)

          if (value.youtube != null) {
            setInMemoryYouTubeSettings(youTubeConfigFromJson(value.youtube))
          }

          const mergedForFlag = {
            ...value,
            youtube: getInMemoryYouTubeSettings()
          } as Record<string, unknown>
          const isYoutubeConfigured = deriveIsYoutubeConfigured(mergedForFlag)

          return NextResponse.json({
            success: true,
            settings: {
              ...dbSettings.value,
              youtube: getInMemoryYouTubeSettings(),
              isYoutubeConfigured,
              maintenanceMode,
              maintenanceMessage
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
      {
        success: true,
        settings: { ...defaultSettings, isYoutubeConfigured: false },
        isDefault: true
      },
      { status: 200 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { churchName, churchTagline, logoUrl, youtube, maintenanceMode, maintenanceMessage } = body

    const supabaseConfigured = isDbConfigured()

    let existingValue: Record<string, unknown> = {}
    if (supabaseConfigured) {
      try {
        const existingSettings = await settingsDb.get('site_settings')
        existingValue = (existingSettings?.value || {}) as Record<string, unknown>
      } catch (loadError) {
        console.error('[Settings API] Failed to load site_settings:', loadError)
      }
    }

    let mergedYoutube: ReturnType<typeof mergeYoutubeFromAdminPost> | null = null
    if (youtube !== undefined) {
      mergedYoutube = mergeYoutubeFromAdminPost(
        youtube as Record<string, unknown>,
        existingValue.youtube !== undefined ? existingValue.youtube : getInMemoryYouTubeSettings()
      )
    }

    const siteSettings: Record<string, unknown> = {}
    let useSupabase = false

    if (supabaseConfigured) {
      try {
        if (churchName !== undefined) {
          siteSettings.churchName = churchName || defaultSettings.churchName
        }
        if (churchTagline !== undefined) {
          siteSettings.churchTagline = churchTagline || defaultSettings.churchTagline
        }
        if (logoUrl !== undefined) {
          siteSettings.logoUrl = logoUrl || defaultSettings.logoUrl
        }
        if (maintenanceMode !== undefined) {
          siteSettings.maintenanceMode = parseMaintenanceEnabled(maintenanceMode)
        }
        if (maintenanceMessage !== undefined) {
          siteSettings.maintenanceMessage = maintenanceMessage || ''
        }
        if (mergedYoutube) {
          siteSettings.youtube = youTubeConfigToJson(mergedYoutube)
        }

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

    if (churchName !== undefined) {
      setInMemorySettings({ churchName: churchName || defaultSettings.churchName })
    }
    if (churchTagline !== undefined) {
      setInMemorySettings({ churchTagline: churchTagline || defaultSettings.churchTagline })
    }
    if (logoUrl !== undefined) {
      setInMemorySettings({ logoUrl: logoUrl || defaultSettings.logoUrl })
    }

    if (maintenanceMode !== undefined) {
      setInMemorySettings({ maintenanceMode: parseMaintenanceEnabled(maintenanceMode) })
    }
    if (maintenanceMessage !== undefined) {
      setInMemorySettings({ maintenanceMessage: maintenanceMessage })
    }

    if (mergedYoutube) {
      setInMemoryYouTubeSettings(mergedYoutube)

      const { channelId, channelUrl, apiKey, playlistId } = mergedYoutube

      if ((channelId || channelUrl || playlistId) && apiKey) {
        console.log('[Settings API] YouTube configuration detected, triggering auto-sync...')

        setInMemoryYouTubeSettings({
          syncStatus: 'syncing',
          syncError: ''
        })

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
