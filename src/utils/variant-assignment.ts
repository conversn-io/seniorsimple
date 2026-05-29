/**
 * Variant Assignment System for Quiz Experiments
 * 
 * Supports:
 * - Cookie-based sticky assignment (30-day TTL)
 * - Query parameter override for testing
 * - Multiple variants with weights
 */

export type QuizVariant = 'rmd_v1' | 'rmd_v1_scarcity_late';
export type EntryVariant = 'start_button' | 'immediate_q1';

const VARIANT_COOKIE_NAME = 'ss_quiz_rmd_variant';
const ENTRY_VARIANT_COOKIE_NAME = 'quiz_rmd_entry_variant';
const VARIANT_COOKIE_TTL_DAYS = 30;

/**
 * Get assigned variant for current session
 * Priority: Query param > Cookie > Random assignment
 */
export function getAssignedVariant(): QuizVariant {
  if (typeof window === 'undefined') {
    return 'rmd_v1'; // SSR default
  }

  // Check query parameter override
  const urlParams = new URLSearchParams(window.location.search);
  const queryVariant = urlParams.get('v');
  if (queryVariant === 'rmd_v1' || queryVariant === 'rmd_v1_scarcity_late') {
    setVariantCookie(queryVariant);
    return queryVariant;
  }

  // Check existing cookie
  const cookieVariant = getVariantCookie();
  if (cookieVariant) {
    return cookieVariant;
  }

  // Random assignment (50/50 split)
  const assigned = Math.random() < 0.5 ? 'rmd_v1' : 'rmd_v1_scarcity_late';
  setVariantCookie(assigned);
  return assigned;
}

/**
 * Get variant from cookie
 */
function getVariantCookie(): QuizVariant | null {
  if (typeof document === 'undefined') return null;
  
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === VARIANT_COOKIE_NAME) {
      if (value === 'rmd_v1' || value === 'rmd_v1_scarcity_late') {
        return value;
      }
    }
  }
  return null;
}

/**
 * Set variant cookie with 30-day TTL
 */
function setVariantCookie(variant: QuizVariant): void {
  if (typeof document === 'undefined') return;
  
  const expires = new Date();
  expires.setTime(expires.getTime() + VARIANT_COOKIE_TTL_DAYS * 24 * 60 * 60 * 1000);
  
  document.cookie = `${VARIANT_COOKIE_NAME}=${variant}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
}

/**
 * Clear variant cookie (for testing)
 */
export function clearVariantCookie(): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${VARIANT_COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

/**
 * Get assigned entry variant for quiz entry optimization test
 * Priority: Query param > Cookie > Random assignment (50/50)
 */
export function getAssignedEntryVariant(): EntryVariant {
  if (typeof window === 'undefined') {
    return 'immediate_q1'; // SSR default
  }

  // Check query parameter override
  const urlParams = new URLSearchParams(window.location.search);
  const queryVariant = urlParams.get('entry');
  if (queryVariant === 'start_button' || queryVariant === 'immediate_q1') {
    setEntryVariantCookie(queryVariant);
    return queryVariant;
  }

  // Check existing cookie
  const cookieVariant = getEntryVariantCookie();
  if (cookieVariant) {
    return cookieVariant;
  }

  // Random assignment (50/50 split)
  const assigned = Math.random() < 0.5 ? 'start_button' : 'immediate_q1';
  setEntryVariantCookie(assigned);
  return assigned;
}

/**
 * Get entry variant from cookie
 */
function getEntryVariantCookie(): EntryVariant | null {
  if (typeof document === 'undefined') return null;
  
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === ENTRY_VARIANT_COOKIE_NAME) {
      if (value === 'start_button' || value === 'immediate_q1') {
        return value;
      }
    }
  }
  return null;
}

/**
 * Set entry variant cookie with 30-day TTL
 */
function setEntryVariantCookie(variant: EntryVariant): void {
  if (typeof document === 'undefined') return;
  
  const expires = new Date();
  expires.setTime(expires.getTime() + VARIANT_COOKIE_TTL_DAYS * 24 * 60 * 60 * 1000);
  
  document.cookie = `${ENTRY_VARIANT_COOKIE_NAME}=${variant}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
}

/**
 * Clear entry variant cookie (for testing)
 */
export function clearEntryVariantCookie(): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${ENTRY_VARIANT_COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

// ---------------------------------------------------------------------------
// LTV pass/fail indicator on the Verify Property step (reverse-mortgage funnel)
// ---------------------------------------------------------------------------
// Controls whether the green/amber "Looks like a fit" / "Your equity is lower
// than typical" qualify box is rendered alongside the LTV % readout in
// VerifyPropertyDetails.tsx.
//
// Hypothesis: the explicit pass/fail signal may cause friction (users who see
// the amber box may bounce before the lead is captured). The hidden variant
// keeps the same LTV % readout but in neutral styling, with no icon or
// qualifying copy.
//
// Rollout:
//   - Today: LTV_INDICATOR_ROLLOUT_SPLIT = false → 100% 'hidden'. The flag is
//     wired end-to-end but the experiment is not active yet.
//   - To start the A/B: flip LTV_INDICATOR_ROLLOUT_SPLIT to true. Cookie
//     assignment is sticky for 30 days, so users in flight stay in their
//     variant.
//   - Force a variant for QA / preview: ?ltv_indicator=shown or
//     ?ltv_indicator=hidden in the URL.
// ---------------------------------------------------------------------------

export type LtvIndicatorVariant = 'hidden' | 'shown';

const LTV_INDICATOR_COOKIE_NAME = 'ss_ltv_indicator_variant';
const LTV_INDICATOR_ROLLOUT_SPLIT = false;

/**
 * Get assigned LTV indicator variant for current session.
 * Priority: Query param > Cookie > Rollout assignment (today: 100% hidden).
 */
export function getAssignedLtvIndicatorVariant(): LtvIndicatorVariant {
  if (typeof window === 'undefined') {
    return 'hidden'; // SSR default — matches the post-rollout default state
  }

  // Check query parameter override (QA / preview)
  const urlParams = new URLSearchParams(window.location.search);
  const queryVariant = urlParams.get('ltv_indicator');
  if (queryVariant === 'shown' || queryVariant === 'hidden') {
    setLtvIndicatorVariantCookie(queryVariant);
    return queryVariant;
  }

  // Check existing cookie
  const cookieVariant = getLtvIndicatorVariantCookie();
  if (cookieVariant) {
    return cookieVariant;
  }

  // Rollout assignment. While LTV_INDICATOR_ROLLOUT_SPLIT is false, everyone
  // gets 'hidden' — the flag is staged but the A/B isn't running. Flip to true
  // to start the 50/50 split.
  const assigned: LtvIndicatorVariant = LTV_INDICATOR_ROLLOUT_SPLIT
    ? (Math.random() < 0.5 ? 'shown' : 'hidden')
    : 'hidden';
  setLtvIndicatorVariantCookie(assigned);
  return assigned;
}

/**
 * Get LTV indicator variant from cookie
 */
function getLtvIndicatorVariantCookie(): LtvIndicatorVariant | null {
  if (typeof document === 'undefined') return null;

  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === LTV_INDICATOR_COOKIE_NAME) {
      if (value === 'shown' || value === 'hidden') {
        return value;
      }
    }
  }
  return null;
}

/**
 * Set LTV indicator variant cookie with 30-day TTL
 */
function setLtvIndicatorVariantCookie(variant: LtvIndicatorVariant): void {
  if (typeof document === 'undefined') return;

  const expires = new Date();
  expires.setTime(expires.getTime() + VARIANT_COOKIE_TTL_DAYS * 24 * 60 * 60 * 1000);

  document.cookie = `${LTV_INDICATOR_COOKIE_NAME}=${variant}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
}

/**
 * Clear LTV indicator variant cookie (for testing)
 */
export function clearLtvIndicatorVariantCookie(): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${LTV_INDICATOR_COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

