'use client'

import { useEffect, useRef, useState } from 'react'
import { CheckCircle, AlertTriangle, Loader2 } from 'lucide-react'

interface AddressAutocompleteProps {
  value?: string
  onChange: (address: AddressData) => void
  onValidationChange?: (isValid: boolean) => void
  disabled?: boolean
  isLoading?: boolean
}

export interface AddressData {
  streetNumber: string
  street: string
  fullAddress: string
  city: string
  state: string
  stateAbbr: string
  zipCode: string
  country: string
  countryCode: string
  formatted: string
}

declare global {
  interface Window {
    google: any
    initGooglePlaces: () => void
  }
}

export const AddressAutocomplete = ({ 
  value, 
  onChange, 
  onValidationChange,
  disabled = false,
  isLoading = false 
}: AddressAutocompleteProps) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const autocompleteRef = useRef<any>(null)
  const [addressValue, setAddressValue] = useState(value || '')
  const [isValidating, setIsValidating] = useState(false)
  const [isValid, setIsValid] = useState(false)
  const [error, setError] = useState('')
  const [addressData, setAddressData] = useState<AddressData | null>(null)

  // Load Google Places API script
  useEffect(() => {
    const loadGooglePlaces = () => {
      if (window.google && window.google.maps && window.google.maps.places) {
        initializeAutocomplete()
        return
      }

      // Check if script is already loading
      if (document.querySelector('script[src*="maps.googleapis.com"]')) {
        // Wait for it to load
        const checkInterval = setInterval(() => {
          if (window.google && window.google.maps && window.google.maps.places) {
            clearInterval(checkInterval)
            initializeAutocomplete()
          }
        }, 100)
        return () => clearInterval(checkInterval)
      }

      // Load the script
      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY || ''}&libraries=places`
      script.async = true
      script.defer = true
      script.onload = () => {
        initializeAutocomplete()
      }
      script.onerror = () => {
        const errorMsg = 'Failed to load Google Places API. Please check your API key and network connection.'
        console.error('❌ Google Places API Script Load Error:', {
          error: errorMsg,
          apiKey: process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY ? 'Present' : 'Missing',
          timestamp: new Date().toISOString()
        })
        setError(errorMsg)
        setIsValidating(false)
        onValidationChange?.(false)
      }
      document.head.appendChild(script)
    }

    const initializeAutocomplete = () => {
      if (!inputRef.current || !window.google?.maps?.places) {
        const errorMsg = 'Google Places API not available. Please refresh the page.'
        console.error('❌ Google Places API Initialization Error:', {
          error: errorMsg,
          hasGoogle: !!window.google,
          hasMaps: !!window.google?.maps,
          hasPlaces: !!window.google?.maps?.places,
          timestamp: new Date().toISOString()
        })
        setError(errorMsg)
        setIsValidating(false)
        onValidationChange?.(false)
        return
      }

      try {
        const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
          types: ['address'],
          componentRestrictions: { country: ['us', 'ca'] }, // Support both US and Canada
          fields: ['address_components', 'formatted_address']
        })

        autocompleteRef.current = autocomplete

        autocomplete.addListener('place_changed', () => {
          try {
            const place = autocomplete.getPlace()
            if (!place.address_components) {
              const errorMsg = 'Please select a valid address from the suggestions'
              console.warn('⚠️ Google Places API - Invalid place selected:', {
                place: place,
                formatted_address: place.formatted_address,
                timestamp: new Date().toISOString()
              })
              setError(errorMsg)
              setIsValid(false)
              onValidationChange?.(false)
              return
            }

        setIsValidating(true)
        setError('')

        // Parse address components
        const addressComponents: any = {}
        place.address_components.forEach((component: any) => {
          const types = component.types
          if (types.includes('street_number')) {
            addressComponents.streetNumber = component.long_name
          }
          if (types.includes('route')) {
            addressComponents.route = component.short_name
          }
          if (types.includes('locality')) {
            addressComponents.city = component.long_name
          }
          if (types.includes('administrative_area_level_1')) {
            addressComponents.stateAbbr = component.short_name
            addressComponents.state = component.long_name
          }
          if (types.includes('postal_code')) {
            // Handle both US ZIP codes and Canadian postal codes
            addressComponents.zipCode = component.long_name
          }
          if (types.includes('country')) {
            addressComponents.countryCode = component.short_name // 'US' or 'CA'
            addressComponents.country = component.long_name // 'United States' or 'Canada'
          }
        })

        const address: AddressData = {
          streetNumber: addressComponents.streetNumber || '',
          street: addressComponents.route || '',
          fullAddress: place.formatted_address || addressValue,
          city: addressComponents.city || '',
          state: addressComponents.state || '',
          stateAbbr: addressComponents.stateAbbr || '',
          zipCode: addressComponents.zipCode || '',
          country: addressComponents.country || '',
          countryCode: addressComponents.countryCode || 'US', // Default to US if not found
          formatted: place.formatted_address || addressValue
        }

            setAddressData(address)
            setAddressValue(address.formatted)
            setIsValid(true)
            setIsValidating(false)
            onValidationChange?.(true)
            onChange(address)
          } catch (error: any) {
            const errorMsg = 'Error processing address. Please try again.'
            console.error('❌ Google Places API - Address Processing Error:', {
              error: error?.message || String(error),
              stack: error?.stack,
              timestamp: new Date().toISOString()
            })
            setError(errorMsg)
            setIsValid(false)
            setIsValidating(false)
            onValidationChange?.(false)
          }
        })
      } catch (error: any) {
        const errorMsg = 'Failed to initialize address autocomplete. Please refresh the page.'
        console.error('❌ Google Places API - Autocomplete Creation Error:', {
          error: error?.message || String(error),
          stack: error?.stack,
          timestamp: new Date().toISOString()
        })
        setError(errorMsg)
        setIsValidating(false)
        onValidationChange?.(false)
      }
    }

    loadGooglePlaces()

    return () => {
      if (autocompleteRef.current) {
        window.google?.maps?.event?.clearInstanceListeners?.(autocompleteRef.current)
      }
    }
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setAddressValue(newValue)
    
    if (newValue.length === 0) {
      setIsValid(false)
      setError('')
      onValidationChange?.(false)
      setAddressData(null)
    } else if (newValue.length > 0 && !isValid) {
      // User is typing but hasn't selected from autocomplete yet
      setError('Please select an address from the suggestions')
    }
  }

  return (
    <div className="space-y-2">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={addressValue}
          onChange={handleInputChange}
          className={`
            quiz-input w-full px-6 py-4 text-lg border-2 rounded-xl focus:ring-4 focus:ring-[#36596A]/20 focus:border-[#36596A] transition-all
            ${error ? 'border-red-500 bg-red-50' : isValid ? 'border-green-500 bg-green-50' : 'border-gray-300'}
            ${disabled || isLoading ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          placeholder="Start typing your address..."
          required
          disabled={disabled || isLoading}
          style={{ minHeight: '56px' }}
          autoComplete="street-address"
        />
        {isValidating && (
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
            <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
          </div>
        )}
        {!isValidating && isValid && addressData && (
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
            <CheckCircle className="w-6 h-6 text-green-500" />
          </div>
        )}
        {!isValidating && error && addressValue && (
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
          </div>
        )}
      </div>

      {error && (
        <p className="text-red-500 text-sm mt-2">{error}</p>
      )}

      {isValid && addressData && (
        <div className="mt-3 p-4 bg-green-50 border-2 border-green-200 rounded-xl">
          <p className="text-green-800 text-sm font-medium">
            ✓ Address verified: {addressData.city}, {addressData.stateAbbr} {addressData.zipCode}
            {addressData.countryCode === 'CA' && (
              <span className="ml-2 text-xs">({addressData.country})</span>
            )}
          </p>
        </div>
      )}

      {addressValue && !isValid && !error && (
        <p className="text-sm text-gray-500 mt-2">
          Please select an address from the dropdown suggestions
        </p>
      )}
    </div>
  )
}


