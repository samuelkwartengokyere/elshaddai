-- Extends analytics_page_view_events for Umami-style reports: visitor id, browser, referrer host.
-- Run in Supabase SQL Editor after SUPABASE_MIGRATION-ANALYTICS-EVENTS.sql

ALTER TABLE public.analytics_page_view_events
  ADD COLUMN IF NOT EXISTS visitor_key TEXT,
  ADD COLUMN IF NOT EXISTS browser_name TEXT NOT NULL DEFAULT 'Unknown',
  ADD COLUMN IF NOT EXISTS referrer_host TEXT NOT NULL DEFAULT '';

CREATE INDEX IF NOT EXISTS idx_analytics_events_visitor_key
  ON public.analytics_page_view_events (visitor_key)
  WHERE visitor_key IS NOT NULL AND length(trim(visitor_key)) > 0;

CREATE INDEX IF NOT EXISTS idx_analytics_events_browser_name
  ON public.analytics_page_view_events (browser_name);

COMMENT ON COLUMN public.analytics_page_view_events.visitor_key IS 'Client-persisted UUID; used for unique visitor counts';
COMMENT ON COLUMN public.analytics_page_view_events.browser_name IS 'Browser / in-app label from User-Agent';
COMMENT ON COLUMN public.analytics_page_view_events.referrer_host IS 'Normalized external referrer hostname only';

CREATE OR REPLACE FUNCTION public.analytics_events_report()
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
SELECT jsonb_build_object(
  'total_last_7',
  (SELECT COUNT(*)::bigint FROM analytics_page_view_events e WHERE e.occurred_at >= NOW() - INTERVAL '7 days'),
  'total_last_30',
  (SELECT COUNT(*)::bigint FROM analytics_page_view_events e WHERE e.occurred_at >= NOW() - INTERVAL '30 days'),
  'unique_visitors_last_7',
  (
    SELECT COUNT(DISTINCT COALESCE(NULLIF(trim(e.visitor_key), ''), e.id::text))::bigint
    FROM analytics_page_view_events e
    WHERE e.occurred_at >= NOW() - INTERVAL '7 days'
  ),
  'unique_visitors_last_30',
  (
    SELECT COUNT(DISTINCT COALESCE(NULLIF(trim(e.visitor_key), ''), e.id::text))::bigint
    FROM analytics_page_view_events e
    WHERE e.occurred_at >= NOW() - INTERVAL '30 days'
  ),
  'traffic_stats',
  (
    SELECT jsonb_build_object(
      'today',
      jsonb_build_object(
        'views',
        (
          SELECT COUNT(*)::bigint
          FROM analytics_page_view_events e
          WHERE (e.occurred_at AT TIME ZONE 'UTC')::date = (CURRENT_TIMESTAMP AT TIME ZONE 'UTC')::date
        ),
        'visitors',
        (
          SELECT COUNT(DISTINCT COALESCE(NULLIF(trim(e.visitor_key), ''), e.id::text))::bigint
          FROM analytics_page_view_events e
          WHERE (e.occurred_at AT TIME ZONE 'UTC')::date = (CURRENT_TIMESTAMP AT TIME ZONE 'UTC')::date
        )
      ),
      'yesterday',
      jsonb_build_object(
        'views',
        (
          SELECT COUNT(*)::bigint
          FROM analytics_page_view_events e
          WHERE (e.occurred_at AT TIME ZONE 'UTC')::date = (CURRENT_TIMESTAMP AT TIME ZONE 'UTC')::date - 1
        ),
        'visitors',
        (
          SELECT COUNT(DISTINCT COALESCE(NULLIF(trim(e.visitor_key), ''), e.id::text))::bigint
          FROM analytics_page_view_events e
          WHERE (e.occurred_at AT TIME ZONE 'UTC')::date = (CURRENT_TIMESTAMP AT TIME ZONE 'UTC')::date - 1
        )
      ),
      'day_before_yesterday',
      jsonb_build_object(
        'views',
        (
          SELECT COUNT(*)::bigint
          FROM analytics_page_view_events e
          WHERE (e.occurred_at AT TIME ZONE 'UTC')::date = (CURRENT_TIMESTAMP AT TIME ZONE 'UTC')::date - 2
        ),
        'visitors',
        (
          SELECT COUNT(DISTINCT COALESCE(NULLIF(trim(e.visitor_key), ''), e.id::text))::bigint
          FROM analytics_page_view_events e
          WHERE (e.occurred_at AT TIME ZONE 'UTC')::date = (CURRENT_TIMESTAMP AT TIME ZONE 'UTC')::date - 2
        )
      ),
      'last_7_calendar',
      jsonb_build_object(
        'views',
        (
          SELECT COUNT(*)::bigint
          FROM analytics_page_view_events e
          WHERE (e.occurred_at AT TIME ZONE 'UTC')::date >= (CURRENT_TIMESTAMP AT TIME ZONE 'UTC')::date - 6
        ),
        'visitors',
        (
          SELECT COUNT(DISTINCT COALESCE(NULLIF(trim(e.visitor_key), ''), e.id::text))::bigint
          FROM analytics_page_view_events e
          WHERE (e.occurred_at AT TIME ZONE 'UTC')::date >= (CURRENT_TIMESTAMP AT TIME ZONE 'UTC')::date - 6
        )
      ),
      'prev_7_calendar',
      jsonb_build_object(
        'views',
        (
          SELECT COUNT(*)::bigint
          FROM analytics_page_view_events e
          WHERE (e.occurred_at AT TIME ZONE 'UTC')::date >= (CURRENT_TIMESTAMP AT TIME ZONE 'UTC')::date - 13
            AND (e.occurred_at AT TIME ZONE 'UTC')::date <= (CURRENT_TIMESTAMP AT TIME ZONE 'UTC')::date - 7
        ),
        'visitors',
        (
          SELECT COUNT(DISTINCT COALESCE(NULLIF(trim(e.visitor_key), ''), e.id::text))::bigint
          FROM analytics_page_view_events e
          WHERE (e.occurred_at AT TIME ZONE 'UTC')::date >= (CURRENT_TIMESTAMP AT TIME ZONE 'UTC')::date - 13
            AND (e.occurred_at AT TIME ZONE 'UTC')::date <= (CURRENT_TIMESTAMP AT TIME ZONE 'UTC')::date - 7
        )
      ),
      'last_28_calendar',
      jsonb_build_object(
        'views',
        (
          SELECT COUNT(*)::bigint
          FROM analytics_page_view_events e
          WHERE (e.occurred_at AT TIME ZONE 'UTC')::date >= (CURRENT_TIMESTAMP AT TIME ZONE 'UTC')::date - 27
        ),
        'visitors',
        (
          SELECT COUNT(DISTINCT COALESCE(NULLIF(trim(e.visitor_key), ''), e.id::text))::bigint
          FROM analytics_page_view_events e
          WHERE (e.occurred_at AT TIME ZONE 'UTC')::date >= (CURRENT_TIMESTAMP AT TIME ZONE 'UTC')::date - 27
        )
      ),
      'prev_28_calendar',
      jsonb_build_object(
        'views',
        (
          SELECT COUNT(*)::bigint
          FROM analytics_page_view_events e
          WHERE (e.occurred_at AT TIME ZONE 'UTC')::date >= (CURRENT_TIMESTAMP AT TIME ZONE 'UTC')::date - 55
            AND (e.occurred_at AT TIME ZONE 'UTC')::date <= (CURRENT_TIMESTAMP AT TIME ZONE 'UTC')::date - 28
        ),
        'visitors',
        (
          SELECT COUNT(DISTINCT COALESCE(NULLIF(trim(e.visitor_key), ''), e.id::text))::bigint
          FROM analytics_page_view_events e
          WHERE (e.occurred_at AT TIME ZONE 'UTC')::date >= (CURRENT_TIMESTAMP AT TIME ZONE 'UTC')::date - 55
            AND (e.occurred_at AT TIME ZONE 'UTC')::date <= (CURRENT_TIMESTAMP AT TIME ZONE 'UTC')::date - 28
        )
      )
    )
  ),
  'by_day',
  COALESCE(
    (
      SELECT jsonb_agg(
        jsonb_build_object(
          'day',
          agg.d::text,
          'views',
          agg.cnt,
          'visitors',
          agg.vis
        ) ORDER BY agg.d
      )
      FROM (
        SELECT
          (e.occurred_at AT TIME ZONE 'UTC')::date AS d,
          COUNT(*)::bigint AS cnt,
          COUNT(DISTINCT COALESCE(NULLIF(trim(e.visitor_key), ''), e.id::text))::bigint AS vis
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
  'by_browser',
  COALESCE(
    (
      SELECT jsonb_agg(
        jsonb_build_object('label', agg.browser_name, 'views', agg.cnt) ORDER BY agg.cnt DESC NULLS LAST
      )
      FROM (
        SELECT e.browser_name, COUNT(*)::bigint AS cnt
        FROM analytics_page_view_events e
        WHERE e.occurred_at >= NOW() - INTERVAL '30 days'
        GROUP BY e.browser_name
        ORDER BY cnt DESC NULLS LAST
        LIMIT 12
      ) agg
    ),
    '[]'::jsonb
  ),
  'search_referrals_series',
  COALESCE(
    (
      SELECT jsonb_agg(
        jsonb_build_object(
          'day',
          s.d::text,
          'engine',
          s.engine,
          'views',
          s.cnt
        ) ORDER BY s.d, s.engine
      )
      FROM (
        SELECT
          (e.occurred_at AT TIME ZONE 'UTC')::date AS d,
          (
            CASE
              WHEN e.referrer_host ~* 'google\\.' OR e.referrer_host IN ('www.google.com', 'google.com') THEN 'Google'
              WHEN e.referrer_host ~* 'yandex\\.' THEN 'Yandex'
              WHEN e.referrer_host ~* 'bing\\.' OR e.referrer_host ~* 'msn\\.' THEN 'Bing'
              WHEN e.referrer_host ~* 'yahoo\\.' THEN 'Yahoo'
              WHEN e.referrer_host ~* 'duckduckgo\\.' THEN 'DuckDuckGo'
              WHEN e.referrer_host ~* 'baidu\\.' THEN 'Baidu'
              ELSE NULL::text
            END
          ) AS engine,
          COUNT(*)::bigint AS cnt
        FROM analytics_page_view_events e
        WHERE e.occurred_at >= NOW() - INTERVAL '30 days'
          AND length(trim(e.referrer_host)) > 0
        GROUP BY 1, 2
      ) s
      WHERE s.engine IS NOT NULL
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
          r.os_name,
          'browser_name',
          r.browser_name,
          'referrer_host',
          r.referrer_host
        ) ORDER BY r.occurred_at DESC
      )
      FROM (
        SELECT
          e.occurred_at,
          e.path,
          e.country,
          e.device_type,
          e.os_name,
          e.browser_name,
          e.referrer_host
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

NOTIFY pgrst, 'reload schema';
