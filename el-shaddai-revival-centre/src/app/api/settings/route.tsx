import { NextRequest, NextResponse } from 'next/server'
import { 
  getInMemoryYouTubeSettings, 
  setInMemoryYouTubeSettings 
} from '@/lib/youtubeStorage'

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
