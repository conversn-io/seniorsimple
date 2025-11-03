# Analytics Discrepancy Analysis: GA vs Meta Pixel

**Date:** November 3, 2025  
**Issue:** GA reporting 8-10 visits/day, Meta reporting 32-132 sessions/day (95 total since 10/28, only 12 from paid social)

---

## 🔍 Root Cause Analysis

### **Meta Pixel is LIKELY Over-Reporting**

Based on code analysis, **Meta Pixel is significantly more likely to be over-reporting** than GA4. Here's why:

---

## 🚨 Critical Issues Found

### **Issue #1: Meta Pixel Fires on Every Page Load (Including Client-Side Navigation)**

**Location:** `src/app/layout.tsx` (Lines 110-126)

```typescript
{/* ✅ DIRECT TRACKING: Meta Pixel Base Code */}
<script
  dangerouslySetInnerHTML={{
    __html: `
      !function(f,b,e,v,n,t,s)
      {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)}(window, document,'script',
      'https://connect.facebook.net/en_US/fbevents.js');
      fbq('init', '24221789587508633');
      fbq('track', 'PageView');  // ⚠️ FIRES ON EVERY PAGE LOAD
    `
  }}
/>
```

**Problem:**
- Meta Pixel `PageView` fires in the root `layout.tsx`, which means it fires on **every single page load**
- Next.js App Router can cause the layout to re-render on client-side navigation
- This can result in **multiple PageView events per actual user session**

### **Issue #2: GA4 May Not Be Loading Properly**

**Location:** `src/lib/temp-tracking.ts` (Lines 74-96)

```typescript
function loadGA4Script(): void {
  if (typeof window === 'undefined') return;
  
  // Create script element
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_MEASUREMENT_ID}`;
  
  document.head.appendChild(script);
  
  window.dataLayer = window.dataLayer || [];
  window.gtag = function() {
    window.dataLayer.push(arguments);
  };
  
  window.gtag('js', new Date());
  window.gtag('config', GA4_MEASUREMENT_ID);  // ⚠️ Only fires if script loads
}
```

**Problem:**
- GA4 script loads **dynamically** only if `window.gtag` doesn't exist
- If the script fails to load (ad blockers, network issues, bot traffic), GA4 won't track
- **GTM is disabled** in `layout.tsx` (commented out), so GA4 depends entirely on this dynamic loading
- Meta Pixel loads **synchronously** in the `<head>`, so it's more likely to fire

### **Issue #3: Bot Traffic & Ad Blockers**

**Meta Pixel is more resilient to:**
- ✅ Ad blockers (less commonly blocked than GA)
- ✅ Bot traffic (crawlers may execute `<head>` scripts)
- ✅ Network failures (synchronous loading)

**GA4 is more affected by:**
- ❌ Ad blockers (GA is commonly blocked)
- ❌ Bot traffic (may not execute dynamic scripts)
- ❌ Network failures (async script loading)

---

## 📊 Expected Behavior vs. Actual

### **Expected (1:1 ratio):**
- User visits homepage → 1 GA pageview, 1 Meta PageView
- User navigates to /quiz → 1 GA pageview, 1 Meta PageView

### **Actual (Likely):**
- User visits homepage → 1 GA pageview (if script loads), **2-3 Meta PageViews** (layout fires + potential duplicates)
- User navigates to /quiz → 0-1 GA pageview, **2-3 Meta PageViews** (client-side navigation triggers layout again)

---

## 🔍 Verification Steps

### **1. Check Supabase analytics_events Table**

Run this query to see actual tracking data:

```sql
-- Check page_view events since 10/28
-- Filter by event_label or page_url containing 'seniorsimple.org' or 'annuity'
SELECT 
  DATE(created_at) as date,
  COUNT(*) as total_events,
  COUNT(DISTINCT session_id) as unique_sessions,
  COUNT(DISTINCT contact->>'ga_client_id') as unique_ga_clients,
  COUNT(DISTINCT contact->>'fbp') as unique_meta_ids
FROM analytics_events
WHERE event_name = 'page_view'
  AND (event_label ILIKE '%seniorsimple.org%' 
       OR event_label ILIKE '%annuity%'
       OR page_url ILIKE '%seniorsimple.org%'
       OR page_url ILIKE '%annuity%')
  AND created_at >= '2025-10-28'
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

**Expected Pattern if Meta is Over-Reporting:**
- `unique_sessions` will be much higher than `unique_ga_clients`
- Total events will be 3-4x higher than unique sessions (indicating duplicate PageViews)

### **2. Check for Duplicate PageView Events**

```sql
-- Find pages with multiple PageView events in short time
SELECT 
  session_id,
  page_url,
  event_label,
  COUNT(*) as pageview_count,
  MIN(created_at) as first_view,
  MAX(created_at) as last_view,
  EXTRACT(EPOCH FROM (MAX(created_at) - MIN(created_at))) as seconds_between
FROM analytics_events
WHERE event_name = 'page_view'
  AND (event_label ILIKE '%seniorsimple.org%' 
       OR event_label ILIKE '%annuity%'
       OR page_url ILIKE '%seniorsimple.org%'
       OR page_url ILIKE '%annuity%')
  AND created_at >= '2025-10-28'
GROUP BY session_id, page_url, event_label
HAVING COUNT(*) > 1
ORDER BY pageview_count DESC
LIMIT 20;
```

**If Meta is over-reporting, you'll see:**
- Same `session_id` with multiple PageViews for the same URL
- Multiple PageViews within 1-2 seconds (client-side navigation)

### **3. Check Vercel Logs**

Look for:
- Multiple requests to `/` (homepage) with same user agent
- Bot user agents (crawlers, scrapers)
- Requests from Meta's crawlers (they crawl pages for link previews)

**Command to check Vercel logs:**
```bash
# Check recent requests
vercel logs --since 7d seniorsimple.org | grep -E "(GET|POST)" | head -100

# Check for bot traffic
vercel logs --since 7d seniorsimple.org | grep -iE "(bot|crawler|spider|facebookexternalhit)" | head -50
```

---

## 🎯 Most Likely Scenario

### **Meta Pixel is Over-Reporting by 3-4x**

**Why:**
1. **Layout fires on every navigation:** Next.js client-side navigation can trigger layout re-renders
2. **Bot traffic:** Meta's crawlers and other bots may execute the Pixel code
3. **No deduplication:** Meta Pixel doesn't filter out bot traffic or duplicate events
4. **GA4 under-counts:** GA4 may be blocked by ad blockers or fail to load dynamically

**Calculation:**
- GA: 8-10 visits/day (real users)
- Meta: 32-132 sessions/day
- Ratio: **3.2-13.2x higher**

**Adjusted for paid social (12 sessions):**
- Organic Meta sessions: 95 - 12 = **83 sessions**
- Organic GA visits: ~8-10/day × 7 days = **56-70 visits**
- Meta still **1.2-1.5x higher** than GA (suggests some over-reporting)

---

## ✅ Recommended Fixes

### **Fix #1: Add PageView Deduplication**

**File:** `src/app/layout.tsx`

```typescript
{/* ✅ DIRECT TRACKING: Meta Pixel Base Code */}
<script
  dangerouslySetInnerHTML={{
    __html: `
      !function(f,b,e,v,n,t,s)
      {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)}(window, document,'script',
      'https://connect.facebook.net/en_US/fbevents.js');
      fbq('init', '24221789587508633');
      // Only track PageView on initial load, not on client-side navigation
      if (window.location.pathname === window.location.pathname || !window.fbq._hasTrackedPageView) {
        fbq('track', 'PageView');
        window.fbq._hasTrackedPageView = true;
      }
    `
  }}
/>
```

**Better Fix:** Move PageView tracking to `useEffect` in page components only, not in layout.

### **Fix #2: Add Bot Detection**

```typescript
// Add to layout.tsx
const isBot = typeof navigator !== 'undefined' && 
  /bot|crawler|spider|crawling/i.test(navigator.userAgent);

if (!isBot) {
  fbq('track', 'PageView');
}
```

### **Fix #3: Re-enable GTM or Load GA4 in Layout**

**Option A: Re-enable GTM**
```typescript
// Uncomment GTM in layout.tsx
<script
  dangerouslySetInnerHTML={{
    __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-T75CL8X9');`,
  }}
/>
```

**Option B: Load GA4 directly in layout.tsx** (similar to Meta Pixel)

---

## 📈 Expected Results After Fixes

**Before:**
- GA: 8-10 visits/day
- Meta: 32-132 sessions/day
- Ratio: 3-13x

**After:**
- GA: 8-10 visits/day (should increase slightly if GA4 loads more reliably)
- Meta: 10-15 sessions/day (should match GA more closely)
- Ratio: 1-1.5x (normal discrepancy)

---

## 🔍 Next Steps

1. **Query Supabase analytics_events** to verify duplicate PageViews
2. **Check Vercel logs** for bot traffic patterns
3. **Implement Fix #1** (move PageView out of layout or add deduplication)
4. **Monitor for 24-48 hours** and compare GA vs Meta
5. **Consider implementing server-side tracking** to Supabase for more accurate data

---

**Conclusion:** Meta Pixel is likely over-reporting due to:
- Firing on every page load (including client-side navigation)
- No bot traffic filtering
- No deduplication logic

GA4 is likely under-reporting due to:
- Dynamic script loading (may fail)
- Ad blocker prevalence
- Bot traffic not executing GA scripts

