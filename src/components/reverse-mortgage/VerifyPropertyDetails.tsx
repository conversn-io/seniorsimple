'use client'

import { useMemo, useState } from 'react'
import { CheckCircle, AlertTriangle, Home } from 'lucide-react'

export const MAX_QUALIFYING_LTV = 0.35

interface VerifyPropertyDetailsProps {
  initialPropertyValue?: number
  initialMortgageBalance?: number
  lookupFailed?: boolean
  onConfirm: (values: { propertyValue: number; mortgageBalance: number; ltv: number }) => void
  isSubmitting?: boolean
  /**
   * 'page' (default): renders as a full standalone page (min-h-screen + bg + card).
   * 'embedded': renders just the inner content, with no page background or card wrapper —
   * for use inside an existing card (e.g. the quiz step container).
   */
  chrome?: 'page' | 'embedded'
}

const PROPERTY_MIN = 100_000
const PROPERTY_MAX = 2_000_000
const PROPERTY_STEP = 5_000
const MORTGAGE_STEP = 1_000

const formatCurrency = (n: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n)

const parseCurrency = (raw: string) => Number(raw.replace(/[^0-9]/g, '')) || 0

export function VerifyPropertyDetails({
  initialPropertyValue,
  initialMortgageBalance,
  lookupFailed = false,
  onConfirm,
  isSubmitting = false,
  chrome = 'page',
}: VerifyPropertyDetailsProps) {
  const [propertyValue, setPropertyValue] = useState<number>(
    Math.min(Math.max(initialPropertyValue || 400_000, PROPERTY_MIN), PROPERTY_MAX)
  )
  const [mortgageBalance, setMortgageBalance] = useState<number>(
    Math.max(0, Math.min(initialMortgageBalance ?? 0, propertyValue))
  )

  const ltv = useMemo(
    () => (propertyValue > 0 ? mortgageBalance / propertyValue : 0),
    [propertyValue, mortgageBalance]
  )
  const ltvPct = Math.round(ltv * 100)
  const qualifies = ltv <= MAX_QUALIFYING_LTV

  const handlePropertyChange = (next: number) => {
    const clamped = Math.min(Math.max(next, PROPERTY_MIN), PROPERTY_MAX)
    setPropertyValue(clamped)
    if (mortgageBalance > clamped) setMortgageBalance(clamped)
  }

  const handleMortgageChange = (next: number) => {
    setMortgageBalance(Math.max(0, Math.min(next, propertyValue)))
  }

  const propertyTrackPct = ((propertyValue - PROPERTY_MIN) / (PROPERTY_MAX - PROPERTY_MIN)) * 100
  const mortgageTrackPct = propertyValue > 0 ? (mortgageBalance / propertyValue) * 100 : 0

  const inner = (
    <>
            <div className="text-center space-y-3">
              <div className="mx-auto h-14 w-14 rounded-full bg-[#36596A]/10 flex items-center justify-center">
                <Home className="h-7 w-7 text-[#36596A]" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-serif font-semibold text-[#36596A]">
                {lookupFailed ? 'Tell us about your home' : "Let's make sure we have your numbers right"}
              </h1>
              <p className="text-gray-600">
                {lookupFailed
                  ? "We couldn't pull your property details automatically. Enter them below to see your estimate."
                  : 'We pulled these from public records — they’re often a year or two out of date, especially if you’ve refinanced or paid down your mortgage. Please confirm or correct.'}
              </p>
            </div>

            <div className="mt-8 space-y-8">
              {/* Property value */}
              <div>
                <div className="flex items-baseline justify-between mb-2">
                  <label className="text-sm font-semibold text-gray-700">Estimated home value</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={formatCurrency(propertyValue)}
                    onChange={(e) => handlePropertyChange(parseCurrency(e.target.value))}
                    className="w-40 text-right text-lg font-semibold text-[#36596A] border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#36596A]/40"
                    aria-label="Estimated home value"
                  />
                </div>
                <input
                  type="range"
                  min={PROPERTY_MIN}
                  max={PROPERTY_MAX}
                  step={PROPERTY_STEP}
                  value={propertyValue}
                  onChange={(e) => handlePropertyChange(Number(e.target.value))}
                  className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #36596A 0%, #36596A ${propertyTrackPct}%, #e5e7eb ${propertyTrackPct}%, #e5e7eb 100%)`,
                  }}
                />
                <div className="flex justify-between mt-1 text-xs text-gray-500">
                  <span>$100K</span>
                  <span>$2M+</span>
                </div>
              </div>

              {/* Mortgage balance */}
              <div>
                <div className="flex items-baseline justify-between mb-2">
                  <label className="text-sm font-semibold text-gray-700">
                    Current mortgage balance{' '}
                    <span className="font-normal text-gray-500">(enter 0 if paid off)</span>
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={formatCurrency(mortgageBalance)}
                    onChange={(e) => handleMortgageChange(parseCurrency(e.target.value))}
                    className="w-40 text-right text-lg font-semibold text-[#36596A] border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#36596A]/40"
                    aria-label="Current mortgage balance"
                  />
                </div>
                <input
                  type="range"
                  min={0}
                  max={propertyValue}
                  step={MORTGAGE_STEP}
                  value={mortgageBalance}
                  onChange={(e) => handleMortgageChange(Number(e.target.value))}
                  className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #36596A 0%, #36596A ${mortgageTrackPct}%, #e5e7eb ${mortgageTrackPct}%, #e5e7eb 100%)`,
                  }}
                />
                <div className="flex justify-between mt-1 text-xs text-gray-500">
                  <span>$0</span>
                  <span>{formatCurrency(propertyValue)}</span>
                </div>
              </div>

              {/* LTV readout + qualify indicator (no proceeds dollars by design) */}
              <div
                className={`rounded-xl border-2 p-5 transition-colors ${
                  qualifies ? 'border-green-300 bg-green-50' : 'border-amber-300 bg-amber-50'
                }`}
                aria-live="polite"
              >
                <div className="flex items-center gap-3">
                  {qualifies ? (
                    <CheckCircle className="h-6 w-6 text-green-600 shrink-0" />
                  ) : (
                    <AlertTriangle className="h-6 w-6 text-amber-600 shrink-0" />
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-700">
                      Your current loan-to-value:{' '}
                      <span className={`text-base ${qualifies ? 'text-green-700' : 'text-amber-700'}`}>
                        {ltvPct}%
                      </span>
                    </p>
                    <p className={`text-sm mt-0.5 ${qualifies ? 'text-green-700' : 'text-amber-700'}`}>
                      {qualifies
                        ? 'Looks like a fit — a specialist can confirm your exact proceeds.'
                        : 'Your equity is lower than typical for this program — a specialist will explore the right options for your situation.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => onConfirm({ propertyValue, mortgageBalance, ltv })}
              disabled={isSubmitting || propertyValue <= 0}
              className="mt-8 w-full bg-[#36596A] text-white py-3 px-6 rounded-lg font-semibold hover:bg-[#2a4a5a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Confirming...' : 'Confirm these numbers'}
            </button>

            <p className="mt-4 text-xs text-gray-500 text-center">
              Final numbers will be confirmed by a licensed reverse mortgage specialist.
            </p>
    </>
  )

  if (chrome === 'embedded') {
    return <div className="space-y-3">{inner}</div>
  }

  return (
    <div className="min-h-screen bg-[#F5F5F0]">
      <section className="py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg border border-[#E5E7EB] p-6 sm:p-8">
            {inner}
          </div>
        </div>
      </section>
    </div>
  )
}
