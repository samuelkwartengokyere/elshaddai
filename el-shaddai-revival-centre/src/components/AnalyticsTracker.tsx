'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { shouldSkipAnalyticsPath } from '@/lib/analytics'

const VISITOR_STORAGE_KEY = 'erc_analytics_vid'

function getOrCreateVisitorKey(): string {
  if (typeof window === 'undefined') return ''
  try {
    let k = localStorage.getItem(VISITOR_STORAGE_KEY)
    if (!k || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(k)) {
      k = crypto.randomUUID()
      localStorage.setItem(VISITOR_STORAGE_KEY, k)
    }
    return k
  } catch {
    return ''
  }
}

function crossOriginReferrer(): string {
  if (typeof document === 'undefined') return ''
  const ref = document.referrer?.trim()
  if (!ref) return ''
  try {
    const u = new URL(ref)
    if (u.origin === window.location.origin) return ''
    return ref.slice(0, 2048)
  } catch {
    return ''
  }
}

/** BCP 47 tag for weak country hint when the host has no geo headers (see buildAnalyticsVisitMeta). */
function deviceLocaleTag(): string {
  if (typeof window === 'undefined') return ''
  try {
    const tag = Intl.DateTimeFormat().resolvedOptions().locale || navigator.language || ''
    return tag.slice(0, 64)
  } catch {
    return (navigator.language || '').slice(0, 64)
  }
}

/**
 * Sends one lightweight page-view event per public route navigation.
 */
export default function AnalyticsTracker() {
  const pathname = usePathname()

  useEffect(() => {
    if (!pathname || shouldSkipAnalyticsPath(pathname)) return

    const visitorKey = getOrCreateVisitorKey()
    const referrer = crossOriginReferrer()
    const locale = deviceLocaleTag()
    const clientUserAgent =
      typeof navigator !== 'undefined' && navigator.userAgent ? navigator.userAgent.slice(0, 768) : ''

    fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        path: pathname,
        ...(visitorKey ? { visitorKey } : {}),
        ...(referrer ? { referrer } : {}),
        ...(clientUserAgent ? { clientUserAgent } : {}),
        ...(locale ? { locale } : {}),
      }),
      keepalive: true,
    }).catch(() => {})

    // Strict Mode may invoke twice in dev; acceptable for aggregated counts.
  }, [pathname])

  return null
}
