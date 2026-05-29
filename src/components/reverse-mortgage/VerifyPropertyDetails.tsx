'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { CheckCircle, AlertTriangle, Home } from 'lucide-react'
import { trackGA4Event } from '@/lib/temp-tracking'

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
  /**
   * Whether to render the pass/fail qualify indicator (green/amber color, icon,
   * "Looks like a fit" / "lower than typical" copy) alongside the LTV % readout.
   *
   * Gated behind the `ss_ltv_indicator_variant` split test in
   * variant-assignment.ts. Default `false` — caller must opt in. When `false`
   * the box still renders the LTV %, but in neutral styling with no qualify
   * signal.
   */
  showQualifyIndicator?: boolean
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
  showQualifyIndicator = false,
}: VerifyPropertyDetailsProps) {
  const initialPropertyClamped = Math.min(
    Math.max(initialPropertyValue || 400_000, PROPERTY_MIN),
    PROPERTY_MAX
  )
  const initialMortgageClamped = Math.max(
    0,
    Math.min(initialMortgageBalance ?? 0, initialPropertyClamped)
  )

  const [propertyValue, setPropertyValue] = useState<number>(initialPropertyClamped)
  const [mortgageBalance, setMortgageBalance] = useState<number>(initialMortgageClamped)

  // Raw text shown in each currency input. Decoupled from the controlled
  // number so the user can type freely without per-keystroke clamping — old
  // bug: typing "5" then "0" against a "$400,000" prefill snapped to
  // "$1,000,000" because parse-clamp-reformat ran on every keystroke and
  // appended the new digit onto the already-formatted text. Raw text is
  // committed (parsed + clamped) on blur/Enter, and slider drags also push
  // the formatted result back into the raw text so the two stay in sync.
  const [propertyValueRaw, setPropertyValueRaw] = useState<string>(
    formatCurrency(initialPropertyClamped)
  )
  const [mortgageBalanceRaw, setMortgageBalanceRaw] = useState<string>(
    formatCurrency(initialMortgageClamped)
  )

  const ltv = useMemo(
    () => (propertyValue > 0 ? mortgageBalance / propertyValue : 0),
    [propertyValue, mortgageBalance]
  )
  const ltvPct = Math.round(ltv * 100)
  const qualifies = ltv <= MAX_QUALIFYING_LTV

  // --- Telemetry -----------------------------------------------------------
  // Four events fire to GA4 + Supabase analytics_events (via
  // /api/analytics/track-event). Together they let us measure abandonment
  // at this step:
  //   viewed   - mount (denominator)
  //   engaged  - first interaction of any kind (slider or input)
  //   manual_entry - text input was actually typed into (per-field commit)
  //   confirmed - Confirm button clicked
  //
  // Funnel:    viewed → engaged → confirmed
  // Drop-offs: viewed-without-engaged (saw it, didn't touch);
  //            engaged-without-confirmed (started editing, bailed).
  // manual_entry is a per-field marker letting us compare typers vs slider-
  // only users — useful since this step ships with the previously-broken
  // currency input (PR #10).
  const mountedAtRef = useRef<number>(Date.now())
  const viewFiredRef = useRef(false)
  const engagedFiredRef = useRef(false)
  const propertyTypedRef = useRef(false)
  const mortgageTypedRef = useRef(false)
  const propertyFocusValueRef = useRef<number>(initialPropertyClamped)
  const mortgageFocusValueRef = useRef<number>(initialMortgageClamped)
  const manualEntryCountRef = useRef(0)
  const interactionCountRef = useRef(0)

  const fireVerifyEvent = (
    eventName: string,
    extra: Record<string, any> = {},
    opts: { keepalive?: boolean } = {}
  ) => {
    const basePayload = {
      home_value: propertyValue,
      mortgage_balance: mortgageBalance,
      ltv: Number(ltv.toFixed(4)),
      ltv_pct: ltvPct,
      lookup_failed: lookupFailed,
      elapsed_ms_since_view: Date.now() - mountedAtRef.current,
      manual_entry_count: manualEntryCountRef.current,
      interaction_count: interactionCountRef.current,
      source: 'verify-property',
      ...extra,
    }
    try {
      trackGA4Event(eventName, basePayload)
    } catch (err) {
      console.warn('[verify-property] GA4 track failed:', err)
    }
    if (typeof window === 'undefined') return
    const sessionId = window.sessionStorage?.getItem('session_id') || ''
    if (!sessionId) return
    try {
      fetch('/api/analytics/track-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        keepalive: opts.keepalive ?? false,
        body: JSON.stringify({
          event_name: eventName,
          properties: basePayload,
          session_id: sessionId,
          user_id: sessionId,
          page_url: window.location.href,
          referrer: typeof document !== 'undefined' ? document.referrer : '',
          user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
          event_category: 'quiz_step',
          event_label: 'verify_property',
        }),
      }).catch(err => console.warn('[verify-property] track failed:', err))
    } catch (err) {
      console.warn('[verify-property] track error:', err)
    }
  }

  // Fire 'viewed' once on mount. Captures the starting state so we can tell
  // whether the user saw a BatchData prefill or an empty form (lookupFailed).
  useEffect(() => {
    if (viewFiredRef.current) return
    viewFiredRef.current = true
    fireVerifyEvent('verify_property_viewed', {
      initial_home_value: initialPropertyClamped,
      initial_mortgage_balance: initialMortgageClamped,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const markEngaged = (control: 'slider' | 'input', field: 'home_value' | 'mortgage_balance') => {
    interactionCountRef.current += 1
    if (engagedFiredRef.current) return
    engagedFiredRef.current = true
    fireVerifyEvent('verify_property_engaged', { first_control: control, first_field: field })
  }
  // -------------------------------------------------------------------------

  // Commit a clamped property value to state AND mirror it into raw text.
  // Also cascades a max-cap on mortgage balance (mortgage can't exceed home value).
  const commitPropertyValue = (next: number) => {
    const clamped = Math.min(Math.max(next, PROPERTY_MIN), PROPERTY_MAX)
    setPropertyValue(clamped)
    setPropertyValueRaw(formatCurrency(clamped))
    if (mortgageBalance > clamped) {
      setMortgageBalance(clamped)
      setMortgageBalanceRaw(formatCurrency(clamped))
    }
  }

  const commitMortgageBalance = (next: number) => {
    const clamped = Math.max(0, Math.min(next, propertyValue))
    setMortgageBalance(clamped)
    setMortgageBalanceRaw(formatCurrency(clamped))
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
                    value={propertyValueRaw}
                    onChange={(e) => {
                      setPropertyValueRaw(e.target.value)
                      propertyTypedRef.current = true
                      markEngaged('input', 'home_value')
                    }}
                    onFocus={(e) => {
                      e.currentTarget.select()
                      propertyFocusValueRef.current = propertyValue
                      propertyTypedRef.current = false
                    }}
                    onBlur={() => {
                      const parsed = parseCurrency(propertyValueRaw)
                      const before = propertyFocusValueRef.current
                      commitPropertyValue(parsed)
                      if (propertyTypedRef.current) {
                        manualEntryCountRef.current += 1
                        const clamped = Math.min(Math.max(parsed, PROPERTY_MIN), PROPERTY_MAX)
                        fireVerifyEvent('verify_property_manual_entry', {
                          field: 'home_value',
                          before,
                          typed_raw: propertyValueRaw,
                          parsed,
                          after: clamped,
                          clamped_to_min: parsed < PROPERTY_MIN,
                          clamped_to_max: parsed > PROPERTY_MAX,
                        })
                        propertyTypedRef.current = false
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        e.currentTarget.blur()
                      }
                    }}
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
                  onChange={(e) => {
                    commitPropertyValue(Number(e.target.value))
                    markEngaged('slider', 'home_value')
                  }}
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
                    value={mortgageBalanceRaw}
                    onChange={(e) => {
                      setMortgageBalanceRaw(e.target.value)
                      mortgageTypedRef.current = true
                      markEngaged('input', 'mortgage_balance')
                    }}
                    onFocus={(e) => {
                      e.currentTarget.select()
                      mortgageFocusValueRef.current = mortgageBalance
                      mortgageTypedRef.current = false
                    }}
                    onBlur={() => {
                      const parsed = parseCurrency(mortgageBalanceRaw)
                      const before = mortgageFocusValueRef.current
                      commitMortgageBalance(parsed)
                      if (mortgageTypedRef.current) {
                        manualEntryCountRef.current += 1
                        const clamped = Math.max(0, Math.min(parsed, propertyValue))
                        fireVerifyEvent('verify_property_manual_entry', {
                          field: 'mortgage_balance',
                          before,
                          typed_raw: mortgageBalanceRaw,
                          parsed,
                          after: clamped,
                          clamped_to_min: parsed < 0,
                          clamped_to_max: parsed > propertyValue,
                        })
                        mortgageTypedRef.current = false
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        e.currentTarget.blur()
                      }
                    }}
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
                  onChange={(e) => {
                    commitMortgageBalance(Number(e.target.value))
                    markEngaged('slider', 'mortgage_balance')
                  }}
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

              {/* LTV readout. The pass/fail qualify styling (color + icon + copy) is
                * gated behind the ss_ltv_indicator_variant flag in variant-assignment.ts.
                * When showQualifyIndicator is false (default + current rollout) we keep
                * the LTV % readout but in neutral styling — no green/amber, no icon, no
                * qualifying sentence. */}
              <div
                className={`rounded-xl border-2 p-5 transition-colors ${
                  showQualifyIndicator
                    ? qualifies
                      ? 'border-green-300 bg-green-50'
                      : 'border-amber-300 bg-amber-50'
                    : 'border-gray-200 bg-gray-50'
                }`}
                aria-live="polite"
              >
                <div className="flex items-center gap-3">
                  {showQualifyIndicator &&
                    (qualifies ? (
                      <CheckCircle className="h-6 w-6 text-green-600 shrink-0" />
                    ) : (
                      <AlertTriangle className="h-6 w-6 text-amber-600 shrink-0" />
                    ))}
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-700">
                      Your current loan-to-value:{' '}
                      <span
                        className={`text-base ${
                          showQualifyIndicator
                            ? qualifies
                              ? 'text-green-700'
                              : 'text-amber-700'
                            : 'text-gray-800'
                        }`}
                      >
                        {ltvPct}%
                      </span>
                    </p>
                    {showQualifyIndicator && (
                      <p
                        className={`text-sm mt-0.5 ${
                          qualifies ? 'text-green-700' : 'text-amber-700'
                        }`}
                      >
                        {qualifies
                          ? 'Looks like a fit — a specialist can confirm your exact proceeds.'
                          : 'Your equity is lower than typical for this program — a specialist will explore the right options for your situation.'}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                // Fire confirmed BEFORE handing off — onConfirm navigates away in
                // both call sites. keepalive lets the fetch survive the unload.
                fireVerifyEvent(
                  'verify_property_confirmed',
                  {
                    qualifies, // based on MAX_QUALIFYING_LTV at submit time
                  },
                  { keepalive: true }
                )
                onConfirm({ propertyValue, mortgageBalance, ltv })
              }}
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
