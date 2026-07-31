/**
 * Identity + tracking helpers shared by every capture surface (LPs, sidebar
 * ads, inline units, tool-gate panels, Simple Life sticky bar).
 *
 * All functions are client-safe — they no-op or fall back cleanly when called
 * during SSR or when the browser APIs they depend on aren't present.
 */

/**
 * Hashed Email Marker: lowercase SHA-256 hex digest of the trimmed lowercased
 * email. Used by the newsletter system for identity resolution without
 * exposing raw PII in analytics events / audit logs.
 *
 * Returns null when SubtleCrypto is unavailable (older mobile browsers, some
 * embedded contexts). Callers should just omit the field in that case rather
 * than blocking the submit.
 */
export async function hemSha256(email: string): Promise<string | null> {
  if (typeof window === 'undefined') return null
  const subtle = window.crypto?.subtle
  if (!subtle) return null

  try {
    const normalized = email.trim().toLowerCase()
    const bytes = new TextEncoder().encode(normalized)
    const digest = await subtle.digest('SHA-256', bytes)
    return Array.from(new Uint8Array(digest))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
  } catch {
    return null
  }
}

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
