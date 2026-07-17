/**
 * Pure helpers for the /out/[slug]/[slot] click router.
 *
 * Split from the route handler so we can unit-test the parts that matter
 * (macro capture, sub_id encoding, template substitution, weighted rotation
 * pick) without spinning up Supabase or Next.
 *
 * Convention for s1..s8 (defensible default, adjust if a canonical spec lands):
 *
 *   s1  = property site_id           (server-set from advertorial.site_id)
 *   s2  = advertorial slug           (server-set)
 *   s3  = slot_key                   (server-set)
 *   s4  = hook / headline variant    (query: s4 or hook)
 *   s5  = creative / image variant   (query: s5 or creative)
 *   s6  = audience / geo segment     (query: s6 or audience)
 *   s7  = campaign id                (query: s7 or campaign_id / <net>_campaign_id)
 *   s8  = network click id           (query: s8 or ob_click_id / tblci / rcid / realize_click_id)
 *   source = network                 (query: source, or auto-inferred from s8 macro name)
 *
 * s1..s3 come from server state (untamperable). s4..s8 + source come from the
 * native ad's query string. sub_id is a compact "s1=…&s4=…" URL-fragment sent
 * to the network as sub2 for reconciliation. Never contains PII.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface RotationEntry {
  offer_id: string
  weight?: number
}

export interface SParams {
  s1?: string | null
  s2?: string | null
  s3?: string | null
  s4?: string | null
  s5?: string | null
  s6?: string | null
  s7?: string | null
  s8?: string | null
}

export interface CapturedTracking extends SParams {
  source: string | null
}

// ---------------------------------------------------------------------------
// Native network click-id macros → source inference
// ---------------------------------------------------------------------------

const NETWORK_CLICK_ID_KEYS: Array<{ key: string; source: string }> = [
  { key: 'ob_click_id',      source: 'outbrain'   },
  { key: 'tblci',            source: 'taboola'    },
  { key: 'rcid',             source: 'revcontent' },
  { key: 'realize_click_id', source: 'realize'    },
]

const NETWORK_CAMPAIGN_ID_KEYS = [
  'ob_campaign_id',
  'taboola_campaign_id',
  'revcontent_campaign_id',
  'realize_campaign_id',
]

// A native macro that never got substituted (e.g. `$ob_click_id$`) is worthless
// — treat it as absent so we don't log/send literal template strings.
function isPlaceholder(value: string | null | undefined): boolean {
  if (!value) return true
  return /^\$.*\$$/.test(value.trim())
}

function firstReal(...values: Array<string | null | undefined>): string | null {
  for (const v of values) {
    if (v && !isPlaceholder(v)) return v
  }
  return null
}

// ---------------------------------------------------------------------------
// Capture tracking from a URLSearchParams
// ---------------------------------------------------------------------------

/**
 * Extract s4..s8 + source from a native ad's query string.
 * s1..s3 are supplied separately by the caller (server state).
 */
export function captureTracking(params: URLSearchParams): Omit<CapturedTracking, 's1' | 's2' | 's3'> {
  const explicitSource = params.get('source')

  // s8 = network click id. Prefer explicit s8, then any known network macro.
  let s8: string | null = firstReal(params.get('s8'))
  let inferredSource: string | null = null
  if (!s8) {
    for (const { key, source } of NETWORK_CLICK_ID_KEYS) {
      const v = firstReal(params.get(key))
      if (v) { s8 = v; inferredSource = source; break }
    }
  }

  const source = firstReal(explicitSource, inferredSource)

  // s7 = campaign id. Prefer explicit s7, then any network campaign_id macro.
  let s7: string | null = firstReal(params.get('s7'), params.get('campaign_id'))
  if (!s7) {
    for (const key of NETWORK_CAMPAIGN_ID_KEYS) {
      const v = firstReal(params.get(key))
      if (v) { s7 = v; break }
    }
  }

  return {
    s4: firstReal(params.get('s4'), params.get('hook')),
    s5: firstReal(params.get('s5'), params.get('creative')),
    s6: firstReal(params.get('s6'), params.get('audience')),
    s7,
    s8,
    source,
  }
}

// ---------------------------------------------------------------------------
// Sub_id encoding (sent as sub2 to the network for reconciliation)
// ---------------------------------------------------------------------------

/**
 * Encode the s-string. Compact `k=v` pairs joined by `|` so a single field
 * carries the whole taxonomy without conflicting with URL-encoded delimiters.
 * Empty/null values are omitted. Never contains PII by construction — only
 * s1..s8 + source, which are all server-controlled or ad-parameter values.
 */
export function encodeSubId(t: CapturedTracking): string {
  const parts: string[] = []
  const pushIf = (k: string, v: string | null | undefined) => {
    if (v && !isPlaceholder(v)) parts.push(`${k}=${encodeURIComponent(v)}`)
  }
  pushIf('s1', t.s1)
  pushIf('s2', t.s2)
  pushIf('s3', t.s3)
  pushIf('s4', t.s4)
  pushIf('s5', t.s5)
  pushIf('s6', t.s6)
  pushIf('s7', t.s7)
  pushIf('s8', t.s8)
  pushIf('src', t.source)
  return parts.join('|')
}

// ---------------------------------------------------------------------------
// Template substitution
// ---------------------------------------------------------------------------

export interface SubstituteInput {
  template: string
  clickId: string
  subId: string
  siteId: string        // becomes {S1}
  tracking: CapturedTracking
}

/**
 * Substitute {CLICK_ID}, {SUB_ID}, {S1}..{S8} placeholders in the template.
 * Case-insensitive on the placeholder name; empty values become empty strings.
 *
 * If the template has no {S1} placeholder AND no existing s1 query param,
 * append `s1=<siteId>` so the network still receives the property tag
 * (§0.5 of the design doc: router injects s1 dynamically per property).
 */
export function substituteTemplate(input: SubstituteInput): string {
  const { template, clickId, subId, siteId, tracking } = input

  const values: Record<string, string> = {
    CLICK_ID: clickId,
    SUB_ID:   subId,
    S1: tracking.s1 ?? '',
    S2: tracking.s2 ?? '',
    S3: tracking.s3 ?? '',
    S4: tracking.s4 ?? '',
    S5: tracking.s5 ?? '',
    S6: tracking.s6 ?? '',
    S7: tracking.s7 ?? '',
    S8: tracking.s8 ?? '',
  }

  const hadS1Placeholder = /\{S1\}/i.test(template)

  let out = template.replace(/\{([A-Z_][A-Z0-9_]*)\}/gi, (match, key: string) => {
    const upper = key.toUpperCase()
    return Object.prototype.hasOwnProperty.call(values, upper) ? values[upper] : match
  })

  if (!hadS1Placeholder && siteId) {
    const hasQuery = out.includes('?')
    const hasS1Param = /[?&]s1=/i.test(out)
    if (!hasS1Param) {
      out += (hasQuery ? '&' : '?') + `s1=${encodeURIComponent(siteId)}`
    }
  }

  return out
}

// ---------------------------------------------------------------------------
// Weighted rotation pick
// ---------------------------------------------------------------------------

/**
 * Pick an offer_id from a rotation array using cumulative weights.
 * Entries without a weight default to 1. Returns null when the rotation is
 * empty or every entry has a non-positive weight (caller should fall back
 * to slot.offer_id).
 *
 * `rng` is injected so tests are deterministic.
 */
export function pickRotationOffer(
  rotation: RotationEntry[] | null | undefined,
  rng: () => number = Math.random,
): string | null {
  if (!Array.isArray(rotation) || rotation.length === 0) return null

  const cleaned = rotation
    .filter((r): r is RotationEntry => Boolean(r?.offer_id))
    .map((r) => ({ offer_id: r.offer_id, weight: Math.max(0, Number(r.weight ?? 1)) }))

  const total = cleaned.reduce((sum, r) => sum + r.weight, 0)
  if (total <= 0) return null

  const roll = rng() * total
  let cursor = 0
  for (const entry of cleaned) {
    cursor += entry.weight
    if (roll < cursor) return entry.offer_id
  }
  // rounding safety
  return cleaned[cleaned.length - 1].offer_id
}

// ---------------------------------------------------------------------------
// Referrer sniff (fallback source hint)
// ---------------------------------------------------------------------------

const REFERRER_HOSTS: Array<{ host: RegExp; source: string }> = [
  { host: /(^|\.)outbrain\.com$/i,     source: 'outbrain'   },
  { host: /(^|\.)taboola\.com$/i,      source: 'taboola'    },
  { host: /(^|\.)revcontent\.com$/i,   source: 'revcontent' },
  { host: /(^|\.)realizeperf\.com$/i,  source: 'realize'    },
]

/**
 * Infer source from an HTTP Referer when no explicit ?source= or click-id
 * macro was captured. Best-effort — the query string is authoritative.
 */
export function inferSourceFromReferrer(referrer: string | null | undefined): string | null {
  if (!referrer) return null
  try {
    const u = new URL(referrer)
    for (const { host, source } of REFERRER_HOSTS) {
      if (host.test(u.hostname)) return source
    }
  } catch {
    // malformed referer — ignore
  }
  return null
}
