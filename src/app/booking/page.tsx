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
        
        // Debug: Log the full structure to understand data format
        console.log('📋 Quiz Answers Retrieved for Booking Page:', answers)
        console.log('🔍 Debug - Full answers structure:', JSON.stringify(answers, null, 2))
        
        // Debug: Check email in various possible locations
        const emailFromPersonalInfo = answers?.personalInfo?.email
        const emailFromRoot = answers?.email
        const emailFromContactInfo = answers?.contactInfo?.email
        
        console.log('📧 Email Debug Check:')
        console.log('  - answers.personalInfo?.email:', emailFromPersonalInfo)
        console.log('  - answers.email:', emailFromRoot)
        console.log('  - answers.contactInfo?.email:', emailFromContactInfo)
        console.log('  - Full personalInfo object:', answers?.personalInfo)
        
        // Warn if email is not found
        if (!emailFromPersonalInfo && !emailFromRoot && !emailFromContactInfo) {
          console.warn('⚠️ WARNING: Email not found in quiz answers!')
          console.warn('⚠️ Available keys in answers:', Object.keys(answers))
        }
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

  // Build calendar URL with email parameter (primary method)
  const buildCalendarUrl = () => {
    const baseUrl = 'https://link.conversn.io/widget/booking/9oszv21kQ1Tx6jG4qopK'
    
    // Try multiple possible email locations
    const email = 
      contactData?.personalInfo?.email || 
      contactData?.email || 
      contactData?.contactInfo?.email || 
      ''
    
    console.log('🔗 Building Calendar URL:')
    console.log('  - Base URL:', baseUrl)
    console.log('  - Email found:', email || '❌ NOT FOUND')
    console.log('  - Contact data structure:', contactData ? '✅ Present' : '❌ Missing')
    
    if (email) {
      // URL encode the email to handle special characters
      const encodedEmail = encodeURIComponent(email)
      const finalUrl = `${baseUrl}?email=${encodedEmail}`
      console.log('  - Final URL with email:', finalUrl)
      return finalUrl
    }
    
    console.warn('⚠️ No email found - using base URL without email parameter')
    return baseUrl
  }

  // Attempt to pass data to calendar widget via postMessage (backup method)
  useEffect(() => {
    if (!contactData || !isCalendarLoaded) return

    // Wait for calendar widget to load, then try to populate fields
    const timer = setTimeout(() => {
      try {
        // Attempt to populate calendar form via iframe postMessage
        const iframe = document.getElementById('conversn-calendar-iframe') as HTMLIFrameElement
        if (iframe && iframe.contentWindow) {
          const formData = {
            email: contactData.personalInfo?.email || '',
            // Keep other fields available in case widget supports them
            firstName: contactData.personalInfo?.firstName || '',
            lastName: contactData.personalInfo?.lastName || '',
            phone: contactData.personalInfo?.phone || '',
            zipCode: contactData.locationInfo?.zipCode || '',
            state: contactData.locationInfo?.state || '',
            stateName: contactData.locationInfo?.stateName || ''
          }

          // Try to send data to calendar widget via postMessage
          iframe.contentWindow.postMessage(
            {
              type: 'populateForm',
              data: formData
            },
            'https://link.conversn.io'
          )

          console.log('📤 Attempted to pass data to calendar widget via postMessage:', formData)
        }
      } catch (error) {
        console.warn('⚠️ Could not pass data to calendar widget via postMessage:', error)
        // This is non-critical - URL parameters are the primary method
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
              src={buildCalendarUrl()}
              style={{ width: '100%', border: 'none', overflow: 'hidden' }}
              scrolling="no"
              title="Book Your Retirement Rescue Strategy Call"
              onLoad={() => {
                setIsCalendarLoaded(true)
                
                // Try multiple possible email locations
                const email = 
                  contactData?.personalInfo?.email || 
                  contactData?.email || 
                  contactData?.contactInfo?.email || 
                  ''
                
                const calendarUrl = buildCalendarUrl()
                
                console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
                console.log('✅ CALENDAR WIDGET LOADED')
                console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
                console.log('📧 Email Status:', email ? `✅ FOUND: ${email}` : '❌ MISSING')
                console.log('📋 Calendar URL:', calendarUrl)
                console.log('🔍 Email in URL:', calendarUrl.includes('email=') ? '✅ YES' : '❌ NO')
                console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
                
                // Also log to page for visual debugging (remove in production)
                if (typeof window !== 'undefined' && email) {
                  console.log(`%c📧 Email will be passed to calendar: ${email}`, 'color: green; font-weight: bold; font-size: 14px;')
                  console.log(`%c🔗 Calendar URL: ${calendarUrl}`, 'color: blue; font-weight: bold; font-size: 12px;')
                }
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

