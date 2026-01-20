'use client'

'use client'

import { useState, useEffect } from 'react'
import { Phone, X } from 'lucide-react'
import { useScrollPosition } from '@/hooks/useScrollPosition'
import QRCode from 'qrcode'

interface ScrollRevealedCallButtonProps {
  phoneNumber: string | null
  serviceName?: string
  city?: string
  state?: string
  variant?: 'default' | 'compact' | 'expanded'
  showQRCode?: boolean
}

export default function ScrollRevealedCallButton({
  phoneNumber,
  serviceName,
  city,
  state,
  variant = 'default',
  showQRCode = true
}: ScrollRevealedCallButtonProps) {
  const [isMobile, setIsMobile] = useState(false)
  const [showQRModal, setShowQRModal] = useState(false)
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null)
  const { hasReachedThreshold } = useScrollPosition({ threshold: 0.3 })

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Generate QR code when modal opens
  useEffect(() => {
    if (showQRModal && phoneNumber && typeof window !== 'undefined') {
      const telLink = `tel:${phoneNumber.replace(/\D/g, '')}`
      QRCode.toDataURL(telLink, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      })
        .then((url) => {
          setQrCodeDataUrl(url)
        })
        .catch((err) => {
          console.error('Error generating QR code:', err)
        })
    }
  }, [showQRModal, phoneNumber])

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
    // Analytics tracking
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'call_button_clicked', {
        phone_number: phoneNumber,
        service_name: serviceName,
        city,
        state,
        device_type: isMobile ? 'mobile' : 'desktop',
        button_type: 'scroll_revealed'
      })
    }

    // On desktop, show QR code modal
    if (!isMobile && showQRCode) {
      setShowQRModal(true)
    }
  }

  // Track when button is revealed
  useEffect(() => {
    if (hasReachedThreshold && typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'call_button_revealed', {
        scroll_depth: 0.3,
        device_type: isMobile ? 'mobile' : 'desktop',
        button_type: 'scroll_revealed'
      })
    }
  }, [hasReachedThreshold, isMobile])

  if (!hasReachedThreshold) {
    return null
  }

  const variantClasses = {
    default: 'px-6 py-4 text-base min-h-[64px]',
    compact: 'px-4 py-3 text-sm min-h-[56px]',
    expanded: 'px-8 py-5 text-lg min-h-[72px]'
  }

  return (
    <>
      {/* Sticky Bottom Button */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 bg-gray-100 border-t border-gray-300 shadow-lg transform transition-transform duration-300 ${
          hasReachedThreshold ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900 truncate">
                {serviceName || 'Get Help Now'}
              </p>
              <p className="text-xs text-gray-700 font-medium truncate">
                {city && state ? `${city}, ${state}` : 'Local Expert Available'}
              </p>
            </div>
            {isMobile ? (
              <a
                href={telLink}
                onClick={handleClick}
                className={`${variantClasses[variant]} inline-flex items-center justify-center gap-2 bg-[#36596A] text-white font-bold rounded-lg transition-all duration-300 hover:bg-[#2a4a5a] active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#36596A] focus:ring-offset-2 shadow-lg`}
                aria-label={`Call ${serviceName || 'service provider'} at ${formattedPhone}`}
              >
                <Phone className="w-5 h-5" aria-hidden="true" />
                <span className="font-semibold">Call {formattedPhone}</span>
              </a>
            ) : (
              <button
                onClick={handleClick}
                className={`${variantClasses[variant]} inline-flex items-center justify-center gap-2 bg-[#36596A] text-white font-bold rounded-lg transition-all duration-300 hover:bg-[#2a4a5a] active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#36596A] focus:ring-offset-2 shadow-lg`}
                aria-label={`Show QR code to call ${formattedPhone}`}
              >
                <Phone className="w-5 h-5" aria-hidden="true" />
                <span className="font-semibold">Call {formattedPhone}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* QR Code Modal (Desktop Only) */}
      {showQRModal && !isMobile && (
        <div
          className="fixed inset-0 z-[60] bg-black bg-opacity-50 flex items-center justify-center p-4"
          onClick={() => setShowQRModal(false)}
        >
          <div
            className="bg-white rounded-xl p-8 max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-semibold text-[#36596A]">
                Scan to Call
              </h3>
              <button
                onClick={() => setShowQRModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Close QR code modal"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex flex-col items-center gap-4">
              <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
                {qrCodeDataUrl ? (
                  <img 
                    src={qrCodeDataUrl} 
                    alt="QR Code" 
                    className="w-[200px] h-[200px]"
                  />
                ) : (
                  <div className="w-[200px] h-[200px] flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#36596A]"></div>
                  </div>
                )}
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-gray-800 mb-1">
                  {formattedPhone}
                </p>
                <p className="text-sm text-gray-600">
                  Scan with your phone to call
                </p>
                {serviceName && (
                  <p className="text-sm text-gray-500 mt-1">
                    {serviceName}
                    {city && state && ` in ${city}, ${state}`}
                  </p>
                )}
              </div>
              <a
                href={telLink}
                className="mt-2 px-6 py-3 bg-[#36596A] text-white font-semibold rounded-lg hover:bg-[#2a4a5a] transition-colors inline-flex items-center gap-2"
                onClick={() => {
                  if (typeof window !== 'undefined' && (window as any).gtag) {
                    (window as any).gtag('event', 'qr_code_scanned', {
                      phone_number: phoneNumber,
                      service_name: serviceName
                    })
                  }
                  setShowQRModal(false)
                }}
              >
                <Phone className="w-5 h-5" />
                Or Click to Call
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

