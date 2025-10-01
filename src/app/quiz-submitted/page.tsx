'use client'

import { useEffect } from 'react'
import ExpectCall from '../../components/pages/ExpectCall'
import { initializeTracking, trackPageView } from '@/lib/temp-tracking'

export default function QuizSubmittedPage() {
  useEffect(() => {
    initializeTracking()
    trackPageView('Quiz Submitted', '/quiz-submitted')
  }, [])

  return <ExpectCall />
}