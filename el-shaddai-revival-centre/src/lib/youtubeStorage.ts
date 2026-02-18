// Shared in-memory storage for YouTube settings
// This is used when no database is available (e.g., Vercel serverless without MongoDB)

// Use globalThis to persist across serverless function invocations within the same container
// This ensures settings are not lost between requests in serverless environments

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

// Global in-memory fallback for YouTube settings (shared between Settings API and YouTube sync API)
// Uses globalThis to persist within a single serverless function container
// This prevents settings from being lost between serverless invocations
const globalForYouTubeSettings = globalThis as unknown as {
  inMemoryYouTubeSettings: YouTubeConfigType | undefined
}

if (!globalForYouTubeSettings.inMemoryYouTubeSettings) {
  globalForYouTubeSettings.inMemoryYouTubeSettings = { ...defaultYouTubeSettings }
}

let inMemoryYouTubeSettings: YouTubeConfigType = globalForYouTubeSettings.inMemoryYouTubeSettings

export function getInMemoryYouTubeSettings(): YouTubeConfigType {
  return inMemoryYouTubeSettings
}

export function setInMemoryYouTubeSettings(settings: Partial<YouTubeConfigType>): void {
  inMemoryYouTubeSettings = {
    ...inMemoryYouTubeSettings,
    ...settings
  }
  // Also update global reference to persist across invocations
  globalForYouTubeSettings.inMemoryYouTubeSettings = inMemoryYouTubeSettings
}

// In-memory cache for YouTube videos - also use globalThis for persistence
const globalForYouTubeCache = globalThis as unknown as {
  cachedYouTubeVideos: YouTubeCacheItem[]
  lastCacheUpdate: Date | null
}

if (!globalForYouTubeCache.cachedYouTubeVideos) {
  globalForYouTubeCache.cachedYouTubeVideos = []
}

if (!globalForYouTubeCache.lastCacheUpdate) {
  globalForYouTubeCache.lastCacheUpdate = null
}

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

let cachedYouTubeVideos: YouTubeCacheItem[] = globalForYouTubeCache.cachedYouTubeVideos
let lastCacheUpdate: Date | null = globalForYouTubeCache.lastCacheUpdate

export function getCachedYouTubeVideos(): YouTubeCacheItem[] {
  return cachedYouTubeVideos
}

export function setCachedYouTubeVideos(videos: YouTubeCacheItem[]): void {
  cachedYouTubeVideos = videos
  lastCacheUpdate = new Date()
  // Update global references to persist across invocations
  globalForYouTubeCache.cachedYouTubeVideos = cachedYouTubeVideos
  globalForYouTubeCache.lastCacheUpdate = lastCacheUpdate
}

export function getLastCacheUpdate(): Date | null {
  return lastCacheUpdate
}

export function setLastCacheUpdate(date: Date): void {
  lastCacheUpdate = date
  globalForYouTubeCache.lastCacheUpdate = lastCacheUpdate
}

export function clearYouTubeCache(): void {
  cachedYouTubeVideos = []
  lastCacheUpdate = null
  globalForYouTubeCache.cachedYouTubeVideos = cachedYouTubeVideos
  globalForYouTubeCache.lastCacheUpdate = lastCacheUpdate
}

