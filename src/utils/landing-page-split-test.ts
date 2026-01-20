/**
 * Landing Page Split Test Utility
 * 
 * 3-way split test for landing page variants:
 * - control: /quiz-book-b (current landing page)
 * - rmd_v1: /quiz-rmd-v1 (RMD landing page with start_button entry variant)
 * - rmd_v2: /quiz-rmd-v2 (RMD landing page with immediate_q1 entry variant)
 * 
 * Supports:
 * - Cookie-based sticky assignment (30-day TTL)
 * - Query parameter override for testing
 * - Equal 33.3% traffic split
 */

export type LandingPageVariant = 'control' | 'rmd_v1' | 'rmd_v2';

const VARIANT_COOKIE_NAME = 'ss_landing_page_variant';
const VARIANT_COOKIE_TTL_DAYS = 30;

/**
 * Get assigned landing page variant for current session
 * Priority: Query param > Cookie > Random assignment (33.3% each)
 */
export function getLandingPageVariant(): LandingPageVariant {
  if (typeof window === 'undefined') {
    return 'control'; // SSR default
  }

  // Check query parameter override
  const urlParams = new URLSearchParams(window.location.search);
  const queryVariant = urlParams.get('variant');
  if (queryVariant === 'control' || queryVariant === 'rmd_v1' || queryVariant === 'rmd_v2') {
    setVariantCookie(queryVariant);
    // Also store in sessionStorage for tracking
    sessionStorage.setItem('landing_page_variant', queryVariant);
    return queryVariant;
  }

  // Check existing cookie
  const cookieVariant = getVariantCookie();
  if (cookieVariant) {
    // Also store in sessionStorage for tracking
    sessionStorage.setItem('landing_page_variant', cookieVariant);
    return cookieVariant;
  }

  // Random assignment (33.3% each)
  const random = Math.random();
  let assigned: LandingPageVariant;
  if (random < 0.333) {
    assigned = 'control';
  } else if (random < 0.666) {
    assigned = 'rmd_v1';
  } else {
    assigned = 'rmd_v2';
  }

  setVariantCookie(assigned);
  sessionStorage.setItem('landing_page_variant', assigned);
  
  return assigned;
}

/**
 * Get variant from cookie
 */
function getVariantCookie(): LandingPageVariant | null {
  if (typeof document === 'undefined') return null;
  
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === VARIANT_COOKIE_NAME) {
      if (value === 'control' || value === 'rmd_v1' || value === 'rmd_v2') {
        return value;
      }
    }
  }
  return null;
}

/**
 * Set variant cookie with 30-day TTL
 */
function setVariantCookie(variant: LandingPageVariant): void {
  if (typeof document === 'undefined') return;
  
  const expires = new Date();
  expires.setTime(expires.getTime() + VARIANT_COOKIE_TTL_DAYS * 24 * 60 * 60 * 1000);
  
  document.cookie = `${VARIANT_COOKIE_NAME}=${variant}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
}

/**
 * Clear variant cookie (for testing)
 */
export function clearLandingPageVariantCookie(): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${VARIANT_COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.removeItem('landing_page_variant');
  }
}

/**
 * Get variant from sessionStorage (for tracking)
 */
export function getStoredLandingPageVariant(): LandingPageVariant | null {
  if (typeof window === 'undefined' || typeof sessionStorage === 'undefined') {
    return null;
  }
  
  const stored = sessionStorage.getItem('landing_page_variant');
  if (stored === 'control' || stored === 'rmd_v1' || stored === 'rmd_v2') {
    return stored;
  }
  
  return null;
}

