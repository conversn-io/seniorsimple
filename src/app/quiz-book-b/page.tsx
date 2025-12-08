'use client'

import { useEffect } from 'react'
import Quiz from '../../components/pages/Quiz'

export default function QuizBookNoOtpPage() {
  useEffect(() => {
    // Track landing page variant for direct confirmation (no calendar)
    if (typeof window !== 'undefined') {
      // Use the same landing_page key as /quiz-book so the booking funnel triggers,
      // but keep skipOTP true to bypass OTP and still route to /booking.
      sessionStorage.setItem('landing_page', '/quiz-book')
      console.log('📍 Landing page set to /quiz-book (no-OTP variant) for booking funnel')
    }
  }, [])

  // Render quiz with OTP skipped (direct to confirmation after submit)
  return <Quiz skipOTP={true} />
}

