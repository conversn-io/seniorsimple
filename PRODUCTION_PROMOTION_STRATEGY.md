# 🏗️ Production Promotion Strategy - Feature Branch to Production

## Executive Summary

**Problem**: `/content/` routes work in production but fail in preview, despite adding dynamic rendering configuration.

**Goal**: Promote feature branch (`feature/call-booking-funnel`) changes to production without regressing working production routes.

**Risk Level**: HIGH - Production routes are working, preview routes are not.

---

## Root Cause Analysis

### Why Preview Fails But Production Works

1. **Environment Variables**
   - Preview may have missing or incorrect `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Production has correct env vars configured
   - **Action**: Verify preview environment variables match production

2. **Database Connection**
   - Preview may not have access to the same Supabase database
   - Production has established connection
   - **Action**: Verify database connectivity in preview

3. **Build-Time vs Runtime**
   - Production may have cached/ISR'd routes from previous builds
   - Preview tries to build fresh, fails if database unavailable
   - **Action**: Dynamic rendering should fix this, but needs verification

4. **Site ID Filtering**
   - Content route may need `site_id = 'seniorsimple'` filter
   - Production may have different data or no filter needed
   - **Action**: Check if articles table query needs site_id filter

---

## Recommended Promotion Strategy

### Option 1: **Incremental Cherry-Pick (SAFEST)** ⭐ RECOMMENDED

**Strategy**: Cherry-pick only safe, non-breaking changes to main branch.

**Steps**:

1. **Create safety branch from main**:
   ```bash
   git checkout main
   git pull origin main
   git checkout -b production-safe-promotion
   ```

2. **Cherry-pick footer updates** (low risk):
   ```bash
   git cherry-pick <commit-hash-for-footer-updates>
   ```

3. **Test footer changes in production**:
   - Deploy to preview first
   - Verify footer links work
   - If successful, merge to main

4. **Cherry-pick call booking features** (medium risk):
   ```bash
   git cherry-pick <commit-hash-for-call-booking>
   ```

5. **Investigate and fix content route issue separately**:
   - Create separate branch: `fix/content-route-preview`
   - Debug why preview fails
   - Fix root cause
   - Test thoroughly
   - Then merge to main

**Pros**:
- ✅ Zero risk to production routes
- ✅ Can test each change independently
- ✅ Easy rollback if issues occur
- ✅ Allows fixing preview issue separately

**Cons**:
- ⚠️ More manual work
- ⚠️ Requires identifying specific commits

---

### Option 2: **Fix Preview Issue First, Then Merge** (BALANCED)

**Strategy**: Fix the preview issue before promoting to production.

**Steps**:

1. **Investigate preview failure**:
   - Check Vercel preview environment variables
   - Verify database connection in preview
   - Check build logs for errors
   - Test database query directly

2. **Fix root cause**:
   - Add site_id filter if needed
   - Fix environment variable configuration
   - Add error handling/logging
   - Test in preview

3. **Once preview works, merge feature branch**:
   ```bash
   git checkout main
   git merge feature/call-booking-funnel
   git push origin main
   ```

**Pros**:
- ✅ Fixes the underlying issue
- ✅ Ensures both preview and production work
- ✅ Clean merge path

**Cons**:
- ⚠️ Delays production promotion
- ⚠️ May require debugging time

---

### Option 3: **Merge with Feature Flag** (ADVANCED)

**Strategy**: Merge feature branch but use feature flags to control rollout.

**Steps**:

1. **Add feature flag for content routes**:
   ```typescript
   const useNewContentRoute = process.env.NEXT_PUBLIC_ENABLE_NEW_CONTENT_ROUTE === 'true'
   ```

2. **Merge feature branch to main**

3. **Deploy with feature flag OFF** (production uses old route)

4. **Test in preview with feature flag ON**

5. **Gradually enable in production once verified**

**Pros**:
- ✅ Can merge everything at once
- ✅ Safe rollback via feature flag
- ✅ Gradual rollout possible

**Cons**:
- ⚠️ Requires feature flag infrastructure
- ⚠️ More complex codebase

---

## Immediate Action Plan

### Step 1: Verify Preview Environment Variables (CRITICAL)

**Check Vercel Dashboard**:
1. Go to: https://vercel.com/conversns-projects/seniorsimple/settings/environment-variables
2. Verify preview environment has:
   - `NEXT_PUBLIC_SUPABASE_URL` = `https://vpysqshhafthuxvokwqj.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = (correct anon key)
   - `SUPABASE_SERVICE_ROLE_KEY` = (if needed)

**If missing, add them to Preview environment specifically**.

### Step 2: Test Database Connection in Preview

Create a test endpoint to verify database connectivity:

```typescript
// src/app/api/test-db/route.ts
import { supabase } from '@/lib/supabase'

export async function GET() {
  const { data, error } = await supabase
    .from('articles')
    .select('id, slug, title')
    .eq('site_id', 'seniorsimple')
    .eq('status', 'published')
    .limit(1)
  
  return Response.json({ data, error: error?.message })
}
```

Test in preview: `https://preview-url.vercel.app/api/test-db`

### Step 3: Add Site ID Filter to Content Route

**Hypothesis**: Preview may need explicit `site_id` filter.

**Fix**:
```typescript
// src/app/content/[slug]/page.tsx
const { data: content, error } = await supabase
  .from('articles')
  .select('*')
  .eq('slug', slug)
  .eq('status', 'published')
  .eq('site_id', 'seniorsimple') // ADD THIS
  .single();
```

### Step 4: Add Error Logging

Add comprehensive error logging to diagnose:

```typescript
if (error || !content) {
  console.error('Content route error:', {
    slug,
    error: error?.message,
    code: error?.code,
    details: error?.details,
    env: {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    }
  });
  notFound();
}
```

---

## Recommended Path Forward

### Phase 1: Immediate (Today)
1. ✅ **Verify preview environment variables** in Vercel dashboard
2. ✅ **Add site_id filter** to content route query
3. ✅ **Add error logging** to content route
4. ✅ **Test in preview** after fixes

### Phase 2: Safe Promotion (This Week)
1. ✅ **Cherry-pick footer updates** to main (low risk)
2. ✅ **Deploy footer changes** to production
3. ✅ **Verify footer links work** in production

### Phase 3: Call Booking (Next Week)
1. ✅ **Test call booking thoroughly** in preview
2. ✅ **Cherry-pick call booking** to main
3. ✅ **Deploy call booking** to production

### Phase 4: Content Route Fix (Separate)
1. ✅ **Debug preview issue** in separate branch
2. ✅ **Fix root cause** (env vars, site_id, etc.)
3. ✅ **Test thoroughly** in preview
4. ✅ **Merge fix** to main once verified

---

## Rollback Plan

If production breaks after merge:

1. **Immediate Rollback**:
   ```bash
   git revert <merge-commit-hash>
   git push origin main
   ```

2. **Partial Rollback** (if only specific feature breaks):
   ```bash
   git revert <specific-commit-hash>
   git push origin main
   ```

3. **Vercel Rollback**:
   - Go to Vercel Dashboard → Deployments
   - Find last working production deployment
   - Click "Promote to Production"

---

## Success Criteria

Before promoting to production:

- [ ] Preview routes work correctly
- [ ] All footer links resolve (no 404s)
- [ ] Database connection verified in preview
- [ ] Environment variables match production
- [ ] Build logs show no errors
- [ ] Test database query returns expected results

---

## Risk Assessment

| Change | Risk Level | Impact | Mitigation |
|--------|-----------|--------|------------|
| Footer updates | LOW | Low | Cherry-pick separately, test in preview |
| Call booking | MEDIUM | Medium | Test thoroughly, feature flag option |
| Content route fix | HIGH | High | Fix in separate branch, test extensively |

---

## Final Recommendation

**Use Option 1: Incremental Cherry-Pick**

1. **Today**: Fix preview environment variables and add site_id filter
2. **This Week**: Cherry-pick footer updates to main (safe)
3. **Next Week**: Cherry-pick call booking after thorough testing
4. **Separate**: Fix content route issue in dedicated branch

This approach minimizes risk to production while allowing incremental improvements.

---

## Questions to Answer Before Merging

1. ✅ Are preview environment variables configured correctly?
2. ✅ Does the database query need `site_id` filter?
3. ✅ Are there any build-time errors in preview logs?
4. ✅ Can we test database connectivity in preview?
5. ✅ What's the difference between production and preview Supabase config?

---

## Contact Points

- **Vercel Dashboard**: https://vercel.com/conversns-projects/seniorsimple
- **Supabase Dashboard**: https://supabase.com/dashboard/project/vpysqshhafthuxvokwqj
- **GitHub Repo**: https://github.com/conversn-io/seniorsimple





