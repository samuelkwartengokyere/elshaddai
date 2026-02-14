import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/database'
import Settings, { ISettings } from '@/models/Settings'

// Timeout for requests
const TIMEOUT_MS = 5000

// Default settings fallback
const defaultSettings = {
  churchName: 'El-Shaddai Revival Centre',
  churchTagline: 'The Church Of Pentecost',
  logoUrl: 'https://pentecost.ca/wp-content/uploads/2025/03/The-Church-Pentecost-Logo-1.png'
}

// In-memory fallback storage (for development without MongoDB)
let inMemorySettings: Record<string, unknown> = { ...defaultSettings }
type YouTubeSyncStatus = 'idle' | 'syncing' | 'success' | 'error'
let inMemoryYouTubeSettings: {
  channelId: string
  channelName: string
  channelUrl: string
  apiKey: string
  autoSync: boolean
  syncInterval: number
  lastSync: Date | null
  syncStatus: YouTubeSyncStatus
  syncError: string
} = {
  channelId: '',
  channelName: '',
  channelUrl: '',
  apiKey: '',
  autoSync: false,
  syncInterval: 6,
  lastSync: null,
  syncStatus: 'idle',
  syncError: ''
}

function getInMemorySettings() {
  return { 
    ...inMemorySettings,
    youtube: inMemoryYouTubeSettings
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

function setInMemoryYouTubeSettings(youtube: Record<string, unknown> | undefined) {
  if (youtube === undefined) return
  
  const yt = youtube ?? {}
  inMemoryYouTubeSettings = {
    channelId: (yt.channelId as string) ?? inMemoryYouTubeSettings.channelId,
    channelName: (yt.channelName as string) ?? inMemoryYouTubeSettings.channelName,
    channelUrl: (yt.channelUrl as string) ?? inMemoryYouTubeSettings.channelUrl,
    apiKey: (yt.apiKey as string) ?? inMemoryYouTubeSettings.apiKey,
    autoSync: (yt.autoSync as boolean) ?? inMemoryYouTubeSettings.autoSync,
    syncInterval: (yt.syncInterval as number) ?? inMemoryYouTubeSettings.syncInterval,
    lastSync: yt.lastSync && typeof yt.lastSync === 'object' && 'toISOString' in yt.lastSync ? yt.lastSync as unknown as Date : inMemoryYouTubeSettings.lastSync,
    syncStatus: (yt.syncStatus as YouTubeSyncStatus) ?? inMemoryYouTubeSettings.syncStatus,
    syncError: (yt.syncError as string) ?? inMemoryYouTubeSettings.syncError
  }
}

export async function GET() {
  try {
    const dbConnection = await connectDB()
    
    if (!dbConnection) {
      // Return in-memory settings when database is not available
      return NextResponse.json({
        success: true,
        settings: getInMemorySettings(),
        isInMemoryMode: true
      })
    }
    
    // Use timeout for the query
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS)
    
    try {
      let settings = await Settings.findOne().lean().maxTimeMS(TIMEOUT_MS - 1000)
      
      clearTimeout(timeoutId)
      
      if (!settings) {
        // Create default settings if none exist
        settings = new Settings(defaultSettings)
        await settings.save()
      }
      
      return NextResponse.json({
        success: true,
        settings,
        isDefault: false
      })
    } catch (queryError) {
      clearTimeout(timeoutId)
      if (queryError instanceof Error && queryError.name === 'AbortError') {
        console.error('Settings API request timed out')
        return NextResponse.json({
          success: true,
          settings: defaultSettings,
          isDefault: true,
          message: 'Database timeout, using default settings'
        })
      }
      throw queryError
    }

  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json(
      { success: true, settings: defaultSettings, isDefault: true },
      { status: 200 } // Return success with defaults even on error
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const dbConnection = await connectDB()
    
    const body = await request.json()
    const { churchName, churchTagline, logoUrl, youtube } = body
    
    // Build settings object - only update fields that are provided
    const newSettings: Record<string, unknown> = {}
    
    if (churchName !== undefined) {
      newSettings.churchName = churchName || defaultSettings.churchName
    }
    if (churchTagline !== undefined) {
      newSettings.churchTagline = churchTagline || defaultSettings.churchTagline
    }
    if (logoUrl !== undefined) {
      newSettings.logoUrl = logoUrl || defaultSettings.logoUrl
    }
    
    // Only update youtube settings if explicitly provided
    if (youtube !== undefined) {
      newSettings.youtube = {
        channelId: youtube.channelId || '',
        channelName: youtube.channelName || '',
        channelUrl: youtube.channelUrl || '',
        apiKey: youtube.apiKey || '',
        autoSync: youtube.autoSync || false,
        syncInterval: youtube.syncInterval || 6,
        lastSync: youtube.lastSync || null,
        syncStatus: youtube.syncStatus || 'idle',
        syncError: youtube.syncError || ''
      }
    }
    
    if (!dbConnection) {
      // Use in-memory fallback when database is not available
      // Only update the fields that were explicitly provided
      if (churchName !== undefined) {
        setInMemorySettings({ churchName: churchName || defaultSettings.churchName })
      }
      if (churchTagline !== undefined) {
        setInMemorySettings({ churchTagline: churchTagline || defaultSettings.churchTagline })
      }
      if (logoUrl !== undefined) {
        setInMemorySettings({ logoUrl: logoUrl || defaultSettings.logoUrl })
      }
      // Only update YouTube settings if explicitly provided
      if (youtube !== undefined) {
        setInMemoryYouTubeSettings(youtube)
      }
      
      return NextResponse.json({
        success: true,
        message: 'Settings updated successfully (in-memory mode - database not available)',
        settings: getInMemorySettings(),
        isInMemoryMode: true
      }, { status: 200 })
    }
    
    // Build the update object for MongoDB - use $set for explicit updates
    const updateObject: Record<string, unknown> = {}
    if (churchName !== undefined) updateObject.churchName = churchName || defaultSettings.churchName
    if (churchTagline !== undefined) updateObject.churchTagline = churchTagline || defaultSettings.churchTagline
    if (logoUrl !== undefined) updateObject.logoUrl = logoUrl || defaultSettings.logoUrl
    if (youtube !== undefined) {
      updateObject.youtube = {
        channelId: youtube.channelId || '',
        channelName: youtube.channelName || '',
        channelUrl: youtube.channelUrl || '',
        apiKey: youtube.apiKey || '',
        autoSync: youtube.autoSync || false,
        syncInterval: youtube.syncInterval || 6,
        lastSync: youtube.lastSync || null,
        syncStatus: youtube.syncStatus || 'idle',
        syncError: youtube.syncError || ''
      }
    }
    
    // Upsert settings (update if exists, create if not)
    const settings = await Settings.findOneAndUpdate(
      {},
      { $set: updateObject },
      { new: true, upsert: true, runValidators: true }
    ).lean()
    
    return NextResponse.json({
      success: true,
      message: 'Settings updated successfully',
      settings
    }, { status: 200 })

  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    )
  }
}

