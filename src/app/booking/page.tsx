'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
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
  const searchParams = useSearchParams()
  useFunnelLayout() // Sets header and footer to 'funnel'
  const [contactData, setContactData] = useState<QuizAnswers | null>(null)
  const [isCalendarLoaded, setIsCalendarLoaded] = useState(false)
  const [calendarUrl, setCalendarUrl] = useState<string>('https://link.conversn.io/widget/booking/9oszv21kQ1Tx6jG4qopK')

  useEffect(() => {
    // PRIORITY 1: Get email from URL query parameter (passed from quiz redirect)
    const emailFromUrl = searchParams.get('email')
    
    // PRIORITY 2: Get quiz answers from sessionStorage
    const storedAnswers = sessionStorage.getItem('quiz_answers')
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📥 BOOKING PAGE LOADED')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📧 Email from URL query param:', emailFromUrl || '❌ NOT FOUND')
    console.log('📋 Quiz answers in sessionStorage:', storedAnswers ? '✅ Present' : '❌ Missing')
    
    if (storedAnswers) {
      try {
        const answers = JSON.parse(storedAnswers)
        setContactData(answers)
        
        // Extract email from various possible locations (fallback if not in URL)
        const emailFromStorage = 
          answers?.personalInfo?.email || 
          answers?.email || 
          answers?.contactInfo?.email || 
          ''
        
        // Use email from URL (priority) or from storage (fallback)
        const email = emailFromUrl || emailFromStorage
        
        console.log('📧 Email Resolution:')
        console.log('  - From URL:', emailFromUrl || '❌')
        console.log('  - From Storage:', emailFromStorage || '❌')
        console.log('  - Final email to use:', email || '❌ NONE')
        
        // Build calendar URL with email parameter
        if (email) {
          const encodedEmail = encodeURIComponent(email)
          const urlWithEmail = `https://link.conversn.io/widget/booking/9oszv21kQ1Tx6jG4qopK?email=${encodedEmail}`
          setCalendarUrl(urlWithEmail)
          console.log('✅ Calendar URL built with email:', urlWithEmail)
        } else {
          console.warn('⚠️ No email found in URL or storage - using base URL')
        }
        
        // Store contact data in multiple formats for widget compatibility
        if (email) {
          const contactDataObj = {
            email: email,
            firstName: answers?.personalInfo?.firstName || '',
            lastName: answers?.personalInfo?.lastName || '',
            phone: answers?.personalInfo?.phone || ''
          }
          
          // Store in multiple formats
          sessionStorage.setItem('conversn_contact', JSON.stringify(contactDataObj))
          sessionStorage.setItem('conversn_session_data', JSON.stringify(contactDataObj))
          sessionStorage.setItem('contact_data', JSON.stringify(contactDataObj))
          localStorage.setItem('conversn_contact', JSON.stringify(contactDataObj))
          localStorage.setItem('conversn_session_data', JSON.stringify(contactDataObj))
          localStorage.setItem('contact_data', JSON.stringify(contactDataObj))
          sessionStorage.setItem('email', email)
          localStorage.setItem('email', email)
        }
      } catch (error) {
        console.error('❌ Error parsing quiz answers:', error)
      }
    } else {
      // If no quiz data, redirect back to quiz
      console.warn('⚠️ No quiz data found, redirecting to quiz')
      router.push('/quiz')
    }
  }, [router, searchParams])

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

  // Build calendar URL with GHL form parameters
  // GHL forms require parameter names that match the form field 'name' attributes
  // Common GHL field names: email, first_name, last_name, phone (snake_case) or firstName, lastName (camelCase)
  const buildCalendarUrl = () => {
    const baseUrl = 'https://link.conversn.io/widget/booking/9oszv21kQ1Tx6jG4qopK'
    
    // Extract contact data
    const email = 
      contactData?.personalInfo?.email || 
      contactData?.email || 
      contactData?.contactInfo?.email || 
      ''
    
    const firstName = 
      contactData?.personalInfo?.firstName || 
      contactData?.firstName || 
      ''
    
    const lastName = 
      contactData?.personalInfo?.lastName || 
      contactData?.lastName || 
      ''
    
    const phone = 
      contactData?.personalInfo?.phone || 
      contactData?.phone || 
      ''
    
    console.log('🔗 Building GHL Calendar URL:')
    console.log('  - Base URL:', baseUrl)
    console.log('  - Email found:', email || '❌ NOT FOUND')
    console.log('  - First Name:', firstName || '❌ NOT FOUND')
    console.log('  - Last Name:', lastName || '❌ NOT FOUND')
    console.log('  - Phone:', phone || '❌ NOT FOUND')
    
    // Build URL with GHL form parameter
    // GHL form field name confirmed as: 'email'
    if (email) {
      // URL encode the email to handle special characters
      const encodedEmail = encodeURIComponent(email)
      const finalUrl = `${baseUrl}?email=${encodedEmail}`
      
      console.log('  - Final URL with GHL email parameter:', finalUrl)
      console.log('  - GHL field name: email (confirmed)')
      
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
              key={calendarUrl} // Force re-render when URL changes
              src={calendarUrl}
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
                
                console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
                console.log('✅ CALENDAR WIDGET LOADED')
                console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
                console.log('📧 Email Status:', email ? `✅ FOUND: ${email}` : '❌ MISSING')
                console.log('📋 Calendar URL (iframe src):', calendarUrl)
                console.log('🔍 Email in URL:', calendarUrl.includes('email=') ? '✅ YES' : '❌ NO')
                console.log('🔍 Actual iframe src attribute:', document.getElementById('conversn-calendar-iframe')?.getAttribute('src'))
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

