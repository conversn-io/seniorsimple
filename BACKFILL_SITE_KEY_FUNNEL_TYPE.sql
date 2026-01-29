-- ============================================================================
-- SeniorSimple Analytics Events Backfill: site_key and funnel_type
-- ============================================================================
-- Purpose: Update existing analytics_events records that are missing
--          site_key and/or funnel_type in their properties JSONB field.
--
-- This query identifies SeniorSimple events by page_url patterns and
-- updates them with the correct site_key and funnel_type values.
-- ============================================================================

-- STEP 1: Preview records that will be updated (SAFE - READ ONLY)
-- Run this first to see what will be changed before executing updates
-- ============================================================================
SELECT 
  id,
  event_name,
  page_url,
  properties->>'site_key' as current_site_key,
  properties->>'funnel_type' as current_funnel_type,
  created_at,
  -- Show what will be set
  CASE 
    WHEN page_url ILIKE '%seniorsimple%' OR page_url ILIKE '%seniorsimple.org%' THEN 'seniorsimple.org'
    ELSE NULL
  END as will_set_site_key,
  CASE 
    WHEN page_url ILIKE '%reverse-mortgage%' THEN 'reverse-mortgage'
    WHEN page_url ILIKE '%final-expense%' THEN 'final-expense-quote'
    WHEN page_url ILIKE '%quiz-rmd%' THEN 'rmd-quiz'
    WHEN page_url ILIKE '%seniorsimple%' OR page_url ILIKE '%seniorsimple.org%' THEN 'primary'
    ELSE NULL
  END as will_set_funnel_type
FROM analytics_events
WHERE (
  -- Missing site_key
  (properties->>'site_key' IS NULL OR properties->>'site_key' = '')
  OR
  -- Missing funnel_type (for step-related events)
  (properties->>'funnel_type' IS NULL OR properties->>'funnel_type' = '')
)
AND (
  -- SeniorSimple events identified by page_url
  page_url ILIKE '%seniorsimple%' 
  OR page_url ILIKE '%seniorsimple.org%'
  OR page_url ILIKE '%www.seniorsimple%'
  OR page_url ILIKE '%seniorsimple.vercel.app%'
)
ORDER BY created_at DESC
LIMIT 100;

-- ============================================================================
-- STEP 2: Count records that will be updated
-- ============================================================================
SELECT 
  COUNT(*) as total_records_to_update,
  COUNT(CASE WHEN properties->>'site_key' IS NULL OR properties->>'site_key' = '' THEN 1 END) as missing_site_key,
  COUNT(CASE WHEN properties->>'funnel_type' IS NULL OR properties->>'funnel_type' = '' THEN 1 END) as missing_funnel_type,
  COUNT(CASE WHEN event_name IN ('quiz_step_viewed', 'address_entered', 'question_answer') THEN 1 END) as step_events
FROM analytics_events
WHERE (
  (properties->>'site_key' IS NULL OR properties->>'site_key' = '')
  OR
  (properties->>'funnel_type' IS NULL OR properties->>'funnel_type' = '')
)
AND (
  page_url ILIKE '%seniorsimple%' 
  OR page_url ILIKE '%seniorsimple.org%'
  OR page_url ILIKE '%www.seniorsimple%'
  OR page_url ILIKE '%seniorsimple.vercel.app%'
);

-- ============================================================================
-- STEP 3: UPDATE - Add site_key to records missing it
-- ============================================================================
-- This updates the properties JSONB to include site_key: 'seniorsimple.org'
-- Only updates records where site_key is missing or empty
-- ============================================================================
UPDATE analytics_events
SET properties = jsonb_set(
  COALESCE(properties, '{}'::jsonb),
  '{site_key}',
  '"seniorsimple.org"',
  true
)
WHERE (
  properties->>'site_key' IS NULL 
  OR properties->>'site_key' = ''
)
AND (
  page_url ILIKE '%seniorsimple%' 
  OR page_url ILIKE '%seniorsimple.org%'
  OR page_url ILIKE '%www.seniorsimple%'
  OR page_url ILIKE '%seniorsimple.vercel.app%'
);

-- ============================================================================
-- STEP 4: UPDATE - Add funnel_type based on URL patterns
-- ============================================================================
-- This updates the properties JSONB to include funnel_type based on page_url
-- Only updates records where funnel_type is missing or empty
-- ============================================================================
-- Use COALESCE so safe even if run before STEP 3 (properties could be NULL)
UPDATE analytics_events
SET properties = jsonb_set(
  COALESCE(properties, '{}'::jsonb),
  '{funnel_type}',
  CASE 
    WHEN page_url ILIKE '%reverse-mortgage%' THEN '"reverse-mortgage"'
    WHEN page_url ILIKE '%final-expense%' THEN '"final-expense-quote"'
    WHEN page_url ILIKE '%quiz-rmd%' THEN '"rmd-quiz"'
    ELSE '"primary"'
  END,
  true
)
WHERE (
  properties->>'funnel_type' IS NULL 
  OR properties->>'funnel_type' = ''
)
AND (
  page_url ILIKE '%seniorsimple%' 
  OR page_url ILIKE '%seniorsimple.org%'
  OR page_url ILIKE '%www.seniorsimple%'
  OR page_url ILIKE '%seniorsimple.vercel.app%'
);

-- ============================================================================
-- STEP 5: VERIFICATION - Check updated records
-- ============================================================================
-- Verify that all SeniorSimple events now have site_key and funnel_type
-- ============================================================================
SELECT 
  event_name,
  COUNT(*) as total_events,
  COUNT(CASE WHEN properties->>'site_key' = 'seniorsimple.org' THEN 1 END) as has_site_key,
  COUNT(CASE WHEN properties->>'funnel_type' IS NOT NULL AND properties->>'funnel_type' != '' THEN 1 END) as has_funnel_type,
  COUNT(CASE WHEN properties->>'site_key' = 'seniorsimple.org' AND properties->>'funnel_type' IS NOT NULL THEN 1 END) as has_both,
  -- Breakdown by funnel_type
  COUNT(CASE WHEN properties->>'funnel_type' = 'reverse-mortgage' THEN 1 END) as reverse_mortgage,
  COUNT(CASE WHEN properties->>'funnel_type' = 'final-expense-quote' THEN 1 END) as final_expense,
  COUNT(CASE WHEN properties->>'funnel_type' = 'rmd-quiz' THEN 1 END) as rmd_quiz,
  COUNT(CASE WHEN properties->>'funnel_type' = 'primary' THEN 1 END) as primary_funnel
FROM analytics_events
WHERE (
  page_url ILIKE '%seniorsimple%' 
  OR page_url ILIKE '%seniorsimple.org%'
  OR page_url ILIKE '%www.seniorsimple%'
  OR page_url ILIKE '%seniorsimple.vercel.app%'
)
AND created_at >= NOW() - INTERVAL '30 days'  -- Adjust timeframe as needed
GROUP BY event_name
ORDER BY total_events DESC;

-- ============================================================================
-- STEP 6: Find any remaining records missing site_key or funnel_type
-- ============================================================================
-- This helps identify edge cases that might need manual review
-- ============================================================================
SELECT 
  id,
  event_name,
  page_url,
  properties->>'site_key' as site_key,
  properties->>'funnel_type' as funnel_type,
  created_at
FROM analytics_events
WHERE (
  (properties->>'site_key' IS NULL OR properties->>'site_key' = '')
  OR
  (properties->>'funnel_type' IS NULL OR properties->>'funnel_type' = '')
)
AND (
  page_url ILIKE '%seniorsimple%' 
  OR page_url ILIKE '%seniorsimple.org%'
  OR page_url ILIKE '%www.seniorsimple%'
  OR page_url ILIKE '%seniorsimple.vercel.app%'
)
ORDER BY created_at DESC
LIMIT 50;

-- ============================================================================
-- NOTES:
-- ============================================================================
-- 1. Run STEP 1 first to preview what will be updated
-- 2. Run STEP 2 to see counts before updating
-- 3. Run STEP 3 and STEP 4 to perform the updates
-- 4. Run STEP 5 to verify the updates were successful
-- 5. Run STEP 6 to find any remaining edge cases
--
-- The updates are idempotent - running them multiple times is safe.
-- They only update records where site_key or funnel_type is missing.
--
-- For records with event_data column (old bug), those need separate handling
-- as they were using the wrong column name. See separate query below.
-- ============================================================================

-- ============================================================================
-- BONUS: Fix records that incorrectly used event_data column
-- ============================================================================
-- If there are records that were inserted with event_data instead of properties,
-- they won't be updated by the above queries. Check for these separately:
-- ============================================================================

-- Check if event_data column exists and has data (may not exist in all schemas)
-- SELECT 
--   COUNT(*) as records_with_event_data,
--   COUNT(CASE WHEN event_data IS NOT NULL THEN 1 END) as has_event_data
-- FROM analytics_events
-- WHERE page_url ILIKE '%seniorsimple%'
-- LIMIT 1;

-- If event_data column exists and has data, you may need to migrate it:
-- UPDATE analytics_events
-- SET properties = COALESCE(properties, '{}'::jsonb) || COALESCE(event_data, '{}'::jsonb)
-- WHERE event_data IS NOT NULL 
--   AND (properties IS NULL OR properties = '{}'::jsonb)
--   AND page_url ILIKE '%seniorsimple%';
