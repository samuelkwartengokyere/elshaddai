/** First-party analytics: sanitize paths sent from the client before storage. */

const STATIC_EXT = /\.(ico|png|jpg|jpeg|gif|webp|svg|css|js|map|woff2?|ttf|pdf)$/i

export function shouldSkipAnalyticsPath(pathname: string): boolean {
  if (!pathname.startsWith('/')) return true
  if (pathname.startsWith('/admin')) return true
  if (pathname.startsWith('/financial-report')) return true
  if (pathname === '/maintenance') return true
  if (pathname.startsWith('/_next')) return true
  if (STATIC_EXT.test(pathname)) return true
  return false
}

/**
 * Normalize and validate pathname (no query/hash). Returns null if invalid or excluded.
 */
export function sanitizePathForAnalytics(input: unknown): string | null {
  if (typeof input !== 'string' || !input.trim()) return null

  try {
    let raw = decodeURIComponent(input.trim()).split('?')[0].split('#')[0]
    if (!raw.startsWith('/')) raw = `/${raw}`

    const segments = raw.split('/').filter((s) => s && s !== '.' && s !== '..')
    let path = segments.length === 0 ? '/' : `/${segments.join('/')}`

    if (path.length > 512) path = path.slice(0, 512)
    if (shouldSkipAnalyticsPath(path)) return null

    return path
  } catch {
    return null
  }
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

/** Client-supplied visitor id (localStorage); must be UUID to be stored. */
export function sanitizeVisitorKeyForAnalytics(input: unknown): string | null {
  if (typeof input !== 'string') return null
  const t = input.trim()
  if (!t || t.length > 48) return null
  return UUID_RE.test(t) ? t : null
}

/** Normalize full referrer URL to hostname only (lowercase). */
export function normalizeReferrerHostFromClient(input: unknown): string {
  if (typeof input !== 'string' || !input.trim()) return ''
  try {
    const u = new URL(input.trim())
    return u.hostname.toLowerCase().slice(0, 253)
  } catch {
    return ''
  }
}
