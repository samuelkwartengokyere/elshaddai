-- Analytics: daily page view counts per path (UTC calendar day).
-- Run in Supabase SQL Editor once for existing projects.

CREATE TABLE IF NOT EXISTS analytics_page_views_daily (
  day DATE NOT NULL,
  path TEXT NOT NULL,
  views BIGINT NOT NULL DEFAULT 0,
  CONSTRAINT analytics_page_views_daily_pkey PRIMARY KEY (day, path)
);

CREATE INDEX IF NOT EXISTS idx_analytics_daily_day ON analytics_page_views_daily (day DESC);

CREATE OR REPLACE FUNCTION public.increment_analytics_page_view(p_day DATE, p_path TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  IF p_path IS NULL OR length(btrim(p_path)) = 0 OR length(p_path) > 512 THEN
    RETURN;
  END IF;
  INSERT INTO analytics_page_views_daily (day, path, views)
  VALUES (p_day, p_path, 1)
  ON CONFLICT (day, path)
  DO UPDATE SET views = analytics_page_views_daily.views + 1;
END;
$$;

REVOKE ALL ON FUNCTION public.increment_analytics_page_view(DATE, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.increment_analytics_page_view(DATE, TEXT) TO service_role;

COMMENT ON TABLE analytics_page_views_daily IS 'Aggregated public page views per UTC day and path';
