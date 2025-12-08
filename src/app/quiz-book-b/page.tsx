'use client'

import { useEffect } from 'react'
import Quiz from '../../components/pages/Quiz'

export default function QuizBookNoOtpPage() {
  useEffect(() => {
    // Track landing page variant for direct confirmation (no calendar)
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('landing_page', '/quiz-book-b')
      console.log('📍 Landing page set to /quiz-book-b (no-OTP, direct confirmation)')
    }
  }, [])

  // Render quiz with OTP skipped (direct to confirmation after submit)
  return <Quiz skipOTP={true} />
}

