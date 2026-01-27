'use client'

import { useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { AlertCircle } from 'lucide-react'
import { useFunnelLayout } from '@/hooks/useFunnelFooter'
import { initializeTracking, trackPageView } from '@/lib/temp-tracking'

function NotQualifiedContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const reason = searchParams?.get('reason') || null

  useEffect(() => {
    initializeTracking()
    trackPageView('Reverse Mortgage Not Qualified', '/reverse-mortgage-calculator/not-qualified')
  }, [])
  
  useFunnelLayout()

  const getMessage = () => {
    if (reason === 'age') {
      return {
        title: "We're sorry, but you don't currently qualify",
        message: "Reverse mortgages (HECMs) are federally insured loans only available to homeowners aged 62 and older. Once you turn 62, you may be eligible for a reverse mortgage.",
      }
    }
    if (reason === 'homeowner') {
      return {
        title: "We're sorry, but you don't currently qualify",
        message: "To qualify for a reverse mortgage, you must own your home and live in it as your primary residence. If you're planning to purchase a home, you may want to explore other financing options.",
      }
    }
    return {
      title: "We're sorry, but you don't currently qualify",
      message: "Based on your responses, you don't currently meet the eligibility requirements for a reverse mortgage.",
    }
  }

  const { title, message } = getMessage()

  return (
    <div className="min-h-screen bg-[#F5F5F0]">
      <section className="py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg border border-[#E5E7EB] p-6 sm:p-8">
            <div className="text-center space-y-4">
              <div className="mx-auto h-14 w-14 rounded-full bg-red-100 flex items-center justify-center">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-serif font-semibold text-[#36596A]">
                {title}
              </h1>
              <p className="text-gray-600 text-lg">
                {message}
              </p>
            </div>

            <div className="mt-8 text-center">
              <button
                onClick={() => router.push('/reverse-mortgage-calculator')}
                className="bg-[#36596A] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#2a4a5a] transition-colors"
              >
                Start Over
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default function NotQualifiedPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F5F5F0] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#36596A] mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <NotQualifiedContent />
    </Suspense>
  )
}
