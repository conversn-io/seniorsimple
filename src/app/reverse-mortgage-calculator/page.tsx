'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertTriangle, CheckCircle, Loader2 } from 'lucide-react'
import { useFunnelLayout } from '@/hooks/useFunnelFooter'
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
  useFunnelLayout()
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

  // Tracking state for funnel analytics
  const [sessionId, setSessionId] = useState<string>('')
  const [previousStepName, setPreviousStepName] = useState<string | null>(null)
  const [stepStartTime, setStepStartTime] = useState<number>(Date.now())
  const [quizStartTime, setQuizStartTime] = useState<number>(Date.now())

  // Step names for tracking
  const STEP_NAMES: Record<number, string> = {
    1: 'reason_selection',
    2: 'age_verification',
    3: 'homeowner_check',
    4: 'address_lookup',
    5: 'equity_results',
    6: 'lead_capture'
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
    
    // Track to Meta for retargeting audiences
    if (step === 4) {
      // Address step - high intent
      trackMetaPixelEvent('ViewContent', {
        content_name: 'Reverse Mortgage - Address Step',
        content_category: 'reverse-mortgage',
        value: 0
      }, 'reverse-mortgage')
    } else if (step === 5) {
      // Results step - very high intent
      trackMetaPixelEvent('AddToCart', {
        content_name: 'Reverse Mortgage - Equity Results',
        content_category: 'reverse-mortgage',
        value: calculation?.equityAvailable || 0,
        currency: 'USD'
      }, 'reverse-mortgage')
    } else if (step === 6) {
      // Lead form - intent to convert
      trackMetaPixelEvent('InitiateCheckout', {
        content_name: 'Reverse Mortgage - Lead Form',
        content_category: 'reverse-mortgage',
        value: calculation?.equityAvailable || 0,
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

  // Load TrustedForm script ONLY when form is visible (step 6)
  // This ensures the form field exists BEFORE the script loads
  // TrustedForm script must find the form field at initialization time
  useTrustedForm({ enabled: step === 6 })

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

  const handleAddressSelect = async (selected: AddressComponents) => {
    setLookupError('')
    setIsLookupLoading(true)
    setAddress(selected)

    // Track address entry
    trackQuestionAnswer('address_lookup', selected.state || 'unknown', 4, 6, sessionId, 'reverse-mortgage')
    trackGA4Event('rm_address_entered', {
      question: 'address_lookup',
      state: selected.state,
      city: selected.city,
      step: 4,
      session_id: sessionId
    })

    try {
      if (!selected.street || !selected.city || !selected.state || !selected.zip) {
        setLookupError('Please select a full address with city, state, and ZIP.')
        setIsLookupLoading(false)
        return
      }

      const response = await fetch('/api/batchdata/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: selected.street,
          city: selected.city,
          state: selected.state,
          zip: selected.zip,
          place_id: selected.place_id,
        }),
      })

      const result = await response.json()
      if (!response.ok || !result?.success || !result?.data) {
        // Track lookup failure
        trackGA4Event('rm_property_lookup_failed', {
          error: result?.error || 'unknown',
          state: selected.state,
          step: 4,
          session_id: sessionId
        })
        setLookupError(result?.error || 'Unable to retrieve property data.')
        setIsLookupLoading(false)
        return
      }

      const data = result.data as PropertyLookupData
      setPropertyData(data)
      const calc = calculateReverseMortgage(data, age)
      setCalculation(calc)
      
      // Track successful property lookup with equity data
      trackGA4Event('rm_property_found', {
        property_value: data.property_value,
        mortgage_balance: data.mortgage_balance,
        equity_available: calc.equityAvailable,
        net_proceeds: calc.netProceeds,
        state: selected.state,
        step: 4,
        session_id: sessionId
      })
      
      setStep(5)
    } catch (error) {
      console.error('Property lookup failed:', error)
      trackGA4Event('rm_property_lookup_error', {
        error: 'exception',
        step: 4,
        session_id: sessionId
      })
      setLookupError('We could not verify that address. Please try again.')
    } finally {
      setIsLookupLoading(false)
    }
  }

  const handleLeadSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
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

    if (!calculation || !propertyData || !address) {
      console.log('[DEBUG] 🔵 Missing calculation/propertyData/address, returning early')
      setSubmitError('Missing property results. Please restart the calculator.')
      return
    }
    
    console.log('[DEBUG] 🔵 All validations passed, proceeding to polling')

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
      propertyData,
      calculation,
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
      calculatedResults: calculation,
      trustedFormCertUrl: trustedFormCertUrl || null,
      jornayaLeadId: jornayaLeadId || null,
    }
    console.log('[DEBUG] 🔵 Payload prepared for submission', { 
      trustedFormCertUrl: payload.trustedFormCertUrl || 'NULL', 
      jornayaLeadId: payload.jornayaLeadId || 'NULL' 
    })

    setIsSubmitting(true)

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

      const baseEstimate = calculation
        ? calculation.netProceeds > 0
          ? calculation.netProceeds
          : calculation.grossProceeds
        : 0
      const estimatedLow = baseEstimate ? Math.floor(baseEstimate * 0.85) : 0
      const estimatedHigh = baseEstimate || 0

      const stored = {
        ...quizAnswers,
        contact: {
          firstName,
          lastName,
          email,
          phone: formatPhoneForGHL(extractUSPhoneNumber(phone)),
        },
        equityRange: {
          low: estimatedLow,
          high: estimatedHigh,
          propertyValue: calculation?.propertyValue,
          age,
        },
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
        equity_available: calculation?.equityAvailable || 0,
        property_value: calculation?.propertyValue || 0,
        net_proceeds: calculation?.netProceeds || 0,
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
        value: calculation?.equityAvailable || 0,
        currency: 'USD'
      }, 'reverse-mortgage')
      
      console.log('📊 Lead Submitted Successfully:', {
        sessionId,
        completionTime,
        equityAvailable: calculation?.equityAvailable
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
      setIsSubmitting(false)
    }
  }

  const baseEstimate = calculation
    ? calculation.netProceeds > 0
      ? calculation.netProceeds
      : calculation.grossProceeds
    : 0
  const estimatedLow = baseEstimate ? Math.floor(baseEstimate * 0.85) : 0
  const estimatedHigh = baseEstimate || 0

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
              <span className="font-semibold text-[#36596A]">Step {step} of 6</span>
              <span>Fast, no-obligation estimate</span>
            </div>

            {step === 1 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Why are you looking into reverse mortgage?’</h2>
                  
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
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Are you 62 or above?</h2>
                </div>
                <div className="space-y-3">
                  <button
                    className="quiz-button w-full border-2 border-[#36596A] text-[#36596A] rounded-xl py-4 px-6 text-lg font-semibold hover:bg-[#36596A] hover:text-white transition-colors"
                    onClick={() => handleAge62Check(true)}
                  >
                    Yes, I am 62+
                  </button>
                  <button
                    className="quiz-button w-full border-2 border-[#36596A] text-[#36596A] rounded-xl py-4 px-6 text-lg font-semibold hover:bg-[#36596A] hover:text-white transition-colors"
                    onClick={() => handleAge62Check(false)}
                  >
                    No, I'm under 62
                  </button>
                </div>
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
                  <p className="font-semibold mb-1">Why we ask:</p>
                  <p>Reverse mortgages (HECMs) are federally insured loans only available to homeowners aged 62 and older.</p>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Great, Why are you looking into reverse mortgage?!</h2>
                  <p className="mt-2 text-gray-600">Are you a homeowner?</p>
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
                </div>

                {isLookupLoading && (
                  <div className="flex items-center justify-center gap-3 text-[#36596A]">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Calculating your equity...</span>
                  </div>
                )}

                {lookupError && (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    {lookupError}
                  </div>
                )}
              </div>
            )}

            {step === 5 && calculation && (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Great news!</h2>
                  <p className="mt-2 text-gray-600">
                    Based on your home, you may qualify for up to:
                  </p>
                </div>

                <div className="rounded-2xl border-2 border-[#36596A] bg-[#36596A] text-white p-6 text-center">
                  <p className="text-sm uppercase tracking-wide text-[#E4CDA1]">Estimated Tax-Free Equity</p>
                  <p className="mt-2 text-3xl sm:text-4xl font-bold">
                    ${estimatedLow.toLocaleString()} - ${estimatedHigh.toLocaleString()}
                  </p>
                  <p className="mt-2 text-sm text-white/80">
                    Estimated using age {age} and your property value of ${calculation.propertyValue.toLocaleString()}.
                  </p>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-3 text-sm text-gray-700">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <span>No monthly mortgage payments required</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <span>Stay in your home while accessing equity</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <span>FHA-insured HECM protection for eligible borrowers</span>
                  </div>
                  {calculation.existingMortgage > 0 && (
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                      <span>
                        Existing mortgage payoff required (est. ${calculation.existingMortgage.toLocaleString()}).
                      </span>
                    </div>
                  )}
                </div>

                <button
                  className="quiz-button w-full bg-[#1F4D3A] text-white py-4 px-8 rounded-xl font-bold text-lg border-2 border-[#E4CDA1] hover:bg-[#173A2D] transition-all shadow-lg"
                  onClick={() => setStep(6)}
                >
                  Get My Reverse Mortgage Quote
                </button>
              </div>
            )}

            {step === 6 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                    You're One Step Away From Your Reverse Mortgage Quote
                  </h2>
                  <p className="mt-2 text-gray-600">
                    A licensed reverse mortgage specialist will review your options and provide you with quotes from the best providers nationwide.
                  </p>
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
                    className="quiz-button w-full bg-[#36596A] text-white py-4 px-8 rounded-xl font-bold text-lg hover:bg-[#2a4a5a] transition-all shadow-lg disabled:opacity-60"
                    disabled={
                      !firstName ||
                      !email ||
                      !phone ||
                      emailValidationState !== 'valid' ||
                      phoneValidationState !== 'valid' ||
                      isSubmitting
                    }
                  >
                    {isSubmitting ? 'Submitting...' : 'Get My Free Analysis'}
                  </button>
                  <p className="text-xs text-gray-500 text-center">
                    By submitting, you agree to be contacted by phone, text, or email. Message and data rates
                    may apply.
                  </p>
                </form>
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
