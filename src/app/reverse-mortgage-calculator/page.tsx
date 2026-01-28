'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertTriangle, CheckCircle, Loader2 } from 'lucide-react'
import { useFunnelLayout } from '@/hooks/useFunnelFooter'
import { initializeTracking, trackPageView } from '@/lib/temp-tracking'
import { AddressAutocomplete, AddressComponents } from '@/components/property/AddressAutocomplete'
import { PropertyLookupData } from '@/types/property'
import { formatPhoneForGHL, formatPhoneForInput, extractUSPhoneNumber } from '@/utils/phone-utils'
import { getEmailValidationState, validateEmailFormat } from '@/utils/email-validation'
import { getPhoneValidationState, validatePhoneFormat } from '@/utils/phone-validation'
import { TrustedForm, getTrustedFormCertUrl } from '@/components/tracking/TrustedForm'

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

  useEffect(() => {
    initializeTracking()
    trackPageView('Reverse Mortgage Calculator', '/reverse-mortgage-calculator')
  }, [])

  const emailValidationState = useMemo(() => getEmailValidationState(email), [email])
  const phoneValidationState = useMemo(() => getPhoneValidationState(phone), [phone])

  const handleReasonSelect = (value: string) => {
    setReason(value)
    setStep(2)
  }

  const handleAge62Check = (is62: boolean) => {
    setIs62Plus(is62)
    if (!is62) {
      // DQ - redirect or show message
      router.push('/reverse-mortgage-calculator/not-qualified?reason=age')
      return
    }
    // If 62+, we still need an age for calculation - use a default of 70 for now
    // Or we could ask for exact age, but let's use a reasonable default
    setAge(70)
    setAgeRange('62+')
    setStep(3)
  }

  const handleHomeownerCheck = (isOwner: boolean) => {
    setIsHomeowner(isOwner)
    if (!isOwner) {
      // DQ - redirect or show message
      router.push('/reverse-mortgage-calculator/not-qualified?reason=homeowner')
      return
    }
    setStep(4)
  }

  const handleAddressSelect = async (selected: AddressComponents) => {
    setLookupError('')
    setIsLookupLoading(true)
    setAddress(selected)

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
        setLookupError(result?.error || 'Unable to retrieve property data.')
        setIsLookupLoading(false)
        return
      }

      const data = result.data as PropertyLookupData
      setPropertyData(data)
      const calc = calculateReverseMortgage(data, age)
      setCalculation(calc)
      setStep(5)
    } catch (error) {
      console.error('Property lookup failed:', error)
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

    // Wait for TrustedForm ID to be populated (required for reverse mortgage)
    // Jornaya is optional - include if available, but don't block submission
    // Poll up to 10 times with 500ms delay (5 seconds total)
    let trustedFormCertUrl = ''
    let jornayaLeadId: string | null = null
    let attempts = 0
    const maxAttempts = 10
    const pollDelay = 500
    const pollStartTime = Date.now()

    console.log('[DEBUG] 🔵 Frontend polling started', { maxAttempts, pollDelay, initialTrustedForm: trustedFormCertUrl, initialJornaya: jornayaLeadId })

    // Only poll for TrustedForm - Jornaya is optional
    while (attempts < maxAttempts && !trustedFormCertUrl) {
      const iterationStart = Date.now()
      console.log('[DEBUG] 🔵 Polling iteration start', { 
        attempts, 
        maxAttempts, 
        hasTrustedForm: !!trustedFormCertUrl, 
        hasJornaya: !!jornayaLeadId,
        conditionResult: attempts < maxAttempts && (!trustedFormCertUrl || !jornayaLeadId),
        trustedFormValue: trustedFormCertUrl || 'EMPTY',
        jornayaValue: jornayaLeadId || 'NULL'
      })

      // Capture TrustedForm certificate URL from hidden input (using helper like RateRoots)
      if (typeof document !== 'undefined') {
        const certUrl = getTrustedFormCertUrl()
        trustedFormCertUrl = certUrl || ''
        console.log('[DEBUG] 🔵 TrustedForm input check', { 
          certUrl: certUrl || 'EMPTY', 
          trustedFormCertUrl: trustedFormCertUrl || 'EMPTY' 
        })
      }

      // Capture Journaya Lead ID if available (check multiple possible locations)
      if (typeof window !== 'undefined') {
        const jornayaFromWindow = (window as any).jornayaLeadId || 
          (window as any).jornaya_lead_id || 
          (window as any).jornaya_leadid ||
          (document.querySelector('[data-jornaya-id]') as HTMLElement)?.dataset?.jornayaId ||
          null
        jornayaLeadId = jornayaFromWindow
        console.log('[DEBUG] 🔵 Journaya ID check', { 
          jornayaFromWindow, 
          jornayaLeadId: jornayaLeadId || 'NULL',
          windowKeys: Object.keys(window).filter(k => k.toLowerCase().includes('jornaya'))
        })
      }

      if (!trustedFormCertUrl) {
        attempts++
        console.log('[DEBUG] 🔵 TrustedForm missing, incrementing attempts', { 
          attempts, 
          maxAttempts, 
          trustedFormCertUrl: trustedFormCertUrl || 'EMPTY', 
          jornayaLeadId: jornayaLeadId || 'NULL (optional)' 
        })
        if (attempts < maxAttempts) {
          console.log(`⏳ Waiting for TrustedForm (attempt ${attempts}/${maxAttempts})...`)
          const waitStartTime = Date.now()
          await new Promise(resolve => setTimeout(resolve, pollDelay))
          const waitEndTime = Date.now()
          console.log('[DEBUG] 🔵 Wait completed', { 
            attempts, 
            waitDuration: waitEndTime - waitStartTime, 
            expectedDelay: pollDelay 
          })
        }
      } else {
        console.log('[DEBUG] 🔵 TrustedForm found, exiting loop', { 
          attempts, 
          trustedFormCertUrl: trustedFormCertUrl ? 'PRESENT' : 'EMPTY', 
          jornayaLeadId: jornayaLeadId ? 'PRESENT' : 'NULL (optional)' 
        })
        break
      }
      
      const iterationEnd = Date.now()
      console.log('[DEBUG] 🔵 Polling iteration end', { 
        attempts, 
        iterationDuration: iterationEnd - iterationStart,
        willContinue: attempts < maxAttempts && !trustedFormCertUrl
      })
    }

    const pollEndTime = Date.now()
    const totalPollTime = pollEndTime - pollStartTime
    console.log('[DEBUG] 🔵 Frontend polling completed', { 
      attempts, 
      maxAttempts, 
      totalPollTime, 
      trustedFormCertUrl: trustedFormCertUrl || 'EMPTY', 
      jornayaLeadId: jornayaLeadId || 'NULL (optional)', 
      hasTrustedForm: !!trustedFormCertUrl,
      hasJornaya: !!jornayaLeadId
    })

    // Log final status - only TrustedForm is required
    if (!trustedFormCertUrl) {
      console.warn('⚠️ TrustedForm not available after polling (will still submit):', {
        trustedFormCertUrl: trustedFormCertUrl || 'MISSING',
        jornayaLeadId: jornayaLeadId || 'NULL (optional)',
        attempts
      })
    } else {
      console.log('✅ TrustedForm captured (Jornaya optional):', {
        trustedFormCertUrl: trustedFormCertUrl ? 'PRESENT' : 'MISSING',
        jornayaLeadId: jornayaLeadId ? 'PRESENT' : 'NULL (optional)',
        attempts
      })
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

      router.push('/reverse-mortgage-calculator/results')
    } catch (error: any) {
      console.error('Lead submission failed:', error)
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
      <TrustedForm />
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

                <form onSubmit={handleLeadSubmit} className="space-y-5">
                  {/* TrustedForm hidden input */}
                  <input
                    type="hidden"
                    name="xxTrustedFormCertUrl"
                    id="xxTrustedFormCertUrl"
                    value=""
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
