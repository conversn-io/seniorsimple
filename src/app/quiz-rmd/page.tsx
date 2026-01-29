'use client';

import { useEffect } from 'react';
import type { Metadata } from 'next';
import QuizErrorBoundary from '@/components/quiz/QuizErrorBoundary';
import { RMDQuiz } from '@/components/quiz/RMDQuiz';
import { useMinimalFunnelLayout } from '@/hooks/useMinimalFunnelLayout';
import '@/styles/quiz-mobile.css';

// Note: Metadata export doesn't work with 'use client' - handled via useEffect
export default function QuizRMDPage() {
  useMinimalFunnelLayout(); // Sets header to 'funnel' and footer to 'minimal' for lead gen

  const handleQuizReset = () => {
    window.location.reload();
  };

  return (
    <QuizErrorBoundary onReset={handleQuizReset}>
      <div className="min-h-screen bg-[#F5F5F0]">
        <section className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
          <RMDQuiz />
        </section>
      </div>
    </QuizErrorBoundary>
  );
}

