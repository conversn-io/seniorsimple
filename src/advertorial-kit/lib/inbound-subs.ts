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
  // Param names MUST match what the /out router's `captureQueryTracking`
  // reads. The router recognizes `source` (NOT `s2`) as the s2 alias — see
  // router.ts §captureQueryTracking. s4/s5/s6/s8 use canonical names.
  // Writing `s2=` here would land on the URL but be ignored by the router
  // → advertorial_clicks.s2 stays null. Verified against prod behavior.
  const nonEmpty: [string, string][] = []
  if (inbound.s2) nonEmpty.push(['source', inbound.s2])
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

/**
 * Attribution-leak mitigation for in-app browsers that strip query params
 * between first landing and subsequent nav. Middleware stamps this cookie on
 * every /lp/* request that carries at least one inbound sub, so the NEXT
 * request (which may have lost its params) can recover from the cookie.
 *
 * Format: URL-encoded query string containing only the s-slots we care about.
 *   source=taboola&s4=cost_savings&s5=cs_steakgrocery&s7=interrupt&s8=...
 *
 * s7 is included here because it's a legitimate inbound signal from the ad
 * URL (angle-family variant token like "interrupt" or "curiosity"). Once the
 * page hydrates and the split-test picker runs, the picker may write a
 * different s7 onto specific /out hrefs — that per-slot override is fine,
 * the cookie is the fallback when the URL is empty.
 */
export const SS_ATTR_COOKIE = 'ss_attr'
export const SS_ATTR_TTL_DAYS = 30

/**
 * Parse the ss_attr cookie value back into the InboundSubsServer shape
 * (plus s7). Returns EMPTY on any error / malformed value. Never throws.
 */
export function parseSsAttrCookie(
  raw: string | null | undefined,
): InboundSubsServer & { s7: string | null } {
  const empty = { ...EMPTY, s7: null }
  if (!raw) return empty
  try {
    const p = new URLSearchParams(raw)
    const clean = (v: string | null) => {
      if (!v) return null
      const t = v.trim()
      if (!t) return null
      // Same placeholder-guard family as router.ts isPlaceholder().
      if (/^\$.*\$$/.test(t) || /^\{.*\}$/.test(t) || /^__.*__$/.test(t) || /^\[.*\]$/.test(t)) return null
      return t
    }
    return {
      s2: clean(p.get('source')),
      s4: clean(p.get('s4')),
      s5: clean(p.get('s5')),
      s6: clean(p.get('s6')),
      s7: clean(p.get('s7')),
      s8: clean(p.get('s8')),
    }
  } catch {
    return empty
  }
}

/**
 * Build the ss_attr cookie value from the current inbound subs (+ optional s7).
 * Returns null when there's nothing worth persisting.
 */
export function buildSsAttrValue(
  inbound: InboundSubsServer,
  s7: string | null = null,
): string | null {
  const p = new URLSearchParams()
  if (inbound.s2) p.set('source', inbound.s2)
  if (inbound.s4) p.set('s4', inbound.s4)
  if (inbound.s5) p.set('s5', inbound.s5)
  if (inbound.s6) p.set('s6', inbound.s6)
  if (s7)         p.set('s7', s7)
  if (inbound.s8) p.set('s8', inbound.s8)
  const qs = p.toString()
  return qs.length > 0 ? qs : null
}

/**
 * Merge searchParams first-touch subs with a cookie fallback. URL wins per
 * slot when present; cookie fills gaps. This is what page.tsx should call
 * so the SSR /out hrefs get subs even on a params-stripped second nav.
 */
export function mergeInboundSubs(
  fromUrl: InboundSubsServer,
  fromCookie: (InboundSubsServer & { s7: string | null }) | null,
): InboundSubsServer {
  if (!fromCookie) return fromUrl
  return {
    s2: fromUrl.s2 ?? fromCookie.s2,
    s4: fromUrl.s4 ?? fromCookie.s4,
    s5: fromUrl.s5 ?? fromCookie.s5,
    s6: fromUrl.s6 ?? fromCookie.s6,
    s8: fromUrl.s8 ?? fromCookie.s8,
  }
}
