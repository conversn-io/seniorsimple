# Booking Funnel Deployment Issue

## Problem Identified

**Issue:** Booking funnel code is committed but **NOT deployed to production**

**Root Cause:**
- Booking funnel code is on `feature/call-booking-funnel` branch
- Production deploys from `main` branch
- **15 commits** are ahead of `main` on the feature branch
- The booking funnel redirect logic is **not on `main`**

## Current Status

### ✅ Code is Committed
- All booking funnel code is committed to `feature/call-booking-funnel`
- Includes:
  - `/quiz-book` page (sets sessionStorage)
  - `/booking` page (calendar widget)
  - Conditional redirect logic in `AnnuityQuiz.tsx`

### ❌ Code is NOT on Main
- Production site (https://seniorsimple.org) deploys from `main` branch
- `main` branch does NOT have the booking funnel code
- Testing on production will show the old behavior (no booking page)

## Solution Options

### Option 1: Merge Feature Branch to Main (Recommended)

```bash
# Switch to main
git checkout main
git pull origin main

# Merge feature branch
git merge feature/call-booking-funnel

# Push to main (triggers production deployment)
git push origin main
```

**Result:** Production will have booking funnel code

### Option 2: Test on Preview Deployment

If Vercel created a preview deployment from `feature/call-booking-funnel`:

1. Check Vercel Dashboard → Deployments
2. Find deployment from `feature/call-booking-funnel` branch
3. Test on preview URL (not production)

**Result:** Can test without affecting production

### Option 3: Deploy Feature Branch to Production

If you want to deploy the feature branch directly:

1. In Vercel Dashboard → Settings → Git
2. Change production branch to `feature/call-booking-funnel`
3. Or promote preview deployment to production

**Result:** Production uses feature branch

## Commits Not on Main

These 15 commits include the booking funnel:

```
1565c94 docs: add deployment readiness documentation
491e633 refactor: remove obsolete revalidation code
ffba920 feat: add article publish webhook with IndexNow
22586c2 feat: implement IndexNow protocol
af9a3e1 feat: add sitemap and robots.txt
7686021 fix: wrap useSearchParams in Suspense boundary
a5cfac4 fix: handle null case for useSearchParams
1ec3887 fix: pass email in URL query param from quiz to booking
80201fe fix: use useState for calendar URL
11a0076 fix: simplify to use exact GHL field name 'email'
9793f27 fix: update URL parameters for GHL form field names
ac09968 fix: store contact data in multiple formats
612ad64 debug: add comprehensive email tracking
50f665b feat: implement URL parameter data passing
6a9ac48 feat: implement call booking funnel with conditional routing
```

## Bug Fix Applied

**Issue:** `useEffect` dependency array missing `answers`

**Fix:** Added `answers` to dependency array:
```typescript
}, [showResults, router, quizSessionId, answers]);
```

**Why:** Ensures email extraction uses current `answers` value

## Next Steps

1. **Decide:** Merge to main or test on preview?
2. **If merging:** Run merge commands above
3. **If testing:** Use preview URL from Vercel
4. **Verify:** Test `/quiz-book` path after deployment

## Testing Checklist

After deployment to production:

- [ ] Visit `/quiz-book` page
- [ ] Complete quiz
- [ ] Verify redirect to `/booking` (not `/quiz-submitted`)
- [ ] Check browser console for redirect logs
- [ ] Verify email is passed in URL parameter
- [ ] Verify calendar widget loads with email

---

**Status:** Code ready, needs deployment to main branch





