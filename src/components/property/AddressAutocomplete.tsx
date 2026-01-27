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

  return (
    <input
      ref={inputRef}
      type="text"
      value={address}
      onChange={(e) => setAddress(e.target.value)}
      placeholder={placeholder}
      className={className}
    />
  )
}
