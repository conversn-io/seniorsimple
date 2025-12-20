'use client'

import { useEffect } from 'react'
import Quiz from '../../components/pages/Quiz'

export default function QuizBookPage() {
  useEffect(() => {
    // Track landing page for conditional routing
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('landing_page', '/quiz-book')
      console.log('📍 Landing page set to /quiz-book for booking funnel')
    }
  }, [])

  return <Quiz />
}





