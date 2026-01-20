/**
 * SeniorSimple Middleware
 * 
 * TEMPORARILY DISABLED: A/B test middleware removed due to missing dependency
 * TODO: Re-implement A/B testing when shared-utils is available
 * 
 * Previous functionality:
 * - Handled traffic splitting for landing page variants
 * - /quiz → splits to /quiz-book-b (control), /quiz-rmd-v1, or /quiz-rmd-v2
 */

import { NextRequest, NextResponse } from 'next/server';

// Export middleware that does nothing (pass-through)
export const middleware = async (request: NextRequest) => {
  // Pass through all requests without modification
  return NextResponse.next();
};

// Configure which routes the middleware should run on
export const config = {
  matcher: []  // Empty matcher = middleware doesn't run on any routes
};
