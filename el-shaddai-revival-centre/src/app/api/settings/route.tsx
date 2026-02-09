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
let inMemorySettings = { ...defaultSettings }
let inMemoryYouTubeSettings = {
  channelId: '',
  channelName: '',
  channelUrl: '',
  apiKey: '',
  autoSync: false,
  syncInterval: 6,
  lastSync: null,
  syncStatus: 'idle' as const,
  syncError: ''
}

function getInMemorySettings() {
  return { 
    ...inMemorySettings,
    youtube: inMemoryYouTubeSettings
  }
}

function setInMemorySettings(settings: Partial<typeof defaultSettings>) {
  inMemorySettings = { ...inMemorySettings, ...settings }
}

function setInMemoryYouTubeSettings(youtube: any) {
  inMemoryYouTubeSettings = {
    channelId: youtube?.channelId || '',
    channelName: youtube?.channelName || '',
    channelUrl: youtube?.channelUrl || '',
    apiKey: youtube?.apiKey || '',
    autoSync: youtube?.autoSync || false,
    syncInterval: youtube?.syncInterval || 6,
    lastSync: youtube?.lastSync || null,
    syncStatus: youtube?.syncStatus || 'idle',
    syncError: youtube?.syncError || ''
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
    
    const newSettings = {
      churchName: churchName || defaultSettings.churchName,
      churchTagline: churchTagline || defaultSettings.churchTagline,
      logoUrl: logoUrl || defaultSettings.logoUrl,
      youtube: youtube ? {
        channelId: youtube.channelId || '',
        channelName: youtube.channelName || '',
        channelUrl: youtube.channelUrl || '',
        apiKey: youtube.apiKey || '',
        autoSync: youtube.autoSync || false,
        syncInterval: youtube.syncInterval || 6,
        lastSync: youtube.lastSync || null,
        syncStatus: youtube.syncStatus || 'idle',
        syncError: youtube.syncError || ''
      } : undefined
    }
    
    if (!dbConnection) {
      // Use in-memory fallback when database is not available
      setInMemorySettings({ churchName, churchTagline, logoUrl })
      // Store YouTube settings in memory as well
      setInMemoryYouTubeSettings(youtube)
      
      return NextResponse.json({
        success: true,
        message: 'Settings updated successfully (in-memory mode - database not available)',
        settings: getInMemorySettings(),
        isInMemoryMode: true
      }, { status: 200 })
    }
    
    // Upsert settings (update if exists, create if not)
    const settings = await Settings.findOneAndUpdate(
      {},
      newSettings,
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

