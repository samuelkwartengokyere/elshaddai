'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { shouldSkipAnalyticsPath } from '@/lib/analytics'

/**
 * Sends one lightweight page-view event per public route navigation.
 */
export default function AnalyticsTracker() {
  const pathname = usePathname()

  useEffect(() => {
    if (!pathname || shouldSkipAnalyticsPath(pathname)) return

    fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: pathname }),
      keepalive: true,
    }).catch(() => {})

    // Strict Mode may invoke twice in dev; acceptable for aggregated counts.
  }, [pathname])

  return null
}
