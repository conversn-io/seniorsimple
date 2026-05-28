'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle } from 'lucide-react'
import { useFunnelLayout } from '@/hooks/useFunnelFooter'
import { initializeTracking, trackPageView, trackGA4Event } from '@/lib/temp-tracking'
import { FAQ } from '@/components/quiz/FAQ'

/**
 * Alt thank-you for reverse-mortgage leads with LTV > 35%.
 *
 * Behavior:
 *   1. Delivers the lead to LynqFlux (same as /results — we monetize every lead
 *      via the per-delivered fee, regardless of LTV).
 *   2. Tags the lead with ghl_status.buyer1_dq so we can segment downstream
 *      (e.g. when we sign a refi buyer, this is the cohort to route to them).
 *   3. Shows a warm, neutral thank-you (no specific equity promise).
 *
 * The /results-alt vs /results split is for SEGMENTATION + UX, not delivery
 * gating. Both pages deliver to LynqFlux. Future refi-buyer / offer-wall
 * routing slots into this page.
 */

const STORAGE_KEY = 'reverse_mortgage_calculator'

interface StoredResults {
  sessionId?: string
  contact?: { firstName?: string; lastName?: string; email?: string; phone?: string }
  verifiedProperty?: {
    propertyValue: number
    mortgageBalance: number
    ltv: number
    batchDataUsed: boolean
  } | null
}

export default function ReverseMortgageResultsAltPage() {
  useFunnelLayout()
  const router = useRouter()
  const [firstName, setFirstName] = useState<string>('')
  const [tagged, setTagged] = useState<'pending' | 'done' | 'skipped'>('pending')

  useEffect(() => {
    initializeTracking()
    trackPageView(
      'Reverse Mortgage Results — Alt (Buyer 1 DQ)',
      '/reverse-mortgage-calculator/results-alt',
    )

    if (typeof window === 'undefined') return
    const stored = sessionStorage.getItem(STORAGE_KEY) || localStorage.getItem(STORAGE_KEY)
    if (!stored) {
      setTagged('skipped')
      return
    }

    let parsed: StoredResults
    try {
      parsed = JSON.parse(stored) as StoredResults
    } catch {
      setTagged('skipped')
      return
    }

    setFirstName(parsed.contact?.firstName || '')

    trackGA4Event('rm_alt_thank_you_shown', {
      ltv: parsed.verifiedProperty?.ltv,
      property_value: parsed.verifiedProperty?.propertyValue,
      mortgage_balance: parsed.verifiedProperty?.mortgageBalance,
      batch_data_used: parsed.verifiedProperty?.batchDataUsed,
      reason: 'ltv_above_35',
    })

    const vp = parsed.verifiedProperty
    if (parsed.sessionId && vp) {
      // 1) Deliver to LynqFlux — same as /results. We monetize every lead.
      //    LynqFlux makes its own accept/reject decision at their stage.
      fetch('/api/leads/deliver-lynqflux', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: parsed.sessionId,
          propertyValue: vp.propertyValue,
          mortgageBalance: vp.mortgageBalance,
          ltvRatio: vp.ltv,
          userVerified: !vp.batchDataUsed,
        }),
      })
        .then((r) => r.json())
        .then((r) => {
          if (r.success) {
            console.log('🟢 LynqFlux delivered (alt path):', r.leadId)
          } else {
            console.warn('🔴 LynqFlux delivery (alt path) failed:', r)
          }
        })
        .catch((err) => {
          console.error('LynqFlux delivery (alt path) error:', err)
        })

      // 2) Tag the lead as buyer1_dq for segmentation. This is independent of
      //    the LynqFlux delivery — both writes merge into ghl_status. Used by
      //    downstream queries to identify the high-LTV cohort for routing to
      //    a refi buyer / offer wall when that's wired up.
      fetch('/api/leads/mark-buyer1-dq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: parsed.sessionId,
          propertyValue: vp.propertyValue,
          mortgageBalance: vp.mortgageBalance,
          ltv: vp.ltv,
          batchDataUsed: vp.batchDataUsed,
        }),
      })
        .then((r) => r.json())
        .then((r) => {
          if (r.success) {
            console.log('🟠 Buyer-1 DQ tag recorded for lead', r.leadId)
            setTagged('done')
          } else {
            console.warn('🔴 Buyer-1 DQ tag failed:', r)
            setTagged('done') // still show the page; tag failure is non-blocking for UX
          }
        })
        .catch((err) => {
          console.error('Buyer-1 DQ tag error:', err)
          setTagged('done')
        })
    } else {
      setTagged('skipped')
    }
  }, [])

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
                Thank You, {firstName || 'Friend'}!
              </h1>
              <p className="text-gray-600">
                Your information has been received. A licensed specialist will review your
                situation and reach out to discuss the right options for you.
              </p>
            </div>

            <div className="mt-8 bg-slate-50 rounded-2xl p-6">
              <div className="max-w-md mx-auto text-center">
                <img
                  src="/images/team/agent-advisor.png"
                  alt="Licensed Specialist"
                  className="w-full max-w-sm mx-auto mb-4 object-cover rounded-lg"
                />
                <h3 className="text-xl font-semibold text-slate-800 mb-2">
                  Your Licensed Specialist
                </h3>
                <p className="text-slate-600 text-sm">
                  A licensed specialist will review your property details and provide
                  personalized guidance on the programs that fit your situation.
                </p>
              </div>
            </div>

            <div className="mt-8 space-y-4 text-sm text-gray-700">
              <h2 className="text-lg font-semibold text-gray-900">What happens next</h2>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <span>
                    <strong>Within 24 hours:</strong> A licensed specialist will call to discuss
                    your options and answer all your questions.
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <span>
                    <strong>Custom Review:</strong> Your specialist will review your property
                    details and walk through the programs that fit your situation.
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <span>
                    <strong>Your Decision:</strong> No pressure — take time to review your
                    options and decide what's right for you.
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
