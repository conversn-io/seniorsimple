'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { AlertTriangle, CheckCircle, Loader2 } from 'lucide-react'
import { useMinimalFunnelLayout } from '@/hooks/useMinimalFunnelLayout'
import { 
  initializeTracking, 
  trackPageView, 
  trackQuizStart,
  trackQuizStepViewed,
  trackQuestionAnswer,
  trackQuizComplete,
  trackLeadFormSubmit,
  trackGA4Event,
  trackMetaPixelEvent
} from '@/lib/temp-tracking'
import { AddressAutocomplete, AddressComponents } from '@/components/property/AddressAutocomplete'
import { PropertyLookupData } from '@/types/property'
import { formatPhoneForGHL, formatPhoneForInput, extractUSPhoneNumber } from '@/utils/phone-utils'
import { getEmailValidationState, validateEmailFormat } from '@/utils/email-validation'
import { getPhoneValidationState, validatePhoneFormat } from '@/utils/phone-validation'
import { useTrustedForm, getTrustedFormCertUrl, getLeadIdToken } from '@/hooks/useTrustedForm'
import { getMetaCookies } from '@/lib/meta-capi-cookies'

const STORAGE_KEY = 'reverse_mortgage_calculator'

interface ReverseMortgageCalculation {
  propertyValue: number
  adjustedValue: number
  principalLimitFactor: number
  grossProceeds: number
  existingMortgage: number
  netProceeds: number
  monthlyPaymentOption: number
  equityAvailable: number
}

const REASON_OPTIONS = [
  { label: 'eliminate mortgage payments', value: 'eliminate-mortgage-payments' },
  { label: 'pay off debts', value: 'pay-off-debts' },
  { label: 'pay for kids tuition', value: 'pay-for-kids-tuition' },
  { label: 'retire with no financial burden', value: 'retire-no-burden' },
]

const getPrincipalLimitFactor = (age: number) => {
  if (age >= 90) return 0.75
  if (age >= 85) return 0.7
  if (age >= 80) return 0.65
  if (age >= 75) return 0.6
  if (age >= 70) return 0.55
  if (age >= 65) return 0.5
  return 0.45
}

const calculateReverseMortgage = (data: PropertyLookupData, age: number): ReverseMortgageCalculation => {
  const FHA_LIMIT = 1149825
  const adjustedValue = Math.min(data.property_value, FHA_LIMIT)
  const principalLimitFactor = getPrincipalLimitFactor(age)
  const grossProceeds = Math.floor(adjustedValue * principalLimitFactor)
  const existingMortgage = data.mortgage_balance || 0
  const netProceeds = Math.max(0, grossProceeds - existingMortgage)
  const monthlyPaymentOption = Math.floor(netProceeds / 240)
  const equityAvailable = data.equity_available || Math.max(0, data.property_value - existingMortgage)

  return {
    propertyValue: data.property_value,
    adjustedValue,
    principalLimitFactor,
    grossProceeds,
    existingMortgage,
    netProceeds,
    monthlyPaymentOption,
    equityAvailable,
  }
}

export default function ReverseMortgageCalculatorPage() {
  useMinimalFunnelLayout()
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [reason, setReason] = useState('')
  const [is62Plus, setIs62Plus] = useState<boolean | null>(null)
  const [isHomeowner, setIsHomeowner] = useState<boolean | null>(null)
  const [ageRange, setAgeRange] = useState('')
  const [age, setAge] = useState<number>(0)
  const [address, setAddress] = useState<AddressComponents | null>(null)
  const [propertyData, setPropertyData] = useState<PropertyLookupData | null>(null)
  const [calculation, setCalculation] = useState<ReverseMortgageCalculation | null>(null)
  const [lookupError, setLookupError] = useState('')
  const [isLookupLoading, setIsLookupLoading] = useState(false)

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [emailError, setEmailError] = useState('')
  const [phoneError, setPhoneError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  
  // Ref to prevent double-click race conditions (belt-and-suspenders with isSubmitting state)
  const isSubmittingRef = useRef(false)

  // Tracking state for funnel analytics
  const [sessionId, setSessionId] = useState<string>('')
  const [previousStepName, setPreviousStepName] = useState<string | null>(null)
  const [stepStartTime, setStepStartTime] = useState<number>(Date.now())
  const [quizStartTime, setQuizStartTime] = useState<number>(Date.now())

  // Step names for tracking (5 steps - property lookup moved to results page)
  const STEP_NAMES: Record<number, string> = {
    1: 'reason_selection',
    2: 'age_verification',
    3: 'homeowner_check',
    4: 'address_entry',
    5: 'lead_capture'
  }

  // Initialize tracking and session
  useEffect(() => {
    initializeTracking()
    trackPageView('Reverse Mortgage Calculator', '/reverse-mortgage-calculator')
    
    // Generate or get session ID
    const existingSession = typeof window !== 'undefined' 
      ? sessionStorage.getItem('session_id') 
      : null
    const newSessionId = existingSession || `sess_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`
    setSessionId(newSessionId)
    
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('session_id', newSessionId)
    }
    
    // Track quiz start
    trackQuizStart('reverse-mortgage', newSessionId)
    setQuizStartTime(Date.now())
    
    console.log('📊 Reverse Mortgage Funnel Started:', { sessionId: newSessionId })
  }, [])

  // Track step changes for funnel analytics
  useEffect(() => {
    if (!sessionId) return
    
    const stepName = STEP_NAMES[step] || `step_${step}`
    const timeOnPreviousStep = previousStepName 
      ? Math.round((Date.now() - stepStartTime) / 1000)
      : null
    
    // Track step view to Supabase + GA4
    trackQuizStepViewed({
      stepNumber: step,
      stepName: stepName,
      funnelType: 'reverse-mortgage',
      previousStep: previousStepName,
      timeOnPreviousStep: timeOnPreviousStep,
      sessionId: sessionId
    })
    
    // Track to GA4 with custom event
    trackGA4Event('rm_funnel_step', {
      step_number: step,
      step_name: stepName,
      funnel_type: 'reverse-mortgage',
      previous_step: previousStepName || 'entry',
      time_on_previous_step: timeOnPreviousStep || 0,
      session_id: sessionId,
      event_category: 'reverse_mortgage_funnel'
    })
    
    // Track to Meta for retargeting audiences (5-step funnel)
    if (step === 4) {
      // Address entry step - high intent
      trackMetaPixelEvent('ViewContent', {
        content_name: 'Reverse Mortgage - Address Entry',
        content_category: 'reverse-mortgage',
        value: 0
      }, 'reverse-mortgage')
    } else if (step === 5) {
      // Lead form - intent to convert
      trackMetaPixelEvent('InitiateCheckout', {
        content_name: 'Reverse Mortgage - Lead Form',
        content_category: 'reverse-mortgage',
        value: 0,
        currency: 'USD'
      }, 'reverse-mortgage')
    }
    
    console.log('📊 Funnel Step Tracked:', {
      step,
      stepName,
      previousStep: previousStepName,
      timeOnPreviousStep,
      funnelType: 'reverse-mortgage'
    })
    
    // Update tracking state
    setPreviousStepName(stepName)
    setStepStartTime(Date.now())
  }, [step, sessionId])

  // Load TrustedForm script ONLY when form is visible (step 5)
  // This ensures the form field exists BEFORE the script loads
  // TrustedForm script must find the form field at initialization time
  useTrustedForm({ enabled: step === 5 })

  const emailValidationState = useMemo(() => getEmailValidationState(email), [email])
  const phoneValidationState = useMemo(() => getPhoneValidationState(phone), [phone])

  const handleReasonSelect = (value: string) => {
    setReason(value)
    
    // Track answer
    trackQuestionAnswer('reason_selection', value, 1, 6, sessionId, 'reverse-mortgage')
    trackGA4Event('rm_answer', {
      question: 'reason_selection',
      answer: value,
      step: 1,
      session_id: sessionId
    })
    
    setStep(2)
  }

  const handleAge62Check = (is62: boolean) => {
    setIs62Plus(is62)
    
    // Track answer
    trackQuestionAnswer('age_verification', is62 ? 'yes_62_plus' : 'no_under_62', 2, 6, sessionId, 'reverse-mortgage')
    trackGA4Event('rm_answer', {
      question: 'age_verification',
      answer: is62 ? 'yes_62_plus' : 'no_under_62',
      step: 2,
      session_id: sessionId,
      qualified: is62
    })
    
    if (!is62) {
      // Track disqualification
      trackGA4Event('rm_disqualified', {
        reason: 'age',
        step: 2,
        session_id: sessionId
      })
      router.push('/reverse-mortgage-calculator/not-qualified?reason=age')
      return
    }
    setAge(70)
    setAgeRange('62+')
    setStep(3)
  }

  const handleHomeownerCheck = (isOwner: boolean) => {
    setIsHomeowner(isOwner)
    
    // Track answer
    trackQuestionAnswer('homeowner_check', isOwner ? 'yes_homeowner' : 'no_not_homeowner', 3, 6, sessionId, 'reverse-mortgage')
    trackGA4Event('rm_answer', {
      question: 'homeowner_check',
      answer: isOwner ? 'yes_homeowner' : 'no_not_homeowner',
      step: 3,
      session_id: sessionId,
      qualified: isOwner
    })
    
    if (!isOwner) {
      // Track disqualification
      trackGA4Event('rm_disqualified', {
        reason: 'not_homeowner',
        step: 3,
        session_id: sessionId
      })
      router.push('/reverse-mortgage-calculator/not-qualified?reason=homeowner')
      return
    }
    setStep(4)
  }

  // Handle address selection - NO API call here, just capture and move to lead form
  const handleAddressSelect = (selected: AddressComponents) => {
    setLookupError('')
    setAddress(selected)

    // Track address entry
    trackQuestionAnswer('address_entry', selected.state || 'unknown', 4, 5, sessionId, 'reverse-mortgage')
    trackGA4Event('rm_address_entered', {
      question: 'address_entry',
      state: selected.state,
      city: selected.city,
      step: 4,
      session_id: sessionId
    })

    // Validate address has required fields
    if (!selected.street || !selected.city || !selected.state || !selected.zip) {
      setLookupError('Please select a full address with city, state, and ZIP.')
      return
    }

    // Move directly to lead capture - property lookup happens on results page
    setStep(5)
  }

  const handleLeadSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    
    // CRITICAL: Prevent double-click duplicates using ref (synchronous check)
    // This catches rapid clicks before React state updates
    if (isSubmittingRef.current) {
      console.log('[DEBUG] 🔵 handleLeadSubmit blocked - already submitting (ref check)')
      return
    }
    
    console.log('[DEBUG] 🔵 handleLeadSubmit called - START')
    setSubmitError('')

    const emailValidation = validateEmailFormat(email)
    if (!emailValidation.isValid) {
      console.log('[DEBUG] 🔵 Email validation failed, returning early')
      setEmailError(emailValidation.error || 'Please enter a valid email address.')
      return
    }

    const phoneValidation = validatePhoneFormat(phone)
    if (!phoneValidation.isValid) {
      console.log('[DEBUG] 🔵 Phone validation failed, returning early')
      setPhoneError(phoneValidation.error || 'Please enter a valid phone number.')
      return
    }

    if (!address) {
      console.log('[DEBUG] 🔵 Missing address, returning early')
      setSubmitError('Missing address. Please go back and enter your property address.')
      return
    }
    
    // CRITICAL: Set submitting state IMMEDIATELY after validations pass
    // This prevents double-click duplicates during the TrustedForm polling period
    isSubmittingRef.current = true
    setIsSubmitting(true)
    
    console.log('[DEBUG] 🔵 All validations passed, isSubmitting=true, proceeding to polling')

    const sessionId =
      (typeof window !== 'undefined' && sessionStorage.getItem('session_id')) ||
      `reverse_mortgage_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`

    const quizAnswers = {
      reason,
      is62Plus,
      isHomeowner,
      ageRange,
      age,
      addressInfo: {
        fullAddress: address.formatted_address,
        street: address.street,
        city: address.city,
        state: address.state,
        zipCode: address.zip,
      },
      // Note: propertyData and calculation will be fetched on results page
      funnelType: 'reverse-mortgage',
    }

    // CRITICAL: Capture TrustedForm and LeadID/Jornaya tokens
    // These are required for buyer webhooks - no payment without them
    // Poll up to 15 times with 500ms delay (7.5 seconds total) to allow scripts to populate
    let trustedFormCertUrl: string | null = null
    let jornayaLeadId: string | null = null
    let attempts = 0
    const maxAttempts = 15
    const pollDelay = 500
    const pollStartTime = Date.now()

    console.log('🔵 LEAD CAPTURE: Starting TrustedForm/LeadID polling...')

    // Poll for both tokens
    while (attempts < maxAttempts) {
      attempts++
      
      // Get TrustedForm certificate URL
      trustedFormCertUrl = getTrustedFormCertUrl()
      
      // Get LeadID/Jornaya token
      jornayaLeadId = getLeadIdToken()
      
      console.log(`🔵 LEAD CAPTURE: Poll ${attempts}/${maxAttempts}`, {
        trustedFormCertUrl: trustedFormCertUrl ? `✅ ${trustedFormCertUrl.substring(0, 50)}...` : '❌ MISSING',
        jornayaLeadId: jornayaLeadId ? `✅ ${jornayaLeadId.substring(0, 20)}...` : '⚠️ not found (optional)'
      })
      
      // TrustedForm is required - if we have it, we can proceed
      if (trustedFormCertUrl) {
        console.log('✅ LEAD CAPTURE: TrustedForm certificate captured!')
        break
      }
      
      // Wait before next attempt
      if (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, pollDelay))
      }
    }

    const totalPollTime = Date.now() - pollStartTime
    
    // Final status
    if (trustedFormCertUrl) {
      console.log('✅ LEAD CAPTURE: Complete', {
        trustedFormCertUrl: trustedFormCertUrl.substring(0, 60) + '...',
        jornayaLeadId: jornayaLeadId || 'not captured (optional)',
        pollTime: `${totalPollTime}ms`,
        attempts
      })
    } else {
      console.error('❌ LEAD CAPTURE: TrustedForm NOT captured after polling!', {
        attempts,
        pollTime: `${totalPollTime}ms`,
        formFieldExists: !!document.querySelector('input[name="xxTrustedFormCertUrl"]'),
        formFieldValue: (document.querySelector('input[name="xxTrustedFormCertUrl"]') as HTMLInputElement)?.value || 'EMPTY',
        scriptExists: !!document.querySelector('script[src*="trustedform.com"]')
      })
      // Still submit but warn - backend will also try to capture
      console.warn('⚠️ Proceeding with submission - backend will attempt to poll for TrustedForm')
    }

    // Include trustedFormCertUrl and jornayaLeadId in quizAnswers (like RateRoots does)
    const quizAnswersWithIds = {
      ...quizAnswers,
      trustedFormCertUrl: trustedFormCertUrl || null,
      jornayaLeadId: jornayaLeadId || null,
    }

    // Capture Meta cookies for CAPI deduplication (CRITICAL for match rate)
    const metaCookies = getMetaCookies()
    const fbLoginId = typeof window !== 'undefined' && (window as any).FB?.getAuthResponse?.()?.userID || null
    
    const payload = {
      email,
      phoneNumber: formatPhoneForGHL(extractUSPhoneNumber(phone)),
      firstName,
      lastName,
      sessionId,
      funnelType: 'reverse-mortgage',
      zipCode: address.zip,
      state: address.state,
      stateName: address.state,
      quizAnswers: quizAnswersWithIds,
      // Note: calculatedResults will be fetched on results page after property lookup
      trustedFormCertUrl: trustedFormCertUrl || null,
      jornayaLeadId: jornayaLeadId || null,
      // Meta cookies for CAPI server-side event matching
      metaCookies: {
        fbp: metaCookies.fbp,
        fbc: metaCookies.fbc,
        fbLoginId: fbLoginId,
      },
    }
    console.log('[DEBUG] 🔵 Payload prepared for submission', { 
      trustedFormCertUrl: payload.trustedFormCertUrl || 'NULL', 
      jornayaLeadId: payload.jornayaLeadId || 'NULL',
      hasFbp: !!metaCookies.fbp,
      hasFbc: !!metaCookies.fbc
    })

    // Note: setIsSubmitting(true) is now called immediately after validations (before polling)
    // to prevent double-click duplicates during the 7.5s TrustedForm polling period

    try {
      const response = await fetch('/api/leads/submit-without-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data?.error || 'Failed to submit your request.')
      }

      // Store data for results page - property lookup will happen there
      const stored = {
        ...quizAnswers,
        contact: {
          firstName,
          lastName,
          email,
          phone: formatPhoneForGHL(extractUSPhoneNumber(phone)),
        },
        // Address info for property lookup on results page
        addressForLookup: {
          street: address.street,
          city: address.city,
          state: address.state,
          zip: address.zip,
          fullAddress: address.formatted_address,
        },
        age, // Needed for calculation on results page
        submittedAt: new Date().toISOString(),
      }

      if (typeof window !== 'undefined') {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(stored))
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stored))
      }

      // Track successful lead submission
      const completionTime = Math.round((Date.now() - quizStartTime) / 1000)
      
      // Track quiz complete
      trackQuizComplete('reverse-mortgage', sessionId, 'reverse-mortgage', completionTime)
      
      // Track lead form submit
      trackLeadFormSubmit({
        firstName,
        lastName,
        email,
        phoneNumber: formatPhoneForGHL(extractUSPhoneNumber(phone)),
        zipCode: address?.zip || '',
        state: address?.state,
        quizAnswers,
        sessionId,
        funnelType: 'reverse-mortgage'
      })
      
      // Track to GA4
      trackGA4Event('rm_lead_submitted', {
        state: address?.state,
        completion_time_seconds: completionTime,
        has_trustedform: !!trustedFormCertUrl,
        has_jornaya: !!jornayaLeadId,
        session_id: sessionId,
        event_category: 'reverse_mortgage_funnel'
      })
      
      // Track to Meta - Lead event
      trackMetaPixelEvent('Lead', {
        content_name: 'Reverse Mortgage Lead',
        content_category: 'reverse-mortgage',
        value: 0, // Value will be calculated on results page
        currency: 'USD'
      }, 'reverse-mortgage')
      
      console.log('📊 Lead Submitted Successfully:', {
        sessionId,
        completionTime,
        address: address.formatted_address
      })

      router.push('/reverse-mortgage-calculator/results')
    } catch (error: any) {
      console.error('Lead submission failed:', error)
      
      // Track submission error
      trackGA4Event('rm_lead_error', {
        error: error?.message || 'unknown',
        step: 6,
        session_id: sessionId
      })
      
      setSubmitError(error?.message || 'Unable to submit your request. Please try again.')
    } finally {
      isSubmittingRef.current = false
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F5F0]">
      <section className="py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-6">
            <span className="inline-flex items-center rounded-full bg-[#E4CDA1] px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[#36596A]">
              Reverse Mortgage Calculator
            </span>
            <h1 className="mt-4 text-3xl sm:text-4xl font-serif font-semibold text-[#36596A]">
              See how much tax-free equity you could access
            </h1>
            <p className="mt-3 text-base sm:text-lg text-gray-600">
              Answer a few quick questions to check your eligibility and estimate potential proceeds.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-[#E5E7EB] p-6 sm:p-8">
            <div className="flex items-center justify-between text-sm text-gray-500 mb-6">
              <span className="font-semibold text-[#36596A]">Step {step} of 5</span>
              <span>Fast, no-obligation estimate</span>
            </div>

            {step === 1 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Why are you interested in a reverse mortgage?</h2>
                  
                </div>
                <div className="space-y-3">
                  {REASON_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      className="quiz-button w-full border-2 border-[#36596A] text-[#36596A] rounded-xl py-4 px-6 text-lg font-semibold hover:bg-[#36596A] hover:text-white transition-colors text-left"
                      onClick={() => handleReasonSelect(option.value)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                
                {/* Trust Seals */}
                <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 pt-4">
                  <div className="flex items-center gap-2">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-sm text-gray-600">Doesn't affect credit score</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-6 h-6 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                    </svg>
                    <span className="text-sm text-gray-600">FHA Insured Lenders</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-6 h-6 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <span className="text-sm text-gray-600">TrustedForm Certified</span>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Are you 62 or above?</h2>
                  <p className="mt-2 text-gray-600">This quick check ensures you qualify for a HECM reverse mortgage.</p>
                </div>
                <div className="space-y-3">
                  <button
                    className="quiz-button w-full border-2 border-[#228B22] text-[#228B22] rounded-xl py-4 px-6 text-lg font-semibold hover:bg-[#228B22] hover:text-white transition-colors flex items-center justify-center gap-2"
                    onClick={() => handleAge62Check(true)}
                  >
                    <CheckCircle className="h-5 w-5" />
                    Yes, I am 62+
                  </button>
                  <button
                    className="quiz-button w-full border-2 border-gray-300 text-gray-600 rounded-xl py-4 px-6 text-lg font-semibold hover:bg-gray-100 transition-colors"
                    onClick={() => handleAge62Check(false)}
                  >
                    No, I'm under 62
                  </button>
                </div>
                
                {/* Trust Seals */}
                <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 pt-4">
                  <div className="flex items-center gap-2">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-sm text-gray-600">Doesn't affect credit score</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-6 h-6 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                    </svg>
                    <span className="text-sm text-gray-600">FHA Insured Lenders</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-6 h-6 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <span className="text-sm text-gray-600">TrustedForm Certified</span>
                  </div>
                </div>
                
                <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-700">
                  <div className="flex items-start gap-2">
                    <svg className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
                    <div>
                      <p className="font-semibold mb-1">Why 62+?</p>
                      <p>The HECM program (Home Equity Conversion Mortgage) is a federally insured loan designed specifically for seniors 62 and older to access their home equity.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Great! Do you own your home?</h2>
                  <p className="mt-2 text-gray-600">Reverse mortgages require home ownership.</p>
                </div>
                <div className="space-y-3">
                  <button
                    className="quiz-button w-full border-2 border-[#36596A] text-[#36596A] rounded-xl py-4 px-6 text-lg font-semibold hover:bg-[#36596A] hover:text-white transition-colors"
                    onClick={() => handleHomeownerCheck(true)}
                  >
                    Yes, I own a home
                  </button>
                  <button
                    className="quiz-button w-full border-2 border-[#36596A] text-[#36596A] rounded-xl py-4 px-6 text-lg font-semibold hover:bg-[#36596A] hover:text-white transition-colors"
                    onClick={() => handleHomeownerCheck(false)}
                  >
                    No, I don't own a home
                  </button>
                </div>
                
                {/* Trust Seals */}
                <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 pt-4">
                  <div className="flex items-center gap-2">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-sm text-gray-600">Doesn't affect credit score</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-6 h-6 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                    </svg>
                    <span className="text-sm text-gray-600">FHA Insured Lenders</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-6 h-6 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <span className="text-sm text-gray-600">TrustedForm Certified</span>
                  </div>
                </div>
                
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
                  <p className="font-semibold mb-1">Why we ask:</p>
                  <p>You must own your home and live in it as your primary residence to qualify for a reverse mortgage.</p>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Where is your home located?</h2>
                  <p className="mt-2 text-gray-600">We’ll calculate your available equity.</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Property Address</label>
                  <AddressAutocomplete
                    onAddressSelect={handleAddressSelect}
                    placeholder="Start typing your address..."
                    className="quiz-input w-full px-6 py-4 text-lg border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-[#36596A]/20 focus:border-[#36596A] transition-all"
                  />
                  <p className="mt-2 text-xs text-gray-500">
                    Start typing and select your address from the dropdown
                  </p>
                </div>

                {/* Address confirmation when selected */}
                {address && (
                  <div className="rounded-xl border border-green-200 bg-green-50 p-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-green-800">Address confirmed</p>
                        <p className="text-sm text-green-700">{address.formatted_address}</p>
                      </div>
                    </div>
                  </div>
                )}

                {isLookupLoading && (
                  <div className="flex items-center justify-center gap-3 text-[#36596A]">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Calculating your equity...</span>
                  </div>
                )}

                {lookupError && (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
                    <p className="font-semibold mb-1">Please select a complete address</p>
                    <p>{lookupError}</p>
                    <p className="mt-2 text-xs">Tip: Make sure to select your address from the dropdown suggestions.</p>
                  </div>
                )}

                {/* Trust signals */}
                <div className="flex items-center justify-center gap-4 text-xs text-gray-500 pt-2">
                  <span className="flex items-center gap-1">
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
                    Secure & Private
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                    No Credit Check
                  </span>
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                    You're One Step Away From Your Reverse Mortgage Quote
                  </h2>
                  <p className="mt-2 text-gray-600">
                    A licensed reverse mortgage specialist will review your options and provide you with quotes from the best providers nationwide.
                  </p>
                </div>

                {/* Social Proof Banner */}
                <div className="bg-[#36596A] text-white rounded-xl p-4 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <svg className="h-5 w-5 text-[#E4CDA1]" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                    <span className="font-semibold">Trusted by 10,000+ Seniors Nationwide</span>
                  </div>
                  <p className="text-sm text-white/80">Average homeowner accesses $127,000 in tax-free equity</p>
                </div>

                <form onSubmit={handleLeadSubmit} className="space-y-5" id="reverse-mortgage-lead-form">
                  {/* CRITICAL: TrustedForm hidden input - NO value attribute!
                      Must be UNCONTROLLED for TrustedForm script to set value.
                      Using value="" makes it controlled and blocks external JS. */}
                  <input
                    type="hidden"
                    name="xxTrustedFormCertUrl"
                    id="xxTrustedFormCertUrl"
                  />
                  {/* LeadID/Jornaya token input */}
                  <input
                    type="hidden"
                    name="leadid_token"
                    id="leadid_token"
                  />
                  <input
                    type="hidden"
                    name="universal_leadid"
                    id="universal_leadid"
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">First Name *</label>
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="quiz-input w-full px-5 py-3 text-lg border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-[#36596A]/20 focus:border-[#36596A] transition-all"
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Last Name</label>
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="quiz-input w-full px-5 py-3 text-lg border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-[#36596A]/20 focus:border-[#36596A] transition-all"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address *</label>
                    <div className="relative">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => {
                          const value = e.target.value
                          setEmail(value)
                          const validation = validateEmailFormat(value)
                          setEmailError(validation.error || '')
                        }}
                        className={`quiz-input w-full px-5 py-3 text-lg border-2 rounded-xl focus:ring-4 focus:ring-[#36596A]/20 transition-all ${
                          emailValidationState === 'invalid' ? 'border-red-500 bg-red-50' : 'border-gray-300'
                        }`}
                        required
                        disabled={isSubmitting}
                      />
                      {emailValidationState === 'invalid' && email && (
                        <AlertTriangle className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-red-500" />
                      )}
                      {emailValidationState === 'valid' && email && (
                        <CheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-green-500" />
                      )}
                    </div>
                    {emailError && (
                      <p className="text-red-600 text-sm mt-2">{emailError}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number *</label>
                    <div className="relative">
                      <input
                        type="tel"
                        value={formatPhoneForInput(phone)}
                        onChange={(e) => {
                          // Extract all digits and normalize (strip leading 1 if present)
                          const allDigits = e.target.value.replace(/\D/g, '')
                          // Use extractUSPhoneNumber to properly handle leading 1
                          const normalizedDigits = extractUSPhoneNumber(allDigits)
                          // Limit to 10 digits for US phone numbers
                          const phoneDigits = normalizedDigits.slice(0, 10)
                          setPhone(phoneDigits)
                          const validation = validatePhoneFormat(phoneDigits)
                          setPhoneError(validation.error || '')
                        }}
                        className={`quiz-input w-full px-5 py-3 text-lg border-2 rounded-xl focus:ring-4 focus:ring-[#36596A]/20 transition-all ${
                          phoneValidationState === 'invalid' ? 'border-red-500 bg-red-50' : 'border-gray-300'
                        }`}
                        placeholder="(555) 123-4567"
                        autoComplete="tel"
                        required
                        disabled={isSubmitting}
                      />
                      {phoneValidationState === 'invalid' && phone && (
                        <AlertTriangle className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-red-500" />
                      )}
                      {phoneValidationState === 'valid' && phone && (
                        <CheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-green-500" />
                      )}
                    </div>
                    {phoneError && (
                      <p className="text-red-600 text-sm mt-2">{phoneError}</p>
                    )}
                  </div>

                  {submitError && (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                      {submitError}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="quiz-button w-full bg-[#228B22] text-white py-4 px-8 rounded-xl font-bold text-lg hover:bg-[#1a6b1a] transition-all shadow-lg disabled:opacity-60 border-2 border-[#E4CDA1]"
                    disabled={
                      !firstName ||
                      !email ||
                      !phone ||
                      emailValidationState !== 'valid' ||
                      phoneValidationState !== 'valid' ||
                      isSubmitting
                    }
                  >
                    {isSubmitting ? 'Submitting...' : 'Get My Reverse Mortgage Quote →'}
                  </button>
                  
                  {/* Trust Badges */}
                  <div className="flex items-center justify-center gap-6 pt-2">
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <svg className="h-4 w-4 text-green-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
                      <span>256-bit Secure</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <svg className="h-4 w-4 text-green-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                      <span>No Credit Impact</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <svg className="h-4 w-4 text-green-600" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                      <span>4.9/5 Rating</span>
                    </div>
                  </div>
                  
                  <p className="text-xs text-gray-500 text-center">
                    By submitting, you agree to be contacted by phone, text, or email. Message and data rates
                    may apply.
                  </p>
                </form>
                
                {/* Trust & Social Proof Section */}
                <div className="mt-8 space-y-8">
                  {/* BBB Trust Badge */}
                  <div className="flex justify-center">
                    <a 
                      href="https://www.bbb.org/us/ca/san-diego/profile/sales-lead-generation/callready-1126-1000162767/#sealclick" 
                      target="_blank" 
                      rel="nofollow"
                      className="hover:opacity-80 transition-opacity"
                    >
                      <img 
                        src="https://seal-central-northern-western-arizona.bbb.org/seals/blue-seal-200-42-bbb-1000162767.png" 
                        style={{ border: 0 }} 
                        alt="CallReady BBB Business Review" 
                        className="h-auto"
                      />
                    </a>
                  </div>

                  {/* Lender Logos */}
                  <div className="text-center">
                    <h3 className="text-sm font-semibold text-gray-700 mb-4">We work with these lenders</h3>
                    <div className="flex flex-wrap items-center justify-center gap-6 md:gap-8">
                      <div className="flex items-center justify-center h-12 w-auto opacity-70 hover:opacity-100 transition-opacity">
                        <Image 
                          src="/images/reverse-mortgage/hecm-fairway-v2-C44Kfmpg.png" 
                          alt="Fairway Independent Mortgage" 
                          width={120} 
                          height={48}
                          className="h-12 w-auto object-contain"
                        />
                      </div>
                      <div className="flex items-center justify-center h-12 w-auto opacity-70 hover:opacity-100 transition-opacity">
                        <img 
                          src="/images/reverse-mortgage/hecm-foa-v2-BhkOzSiY.svg" 
                          alt="Finance of America Reverse" 
                          className="h-12 w-auto object-contain"
                        />
                      </div>
                      <div className="flex items-center justify-center h-12 w-auto opacity-70 hover:opacity-100 transition-opacity">
                        <Image 
                          src="/images/reverse-mortgage/hecm-liberty-v2-CI0zV1UA.png" 
                          alt="Liberty Reverse Mortgage" 
                          width={120} 
                          height={48}
                          className="h-12 w-auto object-contain"
                        />
                      </div>
                      <div className="flex items-center justify-center h-12 w-auto opacity-70 hover:opacity-100 transition-opacity">
                        <img 
                          src="/images/reverse-mortgage/hecm-longbridge-v2-BiwnW6hZ.svg" 
                          alt="Longbridge Financial" 
                          className="h-12 w-auto object-contain"
                        />
                      </div>
                      <div className="flex items-center justify-center h-12 w-auto opacity-70 hover:opacity-100 transition-opacity">
                        <Image 
                          src="/images/reverse-mortgage/hecm-mutual-of-omaha-v2-DOh_uUFS.webp" 
                          alt="Mutual of Omaha" 
                          width={120} 
                          height={48}
                          className="h-12 w-auto object-contain"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Testimonial */}
                  <div className="bg-gradient-to-br from-[#F5F5F0] to-[#E8E8E0] rounded-xl p-6 md:p-8">
                    <div className="flex flex-col md:flex-row gap-6 items-start">
                      <div className="flex-shrink-0">
                        <Image 
                          src="/images/reverse-mortgage/gary-social-proof.jpeg" 
                          alt="Harold & Linda" 
                          width={120} 
                          height={120}
                          className="rounded-full object-cover w-24 h-24 md:w-28 md:h-28"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-1 mb-3">
                          {[...Array(5)].map((_, i) => (
                            <svg key={i} className="h-5 w-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <blockquote className="text-gray-800 text-lg md:text-xl font-medium mb-3 italic">
                          "We eliminated our mortgage payment and now have extra money each month. Best decision for retirement."
                        </blockquote>
                        <p className="text-gray-600 font-semibold">— Harold & Linda, Arizona</p>
                      </div>
                    </div>
                  </div>

                  {/* Stat Line */}
                  <div className="text-center">
                    <p className="text-gray-700 text-base md:text-lg font-semibold">
                      Over <span className="text-[#36596A]">25,000</span> seniors have unlocked their HECM reverse mortgage with us
                    </p>
                  </div>
                </div>
                
                {/* Reverse Mortgage Disclaimer */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="space-y-4 text-xs text-gray-600">
                    <p>
                      <strong className="text-gray-800">Lead Generation Service:</strong> SeniorSimple is not an offer to lend, does not make credit decisions, or fund loans. We connect consumers with licensed mortgage professionals. Loan approval and terms are subject to credit approval and qualification criteria determined by the lender.
                    </p>
                    <p>
                      <strong className="text-gray-800">NMLS Compliance:</strong> SeniorSimple is a lead generation service. All mortgage professionals in our network are licensed and registered with the Nationwide Multistate Licensing System (NMLS). Loan terms, rates, and conditions are determined by individual lenders.
                    </p>
                    <p>
                      <strong className="text-gray-800">Third Party Disclaimer:</strong> SeniorSimple is not affiliated with, endorsed by, or sponsored by Facebook, Meta, Google, or any other social media platform or technology company. All trademarks are the property of their respective owners.
                    </p>
                    <p className="text-gray-700">
                      By using this website, you consent to our <Link href="/terms-of-service" className="underline hover:text-[#36596A]">Terms of Service</Link> and <Link href="/privacy-policy" className="underline hover:text-[#36596A]">Privacy Policy</Link>. Your information may be shared with licensed mortgage professionals to provide you with loan options.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {step > 1 && (
            <div className="mt-6 text-center">
              <button
                className="text-sm font-semibold text-[#36596A] hover:underline"
                onClick={() => setStep(step - 1)}
              >
                ← Back
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
