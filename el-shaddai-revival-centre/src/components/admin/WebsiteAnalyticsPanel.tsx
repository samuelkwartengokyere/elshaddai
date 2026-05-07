'use client'

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import {
  ArrowRight,
  BarChart2,
  ChevronDown,
  ChevronUp,
  Info,
  Play,
  RefreshCw,
} from 'lucide-react'
import {
  FaChrome,
  FaEdge,
  FaFacebook,
  FaFirefox,
  FaOpera,
} from 'react-icons/fa'
import { SiInstagram, SiSafari } from 'react-icons/si'
import type { SearchReferralPoint, TrafficStats } from '@/lib/analytics-report-from-events'

export interface WebsiteAnalyticsSnapshot {
  loaded: boolean
  configured: boolean
  legacyDailyOnly?: boolean
  message?: string
  totalLast7Days: number
  totalLast30Days: number
  uniqueVisitorsLast7: number
  uniqueVisitorsLast30: number
  trafficStats: TrafficStats | null
  activeLast5Min: number
  byDay: { day: string; views: number; visitors: number }[]
  topPaths: { path: string; views: number }[]
  byCountry: { label: string; views: number }[]
  byDevice: { label: string; views: number }[]
  byOs: { label: string; views: number }[]
  byBrowser: { label: string; views: number }[]
  searchReferralsSeries: SearchReferralPoint[]
  recentEvents: {
    occurredAt: string
    path: string
    country: string
    deviceType: string
    osName: string
    browserName: string
    referrerHost: string
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
  uniqueVisitorsLast7: 0,
  uniqueVisitorsLast30: 0,
  trafficStats: null,
  activeLast5Min: 0,
  byDay: [],
  topPaths: [],
  byCountry: [],
  byDevice: [],
  byOs: [],
  byBrowser: [],
  searchReferralsSeries: [],
  recentEvents: [],
}

function utcDayKeysBackwards(n: number): string[] {
  const out: string[] = []
  for (let i = 0; i < n; i++) {
    const d = new Date()
    d.setUTCDate(d.getUTCDate() - i)
    out.push(d.toISOString().slice(0, 10))
  }
  return out
}

function visitorsByDayMap(rows: { day: string; views: number; visitors: number }[]): Map<string, number> {
  const m = new Map<string, number>()
  for (const r of rows) {
    const k = (r.day || '').slice(0, 10)
    if (!k) continue
    m.set(k, r.visitors)
  }
  return m
}

function viewsByDayMap(rows: { day: string; views: number; visitors: number }[]): Map<string, number> {
  const m = new Map<string, number>()
  for (const r of rows) {
    const k = (r.day || '').slice(0, 10)
    if (!k) continue
    m.set(k, r.views)
  }
  return m
}

function sumDays(dayKeys: string[], map: Map<string, number>): number {
  let s = 0
  for (const d of dayKeys) s += map.get(d) || 0
  return s
}

function pctChange(current: number, previous: number): number | null {
  if (previous === 0) return null
  return Math.round(((current - previous) / previous) * 1000) / 10
}

function compactInt(n: number): string {
  if (n >= 1_000_000)
    return `${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1).replace(/\.0$/, '')}M`
  if (n >= 10_000) return `${Math.round(n / 100) / 10}K`.replace('.0K', 'K')
  if (n >= 1000) return `${Math.round(n / 10) / 100}K`.replace(/\.?0K$/, 'K')
  return n.toLocaleString()
}

function formatBreakdownLabel(label: string): string {
  if (!label || label === 'Unknown') return label || 'Unknown'
  if (/^[a-z]{2}$/i.test(label) && label.length === 2) return label.toUpperCase()
  if (label.length <= 3 && label === label.toUpperCase()) return label
  const lower = label.toLowerCase()
  return lower.replace(/\b[a-z]/g, (ch) => ch.toUpperCase())
}

function formatVisitTime(iso: string): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
}

/** Recent visits / tables: only show ISO 3166-1 alpha-2; hide legacy non-country strings. */
function displayCountryColumn(raw: string): string {
  const t = (raw || '').trim()
  if (!t || t === 'Unknown') return 'Unknown'
  if (/^[A-Za-z]{2}$/.test(t)) return t.toUpperCase()
  return 'Unknown'
}

function browserUsageIcon(labelRaw: string): ReactNode {
  const label = labelRaw.toLowerCase()
  const iconCls = 'h-4 w-4 shrink-0'
  if (label.includes('chrome') && !label.includes('chromium'))
    return <FaChrome className={`${iconCls} text-[#4285F4]`} />
  if (label.includes('chromium')) return <FaChrome className={`${iconCls} text-blue-500`} />
  if (label.includes('safari')) return <SiSafari className={`${iconCls} text-sky-500`} />
  if (label.includes('firefox')) return <FaFirefox className={`${iconCls} text-orange-500`} />
  if (label.includes('edge')) return <FaEdge className={`${iconCls} text-blue-600`} />
  if (label.includes('opera')) return <FaOpera className={`${iconCls} text-red-500`} />
  if (label.includes('facebook')) return <FaFacebook className={`${iconCls} text-[#1877F2]`} />
  if (label.includes('instagram')) return <SiInstagram className={`${iconCls} text-pink-500`} />
  return (
    <span className={`${iconCls} rounded-sm bg-gray-200 text-[10px] font-bold text-gray-600 flex items-center justify-center`}>
      {(labelRaw || '?').slice(0, 1).toUpperCase()}
    </span>
  )
}

function CardFrame({
  title,
  actions,
  children,
  defaultOpen = true,
  footer,
}: {
  title: string
  actions?: ReactNode
  children: ReactNode
  defaultOpen?: boolean
  footer?: ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="bg-white rounded-xl border border-gray-200/90 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-gray-100 bg-white">
        <div className="flex items-center gap-2 min-w-0">
          <h3 className="text-sm font-semibold text-gray-900 truncate">{title}</h3>
          <Info className="h-4 w-4 text-gray-400 shrink-0" aria-hidden />
        </div>
        <div className="flex items-center shrink-0 gap-0.5">
          {actions}
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="p-1.5 rounded-md text-gray-500 hover:bg-gray-100"
            aria-expanded={open}
            aria-label={open ? 'Collapse' : 'Expand'}
          >
            {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
      </div>
      {open && (
        <>
          <div className="p-4">{children}</div>
          {footer}
        </>
      )}
    </div>
  )
}

function pctBadge(pct: number | null) {
  if (pct === null) return <span className="text-gray-400 text-xs">—</span>
  const pos = pct > 0
  const cls = pos ? 'text-emerald-600' : pct < 0 ? 'text-red-600' : 'text-gray-500'
  return (
    <span className={`text-xs font-medium tabular-nums ${cls}`}>
      {pos ? '+' : ''}
      {pct}%
    </span>
  )
}

function DualMetricLineChart({
  dayKeys,
  visitors,
  views,
  prevVisitors,
  prevViews,
  showPrevious,
  ariaLabel,
}: {
  dayKeys: string[]
  visitors: number[]
  views: number[]
  prevVisitors: number[]
  prevViews: number[]
  showPrevious: boolean
  ariaLabel: string
}) {
  const w = 760
  const h = 216
  const pl = 8
  const pr = 8
  const pt = 12
  const pb = 28
  const gw = w - pl - pr
  const gh = h - pt - pb
  const n = visitors.length
  const max = Math.max(
    1,
    ...visitors,
    ...views,
    ...(showPrevious ? [...prevVisitors, ...prevViews] : [])
  )
  const xAt = (i: number) => pl + (n <= 1 ? gw / 2 : (i / Math.max(1, n - 1)) * gw)
  const yAt = (v: number) => pt + gh - (v / max) * gh

  const vPath = visitors.map((v, i) => `${i === 0 ? 'M' : 'L'} ${xAt(i).toFixed(1)} ${yAt(v).toFixed(1)}`).join(' ')
  const viewsPath = views.map((v, i) => `${i === 0 ? 'M' : 'L'} ${xAt(i).toFixed(1)} ${yAt(v).toFixed(1)}`).join(' ')
  const pvPath = prevVisitors.map((v, i) => `${i === 0 ? 'M' : 'L'} ${xAt(i).toFixed(1)} ${yAt(v).toFixed(1)}`).join(' ')
  const pwPath = prevViews.map((v, i) => `${i === 0 ? 'M' : 'L'} ${xAt(i).toFixed(1)} ${yAt(v).toFixed(1)}`).join(' ')

  const labelIndices = (() => {
    if (n <= 8) return visitors.map((_, i) => i)
    const step = Math.ceil(n / 7)
    const idx: number[] = [0]
    for (let i = step; i < n - 1; i += step) idx.push(i)
    idx.push(n - 1)
    return [...new Set(idx)]
  })()

  const wrapRef = useRef<HTMLDivElement>(null)
  const [wrapW, setWrapW] = useState(0)
  const [hover, setHover] = useState<{ i: number; x: number; y: number } | null>(null)

  const onMove = (e: React.MouseEvent) => {
    const el = wrapRef.current
    if (!el || n < 1) return
    setWrapW(el.offsetWidth)
    const r = el.getBoundingClientRect()
    const rx = e.clientX - r.left
    const frac = Math.max(0, Math.min(1, rx / r.width))
    const i = n <= 1 ? 0 : Math.round(frac * (n - 1))
    setHover({ i, x: e.clientX - r.left, y: e.clientY - r.top })
  }

  const tooltipDay =
    hover != null && dayKeys[hover.i]
      ? new Date(dayKeys[hover.i] + 'T12:00:00Z').toLocaleDateString(undefined, {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        })
      : ''

  const tipStyle =
    hover != null && hover.x < 120
      ? { left: 8 }
      : hover != null && wrapW > 0 && hover.x > wrapW - 120
        ? { right: 8 }
        : { left: '50%', transform: 'translateX(-50%)' as const }

  return (
    <div
      ref={wrapRef}
      className="relative w-full"
      onMouseMove={onMove}
      onMouseLeave={() => setHover(null)}
    >
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto select-none" role="img" aria-label={ariaLabel}>
        {showPrevious && (
          <>
            <path
              d={pvPath}
              fill="none"
              stroke="#93c5fd"
              strokeWidth="2"
              strokeDasharray="6 4"
              strokeLinecap="round"
            />
            <path
              d={pwPath}
              fill="none"
              stroke="#ddd6fe"
              strokeWidth="2"
              strokeDasharray="6 4"
              strokeLinecap="round"
            />
          </>
        )}
        <path
          d={vPath}
          fill="none"
          stroke="#3b82f6"
          strokeWidth="2.25"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d={viewsPath}
          fill="none"
          stroke="#7c3aed"
          strokeWidth="2.25"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {hover != null && n > 0 && (
          <line
            x1={xAt(hover.i)}
            x2={xAt(hover.i)}
            y1={pt}
            y2={pt + gh}
            stroke="#94a3b8"
            strokeWidth="1"
            strokeDasharray="4 3"
          />
        )}
        {labelIndices.map((i) => {
          const d = new Date(dayKeys[i] + 'T12:00:00Z')
          const txt = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
          return (
            <text
              key={dayKeys[i]}
              x={xAt(i)}
              y={h - 6}
              textAnchor="middle"
              className="fill-gray-500 text-[10px]"
            >
              {txt}
            </text>
          )
        })}
      </svg>
      {hover != null && dayKeys[hover.i] && (
        <div
          className="pointer-events-none absolute z-10 top-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs shadow-md min-w-[9rem]"
          style={tipStyle}
        >
          <div className="font-medium text-gray-900 mb-1">{tooltipDay}</div>
          <div className="text-gray-600">
            Visitors{' '}
            <span className="font-semibold text-blue-600 tabular-nums">{visitors[hover.i].toLocaleString()}</span>
          </div>
          <div className="text-gray-600">
            Views <span className="font-semibold text-violet-600 tabular-nums">{views[hover.i].toLocaleString()}</span>
          </div>
          {showPrevious && (
            <>
              <div className="mt-1 border-t border-gray-100 pt-1 text-[11px] text-gray-500">Previous period</div>
              <div className="text-gray-500">
                Visitors <span className="tabular-nums">{prevVisitors[hover.i].toLocaleString()}</span>
              </div>
              <div className="text-gray-500">
                Views <span className="tabular-nums">{prevViews[hover.i].toLocaleString()}</span>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

function SearchReferralsLineChart({
  dayKeys,
  totals,
  seriesByEngine,
  engineOrder,
  showPrevious,
  prevTotals,
  prevByEngine,
}: {
  dayKeys: string[]
  totals: number[]
  seriesByEngine: Record<string, number[]>
  engineOrder: string[]
  showPrevious: boolean
  prevTotals: number[]
  prevByEngine: Record<string, number[]>
}) {
  const colors: Record<string, string> = {
    Total: '#22c55e',
    Google: '#3b82f6',
    Yandex: '#7c3aed',
    Bing: '#f97316',
    Yahoo: '#854d0e',
    DuckDuckGo: '#0d9488',
    Baidu: '#dc2626',
  }

  const w = 760
  const h = 216
  const pl = 8
  const pr = 8
  const pt = 12
  const pb = 28
  const gw = w - pl - pr
  const gh = h - pt - pb
  const n = totals.length
  const flat = [...totals, ...Object.values(seriesByEngine).flat()]
  const flatPrev = showPrevious ? [...prevTotals, ...Object.values(prevByEngine).flat()] : []
  const max = Math.max(1, ...flat, ...flatPrev)
  const xAt = (i: number) => pl + (n <= 1 ? gw / 2 : (i / Math.max(1, n - 1)) * gw)
  const yAt = (v: number) => pt + gh - (v / max) * gh

  const pathFor = (arr: number[]) =>
    arr.map((v, i) => `${i === 0 ? 'M' : 'L'} ${xAt(i).toFixed(1)} ${yAt(v).toFixed(1)}`).join(' ')

  const wrapRef = useRef<HTMLDivElement>(null)
  const [wrapW, setWrapW] = useState(0)
  const [hover, setHover] = useState<{ i: number; x: number; y: number } | null>(null)
  const onMove = (e: React.MouseEvent) => {
    const el = wrapRef.current
    if (!el || n < 1) return
    setWrapW(el.offsetWidth)
    const r = el.getBoundingClientRect()
    const rx = e.clientX - r.left
    const frac = Math.max(0, Math.min(1, rx / r.width))
    const i = n <= 1 ? 0 : Math.round(frac * (n - 1))
    setHover({ i, x: e.clientX - r.left, y: e.clientY - r.top })
  }

  const labelIndices = (() => {
    if (n <= 8) return totals.map((_, i) => i)
    const step = Math.ceil(n / 7)
    const idx: number[] = [0]
    for (let i = step; i < n - 1; i += step) idx.push(i)
    idx.push(n - 1)
    return [...new Set(idx)]
  })()

  const keysDraw = ['Total', ...engineOrder.filter((k) => k !== 'Total')]
  const tooltipDay =
    hover != null && dayKeys[hover.i]
      ? new Date(dayKeys[hover.i] + 'T12:00:00Z').toLocaleDateString(undefined, {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        })
      : ''

  const tipStyle =
    hover != null && hover.x < 120
      ? { left: 8 }
      : hover != null && wrapW > 0 && hover.x > wrapW - 120
        ? { right: 8 }
        : { left: '50%', transform: 'translateX(-50%)' as const }

  return (
    <div
      ref={wrapRef}
      className="relative w-full"
      onMouseMove={onMove}
      onMouseLeave={() => setHover(null)}
    >
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto select-none" role="img" aria-label="Search referrals">
        {showPrevious &&
          keysDraw.map((key) => {
            const arr = key === 'Total' ? prevTotals : prevByEngine[key] || []
            if (!arr.length) return null
            return (
              <path
                key={`p-${key}`}
                d={pathFor(arr)}
                fill="none"
                stroke={colors[key] || '#94a3b8'}
                strokeOpacity={0.45}
                strokeWidth="1.75"
                strokeDasharray="6 4"
                strokeLinecap="round"
              />
            )
          })}
        {keysDraw.map((key) => {
          const arr = key === 'Total' ? totals : seriesByEngine[key] || []
          if (!arr.length) return null
          return (
            <path
              key={key}
              d={pathFor(arr)}
              fill="none"
              stroke={colors[key] || '#64748b'}
              strokeWidth="2.25"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )
        })}
        {hover != null && n > 0 && (
          <line
            x1={xAt(hover.i)}
            x2={xAt(hover.i)}
            y1={pt}
            y2={pt + gh}
            stroke="#94a3b8"
            strokeWidth="1"
            strokeDasharray="4 3"
          />
        )}
        {labelIndices.map((i) => {
          const d = new Date(dayKeys[i] + 'T12:00:00Z')
          const txt = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
          return (
            <text key={dayKeys[i]} x={xAt(i)} y={h - 6} textAnchor="middle" className="fill-gray-500 text-[10px]">
              {txt}
            </text>
          )
        })}
      </svg>
      {hover != null && dayKeys[hover.i] && (
        <div
          className="pointer-events-none absolute z-10 top-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs shadow-md min-w-[9rem]"
          style={tipStyle}
        >
          <div className="font-medium text-gray-900 mb-1">{tooltipDay}</div>
          {keysDraw.map((key) => {
            const arr = key === 'Total' ? totals : seriesByEngine[key] || []
            const v = arr[hover !== null ? hover.i : 0] ?? 0
            return (
              <div key={key} className="text-gray-600 flex justify-between gap-4">
                <span>{key}</span>
                <span className="font-semibold tabular-nums" style={{ color: colors[key] || '#374151' }}>
                  {v.toLocaleString()}
                </span>
              </div>
            )
          })}
          {showPrevious && (
            <div className="mt-1 border-t border-gray-100 pt-1 text-[11px] text-gray-500">Dashed · prior week</div>
          )}
        </div>
      )}
    </div>
  )
}

function pivotSearchReferrals(
  series: SearchReferralPoint[],
  dayKeysChrono: string[]
): {
  totals: number[]
  seriesByEngine: Record<string, number[]>
  engineOrder: string[]
  prevTotals: number[]
  prevByEngine: Record<string, number[]>
} {
  const cell = new Map<string, number>()
  for (const p of series) cell.set(`${p.day}|${p.engine}`, p.views)

  const engineTotals = new Map<string, number>()
  for (const p of series) {
    engineTotals.set(p.engine, (engineTotals.get(p.engine) || 0) + p.views)
  }
  const engines = [...engineTotals.keys()].sort((a, b) => (engineTotals.get(b) || 0) - (engineTotals.get(a) || 0))
  const topEngines = engines.slice(0, 3)

  const totals = dayKeysChrono.map((d) =>
    engines.reduce((s, eng) => s + (cell.get(`${d}|${eng}`) || 0), 0)
  )

  const seriesByEngine: Record<string, number[]> = {}
  for (const eng of topEngines) {
    seriesByEngine[eng] = dayKeysChrono.map((d) => cell.get(`${d}|${eng}`) || 0)
  }

  const prevKeys = dayKeysChrono.map((d) => {
    const dt = new Date(d + 'T12:00:00Z')
    dt.setUTCDate(dt.getUTCDate() - 7)
    return dt.toISOString().slice(0, 10)
  })

  const prevByEngine: Record<string, number[]> = {}
  for (const eng of topEngines) {
    prevByEngine[eng] = prevKeys.map((d) => cell.get(`${d}|${eng}`) || 0)
  }
  const prevTotals = prevKeys.map((d) =>
    engines.reduce((s, eng) => s + (cell.get(`${d}|${eng}`) || 0), 0)
  )

  return {
    totals,
    seriesByEngine: { Total: totals, ...seriesByEngine },
    engineOrder: topEngines,
    prevTotals,
    prevByEngine: { Total: prevTotals, ...prevByEngine },
  }
}

export default function WebsiteAnalyticsPanel({ showCardHeading = true }: WebsiteAnalyticsPanelProps) {
  const trafficTrendAnchor = 'analytics-traffic-trend'
  const searchReferralsAnchor = 'analytics-search-referrals'

  const [analytics, setAnalytics] = useState<WebsiteAnalyticsSnapshot>(INITIAL)
  const [realtime, setRealtime] = useState(false)
  const [chartDays, setChartDays] = useState<7 | 30>(30)
  const [showPreviousPeriod, setShowPreviousPeriod] = useState(true)
  const [showSearchPrev, setShowSearchPrev] = useState(true)
  const [showDetails, setShowDetails] = useState(false)

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/analytics', { credentials: 'include' })
      if (!res.ok) {
        setAnalytics((a) => ({ ...INITIAL, loaded: true, configured: a.configured }))
        return
      }
      const payload = await res.json()
      const d = payload?.data
      if (payload?.success && d) {
        const byDayRaw = d.byDay ?? []
        const byDay = Array.isArray(byDayRaw)
          ? byDayRaw.map((row: { day?: string; views?: number; visitors?: number }) => {
              const day = String(row.day || '').slice(0, 10)
              const views = Number(row.views) || 0
              const vr = Number(row.visitors)
              const visitors = Number.isFinite(vr) ? vr : views
              return { day, views, visitors }
            })
          : []
        setAnalytics({
          loaded: true,
          configured: payload.configured !== false,
          legacyDailyOnly: payload.legacyDailyOnly === true,
          message: payload.message,
          totalLast7Days: d.totalLast7Days ?? 0,
          totalLast30Days: d.totalLast30Days ?? 0,
          uniqueVisitorsLast7: d.uniqueVisitorsLast7 ?? 0,
          uniqueVisitorsLast30: d.uniqueVisitorsLast30 ?? 0,
          trafficStats: (d.trafficStats ?? null) as TrafficStats | null,
          activeLast5Min: typeof d.activeLast5Min === 'number' ? d.activeLast5Min : 0,
          byDay,
          topPaths: d.topPaths ?? [],
          byCountry: d.byCountry ?? [],
          byDevice: d.byDevice ?? [],
          byOs: d.byOs ?? [],
          byBrowser: d.byBrowser ?? [],
          searchReferralsSeries: d.searchReferralsSeries ?? [],
          recentEvents: d.recentEvents ?? [],
        })
        return
      }
      setAnalytics({ ...INITIAL, loaded: true })
    } catch {
      setAnalytics({ ...INITIAL, loaded: true })
    }
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- mount fetch for dashboard
    void load()
  }, [load])

  useEffect(() => {
    if (!realtime) return
    const id = window.setInterval(load, 20000)
    return () => window.clearInterval(id)
  }, [realtime, load])

  const vMap = useMemo(() => visitorsByDayMap(analytics.byDay), [analytics.byDay])
  const viewsMap = useMemo(() => viewsByDayMap(analytics.byDay), [analytics.byDay])

  const trafficRows = useMemo(() => {
    const ts = analytics.trafficStats
    if (ts) {
      return [
        {
          label: 'Today',
          visitors: ts.today.visitors,
          views: ts.today.views,
          vPct: null as number | null,
          wPct: pctChange(ts.today.views, ts.yesterday.views),
        },
        {
          label: 'Yesterday',
          visitors: ts.yesterday.visitors,
          views: ts.yesterday.views,
          vPct: pctChange(ts.yesterday.visitors, ts.dayBeforeYesterday.visitors),
          wPct: pctChange(ts.yesterday.views, ts.dayBeforeYesterday.views),
        },
        {
          label: 'Last 7 days',
          visitors: ts.last7Calendar.visitors,
          views: ts.last7Calendar.views,
          vPct: pctChange(ts.last7Calendar.visitors, ts.prev7Calendar.visitors),
          wPct: pctChange(ts.last7Calendar.views, ts.prev7Calendar.views),
        },
        {
          label: 'Last 28 days',
          visitors: ts.last28Calendar.visitors,
          views: ts.last28Calendar.views,
          vPct: pctChange(ts.last28Calendar.visitors, ts.prev28Calendar.visitors),
          wPct: pctChange(ts.last28Calendar.views, ts.prev28Calendar.views),
        },
        {
          label: analytics.legacyDailyOnly ? 'Total' : 'Total (30 days)',
          visitors: analytics.uniqueVisitorsLast30,
          views: analytics.totalLast30Days,
          vPct: null,
          wPct: null,
        },
      ]
    }

    const keys7 = utcDayKeysBackwards(7)
    const keys14 = utcDayKeysBackwards(14)
    const keys28 = utcDayKeysBackwards(28)
    const keys56 = utcDayKeysBackwards(56)
    const today = keys7[0]
    const yesterday = keys7[1]
    const dayBeforeYesterday = keys7[2]
    const last7 = keys7
    const prev7 = keys14.slice(7)
    const last28 = keys28
    const prev28 = keys56.slice(28, 56)

    const todayV = viewsMap.get(today) || 0
    const yestV = viewsMap.get(yesterday) || 0
    const yPrev = viewsMap.get(dayBeforeYesterday) || 0
    const last7V = sumDays(last7, viewsMap)
    const prev7V = sumDays(prev7, viewsMap)
    const last28V = sumDays(last28, viewsMap)
    const prev28V = sumDays(prev28, viewsMap)

    const todayVis = vMap.get(today) || 0
    const yestVis = vMap.get(yesterday) || 0
    const yPrevVis = vMap.get(dayBeforeYesterday) || 0
    const last7Vis = sumDays(last7, vMap)
    const prev7Vis = sumDays(prev7, vMap)
    const last28Vis = sumDays(last28, vMap)
    const prev28Vis = sumDays(prev28, vMap)

    return [
      {
        label: 'Today',
        visitors: todayVis,
        views: todayV,
        vPct: null as number | null,
        wPct: pctChange(todayV, yestV),
      },
      {
        label: 'Yesterday',
        visitors: yestVis,
        views: yestV,
        vPct: pctChange(yestVis, yPrevVis),
        wPct: pctChange(yestV, yPrev),
      },
      {
        label: 'Last 7 days',
        visitors: last7Vis,
        views: last7V,
        vPct: pctChange(last7Vis, prev7Vis),
        wPct: pctChange(last7V, prev7V),
      },
      {
        label: 'Last 28 days',
        visitors: last28Vis,
        views: last28V,
        vPct: pctChange(last28Vis, prev28Vis),
        wPct: pctChange(last28V, prev28V),
      },
      {
        label: 'Total',
        visitors: analytics.uniqueVisitorsLast30 || last28Vis,
        views: analytics.totalLast30Days,
        vPct: null,
        wPct: null,
      },
    ]
  }, [analytics, vMap, viewsMap])

  const trafficChart = useMemo(() => {
    const n = chartDays
    const keys = utcDayKeysBackwards(n).reverse()
    const visitors = keys.map((d) => vMap.get(d) || 0)
    const views = keys.map((d) => viewsMap.get(d) || 0)
    const prevVisitors = keys.map((d) => {
      const dt = new Date(d + 'T12:00:00Z')
      dt.setUTCDate(dt.getUTCDate() - 7)
      return vMap.get(dt.toISOString().slice(0, 10)) || 0
    })
    const prevViews = keys.map((d) => {
      const dt = new Date(d + 'T12:00:00Z')
      dt.setUTCDate(dt.getUTCDate() - 7)
      return viewsMap.get(dt.toISOString().slice(0, 10)) || 0
    })
    const visSum = visitors.reduce((a, b) => a + b, 0)
    const viewSum = views.reduce((a, b) => a + b, 0)
    return { keys, visitors, views, prevVisitors, prevViews, visSum, viewSum }
  }, [vMap, viewsMap, chartDays])

  const searchChart = useMemo(() => {
    const keys = utcDayKeysBackwards(chartDays).reverse()
    if (analytics.searchReferralsSeries.length === 0) {
      return {
        keys,
        totals: keys.map(() => 0),
        seriesByEngine: { Total: keys.map(() => 0) } as Record<string, number[]>,
        engineOrder: [] as string[],
        prevTotals: keys.map(() => 0),
        prevByEngine: { Total: keys.map(() => 0) } as Record<string, number[]>,
        legendTotals: [{ key: 'Total', sum: 0, color: '#22c55e' }],
      }
    }
    const p = pivotSearchReferrals(analytics.searchReferralsSeries, keys)
    const colors: Record<string, string> = {
      Total: '#22c55e',
      Google: '#3b82f6',
      Yandex: '#7c3aed',
      Bing: '#f97316',
    }
    const legendTotals = ['Total', ...p.engineOrder].map((key) => ({
      key,
      sum: (p.seriesByEngine[key] || p.totals).reduce((a, b) => a + b, 0),
      color: colors[key] || '#64748b',
    }))
    return { keys, ...p, legendTotals }
  }, [analytics.searchReferralsSeries, chartDays])

  const browserRows = useMemo(() => analytics.byBrowser.slice(0, 8), [analytics.byBrowser])
  const maxBrowser = Math.max(1, ...browserRows.map((r) => r.views))

  if (!analytics.loaded) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-40 mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-4 h-64 bg-gray-100 rounded-lg" />
          <div className="lg:col-span-8 h-64 bg-gray-100 rounded-lg" />
        </div>
      </div>
    )
  }

  const refreshBtn = (
    <button
      type="button"
      onClick={() => load()}
      className="p-1.5 rounded-md text-gray-500 hover:bg-gray-100"
      title="Refresh"
    >
      <RefreshCw className="h-4 w-4" />
    </button>
  )

  const hasSearchData = analytics.searchReferralsSeries.length > 0

  return (
    <div className="space-y-6">
      {showCardHeading && (
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <BarChart2 className="h-5 w-5 text-blue-600" />
            Website analytics
          </h2>
          <p className="text-xs text-gray-500">Visitor hints from headers and User-Agent · times in UTC</p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-semibold text-gray-900">Overview</h1>
          <button
            type="button"
            className="p-1 rounded-md text-gray-400 hover:bg-gray-200/80"
            title="Rollups use UTC dates. Country comes from CDN headers when available."
          >
            <Info className="h-4 w-4" />
          </button>
        </div>
        <button
          type="button"
          onClick={() => setRealtime((r) => !r)}
          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
            realtime
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
          }`}
        >
          <Play className={`h-4 w-4 ${realtime ? 'fill-current' : ''}`} />
          Realtime
        </button>
      </div>

      {analytics.legacyDailyOnly && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-900">
          {analytics.message ||
            'Upgrade: run SUPABASE_MIGRATION-ANALYTICS-EVENTS.sql to record country, device, OS, and exact visit times.'}
        </div>
      )}

      {!analytics.configured && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-900">
          {analytics.message ||
            'Run migrations in Supabase: SUPABASE_MIGRATION-ANALYTICS.sql and SUPABASE_MIGRATION-ANALYTICS-EVENTS.sql (see SQL Editor).'}
        </div>
      )}

      {!analytics.legacyDailyOnly && analytics.configured && (
        <details className="text-sm text-gray-600 group [&_summary]:cursor-pointer [&_summary]:list-none [&_summary::-webkit-details-marker]:hidden">
          <summary className="text-gray-600 hover:text-gray-900 underline decoration-dotted underline-offset-2 w-fit">
            How location, device and OS are detected
          </summary>
          <p className="mt-2 max-w-3xl leading-relaxed text-xs text-gray-500">
            <strong className="text-gray-700">Country</strong> prefers geo headers from your host or CDN (
            <code className="text-gray-700">cf-ipcountry</code>,{' '}
            <code className="text-gray-700">x-vercel-ip-country</code>, etc.). If those are missing (typical on
            local dev), we use the <strong className="text-gray-700">region from the visitor&apos;s language/locale</strong>{' '}
            (e.g. <code className="text-gray-700">en-GH</code> → GH) — a hint, not GPS. Device, OS, and browser come from the
            User-Agent and <code className="text-gray-700">Sec-CH-UA</code> when present.
          </p>
        </details>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        <div className="lg:col-span-4 space-y-5">
          <CardFrame
            title="Traffic"
            actions={refreshBtn}
            footer={
              <div className="px-4 py-2.5 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 bg-gray-50/80">
                <span>Last 30 days · UTC</span>
                <span className="text-blue-600 font-medium">Traffic summary</span>
              </div>
            }
          >
            <div className="mb-4 rounded-lg border border-emerald-100 bg-emerald-50/60 px-3 py-2.5 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-40" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                </span>
                <span className="text-sm text-gray-700">
                  <span className="font-semibold text-gray-900 tabular-nums">
                    {analytics.legacyDailyOnly ? '—' : analytics.activeLast5Min}
                  </span>
                  <span className="text-gray-600"> online (last ~5 min)</span>
                </span>
              </div>
            </div>

            <div className="overflow-x-auto -mx-1">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b border-gray-100">
                    <th className="pb-2 pr-2 font-medium" />
                    <th className="pb-2 px-2 font-medium">Visitors</th>
                    <th className="pb-2 px-2 font-medium">Views</th>
                  </tr>
                </thead>
                <tbody>
                  {trafficRows.map((row) => (
                    <tr key={row.label} className="border-b border-gray-50 last:border-0">
                      <td className="py-2 pr-2 text-gray-600">{row.label}</td>
                      <td className="py-2 px-2">
                        <div className="font-medium text-gray-900 tabular-nums">
                          {compactInt(row.visitors)}
                        </div>
                        {row.vPct !== null && <div className="mt-0.5">{pctBadge(row.vPct)}</div>}
                      </td>
                      <td className="py-2 px-2">
                        <div className="font-medium text-gray-900 tabular-nums">{compactInt(row.views)}</div>
                        {row.wPct !== null && <div className="mt-0.5">{pctBadge(row.wPct)}</div>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {analytics.legacyDailyOnly && (
              <p className="mt-3 text-[11px] text-gray-400 leading-snug">
                Unique visitors are estimated from daily rollups until per-visit events are enabled.
              </p>
            )}
          </CardFrame>

          <div id="browser-usage">
            <CardFrame
              title="Browser usage"
              actions={refreshBtn}
              footer={
                <div className="px-4 py-2.5 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 bg-gray-50/80">
                  <select
                    className="bg-transparent border border-gray-200 rounded-md px-2 py-1 text-gray-700"
                    disabled
                    aria-label="Range"
                    title="Rollups are fixed to the last 30 days server-side"
                  >
                    <option>Last 30 days</option>
                  </select>
                  <a
                    href="#browser-usage"
                    className="inline-flex items-center gap-1 text-blue-600 font-medium hover:underline"
                  >
                    View browser usage
                    <ArrowRight className="h-3.5 w-3.5" />
                  </a>
                </div>
              }
            >
              {browserRows.length === 0 ? (
                <p className="text-sm text-gray-500">
                  No browser breakdown yet. Run{' '}
                  <code className="text-xs bg-gray-100 px-1 rounded">SUPABASE_MIGRATION-ANALYTICS-EVENTS-EXTENDED.sql</code>{' '}
                  and collect new visits.
                </p>
              ) : (
                <ul className="space-y-1">
                  {browserRows.map((row, i) => {
                    const pct = (row.views / maxBrowser) * 100
                    const share = analytics.totalLast30Days ? (row.views / analytics.totalLast30Days) * 100 : 0
                    return (
                      <li
                        key={`${row.label}-${i}`}
                        className={`flex items-center gap-3 rounded-lg px-2 py-2 text-sm ${
                          i === 0 ? 'bg-blue-50/80' : 'hover:bg-gray-50'
                        }`}
                      >
                        {browserUsageIcon(row.label)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-medium text-gray-800 truncate">
                              {formatBreakdownLabel(row.label)}
                            </span>
                            <span className="tabular-nums text-gray-700 shrink-0">
                              {row.views.toLocaleString()}{' '}
                              <span className="text-gray-500">
                                ({share >= 10 ? Math.round(share) : share.toFixed(1)}%)
                              </span>
                            </span>
                          </div>
                          <div className="mt-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full bg-blue-500/90 transition-all"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              )}
            </CardFrame>
          </div>
        </div>

        <div className="lg:col-span-8 space-y-5">
          <div id={trafficTrendAnchor}>
            <CardFrame
              title="Traffic trend"
              actions={refreshBtn}
              footer={
                <div className="px-4 py-2.5 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500 bg-gray-50/80">
                  <select
                    className="bg-white border border-gray-200 rounded-md px-2 py-1 text-gray-700"
                    value={chartDays}
                    onChange={(e) => setChartDays(Number(e.target.value) as 7 | 30)}
                    aria-label="Granularity"
                  >
                    <option value={30}>Daily</option>
                    <option value={7}>Daily · 7 days</option>
                  </select>
                  <a
                    href={`#${trafficTrendAnchor}`}
                    className="inline-flex items-center gap-1 text-blue-600 font-medium hover:underline"
                  >
                    Traffic trend report
                    <ArrowRight className="h-3.5 w-3.5" />
                  </a>
                </div>
              }
            >
              <div className="flex flex-wrap items-center gap-4 mb-3 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="inline-block w-3 h-0.5 bg-blue-500 rounded" />
                  <span className="text-gray-600">
                    Visitors{' '}
                    <span className="font-semibold text-gray-900 tabular-nums">
                      {trafficChart.visSum.toLocaleString()}
                    </span>
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="inline-block w-3 h-0.5 bg-violet-600 rounded" />
                  <span className="text-gray-600">
                    Views{' '}
                    <span className="font-semibold text-gray-900 tabular-nums">
                      {trafficChart.viewSum.toLocaleString()}
                    </span>
                  </span>
                </div>
                <label className="ml-auto flex items-center gap-2 cursor-pointer select-none text-gray-600">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300"
                    checked={showPreviousPeriod}
                    onChange={(e) => setShowPreviousPeriod(e.target.checked)}
                  />
                  Previous period
                </label>
              </div>
              {trafficChart.views.some((v) => v > 0) || trafficChart.visitors.some((v) => v > 0) ? (
                <DualMetricLineChart
                  dayKeys={trafficChart.keys}
                  visitors={trafficChart.visitors}
                  views={trafficChart.views}
                  prevVisitors={trafficChart.prevVisitors}
                  prevViews={trafficChart.prevViews}
                  showPrevious={showPreviousPeriod}
                  ariaLabel="Traffic trend"
                />
              ) : (
                <div className="h-48 flex items-center justify-center text-sm text-gray-500 border border-dashed border-gray-200 rounded-lg">
                  No daily data in this range yet.
                </div>
              )}
            </CardFrame>
          </div>

          <div id={searchReferralsAnchor}>
            <CardFrame
              title="Referrals from search engines"
              actions={refreshBtn}
              footer={
                <div className="px-4 py-2.5 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500 bg-gray-50/80">
                  <select
                    className="bg-white border border-gray-200 rounded-md px-2 py-1 text-gray-700"
                    value={chartDays}
                    onChange={(e) => setChartDays(Number(e.target.value) as 7 | 30)}
                    aria-label="Search chart range"
                  >
                    <option value={30}>Daily</option>
                    <option value={7}>Daily · 7 days</option>
                  </select>
                  <a
                    href={`#${searchReferralsAnchor}`}
                    className="inline-flex items-center gap-1 text-blue-600 font-medium hover:underline"
                  >
                    View referrals from search engines
                    <ArrowRight className="h-3.5 w-3.5" />
                  </a>
                </div>
              }
            >
              <div className="flex flex-wrap items-center gap-3 mb-3 text-xs">
                {searchChart.legendTotals.map(({ key, sum, color }) => (
                  <div key={key} className="flex items-center gap-1.5">
                    <span className="inline-block w-3 h-0.5 rounded" style={{ backgroundColor: color }} />
                    <span className="text-gray-600">
                      {key}{' '}
                      <span className="font-semibold text-gray-900 tabular-nums">{sum.toLocaleString()}</span>
                    </span>
                  </div>
                ))}
                <label className="ml-auto flex items-center gap-2 cursor-pointer select-none text-gray-600">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300"
                    checked={showSearchPrev}
                    onChange={(e) => setShowSearchPrev(e.target.checked)}
                  />
                  Previous period
                </label>
              </div>
              {hasSearchData && searchChart.totals.some((v) => v > 0) ? (
                <SearchReferralsLineChart
                  dayKeys={searchChart.keys}
                  totals={searchChart.totals}
                  seriesByEngine={searchChart.seriesByEngine}
                  engineOrder={searchChart.engineOrder}
                  showPrevious={showSearchPrev}
                  prevTotals={searchChart.prevTotals}
                  prevByEngine={searchChart.prevByEngine}
                />
              ) : (
                <div className="h-44 flex flex-col items-center justify-center gap-1 text-sm text-gray-500 border border-dashed border-gray-200 rounded-lg bg-gray-50/50 px-4 text-center">
                  <span>No search referral data in this window.</span>
                  <span className="text-xs text-gray-400 max-w-md">
                    Visits that arrive from Google, Yandex, Bing, and other search hosts appear here once referrer
                    tracking is enabled and visitors land from external search results.
                  </span>
                </div>
              )}
            </CardFrame>
          </div>

          <div id="top-pages">
            <CardFrame
              title="Top pages"
              actions={refreshBtn}
              footer={
                <div className="px-4 py-2.5 border-t border-gray-100 flex justify-end text-xs text-gray-500 bg-gray-50/80">
                  <a
                    href="#top-pages"
                    className="inline-flex items-center gap-1 text-blue-600 font-medium hover:underline"
                  >
                    Top pages report
                    <ArrowRight className="h-3.5 w-3.5" />
                  </a>
                </div>
              }
            >
              {analytics.topPaths.length === 0 ? (
                <p className="text-sm text-gray-500">No path breakdown for this window.</p>
              ) : (
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
                            className="px-3 py-2 font-mono text-gray-800 max-w-56 sm:max-w-xl truncate"
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
              )}
            </CardFrame>
          </div>
        </div>
      </div>

      {!analytics.legacyDailyOnly && analytics.configured && analytics.recentEvents.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <button
            type="button"
            onClick={() => setShowDetails((s) => !s)}
            className="w-full flex items-center justify-between px-4 py-3 text-left text-sm font-semibold text-gray-900 hover:bg-gray-50"
          >
            Recent visits & breakdown
            {showDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          {showDetails && (
            <div className="p-4 border-t border-gray-100 space-y-6">
              {(analytics.byCountry.length > 0 ||
                analytics.byDevice.length > 0 ||
                analytics.byOs.length > 0) && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <BarList rows={analytics.byCountry} labelHeading="Country" />
                  <BarList rows={analytics.byDevice} labelHeading="Device type" />
                  <BarList rows={analytics.byOs} labelHeading="Operating system" />
                </div>
              )}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Recent visits (last 50)</h3>
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-50 text-left text-gray-600">
                      <tr>
                        <th className="px-3 py-2 font-medium whitespace-nowrap">Time</th>
                        <th className="px-3 py-2 font-medium whitespace-nowrap">Country</th>
                        <th className="px-3 py-2 font-medium whitespace-nowrap">Browser</th>
                        <th className="px-3 py-2 font-medium whitespace-nowrap">Device</th>
                        <th className="px-3 py-2 font-medium whitespace-nowrap">OS</th>
                        <th className="px-3 py-2 font-medium whitespace-nowrap">Referrer</th>
                        <th className="px-3 py-2 font-medium">Path</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.recentEvents.map((ev, i) => (
                        <tr
                          key={`${ev.occurredAt}-${ev.path}-${i}`}
                          className="border-t border-gray-100 hover:bg-gray-50"
                        >
                          <td className="px-3 py-2 whitespace-nowrap text-gray-800 tabular-nums">
                            {formatVisitTime(ev.occurredAt)}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-gray-800">
                            {displayCountryColumn(ev.country)}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-gray-800">
                            {formatBreakdownLabel(ev.browserName)}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-gray-800">
                            {formatBreakdownLabel(ev.deviceType)}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-gray-700">{ev.osName}</td>
                          <td
                            className="px-3 py-2 whitespace-nowrap text-gray-600 max-w-[10rem] truncate"
                            title={ev.referrerHost || '—'}
                          >
                            {ev.referrerHost || '—'}
                          </td>
                          <td
                            className="px-3 py-2 font-mono text-gray-800 max-w-48 sm:max-w-md truncate"
                            title={ev.path}
                          >
                            {ev.path}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Stored in UTC; times use your browser timezone.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {analytics.configured &&
        analytics.totalLast30Days === 0 &&
        analytics.byDay.length === 0 && (
          <p className="text-sm text-gray-500">
            No views recorded yet. Browse the public site (outside admin) to start collecting data.
          </p>
        )}

      <p className="text-xs text-gray-500">
        Admin routes, financial reports area, and maintenance page are excluded from public tracking.
      </p>
    </div>
  )
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
