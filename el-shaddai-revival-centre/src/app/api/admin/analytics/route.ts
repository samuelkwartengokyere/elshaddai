import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { getCurrentAdmin } from '@/lib/auth'
import type { SearchReferralPoint, TrafficStats } from '@/lib/analytics-report-from-events'
import { tryAggregateAnalyticsFromEventsTable } from '@/lib/analytics-report-from-events'

type TrafficStatBucket = { views: number; visitors: number }

type RecentEventApi = {
  occurredAt: string
  path: string
  country: string
  deviceType: string
  osName: string
  browserName: string
  referrerHost: string
}

type AnalyticsPayload = {
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
  recentEvents: RecentEventApi[]
  activeLast5Min: number
}

function emptyAnalyticsData(): AnalyticsPayload {
  return {
    totalLast7Days: 0,
    totalLast30Days: 0,
    uniqueVisitorsLast7: 0,
    uniqueVisitorsLast30: 0,
    trafficStats: null,
    byDay: [],
    topPaths: [],
    byCountry: [],
    byDevice: [],
    byOs: [],
    byBrowser: [],
    searchReferralsSeries: [],
    recentEvents: [],
    activeLast5Min: 0,
  }
}

function utcDayMinus(days: number): string {
  const d = new Date()
  d.setUTCDate(d.getUTCDate() - days)
  return d.toISOString().slice(0, 10)
}

function isPrivilegedAdmin(admin: NonNullable<ReturnType<typeof getCurrentAdmin>>): boolean {
  return admin.role === 'super_admin' || admin.role === 'admin' || admin.role === 'editor'
}

function toNum(v: unknown): number {
  const n = typeof v === 'string' ? parseInt(v, 10) : Number(v)
  return Number.isFinite(n) ? n : 0
}

function parseLabelViews(raw: unknown): { label: string; views: number }[] {
  if (!Array.isArray(raw)) return []
  return raw.map((entry) => {
    const row = entry as Record<string, unknown>
    return { label: String(row.label ?? ''), views: toNum(row.views) }
  })
}

function parseByDayDetailed(raw: unknown): { day: string; views: number; visitors: number }[] {
  if (!Array.isArray(raw)) return []
  return raw.map((entry) => {
    const row = entry as Record<string, unknown>
    const day =
      typeof row.day === 'string'
        ? row.day.slice(0, 10)
        : typeof row.day === 'number'
          ? String(row.day)
          : ''
    const views = toNum(row.views)
    const hasVisitors =
      Object.prototype.hasOwnProperty.call(row, 'visitors') && row.visitors !== undefined && row.visitors !== null
    const visitors = hasVisitors ? toNum(row.visitors) : views
    return { day: day || '', views, visitors }
  })
}

function parseTopPaths(raw: unknown): { path: string; views: number }[] {
  if (!Array.isArray(raw)) return []
  return raw.map((entry) => {
    const row = entry as Record<string, unknown>
    return { path: String(row.path ?? ''), views: toNum(row.views) }
  })
}

function parseTrafficBucket(raw: unknown): TrafficStatBucket {
  if (!raw || typeof raw !== 'object') return { views: 0, visitors: 0 }
  const row = raw as Record<string, unknown>
  return { views: toNum(row.views), visitors: toNum(row.visitors) }
}

function parseTrafficStats(raw: unknown): TrafficStats | null {
  if (!raw || typeof raw !== 'object') return null
  const o = raw as Record<string, unknown>
  return {
    today: parseTrafficBucket(o.today),
    yesterday: parseTrafficBucket(o.yesterday),
    dayBeforeYesterday: parseTrafficBucket(o.day_before_yesterday),
    last7Calendar: parseTrafficBucket(o.last_7_calendar),
    prev7Calendar: parseTrafficBucket(o.prev_7_calendar),
    last28Calendar: parseTrafficBucket(o.last_28_calendar),
    prev28Calendar: parseTrafficBucket(o.prev_28_calendar),
  }
}

function parseSearchReferralsSeries(raw: unknown): SearchReferralPoint[] {
  if (!Array.isArray(raw)) return []
  return raw
    .map((entry) => {
      const row = entry as Record<string, unknown>
      const day =
        typeof row.day === 'string' ? row.day.slice(0, 10) : typeof row.day === 'number' ? String(row.day) : ''
      return {
        day: day || '',
        engine: String(row.engine ?? ''),
        views: toNum(row.views ?? row.cnt),
      }
    })
    .filter((x) => x.day && x.engine)
}

function parseRecentEventsFull(raw: unknown): RecentEventApi[] {
  if (!Array.isArray(raw)) return []
  return raw.map((entry) => {
    const row = entry as Record<string, unknown>
    return {
      occurredAt: String(row.occurred_at ?? row.occurredAt ?? ''),
      path: String(row.path ?? ''),
      country: String(row.country ?? 'Unknown'),
      deviceType: String(row.device_type ?? row.deviceType ?? ''),
      osName: String(row.os_name ?? row.osName ?? ''),
      browserName: String(row.browser_name ?? row.browserName ?? 'Unknown'),
      referrerHost: String(row.referrer_host ?? row.referrerHost ?? ''),
    }
  })
}

/** PostgREST may return jsonb as object, JSON string, or a one-element array wrapper. */
function normalizeRpcJsonReport(raw: unknown): Record<string, unknown> | null {
  if (raw === null || raw === undefined) return null

  if (Array.isArray(raw) && raw.length === 1 && raw[0] !== null && typeof raw[0] === 'object') {
    return normalizeRpcJsonReport(raw[0])
  }

  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw) as unknown
      return normalizeRpcJsonReport(parsed)
    } catch {
      return null
    }
  }

  if (typeof raw === 'object' && !Array.isArray(raw)) {
    return raw as Record<string, unknown>
  }

  return null
}

function isValidEventsReportShape(obj: Record<string, unknown>): boolean {
  return (
    'total_last_30' in obj ||
    'total_last_7' in obj ||
    'by_day' in obj ||
    'recent_events' in obj
  )
}

async function loadLegacyDailyReport(supabase: NonNullable<Awaited<ReturnType<typeof getSupabaseAdmin>>>) {
  const start30 = utcDayMinus(29)
  const { data: rows, error } = await supabase
    .from('analytics_page_views_daily')
    .select('day, path, views')
    .gte('day', start30)

  if (error) throw error

  type Row = { day: string; path: string; views: number | string | null }
  const list = (rows || []) as Row[]
  const start7Date = utcDayMinus(6)

  let totalLast7Days = 0
  let totalLast30Days = 0
  const dayTotals = new Map<string, number>()
  const pathTotals = new Map<string, number>()

  for (const r of list) {
    const v = typeof r.views === 'string' ? parseInt(r.views, 10) : Number(r.views || 0)
    if (!Number.isFinite(v) || v <= 0) continue

    totalLast30Days += v
    const d = typeof r.day === 'string' ? r.day.slice(0, 10) : ''
    if (d >= start7Date) totalLast7Days += v

    dayTotals.set(d, (dayTotals.get(d) || 0) + v)
    const p = r.path || '/'
    pathTotals.set(p, (pathTotals.get(p) || 0) + v)
  }

  const byDay = Array.from(dayTotals.entries())
    .sort((a, b) => (a[0] < b[0] ? -1 : 1))
    .map(([day, views]) => ({ day, views }))

  const topPaths = Array.from(pathTotals.entries())
    .map(([pathKey, views]) => ({ path: pathKey, views }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 10)

  return {
    totalLast7Days,
    totalLast30Days,
    byDay,
    topPaths,
  }
}

async function countRecentPageviews(supabase: NonNullable<Awaited<ReturnType<typeof getSupabaseAdmin>>>) {
  const since = new Date(Date.now() - 5 * 60 * 1000).toISOString()
  const { count, error } = await supabase
    .from('analytics_page_view_events')
    .select('*', { count: 'exact', head: true })
    .gte('occurred_at', since)
  if (error || count == null) return null
  return count
}

async function countActiveVisitorsApprox(
  supabase: NonNullable<Awaited<ReturnType<typeof getSupabaseAdmin>>>
): Promise<number> {
  const since = new Date(Date.now() - 5 * 60 * 1000).toISOString()
  const { data, error } = await supabase
    .from('analytics_page_view_events')
    .select('id, visitor_key')
    .gte('occurred_at', since)
    .limit(8000)

  if (!error && data?.length) {
    const s = new Set<string>()
    for (const r of data as { id: string; visitor_key?: string | null }[]) {
      s.add((r.visitor_key && String(r.visitor_key).trim()) || r.id)
    }
    return s.size
  }

  return (await countRecentPageviews(supabase)) ?? 0
}

function dataFromRpc(reportObj: Record<string, unknown>): Omit<AnalyticsPayload, 'activeLast5Min'> {
  return {
    totalLast7Days: toNum(reportObj.total_last_7),
    totalLast30Days: toNum(reportObj.total_last_30),
    uniqueVisitorsLast7: toNum(reportObj.unique_visitors_last_7),
    uniqueVisitorsLast30: toNum(reportObj.unique_visitors_last_30),
    trafficStats: parseTrafficStats(reportObj.traffic_stats),
    byDay: parseByDayDetailed(reportObj.by_day),
    topPaths: parseTopPaths(reportObj.top_paths),
    byCountry: parseLabelViews(reportObj.by_country),
    byDevice: parseLabelViews(reportObj.by_device),
    byOs: parseLabelViews(reportObj.by_os),
    byBrowser: parseLabelViews(reportObj.by_browser),
    searchReferralsSeries: parseSearchReferralsSeries(reportObj.search_referrals_series),
    recentEvents: parseRecentEventsFull(reportObj.recent_events),
  }
}

export async function GET(request: NextRequest) {
  try {
    const admin = getCurrentAdmin(request)
    if (!admin || !isPrivilegedAdmin(admin)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await getSupabaseAdmin()
    if (!supabase) {
      return NextResponse.json({
        success: true,
        configured: false,
        data: emptyAnalyticsData(),
      })
    }

    const { data: report, error: rpcError } = await supabase.rpc('analytics_events_report')

    const reportObj = normalizeRpcJsonReport(report)
    const rpcLooksGood = !rpcError && reportObj !== null && isValidEventsReportShape(reportObj)

    if (rpcLooksGood && reportObj) {
      const base = dataFromRpc(reportObj)
      const activeApprox = await countActiveVisitorsApprox(supabase)
      return NextResponse.json({
        success: true,
        configured: true,
        data: { ...base, activeLast5Min: activeApprox },
      })
    }

    if (rpcError && !looksLikeRpcMissing(rpcError)) {
      console.error('[admin/analytics] RPC error:', rpcError)
      return NextResponse.json({ success: false, error: 'Failed to load analytics' }, { status: 500 })
    }

    const fromEvents = await tryAggregateAnalyticsFromEventsTable(supabase)
    if (fromEvents.ok) {
      const activeApprox = await countActiveVisitorsApprox(supabase)
      return NextResponse.json({
        success: true,
        configured: true,
        restAggregation: true,
        ...(rpcError && {
          diagnostics:
            process.env.NODE_ENV === 'development'
              ? `${rpcError.code ?? ''} ${rpcError.message ?? ''}`.trim()
              : undefined,
        }),
        ...(fromEvents.truncated && {
          message:
            'Analytics loaded from stored visits (REST). Very high traffic capped the sample — run the SQL function migration when possible for faster, full rollups.',
        }),
        data: { ...fromEvents.data, activeLast5Min: activeApprox },
      })
    }

    if (fromEvents.reason === 'fetch_error') {
      console.error('[admin/analytics] events aggregate:', fromEvents.message)
      return NextResponse.json({ success: false, error: 'Failed to load analytics' }, { status: 500 })
    }

    try {
      const legacy = await loadLegacyDailyReport(supabase)
      const baseMessage =
        'No visit events table yet. In Supabase → SQL Editor, run SUPABASE_MIGRATION-ANALYTICS-EVENTS.sql (creates analytics_page_view_events). Optional RPC analytics_events_report() fixes PGRST202 / speeds up dashboards.'

      const devHint =
        process.env.NODE_ENV === 'development' && rpcError?.message
          ? ` (${rpcError.code || ''} ${rpcError.message})`
          : ''

      const byDay = legacy.byDay.map((d) => ({ ...d, visitors: d.views }))
      return NextResponse.json({
        success: true,
        configured: true,
        legacyDailyOnly: true,
        message: `${baseMessage}${devHint}`,
        data: {
          totalLast7Days: legacy.totalLast7Days,
          totalLast30Days: legacy.totalLast30Days,
          uniqueVisitorsLast7: legacy.totalLast7Days,
          uniqueVisitorsLast30: legacy.totalLast30Days,
          trafficStats: null,
          byDay,
          topPaths: legacy.topPaths,
          byCountry: [],
          byDevice: [],
          byOs: [],
          byBrowser: [],
          searchReferralsSeries: [],
          recentEvents: [],
          activeLast5Min: 0,
        },
      })
    } catch (legacyErr: unknown) {
      const msg = legacyErr instanceof Error ? legacyErr.message : String(legacyErr)
      if (
        msg.includes('does not exist') ||
        msg.includes('PGRST205') ||
        msg.includes('schema cache')
      ) {
        return NextResponse.json({
          success: true,
          configured: false,
          message:
            'Analytics tables not found. Run SUPABASE_MIGRATION-ANALYTICS.sql and SUPABASE_MIGRATION-ANALYTICS-EVENTS.sql.',
          data: emptyAnalyticsData(),
        })
      }
      console.error('[admin/analytics] legacy:', legacyErr)
      return NextResponse.json({ success: false, error: 'Failed to load analytics' }, { status: 500 })
    }
  } catch (e) {
    console.error('[admin/analytics] unexpected', e)
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}

function looksLikeRpcMissing(err: { code?: string; message?: string }): boolean {
  const msg = (err.message || '').toLowerCase()
  return (
    err.code === '42883' ||
    err.code === 'PGRST202' ||
    !!msg.includes('analytics_events_report') ||
    !!msg.includes('could not find the function') ||
    !!msg.includes('does not exist') ||
    !!msg.includes('schema cache')
  )
}
