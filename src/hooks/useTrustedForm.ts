'use client'

import { useEffect, useRef } from 'react'

/**
 * Hook to ensure TrustedForm script loads when a form is present
 * TrustedForm requires the form to exist BEFORE the script loads
 * 
 * Usage:
 *   const { isLoaded } = useTrustedForm({ enabled: step === 6 });
 */
export function useTrustedForm({ enabled = true }: { enabled?: boolean } = {}) {
  const scriptLoadedRef = useRef(false)

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return
    if (scriptLoadedRef.current) return

    // Check if TrustedForm script is already loaded
    const existingScript = document.querySelector('script[src*="trustedform.com"]')
    if (existingScript) {
      scriptLoadedRef.current = true
      console.log('🔐 TrustedForm script already loaded')
      return
    }

    // Wait for form field to exist (React might not have rendered it yet)
    let attempts = 0
    const maxAttempts = 10
    const checkInterval = setInterval(() => {
      attempts++
      
      // Check if form with TrustedForm field exists
      const formField = document.querySelector('input[name="xxTrustedFormCertUrl"]')
      
      if (formField) {
        clearInterval(checkInterval)
        
        // Load TrustedForm script
        const tf = document.createElement('script')
        tf.type = 'text/javascript'
        tf.async = true
        tf.src = ('https:' == document.location.protocol ? 'https' : 'http') +
          '://api.trustedform.com/trustedform.js?field=xxTrustedFormCertUrl&use_tagged_consent=true&l=' +
          new Date().getTime() + Math.random()
        
        tf.onload = () => {
          scriptLoadedRef.current = true
          console.log('✅ TrustedForm script loaded successfully')
        }
        
        tf.onerror = () => {
          console.error('❌ Failed to load TrustedForm script')
        }

        const s = document.getElementsByTagName('script')[0]
        if (s && s.parentNode) {
          s.parentNode.insertBefore(tf, s)
          console.log('🔐 Loading TrustedForm script (form field found)')
        }
      } else if (attempts >= maxAttempts) {
        clearInterval(checkInterval)
        console.warn('⚠️ TrustedForm field not found after polling - script will not load properly')
      }
    }, 100) // Check every 100ms

    return () => clearInterval(checkInterval)
  }, [enabled])

  return { isLoaded: scriptLoadedRef.current }
}
