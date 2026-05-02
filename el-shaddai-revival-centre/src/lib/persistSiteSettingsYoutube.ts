import { isDbConfigured, settingsDb } from '@/lib/db'
import {
  getInMemoryYouTubeSettings,
  youTubeConfigFromJson,
  youTubeConfigToJson,
  type YouTubeConfigType
} from '@/lib/youtubeStorage'

/** Merge admin POST body into stored YouTube config (empty apiKey keeps the saved key). */
export function mergeYoutubeFromAdminPost(
  incoming: Record<string, unknown>,
  existingYoutubeJson: unknown
): YouTubeConfigType {
  const prev = youTubeConfigFromJson(existingYoutubeJson)
  const apiKey =
    typeof incoming.apiKey === 'string' && incoming.apiKey.trim() !== ''
      ? incoming.apiKey.trim()
      : prev.apiKey
  const lastIncoming = incoming.lastSync
  const st = incoming.syncStatus
  const syncStatus: YouTubeConfigType['syncStatus'] =
    st === 'idle' || st === 'syncing' || st === 'success' || st === 'error'
      ? st
      : prev.syncStatus
  return {
    channelId: incoming.channelId !== undefined ? String(incoming.channelId) : prev.channelId,
    channelName: incoming.channelName !== undefined ? String(incoming.channelName) : prev.channelName,
    channelUrl: incoming.channelUrl !== undefined ? String(incoming.channelUrl) : prev.channelUrl,
    apiKey,
    playlistId: incoming.playlistId !== undefined ? String(incoming.playlistId) : prev.playlistId,
    autoSync: incoming.autoSync !== undefined ? Boolean(incoming.autoSync) : prev.autoSync,
    syncInterval:
      incoming.syncInterval !== undefined
        ? Number(incoming.syncInterval) || prev.syncInterval
        : prev.syncInterval,
    lastSync:
      lastIncoming != null && lastIncoming !== ''
        ? new Date(String(lastIncoming))
        : prev.lastSync,
    syncStatus,
    syncError: incoming.syncError !== undefined ? String(incoming.syncError) : prev.syncError
  }
}

/**
 * Writes current in-memory YouTube settings into `site_settings` so they survive deploys and cold starts.
 */
export async function persistYoutubeSiteSettings(config?: YouTubeConfigType): Promise<void> {
  if (!isDbConfigured()) return
  try {
    const snapshot = config ?? getInMemoryYouTubeSettings()
    const existing = await settingsDb.get('site_settings')
    const existingValue = (existing?.value || {}) as Record<string, unknown>
    await settingsDb.set('site_settings', {
      ...existingValue,
      youtube: youTubeConfigToJson(snapshot)
    })
  } catch (e) {
    console.error('[persistYoutubeSiteSettings] Failed to save YouTube config:', e)
  }
}
