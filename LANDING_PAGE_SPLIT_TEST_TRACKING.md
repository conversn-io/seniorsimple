# Landing Page Split Test Tracking & Verification Guide

## Overview

This document provides SQL queries and verification steps for tracking the 3-way landing page split test comparing:
- **Control:** `/quiz-book-b` (current landing page)
- **Variant A:** `/quiz-rmd-v1` (RMD landing page with `start_button` entry variant)
- **Variant B:** `/quiz-rmd-v2` (RMD landing page with `immediate_q1` entry variant)

## Tracking Implementation

### Event Properties Tracked

**Supabase `analytics_events` table:**
- `landing_page_variant`: `'control' | 'rmd_v1' | 'rmd_v2' | null`
- `entry_variant`: `'start_button' | 'immediate_q1' | null`
- `page_path`: URL path
- `funnel_type`: `'primary' | 'rmd-quiz'`

**GA4 Events:**
- `page_view` - Includes `landing_page_variant` and `entry_variant` parameters
- `quiz_view` - Includes variant info
- `quiz_start` - Includes variant info
- `quiz_step_view` - Includes variant info
- `quiz_step_answer` - Includes variant info
- `lead_form_view` - Includes variant info
- `lead_submit_attempt` - Includes variant info
- `lead_submit_success` - Includes variant info
- `lead_submit_error` - Includes variant info
- `quiz_exit` - Includes variant info

## Verification Queries

### 1. Verify Pageview Tracking by Variant

```sql
-- Check pageview distribution across variants
SELECT 
  properties->>'landing_page_variant' as variant,
  COUNT(DISTINCT session_id) as unique_sessions,
  COUNT(*) as total_pageviews,
  MIN(created_at) as first_view,
  MAX(created_at) as last_view
FROM analytics_events
WHERE event_name = 'page_view'
  AND (page_url LIKE '%quiz-book-b%' OR page_url LIKE '%quiz-rmd-v1%' OR page_url LIKE '%quiz-rmd-v2%')
  AND created_at >= NOW() - INTERVAL '7 days'
GROUP BY variant
ORDER BY variant;
```

**Expected Results:**
- All three variants (`control`, `rmd_v1`, `rmd_v2`) should have pageviews
- Roughly equal distribution (33.3% each) if traffic is split evenly
- No `null` values for `landing_page_variant` on these pages

### 2. Funnel Performance by Variant

```sql
-- Complete funnel comparison: Pageview → Quiz Start → Quiz Complete → Lead Submit
SELECT 
  properties->>'landing_page_variant' as variant,
  COUNT(DISTINCT session_id) FILTER (WHERE event_name = 'page_view') as pageviews,
  COUNT(DISTINCT session_id) FILTER (WHERE event_name = 'quiz_start') as quiz_starts,
  COUNT(DISTINCT session_id) FILTER (WHERE event_name = 'quiz_complete') as quiz_completes,
  COUNT(DISTINCT session_id) FILTER (WHERE event_name = 'lead_submit_success') as leads,
  -- Conversion rates
  ROUND(100.0 * COUNT(DISTINCT session_id) FILTER (WHERE event_name = 'quiz_start') / 
    NULLIF(COUNT(DISTINCT session_id) FILTER (WHERE event_name = 'page_view'), 0), 2) as start_rate_pct,
  ROUND(100.0 * COUNT(DISTINCT session_id) FILTER (WHERE event_name = 'quiz_complete') / 
    NULLIF(COUNT(DISTINCT session_id) FILTER (WHERE event_name = 'quiz_start'), 0), 2) as complete_rate_pct,
  ROUND(100.0 * COUNT(DISTINCT session_id) FILTER (WHERE event_name = 'lead_submit_success') / 
    NULLIF(COUNT(DISTINCT session_id) FILTER (WHERE event_name = 'page_view'), 0), 2) as conversion_rate_pct
FROM analytics_events
WHERE (page_url LIKE '%quiz-book-b%' OR page_url LIKE '%quiz-rmd-v1%' OR page_url LIKE '%quiz-rmd-v2%')
  AND created_at >= NOW() - INTERVAL '7 days'
GROUP BY variant
ORDER BY conversion_rate_pct DESC;
```

**Expected Results:**
- All variants should show pageviews
- Conversion rates should be comparable (within 20% of each other)
- Higher conversion rate indicates winning variant

### 3. Entry Variant Performance (RMD Pages Only)

```sql
-- Compare start_button vs immediate_q1 entry variants
SELECT 
  properties->>'landing_page_variant' as landing_variant,
  properties->>'entry_variant' as entry_variant,
  COUNT(DISTINCT session_id) FILTER (WHERE event_name = 'page_view') as pageviews,
  COUNT(DISTINCT session_id) FILTER (WHERE event_name = 'quiz_start') as quiz_starts,
  COUNT(DISTINCT session_id) FILTER (WHERE event_name = 'lead_submit_success') as leads,
  ROUND(100.0 * COUNT(DISTINCT session_id) FILTER (WHERE event_name = 'quiz_start') / 
    NULLIF(COUNT(DISTINCT session_id) FILTER (WHERE event_name = 'page_view'), 0), 2) as start_rate_pct,
  ROUND(100.0 * COUNT(DISTINCT session_id) FILTER (WHERE event_name = 'lead_submit_success') / 
    NULLIF(COUNT(DISTINCT session_id) FILTER (WHERE event_name = 'page_view'), 0), 2) as conversion_rate_pct
FROM analytics_events
WHERE (page_url LIKE '%quiz-rmd-v1%' OR page_url LIKE '%quiz-rmd-v2%')
  AND created_at >= NOW() - INTERVAL '7 days'
GROUP BY landing_variant, entry_variant
ORDER BY landing_variant, entry_variant;
```

**Expected Results:**
- `rmd_v1` should have `entry_variant = 'start_button'`
- `rmd_v2` should have `entry_variant = 'immediate_q1'`
- Compare start rates and conversion rates between entry variants

### 4. Step-by-Step Dropoff Analysis

```sql
-- Step dropoff by variant
WITH step_events AS (
  SELECT 
    session_id,
    properties->>'landing_page_variant' as variant,
    event_name,
    properties->>'step_number' as step_number,
    created_at
  FROM analytics_events
  WHERE (page_url LIKE '%quiz-book-b%' OR page_url LIKE '%quiz-rmd-v1%' OR page_url LIKE '%quiz-rmd-v2%')
    AND created_at >= NOW() - INTERVAL '7 days'
    AND (event_name = 'page_view' OR event_name = 'quiz_start' OR event_name = 'quiz_step_viewed' OR event_name = 'lead_submit_success')
)
SELECT 
  variant,
  COUNT(DISTINCT session_id) FILTER (WHERE event_name = 'page_view') as pageviews,
  COUNT(DISTINCT session_id) FILTER (WHERE event_name = 'quiz_start') as step_1_starts,
  COUNT(DISTINCT session_id) FILTER (WHERE event_name = 'quiz_step_viewed' AND step_number = '2') as step_2_views,
  COUNT(DISTINCT session_id) FILTER (WHERE event_name = 'quiz_step_viewed' AND step_number = '3') as step_3_views,
  COUNT(DISTINCT session_id) FILTER (WHERE event_name = 'quiz_step_viewed' AND step_number = '4') as step_4_views,
  COUNT(DISTINCT session_id) FILTER (WHERE event_name = 'quiz_step_viewed' AND step_number = '5') as step_5_views,
  COUNT(DISTINCT session_id) FILTER (WHERE event_name = 'quiz_step_viewed' AND step_number = '6') as step_6_views,
  COUNT(DISTINCT session_id) FILTER (WHERE event_name = 'quiz_step_viewed' AND step_number = '7') as step_7_views,
  COUNT(DISTINCT session_id) FILTER (WHERE event_name = 'lead_submit_success') as form_submits,
  -- Dropoff rates
  ROUND(100.0 * (COUNT(DISTINCT session_id) FILTER (WHERE event_name = 'page_view') - 
    COUNT(DISTINCT session_id) FILTER (WHERE event_name = 'quiz_start')) / 
    NULLIF(COUNT(DISTINCT session_id) FILTER (WHERE event_name = 'page_view'), 0), 2) as dropoff_before_start_pct
FROM step_events
GROUP BY variant
ORDER BY variant;
```

**Expected Results:**
- Shows where users drop off at each step
- Identifies problematic steps for each variant
- Helps optimize conversion rates

### 5. Time-to-Start Analysis

```sql
-- Average time from pageview to quiz start by variant
WITH pageview_times AS (
  SELECT 
    session_id,
    properties->>'landing_page_variant' as variant,
    created_at as pageview_time
  FROM analytics_events
  WHERE event_name = 'page_view'
    AND (page_url LIKE '%quiz-book-b%' OR page_url LIKE '%quiz-rmd-v1%' OR page_url LIKE '%quiz-rmd-v2%')
    AND created_at >= NOW() - INTERVAL '7 days'
),
start_times AS (
  SELECT 
    session_id,
    created_at as start_time
  FROM analytics_events
  WHERE event_name = 'quiz_start'
    AND created_at >= NOW() - INTERVAL '7 days'
)
SELECT 
  pv.variant,
  COUNT(DISTINCT pv.session_id) as sessions_with_start,
  ROUND(AVG(EXTRACT(EPOCH FROM (st.start_time - pv.pageview_time))), 2) as avg_seconds_to_start,
  ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY EXTRACT(EPOCH FROM (st.start_time - pv.pageview_time))), 2) as median_seconds_to_start
FROM pageview_times pv
INNER JOIN start_times st ON pv.session_id = st.session_id
GROUP BY pv.variant
ORDER BY pv.variant;
```

**Expected Results:**
- `rmd_v1` (start_button) should have longer time-to-start (user clicks button)
- `rmd_v2` (immediate_q1) should have shorter time-to-start (Q1 visible immediately)
- `control` time-to-start depends on quiz implementation

### 6. Booking Backend Routing Verification

```sql
-- Verify that RMD variants route to booking backend
SELECT 
  properties->>'landing_page_variant' as variant,
  COUNT(DISTINCT session_id) FILTER (WHERE event_name = 'lead_submit_success') as leads_submitted,
  COUNT(DISTINCT session_id) FILTER (WHERE page_url LIKE '%booking%') as booking_page_views,
  COUNT(DISTINCT session_id) FILTER (WHERE event_name = 'booking-confirmed') as bookings_confirmed
FROM analytics_events
WHERE (page_url LIKE '%quiz-book-b%' OR page_url LIKE '%quiz-rmd-v1%' OR page_url LIKE '%quiz-rmd-v2%' OR page_url LIKE '%booking%')
  AND created_at >= NOW() - INTERVAL '7 days'
GROUP BY variant
ORDER BY variant;
```

**Expected Results:**
- All variants should route to `/booking` after lead submission
- Booking page views should match or exceed lead submissions
- Booking confirmations should be tracked

### 7. Daily Trend Analysis

```sql
-- Daily performance trends by variant
SELECT 
  DATE(created_at) as date,
  properties->>'landing_page_variant' as variant,
  COUNT(DISTINCT session_id) FILTER (WHERE event_name = 'page_view') as pageviews,
  COUNT(DISTINCT session_id) FILTER (WHERE event_name = 'quiz_start') as quiz_starts,
  COUNT(DISTINCT session_id) FILTER (WHERE event_name = 'lead_submit_success') as leads,
  ROUND(100.0 * COUNT(DISTINCT session_id) FILTER (WHERE event_name = 'lead_submit_success') / 
    NULLIF(COUNT(DISTINCT session_id) FILTER (WHERE event_name = 'page_view'), 0), 2) as conversion_rate_pct
FROM analytics_events
WHERE (page_url LIKE '%quiz-book-b%' OR page_url LIKE '%quiz-rmd-v1%' OR page_url LIKE '%quiz-rmd-v2%')
  AND created_at >= NOW() - INTERVAL '30 days'
GROUP BY date, variant
ORDER BY date DESC, variant;
```

**Expected Results:**
- Shows daily performance trends
- Identifies if one variant consistently outperforms
- Helps detect anomalies or traffic shifts

### 8. UTM Source Performance by Variant

```sql
-- Compare variant performance by traffic source
SELECT 
  properties->>'landing_page_variant' as variant,
  utm_source,
  COUNT(DISTINCT session_id) FILTER (WHERE event_name = 'page_view') as pageviews,
  COUNT(DISTINCT session_id) FILTER (WHERE event_name = 'lead_submit_success') as leads,
  ROUND(100.0 * COUNT(DISTINCT session_id) FILTER (WHERE event_name = 'lead_submit_success') / 
    NULLIF(COUNT(DISTINCT session_id) FILTER (WHERE event_name = 'page_view'), 0), 2) as conversion_rate_pct
FROM analytics_events
WHERE (page_url LIKE '%quiz-book-b%' OR page_url LIKE '%quiz-rmd-v1%' OR page_url LIKE '%quiz-rmd-v2%')
  AND created_at >= NOW() - INTERVAL '7 days'
  AND utm_source IS NOT NULL
GROUP BY variant, utm_source
ORDER BY variant, conversion_rate_pct DESC;
```

**Expected Results:**
- Shows which traffic sources perform best for each variant
- Helps optimize ad spend allocation
- Identifies source-specific preferences

## GA4 Verification

### Custom Dimensions

Ensure these custom dimensions are configured in GA4:
- `landing_page_variant` (Event-scoped)
- `entry_variant` (Event-scoped)

### GA4 Reports

1. **Events → page_view**
   - Filter by `landing_page_variant`
   - Compare pageview counts across variants

2. **Events → quiz_start**
   - Filter by `landing_page_variant` and `entry_variant`
   - Compare start rates

3. **Funnel Visualization**
   - Pageview → Quiz Start → Quiz Complete → Lead Submit
   - Segment by `landing_page_variant`

4. **Exploration → Funnel Exploration**
   - Create custom funnel with variant segmentation
   - Compare conversion rates at each step

## Manual Testing Checklist

### Variant Assignment
- [ ] Visit `/quiz-book-b` → Should track `landing_page_variant: 'control'`
- [ ] Visit `/quiz-rmd-v1` → Should track `landing_page_variant: 'rmd_v1'` and `entry_variant: 'start_button'`
- [ ] Visit `/quiz-rmd-v2` → Should track `landing_page_variant: 'rmd_v2'` and `entry_variant: 'immediate_q1'`
- [ ] Check cookie `ss_landing_page_variant` persists across sessions
- [ ] Test query param override: `/quiz-rmd-v1?variant=rmd_v2` → Should show rmd_v2

### Tracking Verification
- [ ] Check browser console for `landing_page_variant` in GA4 events
- [ ] Check Supabase `analytics_events` table for variant properties
- [ ] Verify all GA4 events include `landing_page_variant` parameter
- [ ] Verify `entry_variant` is tracked for RMD pages

### Booking Backend Routing
- [ ] Complete quiz from `/quiz-rmd-v1` → Should route to `/booking`
- [ ] Complete quiz from `/quiz-rmd-v2` → Should route to `/booking`
- [ ] Complete quiz from `/quiz-book-b` → Should route to `/booking`
- [ ] Verify booking confirmation events are tracked

## Success Criteria

### Primary Metrics
- **Pageview Tracking:** 100% of pageviews tracked with `landing_page_variant`
- **Variant Distribution:** Roughly equal traffic (33.3% ± 5% each)
- **Booking Routing:** 100% of leads route to `/booking` regardless of variant
- **Event Tracking:** All GA4 events include variant parameters

### Performance Metrics
- **Conversion Rate:** Compare overall conversion rates across variants
- **Start Rate:** Compare quiz start rates (especially for entry variants)
- **Dropoff Analysis:** Identify step-by-step dropoff differences
- **Time-to-Start:** Compare time from pageview to quiz start

### Statistical Significance
- Minimum sample size: 100 pageviews per variant
- Run test for minimum 7 days
- Use statistical significance calculator (p < 0.05)

## Troubleshooting

### Issue: Variant Not Tracking
**Check:**
1. `sessionStorage.getItem('landing_page_variant')` in browser console
2. Cookie `ss_landing_page_variant` exists
3. Query param override works: `?variant=control`

### Issue: Booking Backend Not Routing
**Check:**
1. `sessionStorage.getItem('landing_page')` is set correctly
2. `isBookingBackend` flag is set in RMDQuiz component
3. Lead submission includes `landing_page` in payload

### Issue: GA4 Events Missing Variant
**Check:**
1. `window.gtag` is initialized
2. Variant is retrieved from `sessionStorage` before event fires
3. Event parameters include `landing_page_variant`

## Next Steps

1. **Monitor Daily:** Run daily trend query to track performance
2. **Weekly Review:** Compare conversion rates weekly
3. **Statistical Analysis:** After 7 days, calculate statistical significance
4. **Optimization:** Based on results, optimize winning variant or iterate

## Deployment Info

- **Preview URL:** https://seniorsimple-etrnsyso6-conversns-projects.vercel.app
- **Production:** Deploy with `vercel --prod` when ready
- **Routes Added:**
  - `/quiz-rmd-v1` (Variant A)
  - `/quiz-rmd-v2` (Variant B)
  - `/quiz-book-b` (Control - already existed)

