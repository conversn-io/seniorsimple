'use client'

import { useEffect, useState } from 'react'
import { Loader2, Home } from 'lucide-react'
import { VerifyPropertyDetails } from './VerifyPropertyDetails'

interface PropertyData {
  property_value: number
  mortgage_balance: number
  equity_available: number
  ltv_ratio?: number
}

interface AddressInput {
  street: string
  city: string
  state: string
  zip: string
}

interface PropertyVerificationStepProps {
  address: AddressInput
  onConfirm: (values: {
    propertyValue: number
    mortgageBalance: number
    ltv: number
    /** Original BatchData LTV before any user adjustment — used for defensive
     * max(batchData, userVerified) in downstream gating (Meta CAPI, etc.).
     * undefined when BatchData lookup failed. */
    batchDataLtv?: number
    batchDataUsed: boolean
  }) => void
  isSubmitting?: boolean
  onLookupComplete?: (info: { success: boolean; ms: number; ltv?: number }) => void
}

// Hold the spinner at least this long so it feels like a real lookup, not a flash.
const MIN_THINKING_MS = 1500

export function PropertyVerificationStep({
  address,
  onConfirm,
  isSubmitting,
  onLookupComplete,
}: PropertyVerificationStepProps) {
  const [phase, setPhase] = useState<'thinking' | 'verify'>('thinking')
  const [property, setProperty] = useState<PropertyData | undefined>(undefined)
  const [lookupFailed, setLookupFailed] = useState(false)
  // The original BatchData LTV (before any user adjustment) — captured here so
  // we can pass it to onConfirm for downstream defensive gating decisions.
  const [batchDataLtv, setBatchDataLtv] = useState<number | undefined>(undefined)

  useEffect(() => {
    let cancelled = false
    let timeoutId: ReturnType<typeof setTimeout> | undefined
    const startedAt = Date.now()

    const run = async () => {
      let next: { property?: PropertyData; lookupFailed: boolean; ltv?: number } = {
        lookupFailed: true,
      }

      try {
        const response = await fetch('/api/batchdata/lookup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          // BatchData API expects { address, city, state, zip } — map from our AddressInput shape.
          body: JSON.stringify({
            address: address.street,
            city: address.city,
            state: address.state,
            zip: address.zip,
          }),
        })
        const json = await response.json()
        if (response.ok && json?.success && json?.data) {
          const data = json.data as PropertyData
          const ltv =
            typeof data.ltv_ratio === 'number'
              ? data.ltv_ratio
              : data.property_value > 0
                ? data.mortgage_balance / data.property_value
                : undefined
          next = { property: data, lookupFailed: false, ltv }
        }
      } catch {
        // keep lookupFailed=true
      }

      const elapsed = Date.now() - startedAt
      const remaining = Math.max(0, MIN_THINKING_MS - elapsed)

      timeoutId = setTimeout(() => {
        if (cancelled) return
        setProperty(next.property)
        setBatchDataLtv(next.ltv)
        setLookupFailed(next.lookupFailed)
        setPhase('verify')
        onLookupComplete?.({
          success: !next.lookupFailed,
          ms: Date.now() - startedAt,
          ltv: next.ltv,
        })
      }, remaining)
    }

    run()
    return () => {
      cancelled = true
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [address.street, address.city, address.state, address.zip, onLookupComplete])

  if (phase === 'thinking') {
    return (
      <div className="py-8 text-center">
        <div className="mx-auto h-14 w-14 rounded-full bg-[#36596A]/10 flex items-center justify-center mb-5">
          <Home className="h-7 w-7 text-[#36596A]" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-serif font-semibold text-[#36596A] mb-2">
          Looking up your property…
        </h2>
        <p className="text-gray-600">
          We're pulling public records on your home so you don't have to type everything in.
        </p>
        <div className="mt-6 flex items-center justify-center gap-2 text-[#36596A]">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm">This usually takes a second or two…</span>
        </div>
      </div>
    )
  }

  return (
    <VerifyPropertyDetails
      chrome="embedded"
      initialPropertyValue={property?.property_value}
      initialMortgageBalance={property?.mortgage_balance}
      lookupFailed={lookupFailed}
      onConfirm={(values) =>
        onConfirm({ ...values, batchDataUsed: !lookupFailed, batchDataLtv })
      }
      isSubmitting={isSubmitting}
    />
  )
}
