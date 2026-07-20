/**
 * Server-side inbound-subs reader.
 *
 * Mirrors the client-side `readInboundSubs()` in analytics.ts so we capture
 * the SAME aliases (source / hook / placement / audience / network click-id
 * macros) at SSR time. The point: bake s2/s4/s5/s6/s8 into every /out href
 * that the page emits so paid traffic's `?source=<network>&s4=<angle>` lands
 * in `advertorial_clicks` for per-network / per-angle ROAS, without waiting
 * on JS to hydrate.
 *
 * Router (`captureQueryTracking`) already accepts these param names on the
 * /out request — so if we put them on the href, they roll into the click row.
 *
 * Only NON-EMPTY, non-macro-placeholder subs are returned. `$ANYTHING$`
 * bracketed values are network macros the platform didn't substitute — we
 * treat them as absent per the client-side reader's `!/^\$.*\$$/` guard.
 */

export interface InboundSubsServer {
  s2: string | null   // source / network
  s4: string | null   // hook / angle
  s5: string | null   // creative
  s6: string | null   // placement / audience
  s8: string | null   // network click id (ob_click_id, tblci, rcid, realize_click_id)
}

const EMPTY: InboundSubsServer = { s2: null, s4: null, s5: null, s6: null, s8: null }

/**
 * Read inbound subs from Next.js server-component `searchParams` (a record
 * where each value may be a string, string[], or undefined). Same alias
 * priority as the client-side reader.
 *
 * s7 (variant) is deliberately NOT captured here — that's owned by the
 * split-test picker (variant.ts) and flows onto /out via the `variant`
 * param separately. Adding s7 here would double-write and could conflict
 * with a `?variant=` override.
 *
 * click_id (sub1) is also skipped — it's assigned per-click by the /out
 * router, never propagated from the LP URL.
 */
export function readInboundSubsFromSearchParams(
  searchParams: Record<string, string | string[] | undefined> | null | undefined,
): InboundSubsServer {
  if (!searchParams) return EMPTY

  const first = (...keys: string[]): string | null => {
    for (const k of keys) {
      const raw = searchParams[k]
      const value = Array.isArray(raw) ? raw[0] : raw
      if (typeof value !== 'string') continue
      const trimmed = value.trim()
      if (!trimmed) continue
      if (/^\$.*\$$/.test(trimmed)) continue // unsubstituted network macro
      return trimmed
    }
    return null
  }

  return {
    s2: first('source', 's2'),
    s4: first('s4', 'hook'),
    s5: first('s5', 'creative'),
    s6: first('s6', 'placement', 'audience'),
    s8: first('s8', 'ob_click_id', 'tblci', 'rcid', 'realize_click_id'),
  }
}

/**
 * Append every non-null inbound sub to a URL as a canonical `s?=<value>`
 * param. Preserves any existing query string on the input URL; skips subs
 * that are null or already set on the URL (so a caller can't accidentally
 * clobber `component`, `variant`, etc.).
 *
 * Relative URLs supported (that's what /out hrefs are); absolute would work
 * too via the same string-concat rule, but we don't need it here.
 */
export function appendInboundSubs(
  url: string,
  inbound: InboundSubsServer | null | undefined,
): string {
  if (!inbound) return url
  const nonEmpty: [string, string][] = []
  if (inbound.s2) nonEmpty.push(['s2', inbound.s2])
  if (inbound.s4) nonEmpty.push(['s4', inbound.s4])
  if (inbound.s5) nonEmpty.push(['s5', inbound.s5])
  if (inbound.s6) nonEmpty.push(['s6', inbound.s6])
  if (inbound.s8) nonEmpty.push(['s8', inbound.s8])
  if (nonEmpty.length === 0) return url

  // Don't clobber params the caller already set on the URL (component,
  // variant, source_id, etc.). We only add the sub keys that aren't there.
  const [path, existingQs = ''] = url.split('?')
  const existing = new URLSearchParams(existingQs)
  for (const [key, value] of nonEmpty) {
    if (!existing.has(key)) existing.set(key, value)
  }
  const qs = existing.toString()
  return qs ? `${path}?${qs}` : path
}
