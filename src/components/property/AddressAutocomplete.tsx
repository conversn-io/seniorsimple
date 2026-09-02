/**
 * Google Places Address Autocomplete Component (Property Lookup)
 *
 * Uses PlaceAutocompleteElement from the Places API (New). The legacy
 * `google.maps.places.Autocomplete` widget this replaced has been closed to new customers
 * since 2025-03-01 and no longer gets bug fixes (WO-1013).
 */

'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { loadPlacesLibrary } from '@/lib/google-maps-loader'

export interface AddressComponents {
  formatted_address: string
  street: string
  city: string
  state: string
  zip: string
  place_id?: string
}

interface AddressAutocompleteProps {
  onAddressSelect: (address: AddressComponents) => void
  placeholder?: string
  className?: string
}

/** New Places components carry `longText`/`shortText` where the legacy API had long_name/short_name. */
interface NewAddressComponent {
  types: string[]
  longText?: string
  shortText?: string
}

const parseAddressComponents = (
  components: NewAddressComponent[],
  formattedAddress: string,
  placeId?: string
): AddressComponents => {
  let street = ''
  let city = ''
  let state = ''
  let zip = ''
  let zipSuffix = ''

  components.forEach((component) => {
    const types = component.types
    const long = component.longText || ''
    const short = component.shortText || ''

    if (types.includes('street_number')) {
      street = `${long} `
    }
    if (types.includes('route')) {
      street += long
    }
    if (types.includes('locality') || types.includes('postal_town')) {
      city = long
    }
    if (!city && types.includes('sublocality_level_1')) {
      city = long
    }
    if (!city && types.includes('administrative_area_level_2')) {
      city = long
    }
    if (types.includes('administrative_area_level_1')) {
      state = short
    }
    if (types.includes('postal_code')) {
      zip = long
    }
    if (types.includes('postal_code_suffix')) {
      zipSuffix = long
    }
  })

  return {
    formatted_address: formattedAddress,
    street: street.trim(),
    city,
    state,
    zip: zip && zipSuffix ? `${zip}-${zipSuffix}` : zip,
    place_id: placeId,
  }
}

export function AddressAutocomplete({
  onAddressSelect,
  placeholder = 'Enter property address',
  className = '',
}: AddressAutocompleteProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  // Manual entry fallback for when Google autocomplete fails (extensions, network,
  // unrecognized addresses, or component binding issues).
  const [manualMode, setManualMode] = useState(false)
  const [manualStreet, setManualStreet] = useState('')
  const [manualCity, setManualCity] = useState('')
  const [manualState, setManualState] = useState('')
  const [manualZip, setManualZip] = useState('')
  const [manualError, setManualError] = useState('')

  // Keep the latest callback reachable from the element listener without re-creating the
  // widget every time the parent re-renders.
  const onAddressSelectRef = useRef(onAddressSelect)
  useEffect(() => {
    onAddressSelectRef.current = onAddressSelect
  }, [onAddressSelect])

  const submitManual = () => {
    const street = manualStreet.trim()
    const city = manualCity.trim()
    const stateInput = manualState.trim().toUpperCase()
    const zip = manualZip.trim()
    if (!street || !city || !stateInput || !zip) {
      setManualError('Please fill in street, city, state, and ZIP.')
      return
    }
    if (!/^\d{5}(-\d{4})?$/.test(zip)) {
      setManualError('Please enter a valid 5-digit ZIP code.')
      return
    }
    if (stateInput.length !== 2) {
      setManualError('Please use a 2-letter state code (e.g. CA, TX).')
      return
    }
    setManualError('')
    const formatted = `${street}, ${city}, ${stateInput} ${zip}`
    onAddressSelect({
      formatted_address: formatted,
      street,
      city,
      state: stateInput,
      zip,
    })
  }

  // If Places can't be used at all, drop the user straight into manual entry rather than
  // leaving them staring at an input that will never suggest anything.
  const fallBackToManual = useCallback((reason: string, detail?: unknown) => {
    console.warn(`⚠️ Places autocomplete unavailable (${reason}) — falling back to manual entry`, detail)
    setManualMode(true)
  }, [])

  useEffect(() => {
    if (manualMode) return

    let cancelled = false
    let element: HTMLElement | null = null

    loadPlacesLibrary()
      .then((places: any) => {
        if (cancelled) return
        const container = containerRef.current
        if (!container) return
        if (!places?.PlaceAutocompleteElement) {
          fallBackToManual('PlaceAutocompleteElement missing from the places library')
          return
        }

        element = new places.PlaceAutocompleteElement({
          includedRegionCodes: ['us'],
          includedPrimaryTypes: ['street_address', 'subpremise', 'premise'],
        }) as HTMLElement

        // `placeholder` is a property on the element, not a constructor-only option.
        ;(element as any).placeholder = placeholder

        element.addEventListener('gmp-select', async (event: any) => {
          try {
            const place = event.placePrediction.toPlace()
            await place.fetchFields({ fields: ['formattedAddress', 'addressComponents'] })
            if (!place.formattedAddress || !place.addressComponents) return
            onAddressSelectRef.current(
              parseAddressComponents(place.addressComponents, place.formattedAddress, place.id)
            )
          } catch (error) {
            console.error('❌ Failed to resolve the selected place', error)
          }
        })

        // Fired when the Places request itself is rejected — a key without Places API (New)
        // enabled, a referrer restriction, or billing. Manual entry keeps the funnel alive.
        element.addEventListener('gmp-error', (event: any) => {
          fallBackToManual('gmp-error from the Places request', event)
        })

        container.appendChild(element)
      })
      .catch((error) => {
        if (cancelled) return
        fallBackToManual('places library failed to load', error)
      })

    return () => {
      cancelled = true
      element?.remove()
    }
  }, [manualMode, placeholder, fallBackToManual])

  if (manualMode) {
    return (
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Street address</label>
          <input
            type="text"
            value={manualStreet}
            onChange={(e) => setManualStreet(e.target.value)}
            placeholder="123 Main St"
            autoComplete="street-address"
            className="quiz-input w-full px-4 py-3 text-base border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-[#36596A]/20 focus:border-[#36596A] transition-all"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-1">
            <label className="block text-sm font-semibold text-gray-700 mb-1">City</label>
            <input
              type="text"
              value={manualCity}
              onChange={(e) => setManualCity(e.target.value)}
              autoComplete="address-level2"
              className="quiz-input w-full px-4 py-3 text-base border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-[#36596A]/20 focus:border-[#36596A] transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">State</label>
            <input
              type="text"
              value={manualState}
              onChange={(e) => setManualState(e.target.value.toUpperCase().slice(0, 2))}
              placeholder="CA"
              maxLength={2}
              autoComplete="address-level1"
              className="quiz-input w-full px-4 py-3 text-base border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-[#36596A]/20 focus:border-[#36596A] transition-all uppercase"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">ZIP</label>
            <input
              type="text"
              inputMode="numeric"
              value={manualZip}
              onChange={(e) => setManualZip(e.target.value.replace(/[^\d-]/g, '').slice(0, 10))}
              placeholder="92102"
              autoComplete="postal-code"
              className="quiz-input w-full px-4 py-3 text-base border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-[#36596A]/20 focus:border-[#36596A] transition-all"
            />
          </div>
        </div>
        {manualError && <p className="text-red-500 text-sm">{manualError}</p>}
        <button
          type="button"
          onClick={submitManual}
          className="w-full bg-[#36596A] text-white py-3 px-6 rounded-xl font-semibold hover:bg-[#2a4a5a] transition-colors"
        >
          Use this address
        </button>
        <div className="text-center">
          <button
            type="button"
            onClick={() => { setManualMode(false); setManualError('') }}
            className="text-sm font-medium text-gray-500 hover:underline"
          >
            ← Back to address search
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {/* The widget renders its own input inside a shadow root; `ss-place-autocomplete`
          carries the field chrome and strips the widget's own — see globals.css. */}
      <div ref={containerRef} className={`ss-place-autocomplete ${className}`} />
      <div className="text-center">
        <button
          type="button"
          onClick={() => setManualMode(true)}
          className="text-sm font-medium text-[#36596A] hover:underline"
        >
          Don&apos;t see your address? Enter manually
        </button>
      </div>
    </div>
  )
}
