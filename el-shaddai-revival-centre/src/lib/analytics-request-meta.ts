import type { NextRequest } from 'next/server'
import { UAParser } from 'ua-parser-js'

/** CDN / edge headers that expose rough country (ISO 3166-1 alpha-2 when 2 chars). */
const COUNTRY_HEADERS = [
  'cf-ipcountry',
  'x-vercel-ip-country',
  'CloudFront-Viewer-Country',
  'x-appengine-country',
] as const

/** Unknown / non-geographic placeholder codes sometimes sent by CDNs (not real countries). */
const NON_COUNTRY_CODES = new Set([
  'XX',
  'ZZ',
  'T1',
  'A1', // anonymous proxy (legacy geo DBs)
  'A2', // satellite
])

function normalizeCountry(raw: string | undefined): string {
  if (!raw) return 'Unknown'
  const v = raw.trim()
  if (!v) return 'Unknown'
  const upper = v.toUpperCase()
  if (upper.length === 2 && /^[A-Z]{2}$/.test(upper)) {
    if (NON_COUNTRY_CODES.has(upper)) return 'Unknown'
    return upper
  }
  // Edge headers should only ever send ISO alpha-2; ignore anything else (city, region, names).
  return 'Unknown'
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

/** Browser / in-app label (Umami-style: Chrome, Mobile Safari, Facebook, …). */
export function deriveBrowserNameFromUa(ua: string | null | undefined): string {
  const s = ua || ''
  if (/\bFBAN|FBAV|FBIOS|FB4A|FB_IAB\b/i.test(s)) return 'Facebook'
  if (/\bInstagram\b/i.test(s)) return 'Instagram'
  if (/\bLine\/\b/i.test(s)) return 'Line'

  const parser = new UAParser(s || undefined)
  const nameRaw = parser.getBrowser().name?.replace(/\s+/g, ' ').trim() || ''
  const deviceType = labelFromDeviceType(parser.getDevice().type)
  const isMobileSafari =
    nameRaw === 'Mobile Safari' ||
    (nameRaw === 'Safari' && (deviceType === 'mobile' || deviceType === 'tablet'))

  if (isMobileSafari) return 'Mobile Safari'
  if (!nameRaw || nameRaw === 'WebKit') {
    const engine = parser.getEngine().name || ''
    if (/blink/i.test(engine)) return 'Chrome'
    return 'Unknown'
  }

  return nameRaw.slice(0, 64)
}

/**
 * Chromium often sends a frozen/reduced User-Agent with no browser name.
 * Prefer brands from the Sec-CH-UA header when UA parsing yields nothing useful.
 */
export function parseBrowserFromSecChUa(secChUaHeader: string | null | undefined): string | null {
  if (!secChUaHeader?.trim()) return null
  for (const part of secChUaHeader.split(',')) {
    const m = part.trim().match(/^"([^"]+)"\s*;\s*v=\s*"/i)
    if (!m) continue
    const brand = m[1].trim()
    const lower = brand.toLowerCase().replace(/\s+/g, ' ')
    if (lower === 'not)a;brand' || lower.includes('not a brand') || lower.startsWith('not_')) continue
    if (lower === 'chromium') continue
    if (lower === 'google chrome') return 'Chrome'
    if (lower === 'microsoft edge') return 'Edge'
    if (lower === 'opera') return 'Opera'
    if (lower === 'brave') return 'Brave'
    if (lower === 'safari') return 'Safari'
    if (lower === 'samsung internet') return 'Samsung Internet'
    return brand.slice(0, 64)
  }
  return null
}

/** BCP 47 region from a locale tag; only ISO 3166-1 alpha-2 (same rules as CDN hints). */
export function countryFromDeviceLocaleTag(localeTag: string | null | undefined): string | null {
  if (!localeTag?.trim()) return null
  try {
    if (typeof Intl !== 'undefined' && typeof Intl.Locale === 'function') {
      const loc = new Intl.Locale(localeTag.trim())
      if (loc.region && /^[a-z]{2}$/i.test(loc.region)) {
        const n = normalizeCountry(loc.region)
        return n === 'Unknown' ? null : n
      }
    }
  } catch {
    /* ignore */
  }
  return null
}

export type AnalyticsTrackClientExtras = {
  /** When the edge strips or shortens User-Agent, the client sends the full string. */
  clientUserAgent?: string | null
  /** `Intl`/navigator locale tag (e.g. en-GH); region used only if geo headers are missing. */
  localeTag?: string | null
}

/** Used by `/api/analytics/track` — server-only metadata for one page view row. */
export function buildAnalyticsVisitMeta(
  request: NextRequest,
  clientExtras?: AnalyticsTrackClientExtras
): {
  country: string
  deviceType: string
  osName: string
  browserName: string
} {
  const serverUa = request.headers.get('user-agent')?.trim() || ''
  const clientUa =
    typeof clientExtras?.clientUserAgent === 'string'
      ? clientExtras.clientUserAgent.trim().slice(0, 768)
      : ''
  /** Prefer client navigator.userAgent when sent — matches uaparser expectations; edge may differ slightly. */
  const ua = clientUa || serverUa || null

  const { deviceType, osName } = deriveDeviceOsFromUa(ua)
  let browserName = deriveBrowserNameFromUa(ua)
  if (browserName === 'Unknown') {
    const fromCh = parseBrowserFromSecChUa(request.headers.get('sec-ch-ua'))
    if (fromCh) browserName = fromCh
  }

  let country = getCountryHintFromRequest(request)
  if (country === 'Unknown' && clientExtras?.localeTag) {
    const fromLoc = countryFromDeviceLocaleTag(clientExtras.localeTag)
    if (fromLoc) country = fromLoc
  }

  return {
    country,
    deviceType,
    osName,
    browserName,
  }
}
