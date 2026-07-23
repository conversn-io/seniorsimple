/**
 * SeniorSimple Split-Test Middleware
 *
 * Two split-test types coexist:
 *
 * 1. QUIZ (redirect model, shared-utils/ab-test-middleware.ts):
 *    /quiz → splits to /quiz-book-b (control), /quiz-rmd-v1, /quiz-rmd-v2
 *
 * 2. ADVERTORIAL (slot-swap model, shared-utils/layered-flags.ts):
 *    /lp/* → assigns ad_header + ad_headline cookies, no redirect.
 *    The /lp/[slug] page reads the cookies server-side and renders the
 *    assigned variant into the header + H1 slots. See
 *    shared-utils/ADVERTORIAL_SPLIT_TESTING.md for the full contract.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createSplitTestMiddleware } from '@/utils/ab-test-middleware';
import { resolveFlags, applyFlagAssignments } from '@/utils/layered-flags';
import { buildAdvertorialFlagsConfig } from '@/lib/advertorial-flags-config';
import {
  readInboundSubsFromSearchParams,
  buildSsAttrValue,
  SS_ATTR_COOKIE,
  SS_ATTR_TTL_DAYS,
} from '@/advertorial-kit/lib/inbound-subs';

/** W3 — sticky per-visitor seed for kit-native split-tests. */
const KIT_SEED_COOKIE = 'ss_kit_seed';

/** UUID-ish, edge-safe. crypto.randomUUID is available in the edge runtime. */
function generateKitSeed(): string {
  const uuid =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
  return `kit_${uuid.replace(/-/g, '')}`;
}

// Create middleware with SeniorSimple-specific configuration
const sharedMiddleware = createSplitTestMiddleware({
  entryPath: '/quiz',
  variants: {
    control: '/quiz-book-b',
    rmd_v1: '/quiz-rmd-v1',
    rmd_v2: '/quiz-rmd-v2'
  },
  cookieName: 'ss_landing_page_variant',
  siteKey: 'seniorsimple.org',
  defaultVariant: 'control',
  weights: {
    control: 0.333,
    rmd_v1: 0.333,
    rmd_v2: 0.334
  },
  cookieTtlDays: 30,
  queryParamName: 'variant',
  allowQueryOverride: true
});

const advertorialConfig = buildAdvertorialFlagsConfig('seniorsimple.org');

export const middleware = async (request: NextRequest) => {
  const { pathname } = request.nextUrl;
  console.log('[Middleware] Request pathname:', pathname);

  // 1. Advertorial slot-swap allocation on /lp/*.
  //    No redirect — just stamps ad_header + ad_headline cookies (and
  //    debug headers) so the LP's server component can render the
  //    assigned variant into its slots.
  //
  //    First-visit correctness: response.cookies.set() writes for the NEXT
  //    request, so cookies() in the server component would read null on
  //    first visit and always fall back to control — skewing the test.
  //    Mirror the assignment onto request.cookies and forward via
  //    NextResponse.next({ request }) so the SSR render for THIS request
  //    sees the newly allocated variant.
  if (pathname.startsWith('/lp/')) {
    // W3 — kit split-test seed cookie. Stamped once per visitor across ALL
    // kit-native slugs (per-slug bucketing happens at render via hash(seed +
    // slug)). Legacy slugs are unaffected — they ignore this cookie.
    // Mirroring onto request.cookies makes the seed visible to THIS request's
    // SSR (matches the legacy first-visit correctness pattern below).
    let kitSeed = request.cookies.get(KIT_SEED_COOKIE)?.value ?? null;
    let stampKitSeed = false;
    if (!kitSeed || kitSeed.length < 8) {
      kitSeed = generateKitSeed();
      stampKitSeed = true;
      request.cookies.set(KIT_SEED_COOKIE, kitSeed);
    }

    // Attribution-leak mitigation. If this LP request carries inbound subs in
    // its query string, stamp ss_attr so the NEXT request (which in-app browsers
    // often strip params on) can recover the attribution from cookie. First-write
    // wins per-slot when the URL has more info than the existing cookie; empty
    // slots stay untouched from the prior visit.
    const inbound = readInboundSubsFromSearchParams(
      Object.fromEntries(request.nextUrl.searchParams.entries())
    );
    const s7FromUrl = request.nextUrl.searchParams.get('s7') || null;
    const ssAttrValue = buildSsAttrValue(inbound, s7FromUrl);

    const assignments = resolveFlags(request, advertorialConfig);
    for (const a of Object.values(assignments)) {
      request.cookies.set(a.cookieName, a.variant);
    }
    const response = applyFlagAssignments(
      NextResponse.next({ request }),
      assignments,
      'seniorsimple.org'
    );
    if (stampKitSeed) {
      response.cookies.set(KIT_SEED_COOKIE, kitSeed, {
        path: '/',
        sameSite: 'lax',
        httpOnly: false,
        maxAge: 60 * 60 * 24 * 180, // 180d — long enough to keep the split-test cohort sticky.
      });
    }
    // Only stamp ss_attr when the URL actually has subs. Never clobber an existing
    // (richer) cookie with an emptier URL — that would undo prior attribution.
    if (ssAttrValue) {
      response.cookies.set(SS_ATTR_COOKIE, ssAttrValue, {
        path: '/',
        sameSite: 'lax',
        httpOnly: false, // /out reads server-side; leaving false so client analytics can inspect too.
        secure: true,
        maxAge: 60 * 60 * 24 * SS_ATTR_TTL_DAYS,
      });
      // Also mirror onto request.cookies so THIS request's SSR reads the fresh cookie
      // (matches the KIT_SEED_COOKIE first-visit correctness pattern above).
      request.cookies.set(SS_ATTR_COOKIE, ssAttrValue);
    }
    return response;
  }

  // 2. Quiz-funnel entry-path split (existing behavior).
  const result = await sharedMiddleware(request);
  console.log('[Middleware] Result:', result);

  if (!result) {
    console.log('[Middleware] No result, passing through');
    return NextResponse.next();
  }

  if (result.status === 307 && result.url) {
    const response = NextResponse.redirect(new URL(result.url, request.url));

    if (result.setCookie) {
      const expires = new Date();
      expires.setTime(expires.getTime() + result.setCookie.ttlDays * 24 * 60 * 60 * 1000);
      response.cookies.set(result.setCookie.name, result.setCookie.value, {
        expires,
        path: '/',
        sameSite: 'lax',
        httpOnly: false
      });
    }

    if (result.headers) {
      Object.entries(result.headers).forEach(([key, value]) => {
        response.headers.set(key, value as string);
      });
    }

    return response;
  }

  return NextResponse.next();
};

export const config = {
  matcher: ['/quiz', '/lp/:path*']
};
