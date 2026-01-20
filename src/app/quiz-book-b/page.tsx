'use client'

import { useEffect } from 'react'
import Quiz from '../../components/pages/Quiz'
import { initializeTracking, trackPageView } from '@/lib/temp-tracking'

export default function QuizBookNoOtpPage() {
  useEffect(() => {
    // Track landing page variant for direct confirmation (no calendar)
    if (typeof window !== 'undefined') {
      // Use the same landing_page key as /quiz-book so the booking funnel triggers,
      // but keep skipOTP true to bypass OTP and still route to /booking.
      sessionStorage.setItem('landing_page', '/quiz-book')
      sessionStorage.setItem('landing_page_variant', 'control')
      console.log('📍 Landing page set to /quiz-book (no-OTP variant) for booking funnel')
      
      // Initialize tracking
      initializeTracking();
      
      // Track pageview with variant info
      trackPageView('Quiz Book B Landing Page', '/quiz-book-b');
      
      // Track variant assignment in GA4
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'landing_page_variant_view', {
          landing_page_variant: 'control',
          page_path: '/quiz-book-b',
          event_category: 'ab_testing'
        });
      }
    }
  }, [])

  // Render quiz with OTP skipped (direct to confirmation after submit)
  return <Quiz skipOTP={true} />
}

