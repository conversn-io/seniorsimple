'use client'

import { useEffect, useRef, useCallback } from 'react'

/**
 * CRITICAL: TrustedForm Integration Hook
 * 
 * TrustedForm requires:
 * 1. An UNCONTROLLED hidden input with name="xxTrustedFormCertUrl" (NO value attribute!)
 * 2. The input must exist in DOM BEFORE the script loads
 * 3. The script must be loaded AFTER the form is rendered
 * 
 * Previous failures were caused by:
 * - Using controlled input with value="" (React blocks external JS from setting value)
 * - Loading script globally before form exists
 * - Race conditions between script load and form render
 */
export function useTrustedForm({ enabled = true }: { enabled?: boolean } = {}) {
  const scriptLoadedRef = useRef(false)
  const cleanupRef = useRef<(() => void) | null>(null)

  const loadScript = useCallback(() => {
    // CRITICAL: Don't load if already loaded successfully
    if (scriptLoadedRef.current) {
      console.log('🔐 TrustedForm: Script already loaded, skipping')
      return
    }

    // CRITICAL: Check for form field FIRST
    const formField = document.querySelector('input[name="xxTrustedFormCertUrl"]') as HTMLInputElement
    if (!formField) {
      console.error('❌ TrustedForm: Cannot load - form field not found in DOM')
      console.error('   Make sure to add: <input type="hidden" name="xxTrustedFormCertUrl" id="xxTrustedFormCertUrl" />')
      console.error('   WITHOUT a value attribute (must be uncontrolled)')
      return
    }

    // Check if field already has value (script already worked)
    if (formField.value && formField.value.startsWith('https://cert.trustedform.com/')) {
      console.log('✅ TrustedForm: Certificate already captured:', formField.value.substring(0, 60) + '...')
      scriptLoadedRef.current = true
      return
    }

    // Remove ALL existing TrustedForm scripts to ensure clean load
    const existingScripts = document.querySelectorAll('script[src*="trustedform.com"]')
    if (existingScripts.length > 0) {
      console.log(`🔵 TrustedForm: Removing ${existingScripts.length} existing script(s) for clean reload`)
      existingScripts.forEach(script => script.remove())
    }

    // Create and load fresh TrustedForm script
    const tf = document.createElement('script')
    tf.type = 'text/javascript'
    tf.async = true
    tf.src = 'https://api.trustedform.com/trustedform.js?field=xxTrustedFormCertUrl&use_tagged_consent=true&l=' + 
      Date.now() + Math.random()
    
    tf.onload = () => {
      console.log('✅ TrustedForm: Script loaded successfully')
      scriptLoadedRef.current = true
      
      // Verify the certificate URL was populated
      setTimeout(() => {
        const updatedField = document.querySelector('input[name="xxTrustedFormCertUrl"]') as HTMLInputElement
        if (updatedField?.value && updatedField.value.startsWith('https://cert.trustedform.com/')) {
          console.log('✅ TrustedForm: Certificate URL populated:', updatedField.value.substring(0, 60) + '...')
        } else {
          console.warn('⚠️ TrustedForm: Script loaded but certificate URL not populated')
          console.warn('   Field value:', updatedField?.value || 'EMPTY')
          console.warn('   This may indicate the input has a value="" attribute (controlled input)')
        }
      }, 500)
    }
    
    tf.onerror = (error) => {
      console.error('❌ TrustedForm: Script failed to load', error)
    }

    // Insert script at end of body for clean DOM state
    document.body.appendChild(tf)
    console.log('🔐 TrustedForm: Script loading (form field confirmed present)')
  }, [])

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') {
      return
    }

    console.log('🔐 TrustedForm: Hook enabled, waiting for form field...')

    // Use MutationObserver to detect when form field appears
    let attempts = 0
    const maxAttempts = 50 // 5 seconds max (50 * 100ms)
    
    const checkAndLoad = () => {
      attempts++
      const formField = document.querySelector('input[name="xxTrustedFormCertUrl"]')
      
      if (formField) {
        console.log('✅ TrustedForm: Form field found after', attempts, 'attempts')
        // Small delay to ensure React has finished rendering
        setTimeout(loadScript, 100)
        return true
      }
      
      if (attempts >= maxAttempts) {
        console.error('❌ TrustedForm: Form field not found after', maxAttempts, 'attempts')
        return true // Stop polling
      }
      
      return false
    }

    // Initial check
    if (checkAndLoad()) return

    // Poll for form field
    const intervalId = setInterval(() => {
      if (checkAndLoad()) {
        clearInterval(intervalId)
      }
    }, 100)

    cleanupRef.current = () => clearInterval(intervalId)

    return () => {
      if (cleanupRef.current) {
        cleanupRef.current()
      }
    }
  }, [enabled, loadScript])

  return { isLoaded: scriptLoadedRef.current }
}

/**
 * Get TrustedForm Certificate URL
 * Returns the certificate URL if populated, null otherwise
 */
export function getTrustedFormCertUrl(): string | null {
  if (typeof window === 'undefined') return null
  
  const field = document.querySelector('input[name="xxTrustedFormCertUrl"]') as HTMLInputElement
  const value = field?.value || null
  
  // Validate it's actually a TrustedForm cert URL
  if (value && value.startsWith('https://cert.trustedform.com/')) {
    return value
  }
  
  return null
}

/**
 * Get LeadID/Jornaya Token
 * LeadID V2 stores token in multiple places - check all
 */
export function getLeadIdToken(): string | null {
  if (typeof window === 'undefined') return null
  
  // Check various places LeadID stores the token
  const sources = [
    // LeadID V2 hidden input
    (document.getElementById('leadid_token') as HTMLInputElement)?.value,
    // Universal LeadID input
    (document.querySelector('input[name="universal_leadid"]') as HTMLInputElement)?.value,
    // LeadID on window object
    (window as any).LeadiD?.token,
    // Legacy locations
    (window as any).leadid_token,
    (window as any).jornayaLeadId,
    (window as any).jornaya_lead_id,
  ]
  
  for (const source of sources) {
    if (source && typeof source === 'string' && source.length > 10) {
      return source
    }
  }
  
  return null
}
