import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/database'
import Settings from '@/models/Settings'

// In-memory cache for live stream status
let cachedLiveStatus: {
  isLive: boolean
  streamInfo: {
    title: string
    viewerCount: number
    scheduledStartTime?: string
    actualStartTime?: string
  } | null
  lastUpdate: Date | null
} | null = null
let lastCacheUpdate: Date | null = null
const CACHE_DURATION_MS = 5 * 60 * 1000 // 5 minutes cache

// YouTube API base URL
const YOUTUBE_API_BASE_URL = 'https://www.googleapis.com/youtube/v3'

interface YouTubeConfigType {
  channelId?: string
  apiKey?: string
}

// Fetch live stream status from YouTube API
async function fetchLiveStreamStatus(
  channelId: string,
  apiKey: string
): Promise<{
  isLive: boolean
  streamInfo: {
    title: string
    viewerCount: number
    scheduledStartTime?: string
    actualStartTime?: string
  } | null
  error?: string
}> {
  try {
    // Fetch live broadcasts for the channel
    const response = await fetch(
      `${YOUTUBE_API_BASE_URL}/liveBroadcasts?` +
        new URLSearchParams({
          part: 'snippet,statistics,contentDetails',
          broadcastType: 'all',
          maxResults: '1',
          channelId,
          key: apiKey
        }),
      {
        next: { revalidate: 60 } // Cache for 60 seconds
      }
    )

    if (!response.ok) {
      // Return structured error instead of throwing
      const errorText = await response.text().catch(() => 'Unknown error')
      console.warn(`YouTube API returned status ${response.status}: ${errorText}`)
      
      return {
        isLive: false,
        streamInfo: null,
        error: `YouTube API error: ${response.status}`
      }
    }

    const data = await response.json()

    // Check if there's an active live broadcast
    if (data.items && data.items.length > 0) {
      const broadcast = data.items[0]
      const snippet = broadcast.snippet
      const statistics = broadcast.statistics
      const isLive = broadcast.status?.lifeCycleStatus === 'live' || 
                     snippet?.liveBroadcastContent === 'live'

      if (isLive) {
        return {
          isLive: true,
          streamInfo: {
            title: snippet?.title || 'Live Stream',
            viewerCount: parseInt(statistics?.viewerCount || '0'),
            scheduledStartTime: snippet?.scheduledStartTime,
            actualStartTime: snippet?.actualStartTime
          }
        }
      }
    }

    // No live broadcast found
    return {
      isLive: false,
      streamInfo: null
    }
  } catch (error) {
    console.error('Error fetching live stream status:', error)
    return {
      isLive: false,
      streamInfo: null,
      error: error instanceof Error ? error.message : 'Unknown error fetching live status'
    }
  }
}

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
        lastUpdate: lastCacheUpdate
      })
    }

    // Try to connect to database for settings
    let settings: Record<string, unknown> | null = null

    try {
      const dbConnection = await connectDB()
      if (dbConnection) {
        settings = await Settings.findOne().lean() as Record<string, unknown> | null
      }
    } catch (error) {
      console.error('Database connection error:', error)
    }

    // Get YouTube configuration
    const youtubeConfig = (settings?.youtube as YouTubeConfigType) || {
      channelId: process.env.NEXT_PUBLIC_YOUTUBE_CHANNEL_ID || '',
      apiKey: process.env.YOUTUBE_API_KEY || ''
    }

    const channelId = youtubeConfig.channelId || process.env.NEXT_PUBLIC_YOUTUBE_CHANNEL_ID
    const apiKey = youtubeConfig.apiKey || process.env.YOUTUBE_API_KEY

    // Check if YouTube is configured
    if (!channelId || !apiKey) {
      // Return fallback based on time if not configured
      return NextResponse.json({
        success: false,
        isLive: false,
        configured: false,
        error: 'YouTube API not configured',
        fallback: getTimeBasedLiveStatus(),
        message: 'Add YouTube API credentials to enable live status'
      })
    }

    // Fetch live status from YouTube API
    try {
      const liveStatus = await fetchLiveStreamStatus(channelId, apiKey)

      // Handle API errors gracefully
      if (liveStatus.error) {
        console.warn('YouTube API error:', liveStatus.error)
        // Fallback to time-based detection if API fails
        const fallbackStatus = getTimeBasedLiveStatus()
        
        return NextResponse.json({
          success: true,
          isLive: fallbackStatus.isLive,
          configured: true,
          fallback: true,
          apiError: liveStatus.error,
          streamInfo: fallbackStatus.isLive ? {
            title: 'Service in Progress',
            viewerCount: estimateViewerCount(fallbackStatus.serviceType || ''),
            scheduledStartTime: fallbackStatus.scheduledTime || ''
          } : null
        })
      }

      // Update cache
      cachedLiveStatus = {
        isLive: liveStatus.isLive,
        streamInfo: liveStatus.streamInfo,
        lastUpdate: now
      }
      lastCacheUpdate = now

      return NextResponse.json({
        success: true,
        isLive: liveStatus.isLive,
        streamInfo: liveStatus.streamInfo,
        cached: false,
        lastUpdate: now
      })
    } catch (error) {
      console.error('Error fetching live stream status:', error)
      // Fallback to time-based detection if API fails
      const fallbackStatus = getTimeBasedLiveStatus()
      
      return NextResponse.json({
        success: true,
        isLive: fallbackStatus.isLive,
        configured: true,
        fallback: true,
        streamInfo: fallbackStatus.isLive ? {
          title: 'Service in Progress',
          viewerCount: estimateViewerCount(fallbackStatus.serviceType || ''),
          scheduledStartTime: fallbackStatus.scheduledTime || ''
        } : null
      })
    }

  } catch (error) {
    console.error('Error fetching live stream status:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch live stream status',
      fallback: getTimeBasedLiveStatus()
    }, { status: 500 })
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

