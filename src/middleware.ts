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
import { createSplitTestMiddleware } from './utils/ab-test-middleware';
import { resolveFlags, applyFlagAssignments } from './utils/layered-flags';
import { buildAdvertorialFlagsConfig } from './lib/advertorial-flags-config';

// Explicitly set Edge Runtime for Next.js 15
export const runtime = 'edge';

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
  if (pathname.startsWith('/lp/')) {
    const assignments = resolveFlags(request, advertorialConfig);
    return applyFlagAssignments(NextResponse.next(), assignments, 'seniorsimple.org');
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
