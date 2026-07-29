/**
 * W4 — server-side {{location}} token injection.
 *
 * Reads Vercel's geo headers on the request (populated at the edge from the
 * visitor's IP) and substitutes `{{location}}` / `{{city}}` in every user-
 * visible string on a kit-native advertorial: headline, subhead, intro_md,
 * item heading/body/cta_text, and any nested string in component_props.
 *
 * Rules:
 *   1. Location is DISPLAY-ONLY. Never write it into an outbound `/out` URL,
 *      an analytics event's URL params, or any client-visible query string.
 *      The kit passes location through as substituted text in the rendered
 *      HTML — the browser never learns it via a channel it can echo back.
 *   2. Trust ONLY server-side headers. A `?location=Foo` in the URL is
 *      ignored (would be spoofable + would put PII into referrers).
 *   3. Fail closed: if geo headers are missing (local dev, header stripped,
 *      privacy-preserving VPN), substitute a generic fallback ('your area')
 *      instead of leaving a broken `{{location}}` token in the copy.
 */

/** Vercel edge geo headers (set on the request when serving via Vercel). */
const HEADER_CITY = 'x-vercel-ip-city'
const HEADER_REGION = 'x-vercel-ip-country-region'
const HEADER_COUNTRY = 'x-vercel-ip-country'

/** Copy fallback when we can't resolve a city — must never leave a raw token. */
export const FALLBACK_LOCATION = 'your area'

export interface KitLocation {
  /** Decoded city name (Vercel URL-encodes the header value). */
  city: string | null
  /** ISO region code, e.g. "CA", "NY". */
  region: string | null
  /** ISO country code, e.g. "US", "CA". */
  country: string | null
  /**
   * The string every `{{location}}` token renders as. Derived from city when
   * available, otherwise the FALLBACK_LOCATION string. Never a raw token.
   */
  display: string
}

/**
 * Header value → sanitized string. Vercel URL-encodes header values that
 * contain non-ASCII characters (e.g. "S%C3%A3o%20Paulo"). Anything that
 * looks structured (contains `<`, `>`, `{`, `}`, whitespace-runs, or is
 * longer than 64 chars) is rejected — a defense against a middlebox stuffing
 * junk into the header we then dangerouslySetInnerHTML.
 */
export function sanitizeGeoHeader(raw: string | null | undefined): string | null {
  if (!raw) return null
  let decoded: string
  try {
    decoded = decodeURIComponent(raw)
  } catch {
    decoded = raw
  }
  const trimmed = decoded.trim()
  if (!trimmed) return null
  if (trimmed.length > 64) return null
  // Reject anything that could break out of a text context if it landed
  // inside dangerouslySetInnerHTML — belt + suspenders since renderMarkdown
  // already escapes, but city names in copy also flow through raw string
  // interpolation (e.g. the plain text headline).
  if (/[<>{}\\`]/.test(trimmed)) return null
  return trimmed
}

/** ReadonlyHeaders is a superset of Headers minus mutation methods. */
type HeaderReader = { get(name: string): string | null }

export function resolveLocation(headers: HeaderReader | null | undefined): KitLocation {
  if (!headers) {
    return { city: null, region: null, country: null, display: FALLBACK_LOCATION }
  }
  const city = sanitizeGeoHeader(headers.get(HEADER_CITY))
  const region = sanitizeGeoHeader(headers.get(HEADER_REGION))
  const country = sanitizeGeoHeader(headers.get(HEADER_COUNTRY))
  const display = city ?? FALLBACK_LOCATION
  return { city, region, country, display }
}

// ---------------------------------------------------------------------------
// Substitution
// ---------------------------------------------------------------------------

/**
 * Case-insensitive token match — {{location}}, {{ location }}, {{City}} etc.
 * Whitespace tolerated inside braces for author ergonomics. Exhaustive list
 * of accepted tokens so a typo like {{locaton}} shows up as a broken token
 * (which is loud, and better than silently rendering nothing).
 */
const TOKEN_MAP: Record<string, keyof KitLocation | 'display'> = {
  location: 'display',
  city: 'city',
  region: 'region',
  country: 'country',
}

// Match any {{ ident }} so a typo like {{locaton}} falls back to the generic
// string instead of leaving raw braces on-page (which would be a loud, ugly
// production bug). Only alphabetic tokens — deliberately narrow so we don't
// accidentally eat markdown/mustache syntax on unrelated payloads.
const TOKEN_RE = /\{\{\s*([a-zA-Z_]+)\s*\}\}/g

export function substituteLocation(
  text: string | null | undefined,
  location: KitLocation,
): string | null {
  if (text === null || text === undefined) return text ?? null
  if (typeof text !== 'string') return text as unknown as string
  if (text.indexOf('{{') === -1) return text
  return text.replace(TOKEN_RE, (_, token: string) => {
    const key = TOKEN_MAP[token.toLowerCase()]
    if (!key) return FALLBACK_LOCATION
    if (key === 'display') return location.display
    const value = location[key]
    if (value && typeof value === 'string' && value.length > 0) return value
    // Region/country/city can be null while city gives display via fallback;
    // for the explicit-key tokens, fall back to the same generic string so
    // a raw {{region}} in copy never leaves a token artifact on-page.
    return FALLBACK_LOCATION
  })
}

/**
 * Deep-walk a JSON-ish value and substitute inside every string leaf. Used
 * for advertorial_items.component_props, which is jsonb with arbitrary
 * string fields the component library reads (e.g. EditorsPick.tag,
 * QualifyChecklist.items[]).
 *
 * Never mutates in place — always returns a new object/array. Numbers,
 * booleans, and nulls pass through.
 */
export function substituteLocationDeep<T>(value: T, location: KitLocation): T {
  if (value === null || value === undefined) return value
  if (typeof value === 'string') {
    return substituteLocation(value, location) as unknown as T
  }
  if (Array.isArray(value)) {
    return value.map((v) => substituteLocationDeep(v, location)) as unknown as T
  }
  if (typeof value === 'object') {
    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = substituteLocationDeep(v, location)
    }
    return out as unknown as T
  }
  return value
}
