# Booking Funnel Fix - Hard Redirect Issue

## Problem Identified

**Issue:** Booking funnel was not working - users were always redirected to `/quiz-submitted` instead of `/booking` when landing on `/quiz-book`.

**Root Cause:** 
- Hard redirect `router.push('/quiz-submitted')` in `submitQuizToDatabase()` function (line 908)
- This redirect happened **before** the `useEffect` conditional redirect logic could run
- The hard redirect bypassed the landing page check entirely

## The Flow (Before Fix)

```
User lands on /quiz-book
  ↓
sessionStorage.setItem('landing_page', '/quiz-book') ✅
  ↓
Quiz completes
  ↓
submitQuizToDatabase() called
  ↓
Hard redirect: router.push('/quiz-submitted') ❌ BYPASSES CONDITIONAL LOGIC
  ↓
useEffect never gets chance to check landing_page
```

## The Flow (After Fix)

```
User lands on /quiz-book
  ↓
sessionStorage.setItem('landing_page', '/quiz-book') ✅
  ↓
Quiz completes
  ↓
submitQuizToDatabase() called
  ↓
setShowResults(true) ✅ (no hard redirect)
  ↓
useEffect runs and checks landing_page ✅
  ↓
Conditional redirect: router.push('/booking?email=...') ✅
```

## Code Changes

### Removed Hard Redirect

**Before:**
```typescript
setTimeout(() => {
  setShowProcessing(false);
  setShowResults(true);
  sessionStorage.setItem('quiz_answers', JSON.stringify(answers));
  try { router.push('/quiz-submitted'); } catch {} // ❌ HARD REDIRECT
}, 2000);
```

**After:**
```typescript
// Store quiz answers for personalized thank you message
sessionStorage.setItem('quiz_answers', JSON.stringify(answers));

setTimeout(() => {
  setShowProcessing(false);
  setShowResults(true);
  // NOTE: Do NOT redirect here - let the useEffect handle conditional redirect
  // based on landing_page in sessionStorage (booking funnel vs standard flow)
}, 2000);
```

## How It Works Now

1. **User lands on `/quiz-book`:**
   - `quiz-book/page.tsx` sets `sessionStorage.setItem('landing_page', '/quiz-book')`

2. **Quiz completes:**
   - `submitQuizToDatabase()` stores answers and sets `showResults = true`
   - **No hard redirect** - lets `useEffect` handle it

3. **useEffect runs:**
   - Checks `sessionStorage.getItem('landing_page')`
   - If `=== '/quiz-book'` → redirects to `/booking?email=...`
   - Otherwise → redirects to `/quiz-submitted`

## Testing

After deployment, test:

1. Visit `/quiz-book`
2. Complete quiz
3. Verify redirect to `/booking` (not `/quiz-submitted`)
4. Check browser console for redirect logs:
   - `🎯 Determining Redirect Destination`
   - `📅 Redirecting to Booking Page (Booking Funnel)`

## Files Changed

- `src/components/quiz/AnnuityQuiz.tsx` - Removed hard redirect from `submitQuizToDatabase()`

## Related Fixes

- ✅ Added `answers` to `useEffect` dependency array (previous commit)
- ✅ Removed hard redirect (this commit)

---

**Status:** ✅ Fixed - Ready for testing





