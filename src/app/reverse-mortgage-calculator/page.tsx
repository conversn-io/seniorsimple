'use client'

import { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { PropertyVerificationStep } from '@/components/reverse-mortgage/PropertyVerificationStep'
import { MAX_QUALIFYING_LTV } from '@/components/reverse-mortgage/VerifyPropertyDetails'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { AlertTriangle, CheckCircle, Loader2, ShieldCheck, Lock } from 'lucide-react'
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
  useMinimalFunnelLayout({ variant: 'mortgage' })
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
  // User-verified (or BatchData-trusted) property values captured at step 5.
  // `batchDataLtv` is the original BatchData LTV before user adjustment — used for
  // defensive max(batchData, userVerified) gating downstream (e.g. Meta CAPI).
  const [verifiedProperty, setVerifiedProperty] = useState<{
    propertyValue: number
    mortgageBalance: number
    ltv: number
    batchDataLtv?: number
    batchDataUsed: boolean
  } | null>(null)

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
  
  // Ref for smooth scroll to progress bar on mobile
  const progressBarRef = useRef<HTMLDivElement>(null)

  // Tracking state for funnel analytics
  const [sessionId, setSessionId] = useState<string>('')
  const [previousStepName, setPreviousStepName] = useState<string | null>(null)
  const [stepStartTime, setStepStartTime] = useState<number>(Date.now())
  const [quizStartTime, setQuizStartTime] = useState<number>(Date.now())

  // Step names for tracking (6 steps — property verification moved BEFORE lead capture
  // so leads that fail the 35% LTV gate never become captured leads).
  const STEP_NAMES: Record<number, string> = {
    1: 'homeowner_check',
    2: 'age_verification',
    3: 'reason_selection',
    4: 'address_entry',
    5: 'property_verification',
    6: 'lead_capture',
  }
  const TOTAL_STEPS = 6

  // Log quiz progress to Vercel runtime logs (fire-and-forget)
  const logQuizProgress = (stepNum: number, stepName: string, answer: string, meta?: Record<string, any>) => {
    fetch('/api/quiz-progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        funnelType: 'reverse-mortgage',
        step: stepNum,
        stepName,
        answer,
        totalSteps: TOTAL_STEPS,
        meta,
      }),
    }).catch(() => {})
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
    
    // Track to Meta for retargeting audiences (6-step funnel)
    if (step === 4) {
      // Address entry step - high intent
      trackMetaPixelEvent('ViewContent', {
        content_name: 'Reverse Mortgage - Address Entry',
        content_category: 'reverse-mortgage',
        value: 0
      }, 'reverse-mortgage')
    } else if (step === 5) {
      // Property verification step — user is engaging with their numbers
      trackMetaPixelEvent('ViewContent', {
        content_name: 'Reverse Mortgage - Property Verification',
        content_category: 'reverse-mortgage',
        value: 0,
      }, 'reverse-mortgage')
    } else if (step === 6) {
      // Lead form - intent to convert (only reached by user-verified ≤35% LTV)
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

  // Load TrustedForm script ONLY when form is visible (step 6 in the new flow)
  // This ensures the form field exists BEFORE the script loads
  // TrustedForm script must find the form field at initialization time
  useTrustedForm({ enabled: step === 6 })

  const emailValidationState = useMemo(() => getEmailValidationState(email), [email])
  const phoneValidationState = useMemo(() => getPhoneValidationState(phone), [phone])

  const handleReasonSelect = (value: string) => {
    setReason(value)
    logQuizProgress(3, 'reason_selection', value)

    // Track answer
    trackQuestionAnswer('reason_selection', value, 3, 6, sessionId, 'reverse-mortgage')
    trackGA4Event('rm_answer', {
      question: 'reason_selection',
      answer: value,
      step: 3,
      session_id: sessionId
    })
    
    setStep(4)
  }

  const handleAge62Check = (is62: boolean) => {
    setIs62Plus(is62)
    logQuizProgress(2, 'age_verification', is62 ? 'yes_62_plus' : 'no_under_62', { qualified: is62 })

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
    logQuizProgress(1, 'homeowner_check', isOwner ? 'yes' : 'no', { qualified: isOwner })

    // Track answer
    trackQuestionAnswer('homeowner_check', isOwner ? 'yes_homeowner' : 'no_not_homeowner', 1, 6, sessionId, 'reverse-mortgage')
    trackGA4Event('rm_answer', {
      question: 'homeowner_check',
      answer: isOwner ? 'yes_homeowner' : 'no_not_homeowner',
      step: 1,
      session_id: sessionId,
      qualified: isOwner
    })
    
    if (!isOwner) {
      // Track disqualification
      trackGA4Event('rm_disqualified', {
        reason: 'not_homeowner',
        step: 1,
        session_id: sessionId
      })
      router.push('/reverse-mortgage-calculator/not-qualified?reason=homeowner')
      return
    }
    setStep(2)

    // Scroll to progress bar after first question (anchor to quiz)
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        progressBarRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        })
      }, 100)
    }
  }

  // Handle address selection - NO API call here, just capture and move to lead form
  const handleAddressSelect = (selected: AddressComponents) => {
    setLookupError('')
    setAddress(selected)
    logQuizProgress(4, 'address_entry', selected.state || 'unknown', { city: selected.city, zip: selected.zip })

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

    // Move to the property verification step. BatchData lookup fires there.
    setStep(5)
  }

  // Stable callback for PropertyVerificationStep — keeps its useEffect from re-firing.
  const handleLookupComplete = useCallback(
    (info: { success: boolean; ms: number; ltv?: number }) => {
      logQuizProgress(5, 'batchdata_lookup', info.success ? 'success' : 'failed', info)
      trackGA4Event('rm_property_lookup', {
        success: info.success,
        latency_ms: info.ms,
        batchdata_ltv: info.ltv,
      })
    },
    // sessionId comes from closure; logQuizProgress is stable enough for our purposes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sessionId],
  )

  const handlePropertyVerified = (values: {
    propertyValue: number
    mortgageBalance: number
    ltv: number
    batchDataLtv?: number
    batchDataUsed: boolean
  }) => {
    setVerifiedProperty(values)
    const ltvPct = Math.round(values.ltv * 100)
    const qualifiesBuyer1 = values.ltv <= MAX_QUALIFYING_LTV

    logQuizProgress(
      5,
      'property_verification',
      `ltv=${ltvPct}% ${qualifiesBuyer1 ? 'buyer1_fit' : 'buyer1_dq'}`,
      {
        propertyValue: values.propertyValue,
        mortgageBalance: values.mortgageBalance,
        ltv: values.ltv,
        batchDataUsed: values.batchDataUsed,
        qualifiesBuyer1,
      },
    )

    trackGA4Event('rm_property_verified', {
      ltv: Number(values.ltv.toFixed(4)),
      qualifies_buyer1: qualifiesBuyer1,
      batch_data_used: values.batchDataUsed,
      property_value: values.propertyValue,
      mortgage_balance: values.mortgageBalance,
      session_id: sessionId,
    })

    // No hard DQ here — every verified lead advances to lead capture. Buyer-1 fit is
    // recorded on the lead in state; post-submit routing branches on it to send
    // qualifying leads to /results (LynqFlux) and DQ leads to /results-alt (alt buyer
    // / offer-wall placeholder).
    setStep(6)
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
    logQuizProgress(5, 'lead_submit', email, { hasPhone: !!phone, state: address.state, zip: address.zip })

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
      // User-verified at step 5 (always present when we reach lead submit; LTV is ≤35%).
      verifiedProperty: verifiedProperty
        ? {
            propertyValue: verifiedProperty.propertyValue,
            mortgageBalance: verifiedProperty.mortgageBalance,
            ltv: verifiedProperty.ltv,
            batchDataLtv: verifiedProperty.batchDataLtv,
            batchDataUsed: verifiedProperty.batchDataUsed,
          }
        : null,
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

    // Meta Lead event gating — fires only when max(BatchData, user-verified) LTV
    // is ≤ 0.50 (≥50% equity). Intentional underreporting: train Meta to optimize
    // toward the cohort that actually converts with the buyer (low-LTV / high-
    // equity homeowners) instead of every form submit.
    // Defensive max() catches users who adjust numbers downward at step 5.
    //
    // Signal check uses propertyValue (not ltv) — a paid-off home is LTV = 0,
    // which is the *highest* equity signal and must fire. The old `gatingLtv > 0`
    // guard silently excluded those leads. We now require a real propertyValue
    // (signals "user verified the step") instead.
    const LEAD_LTV_CEILING = 0.50
    const gatingLtv = Math.max(
      verifiedProperty?.ltv ?? 0,
      verifiedProperty?.batchDataLtv ?? 0,
    )
    const hasPropertySignal = (verifiedProperty?.propertyValue ?? 0) > 0
    const fireLead = hasPropertySignal && gatingLtv <= LEAD_LTV_CEILING
    // Generated upfront so browser pixel and server CAPI share the same eventID.
    const capiEventId = fireLead
      ? `lead-rm-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
      : undefined

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
      // Shared eventID for browser+server CAPI dedup. When undefined (LTV > 0.50),
      // server skips the CAPI Lead event entirely — Lead is gated to ≤ 50% LTV.
      capiEventId,
      leadGate: {
        gatingLtv: Number(gatingLtv.toFixed(4)),
        ceiling: LEAD_LTV_CEILING,
        shouldFire: fireLead,
        ltvSource: verifiedProperty?.batchDataUsed ? 'batchdata' : 'user_verified',
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

      // Store data for results page — property already verified at step 5, so the
      // results page can skip BatchData and go straight to delivery + results.
      const stored = {
        ...quizAnswers,
        sessionId, // Needed for LynqFlux delivery
        contact: {
          firstName,
          lastName,
          email,
          phone: formatPhoneForGHL(extractUSPhoneNumber(phone)),
        },
        addressForLookup: {
          street: address.street,
          city: address.city,
          state: address.state,
          zip: address.zip,
          fullAddress: address.formatted_address,
        },
        age,
        // Verified property carried across the page boundary so /results can render
        // and deliver immediately, without a second BatchData round-trip.
        verifiedProperty: verifiedProperty
          ? {
              propertyValue: verifiedProperty.propertyValue,
              mortgageBalance: verifiedProperty.mortgageBalance,
              ltv: verifiedProperty.ltv,
              batchDataUsed: verifiedProperty.batchDataUsed,
            }
          : null,
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
      
      // Track lead form submit — but suppress the embedded Meta Lead pixel fire.
      // We fire Lead explicitly below with capiEventId so it dedupes against the
      // server CAPI Lead event. If we let trackLeadFormSubmit also fire Lead (no
      // eventID), Meta would count two separate Lead events per submit.
      trackLeadFormSubmit(
        {
          firstName,
          lastName,
          email,
          phoneNumber: formatPhoneForGHL(extractUSPhoneNumber(phone)),
          zipCode: address?.zip || '',
          state: address?.state,
          quizAnswers,
          sessionId,
          funnelType: 'reverse-mortgage',
        },
        { skipMetaEvent: true },
      )
      
      // Track to GA4
      trackGA4Event('rm_lead_submitted', {
        state: address?.state,
        completion_time_seconds: completionTime,
        has_trustedform: !!trustedFormCertUrl,
        has_jornaya: !!jornayaLeadId,
        session_id: sessionId,
        event_category: 'reverse_mortgage_funnel'
      })
      
      // ────────────────────────────────────────────────────────────────────────
      // Meta Lead event — gated to LTV ≤ 50%
      // ────────────────────────────────────────────────────────────────────────
      // Intentional underreporting: train Meta to optimize toward the cohort
      // that actually converts with the buyer (low-LTV / high-equity homeowners)
      // instead of every form submit. Below Meta's ~50 events/week optimization
      // threshold at current volume — accept that trade-off in exchange for a
      // cleaner training signal when ads resume.
      // sessionStorage guard prevents refires within the same browser tab
      // (refresh / back-button / extension retries).
      const LEAD_FIRED_KEY = 'rm_meta_lead_fired'
      const leadAlreadyFired = typeof window !== 'undefined'
        && sessionStorage.getItem(LEAD_FIRED_KEY) === '1'

      console.log('[Meta CAPI] Lead event gate', {
        gatingLtv,
        ceiling: LEAD_LTV_CEILING,
        fireLead,
        leadEventId: capiEventId,
        leadAlreadyFired,
      })

      if (fireLead && capiEventId && !leadAlreadyFired) {
        trackMetaPixelEvent('Lead', {
          content_name: 'Reverse Mortgage Lead (LTV≤50%)',
          content_category: 'reverse-mortgage',
          value: 0,
          currency: 'USD',
          ltv: Number(gatingLtv.toFixed(4)),
          ltv_source: verifiedProperty?.batchDataUsed ? 'batchdata' : 'user_verified',
        }, 'reverse-mortgage', capiEventId)
        if (typeof window !== 'undefined') {
          sessionStorage.setItem(LEAD_FIRED_KEY, '1')
        }
      } else if (fireLead && leadAlreadyFired) {
        console.log('[Meta CAPI] ⏭️ Skipping browser Lead pixel — already fired this session')
      } else if (!fireLead) {
        if (!hasPropertySignal) {
          console.log('[Meta CAPI] ⏭️ Skipping browser Lead pixel — no propertyValue (verifiedProperty missing or 0)')
        } else {
          console.log(`[Meta CAPI] ⏭️ Skipping browser Lead pixel — LTV ${(gatingLtv * 100).toFixed(1)}% > ${LEAD_LTV_CEILING * 100}% ceiling`)
        }
      }
      
      console.log('📊 Lead Submitted Successfully:', {
        sessionId,
        completionTime,
        address: address.formatted_address
      })

      // Route based on buyer-1 fit. >35% LTV leads land on /results-alt so we
      // can segment them downstream for refi-buyer / offer-wall routing. BOTH
      // pages deliver to LynqFlux — segmentation is just routing + tagging,
      // not a delivery gate. Every lead earns the per-delivered fee.
      const isBuyer1Fit = !!verifiedProperty && verifiedProperty.ltv <= MAX_QUALIFYING_LTV
      router.push(
        isBuyer1Fit
          ? '/reverse-mortgage-calculator/results'
          : '/reverse-mortgage-calculator/results-alt',
      )
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

      <section className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          {/* Hero Section - Above the Fold */}
          <div className="text-center mb-6">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#36596A] leading-tight">
              Find Out How to Stop Paying Your Mortgage After 62
            </h1>
            <p className="mt-4 text-lg sm:text-xl text-gray-600">
              Use your home's value to retire with less stress — check your eligibility in under 60 seconds.
            </p>
          </div>



          {/* Main Form Card - Sticky from Step 2 onwards */}
          <div 
            ref={progressBarRef}
            className={`bg-white rounded-2xl shadow-lg border border-[#E5E7EB] p-6 sm:p-8 scroll-mt-20 ${step > 1 ? 'sticky top-0 z-40' : ''}`}
          >
            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="font-semibold text-[#36596A]">Step {step} of {TOTAL_STEPS}</span>
                <span className="text-gray-500">Fast, no-obligation estimate</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#36596A] to-[#4a7a8a] rounded-full transition-all duration-300"
                  style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
                />
              </div>
            </div>

            {step === 1 && (
              <div className="space-y-5">
                <div className="text-center">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Do you own your home?</h2>
                  <p className="mt-2 text-gray-600 text-sm">Reverse mortgages require home ownership.</p>
                </div>
                <div className="grid gap-3">
                  <button
                    className="group w-full bg-white border-2 border-gray-200 rounded-xl py-4 px-5 text-left hover:border-[#36596A] hover:bg-[#f8fafb] hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#36596A] focus:ring-offset-2"
                    onClick={() => handleHomeownerCheck(true)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <svg className="w-6 h-6 text-[#36596A]" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                        </svg>
                        <span className="text-base font-semibold text-gray-800">Yes, I own a home</span>
                      </div>
                      <svg className="w-5 h-5 text-gray-400 group-hover:text-[#36596A] group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </button>
                  <button
                    className="group w-full bg-white border-2 border-gray-200 rounded-xl py-4 px-5 text-left hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                    onClick={() => handleHomeownerCheck(false)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-base font-semibold text-gray-600">No, I don't own a home</span>
                      <svg className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5">
                <div className="text-center">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Are you 62 or older?</h2>
                  <p className="mt-2 text-gray-600 text-sm">This ensures you qualify for the HECM program.</p>
                </div>
                <div className="grid gap-3">
                  <button
                    className="group w-full bg-green-50 border-2 border-green-200 rounded-xl py-4 px-5 text-left hover:border-green-500 hover:bg-green-100 hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                    onClick={() => handleAge62Check(true)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-6 w-6 text-green-500" />
                        <span className="text-base font-semibold text-gray-800">Yes, I am 62+</span>
                      </div>
                      <svg className="w-5 h-5 text-green-400 group-hover:text-green-600 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </button>
                  <button
                    className="group w-full bg-white border-2 border-gray-200 rounded-xl py-4 px-5 text-left hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                    onClick={() => handleAge62Check(false)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-base font-semibold text-gray-600">No, I'm under 62</span>
                      <svg className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </button>
                </div>
                
                <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4 text-sm">
                  <div className="flex items-start gap-2">
                    <svg className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
                    <div className="text-blue-700">
                      <p className="font-semibold mb-0.5">Why 62+?</p>
                      <p className="text-blue-600">HECM reverse mortgages are federally insured loans designed for seniors 62 and older.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-5">
                <div className="text-center">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">What's your main goal with a reverse mortgage?</h2>
                </div>
                <div className="grid gap-3">
                  {REASON_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      className="group w-full bg-white border-2 border-gray-200 rounded-xl py-4 px-5 text-left hover:border-[#36596A] hover:bg-[#f8fafb] hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#36596A] focus:ring-offset-2"
                      onClick={() => handleReasonSelect(option.value)}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-base font-semibold text-gray-800 group-hover:text-[#36596A] capitalize">
                          {option.label}
                        </span>
                        <svg className="w-5 h-5 text-gray-400 group-hover:text-[#36596A] group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </button>
                  ))}
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

            {step === 5 && address && (
              <PropertyVerificationStep
                address={{
                  street: address.street,
                  city: address.city,
                  state: address.state,
                  zip: address.zip,
                }}
                onConfirm={handlePropertyVerified}
                onLookupComplete={handleLookupComplete}
              />
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
                
{/* Brief Disclaimer */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500 text-center">
                    SeniorSimple is not an offer to lend. We connect you with licensed mortgage professionals. 
                    Loan approval subject to lender criteria.
                  </p>
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

          {/* Testimonial - Immediately below question box */}
          <div className="mt-6 bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div className="flex-shrink-0">
                <Image 
                  src="/images/reverse-mortgage/gary-social-proof.jpeg" 
                  alt="Harold & Linda" 
                  width={72} 
                  height={72}
                  className="rounded-full object-cover w-[72px] h-[72px] border-2 border-yellow-200"
                />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-0.5 mb-1.5">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="h-4 w-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <blockquote className="text-gray-700 text-sm md:text-base font-medium mb-1 italic">
                  "We eliminated our mortgage payment and now have extra money each month. Best decision for retirement."
                </blockquote>
                <p className="text-gray-500 font-semibold text-xs">— Harold & Linda, Arizona</p>
              </div>
            </div>
          </div>

          {/* Social Proof Stats & Lender Logos */}
          <div className="mt-6 space-y-4">
            <div className="text-center">
              <p className="text-gray-600 text-sm font-medium">
                Over <span className="text-[#36596A] font-bold">25,000</span> seniors have unlocked their HECM reverse mortgage
              </p>
            </div>
            
            {/* Lender Logos - Scrolling Carousel */}
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-2">We work with FHA-approved lenders</p>
              <div className="relative overflow-hidden">
                <div className="flex animate-scroll-logos gap-8 whitespace-nowrap">
                  <div className="flex items-center gap-8 shrink-0">
                    <Image src="/images/reverse-mortgage/hecm-fairway-v2-C44Kfmpg.png" alt="Fairway" width={90} height={32} className="h-8 w-auto object-contain opacity-60" />
                    <img src="/images/reverse-mortgage/hecm-foa-v2-BhkOzSiY.svg" alt="Finance of America" className="h-8 w-auto object-contain opacity-60" />
                    <Image src="/images/reverse-mortgage/hecm-liberty-v2-CI0zV1UA.png" alt="Liberty" width={90} height={32} className="h-8 w-auto object-contain opacity-60" />
                    <img src="/images/reverse-mortgage/hecm-longbridge-v2-BiwnW6hZ.svg" alt="Longbridge" className="h-8 w-auto object-contain opacity-60" />
                    <Image src="/images/reverse-mortgage/hecm-mutual-of-omaha-v2-DOh_uUFS.webp" alt="Mutual of Omaha" width={90} height={32} className="h-8 w-auto object-contain opacity-60" />
                  </div>
                  <div className="flex items-center gap-8 shrink-0">
                    <Image src="/images/reverse-mortgage/hecm-fairway-v2-C44Kfmpg.png" alt="Fairway" width={90} height={32} className="h-8 w-auto object-contain opacity-60" />
                    <img src="/images/reverse-mortgage/hecm-foa-v2-BhkOzSiY.svg" alt="Finance of America" className="h-8 w-auto object-contain opacity-60" />
                    <Image src="/images/reverse-mortgage/hecm-liberty-v2-CI0zV1UA.png" alt="Liberty" width={90} height={32} className="h-8 w-auto object-contain opacity-60" />
                    <img src="/images/reverse-mortgage/hecm-longbridge-v2-BiwnW6hZ.svg" alt="Longbridge" className="h-8 w-auto object-contain opacity-60" />
                    <Image src="/images/reverse-mortgage/hecm-mutual-of-omaha-v2-DOh_uUFS.webp" alt="Mutual of Omaha" width={90} height={32} className="h-8 w-auto object-contain opacity-60" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
