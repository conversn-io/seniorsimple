'use client'

import { useState, useEffect } from 'react'
import { Phone, X } from 'lucide-react'
import { useScrollPosition } from '@/hooks/useScrollPosition'

interface InterstitialCTABannerProps {
  phoneNumber: string | null
  serviceName: string
  city?: string
  state?: string
  headline?: string
  subheadline?: string
  ctaText?: string
  variant?: 'urgent' | 'friendly' | 'professional'
  dismissible?: boolean
}

export default function InterstitialCTABanner({
  phoneNumber,
  serviceName,
  city,
  state,
  headline,
  subheadline,
  ctaText,
  variant = 'friendly',
  dismissible = true
}: InterstitialCTABannerProps) {
  const [isDismissed, setIsDismissed] = useState(false)
  const [hasShown, setHasShown] = useState(false)
  const { hasReachedThreshold } = useScrollPosition({ threshold: 0.5 })

  useEffect(() => {
    // Check localStorage for dismissal state
    const dismissedKey = `cta_dismissed_${serviceName}_${phoneNumber}`
    const dismissed = localStorage.getItem(dismissedKey) === 'true'
    setIsDismissed(dismissed)
  }, [serviceName, phoneNumber])

  useEffect(() => {
    if (hasReachedThreshold && !isDismissed && !hasShown) {
      setHasShown(true)
      // Track impression
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'interstitial_cta_shown', {
          scroll_depth: 0.5,
          variant,
          service_name: serviceName
        })
      }
    }
  }, [hasReachedThreshold, isDismissed, hasShown, variant, serviceName])

  const handleDismiss = () => {
    setIsDismissed(true)
    const dismissedKey = `cta_dismissed_${serviceName}_${phoneNumber}`
    localStorage.setItem(dismissedKey, 'true')
  }

  const formatPhoneNumber = (phone: string): string => {
    const digits = phone.replace(/\D/g, '')
    if (digits.length === 10) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
    }
    if (digits.length === 11 && digits[0] === '1') {
      return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`
    }
    return phone
  }

  // If no phone number, don't render
  if (!phoneNumber) {
    return null
  }

  const formattedPhone = formatPhoneNumber(phoneNumber)
  const telLink = `tel:${phoneNumber.replace(/\D/g, '')}`

  const handleClick = () => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'interstitial_cta_clicked', {
        variant,
        phone_number: phoneNumber,
        service_name: serviceName
      })
    }
  }

  const variantStyles = {
    urgent: {
      bg: 'bg-gray-100 border-gray-300',
      text: 'text-gray-900',
      button: 'bg-red-600 hover:bg-red-700 text-white',
      headline: 'text-gray-900'
    },
    friendly: {
      bg: 'bg-gray-100 border-gray-300',
      text: 'text-gray-900',
      button: 'bg-[#36596A] hover:bg-[#2a4a5a] text-white',
      headline: 'text-gray-900'
    },
    professional: {
      bg: 'bg-gray-100 border-gray-300',
      text: 'text-gray-900',
      button: 'bg-gray-900 hover:bg-gray-800 text-white',
      headline: 'text-gray-900'
    }
  }

  const style = variantStyles[variant]

  if (isDismissed || !hasReachedThreshold) {
    return null
  }

  return (
    <div
      className={`${style.bg} border-y-2 border-gray-300 my-12 transition-all duration-500 ease-in-out ${
        hasShown ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
    >
      <div className="max-w-4xl mx-auto px-6 py-8 relative">
        {dismissible && (
          <button
            onClick={handleDismiss}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Dismiss banner"
          >
            <X className="w-5 h-5" />
          </button>
        )}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex-1">
            <h3 className={`text-2xl font-bold mb-2 ${style.headline}`}>
              {headline || `Need ${serviceName}?`}
            </h3>
            <p className={`${style.text} text-lg font-medium mb-1`}>
              {subheadline || `Speak with a local expert${city && state ? ` in ${city}, ${state}` : ''} today`}
            </p>
            <p className={`${style.text} text-base`}>
              {ctaText || 'Get a free estimate and professional service'}
            </p>
          </div>
          <a
            href={telLink}
            onClick={handleClick}
            className={`${style.button} px-8 py-4 rounded-lg font-semibold text-lg inline-flex items-center gap-2 transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 min-h-[64px] min-w-[200px] justify-center shadow-lg`}
            aria-label={`Call ${serviceName} at ${formattedPhone}`}
          >
            <Phone className="w-6 h-6" aria-hidden="true" />
            <span>Call {formattedPhone}</span>
          </a>
        </div>
      </div>
    </div>
  )
}

