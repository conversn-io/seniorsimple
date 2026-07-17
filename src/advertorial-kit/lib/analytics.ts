/**
 * Kit analytics — client-side helpers to fire events into the same
 * /api/analytics/track-event endpoint the legacy LpPage uses so reporting
 * unifies across kit + legacy slugs.
 *
 * Event schema (matches legacy):
 *   { event_name, session_id, user_id, page_url, referrer, user_agent,
 *     event_category: 'advertorial', event_label, properties }
 *
 * Kit adds these properties on top of the legacy shape (all optional, safe
 * to consume downstream):
 *   s1=brand, s2=source, s3=component, s4=angle, s5=creative,
 *   s6=placement, s7=variant, s8=network_click_id, component_type
 *
 * Never contains PII by construction — same tokens the /out router uses.
 */

// SSR-safe wrapper that returns null on the server (module can be imported
// from client-only wrappers without SSR errors from window/document/nav access).
const isBrowser = () =>
  typeof window !== 'undefined' && typeof document !== 'undefined'

const SESSION_STORAGE_KEY = 'session_id'

export function getOrCreateSessionId(): string {
  if (!isBrowser()) return ''
  try {
    const existing = sessionStorage.getItem(SESSION_STORAGE_KEY)
    if (existing) return existing
    const fresh = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`
    sessionStorage.setItem(SESSION_STORAGE_KEY, fresh)
    return fresh
  } catch {
    // Storage disabled — fall through to volatile id per pageview.
    return `sess_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`
  }
}

/**
 * Sub-scheme fields captured from the CURRENT page's URL. s2..s8 semantics
 * match router.ts §W6 canonical taxonomy. s1 (brand) and s3 (component) come
 * from server state, so they're passed in explicitly by the render.
 */
export interface InboundSubs {
  s2: string | null   // source
  s4: string | null   // angle / hook variant
  s5: string | null   // creative
  s6: string | null   // placement / geo
  s7: string | null   // variant (also read from cookie in W3)
  s8: string | null   // network click id
  click_id: string | null   // legacy alias for sub1 UUID / RevContent click id
  widget_id: string | null  // legacy RevContent widget_id
}

export function readInboundSubs(): InboundSubs {
  if (!isBrowser()) {
    return { s2: null, s4: null, s5: null, s6: null, s7: null, s8: null, click_id: null, widget_id: null }
  }
  const qp = new URLSearchParams(window.location.search)
  const first = (...keys: string[]): string | null => {
    for (const k of keys) {
      const v = qp.get(k)
      if (v && v.trim() && !/^\$.*\$$/.test(v.trim())) return v.trim()
    }
    return null
  }
  return {
    s2: first('source', 's2'),
    s4: first('s4', 'hook'),
    s5: first('s5', 'creative'),
    s6: first('s6', 'placement', 'audience'),
    s7: first('s7', 'variant'),
    s8: first('s8', 'ob_click_id', 'tblci', 'rcid', 'realize_click_id'),
    click_id: first('click_id', 'clickid', 'sub1'),
    widget_id: first('widget_id', 'sub2'),
  }
}

/**
 * Common properties every kit event carries so reporting can slice by
 * brand / slug / variant without inspecting `properties` further.
 */
export interface KitEventCommon {
  site_key: string          // 'seniorsimple.org' — matches legacy site_key value
  brand: string             // s1 — the property env's ADVERTORIAL_SITE_ID (site_id)
  slug: string
  component_type?: string | null
  variant?: string | null
}

export interface KitEventOptions {
  sessionId?: string
  eventLabel?: string
  extraProps?: Record<string, unknown>
}

/**
 * Fire a kit analytics event.
 *
 *   1. GA4 (if gtag is available) — event_category='advertorial'
 *   2. POST /api/analytics/track-event — session-tracked, joined with legacy
 *      LpPage events downstream.
 *
 * Best-effort; never throws. Never blocks the user's click / navigation.
 */
export function fireKitEvent(
  eventName: string,
  common: KitEventCommon,
  opts: KitEventOptions = {},
): void {
  if (!isBrowser()) return

  const sessionId = opts.sessionId ?? getOrCreateSessionId()
  const inbound = readInboundSubs()

  const properties = {
    site_key: common.site_key,
    slug: common.slug,
    brand: common.brand,
    s1: common.brand,
    s2: inbound.s2,
    s3: common.component_type ?? null,
    s4: inbound.s4,
    s5: inbound.s5,
    s6: inbound.s6,
    s7: common.variant ?? inbound.s7,
    s8: inbound.s8,
    click_id: inbound.click_id,
    widget_id: inbound.widget_id,
    component_type: common.component_type ?? null,
    variant: common.variant ?? inbound.s7,
    ...opts.extraProps,
  }

  // 1. GA4
  const gtag = (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag
  if (typeof gtag === 'function') {
    try {
      gtag('event', eventName, {
        page_title: document.title,
        page_location: window.location.href,
        page_path: window.location.pathname,
        event_category: 'advertorial',
        ...properties,
      })
    } catch {
      // GA4 configuration bug on the page — never our problem to reveal.
    }
  }

  // 2. Supabase via /api/analytics/track-event
  try {
    void fetch('/api/analytics/track-event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      keepalive: true,   // survives an in-flight navigation on CTA click
      body: JSON.stringify({
        event_name: eventName,
        properties,
        session_id: sessionId,
        user_id: sessionId,
        page_url: window.location.href,
        referrer: document.referrer,
        user_agent: navigator.userAgent,
        event_category: 'advertorial',
        event_label: opts.eventLabel ?? eventName,
      }),
    }).catch(() => {
      /* non-blocking */
    })
  } catch {
    /* non-blocking */
  }
}

export const SITE_KEY = 'seniorsimple.org'
