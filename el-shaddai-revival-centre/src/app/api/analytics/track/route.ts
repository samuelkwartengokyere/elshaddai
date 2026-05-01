import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { sanitizePathForAnalytics } from '@/lib/analytics'

export async function POST(request: NextRequest) {
  try {
    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ ok: false, error: 'Invalid JSON' }, { status: 400 })
    }

    const rawPath =
      typeof body === 'object' &&
      body !== null &&
      'path' in body &&
      typeof (body as { path: unknown }).path === 'string'
        ? (body as { path: string }).path
        : null

    const path = sanitizePathForAnalytics(rawPath)
    if (!path) {
      return new NextResponse(null, { status: 204 })
    }

    const supabase = await getSupabaseAdmin()
    if (!supabase) {
      return new NextResponse(null, { status: 204 })
    }

    const day = new Date().toISOString().slice(0, 10)

    const { error } = await supabase.rpc('increment_analytics_page_view', {
      p_day: day,
      p_path: path,
    })

    if (error) {
      if (
        error.message?.includes('increment_analytics_page_view') ||
        error.code === '42883' ||
        error.message?.includes('schema cache')
      ) {
        console.warn(
          '[analytics/track] RPC or table missing. Run SUPABASE_MIGRATION-ANALYTICS.sql:',
          error.message
        )
        return new NextResponse(null, { status: 204 })
      }
      console.error('[analytics/track]', error)
      return NextResponse.json({ ok: false }, { status: 500 })
    }

    return NextResponse.json({ ok: true }, { status: 200 })
  } catch (e) {
    console.error('[analytics/track] unexpected', e)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
