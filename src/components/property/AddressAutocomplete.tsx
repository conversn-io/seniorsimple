/**
 * Google Places Address Autocomplete Component (Property Lookup)
 */

'use client'

import { useEffect, useRef, useState } from 'react'

declare global {
  interface Window {
    google: any
  }
}

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

export function AddressAutocomplete({
  onAddressSelect,
  placeholder = 'Enter property address',
  className = '',
}: AddressAutocompleteProps) {
  const [address, setAddress] = useState('')
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  // Manual entry fallback for when Google autocomplete fails (extensions, network,
  // unrecognized addresses, or component binding issues).
  const [manualMode, setManualMode] = useState(false)
  const [manualStreet, setManualStreet] = useState('')
  const [manualCity, setManualCity] = useState('')
  const [manualState, setManualState] = useState('')
  const [manualZip, setManualZip] = useState('')
  const [manualError, setManualError] = useState('')

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

  // Load Google Maps API
  useEffect(() => {
    const apiKey =
      process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
      process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY
    if (!apiKey) {
      console.warn('⚠️ Google Maps API key not configured')
      return
    }

    if (window.google?.maps?.places) {
      setIsGoogleLoaded(true)
      return
    }

    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]')
    if (existingScript) {
      existingScript.addEventListener('load', () => setIsGoogleLoaded(true))
      return
    }

    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`
    script.async = true
    script.defer = true
    script.onload = () => setIsGoogleLoaded(true)
    document.head.appendChild(script)
  }, [])

  // Initialize autocomplete
  useEffect(() => {
    if (isGoogleLoaded && inputRef.current && window.google) {
      const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
        types: ['address'],
        componentRestrictions: { country: 'us' },
      })

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace()

        if (place.formatted_address && place.address_components) {
          let street = ''
          let city = ''
          let state = ''
          let zip = ''
          let zipSuffix = ''

          place.address_components.forEach((component: any) => {
            const types = component.types
            if (types.includes('street_number')) {
              street = `${component.long_name} `
            }
            if (types.includes('route')) {
              street += component.long_name
            }
            if (types.includes('locality') || types.includes('postal_town')) {
              city = component.long_name
            }
            if (!city && types.includes('sublocality_level_1')) {
              city = component.long_name
            }
            if (!city && types.includes('administrative_area_level_2')) {
              city = component.long_name
            }
            if (types.includes('administrative_area_level_1')) {
              state = component.short_name
            }
            if (types.includes('postal_code')) {
              zip = component.long_name
            }
            if (types.includes('postal_code_suffix')) {
              zipSuffix = component.long_name
            }
          })

          if (zip && zipSuffix) {
            zip = `${zip}-${zipSuffix}`
          }

          const parsedAddress: AddressComponents = {
            formatted_address: place.formatted_address,
            street: street.trim(),
            city,
            state,
            zip,
            place_id: place.place_id,
          }

          setAddress(place.formatted_address)
          onAddressSelect(parsedAddress)
        }
      })
    }
  }, [isGoogleLoaded, onAddressSelect])

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
      <input
        ref={inputRef}
        type="text"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        placeholder={placeholder}
        className={className}
      />
      <div className="text-center">
        <button
          type="button"
          onClick={() => setManualMode(true)}
          className="text-sm font-medium text-[#36596A] hover:underline"
        >
          Don't see your address? Enter manually
        </button>
      </div>
    </div>
  )
}
