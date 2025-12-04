# Analytics Query Results Analysis

**Date:** November 3, 2025  
**Queries Run:** 1-8 (Queries 1, 4, 5, 8 need fixes; Queries 2, 3, 6, 7 completed)

---

## ✅ Completed Queries

### **Query 2: Duplicate PageView Detection**
**Result:** ✅ **No rows returned**

**Analysis:**
- ✅ **No duplicate PageViews detected** - This is a good sign!
- No same `session_id` with multiple PageViews for the same URL
- No multiple PageViews within 5 seconds
- **Conclusion:** Meta Pixel is NOT creating duplicate PageViews in Supabase analytics_events

### **Query 3: Session Analysis**
**Result:** ✅ **40 sessions found, all marked "NORMAL"**

**Key Findings:**
- All sessions have **1-2 events** (mostly 1 event)
- Only 1 session has 2 events: `quiz_1761943442036_y31qa4mis` (0.2 seconds between events)
- All other sessions have exactly **1 event per session**
- Session durations are **0 seconds** (instantaneous events)
- **Conclusion:** No duplicate event patterns detected

**Pattern Observed:**
- All sessions start with `quiz_` prefix (likely quiz-related events)
- Events are very short-lived (0-0.2 seconds)
- No suspicious high event counts

---

## ⚠️ Queries Needing Fixes

### **Query 1, 4, 5, 8: Contact Column Reference**
**Error:** `column "contact" does not exist`

**Fix Applied:**
- Changed `contact->>'ga_client_id'` → `properties->'contact'->>'ga_client_id'`
- Changed `contact->>'fbp'` → `properties->'contact'->>'fbp'`
- Changed `contact->>'fbc'` → `properties->'contact'->>'fbc'`

**Status:** ✅ **Fixed in SQL file** - Re-run these queries

---

## 🔍 Initial Findings

### **What We Know:**

1. **No duplicate PageViews in Supabase**
   - Query 2 returned no duplicates
   - Query 3 shows normal event patterns (1-2 events per session)

2. **Events are quiz-related**
   - All session IDs start with `quiz_`
   - These are likely `quiz_start` or `lead_form_submit` events, not `page_view` events

3. **Missing page_view events**
   - Queries 2, 3, 6, 7 all filtered for `event_name = 'page_view'` but found no results
   - This suggests **page_view events are NOT being saved to Supabase analytics_events**

---

## 🎯 Critical Discovery

### **The Real Issue: Meta Pixel vs GA4 Discrepancy**

**Hypothesis:**
- Meta Pixel fires `PageView` in `layout.tsx` on every page load
- These PageViews are tracked by Meta but **NOT saved to Supabase analytics_events**
- GA4 tracking may be failing or not loading properly
- **Supabase analytics_events only contains quiz events, not page_view events**

**This explains:**
- ✅ Why Query 2 found no duplicate PageViews (they don't exist in Supabase)
- ✅ Why Meta reports 32-132 sessions (Meta Pixel tracks all page loads)
- ✅ Why GA reports 8-10 visits (GA4 may not be loading or is blocked)

---

## 📊 Next Steps

### **1. Re-run Fixed Queries (1, 4, 5, 8)**
After fixing the `properties->'contact'` references, these queries should work.

### **2. Check if page_view Events Exist at All**

Run this query to see what event types exist:

```sql
SELECT 
  event_name,
  COUNT(*) as total_events,
  COUNT(DISTINCT session_id) as unique_sessions,
  MIN(created_at) as first_seen,
  MAX(created_at) as last_seen
FROM analytics_events
WHERE (event_label ILIKE '%seniorsimple.org%' 
       OR event_label ILIKE '%annuity%'
       OR page_url ILIKE '%seniorsimple.org%'
       OR page_url ILIKE '%annuity%')
  AND created_at >= '2025-10-28'
GROUP BY event_name
ORDER BY total_events DESC;
```

### **3. Check Meta Pixel Configuration**

The discrepancy is likely because:
- Meta Pixel fires in `layout.tsx` (fires on every page load)
- GA4 loads dynamically (may fail to load)
- PageView events are NOT being sent to Supabase (only quiz events are)

### **4. Verify GA4 Loading**

Check if GA4 is actually loading by looking at:
- Browser console for GA4 errors
- Vercel logs for GA4 script loading
- Network tab for gtag.js requests

---

## 💡 Likely Root Cause

**Meta Pixel is over-reporting because:**
1. ✅ Fires on every page load (including client-side navigation)
2. ✅ No bot filtering
3. ✅ More resilient to ad blockers than GA4

**GA4 is under-reporting because:**
1. ✅ Dynamic script loading may fail
2. ✅ Commonly blocked by ad blockers
3. ✅ May not load for bot traffic

**Supabase analytics_events:**
1. ✅ Only contains quiz events (not page_view events)
2. ✅ This is why queries found no duplicates (page_view events don't exist in Supabase)

---

## 🔧 Recommended Actions

1. **Add page_view tracking to Supabase** - Currently only quiz events are tracked
2. **Fix Meta Pixel deduplication** - Move PageView out of layout.tsx
3. **Improve GA4 loading** - Load GA4 in layout.tsx (like Meta Pixel)
4. **Add bot detection** - Filter out bot traffic before tracking

---

**Next:** Re-run Queries 1, 4, 5, 8 with the fixed column references to see GA vs Meta client ID comparison.




