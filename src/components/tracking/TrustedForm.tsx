'use client'

import { useEffect } from 'react'
import Script from 'next/script'

/**
 * TrustedForm Component
 * 
 * Loads TrustedForm script for lead verification and consent capture.
 * The script automatically populates a hidden field named 'xxTrustedFormCertUrl'
 * in any form on the page.
 * 
 * According to ActiveProspect docs, the script will find forms even if they're
 * added to the DOM after the script loads.
 * 
 * Usage: Add <TrustedForm /> to any page with forms
 */
export function TrustedForm() {
  useEffect(() => {
    // Log when TrustedForm component mounts
    console.log('🔐 TrustedForm component mounted');
    
    // Monitor for form fields being added to DOM
    const checkForForms = setInterval(() => {
      const formField = document.querySelector('input[name="xxTrustedFormCertUrl"]') as HTMLInputElement;
      if (formField) {
        const hasValue = formField.value && formField.value.length > 0;
        if (hasValue) {
          console.log('✅ TrustedForm Cert URL populated:', formField.value.substring(0, 50) + '...');
          clearInterval(checkForForms);
        } else {
          // Field exists but no value yet - script might still be loading
          console.log('🔵 TrustedForm field found but not populated yet');
        }
      }
    }, 1000);

    return () => clearInterval(checkForForms);
  }, []);

  return (
    <>
      <Script
        id="trustedform-loader"
        strategy="afterInteractive"
        onLoad={() => {
          console.log('✅ TrustedForm script tag loaded');
        }}
        dangerouslySetInnerHTML={{
          __html: `
            (function() {
              console.log('🔐 TrustedForm script initialization starting...');
              var tf = document.createElement('script');
              tf.type = 'text/javascript';
              tf.async = true;
              tf.src = ("https:" == document.location.protocol ? 'https' : 'http') +
                '://api.trustedform.com/trustedform.js?field=xxTrustedFormCertUrl&use_tagged_consent=true&l=' +
                new Date().getTime() + Math.random();
              
              tf.onload = function() {
                console.log('✅ TrustedForm script loaded successfully');
                // Check for existing forms
                var existingField = document.querySelector('input[name="xxTrustedFormCertUrl"]');
                if (existingField) {
                  console.log('🔵 TrustedForm found existing form field');
                } else {
                  console.log('⚠️ TrustedForm: No form field found yet (will scan when forms appear)');
                }
              };
              
              tf.onerror = function() {
                console.error('❌ TrustedForm script failed to load');
              };
              
              var s = document.getElementsByTagName('script')[0];
              if (s && s.parentNode) {
                s.parentNode.insertBefore(tf, s);
                console.log('🔐 TrustedForm script element inserted into DOM');
              } else {
                console.error('❌ TrustedForm: Could not find script tag to insert before');
              }
            })();
          `
        }}
      />
      <noscript>
        <img src="https://api.trustedform.com/ns.gif" alt="" style={{ display: 'none' }} />
      </noscript>
    </>
  )
}

/**
 * TrustedForm Hidden Input Component
 * 
 * Adds the hidden input field that TrustedForm will populate.
 * Add this inside each form element.
 */
export function TrustedFormInput() {
  return (
    <input
      type="hidden"
      name="xxTrustedFormCertUrl"
      id="xxTrustedFormCertUrl"
      value=""
    />
  )
}

/**
 * Get TrustedForm Certificate URL from the hidden input field
 * Uses querySelector to find the input by name attribute (more reliable than getElementById)
 * This matches the RateRoots implementation pattern.
 */
export function getTrustedFormCertUrl(): string | null {
  if (typeof window === 'undefined') return null;
  const certUrlField = document.querySelector('input[name="xxTrustedFormCertUrl"]') as HTMLInputElement;
  return certUrlField?.value || null;
}

