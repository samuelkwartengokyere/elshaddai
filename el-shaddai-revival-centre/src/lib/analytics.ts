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
