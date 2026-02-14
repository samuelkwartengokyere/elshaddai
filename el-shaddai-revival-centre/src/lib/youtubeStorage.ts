// Shared in-memory storage for YouTube settings
// This is used when no database is available (e.g., Vercel serverless without MongoDB)

export interface YouTubeConfigType {
  channelId: string
  channelName: string
  channelUrl: string
  apiKey: string
  autoSync: boolean
  syncInterval: number
  lastSync: Date | null
  syncStatus: 'idle' | 'syncing' | 'success' | 'error'
  syncError: string
}

export const defaultYouTubeSettings: YouTubeConfigType = {
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

// In-memory fallback for YouTube settings (shared between Settings API and YouTube sync API)
// This is a module-level variable that persists within a single serverless function invocation
let inMemoryYouTubeSettings: YouTubeConfigType = { ...defaultYouTubeSettings }

export function getInMemoryYouTubeSettings(): YouTubeConfigType {
  return inMemoryYouTubeSettings
}

export function setInMemoryYouTubeSettings(settings: Partial<YouTubeConfigType>): void {
  inMemoryYouTubeSettings = {
    ...inMemoryYouTubeSettings,
    ...settings
  }
}

// In-memory cache for YouTube videos
export interface YouTubeCacheItem {
  id: string
  _id?: string
  title: string
  speaker: string
  date: string
  description: string
  thumbnail: string
  videoUrl: string
  embedUrl: string
  audioUrl: string | null
  duration: string
  durationSeconds: number
  series: string | null
  biblePassage: string | null
  tags: string[]
  isYouTube: boolean
  viewCount: string
}

let cachedYouTubeVideos: YouTubeCacheItem[] = []
let lastCacheUpdate: Date | null = null

export function getCachedYouTubeVideos(): YouTubeCacheItem[] {
  return cachedYouTubeVideos
}

export function setCachedYouTubeVideos(videos: YouTubeCacheItem[]): void {
  cachedYouTubeVideos = videos
}

export function getLastCacheUpdate(): Date | null {
  return lastCacheUpdate
}

export function setLastCacheUpdate(date: Date): void {
  lastCacheUpdate = date
}

export function clearYouTubeCache(): void {
  cachedYouTubeVideos = []
  lastCacheUpdate = null
}

