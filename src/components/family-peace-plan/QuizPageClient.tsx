'use client';

import QuizErrorBoundary from '@/components/quiz/QuizErrorBoundary';
import { QuizFlow } from './QuizFlow';

/**
 * Thin client wrapper so the server-side page.tsx can keep exporting `metadata`
 * while still passing a client-side callback (window.location.reload) to
 * QuizErrorBoundary. Cross-boundary function props aren't allowed in App Router.
 */
export function QuizPageClient() {
  return (
    <QuizErrorBoundary onReset={() => window.location.reload()}>
      <QuizFlow />
    </QuizErrorBoundary>
  );
}
