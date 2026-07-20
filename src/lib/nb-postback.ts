// nb-postback — server-side helper that fires a submit_form / purchase /
// initiate_checkout event to the CRM's native-postback-ingest edge fn.
// Called from the lead API routes (/api/leads/*). Fire-and-forget: never
// throws, never blocks the API response. Silently no-ops if the visitor has
// no cr_click_id cookie (means they didn't arrive via a tracked ad).
//
// The tracker library (src/lib/callready-tracker/index.ts) writes the two
// cookies on landing:
//   cr_click_id     — the network's echoed click id (nvss_… for NewsBreak)
//   cr_s2_network   — canonical network slug (newsbreak / taboola / mgid / …)
//
// Corresponds to §3 of 00 - Reports/2026-07-17_native-conversion-tracking-go-live.md

import type { NextRequest } from 'next/server';

const RECEIVER_URL =
  'https://jqjftrlnyysqcwbbigpw.supabase.co/functions/v1/native-postback-ingest';

export type NbEvent = 'submit_form' | 'purchase' | 'initiate_checkout';

export type NbPostbackMeta = {
  /** USD revenue attached to a purchase. */
  payout?: number;
  /** Stable id to dedupe re-fires (typically sessionId or leadId). */
  order_id?: string;
};

/**
 * Fire a conversion event to native-postback-ingest based on the click_id
 * cookie the tracker set on landing.
 *
 * Fire-and-forget. Never throws; never blocks the caller. On any error
 * (missing cookie, missing secret, network failure) it just logs + returns.
 *
 * Call and forget:
 *   fireNbPostback(request, 'submit_form', { order_id: sessionId }).catch(() => {});
 */
export async function fireNbPostback(
  request: NextRequest,
  event: NbEvent,
  meta: NbPostbackMeta = {},
): Promise<void> {
  const click_id   = request.cookies.get('cr_click_id')?.value;
  const s2_network = request.cookies.get('cr_s2_network')?.value;
  if (!click_id || !s2_network) return;  // visitor didn't arrive via a tracked ad

  const secret = process.env.NATIVE_POSTBACK_SECRET_OWN_CHECKOUT;
  if (!secret) {
    console.warn('[nb-postback] NATIVE_POSTBACK_SECRET_OWN_CHECKOUT not set — skipping');
    return;
  }

  const params = new URLSearchParams({
    source: 'own_checkout',
    secret,
    event,
    click_id,
    s2_network,
  });
  if (meta.payout != null) params.set('payout', String(meta.payout));
  if (meta.order_id)       params.set('transaction_id', meta.order_id);

  try {
    const res = await fetch(`${RECEIVER_URL}?${params.toString()}`, {
      method: 'POST',
      // Server-side call, no cookies to forward. Explicit no-store so any
      // upstream fetch cache doesn't intern this.
      cache: 'no-store',
    });
    if (!res.ok) {
      const body = await res.text();
      console.warn(`[nb-postback] receiver ${res.status}`, body.slice(0, 300));
    }
  } catch (err) {
    console.warn('[nb-postback] fetch failed:', (err as Error).message);
  }
}
