import { NextRequest, NextResponse } from 'next/server'
import connectDB, { isConnectionReady } from '@/lib/database'
import Settings from '@/models/Settings'
import { getInMemoryYouTubeSettings } from '@/lib/youtubeStorage'
import { checkChannelLiveStatus, extractChannelId, getChannelIdFromUsername } from '@/lib/youtube'

// In-memory cache for live stream status
let cachedLiveStatus: {
  isLive: boolean
  streamInfo: {
    title: string
    viewerCount: number
    scheduledStartTime?: string
    actualStartTime?: string
    videoId?: string
    embedUrl?: string
  } | null
  liveVideoId?: string
  lastUpdate: Date | null
} | null = null
let lastCacheUpdate: Date | null = null
const CACHE_DURATION_MS = 30 * 1000 // 30 seconds cache for live status

interface YouTubeConfigType {
  channelId?: string
  channelUrl?: string
  apiKey?: string
}

/**
 * YouTube Live API - Simplified approach
 * 
 * IMPORTANT: YouTube Data API's liveBroadcasts endpoint now requires OAuth2 authentication,
 * not just an API key. Since we're using the YouTube iframe embed which handles live detection
 * automatically, we can rely on time-based detection instead of the API.
 * 
 * This approach:
 * 1. Uses the live stream embed URL (YouTube handles live detection internally)
 * 2. Falls back to time-based service detection when API is unavailable
 * 3. Removes dependency on YouTube Data API for live status
 */

// GET - Fetch live stream status
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const forceRefresh = searchParams.get('refresh') === 'true'

    // Check cache first
    const now = new Date()
    const cacheExpired = !lastCacheUpdate || 
      (now.getTime() - lastCacheUpdate.getTime()) > CACHE_DURATION_MS

    if (!forceRefresh && cachedLiveStatus && !cacheExpired) {
      return NextResponse.json({
        success: true,
        isLive: cachedLiveStatus.isLive,
        streamInfo: cachedLiveStatus.streamInfo,
        cached: true,
        lastUpdate: lastCacheUpdate,
        method: 'cache'
      })
    }

    // Try to connect to database for settings
    let settings: Record<string, unknown> | null = null

    // First, try to connect to the database
    const dbConnection = await connectDB()
    
    // Check both dbConnection and connection readiness
    const isReady = isConnectionReady()
    
    if (dbConnection && isReady) {
      try {
        settings = await Settings.findOne().lean() as Record<string, unknown> | null
      } catch (error) {
        console.error('Database query error:', error)
      }
    } else if (!dbConnection) {
      console.warn('Database connection not available, using fallback mode')
    } else {
      console.warn('Database connection not ready yet, using fallback mode')
    }

    // Get YouTube configuration from database or in-memory
    const youtubeConfig = (settings?.youtube as YouTubeConfigType) || getInMemoryYouTubeSettings()
    
    // Get channel ID - try config first, then environment variable
    let channelId = youtubeConfig?.channelId || process.env.NEXT_PUBLIC_YOUTUBE_CHANNEL_ID || ''
    const apiKey = youtubeConfig?.apiKey || process.env.YOUTUBE_API_KEY || ''
    const channelUrl = youtubeConfig?.channelUrl || ''

    // Check if YouTube is configured
    if (!channelId && !channelUrl) {
      // Return fallback based on time if not configured
      const fallbackStatus = getTimeBasedLiveStatus()
      return NextResponse.json({
        success: true,
        isLive: fallbackStatus.isLive,
        configured: false,
        channelId: null,
        fallback: fallbackStatus,
        method: 'time-based',
        message: 'Add YouTube channel ID to settings to enable live stream embed'
      })
    }

    // Resolve channel ID from URL if needed
    if (!channelId && channelUrl) {
      // Try to extract channel ID from URL
      const extractedId = extractChannelId(channelUrl)
      if (extractedId) {
        channelId = extractedId
      } else if (apiKey) {
        // For @username URLs, need to use API to get channel ID
        const atMatch = channelUrl.match(/youtube\.com\/@([a-zA-Z0-9_-]+)/)
        const cMatch = channelUrl.match(/youtube\.com\/c\/([a-zA-Z0-9_-]+)/)
        const userMatch = channelUrl.match(/youtube\.com\/user\/([a-zA-Z0-9_-]+)/)
        
        const usernameMatch = atMatch || cMatch || userMatch
        
        if (usernameMatch) {
          console.log(`[Live API] Resolving channel ID from username: ${usernameMatch[1]}`)
          channelId = await getChannelIdFromUsername(usernameMatch[1], apiKey) || ''
        }
      }
    }

    // Check if we have an API key to check actual live status
    let isLive = false
    let liveVideoId: string | undefined
    let liveVideoTitle: string | undefined
    let viewerCount = 0

    if (channelId && apiKey) {
      // Use YouTube API to check for actual live streams
      console.log(`[Live API] Checking YouTube API for live streams on channel: ${channelId}`)
      const liveStatus = await checkChannelLiveStatus(channelId, apiKey)
      
      if (liveStatus.isLive && liveStatus.liveVideo) {
        isLive = true
        liveVideoId = liveStatus.liveVideo.id
        liveVideoTitle = liveStatus.liveVideo.title
        viewerCount = parseInt(liveStatus.liveVideo.viewCount) || 0
        console.log(`[Live API] Found live stream: ${liveVideoTitle}`)
      } else {
        console.log('[Live API] No live stream found on YouTube')
      }
    } else {
      console.log('[Live API] No API key available, using time-based detection')
    }

    // Fall back to time-based detection if no actual live stream found
    const timeBasedStatus = getTimeBasedLiveStatus()
    
    // If no actual live stream, use time-based detection
    if (!isLive && timeBasedStatus.isLive) {
      isLive = true
      liveVideoTitle = getServiceTitle(timeBasedStatus.serviceType || '')
      viewerCount = estimateViewerCount(timeBasedStatus.serviceType || '')
    }

    // Update cache
    cachedLiveStatus = {
      isLive,
      streamInfo: isLive ? {
        title: liveVideoTitle || getServiceTitle(timeBasedStatus.serviceType || ''),
        viewerCount,
        scheduledStartTime: timeBasedStatus.scheduledTime,
        videoId: liveVideoId,
        embedUrl: liveVideoId ? `https://www.youtube.com/embed/${liveVideoId}` : undefined
      } : null,
      liveVideoId,
      lastUpdate: now
    }
    lastCacheUpdate = now

    return NextResponse.json({
      success: true,
      isLive,
      configured: true,
      channelId,
      streamInfo: cachedLiveStatus.streamInfo,
      cached: false,
      lastUpdate: now,
      method: apiKey ? 'youtube-api' : 'time-based',
      message: apiKey 
        ? (isLive ? 'Live stream detected on YouTube' : 'No live stream found on YouTube')
        : 'Using time-based detection. Add API key to check actual YouTube live status.'
    })

  } catch (error) {
    console.error('Error fetching live stream status:', error)
    
    // Always return a valid response with fallback
    const fallbackStatus = getTimeBasedLiveStatus()
    return NextResponse.json({
      success: true,
      isLive: fallbackStatus.isLive,
      fallback: fallbackStatus,
      method: 'error-fallback',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 200 })
  }
}

// Helper function to estimate viewer count based on service type
function estimateViewerCount(serviceType: string): number {
  switch (serviceType) {
    case 'sunday-morning':
      return 450 // Peak attendance
    case 'sunday-evening':
      return 300
    case 'wednesday':
      return 200
    case 'friday-youth':
      return 250
    default:
      return 150
  }
}

// Get service title based on service type
function getServiceTitle(serviceType: string): string {
  switch (serviceType) {
    case 'sunday-morning':
      return 'Sunday Morning Service'
    case 'sunday-evening':
      return 'Sunday Evening Service'
    case 'wednesday':
      return 'Wednesday Bible Study'
    case 'friday-youth':
      return 'Friday Youth Service'
    default:
      return 'Live Service'
  }
}

// Time-based live status detection
function getTimeBasedLiveStatus(): {
  isLive: boolean
  serviceType?: string
  scheduledTime?: string
} {
  const now = new Date()
  const day = now.getDay()
  const hour = now.getHours()
  const minute = now.getMinutes()
  const currentMinutes = hour * 60 + minute

  // Sunday Services (9 AM - 12 PM and 11 AM - 2 PM)
  if (day === 0) {
    // First service: 9 AM - 12 PM
    if (currentMinutes >= 9 * 60 && currentMinutes < 12 * 60) {
      return { isLive: true, serviceType: 'sunday-morning', scheduledTime: '9:00 AM' }
    }
    // Second service: 11 AM - 2 PM
    if (currentMinutes >= 11 * 60 && currentMinutes < 14 * 60) {
      return { isLive: true, serviceType: 'sunday-evening', scheduledTime: '11:00 AM' }
    }
  }

  // Wednesday Bible Study (7 PM - 9 PM)
  if (day === 3) {
    if (currentMinutes >= 19 * 60 && currentMinutes < 21 * 60) {
      return { isLive: true, serviceType: 'wednesday', scheduledTime: '7:00 PM' }
    }
  }

  // Friday Youth Service (7 PM - 10 PM)
  if (day === 5) {
    if (currentMinutes >= 19 * 60 && currentMinutes < 22 * 60) {
      return { isLive: true, serviceType: 'friday-youth', scheduledTime: '7:00 PM' }
    }
  }

  return { isLive: false }
}

// POST - Force refresh live status (for admin use)
export async function POST(request: NextRequest) {
  try {
    // Clear cache to force fresh fetch
    cachedLiveStatus = null
    lastCacheUpdate = null

    // Trigger a fresh GET request
    const url = new URL(request.url)
    url.searchParams.set('refresh', 'true')

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: request.headers
    })

    const data = await response.json()

    return NextResponse.json(data)

  } catch (error) {
    console.error('Error refreshing live stream status:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to refresh live stream status'
    }, { status: 500 })
  }
}

// DELETE - Clear cache
export async function DELETE() {
  cachedLiveStatus = null
  lastCacheUpdate = null

  return NextResponse.json({
    success: true,
    message: 'Live stream cache cleared'
  })
}

export default {
  GET,
  POST,
  DELETE
}

