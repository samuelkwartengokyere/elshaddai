import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/database'
import Settings from '@/models/Settings'
import { fetchChannelDetails, fetchChannelVideos, youTubeVideoToSermon } from '@/lib/youtube'

// In-memory cache for YouTube videos (for development without MongoDB)
let cachedYouTubeVideos: any[] = []
let lastCacheUpdate: Date | null = null
const CACHE_DURATION_MS = 5 * 60 * 1000 // 5 minutes

// GET - Fetch cached YouTube videos or sync status
export async function GET(request: NextRequest) {
  try {
    const dbConnection = await connectDB()
    const searchParams = request.nextUrl.searchParams
    const forceRefresh = searchParams.get('refresh') === 'true'
    
    // Get settings
    let settings: any = null
    
    if (dbConnection) {
      try {
        settings = await Settings.findOne().lean()
      } catch (error) {
        console.error('Database error:', error)
      }
    }

    // Check if YouTube is configured
    const youtubeConfig = settings?.youtube || {
      channelId: '',
      apiKey: ''
    }

    if (!youtubeConfig.channelId) {
      return NextResponse.json({
        success: false,
        error: 'YouTube channel not configured',
        videos: [],
        configured: false
      }, { status: 400 })
    }

    // Check cache
    const now = new Date()
    const cacheExpired = !lastCacheUpdate || 
      (now.getTime() - lastCacheUpdate.getTime()) > CACHE_DURATION_MS

    if (!forceRefresh && cachedYouTubeVideos.length > 0 && !cacheExpired) {
      return NextResponse.json({
        success: true,
        videos: cachedYouTubeVideos,
        cached: true,
        lastUpdate: lastCacheUpdate,
        configured: true
      })
    }

    // Fetch videos from YouTube
    if (youtubeConfig.apiKey) {
      const videos = await fetchChannelVideos(
        youtubeConfig.channelId,
        youtubeConfig.apiKey,
        { maxResults: 50 }
      )

      // Transform to sermon format
      cachedYouTubeVideos = videos.map(youTubeVideoToSermon)
      lastCacheUpdate = now

      // Update sync status in database
      if (dbConnection) {
        await Settings.findOneAndUpdate(
          {},
          {
            'youtube.lastSync': new Date(),
            'youtube.syncStatus': 'success',
            'youtube.syncError': ''
          }
        )
      }

      return NextResponse.json({
        success: true,
        videos: cachedYouTubeVideos,
        cached: false,
        lastUpdate: lastCacheUpdate,
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
    const dbConnection = await connectDB()
    const body = await request.json()
    
    const { channelId, apiKey, channelUrl } = body

    if (!channelId) {
      return NextResponse.json({
        success: false,
        error: 'Channel ID is required'
      }, { status: 400 })
    }

    // Update settings with new channel info
    if (dbConnection) {
      await Settings.findOneAndUpdate(
        {},
        {
          'youtube.channelId': channelId,
          'youtube.channelUrl': channelUrl || `https://www.youtube.com/channel/${channelId}`,
          'youtube.apiKey': apiKey || '',
          'youtube.syncStatus': 'syncing',
          'youtube.syncError': ''
        },
        { upsert: true }
      )
    }

    // If no API key, we can't fetch videos
    if (!apiKey) {
      // Clear cache and mark as needing API key
      cachedYouTubeVideos = []
      
      if (dbConnection) {
        await Settings.findOneAndUpdate(
          {},
          {
            'youtube.syncStatus': 'idle',
            'youtube.syncError': 'API key required for video sync'
          }
        )
      }

      return NextResponse.json({
        success: true,
        message: 'Channel configured. Add API key to enable video sync.',
        videosSynced: 0,
        needsApiKey: true
      })
    }

    // Fetch channel details first
    const channelDetails = await fetchChannelDetails(channelId, apiKey)
    
    // Fetch videos
    const videos = await fetchChannelVideos(channelId, apiKey, { maxResults: 50 })
    const sermonVideos = videos.map(youTubeVideoToSermon)

    // Update cache
    cachedYouTubeVideos = sermonVideos
    lastCacheUpdate = new Date()

    // Update settings with channel name and sync status
    if (dbConnection) {
      await Settings.findOneAndUpdate(
        {},
        {
          'youtube.channelName': channelDetails?.title || '',
          'youtube.channelId': channelId,
          'youtube.channelUrl': channelUrl || `https://www.youtube.com/channel/${channelId}`,
          'youtube.apiKey': apiKey,
          'youtube.lastSync': new Date(),
          'youtube.syncStatus': 'success',
          'youtube.syncError': ''
        },
        { upsert: true }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'YouTube videos synced successfully',
      channel: channelDetails,
      videosSynced: sermonVideos.length,
      videos: sermonVideos
    })

  } catch (error) {
    console.error('YouTube sync error:', error)
    
    // Update error status in database
    try {
      await connectDB()
      await Settings.findOneAndUpdate(
        {},
        {
          'youtube.syncStatus': 'error',
          'youtube.syncError': error instanceof Error ? error.message : 'Unknown error'
        },
        { upsert: true }
      )
    } catch (dbError) {
      console.error('Failed to update sync status:', dbError)
    }

    return NextResponse.json({
      success: false,
      error: 'Failed to sync YouTube videos',
      videosSynced: 0
    }, { status: 500 })
  }
}

// DELETE - Clear YouTube cache
export async function DELETE() {
  cachedYouTubeVideos = []
  lastCacheUpdate = null

  return NextResponse.json({
    success: true,
    message: 'YouTube cache cleared'
  })
}

