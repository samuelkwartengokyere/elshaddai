/**
 * YouTube Data API Service
 * Fetches videos from YouTube channels for sermon display
 */

import axios from 'axios'

// YouTube API configuration
const YOUTUBE_API_BASE_URL = 'https://www.googleapis.com/youtube/v3'

export interface YouTubeVideo {
  id: string
  title: string
  description: string
  thumbnailUrl: string
  videoUrl: string
  embedUrl: string
  channelTitle: string
  publishedAt: string
  duration: string
  durationSeconds: number
  viewCount: string
}

export interface YouTubeChannel {
  id: string
  title: string
  description: string
  thumbnailUrl: string
  subscriberCount: string
  videoCount: string
}

/**
 * Extract video ID from various YouTube URL formats
 */
export function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) {
      return match[1] || match[0]
    }
  }
  return null
}

/**
 * Extract channel ID from YouTube URL
 * Returns the actual channel ID (UC...) or null if URL requires API lookup
 */
export function extractChannelId(url: string): string | null {
  // Direct channel ID format (UC...)
  if (/^[a-zA-Z0-9_-]{22,24}$/.test(url)) {
    return url
  }

  // Extract channel ID from /channel/ URLs (UC...)
  const channelMatch = url.match(/youtube\.com\/channel\/([a-zA-Z0-9_-]+)/)
  if (channelMatch) {
    return channelMatch[1]
  }

  // For @username, /c/, or /user/ URLs, we need to call API to get channel ID
  // Return null so the caller knows to use getChannelIdFromUsername
  return null
}

/**
 * Get channel ID from username using YouTube API
 */
export async function getChannelIdFromUsername(username: string, apiKey: string): Promise<string | null> {
  try {
    const response = await axios.get(`${YOUTUBE_API_BASE_URL}/channels`, {
      params: {
        part: 'id',
        forHandle: username.replace('@', ''),
        key: apiKey
      }
    })

    if (response.data.items && response.data.items.length > 0) {
      return response.data.items[0].id
    }
    return null
  } catch (error) {
    console.error('Error getting channel ID from username:', error)
    return null
  }
}

/**
 * Convert YouTube duration format (PT#H#M#S) to human readable
 */
export function formatDuration(duration: string): string {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
  if (!match) return duration

  const hours = match[1] ? parseInt(match[1]) : 0
  const minutes = match[2] ? parseInt(match[2]) : 0
  const seconds = match[3] ? parseInt(match[3]) : 0

  const parts = []
  if (hours > 0) parts.push(`${hours}h`)
  if (minutes > 0) parts.push(`${minutes}m`)
  if (seconds > 0 && hours === 0) parts.push(`${seconds}s`)

  return parts.join(' ') || '0s'
}

/**
 * Convert YouTube duration to seconds
 */
export function durationToSeconds(duration: string): number {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
  if (!match) return 0

  const hours = match[1] ? parseInt(match[1]) : 0
  const minutes = match[2] ? parseInt(match[2]) : 0
  const seconds = match[3] ? parseInt(match[3]) : 0

  return hours * 3600 + minutes * 60 + seconds
}

/**
 * YouTube API response interfaces
 */
interface YouTubeAPIResponseItem {
  id?: { videoId?: string } | string
  snippet?: {
    title?: string
    description?: string
    thumbnails?: {
      high?: { url?: string }
      medium?: { url?: string }
      default?: { url?: string }
    }
    channelTitle?: string
    publishedAt?: string
  }
  contentDetails?: {
    duration?: string
    videoId?: string
  }
  statistics?: {
    viewCount?: string
  }
}

/**
 * Transform YouTube API response to our Sermon format
 */
export function transformYouTubeVideo(video: YouTubeAPIResponseItem): YouTubeVideo {
  let videoId = ''
  if (typeof video.id === 'object' && video.id !== null) {
    videoId = video.id.videoId || ''
  } else if (typeof video.id === 'string') {
    videoId = video.id
  }
  const snippet = video.snippet || {}

  return {
    id: videoId,
    title: snippet.title || '',
    description: snippet.description || '',
    thumbnailUrl: snippet.thumbnails?.high?.url || snippet.thumbnails?.medium?.url || snippet.thumbnails?.default?.url || '',
    videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
    embedUrl: `https://www.youtube.com/embed/${videoId}`,
    channelTitle: snippet.channelTitle || '',
    publishedAt: snippet.publishedAt || '',
    duration: video.contentDetails?.duration || '',
    durationSeconds: video.contentDetails?.duration ? durationToSeconds(video.contentDetails.duration) : 0,
    viewCount: video.statistics?.viewCount || '0'
  }
}

/**
 * Fetch channel details from YouTube
 */
export async function fetchChannelDetails(channelId: string, apiKey: string): Promise<YouTubeChannel | null> {
  try {
    const response = await axios.get(`${YOUTUBE_API_BASE_URL}/channels`, {
      params: {
        part: 'snippet,statistics',
        id: channelId,
        key: apiKey
      }
    })

    const channel = response.data.items?.[0]
    if (!channel) return null

    return {
      id: channel.id,
      title: channel.snippet.title,
      description: channel.snippet.description,
      thumbnailUrl: channel.snippet.thumbnails?.high?.url || channel.snippet.thumbnails?.medium?.url || '',
      subscriberCount: channel.statistics?.subscriberCount || '0',
      videoCount: channel.statistics?.videoCount || '0'
    }
  } catch (error) {
    console.error('Error fetching YouTube channel:', error)
    return null
  }
}

/**
 * Fetch latest videos from a YouTube channel
 */
export async function fetchChannelVideos(
  channelId: string,
  apiKey: string,
  options: {
    maxResults?: number
    order?: 'date' | 'viewCount' | 'rating'
    type?: 'video' | 'playlist' | 'all'
  } = {}
): Promise<YouTubeVideo[]> {
  const { maxResults = 20, order = 'date', type = 'video' } = options

  try {
    // First, get the channel's uploads playlist ID
    const channelResponse = await axios.get(`${YOUTUBE_API_BASE_URL}/channels`, {
      params: {
        part: 'contentDetails',
        id: channelId,
        key: apiKey
      }
    })

    const channel = channelResponse.data.items?.[0]
    if (!channel) {
      console.error('Channel not found')
      return []
    }

    const uploadsPlaylistId = channel.contentDetails.relatedPlaylists?.uploads
    if (!uploadsPlaylistId) {
      console.error('No uploads playlist found')
      return []
    }

    // Fetch videos from the uploads playlist
    const playlistResponse = await axios.get(`${YOUTUBE_API_BASE_URL}/playlistItems`, {
      params: {
        part: 'snippet,contentDetails',
        playlistId: uploadsPlaylistId,
        maxResults,
        key: apiKey
      }
    })

    const videoIds = playlistResponse.data.items
      .map((item: { contentDetails?: { videoId?: string } }) => item.contentDetails?.videoId || '')
      .filter(Boolean)
      .join(',')

    if (!videoIds) return []

    // Get video details including duration
    const videosResponse = await axios.get(`${YOUTUBE_API_BASE_URL}/videos`, {
      params: {
        part: 'snippet,contentDetails,statistics',
        id: videoIds,
        key: apiKey
      }
    })

    return videosResponse.data.items.map(transformYouTubeVideo)
  } catch (error) {
    console.error('Error fetching YouTube videos:', error)
    return []
  }
}

/**
 * Search for videos on YouTube (alternative method without channel ID)
 */
export async function searchVideos(
  query: string,
  apiKey: string,
  options: {
    maxResults?: number
    order?: 'date' | 'viewCount' | 'relevance'
    channelId?: string
  } = {}
): Promise<YouTubeVideo[]> {
  const { maxResults = 20, order = 'date', channelId } = options

  try {
    const searchParams: Record<string, string | number | boolean | undefined> = {
      part: 'snippet',
      q: query,
      maxResults,
      order,
      type: 'video',
      key: apiKey
    }

    if (channelId) {
      searchParams.channelId = channelId
    }

    const response = await axios.get(`${YOUTUBE_API_BASE_URL}/search`, {
      params: searchParams
    })

    const videoIds = response.data.items
      .map((item: { id?: { videoId?: string } | string }) => {
        const idValue = item.id
        if (typeof idValue === 'object' && idValue !== null) {
          return idValue.videoId || ''
        }
        return idValue || ''
      })
      .filter((id: string) => id.length > 0)
      .join(',')

    if (!videoIds) return []

    // Get video details
    const videosResponse = await axios.get(`${YOUTUBE_API_BASE_URL}/videos`, {
      params: {
        part: 'snippet,contentDetails,statistics',
        id: videoIds,
        key: apiKey
      }
    })

    return videosResponse.data.items.map(transformYouTubeVideo)
  } catch (error) {
    console.error('Error searching YouTube videos:', error)
    return []
  }
}

/**
 * Transform YouTube video to sermon format for frontend
 */
export function youTubeVideoToSermon(video: YouTubeVideo) {
  return {
    id: `youtube_${video.id}`,
    _id: `youtube_${video.id}`,
    title: video.title,
    speaker: video.channelTitle,
    date: new Date(video.publishedAt).toISOString(),
    description: video.description,
    thumbnail: video.thumbnailUrl,
    videoUrl: video.videoUrl,
    embedUrl: video.embedUrl,
    audioUrl: null, // YouTube doesn't provide audio download
    duration: formatDuration(video.duration),
    durationSeconds: video.durationSeconds,
    series: null,
    biblePassage: null,
    tags: ['youtube'],
    isYouTube: true,
    viewCount: video.viewCount
  }
}

/**
 * Get embed HTML for a YouTube video
 */
export function getEmbedHtml(videoId: string, options: {
  autoplay?: boolean
  modestBranding?: boolean
} = {}): string {
  const { autoplay = false, modestBranding = true } = options
  const params = new URLSearchParams({
    autoplay: autoplay ? '1' : '0',
    modestbranding: modestBranding ? '1' : '0',
    rel: '0',
    iv_load_policy: '3'
  })

  return `<iframe 
    width="100%" 
    height="100%" 
    src="https://www.youtube.com/embed/${videoId}?${params.toString()}" 
    frameborder="0" 
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
    allowfullscreen
  ></iframe>`
}

export default {
  extractVideoId,
  extractChannelId,
  formatDuration,
  durationToSeconds,
  transformYouTubeVideo,
  fetchChannelDetails,
  fetchChannelVideos,
  searchVideos,
  youTubeVideoToSermon,
  getEmbedHtml
}

