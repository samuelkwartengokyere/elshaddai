'use client'

import { useState, useEffect } from 'react'
import { BarChart2 } from 'lucide-react'

export interface WebsiteAnalyticsSnapshot {
  loaded: boolean
  configured: boolean
  message?: string
  totalLast7Days: number
  totalLast30Days: number
  byDay: { day: string; views: number }[]
  topPaths: { path: string; views: number }[]
}

interface WebsiteAnalyticsPanelProps {
  /** When false, skips the inner card title (use when the parent page already has an H1). */
  showCardHeading?: boolean
}

const INITIAL: WebsiteAnalyticsSnapshot = {
  loaded: false,
  configured: true,
  totalLast7Days: 0,
  totalLast30Days: 0,
  byDay: [],
  topPaths: []
}

export default function WebsiteAnalyticsPanel({
  showCardHeading = true
}: WebsiteAnalyticsPanelProps) {
  const [analytics, setAnalytics] = useState<WebsiteAnalyticsSnapshot>(INITIAL)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const res = await fetch('/api/admin/analytics', { credentials: 'include' })
        if (!res.ok) {
          if (!cancelled) {
            setAnalytics({
              ...INITIAL,
              loaded: true
            })
          }
          return
        }
        const payload = await res.json()
        const d = payload?.data
        if (!cancelled && payload?.success && d) {
          setAnalytics({
            loaded: true,
            configured: payload.configured !== false,
            message: payload.message,
            totalLast7Days: d.totalLast7Days ?? 0,
            totalLast30Days: d.totalLast30Days ?? 0,
            byDay: d.byDay ?? [],
            topPaths: d.topPaths ?? []
          })
          return
        }
        if (!cancelled) {
          setAnalytics({ ...INITIAL, loaded: true })
        }
      } catch {
        if (!cancelled) {
          setAnalytics({ ...INITIAL, loaded: true })
        }
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
            Public page views (UTC days), admin routes excluded
          </p>
        </div>
      )}

      {!analytics.configured && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-900">
          {analytics.message ||
            'Run the SQL migration in Supabase: open SUPABASE_MIGRATION-ANALYTICS.sql (or the analytics section in SUPABASE_SCHEMA.sql) in the SQL Editor, then execute.'}
        </div>
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
                      day: 'numeric'
                    })}
                  </span>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 rounded-full transition-all"
                      style={{ width: `${(row.views / maxV) * 100}%` }}
                    />
                  </div>
                  <span className="w-12 text-right text-gray-800 font-medium tabular-nums">
                    {row.views}
                  </span>
                </div>
              ))
            })()}
          </div>
        </div>
      )}

      {analytics.configured && analytics.topPaths.length > 0 && (
        <div>
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

      {analytics.configured &&
        analytics.totalLast30Days === 0 &&
        analytics.byDay.length === 0 && (
          <p className="text-sm text-gray-500">
            No views recorded yet. Browse the public site (outside admin) to start collecting
            data.
          </p>
        )}
    </div>
  )
}
