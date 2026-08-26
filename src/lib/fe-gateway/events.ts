/**
 * WO-843 §3B — conversion events.
 *
 * One call site fans out to three destinations so they can never drift:
 *   1. GTM dataLayer  → GA4
 *   2. Meta Pixel     → browser-side, with a shared eventID
 *   3. /api/fe-gateway/event → Supabase ledger + server-side CAPI (same
 *      eventID, so Meta dedupes browser + server into one event)
 *
 * `call_cta_click` is the PRIMARY optimization event — the same one wired for
 * the FET Demand Gen campaign. Every call button on all three gateways fires
 * it. Acceptance criterion 3.
 */

import type { AttributionBundle } from './params';
import type { GatewayId } from './config';

export type FeEventName =
  | 'page_view'
  | 'quiz_start'
  | 'quiz_complete'
  | 'lead_submit'
  | 'call_cta_click';

// NOTE: `window.dataLayer` and `window.fbq` are already declared globally in
// src/lib/tracking.ts (as `any[]` / `any`). Redeclaring them here with tighter
// types would fail the merge — TS requires identical types across augmentations
// of the same interface. So we use the existing globals as-is.

/** Meta standard-event mapping. Custom names stay custom. */
const META_EVENT: Partial<Record<FeEventName, string>> = {
  lead_submit: 'Lead',
  call_cta_click: 'Contact',
};

export interface FeEventPayload {
  event: FeEventName;
  gateway: GatewayId;
  bundle: AttributionBundle;
  /** Extra dimensions — quiz step, resolved number, segment, etc. */
  detail?: Record<string, unknown>;
  /** Contact fields, C only. Hashed server-side before reaching Meta. */
  contact?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    state?: string;
    zipCode?: string;
  };
}

function newEventId(event: string, visitorId: string): string {
  const rand =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10);
  return `${event}_${visitorId}_${Date.now().toString(36)}_${rand}`;
}

/**
 * Fire an event to all three destinations.
 *
 * Returns the eventId so a caller can correlate. Never throws and never
 * blocks navigation — the server POST uses `keepalive` so it survives the
 * page teardown that a tel: tap can trigger on iOS.
 */
export function trackFeEvent(payload: FeEventPayload): string {
  const { event, gateway, bundle, detail = {}, contact } = payload;
  const eventId = newEventId(event, bundle.visitorId);

  if (typeof window === 'undefined') return eventId;

  // 1. GTM / GA4
  try {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event,
      fe_gateway: gateway,
      fe_event_id: eventId,
      fe_visitor_id: bundle.visitorId,
      ...bundle.params,
      ...detail,
    });
  } catch {
    /* analytics must never break the page */
  }

  // 2. Meta Pixel (browser side of the dedup pair)
  try {
    const metaName = META_EVENT[event];
    if (metaName && typeof window.fbq === 'function') {
      window.fbq(
        'track',
        metaName,
        { content_name: `fe_gateway_${gateway}`, ...detail },
        { eventID: eventId },
      );
    }
  } catch {
    /* ditto */
  }

  // 3. Supabase ledger + server-side CAPI
  try {
    const body = JSON.stringify({
      event,
      gateway,
      eventId,
      visitorId: bundle.visitorId,
      params: bundle.params,
      landingUrl: bundle.landingUrl,
      referrer: bundle.referrer,
      pageUrl: window.location.href,
      detail,
      contact,
    });

    // keepalive so an iOS tel: handoff can't cancel the request mid-flight.
    void fetch('/api/fe-gateway/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
    }).catch(() => {
      /* beacon semantics — no retry, no surfacing */
    });
  } catch {
    /* ditto */
  }

  return eventId;
}
