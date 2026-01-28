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

    // Wait for form field to exist (React might not have rendered it yet)
    let attempts = 0
    const maxAttempts = 20 // Increased to 2 seconds (20 * 100ms)
    const checkInterval = setInterval(() => {
      attempts++
      
      // Check if form with TrustedForm field exists
      const formField = document.querySelector('input[name="xxTrustedFormCertUrl"]') as HTMLInputElement
      
      if (formField) {
        clearInterval(checkInterval)
        
        // Check if form field already has a value (script already working)
        if (formField.value && formField.value.length > 0) {
          console.log('✅ TrustedForm already populated:', formField.value.substring(0, 50) + '...')
          scriptLoadedRef.current = true
          return
        }
        
        // Check if TrustedForm script is already loaded
        const existingScript = document.querySelector('script[src*="trustedform.com"]')
        if (existingScript && scriptLoadedRef.current) {
          // Script exists but form wasn't found when it loaded
          // TrustedForm should auto-scan, but if it didn't, we need to reload
          console.log('🔵 TrustedForm script exists but form field empty - waiting for auto-scan...')
          // Give it a moment to populate, then check again
          setTimeout(() => {
            if (formField.value && formField.value.length > 0) {
              console.log('✅ TrustedForm populated after wait')
            } else {
              console.warn('⚠️ TrustedForm script exists but not populating - may need manual trigger')
            }
          }, 2000)
          return
        }
        
        // Remove any existing TrustedForm scripts to ensure clean load
        const existingScripts = document.querySelectorAll('script[src*="trustedform.com"]')
        existingScripts.forEach(script => {
          console.log('🔵 Removing existing TrustedForm script to reload with form present')
          script.remove()
        })
        
        // Load TrustedForm script NOW that form exists
        const tf = document.createElement('script')
        tf.type = 'text/javascript'
        tf.async = true
        tf.src = ('https:' == document.location.protocol ? 'https' : 'http') +
          '://api.trustedform.com/trustedform.js?field=xxTrustedFormCertUrl&use_tagged_consent=true&l=' +
          new Date().getTime() + Math.random()
        
        tf.onload = () => {
          scriptLoadedRef.current = true
          console.log('✅ TrustedForm script loaded successfully (form field was present)')
          
          // Verify it populated
          setTimeout(() => {
            const certUrl = formField.value
            if (certUrl && certUrl.length > 0) {
              console.log('✅ TrustedForm Cert URL populated:', certUrl.substring(0, 50) + '...')
            } else {
              console.warn('⚠️ TrustedForm script loaded but cert URL not populated yet')
            }
          }, 1000)
        }
        
        tf.onerror = () => {
          console.error('❌ Failed to load TrustedForm script')
        }

        const s = document.getElementsByTagName('script')[0]
        if (s && s.parentNode) {
          s.parentNode.insertBefore(tf, s)
          console.log('🔐 Loading TrustedForm script (form field confirmed present)')
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
