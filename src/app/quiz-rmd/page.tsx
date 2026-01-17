'use client';

import { useEffect } from 'react';
import type { Metadata } from 'next';
import QuizErrorBoundary from '@/components/quiz/QuizErrorBoundary';
import { RMDQuiz } from '@/components/quiz/RMDQuiz';
import { useFunnelLayout } from '@/hooks/useFunnelFooter';
import '@/styles/quiz-mobile.css';

// Note: Metadata export doesn't work with 'use client' - handled via useEffect
export default function QuizRMDPage() {
  useFunnelLayout(); // Sets header and footer to 'funnel'

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

