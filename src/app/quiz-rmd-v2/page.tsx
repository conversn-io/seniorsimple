'use client';

import { useEffect } from 'react';
import QuizErrorBoundary from '@/components/quiz/QuizErrorBoundary';
import { RMDQuiz } from '@/components/quiz/RMDQuiz';
import { useMinimalFunnelLayout } from '@/hooks/useMinimalFunnelLayout';
import { initializeTracking, trackPageView } from '@/lib/temp-tracking';
import '@/styles/quiz-mobile.css';

export default function QuizRMDV2Page() {
  useMinimalFunnelLayout(); // Sets header to 'funnel' and footer to 'minimal' for lead gen

  useEffect(() => {
    // Set landing page for booking backend routing
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('landing_page', '/quiz-rmd-v2');
      sessionStorage.setItem('landing_page_variant', 'rmd_v2');
      sessionStorage.setItem('entryVariant', 'immediate_q1');
      console.log('📍 Landing page set to /quiz-rmd-v2 (RMD variant B - immediate_q1) for booking funnel');
    }

    // Initialize tracking
    initializeTracking();
    
    // Track pageview with variant info
    trackPageView('RMD Quiz Landing Page V2', '/quiz-rmd-v2');
    
    // Track variant assignment in GA4
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'landing_page_variant_view', {
        landing_page_variant: 'rmd_v2',
        entry_variant: 'immediate_q1',
        page_path: '/quiz-rmd-v2',
        event_category: 'ab_testing'
      });
    }
  }, []);

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

