import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { getCurrentAdmin } from '@/lib/auth'

function utcDayMinus(days: number): string {
  const d = new Date()
  d.setUTCDate(d.getUTCDate() - days)
  return d.toISOString().slice(0, 10)
}

function isPrivilegedAdmin(admin: NonNullable<ReturnType<typeof getCurrentAdmin>>): boolean {
  return admin.role === 'super_admin' || admin.role === 'admin' || admin.role === 'editor'
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
        data: {
          totalLast7Days: 0,
          totalLast30Days: 0,
          byDay: [] as { day: string; views: number }[],
          topPaths: [] as { path: string; views: number }[],
        },
      })
    }

    const start30 = utcDayMinus(29)

    const { data: rows, error } = await supabase
      .from('analytics_page_views_daily')
      .select('day, path, views')
      .gte('day', start30)

    if (error) {
      if (
        error.message?.includes('does not exist') ||
        error.code === 'PGRST205' ||
        error.message?.includes('schema cache')
      ) {
        return NextResponse.json({
          success: true,
          configured: false,
          message:
            'Analytics table not found. Run SUPABASE_MIGRATION-ANALYTICS.sql in the Supabase SQL editor.',
          data: {
            totalLast7Days: 0,
            totalLast30Days: 0,
            byDay: [] as { day: string; views: number }[],
            topPaths: [] as { path: string; views: number }[],
          },
        })
      }
      console.error('[admin/analytics]', error)
      return NextResponse.json({ success: false, error: 'Failed to load analytics' }, { status: 500 })
    }

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
      if (d >= start7Date) {
        totalLast7Days += v
      }

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

    return NextResponse.json({
      success: true,
      configured: true,
      data: {
        totalLast7Days,
        totalLast30Days,
        byDay,
        topPaths,
      },
    })
  } catch (e) {
    console.error('[admin/analytics] unexpected', e)
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}
