-- Per-page-view events with country hint, device, OS (UTC timestamps).
-- Run in Supabase SQL Editor after SUPABASE_MIGRATION-ANALYTICS.sql (optional legacy daily table remains).

CREATE TABLE IF NOT EXISTS analytics_page_view_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  path TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'Unknown',
  device_type TEXT NOT NULL DEFAULT 'unknown',
  os_name TEXT NOT NULL DEFAULT 'Unknown'
);

CREATE INDEX IF NOT EXISTS idx_analytics_events_occurred_at
  ON analytics_page_view_events (occurred_at DESC);

CREATE INDEX IF NOT EXISTS idx_analytics_events_country
  ON analytics_page_view_events (country);

COMMENT ON TABLE analytics_page_view_events IS 'Raw public page views for dimensional analytics';

-- Aggregate report consumed by GET /api/admin/analytics

CREATE OR REPLACE FUNCTION public.analytics_events_report()
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
SELECT jsonb_build_object(
  'total_last_7',
  (
    SELECT COUNT(*)::bigint
    FROM analytics_page_view_events e
    WHERE e.occurred_at >= NOW() - INTERVAL '7 days'
  ),
  'total_last_30',
  (
    SELECT COUNT(*)::bigint
    FROM analytics_page_view_events e
    WHERE e.occurred_at >= NOW() - INTERVAL '30 days'
  ),
  'by_day',
  COALESCE(
    (
      SELECT jsonb_agg(
        jsonb_build_object(
          'day',
          agg.d::text,
          'views',
          agg.cnt
        ) ORDER BY agg.d
      )
      FROM (
        SELECT (e.occurred_at AT TIME ZONE 'UTC')::date AS d, COUNT(*)::bigint AS cnt
        FROM analytics_page_view_events e
        WHERE e.occurred_at >= NOW() - INTERVAL '30 days'
        GROUP BY 1
      ) agg
    ),
    '[]'::jsonb
  ),
  'top_paths',
  COALESCE(
    (
      SELECT jsonb_agg(
        jsonb_build_object('path', agg.path, 'views', agg.cnt) ORDER BY agg.cnt DESC NULLS LAST
      )
      FROM (
        SELECT e.path, COUNT(*)::bigint AS cnt
        FROM analytics_page_view_events e
        WHERE e.occurred_at >= NOW() - INTERVAL '30 days'
        GROUP BY e.path
        ORDER BY cnt DESC NULLS LAST
        LIMIT 10
      ) agg
    ),
    '[]'::jsonb
  ),
  'by_country',
  COALESCE(
    (
      SELECT jsonb_agg(
        jsonb_build_object(
          'label',
          agg.country,
          'views',
          agg.cnt
        ) ORDER BY agg.cnt DESC NULLS LAST
      )
      FROM (
        SELECT e.country, COUNT(*)::bigint AS cnt
        FROM analytics_page_view_events e
        WHERE e.occurred_at >= NOW() - INTERVAL '30 days'
        GROUP BY e.country
        ORDER BY cnt DESC NULLS LAST
        LIMIT 12
      ) agg
    ),
    '[]'::jsonb
  ),
  'by_device',
  COALESCE(
    (
      SELECT jsonb_agg(
        jsonb_build_object(
          'label',
          agg.device_type,
          'views',
          agg.cnt
        ) ORDER BY agg.cnt DESC NULLS LAST
      )
      FROM (
        SELECT e.device_type, COUNT(*)::bigint AS cnt
        FROM analytics_page_view_events e
        WHERE e.occurred_at >= NOW() - INTERVAL '30 days'
        GROUP BY e.device_type
        ORDER BY cnt DESC NULLS LAST
      ) agg
    ),
    '[]'::jsonb
  ),
  'by_os',
  COALESCE(
    (
      SELECT jsonb_agg(
        jsonb_build_object(
          'label',
          agg.os_name,
          'views',
          agg.cnt
        ) ORDER BY agg.cnt DESC NULLS LAST
      )
      FROM (
        SELECT e.os_name, COUNT(*)::bigint AS cnt
        FROM analytics_page_view_events e
        WHERE e.occurred_at >= NOW() - INTERVAL '30 days'
        GROUP BY e.os_name
        ORDER BY cnt DESC NULLS LAST
        LIMIT 12
      ) agg
    ),
    '[]'::jsonb
  ),
  'recent_events',
  COALESCE(
    (
      SELECT jsonb_agg(
        jsonb_build_object(
          'occurred_at',
          r.occurred_at::text,
          'path',
          r.path,
          'country',
          r.country,
          'device_type',
          r.device_type,
          'os_name',
          r.os_name
        ) ORDER BY r.occurred_at DESC
      )
      FROM (
        SELECT e.occurred_at, e.path, e.country, e.device_type, e.os_name
        FROM analytics_page_view_events e
        WHERE e.occurred_at >= NOW() - INTERVAL '30 days'
        ORDER BY e.occurred_at DESC
        LIMIT 50
      ) r
    ),
    '[]'::jsonb
  )
);
$$;

REVOKE ALL ON FUNCTION public.analytics_events_report() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.analytics_events_report() TO service_role;

-- Hint PostgREST to refresh exposed functions (helps clear PGRST202 "schema cache" after CREATE).
NOTIFY pgrst, 'reload schema';
