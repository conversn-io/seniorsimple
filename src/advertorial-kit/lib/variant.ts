/**
 * W3 — Split-test wiring for kit-native slugs.
 *
 * Given
 *   - `seed`: sticky per-visitor UUID from the `ss_kit_seed` cookie (stamped
 *     by middleware on the first /lp/* hit)
 *   - `slug`: the advertorial slug — mixed into the hash so different slugs
 *     assign independently for the same visitor
 *   - `weights`: the advertorial's `variants` jsonb ({ [key]: number })
 *
 * this picks a variant key deterministically. Same (seed, slug, weights) →
 * same key on every request until the visitor's seed rotates. If the URL
 * carries a `?variant=<key>` override and the key is present in `weights`,
 * that wins — for QA and paid-deep-linking without polluting the sticky
 * assignment.
 *
 * Weights are relative positive numbers. Zero-weight keys are treated as
 * "declared but paused" — still valid targets for `?variant=` overrides so
 * PS-00 can preview a paused variant, but never chosen automatically.
 */

/** FNV-1a 32-bit — stable across Node/edge/browser, no deps, deterministic. */
export function hashFnv1a(input: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i)
    // eslint-disable-next-line no-bitwise
    h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0
  }
  return h >>> 0
}

export interface PickVariantInput {
  slug: string
  seed: string | null | undefined
  /** Raw `advertorials.variants` jsonb — may be null, {}, or object. */
  weights: Record<string, unknown> | null | undefined
  /** Optional `?variant=<key>` from the request URL. */
  queryOverride?: string | null | undefined
}

export interface PickVariantResult {
  /** The chosen variant key, or null when no split-test is configured. */
  variant: string | null
  /** How the pick was made — for logging/debugging, never for security. */
  source: 'none' | 'override' | 'sticky' | 'fallback'
  /** The normalized weights the picker actually used. */
  normalized: Record<string, number>
}

/**
 * Normalize a raw `variants` map to positive-number weights. Invalid entries
 * (non-number, negative, NaN) are dropped rather than throwing so a
 * mis-typed row in the DB degrades to the remaining valid variants instead
 * of nuking the whole page.
 */
export function normalizeWeights(
  raw: Record<string, unknown> | null | undefined,
): Record<string, number> {
  if (!raw || typeof raw !== 'object') return {}
  const out: Record<string, number> = {}
  for (const [key, value] of Object.entries(raw)) {
    if (typeof key !== 'string' || key.length === 0) continue
    const n = typeof value === 'number' ? value : Number(value)
    if (!Number.isFinite(n) || n < 0) continue
    out[key] = n
  }
  return out
}

export function pickVariant(input: PickVariantInput): PickVariantResult {
  const normalized = normalizeWeights(input.weights)
  const keys = Object.keys(normalized)

  // No split-test configured — kit renders "control" (a single variant with
  // no key). Downstream: items with any variant_key are hidden (they can't
  // possibly belong to a variant that isn't declared).
  if (keys.length === 0) {
    return { variant: null, source: 'none', normalized }
  }

  // Query override wins — but only if the requested key exists in weights.
  // We accept zero-weight keys here on purpose: PS-00 wants to preview a
  // paused variant without flipping its weight.
  if (input.queryOverride && Object.prototype.hasOwnProperty.call(normalized, input.queryOverride)) {
    return { variant: input.queryOverride, source: 'override', normalized }
  }

  const total = keys.reduce((sum, k) => sum + normalized[k], 0)
  if (total <= 0) {
    // All variants declared with weight 0. Fallback: alphabetically first
    // key — deterministic, still testable, but PS-00's intent is clearly
    // "paused" so we log at the caller (source='fallback').
    const first = [...keys].sort()[0]
    return { variant: first, source: 'fallback', normalized }
  }

  // Sticky assignment: fold seed + slug through FNV-1a → bucket in
  // [0, total). Weight order is `Object.keys` order — which for jsonb is
  // insertion order per the PostgreSQL JSON spec, stable for a given row.
  const seed = (input.seed && input.seed.length > 0 ? input.seed : 'unseeded').trim()
  const bucket = hashFnv1a(`${seed}::${input.slug}`) % Math.max(1, total)

  let cursor = 0
  for (const key of keys) {
    const w = normalized[key]
    if (w <= 0) continue
    cursor += w
    if (bucket < cursor) {
      return { variant: key, source: 'sticky', normalized }
    }
  }

  // Unreachable when total > 0 and at least one weight > 0.
  const first = keys[0]
  return { variant: first, source: 'fallback', normalized }
}

/**
 * Predicate for filtering `advertorial_items` rows against the chosen variant.
 *
 *   variant_key IS NULL                → renders in every variant (shared item)
 *   variant_key = chosen               → renders only for the current variant
 *   otherwise                          → hidden this request
 *
 * When no split-test is configured (chosen === null), only NULL variant_key
 * items render — a stray variant-scoped item can't survive without a
 * declared variant, which is a data-hygiene bug PS-00 should see and fix.
 */
export function itemMatchesVariant(
  itemVariantKey: string | null | undefined,
  chosen: string | null,
): boolean {
  if (!itemVariantKey) return true
  return itemVariantKey === chosen
}
