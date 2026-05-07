import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import {
  normalizeReferrerHostFromClient,
  sanitizePathForAnalytics,
  sanitizeVisitorKeyForAnalytics,
} from '@/lib/analytics'
import { buildAnalyticsVisitMeta } from '@/lib/analytics-request-meta'

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

    const bodyRecord =
      typeof body === 'object' && body !== null ? (body as Record<string, unknown>) : {}

    const referrerRaw = typeof bodyRecord.referrer === 'string' ? bodyRecord.referrer : ''
    const referrerHost = normalizeReferrerHostFromClient(referrerRaw).slice(0, 253)

    const visitorKey = sanitizeVisitorKeyForAnalytics(
      typeof bodyRecord.visitorKey === 'string' ? bodyRecord.visitorKey : null
    )

    const clientUserAgent = typeof bodyRecord.clientUserAgent === 'string' ? bodyRecord.clientUserAgent : undefined
    const localeTag =
      typeof bodyRecord.locale === 'string'
        ? bodyRecord.locale
        : typeof bodyRecord.localeTag === 'string'
          ? bodyRecord.localeTag
          : undefined

    const supabase = await getSupabaseAdmin()
    if (!supabase) {
      return new NextResponse(null, { status: 204 })
    }

    const meta = buildAnalyticsVisitMeta(request, {
      clientUserAgent,
      localeTag,
    })

    const extended = {
      path,
      country: meta.country.slice(0, 64),
      device_type: meta.deviceType.slice(0, 64),
      os_name: meta.osName.slice(0, 128),
      browser_name: meta.browserName.slice(0, 128),
      referrer_host: referrerHost,
      ...(visitorKey ? { visitor_key: visitorKey } : {}),
    }

    const legacyRow = {
      path,
      country: meta.country.slice(0, 64),
      device_type: meta.deviceType.slice(0, 64),
      os_name: meta.osName.slice(0, 128),
    }

    let insertError = (await supabase.from('analytics_page_view_events').insert(extended)).error
    if (insertError && looksLikeMissingAnalyticsColumns(insertError)) {
      insertError = (await supabase.from('analytics_page_view_events').insert(legacyRow)).error
    }

    if (!insertError) {
      const day = new Date().toISOString().slice(0, 10)
      void supabase
        .rpc('increment_analytics_page_view', {
          p_day: day,
          p_path: path,
        })
        .then(
          () => {},
          () => {}
        )

      return NextResponse.json({ ok: true }, { status: 200 })
    }

    const missingRelation =
      insertError.code === 'PGRST205' ||
      insertError.code === '42P01' ||
      insertError.message?.includes('does not exist') ||
      insertError.message?.includes('schema cache')

    if (missingRelation) {
      console.warn(
        '[analytics/track] Events table missing. Run SUPABASE_MIGRATION-ANALYTICS-EVENTS.sql — falling back to daily rollup:',
        insertError.message
      )
      const day = new Date().toISOString().slice(0, 10)
      const { error: rpcError } = await supabase.rpc('increment_analytics_page_view', {
        p_day: day,
        p_path: path,
      })
      if (!rpcError) {
        return NextResponse.json({ ok: true }, { status: 200 })
      }
      if (missingRelationRpc(rpcError)) {
        console.warn('[analytics/track] Legacy daily rollup unavailable:', rpcError.message)
        return new NextResponse(null, { status: 204 })
      }
      console.error('[analytics/track] legacy RPC:', rpcError)
      return NextResponse.json({ ok: false }, { status: 500 })
    }

    console.error('[analytics/track] insert:', insertError)
    return NextResponse.json({ ok: false }, { status: 500 })
  } catch (e) {
    console.error('[analytics/track] unexpected', e)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}

function looksLikeMissingAnalyticsColumns(err: { message?: string }): boolean {
  const m = (err.message || '').toLowerCase()
  return (
    (m.includes('column') && m.includes('does not exist')) ||
    m.includes('browser_name') ||
    m.includes('referrer_host') ||
    m.includes('visitor_key')
  )
}

function missingRelationRpc(error: { code?: string; message?: string }): boolean {
  return (
    error.code === '42883' ||
    !!error.message?.includes('increment_analytics_page_view') ||
    !!error.message?.includes('schema cache')
  )
}
