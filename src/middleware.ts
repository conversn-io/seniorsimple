/**
 * SeniorSimple A/B Test Middleware
 * 
 * Handles traffic splitting for landing page variants:
 * - /quiz → splits to /quiz-book-b (control), /quiz-rmd-v1, or /quiz-rmd-v2
 * 
 * Uses shared middleware utility from shared-utils/ab-test-middleware.ts
 */

import { NextRequest, NextResponse } from 'next/server';
import { createSplitTestMiddleware } from './utils/ab-test-middleware';

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

// Export middleware with proper Next.js types
export const middleware = async (request: NextRequest) => {
  // Debug logging
  console.log('[Middleware] Request pathname:', request.nextUrl.pathname);
  console.log('[Middleware] Request URL:', request.url);
  
  const result = await sharedMiddleware(request);
  console.log('[Middleware] Result:', result);
  
  // If no result, pass through
  if (!result) {
    console.log('[Middleware] No result, passing through');
    return NextResponse.next();
  }
  
  // Create redirect response
  if (result.status === 307 && result.url) {
    const response = NextResponse.redirect(new URL(result.url, request.url));
    
    // Set cookie if specified
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
    
    // Set custom headers
    if (result.headers) {
      Object.entries(result.headers).forEach(([key, value]) => {
        response.headers.set(key, value as string);
      });
    }
    
    return response;
  }
  
  return NextResponse.next();
};

// Configure which routes the middleware should run on
export const config = {
  matcher: '/quiz'
};
