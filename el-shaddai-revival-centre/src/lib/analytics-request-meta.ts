import type { NextRequest } from 'next/server'
import { UAParser } from 'ua-parser-js'

/** CDN / edge headers that expose rough country (ISO 3166-1 alpha-2 when 2 chars). */
const COUNTRY_HEADERS = [
  'cf-ipcountry',
  'x-vercel-ip-country',
  'CloudFront-Viewer-Country',
  'x-appengine-country',
] as const

function normalizeCountry(raw: string | undefined): string {
  if (!raw) return 'Unknown'
  const v = raw.trim()
  if (!v) return 'Unknown'
  const upper = v.toUpperCase()
  if (upper.length === 2 && /^[A-Z]{2}$/.test(upper) && upper !== 'XX') return upper
  if (v.length <= 56) return v.slice(0, 56)
  return v.slice(0, 56)
}

/**
 * Best-effort country from request headers (no IP database).
 * On local dev this is usually "Unknown" unless you inject headers.
 */
export function getCountryHintFromRequest(request: NextRequest): string {
  for (const h of COUNTRY_HEADERS) {
    const v = request.headers.get(h)
    const n = normalizeCountry(v || undefined)
    if (n !== 'Unknown') return n
  }
  return 'Unknown'
}

function labelFromDeviceType(t: string | undefined): string {
  if (t === 'mobile') return 'mobile'
  if (t === 'tablet') return 'tablet'
  if (t === 'smarttv') return 'smarttv'
  if (t === 'wearable') return 'wearable'
  if (t === 'console') return 'console'
  if (t === 'embedded') return 'embedded'
  return 'desktop'
}

export function deriveDeviceOsFromUa(ua: string | null | undefined): {
  deviceType: string
  osName: string
} {
  const s = ua || ''
  const parser = new UAParser(s || undefined)
  const osNameRaw = parser.getOS().name || 'Unknown'
  let deviceType = labelFromDeviceType(parser.getDevice().type)

  if (/\b(bot|crawler|spider|googlebot|bingbot|slurp|duckduckbot|baiduspider|yandexbot|facebookexternalhit|slackbot|discordbot|twitterbot|linkedinbot)\b/i.test(s)) {
    deviceType = 'bot'
  }

  return {
    deviceType,
    osName: osNameRaw.replace(/\s+/g, ' ').trim().slice(0, 64) || 'Unknown',
  }
}

/** Used by `/api/analytics/track` — server-only metadata for one page view row. */
export function buildAnalyticsVisitMeta(request: NextRequest): {
  country: string
  deviceType: string
  osName: string
} {
  const ua = request.headers.get('user-agent')
  const { deviceType, osName } = deriveDeviceOsFromUa(ua)
  return {
    country: getCountryHintFromRequest(request),
    deviceType,
    osName,
  }
}
