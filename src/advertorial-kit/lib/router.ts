/**
 * Pure helpers for the /out/[slug]/[slot] click router.
 *
 * Split from the route handler so we can unit-test the parts that matter
 * (macro capture, sub_id encoding, template substitution, weighted rotation
 * pick) without spinning up Supabase or Next.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * CANONICAL s1..s8 TAXONOMY (Phase 3 W6, 2026-07-17)
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   s1 = brand              — site_id (server-set from advertorial.site_id)
 *   s2 = source             — network source (prismique, revcontent, mgid, …)
 *                             from ?source= or inferred from macro/referrer
 *   s3 = component          — component_type at the CTA site
 *                             (image_quiz, state_selector, editors_pick,
 *                              listicle_entry, savings_calculator, wrap_up, …)
 *                             from ?component= appended by the item render
 *   s4 = angle              — hook / headline variant   (?s4 or ?hook)
 *   s5 = creative           — creative / image variant  (?s5 or ?creative)
 *   s6 = placement          — placement / geo segment   (?s6 or ?placement or ?audience)
 *   s7 = variant            — split-test variant id
 *                             from ?variant= appended by the item render
 *   s8 = network_click_id   — the network's echoed click_id
 *                             (?s8 or ob_click_id / tblci / rcid / realize_click_id)
 *
 * Reconciliation keys NOT in the s-slots:
 *   sub1 = <click_id>       — our advertorial_clicks.id UUID (Prismique convention)
 *   sub2 = <sub_id>         — compact encoded taxonomy string (below)
 *   slug + slot_key         — live in sub_id (encoded), not top-level slots
 *
 * s1 + s3 + s7 come from server state (untamperable at the network).
 * s2 + s4..s6 + s8 come from the ad's query string or the CTA URL.
 * sub_id is compact "s1=…|s2=…|slug=…|slot=…|component=…|variant=…" — never PII.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface RotationEntry {
  offer_id: string
  weight?: number
}

export interface SParams {
  s1?: string | null   // brand
  s2?: string | null   // source
  s3?: string | null   // component
  s4?: string | null   // angle
  s5?: string | null   // creative
  s6?: string | null   // placement / geo
  s7?: string | null   // variant
  s8?: string | null   // network_click_id
}

/**
 * Full captured tracking. Semantics per the taxonomy at the top of the file.
 * `source` is a legacy alias for `s2` — kept on the type only for the encoder
 * so historical `src=…` keys in old sub_id strings remain readable. Prefer s2.
 */
export interface CapturedTracking extends SParams {
  source: string | null
}

/**
 * Reconciliation-only fields — travel in sub_id, not in s-slots.
 */
export interface ReconciliationKeys {
  slug: string
  slotKey: number | string
}

// ---------------------------------------------------------------------------
// Native network click-id macros → source inference
// ---------------------------------------------------------------------------

const NETWORK_CLICK_ID_KEYS: Array<{ key: string; source: string }> = [
  { key: 'ob_click_id',      source: 'outbrain'   },
  { key: 'tblci',            source: 'taboola'    },
  { key: 'rcid',             source: 'revcontent' },
  { key: 'realize_click_id', source: 'realize'    },
  { key: 'newsbreak_cid',    source: 'newsbreak'  },
  { key: 'nb_click_id',      source: 'newsbreak'  },
  { key: 'nbclid',           source: 'newsbreak'  },
  { key: 'mgid_click_id',    source: 'mgid'       },
  { key: 'mgclid',           source: 'mgid'       },
]

// A native macro that never got substituted is worthless — treat it as absent so
// we don't log/send literal template strings. Covers:
//   $foo$        (Outbrain / older Taboola)
//   {foo}        (Taboola / RevContent / MGID)
//   __FOO__      (NewsBreak / TikTok)
//   [foo]        (some Everflow variants)
function isPlaceholder(value: string | null | undefined): boolean {
  if (!value) return true
  const v = value.trim()
  return (
    /^\$.*\$$/.test(v) ||       // $ob_click_id$
    /^\{.*\}$/.test(v) ||       // {click_id}
    /^__.*__$/.test(v) ||       // __CALLBACK_PARAM__
    /^\[.*\]$/.test(v)          // [click_id]
  )
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
 * Extract query-supplied slots (s2 source, s4 angle, s5 creative, s6 placement,
 * s7 variant, s8 network_click_id) from the /out request's URL. s1 (brand) and
 * s3 (component) are supplied separately by the caller (server state) — see
 * `assembleTracking`.
 */
export function captureQueryTracking(params: URLSearchParams): {
  source: string | null
  s4: string | null
  s5: string | null
  s6: string | null
  s7: string | null
  s8: string | null
} {
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

  return {
    source,
    s4: firstReal(params.get('s4'), params.get('hook')),
    s5: firstReal(params.get('s5'), params.get('creative')),
    s6: firstReal(params.get('s6'), params.get('placement'), params.get('audience')),
    s7: firstReal(params.get('s7'), params.get('variant')),
    s8,
  }
}

/**
 * Assemble the full CapturedTracking record from server state + query capture.
 * Server-set fields (brand, component) are always trusted; query-supplied
 * fields fall through the placeholder/emptiness guard already.
 */
export function assembleTracking(input: {
  brand: string                                // s1
  component: string | null                     // s3
  queryCapture: ReturnType<typeof captureQueryTracking>
}): CapturedTracking {
  const { brand, component, queryCapture } = input
  return {
    s1: brand,
    s2: queryCapture.source,
    s3: component,
    s4: queryCapture.s4,
    s5: queryCapture.s5,
    s6: queryCapture.s6,
    s7: queryCapture.s7,
    s8: queryCapture.s8,
    source: queryCapture.source,
  }
}

// ---------------------------------------------------------------------------
// Sub_id encoding (sent as sub2 to the network for reconciliation)
// ---------------------------------------------------------------------------

/**
 * Encode the s-string + reconciliation keys. Compact `k=v` pairs joined by `|`
 * so a single field carries the whole taxonomy without conflicting with
 * URL-encoded delimiters.
 *
 * slug + slot_key are included as `slug=` and `slot=` for reconciliation — they
 * are NOT top-level s-slots in the current taxonomy, but the sub_id must carry
 * them so we can join click rows back to the DB row that produced them.
 *
 * Empty / placeholder values are omitted. Never contains PII by construction —
 * only server-controlled tokens or ad-parameter values.
 */
export function encodeSubId(
  tracking: CapturedTracking,
  recon?: ReconciliationKeys,
): string {
  const parts: string[] = []
  const pushIf = (k: string, v: string | number | null | undefined) => {
    if (v === null || v === undefined) return
    const s = String(v)
    if (!s.length) return
    if (isPlaceholder(s)) return
    parts.push(`${k}=${encodeURIComponent(s)}`)
  }
  pushIf('s1', tracking.s1)
  pushIf('s2', tracking.s2)
  pushIf('s3', tracking.s3)
  pushIf('s4', tracking.s4)
  pushIf('s5', tracking.s5)
  pushIf('s6', tracking.s6)
  pushIf('s7', tracking.s7)
  pushIf('s8', tracking.s8)
  if (recon) {
    pushIf('slug', recon.slug)
    pushIf('slot', recon.slotKey)
  }
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
 * append `s1=<siteId>` so the network still receives the brand tag even when
 * the offer's tracking template was authored before this convention landed.
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

// ---------------------------------------------------------------------------
// Back-compat re-export (transitional — remove after callers migrate)
// ---------------------------------------------------------------------------

/**
 * @deprecated Use `captureQueryTracking` + `assembleTracking`. Kept only so
 * external callers (if any) don't break on upgrade. The returned shape maps
 * old s-slot semantics to the new ones: old s7 (campaign_id) is dropped;
 * new s7 (variant) comes from the query as `?variant=` or `?s7=`.
 */
export function captureTracking(
  params: URLSearchParams,
): Omit<CapturedTracking, 's1' | 's2' | 's3'> {
  const q = captureQueryTracking(params)
  return { s4: q.s4, s5: q.s5, s6: q.s6, s7: q.s7, s8: q.s8, source: q.source }
}
