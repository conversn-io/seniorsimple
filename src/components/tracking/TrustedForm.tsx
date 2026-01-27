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
 * Usage: Add <TrustedForm /> to any page with forms
 */
export function TrustedForm() {
  return (
    <>
      <Script
        id="trustedform-loader"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            (function() {
              var tf = document.createElement('script');
              tf.type = 'text/javascript';
              tf.async = true;
              tf.src = ("https:" == document.location.protocol ? 'https' : 'http') +
                '://api.trustedform.com/trustedform.js?field=xxTrustedFormCertUrl&use_tagged_consent=true&l=' +
                new Date().getTime() + Math.random();
              var s = document.getElementsByTagName('script')[0];
              if (s && s.parentNode) {
                s.parentNode.insertBefore(tf, s);
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

