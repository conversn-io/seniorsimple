'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useFunnelLayout } from '@/hooks/useFunnelFooter'

interface QuizAnswers {
  personalInfo?: {
    firstName?: string
    lastName?: string
    email?: string
    phone?: string
  }
  locationInfo?: {
    zipCode?: string
    state?: string
    stateName?: string
  }
  retirementSavings?: number
  ageRange?: string
  retirementTimeline?: string
  riskTolerance?: string
  [key: string]: any
}

export default function BookingPage() {
  const router = useRouter()
  useFunnelLayout() // Sets header and footer to 'funnel'
  const [contactData, setContactData] = useState<QuizAnswers | null>(null)
  const [isCalendarLoaded, setIsCalendarLoaded] = useState(false)

  useEffect(() => {
    // Get quiz answers from sessionStorage
    const storedAnswers = sessionStorage.getItem('quiz_answers')
    if (storedAnswers) {
      try {
        const answers = JSON.parse(storedAnswers)
        setContactData(answers)
        console.log('📋 Quiz Answers Retrieved for Booking Page:', answers)
      } catch (error) {
        console.error('❌ Error parsing quiz answers:', error)
      }
    } else {
      // If no quiz data, redirect back to quiz
      console.warn('⚠️ No quiz data found, redirecting to quiz')
      router.push('/quiz')
    }
  }, [router])

  // Listen for calendar booking completion
  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleMessage = (event: MessageEvent) => {
      // Listen for messages from Conversn.io widget
      // This is a placeholder - actual implementation depends on Conversn.io API
      if (event.data && event.data.type === 'booking_complete') {
        console.log('✅ Booking completed, redirecting to thank-you page')
        router.push('/quiz-submitted')
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [router])

  // Attempt to pass data to calendar widget
  useEffect(() => {
    if (!contactData || !isCalendarLoaded) return

    // Wait for calendar widget to load, then try to populate fields
    const timer = setTimeout(() => {
      try {
        // Attempt to populate calendar form via iframe postMessage
        const iframe = document.getElementById('conversn-calendar-iframe') as HTMLIFrameElement
        if (iframe && iframe.contentWindow) {
          const formData = {
            firstName: contactData.personalInfo?.firstName || '',
            lastName: contactData.personalInfo?.lastName || '',
            email: contactData.personalInfo?.email || '',
            phone: contactData.personalInfo?.phone || '',
            zipCode: contactData.locationInfo?.zipCode || '',
            state: contactData.locationInfo?.state || '',
            stateName: contactData.locationInfo?.stateName || '',
            retirementSavings: contactData.retirementSavings || 0,
            ageRange: contactData.ageRange || '',
            retirementTimeline: contactData.retirementTimeline || '',
            riskTolerance: contactData.riskTolerance || '',
            quizAnswers: JSON.stringify(contactData)
          }

          // Try to send data to calendar widget
          iframe.contentWindow.postMessage(
            {
              type: 'populateForm',
              data: formData
            },
            'https://link.conversn.io'
          )

          console.log('📤 Attempted to pass data to calendar widget:', formData)
        }
      } catch (error) {
        console.warn('⚠️ Could not pass data to calendar widget:', error)
        // This is non-critical - calendar will still work, just won't be pre-populated
      }
    }, 2000) // Wait 2 seconds for widget to fully load

    return () => clearTimeout(timer)
  }, [contactData, isCalendarLoaded])

  const firstName = contactData?.personalInfo?.firstName || contactData?.firstName || 'there'

  if (!contactData) {
    return (
      <div className="min-h-screen bg-[#F5F5F0] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#36596A] mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F5F5F0]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#36596A] mb-4">
            Congrats {firstName} - You're Qualified
          </h1>
          <h2 className="text-2xl font-semibold text-gray-700 mb-6">
            STEP 2: Book Your Free Retirement Rescue Strategy Call
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            We help you ensure your retirement is tax optimized, income producing, 
            and structured to give you peace of mind for you and your family to enjoy. 
            No stress or surprises - just strong, sound structure.
          </p>
        </div>

        {/* Calendar Embed */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="w-full" style={{ minHeight: '600px' }}>
            <iframe
              id="conversn-calendar-iframe"
              src="https://link.conversn.io/widget/booking/9oszv21kQ1Tx6jG4qopK"
              style={{ width: '100%', border: 'none', overflow: 'hidden' }}
              scrolling="no"
              title="Book Your Retirement Rescue Strategy Call"
              onLoad={() => {
                setIsCalendarLoaded(true)
                console.log('✅ Calendar widget loaded')
              }}
            />
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center text-sm text-gray-500">
          <p>
            Questions? Contact us at{' '}
            <a href="tel:+1-800-555-0123" className="text-[#36596A] hover:underline">
              1-800-555-0123
            </a>
          </p>
        </div>
      </div>

      {/* Load Conversn.io script */}
      <script
        src="https://link.conversn.io/js/form_embed.js"
        async
        defer
      />
    </div>
  )
}

