'use client'

import { useState, useEffect } from 'react'
import { BarChart2 } from 'lucide-react'

export interface WebsiteAnalyticsSnapshot {
  loaded: boolean
  configured: boolean
  legacyDailyOnly?: boolean
  message?: string
  totalLast7Days: number
  totalLast30Days: number
  byDay: { day: string; views: number }[]
  topPaths: { path: string; views: number }[]
  byCountry: { label: string; views: number }[]
  byDevice: { label: string; views: number }[]
  byOs: { label: string; views: number }[]
  recentEvents: {
    occurredAt: string
    path: string
    country: string
    deviceType: string
    osName: string
  }[]
}

interface WebsiteAnalyticsPanelProps {
  showCardHeading?: boolean
}

const INITIAL: WebsiteAnalyticsSnapshot = {
  loaded: false,
  configured: true,
  totalLast7Days: 0,
  totalLast30Days: 0,
  byDay: [],
  topPaths: [],
  byCountry: [],
  byDevice: [],
  byOs: [],
  recentEvents: [],
}

function formatVisitTime(iso: string): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
}

function formatBreakdownLabel(label: string): string {
  if (!label || label === 'Unknown') return label || 'Unknown'
  if (/^[a-z]{2}$/i.test(label) && label.length === 2) return label.toUpperCase()
  if (label.length <= 3 && label === label.toUpperCase()) return label
  const lower = label.toLowerCase()
  return lower.replace(/\b[a-z]/g, (ch) => ch.toUpperCase())
}

function BarList({
  rows,
  labelHeading,
}: {
  rows: { label: string; views: number }[]
  labelHeading: string
}) {
  if (rows.length === 0) return null
  const maxV = Math.max(1, ...rows.map((r) => r.views))
  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-700 mb-3">{labelHeading}</h3>
      <div className="space-y-2">
        {rows.map((row, i) => (
          <div key={`${row.label}-${i}`} className="flex items-center gap-3 text-sm">
            <span className="w-28 sm:w-32 shrink-0 text-gray-600 truncate" title={row.label}>
              {formatBreakdownLabel(row.label) || '—'}
            </span>
            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden min-w-0">
              <div
                className="h-full bg-violet-500 rounded-full transition-all"
                style={{ width: `${(row.views / maxV) * 100}%` }}
              />
            </div>
            <span className="w-14 text-right text-gray-800 font-medium tabular-nums shrink-0">
              {row.views.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function WebsiteAnalyticsPanel({
  showCardHeading = true,
}: WebsiteAnalyticsPanelProps) {
  const [analytics, setAnalytics] = useState<WebsiteAnalyticsSnapshot>(INITIAL)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const res = await fetch('/api/admin/analytics', { credentials: 'include' })
        if (!res.ok) {
          if (!cancelled) setAnalytics({ ...INITIAL, loaded: true })
          return
        }
        const payload = await res.json()
        const d = payload?.data
        if (!cancelled && payload?.success && d) {
          setAnalytics({
            loaded: true,
            configured: payload.configured !== false,
            legacyDailyOnly: payload.legacyDailyOnly === true,
            message: payload.message,
            totalLast7Days: d.totalLast7Days ?? 0,
            totalLast30Days: d.totalLast30Days ?? 0,
            byDay: d.byDay ?? [],
            topPaths: d.topPaths ?? [],
            byCountry: d.byCountry ?? [],
            byDevice: d.byDevice ?? [],
            byOs: d.byOs ?? [],
            recentEvents: d.recentEvents ?? [],
          })
          return
        }
        if (!cancelled) setAnalytics({ ...INITIAL, loaded: true })
      } catch {
        if (!cancelled) setAnalytics({ ...INITIAL, loaded: true })
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  if (!analytics.loaded) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-48 mb-6" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="h-24 bg-gray-100 rounded-lg" />
          <div className="h-24 bg-gray-100 rounded-lg" />
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      {showCardHeading && (
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h2 className="text-xl font-bold text-gray-800 flex items-center">
            <BarChart2 className="h-5 w-5 mr-2 text-indigo-600" />
            Website analytics
          </h2>
          <p className="text-xs text-gray-500">
            Visitor hints from headers &amp; User-Agent (UTC day rollups below)
          </p>
        </div>
      )}

      {analytics.legacyDailyOnly && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-900">
          {analytics.message ||
            'Upgrade: run SUPABASE_MIGRATION-ANALYTICS-EVENTS.sql to record country, device, OS, and exact visit times.'}
        </div>
      )}

      {!analytics.configured && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-900">
          {analytics.message ||
            'Run migrations in Supabase: SUPABASE_MIGRATION-ANALYTICS.sql and SUPABASE_MIGRATION-ANALYTICS-EVENTS.sql (see SQL Editor).'}
        </div>
      )}

      {!analytics.legacyDailyOnly && analytics.configured && (
        <details className="text-xs text-gray-500 mb-4 group [&_summary]:cursor-pointer [&_summary]:list-none [&_summary::-webkit-details-marker]:hidden">
          <summary className="text-gray-600 hover:text-gray-800 underline decoration-dotted underline-offset-2">
            How location, device &amp; OS are detected
          </summary>
          <p className="mt-2 pl-0 leading-relaxed">
            Country comes from CDN/host headers only (first header that is set):{' '}
            <code className="text-gray-700">cf-ipcountry</code>,{' '}
            <code className="text-gray-700">x-vercel-ip-country</code>,{' '}
            <code className="text-gray-700">CloudFront-Viewer-Country</code>,{' '}
            <code className="text-gray-700">x-appengine-country</code>. Local dev usually has none →{' '}
            <code className="text-gray-700">Unknown</code>; we do not run IP geo lookups. Device/OS use the
            visitor <code className="text-gray-700">User-Agent</code>.
          </p>
        </details>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-100">
          <p className="text-sm text-indigo-700 font-medium">Last 7 days</p>
          <p className="text-3xl font-bold text-indigo-900 mt-1">
            {analytics.totalLast7Days.toLocaleString()}
          </p>
          <p className="text-xs text-indigo-600 mt-1">page views</p>
        </div>
        <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
          <p className="text-sm text-slate-700 font-medium">Last 30 days</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">
            {analytics.totalLast30Days.toLocaleString()}
          </p>
          <p className="text-xs text-slate-600 mt-1">page views</p>
        </div>
      </div>

      {!analytics.legacyDailyOnly && analytics.configured && analytics.byCountry.length === 0 && analytics.totalLast30Days > 0 && (
        <p className="text-xs text-gray-500 mb-4">
          All countries show as Unknown until you deploy behind a CDN that forwards a country header, or extend the tracker with geo-IP later.
        </p>
      )}

      {!analytics.legacyDailyOnly &&
        analytics.configured &&
        (analytics.byCountry.length > 0 || analytics.byDevice.length > 0 || analytics.byOs.length > 0) && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            <BarList rows={analytics.byCountry} labelHeading="Location (country / region hint)" />
            <BarList rows={analytics.byDevice} labelHeading="Device type" />
            <BarList rows={analytics.byOs} labelHeading="Operating system" />
          </div>
        )}

      {analytics.configured && analytics.byDay.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            Daily views (last 14 days shown)
          </h3>
          <div className="space-y-2">
            {(() => {
              const slice = analytics.byDay.slice(-14)
              const maxV = Math.max(1, ...slice.map((row) => row.views))
              return slice.map((row) => (
                <div key={row.day} className="flex items-center gap-3 text-sm">
                  <span className="w-24 shrink-0 text-gray-500 tabular-nums">
                    {new Date(row.day + 'T12:00:00Z').toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 rounded-full transition-all"
                      style={{ width: `${(row.views / maxV) * 100}%` }}
                    />
                  </div>
                  <span className="w-12 text-right text-gray-800 font-medium tabular-nums">{row.views}</span>
                </div>
              ))
            })()}
          </div>
        </div>
      )}

      {analytics.configured && analytics.topPaths.length > 0 && (
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Top pages (30 days)</h3>
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-left text-gray-600">
                <tr>
                  <th className="px-3 py-2 font-medium">Path</th>
                  <th className="px-3 py-2 font-medium text-right w-24">Views</th>
                </tr>
              </thead>
              <tbody>
                {analytics.topPaths.map((row) => (
                  <tr key={row.path} className="border-t border-gray-100 hover:bg-gray-50">
                    <td
                      className="px-3 py-2 font-mono text-gray-800 max-w-xs truncate"
                      title={row.path}
                    >
                      {row.path}
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums font-medium">
                      {row.views.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!analytics.legacyDailyOnly && analytics.configured && analytics.recentEvents.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Recent visits (last 50, 30 days)</h3>
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-left text-gray-600">
                <tr>
                  <th className="px-3 py-2 font-medium whitespace-nowrap">Time</th>
                  <th className="px-3 py-2 font-medium whitespace-nowrap">Location</th>
                  <th className="px-3 py-2 font-medium whitespace-nowrap">Device</th>
                  <th className="px-3 py-2 font-medium whitespace-nowrap">OS</th>
                  <th className="px-3 py-2 font-medium">Path</th>
                </tr>
              </thead>
              <tbody>
                {analytics.recentEvents.map((ev, i) => (
                  <tr key={`${ev.occurredAt}-${ev.path}-${i}`} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-3 py-2 whitespace-nowrap text-gray-800 tabular-nums">
                      {formatVisitTime(ev.occurredAt)}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-gray-800">
                      {formatBreakdownLabel(ev.country)}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-gray-800">
                      {formatBreakdownLabel(ev.deviceType)}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-gray-700">
                      {ev.osName}
                    </td>
                    <td className="px-3 py-2 font-mono text-gray-800 max-w-[12rem] sm:max-w-md truncate" title={ev.path}>
                      {ev.path}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Stored in UTC; the &quot;Time&quot; column follows your browser&apos;s timezone.
          </p>
        </div>
      )}

      {analytics.configured &&
        analytics.totalLast30Days === 0 &&
        analytics.byDay.length === 0 && (
          <p className="text-sm text-gray-500">
            No views recorded yet. Browse the public site (outside admin) to start collecting data.
          </p>
        )}
    </div>
  )
}
