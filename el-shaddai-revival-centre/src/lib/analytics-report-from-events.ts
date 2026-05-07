import type { SupabaseClient } from '@supabase/supabase-js'
import { classifySearchEngineHost } from '@/lib/search-referrer'

export type RecentEventRow = {
  occurredAt: string
  path: string
  country: string
  deviceType: string
  osName: string
  browserName: string
  referrerHost: string
}

export type TrafficStatBucket = { views: number; visitors: number }

export type TrafficStats = {
  today: TrafficStatBucket
  yesterday: TrafficStatBucket
  dayBeforeYesterday: TrafficStatBucket
  last7Calendar: TrafficStatBucket
  prev7Calendar: TrafficStatBucket
  last28Calendar: TrafficStatBucket
  prev28Calendar: TrafficStatBucket
}

export type SearchReferralPoint = { day: string; engine: string; views: number }

export type EventsReportData = {
  totalLast7Days: number
  totalLast30Days: number
  uniqueVisitorsLast7: number
  uniqueVisitorsLast30: number
  trafficStats: TrafficStats | null
  byDay: { day: string; views: number; visitors: number }[]
  topPaths: { path: string; views: number }[]
  byCountry: { label: string; views: number }[]
  byDevice: { label: string; views: number }[]
  byOs: { label: string; views: number }[]
  byBrowser: { label: string; views: number }[]
  searchReferralsSeries: SearchReferralPoint[]
  recentEvents: RecentEventRow[]
}

type EventRowRaw = {
  id: string
  occurred_at: string
  path: string
  country: string
  device_type: string
  os_name: string
  visitor_key?: string | null
  browser_name?: string | null
  referrer_host?: string | null
}

const PAGE = 2500
const MAX_ROWS = 80_000

const SELECT_EXTENDED =
  'id, occurred_at, path, country, device_type, os_name, visitor_key, browser_name, referrer_host'
const SELECT_BASIC = 'id, occurred_at, path, country, device_type, os_name'

function utcDayKey(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toISOString().slice(0, 10)
}

function utcTodayKey(now = Date.now()): string {
  return new Date(now).toISOString().slice(0, 10)
}

function addUtcDays(dayKey: string, deltaDays: number): string {
  const d = new Date(dayKey + 'T12:00:00Z')
  d.setUTCDate(d.getUTCDate() + deltaDays)
  return d.toISOString().slice(0, 10)
}

function visitorRowId(r: EventRowRaw): string {
  const vk = typeof r.visitor_key === 'string' ? r.visitor_key.trim() : ''
  if (vk) return vk
  return r.id
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

function bucketViewsVisitors(rows: EventRowRaw[], pred: (r: EventRowRaw) => boolean): TrafficStatBucket {
  let views = 0
  const vis = new Set<string>()
  for (const r of rows) {
    if (!pred(r)) continue
    views += 1
    vis.add(visitorRowId(r))
  }
  return { views, visitors: vis.size }
}

function buildTrafficStats(rows: EventRowRaw[]): TrafficStats {
  const todayK = utcTodayKey()
  const y = addUtcDays(todayK, -1)
  const dby = addUtcDays(todayK, -2)
  const last7Start = addUtcDays(todayK, -6)
  const prev7Start = addUtcDays(todayK, -13)
  const prev7End = addUtcDays(todayK, -7)
  const last28Start = addUtcDays(todayK, -27)
  const prev28Start = addUtcDays(todayK, -55)
  const prev28End = addUtcDays(todayK, -28)

  return {
    today: bucketViewsVisitors(rows, (r) => utcDayKey(r.occurred_at) === todayK),
    yesterday: bucketViewsVisitors(rows, (r) => utcDayKey(r.occurred_at) === y),
    dayBeforeYesterday: bucketViewsVisitors(rows, (r) => utcDayKey(r.occurred_at) === dby),
    last7Calendar: bucketViewsVisitors(
      rows,
      (r) => utcDayKey(r.occurred_at) >= last7Start && utcDayKey(r.occurred_at) <= todayK
    ),
    prev7Calendar: bucketViewsVisitors(
      rows,
      (r) => utcDayKey(r.occurred_at) >= prev7Start && utcDayKey(r.occurred_at) <= prev7End
    ),
    last28Calendar: bucketViewsVisitors(
      rows,
      (r) => utcDayKey(r.occurred_at) >= last28Start && utcDayKey(r.occurred_at) <= todayK
    ),
    prev28Calendar: bucketViewsVisitors(
      rows,
      (r) => utcDayKey(r.occurred_at) >= prev28Start && utcDayKey(r.occurred_at) <= prev28End
    ),
  }
}

function looksLikeMissingColumnErr(err: { message?: string }): boolean {
  const m = (err.message || '').toLowerCase()
  return (
    (m.includes('column') && m.includes('does not exist')) ||
    m.includes('visitor_key') ||
    m.includes('browser_name') ||
    m.includes('referrer_host')
  )
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

  let selectList = SELECT_EXTENDED
  const rows: EventRowRaw[] = []
  let start = 0
  let extendedFailed = false

  while (rows.length < MAX_ROWS) {
    const { data, error } = await supabase
      .from('analytics_page_view_events')
      .select(selectList)
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
      if (!extendedFailed && selectList === SELECT_EXTENDED && looksLikeMissingColumnErr(error)) {
        extendedFailed = true
        selectList = SELECT_BASIC
        start = 0
        rows.length = 0
        continue
      }
      return { ok: false, reason: 'fetch_error', message: error.message }
    }

    const batch = (data || []) as unknown as EventRowRaw[]
    if (batch.length === 0) break
    rows.push(...batch)
    if (batch.length < PAGE) break
    start += PAGE
  }

  const truncated = rows.length >= MAX_ROWS

  let totalLast7Days = 0
  let totalLast30Days = 0
  const dayViews = new Map<string, number>()
  const dayVisitorSets = new Map<string, Set<string>>()
  const pathTotal = new Map<string, number>()
  const countryTotal = new Map<string, number>()
  const deviceTotal = new Map<string, number>()
  const osTotal = new Map<string, number>()
  const browserTotal = new Map<string, number>()
  const searchCells = new Map<string, number>()
  const rolling7Visitors = new Set<string>()
  const rolling30Visitors = new Set<string>()

  for (const r of rows) {
    totalLast30Days += 1
    if (r.occurred_at >= cutoff7Iso) totalLast7Days += 1

    const vid = visitorRowId(r)
    if (r.occurred_at >= cutoff7Iso) rolling7Visitors.add(vid)
    rolling30Visitors.add(vid)

    const day = utcDayKey(r.occurred_at)
    if (day) {
      bump(dayViews, day)
      if (!dayVisitorSets.has(day)) dayVisitorSets.set(day, new Set())
      dayVisitorSets.get(day)!.add(vid)
    }

    const p = r.path || '/'
    bump(pathTotal, p)

    bump(countryTotal, r.country || 'Unknown')
    bump(deviceTotal, r.device_type || 'unknown')
    bump(osTotal, r.os_name || 'Unknown')

    const br = (r.browser_name && String(r.browser_name).trim()) || 'Unknown'
    bump(browserTotal, br)

    const rh = (r.referrer_host && String(r.referrer_host).trim()) || ''
    if (rh) {
      const engine = classifySearchEngineHost(rh)
      if (engine) {
        const cell = `${day}|${engine}`
        bump(searchCells, cell)
      }
    }
  }

  const byDay = Array.from(dayViews.entries())
    .sort((a, b) => (a[0] < b[0] ? -1 : 1))
    .map(([day, views]) => ({
      day,
      views,
      visitors: dayVisitorSets.get(day)?.size ?? views,
    }))

  const searchReferralsSeries: SearchReferralPoint[] = Array.from(searchCells.entries()).map(
    ([key, views]) => {
      const pipe = key.indexOf('|')
      const day = key.slice(0, pipe)
      const engine = key.slice(pipe + 1)
      return { day, engine, views }
    }
  )
  searchReferralsSeries.sort((a, b) => (a.day < b.day ? -1 : a.day > b.day ? 1 : a.engine.localeCompare(b.engine)))

  const recentRaw = [...rows].sort((a, b) => (a.occurred_at < b.occurred_at ? 1 : -1)).slice(0, 50)

  const recentEvents: RecentEventRow[] = recentRaw.map((e) => ({
    occurredAt: e.occurred_at,
    path: e.path,
    country: e.country,
    deviceType: e.device_type,
    osName: e.os_name,
    browserName: (e.browser_name && String(e.browser_name).trim()) || 'Unknown',
    referrerHost: (e.referrer_host && String(e.referrer_host).trim()) || '',
  }))

  const trafficStats = buildTrafficStats(rows)

  return {
    ok: true,
    truncated,
    rowCount: rows.length,
    data: {
      totalLast7Days,
      totalLast30Days,
      uniqueVisitorsLast7: rolling7Visitors.size,
      uniqueVisitorsLast30: rolling30Visitors.size,
      trafficStats,
      byDay,
      topPaths: topPathsFrom(pathTotal),
      byCountry: topN(countryTotal, 12),
      byDevice: topN(deviceTotal, 24),
      byOs: topN(osTotal, 12),
      byBrowser: topN(browserTotal, 12),
      searchReferralsSeries,
      recentEvents,
    },
  }
}
