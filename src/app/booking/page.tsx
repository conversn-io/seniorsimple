'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useFunnelLayout } from '@/hooks/useFunnelFooter'
import { trackGA4Event } from '@/lib/temp-tracking'
import Script from 'next/script'
import { getStoredUTMParameters, UTMParameters } from '@/utils/utm-utils'

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

function BookingPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  useFunnelLayout() // Sets header and footer to 'funnel'
  const [contactData, setContactData] = useState<QuizAnswers | null>(null)
  const [isCalendarLoaded, setIsCalendarLoaded] = useState(false)
  const [calendarUrl, setCalendarUrl] = useState<string>('https://link.conversn.io/widget/booking/8ATad4yjNpsCln3IEYom')
  const [hasRedirected, setHasRedirected] = useState(false)

  useEffect(() => {
    // PRIORITY 1: Get email from URL query parameter (passed from quiz redirect)
    const emailFromUrl = searchParams ? searchParams.get('email') : null
    
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
        
        // Build calendar URL with email parameter and redirect URL
        // NOTE: Conversn.io calendar widget may have its own redirect URL configured in the dashboard
        // If the widget's native redirect overrides URL parameters, you may need to update the
        // redirect URL in the Conversn.io dashboard settings for widget ID: 8ATad4yjNpsCln3IEYom
        const baseUrl = 'https://link.conversn.io/widget/booking/8ATad4yjNpsCln3IEYom'
        const siteUrl = typeof window !== 'undefined' ? window.location.origin : 'https://seniorsimple.org'
        const redirectUrl = `${siteUrl}/quiz-submitted`
        
        let urlParams = new URLSearchParams()
        
        // Add email if available (required for form pre-fill)
        if (email) {
          urlParams.append('email', email)
        }
        
        // Add UTM parameters from sessionStorage (critical for attribution)
        const utmParams = getStoredUTMParameters()
        if (utmParams) {
          if (utmParams.utm_source) urlParams.append('utm_source', utmParams.utm_source)
          if (utmParams.utm_medium) urlParams.append('utm_medium', utmParams.utm_medium)
          if (utmParams.utm_campaign) urlParams.append('utm_campaign', utmParams.utm_campaign)
          if (utmParams.utm_term) urlParams.append('utm_term', utmParams.utm_term)
          if (utmParams.utm_content) urlParams.append('utm_content', utmParams.utm_content)
          if (utmParams.utm_id) urlParams.append('utm_id', utmParams.utm_id)
          if (utmParams.gclid) urlParams.append('gclid', utmParams.gclid)
          if (utmParams.fbclid) urlParams.append('fbclid', utmParams.fbclid)
          if (utmParams.msclkid) urlParams.append('msclkid', utmParams.msclkid)
          console.log('📊 UTM parameters added to calendar URL:', utmParams)
        }
        
        // Add redirect URL parameter (Conversn.io may support redirect_url, redirect, or return_url)
        // Try multiple parameter names as different widgets use different conventions
        urlParams.append('redirect_url', redirectUrl)
        urlParams.append('redirect', redirectUrl)
        urlParams.append('return_url', redirectUrl)
        urlParams.append('success_url', redirectUrl)
        
        const calendarUrlWithParams = `${baseUrl}?${urlParams.toString()}`
        setCalendarUrl(calendarUrlWithParams)
        
        if (email) {
          console.log('✅ Calendar URL built with email, UTM params, and redirect:', calendarUrlWithParams)
        } else {
          console.warn('⚠️ No email found - using base URL with redirect parameter')
          console.log('📋 Calendar URL with redirect:', calendarUrlWithParams)
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
      // If no quiz data in sessionStorage:
      // - If we have an email from URL, build a minimal contactData fallback and proceed
      // - Otherwise, retry once; if still missing and no email, redirect to /quiz
      console.warn('⚠️ No quiz data found on first check.')

      if (emailFromUrl) {
        const email = emailFromUrl
        console.warn('⚠️ Using URL email as minimal fallback:', email)

        // Build calendar URL with email + redirect params
        const baseUrl = 'https://link.conversn.io/widget/booking/8ATad4yjNpsCln3IEYom'
        const siteUrl = typeof window !== 'undefined' ? window.location.origin : 'https://seniorsimple.org'
        const redirectUrl = `${siteUrl}/quiz-submitted`
        const urlParams = new URLSearchParams()
        urlParams.append('email', email)
        
        // Add UTM parameters from sessionStorage
        const utmParams = getStoredUTMParameters()
        if (utmParams) {
          if (utmParams.utm_source) urlParams.append('utm_source', utmParams.utm_source)
          if (utmParams.utm_medium) urlParams.append('utm_medium', utmParams.utm_medium)
          if (utmParams.utm_campaign) urlParams.append('utm_campaign', utmParams.utm_campaign)
          if (utmParams.utm_term) urlParams.append('utm_term', utmParams.utm_term)
          if (utmParams.utm_content) urlParams.append('utm_content', utmParams.utm_content)
          if (utmParams.utm_id) urlParams.append('utm_id', utmParams.utm_id)
          if (utmParams.gclid) urlParams.append('gclid', utmParams.gclid)
          if (utmParams.fbclid) urlParams.append('fbclid', utmParams.fbclid)
          if (utmParams.msclkid) urlParams.append('msclkid', utmParams.msclkid)
        }
        
        urlParams.append('redirect_url', redirectUrl)
        urlParams.append('redirect', redirectUrl)
        urlParams.append('return_url', redirectUrl)
        urlParams.append('success_url', redirectUrl)
        const calendarUrlWithParams = `${baseUrl}?${urlParams.toString()}`

        // Minimal contact data
        const minimalAnswers = { personalInfo: { email } }
        setContactData(minimalAnswers as QuizAnswers)
        setCalendarUrl(calendarUrlWithParams)

        // Store minimal data so thank-you page can at least personalize by email
        sessionStorage.setItem('quiz_answers', JSON.stringify(minimalAnswers))
        localStorage.setItem('quiz_answers', JSON.stringify(minimalAnswers))
        sessionStorage.setItem('email', email)
        localStorage.setItem('email', email)

        console.log('✅ Fallback contactData set from URL email')
        console.log('🔗 Calendar URL with email + redirect:', calendarUrlWithParams)
        return
      }

      // No quiz data and no URL email - allow booking without quiz data
      // This handles direct booking flow (e.g., from /retirement-rescue/follow-up)
      console.log('ℹ️ No quiz data found - allowing direct booking (calendar will collect user info)')
      
      // Build calendar URL with redirect params (no email pre-fill)
      const baseUrl = 'https://link.conversn.io/widget/booking/8ATad4yjNpsCln3IEYom'
      const siteUrl = typeof window !== 'undefined' ? window.location.origin : 'https://seniorsimple.org'
      const redirectUrl = `${siteUrl}/quiz-submitted`
      const urlParams = new URLSearchParams()
      
      // Add UTM parameters from sessionStorage (even without email)
      const utmParams = getStoredUTMParameters()
      if (utmParams) {
        if (utmParams.utm_source) urlParams.append('utm_source', utmParams.utm_source)
        if (utmParams.utm_medium) urlParams.append('utm_medium', utmParams.utm_medium)
        if (utmParams.utm_campaign) urlParams.append('utm_campaign', utmParams.utm_campaign)
        if (utmParams.utm_term) urlParams.append('utm_term', utmParams.utm_term)
        if (utmParams.utm_content) urlParams.append('utm_content', utmParams.utm_content)
        if (utmParams.utm_id) urlParams.append('utm_id', utmParams.utm_id)
        if (utmParams.gclid) urlParams.append('gclid', utmParams.gclid)
        if (utmParams.fbclid) urlParams.append('fbclid', utmParams.fbclid)
        if (utmParams.msclkid) urlParams.append('msclkid', utmParams.msclkid)
      }
      
      urlParams.append('redirect_url', redirectUrl)
      urlParams.append('redirect', redirectUrl)
      urlParams.append('return_url', redirectUrl)
      urlParams.append('success_url', redirectUrl)
      const calendarUrlWithParams = `${baseUrl}?${urlParams.toString()}`
      
      setCalendarUrl(calendarUrlWithParams)
      
      // Set minimal contact data so thank-you page doesn't break
      const minimalAnswers = { personalInfo: {} }
      setContactData(minimalAnswers as QuizAnswers)
      
      console.log('✅ Calendar URL built for direct booking (no quiz data):', calendarUrlWithParams)
    }
  }, [router, searchParams])

  // Listen for calendar booking completion via postMessage (backup)
  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleMessage = (event: MessageEvent) => {
      // Listen for messages from Conversn.io widget
      // Try to catch multiple possible event shapes the widget may emit
      const data = event.data
      if (!data) return

      const type =
        data.type ||
        data.event ||
        (typeof data === 'string' ? data : undefined)

      const isBookingComplete =
        type === 'booking_complete' ||
        type === 'bookingCompleted' ||
        type === 'appointmentBooked' ||
        type === 'conversn_booking_complete'

      if (isBookingComplete && !hasRedirected) {
        setHasRedirected(true)
        console.log('✅ Booking complete event received, redirecting to thank-you page', { type, data })
        
        // Track booking-scheduled GA4 event (postMessage method)
        const email = contactData?.personalInfo?.email || contactData?.email || contactData?.contactInfo?.email || ''
        const phone = contactData?.personalInfo?.phone || contactData?.phone || contactData?.contactInfo?.phone || ''
        const firstName = contactData?.personalInfo?.firstName || ''
        const lastName = contactData?.personalInfo?.lastName || ''
        
        trackGA4Event('booking-scheduled', {
          appointment_id: data.appointmentId || data.id || 'unknown',
          appointment_time: data.startTime || data.bookingTime || data.appointment?.start_time || 'unknown',
          email: email || 'unknown',
          phone: phone || 'unknown',
          name: `${firstName} ${lastName}`.trim() || 'unknown',
          booking_method: 'postmessage'
        })
        
        router.push('/quiz-submitted')
      }
    }

    window.addEventListener('message', handleMessage)
    return () => {
      window.removeEventListener('message', handleMessage)
    }
  }, [router, hasRedirected, contactData])

  // Poll for booking confirmation via webhook (primary method)
  useEffect(() => {
    if (!isCalendarLoaded || !contactData || hasRedirected) return

    // Extract email for polling
    const email = 
      contactData?.personalInfo?.email || 
      contactData?.email || 
      contactData?.contactInfo?.email || 
      ''

    // For direct booking (no quiz data), email will be collected by calendar widget
    // Polling will start after booking when email is available via webhook
    // postMessage handler will catch booking completion as backup
    if (!email) {
      console.log('ℹ️ No email available for polling yet - calendar widget will collect it')
      console.log('ℹ️ Booking completion will be detected via postMessage or webhook after booking')
      return
    }

    console.log('🔄 Starting booking confirmation polling for:', email)

    let pollCount = 0
    const maxPolls = 60 // Poll for up to 5 minutes (60 * 5s = 300s)
    const pollInterval = 5000 // Poll every 5 seconds

    const pollForConfirmation = async () => {
      if (hasRedirected || pollCount >= maxPolls) {
        if (pollCount >= maxPolls) {
          console.warn('⏱️ Polling timeout - booking confirmation not received')
        }
        return
      }

      pollCount++

      try {
        const response = await fetch(`/api/booking/confirm?email=${encodeURIComponent(email)}`)
        const data = await response.json()

        if (data.confirmed && !hasRedirected) {
          console.log('✅ Booking confirmed via webhook!', data)
          setHasRedirected(true)

          // Store appointment data for thank-you page
          let appointmentData: any = null
          if (data.payload) {
            appointmentData = {
              appointmentId: data.payload.appointmentId || data.payload.id || data.payload.appointment_id,
              startTime: data.payload.raw?.bookingTimes || data.payload.raw?.start_time || data.payload.raw?.appointment?.start_time,
              name: data.name,
              email: data.email,
              phone: data.phone,
            }
            sessionStorage.setItem('appointment_data', JSON.stringify(appointmentData))
            localStorage.setItem('appointment_data', JSON.stringify(appointmentData))
            console.log('💾 Appointment data stored:', appointmentData)
          }

          // Track booking-scheduled GA4 event
          trackGA4Event('booking-scheduled', {
            appointment_id: appointmentData?.appointmentId || data.payload?.appointmentId || 'unknown',
            appointment_time: appointmentData?.startTime || data.payload?.raw?.bookingTimes || data.payload?.raw?.start_time || 'unknown',
            email: data.email || contactData?.personalInfo?.email || 'unknown',
            phone: data.phone || contactData?.personalInfo?.phone || 'unknown',
            name: data.name || `${contactData?.personalInfo?.firstName || ''} ${contactData?.personalInfo?.lastName || ''}`.trim() || 'unknown',
            booking_method: 'webhook_polling'
          })

          router.push('/quiz-submitted')
        } else if (pollCount < maxPolls) {
          // Continue polling
          setTimeout(pollForConfirmation, pollInterval)
        }
      } catch (error) {
        console.error('❌ Polling error:', error)
        if (pollCount < maxPolls) {
          setTimeout(pollForConfirmation, pollInterval)
        }
      }
    }

    // Start polling after a short delay to allow webhook to process
    const initialDelay = setTimeout(() => {
      pollForConfirmation()
    }, 3000) // Wait 3 seconds before first poll

    return () => {
      clearTimeout(initialDelay)
    }
  }, [isCalendarLoaded, contactData, hasRedirected, router])

  // Build calendar URL with GHL form parameters
  // GHL forms require parameter names that match the form field 'name' attributes
  // Common GHL field names: email, first_name, last_name, phone (snake_case) or firstName, lastName (camelCase)
  const buildCalendarUrl = () => {
    const baseUrl = 'https://link.conversn.io/widget/booking/8ATad4yjNpsCln3IEYom'
    
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
    
    // Build URL with email and UTM parameters
    const urlParams = new URLSearchParams()
    
    // Add email if available (required for form pre-fill)
    if (email) {
      urlParams.append('email', email)
    }
    
    // Add UTM parameters from sessionStorage (critical for attribution)
    const utmParams = getStoredUTMParameters()
    if (utmParams) {
      if (utmParams.utm_source) urlParams.append('utm_source', utmParams.utm_source)
      if (utmParams.utm_medium) urlParams.append('utm_medium', utmParams.utm_medium)
      if (utmParams.utm_campaign) urlParams.append('utm_campaign', utmParams.utm_campaign)
      if (utmParams.utm_term) urlParams.append('utm_term', utmParams.utm_term)
      if (utmParams.utm_content) urlParams.append('utm_content', utmParams.utm_content)
      if (utmParams.utm_id) urlParams.append('utm_id', utmParams.utm_id)
      if (utmParams.gclid) urlParams.append('gclid', utmParams.gclid)
      if (utmParams.fbclid) urlParams.append('fbclid', utmParams.fbclid)
      if (utmParams.msclkid) urlParams.append('msclkid', utmParams.msclkid)
      console.log('  - UTM parameters added:', utmParams)
    }
    
    if (urlParams.toString()) {
      const finalUrl = `${baseUrl}?${urlParams.toString()}`
      console.log('  - Final URL with email and UTM parameters:', finalUrl)
      return finalUrl
    }
    
    console.warn('⚠️ No email or UTM parameters found - using base URL')
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

  const firstName = contactData?.personalInfo?.firstName || contactData?.firstName || ''

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
      {/* Success notification bar for consistency with thank-you page */}
      <div className="w-full bg-green-100 border-b border-green-300 text-green-900 text-sm py-3 px-4 text-center">
        <h1 className="text-2xl sm:text-3xl font-serif font-semibold text-[#2f6d46]">
          Schedule Your Retirement Rescue™ Strategy Call
        </h1>
      </div>

      <section className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
          {/* Calendar Page Headline */}
          <div className="text-center mb-8">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#36596A] mb-4 sm:mb-6 leading-tight">
              Schedule Your Strategy Call
            </h2>
            
            {/* Call Details */}
            <div className="mb-6 text-gray-700 max-w-2xl mx-auto">
              <p className="text-base mb-2">
                <span className="font-semibold">Duration:</span> ~15 minutes
              </p>
              <p className="text-base mb-2">
                <span className="font-semibold">Cost:</span> $0
              </p>
              <p className="text-base mb-4">
                <span className="font-semibold">Who you'll speak with:</span> Licensed retirement professional
              </p>
            </div>
            
            {/* Pre-calendar copy */}
            <p className="text-base text-gray-600 mb-8 italic max-w-2xl mx-auto">
              Please choose a time when you can take a brief, uninterrupted call.
            </p>
          </div>

        {/* Calendar Embed */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="w-full" style={{ minHeight: '600px' }}>
            <iframe
              id="conversn-calendar-iframe"
              key={calendarUrl} // Force re-render when URL changes
              src={calendarUrl}
              style={{ width: '100%', height: '600px', border: 'none', overflow: 'hidden' }}
              scrolling="no"
              title="Book Your Retirement Rescue Strategy Call"
              allow="autoplay; fullscreen; picture-in-picture"
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
      </section>

      {/* Load Conversn.io script */}
      <Script 
        src="https://link.conversn.io/js/form_embed.js" 
        strategy="afterInteractive"
      />
    </div>
  )
}

export default function BookingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F5F5F0] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#36596A] mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <BookingPageContent />
    </Suspense>
  )
}

