'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, Loader2 } from 'lucide-react'
import { useFunnelLayout } from '@/hooks/useFunnelFooter'
import { initializeTracking, trackPageView, trackGA4Event } from '@/lib/temp-tracking'
import { FAQ } from '@/components/quiz/FAQ'

const STORAGE_KEY = 'reverse_mortgage_calculator'

interface StoredResults {
  contact?: {
    firstName?: string
    lastName?: string
    email?: string
    phone?: string
  }
  addressForLookup?: {
    street?: string
    city?: string
    state?: string
    zip?: string
    fullAddress?: string
  }
  addressInfo?: {
    street?: string
    city?: string
    state?: string
    zipCode?: string
    zip?: string
    fullAddress?: string
  }
  age?: number
  submittedAt?: string
  reason?: string
}

interface PropertyData {
  property_value: number
  mortgage_balance: number
  equity_available: number
}

interface CalculationResult {
  propertyValue: number
  grossProceeds: number
  existingMortgage: number
  netProceeds: number
  equityAvailable: number
}

const getPrincipalLimitFactor = (age: number) => {
  if (age >= 90) return 0.75
  if (age >= 85) return 0.7
  if (age >= 80) return 0.65
  if (age >= 75) return 0.6
  if (age >= 70) return 0.55
  if (age >= 65) return 0.5
  return 0.45
}

const calculateReverseMortgage = (data: PropertyData, age: number): CalculationResult => {
  const FHA_LIMIT = 1149825
  const adjustedValue = Math.min(data.property_value, FHA_LIMIT)
  const principalLimitFactor = getPrincipalLimitFactor(age)
  const grossProceeds = Math.floor(adjustedValue * principalLimitFactor)
  const existingMortgage = data.mortgage_balance || 0
  const netProceeds = Math.max(0, grossProceeds - existingMortgage)
  const equityAvailable = data.equity_available || Math.max(0, data.property_value - existingMortgage)

  return {
    propertyValue: data.property_value,
    grossProceeds,
    existingMortgage,
    netProceeds,
    equityAvailable,
  }
}

export default function ReverseMortgageResultsPage() {
  useFunnelLayout()
  const router = useRouter()
  const [results, setResults] = useState<StoredResults | null>(null)
  const [calculation, setCalculation] = useState<CalculationResult | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [lookupStatus, setLookupStatus] = useState<'loading' | 'success' | 'failed'>('loading')

  useEffect(() => {
    initializeTracking()
    trackPageView('Reverse Mortgage Results', '/reverse-mortgage-calculator/results')

    const fetchPropertyData = async () => {
      if (typeof window === 'undefined') {
        setIsLoading(false)
        setLookupStatus('failed')
        return
      }

      const stored = sessionStorage.getItem(STORAGE_KEY) || localStorage.getItem(STORAGE_KEY)
      if (!stored) {
        setIsLoading(false)
        setLookupStatus('failed')
        return
      }

      try {
        const parsedResults = JSON.parse(stored) as StoredResults
        setResults(parsedResults)

        // Get address for lookup - handle both addressForLookup and addressInfo formats
        const addressForLookup = parsedResults.addressForLookup
        const addressInfo = parsedResults.addressInfo
        
        const street = addressForLookup?.street || addressInfo?.street
        const city = addressForLookup?.city || addressInfo?.city
        const state = addressForLookup?.state || addressInfo?.state
        const zipCode = addressForLookup?.zip || addressInfo?.zipCode || addressInfo?.zip
        
        if (!street || !city || !state) {
          console.log('No address data for property lookup')
          setIsLoading(false)
          setLookupStatus('failed')
          return
        }

        // Call BatchData API for property lookup
        console.log('🏠 Fetching property data...')
        const response = await fetch('/api/batchdata/lookup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            address: street,
            city: city,
            state: state,
            zip: zipCode,
          }),
        })

        const result = await response.json()
        
        if (response.ok && result?.success && result?.data) {
          const propertyData = result.data as PropertyData
          const age = parsedResults.age || 70 // Default to 70 if not set
          const calc = calculateReverseMortgage(propertyData, age)
          setCalculation(calc)
          setLookupStatus('success')
          
          // Track successful lookup
          trackGA4Event('rm_results_property_found', {
            property_value: calc.propertyValue,
            equity_available: calc.equityAvailable,
            net_proceeds: calc.netProceeds,
            state: state
          })
          
          console.log('✅ Property data fetched successfully:', calc)
        } else {
          console.log('❌ Property lookup failed:', result?.error || 'Unknown error')
          setLookupStatus('failed')
          
          // Track failed lookup
          trackGA4Event('rm_results_property_failed', {
            error: result?.error || 'unknown',
            state: state
          })
        }
      } catch (error) {
        console.error('Property lookup error:', error)
        setLookupStatus('failed')
        
        trackGA4Event('rm_results_property_error', {
          error: 'exception'
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchPropertyData()
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F5F5F0] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#36596A] mx-auto mb-4" />
          <p className="text-lg text-gray-600">Calculating your equity estimate...</p>
        </div>
      </div>
    )
  }

  if (!results) {
    return (
      <div className="min-h-screen bg-[#F5F5F0] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">No Results Found</h1>
          <p className="text-gray-600 mb-6">Please complete the calculator to view your results.</p>
          <button
            onClick={() => router.push('/reverse-mortgage-calculator')}
            className="bg-[#36596A] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#2a4a5a] transition-colors"
          >
            Start Calculator
          </button>
        </div>
      </div>
    )
  }

  // Generic thank you if property lookup failed
  if (lookupStatus === 'failed') {
    return (
      <div className="min-h-screen bg-[#F5F5F0]">
        <section className="py-10 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg border border-[#E5E7EB] p-6 sm:p-8">
              <div className="text-center space-y-4">
                <div className="mx-auto h-14 w-14 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h1 className="text-3xl sm:text-4xl font-serif font-semibold text-[#36596A]">
                  Thank You, {results.contact?.firstName || 'Friend'}!
                </h1>
                <p className="text-gray-600">
                  Your information has been received. A licensed reverse mortgage specialist will contact you shortly to discuss your options.
                </p>
              </div>

              {/* Agent Image Section */}
              <div className="mt-8 bg-slate-50 rounded-2xl p-6">
                <div className="max-w-md mx-auto text-center">
                  <img
                    src="/images/team/agent-advisor.png"
                    alt="Licensed Reverse Mortgage Specialist"
                    className="w-full max-w-sm mx-auto mb-4 object-cover rounded-lg"
                  />
                  <h3 className="text-xl font-semibold text-slate-800 mb-2">
                    Your Licensed Reverse Mortgage Specialist
                  </h3>
                  <p className="text-slate-600 text-sm">
                    A licensed HECM specialist will review your property details and provide personalized guidance on your reverse mortgage options.
                  </p>
                </div>
              </div>

              <div className="mt-8 space-y-4 text-sm text-gray-700">
                <h2 className="text-lg font-semibold text-gray-900">What happens next</h2>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <span>
                      <strong>Within 24 hours:</strong> A licensed reverse mortgage specialist will call you to discuss your HECM options and answer all your questions.
                    </span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <span>
                      <strong>Custom Analysis:</strong> Your specialist will verify your property details, review FHA eligibility, and provide a personalized breakdown of available proceeds.
                    </span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <span>
                      <strong>Your Decision:</strong> No pressure - take time to review your options and decide what's right for you.
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-8 rounded-xl border border-gray-200 bg-gray-50 p-5 text-sm text-gray-700">
                <p>
                  Questions? Call us at{' '}
                  <a href="tel:+18585046544" className="font-semibold text-[#36596A]">
                    (858) 504-6544
                  </a>
                  .
                </p>
              </div>
            </div>
          </div>
        </section>

        <FAQ funnelType="reverse-mortgage-calculator" />
      </div>
    )
  }

  // Success - show equity estimate
  const estimatedLow = calculation ? Math.floor(calculation.netProceeds * 0.85) : 0
  const estimatedHigh = calculation?.netProceeds || 0
  
  // Check if mortgage exceeds available proceeds (underwater for RM purposes)
  const isUnderwaterForRM = calculation && calculation.existingMortgage > calculation.grossProceeds

  return (
    <div className="min-h-screen bg-[#F5F5F0]">
      <section className="py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg border border-[#E5E7EB] p-6 sm:p-8">
            <div className="text-center space-y-4">
              <div className="mx-auto h-14 w-14 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-serif font-semibold text-[#36596A]">
                {isUnderwaterForRM 
                  ? `Thank You, ${results.contact?.firstName || 'Friend'}!`
                  : `Great News, ${results.contact?.firstName || 'Friend'}!`
                }
              </h1>
              <p className="text-gray-600">
                {isUnderwaterForRM
                  ? 'We found your property details. A specialist will review your options with you.'
                  : 'Based on your property, here\'s your estimated reverse mortgage potential.'
                }
              </p>
            </div>

            {isUnderwaterForRM ? (
              // Show explanation when mortgage exceeds available proceeds
              <div className="mt-8 rounded-xl border border-amber-500 bg-amber-50 p-6">
                <h3 className="text-lg font-semibold text-amber-800 mb-3">
                  Your Current Mortgage May Need to Be Reduced First
                </h3>
                <div className="text-sm text-amber-700 space-y-2">
                  <p>
                    <strong>Property Value:</strong> ${calculation?.propertyValue.toLocaleString()}
                  </p>
                  <p>
                    <strong>Existing Mortgage:</strong> ${calculation?.existingMortgage.toLocaleString()}
                  </p>
                  <p className="mt-3">
                    Based on your current mortgage balance, you may need to pay down your existing loan before accessing reverse mortgage proceeds. However, there may be other options available.
                  </p>
                  <p className="mt-2 font-medium">
                    A licensed specialist will review your situation and discuss all available programs, including HECM for Purchase and refinancing options.
                  </p>
                </div>
              </div>
            ) : (
              // Show equity estimate when proceeds are available
              <div className="mt-8 rounded-xl border border-[#36596A] bg-[#36596A] text-white p-6 text-center">
                <p className="text-sm uppercase tracking-wide text-[#E4CDA1]">Estimated Tax-Free Equity</p>
                <p className="mt-2 text-3xl font-bold">
                  ${estimatedLow.toLocaleString()} - ${estimatedHigh.toLocaleString()}
                </p>
                {calculation && (
                  <p className="mt-2 text-sm text-white/80">
                    Based on property value of ${calculation.propertyValue.toLocaleString()}
                    {calculation.existingMortgage > 0 && ` (existing mortgage: $${calculation.existingMortgage.toLocaleString()})`}
                  </p>
                )}
                <p className="mt-2 text-sm text-white/80">
                  Final numbers will be confirmed by a licensed reverse mortgage specialist.
                </p>
              </div>
            )}

            {/* Agent Image Section */}
            <div className="mt-8 bg-slate-50 rounded-2xl p-6">
              <div className="max-w-md mx-auto text-center">
                <img
                  src="/images/team/agent-advisor.png"
                  alt="Licensed Reverse Mortgage Specialist"
                  className="w-full max-w-sm mx-auto mb-4 object-cover rounded-lg"
                />
                <h3 className="text-xl font-semibold text-slate-800 mb-2">
                  Your Licensed Reverse Mortgage Specialist
                </h3>
                <p className="text-slate-600 text-sm">
                  A licensed HECM specialist will review your property details and provide personalized guidance on your reverse mortgage options.
                </p>
              </div>
            </div>

            <div className="mt-8 space-y-4 text-sm text-gray-700">
              <h2 className="text-lg font-semibold text-gray-900">What happens next</h2>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <span>
                    <strong>Within 24 hours:</strong> A licensed reverse mortgage specialist will call you to discuss your HECM options and answer all your questions.
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <span>
                    <strong>Custom Analysis:</strong> Your specialist will verify your property details, review FHA eligibility, and provide a personalized breakdown of available proceeds.
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <span>
                    <strong>Your Decision:</strong> No pressure - take time to review your options and decide what's right for you.
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-8 rounded-xl border border-gray-200 bg-gray-50 p-5 text-sm text-gray-700">
              <p>
                Questions? Call us at{' '}
                <a href="tel:+18585046544" className="font-semibold text-[#36596A]">
                  (858) 504-6544
                </a>
                .
              </p>
            </div>

            <div className="mt-8 text-center">
              <button
                onClick={() => router.push('/reverse-mortgage-calculator')}
                className="text-sm font-semibold text-[#36596A] hover:underline"
              >
                Run another estimate
              </button>
            </div>
          </div>
        </div>
      </section>

      <FAQ funnelType="reverse-mortgage-calculator" />
    </div>
  )
}
