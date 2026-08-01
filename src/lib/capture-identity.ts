/**
 * Analytics + tracking helpers shared by every capture surface (LPs, sidebar
 * ads, inline units, tool-gate panels, Simple Life sticky bar).
 *
 * All functions are client-safe — they no-op or fall back cleanly when called
 * during SSR or when the browser APIs they depend on aren't present.
 *
 * Note: hem_sha256 (Hashed Email Marker) used to live here as a client-side
 * helper. Removed 2026-07-31 once we confirmed a BEFORE INSERT trigger on
 * newsletter_subscribers computes it server-side from `email`. Client-side
 * hashing was duplicating server work — the trigger is the single source.
 */

/**
 * Method labels used on GA4 lead_capture events + as the sixth tag on the
 * subscribe payload. Keep these stable — they show up in downstream reports.
 */
export type CaptureMethod =
  | 'lp_form'
  | 'sidebar_ad'
  | 'inline_ad'
  | 'tool_gate'
  | 'inline_panel'
  | 'sticky_bar'

interface Ga4LeadCaptureParams {
  method: CaptureMethod
  slug: string
  magnetId?: string
  pillar?: string
  assetKey?: string
  list?: string
  abArm?: string
}

/**
 * Fire GA4 `lead_capture` conversion event.
 *
 * Safe to call unconditionally — no-ops if gtag isn't loaded on the page
 * (which is fine for previews / non-GA4 environments).
 */
export function fireGa4LeadCapture(params: Ga4LeadCaptureParams): void {
  if (typeof window === 'undefined') return
  const g = (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag
  if (typeof g !== 'function') return

  try {
    g('event', 'lead_capture', {
      method: params.method,
      slug: params.slug,
      magnet_id: params.magnetId,
      pillar: params.pillar,
      asset_key: params.assetKey,
      list: params.list ?? 'seniorsimple-newsletter',
      ab_arm: params.abArm,
    })
  } catch {
    // never block the flow on analytics
  }
}
