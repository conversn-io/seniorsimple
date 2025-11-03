-- ============================================================================
-- ANALYTICS DISCREPANCY VERIFICATION QUERIES
-- SeniorSimple Analytics Events Analysis
-- ============================================================================
-- 
-- Use these queries to verify Meta Pixel over-reporting vs GA4
-- Filter by event_label or page_url containing 'seniorsimple.org' or 'annuity'
-- 
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Query 1: Daily PageView Summary (10/28 onwards)
-- ----------------------------------------------------------------------------
-- Shows total events, unique sessions, and GA/Meta client IDs
SELECT 
  DATE(created_at) as date,
  COUNT(*) as total_events,
  COUNT(DISTINCT session_id) as unique_sessions,
  COUNT(DISTINCT properties->'contact'->>'ga_client_id') as unique_ga_clients,
  COUNT(DISTINCT properties->'contact'->>'fbp') as unique_meta_fbp_ids,
  COUNT(DISTINCT properties->'contact'->>'fbc') as unique_meta_fbc_ids,
  -- Calculate ratios
  ROUND(COUNT(*)::numeric / NULLIF(COUNT(DISTINCT session_id), 0), 2) as events_per_session,
  ROUND(COUNT(DISTINCT properties->'contact'->>'fbp')::numeric / NULLIF(COUNT(DISTINCT properties->'contact'->>'ga_client_id'), 0), 2) as meta_to_ga_ratio
FROM analytics_events
WHERE event_name = 'page_view'
  AND (event_label ILIKE '%seniorsimple.org%' 
       OR event_label ILIKE '%annuity%'
       OR page_url ILIKE '%seniorsimple.org%'
       OR page_url ILIKE '%annuity%')
  AND created_at >= '2025-10-28'
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- ----------------------------------------------------------------------------
-- Query 2: Duplicate PageView Detection
-- ----------------------------------------------------------------------------
-- Finds sessions with multiple PageViews (indicates over-counting)
SELECT 
  session_id,
  page_url,
  event_label,
  COUNT(*) as pageview_count,
  MIN(created_at) as first_view,
  MAX(created_at) as last_view,
  EXTRACT(EPOCH FROM (MAX(created_at) - MIN(created_at))) as seconds_between,
  -- Check if same URL within short time (likely duplicate)
  CASE 
    WHEN EXTRACT(EPOCH FROM (MAX(created_at) - MIN(created_at))) < 5 
    THEN 'DUPLICATE_SUSPECT'
    ELSE 'MULTIPLE_PAGES'
  END as duplicate_type
FROM analytics_events
WHERE event_name = 'page_view'
  AND (event_label ILIKE '%seniorsimple.org%' 
       OR event_label ILIKE '%annuity%'
       OR page_url ILIKE '%seniorsimple.org%'
       OR page_url ILIKE '%annuity%')
  AND created_at >= '2025-10-28'
GROUP BY session_id, page_url, event_label
HAVING COUNT(*) > 1
ORDER BY pageview_count DESC, seconds_between ASC
LIMIT 50;

-- ----------------------------------------------------------------------------
-- Query 3: Session Analysis - Events Per Session
-- ----------------------------------------------------------------------------
-- Shows how many events each session has (higher = more likely duplicate)
SELECT 
  session_id,
  COUNT(*) as total_events,
  COUNT(DISTINCT page_url) as unique_pages,
  COUNT(DISTINCT event_name) as unique_event_types,
  MIN(created_at) as session_start,
  MAX(created_at) as session_end,
  EXTRACT(EPOCH FROM (MAX(created_at) - MIN(created_at))) as session_duration_seconds,
  -- Flag suspicious sessions
  CASE 
    WHEN COUNT(*) > 10 THEN 'HIGH_EVENT_COUNT'
    WHEN COUNT(*) = COUNT(DISTINCT page_url) AND COUNT(*) > 5 THEN 'MULTIPLE_PAGES'
    WHEN COUNT(*) > COUNT(DISTINCT page_url) * 2 THEN 'DUPLICATE_SUSPECT'
    ELSE 'NORMAL'
  END as session_type
FROM analytics_events
WHERE (event_label ILIKE '%seniorsimple.org%' 
       OR event_label ILIKE '%annuity%'
       OR page_url ILIKE '%seniorsimple.org%'
       OR page_url ILIKE '%annuity%')
  AND created_at >= '2025-10-28'
GROUP BY session_id
ORDER BY total_events DESC
LIMIT 50;

-- ----------------------------------------------------------------------------
-- Query 4: GA vs Meta Client ID Comparison
-- ----------------------------------------------------------------------------
-- Shows sessions with GA client IDs vs Meta Pixel IDs
SELECT 
  DATE(created_at) as date,
  COUNT(DISTINCT session_id) as total_sessions,
  COUNT(DISTINCT properties->'contact'->>'ga_client_id') as sessions_with_ga,
  COUNT(DISTINCT properties->'contact'->>'fbp') as sessions_with_meta_fbp,
  COUNT(DISTINCT properties->'contact'->>'fbc') as sessions_with_meta_fbc,
  -- Sessions with both
  COUNT(DISTINCT CASE 
    WHEN properties->'contact'->>'ga_client_id' IS NOT NULL 
     AND properties->'contact'->>'fbp' IS NOT NULL 
    THEN session_id 
  END) as sessions_with_both,
  -- Sessions with only Meta (over-reporting indicator)
  COUNT(DISTINCT CASE 
    WHEN properties->'contact'->>'ga_client_id' IS NULL 
     AND properties->'contact'->>'fbp' IS NOT NULL 
    THEN session_id 
  END) as sessions_meta_only,
  -- Sessions with only GA
  COUNT(DISTINCT CASE 
    WHEN properties->'contact'->>'ga_client_id' IS NOT NULL 
     AND properties->'contact'->>'fbp' IS NULL 
    THEN session_id 
  END) as sessions_ga_only
FROM analytics_events
WHERE event_name = 'page_view'
  AND (event_label ILIKE '%seniorsimple.org%' 
       OR event_label ILIKE '%annuity%'
       OR page_url ILIKE '%seniorsimple.org%'
       OR page_url ILIKE '%annuity%')
  AND created_at >= '2025-10-28'
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- ----------------------------------------------------------------------------
-- Query 5: Page URL Breakdown
-- ----------------------------------------------------------------------------
-- Shows which pages are being tracked most
SELECT 
  page_url,
  event_label,
  COUNT(*) as total_pageviews,
  COUNT(DISTINCT session_id) as unique_sessions,
  COUNT(DISTINCT properties->'contact'->>'ga_client_id') as unique_ga_clients,
  COUNT(DISTINCT properties->'contact'->>'fbp') as unique_meta_ids,
  -- Average pageviews per session (high = duplicate indicator)
  ROUND(COUNT(*)::numeric / NULLIF(COUNT(DISTINCT session_id), 0), 2) as avg_pageviews_per_session,
  MIN(created_at) as first_seen,
  MAX(created_at) as last_seen
FROM analytics_events
WHERE event_name = 'page_view'
  AND (event_label ILIKE '%seniorsimple.org%' 
       OR event_label ILIKE '%annuity%'
       OR page_url ILIKE '%seniorsimple.org%'
       OR page_url ILIKE '%annuity%')
  AND created_at >= '2025-10-28'
GROUP BY page_url, event_label
ORDER BY total_pageviews DESC
LIMIT 30;

-- ----------------------------------------------------------------------------
-- Query 6: Time-Based Analysis (Hourly Patterns)
-- ----------------------------------------------------------------------------
-- Shows if there are patterns indicating bot traffic
SELECT 
  DATE_TRUNC('hour', created_at) as hour,
  COUNT(*) as events,
  COUNT(DISTINCT session_id) as unique_sessions,
  COUNT(DISTINCT page_url) as unique_pages,
  -- Calculate events per session per hour
  ROUND(COUNT(*)::numeric / NULLIF(COUNT(DISTINCT session_id), 0), 2) as events_per_session,
  -- Flag suspicious hours (high event count, low unique sessions)
  CASE 
    WHEN COUNT(*)::numeric / NULLIF(COUNT(DISTINCT session_id), 0) > 5 THEN 'SUSPICIOUS'
    ELSE 'NORMAL'
  END as pattern
FROM analytics_events
WHERE event_name = 'page_view'
  AND (event_label ILIKE '%seniorsimple.org%' 
       OR event_label ILIKE '%annuity%'
       OR page_url ILIKE '%seniorsimple.org%'
       OR page_url ILIKE '%annuity%')
  AND created_at >= '2025-10-28'
GROUP BY DATE_TRUNC('hour', created_at)
ORDER BY hour DESC
LIMIT 50;

-- ----------------------------------------------------------------------------
-- Query 7: User Agent Analysis (Bot Detection)
-- ----------------------------------------------------------------------------
-- Check if properties contain user agent info for bot detection
SELECT 
  properties->>'user_agent' as user_agent,
  COUNT(*) as events,
  COUNT(DISTINCT session_id) as sessions,
  COUNT(DISTINCT page_url) as pages,
  MIN(created_at) as first_seen,
  MAX(created_at) as last_seen
FROM analytics_events
WHERE (event_label ILIKE '%seniorsimple.org%' 
       OR event_label ILIKE '%annuity%'
       OR page_url ILIKE '%seniorsimple.org%'
       OR page_url ILIKE '%annuity%')
  AND created_at >= '2025-10-28'
  AND properties->>'user_agent' IS NOT NULL
GROUP BY properties->>'user_agent'
HAVING COUNT(*) > 5  -- Only show user agents with multiple events
ORDER BY events DESC
LIMIT 30;

-- ----------------------------------------------------------------------------
-- Query 8: Summary Statistics (Overall)
-- ----------------------------------------------------------------------------
-- Overall summary since 10/28
SELECT 
  'Total Events' as metric,
  COUNT(*)::text as value
FROM analytics_events
WHERE (event_label ILIKE '%seniorsimple.org%' 
       OR event_label ILIKE '%annuity%'
       OR page_url ILIKE '%seniorsimple.org%'
       OR page_url ILIKE '%annuity%')
  AND created_at >= '2025-10-28'

UNION ALL

SELECT 
  'Unique Sessions',
  COUNT(DISTINCT session_id)::text
FROM analytics_events
WHERE (event_label ILIKE '%seniorsimple.org%' 
       OR event_label ILIKE '%annuity%'
       OR page_url ILIKE '%seniorsimple.org%'
       OR page_url ILIKE '%annuity%')
  AND created_at >= '2025-10-28'

UNION ALL

SELECT 
  'Unique GA Client IDs',
  COUNT(DISTINCT properties->'contact'->>'ga_client_id')::text
FROM analytics_events
WHERE (event_label ILIKE '%seniorsimple.org%' 
       OR event_label ILIKE '%annuity%'
       OR page_url ILIKE '%seniorsimple.org%'
       OR page_url ILIKE '%annuity%')
  AND created_at >= '2025-10-28'

UNION ALL

SELECT 
  'Unique Meta FBP IDs',
  COUNT(DISTINCT properties->'contact'->>'fbp')::text
FROM analytics_events
WHERE (event_label ILIKE '%seniorsimple.org%' 
       OR event_label ILIKE '%annuity%'
       OR page_url ILIKE '%seniorsimple.org%'
       OR page_url ILIKE '%annuity%')
  AND created_at >= '2025-10-28'

UNION ALL

SELECT 
  'Events per Session (Avg)',
  ROUND(COUNT(*)::numeric / NULLIF(COUNT(DISTINCT session_id), 0), 2)::text
FROM analytics_events
WHERE (event_label ILIKE '%seniorsimple.org%' 
       OR event_label ILIKE '%annuity%'
       OR page_url ILIKE '%seniorsimple.org%'
       OR page_url ILIKE '%annuity%')
  AND created_at >= '2025-10-28'

UNION ALL

SELECT 
  'Meta to GA Ratio',
  ROUND(COUNT(DISTINCT properties->'contact'->>'fbp')::numeric / NULLIF(COUNT(DISTINCT properties->'contact'->>'ga_client_id'), 0), 2)::text
FROM analytics_events
WHERE (event_label ILIKE '%seniorsimple.org%' 
       OR event_label ILIKE '%annuity%'
       OR page_url ILIKE '%seniorsimple.org%'
       OR page_url ILIKE '%annuity%')
  AND created_at >= '2025-10-28';

