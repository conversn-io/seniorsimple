'use client';

import { useEffect } from 'react';
import QuizErrorBoundary from '@/components/quiz/QuizErrorBoundary';
import { RMDQuiz } from '@/components/quiz/RMDQuiz';
import { useFunnelLayout } from '@/hooks/useFunnelFooter';
import { initializeTracking, trackPageView } from '@/lib/temp-tracking';
import '@/styles/quiz-mobile.css';

export default function QuizRMDV1Page() {
  useFunnelLayout(); // Sets header and footer to 'funnel'

  useEffect(() => {
    // Set landing page for booking backend routing
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('landing_page', '/quiz-rmd-v1');
      sessionStorage.setItem('landing_page_variant', 'rmd_v1');
      sessionStorage.setItem('entryVariant', 'start_button');
      console.log('📍 Landing page set to /quiz-rmd-v1 (RMD variant A - start_button) for booking funnel');
    }

    // Initialize tracking
    initializeTracking();
    
    // Track pageview with variant info
    trackPageView('RMD Quiz Landing Page V1', '/quiz-rmd-v1');
    
    // Track variant assignment in GA4
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'landing_page_variant_view', {
        landing_page_variant: 'rmd_v1',
        entry_variant: 'start_button',
        page_path: '/quiz-rmd-v1',
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

