-- Performance Analysis Queries for SeniorSimple
-- Run these in Supabase SQL Editor to identify performance issues

-- 1. Check PageView API Response Times (if logged)
-- Look for slow page_view events that might indicate blocking API calls
SELECT 
  event_name,
  COUNT(*) as total_events,
  AVG(EXTRACT(EPOCH FROM (created_at - LAG(created_at) OVER (PARTITION BY session_id ORDER BY created_at)))) as avg_time_between_events_seconds,
  MIN(created_at) as first_event,
  MAX(created_at) as last_event
FROM analytics_events
WHERE event_name = 'page_view'
  AND properties->>'site_key' = 'seniorsimple.org'
  AND created_at >= NOW() - INTERVAL '7 days'
GROUP BY event_name
ORDER BY total_events DESC;

-- 2. Check for Bounce Patterns (Single PageView per Session)
-- High bounce rate might indicate slow page loads
WITH session_pageviews AS (
  SELECT 
    session_id,
    COUNT(*) as pageview_count,
    MIN(created_at) as first_pageview,
    MAX(created_at) as last_pageview,
    EXTRACT(EPOCH FROM (MAX(created_at) - MIN(created_at))) as session_duration_seconds
  FROM analytics_events
  WHERE event_name = 'page_view'
    AND properties->>'site_key' = 'seniorsimple.org'
    AND created_at >= NOW() - INTERVAL '7 days'
  GROUP BY session_id
)
SELECT 
  COUNT(*) as total_sessions,
  COUNT(*) FILTER (WHERE pageview_count = 1) as bounced_sessions,
  ROUND(COUNT(*) FILTER (WHERE pageview_count = 1)::numeric / COUNT(*)::numeric * 100, 2) as bounce_rate_pct,
  AVG(session_duration_seconds) as avg_session_duration_seconds,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY session_duration_seconds) as median_session_duration_seconds
FROM session_pageviews;

-- 3. Check for Sessions with Very Short Duration (< 3 seconds)
-- These might indicate page load failures or immediate bounces
WITH session_activity AS (
  SELECT 
    session_id,
    COUNT(*) as event_count,
    MIN(created_at) as session_start,
    MAX(created_at) as session_end,
    EXTRACT(EPOCH FROM (MAX(created_at) - MIN(created_at))) as duration_seconds,
    STRING_AGG(DISTINCT event_name, ', ' ORDER BY event_name) as events
  FROM analytics_events
  WHERE properties->>'site_key' = 'seniorsimple.org'
    AND created_at >= NOW() - INTERVAL '7 days'
  GROUP BY session_id
)
SELECT 
  COUNT(*) as total_sessions,
  COUNT(*) FILTER (WHERE duration_seconds < 3) as very_short_sessions,
  COUNT(*) FILTER (WHERE duration_seconds < 3 AND event_count = 1) as single_event_immediate_exit,
  ROUND(COUNT(*) FILTER (WHERE duration_seconds < 3)::numeric / COUNT(*)::numeric * 100, 2) as very_short_session_rate_pct
FROM session_activity;

-- 4. Check PageView Event Frequency by Hour
-- Look for patterns that might indicate slow loading times
SELECT 
  DATE_TRUNC('hour', created_at) as hour,
  COUNT(*) as pageviews,
  COUNT(DISTINCT session_id) as unique_sessions,
  COUNT(*) FILTER (WHERE properties->>'page_path' = '/') as homepage_views
FROM analytics_events
WHERE event_name = 'page_view'
  AND properties->>'site_key' = 'seniorsimple.org'
  AND created_at >= NOW() - INTERVAL '7 days'
GROUP BY DATE_TRUNC('hour', created_at)
ORDER BY hour DESC
LIMIT 24;

-- 5. Check for Error Patterns in API Routes
-- Look for failed page_view tracking attempts
SELECT 
  event_name,
  properties->>'error' as error_message,
  COUNT(*) as error_count,
  MIN(created_at) as first_error,
  MAX(created_at) as last_error
FROM analytics_events
WHERE properties->>'site_key' = 'seniorsimple.org'
  AND (properties->>'error' IS NOT NULL OR event_name LIKE '%error%')
  AND created_at >= NOW() - INTERVAL '7 days'
GROUP BY event_name, properties->>'error'
ORDER BY error_count DESC;

-- 6. Compare Before/After Performance Optimization (Dec 12, 2025)
-- Check if bounce rate improved after script optimization
WITH daily_metrics AS (
  SELECT 
    DATE(created_at) as date,
    COUNT(DISTINCT session_id) as sessions,
    COUNT(*) FILTER (WHERE event_name = 'page_view') as pageviews,
    COUNT(DISTINCT session_id) FILTER (
      WHERE session_id IN (
        SELECT session_id 
        FROM analytics_events e2 
        WHERE e2.properties->>'site_key' = 'seniorsimple.org'
          AND e2.event_name = 'page_view'
        GROUP BY session_id
        HAVING COUNT(*) = 1
      )
    ) as bounced_sessions
  FROM analytics_events
  WHERE properties->>'site_key' = 'seniorsimple.org'
    AND created_at >= NOW() - INTERVAL '14 days'
  GROUP BY DATE(created_at)
)
SELECT 
  date,
  sessions,
  pageviews,
  bounced_sessions,
  ROUND(bounced_sessions::numeric / NULLIF(sessions, 0) * 100, 2) as bounce_rate_pct,
  CASE 
    WHEN date >= '2025-12-12' THEN 'After Optimization'
    ELSE 'Before Optimization'
  END as period
FROM daily_metrics
ORDER BY date DESC;

-- 7. Check User Agent Patterns for Slow Loads
-- Mobile devices or slow connections might show different patterns
SELECT 
  CASE 
    WHEN user_agent LIKE '%Mobile%' OR user_agent LIKE '%Android%' OR user_agent LIKE '%iPhone%' THEN 'Mobile'
    WHEN user_agent LIKE '%bot%' OR user_agent LIKE '%crawler%' THEN 'Bot'
    ELSE 'Desktop'
  END as device_type,
  COUNT(DISTINCT session_id) as sessions,
  COUNT(*) FILTER (WHERE event_name = 'page_view') as pageviews,
  COUNT(DISTINCT session_id) FILTER (
    WHERE session_id IN (
      SELECT session_id 
      FROM analytics_events e2 
      WHERE e2.properties->>'site_key' = 'seniorsimple.org'
        AND e2.event_name = 'page_view'
      GROUP BY session_id
      HAVING COUNT(*) = 1
    )
  ) as bounced_sessions,
  ROUND(
    COUNT(DISTINCT session_id) FILTER (
      WHERE session_id IN (
        SELECT session_id 
        FROM analytics_events e2 
        WHERE e2.properties->>'site_key' = 'seniorsimple.org'
          AND e2.event_name = 'page_view'
        GROUP BY session_id
        HAVING COUNT(*) = 1
      )
    )::numeric / NULLIF(COUNT(DISTINCT session_id), 0) * 100, 
    2
  ) as bounce_rate_pct
FROM analytics_events
WHERE properties->>'site_key' = 'seniorsimple.org'
  AND created_at >= NOW() - INTERVAL '7 days'
GROUP BY device_type
ORDER BY sessions DESC;

