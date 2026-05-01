import type { SupabaseClient } from '@supabase/supabase-js'

export type RecentEventRow = {
  occurredAt: string
  path: string
  country: string
  deviceType: string
  osName: string
}

export type EventsReportData = {
  totalLast7Days: number
  totalLast30Days: number
  byDay: { day: string; views: number }[]
  topPaths: { path: string; views: number }[]
  byCountry: { label: string; views: number }[]
  byDevice: { label: string; views: number }[]
  byOs: { label: string; views: number }[]
  recentEvents: RecentEventRow[]
}

type EventRowRaw = {
  occurred_at: string
  path: string
  country: string
  device_type: string
  os_name: string
}

const PAGE = 2500
const MAX_ROWS = 80_000

function utcDayKey(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toISOString().slice(0, 10)
}

function bump(map: Map<string, number>, key: string, n = 1) {
  map.set(key, (map.get(key) || 0) + n)
}

function topN(from: Map<string, number>, n: number): { label: string; views: number }[] {
  return Array.from(from.entries())
    .map(([label, views]) => ({ label, views }))
    .sort((a, b) => b.views - a.views)
    .slice(0, n)
}

function topPathsFrom(from: Map<string, number>): { path: string; views: number }[] {
  return Array.from(from.entries())
    .map(([path, views]) => ({ path, views }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 10)
}

/**
 * When PostgREST cannot see analytics_events_report() (e.g. PGRST202), build the same
 * aggregates by paging the events table over the REST API (service role).
 */
export async function tryAggregateAnalyticsFromEventsTable(supabase: SupabaseClient): Promise<
  | { ok: true; truncated: boolean; rowCount: number; data: EventsReportData }
  | { ok: false; reason: 'table_missing' | 'fetch_error'; message?: string }
> {
  const now = Date.now()
  const cutoff30Iso = new Date(now - 30 * 86400_000).toISOString()
  const cutoff7Iso = new Date(now - 7 * 86400_000).toISOString()

  const rows: EventRowRaw[] = []
  let start = 0

  while (rows.length < MAX_ROWS) {
    const { data, error } = await supabase
      .from('analytics_page_view_events')
      .select('occurred_at, path, country, device_type, os_name')
      .gte('occurred_at', cutoff30Iso)
      .order('occurred_at', { ascending: true })
      .range(start, start + PAGE - 1)

    if (error) {
      if (
        error.code === 'PGRST205' ||
        error.code === '42P01' ||
        error.message?.includes('does not exist') ||
        error.message?.includes('schema cache')
      ) {
        return { ok: false, reason: 'table_missing' }
      }
      return { ok: false, reason: 'fetch_error', message: error.message }
    }

    const batch = (data || []) as EventRowRaw[]
    if (batch.length === 0) break
    rows.push(...batch)
    if (batch.length < PAGE) break
    start += PAGE
  }

  const truncated = rows.length >= MAX_ROWS

  let totalLast7Days = 0
  let totalLast30Days = 0
  const dayTotal = new Map<string, number>()
  const pathTotal = new Map<string, number>()
  const countryTotal = new Map<string, number>()
  const deviceTotal = new Map<string, number>()
  const osTotal = new Map<string, number>()

  for (const r of rows) {
    totalLast30Days += 1
    if (r.occurred_at >= cutoff7Iso) totalLast7Days += 1

    const day = utcDayKey(r.occurred_at)
    if (day) bump(dayTotal, day)

    const p = r.path || '/'
    bump(pathTotal, p)

    bump(countryTotal, r.country || 'Unknown')
    bump(deviceTotal, r.device_type || 'unknown')
    bump(osTotal, r.os_name || 'Unknown')
  }

  const byDay = Array.from(dayTotal.entries())
    .sort((a, b) => (a[0] < b[0] ? -1 : 1))
    .map(([day, views]) => ({ day, views }))

  const recentRaw = [...rows].sort((a, b) => (a.occurred_at < b.occurred_at ? 1 : -1)).slice(0, 50)

  const recentEvents: RecentEventRow[] = recentRaw.map((e) => ({
    occurredAt: e.occurred_at,
    path: e.path,
    country: e.country,
    deviceType: e.device_type,
    osName: e.os_name,
  }))

  return {
    ok: true,
    truncated,
    rowCount: rows.length,
    data: {
      totalLast7Days,
      totalLast30Days,
      byDay,
      topPaths: topPathsFrom(pathTotal),
      byCountry: topN(countryTotal, 12),
      byDevice: topN(deviceTotal, 24),
      byOs: topN(osTotal, 12),
      recentEvents,
    },
  }
}
