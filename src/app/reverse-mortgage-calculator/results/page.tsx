'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle } from 'lucide-react'
import { useFunnelLayout } from '@/hooks/useFunnelFooter'
import { initializeTracking, trackPageView } from '@/lib/temp-tracking'
import { FAQ } from '@/components/quiz/FAQ'

const STORAGE_KEY = 'reverse_mortgage_calculator'

interface StoredResults {
  contact?: {
    firstName?: string
    lastName?: string
    email?: string
    phone?: string
  }
  calculation?: {
    netProceeds?: number
    propertyValue?: number
  }
  equityRange?: {
    low?: number
    high?: number
    propertyValue?: number
    age?: number
  }
  addressInfo?: {
    city?: string
    state?: string
  }
  submittedAt?: string
}

export default function ReverseMortgageResultsPage() {
  useFunnelLayout()
  const router = useRouter()
  const [results, setResults] = useState<StoredResults | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    initializeTracking()
    trackPageView('Reverse Mortgage Results', '/reverse-mortgage-calculator/results')

    if (typeof window === 'undefined') {
      setIsLoading(false)
      return
    }

    const stored = sessionStorage.getItem(STORAGE_KEY) || localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        setResults(JSON.parse(stored))
      } catch (error) {
        console.error('Failed to parse reverse mortgage results:', error)
      }
    }
    setIsLoading(false)
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F5F5F0] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#36596A] mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading your results...</p>
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
                You're all set!
              </h1>
              <p className="text-gray-600">
                {results.contact?.firstName
                  ? `Thanks, ${results.contact.firstName}. `
                  : ''}
                Your personalized HECM analysis is on the way.
              </p>
            </div>

            <div className="mt-8 rounded-xl border border-[#36596A] bg-[#36596A] text-white p-6 text-center">
              <p className="text-sm uppercase tracking-wide text-[#E4CDA1]">Estimated Tax-Free Equity</p>
              <p className="mt-2 text-3xl font-bold">
                {results.equityRange?.low && results.equityRange?.high
                  ? `$${results.equityRange.low.toLocaleString()} - $${results.equityRange.high.toLocaleString()}`
                  : results.calculation?.netProceeds
                  ? `$${results.calculation.netProceeds.toLocaleString()}`
                  : 'Calculating...'}
              </p>
              {results.equityRange?.propertyValue && results.equityRange?.age && (
                <p className="mt-2 text-sm text-white/80">
                  Estimated using age {results.equityRange.age} and your property value of ${results.equityRange.propertyValue.toLocaleString()}.
                </p>
              )}
              <p className="mt-2 text-sm text-white/80">
                Final numbers will be confirmed by a licensed reverse mortgage specialist.
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

      {/* FAQ Section */}
      <FAQ funnelType="reverse-mortgage-calculator" />
    </div>
  )
}
