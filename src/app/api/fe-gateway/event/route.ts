/**
 * WO-843 §3B/§3D — FE gateway event ledger + server-side CAPI.
 *
 * POST /api/fe-gateway/event
 *
 * Writes one `analytics_events` row per event and, for the two conversion
 * events, fires the server half of the Meta dedup pair using the SAME eventId
 * the browser pixel used.
 *
 * Beacon semantics: always answers 202 as long as the body parses. The client
 * sends this with `keepalive` during a tel: handoff and cannot retry, so we
 * absorb noise and log failures rather than surfacing errors.
 *
 * NOTE: lead CREATION for Gateway C lives in /api/fe-gateway/lead — this route
 * only ledgers the `lead_submit` event and fires its CAPI counterpart.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  sendMetaCAPIEvent,
  createCustomEvent,
  buildUserData,
  getMetaPixelIdForFunnel,
} from '@/lib/meta-capi-service';
import { GATEWAYS, type GatewayId } from '@/lib/fe-gateway/config';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ALLOWED_EVENTS = new Set([
  'page_view',
  'quiz_start',
  'quiz_complete',
  'lead_submit',
  'call_cta_click',
]);

/** Events that get a server-side CAPI counterpart, and their Meta names. */
const CAPI_EVENTS: Record<string, string> = {
  call_cta_click: 'Contact',
  lead_submit: 'Lead',
};

const SITE_KEY = 'seniorsimple.org';

interface Body {
  event?: string;
  gateway?: string;
  eventId?: string;
  visitorId?: string;
  params?: Record<string, string>;
  landingUrl?: string;
  referrer?: string;
  pageUrl?: string;
  detail?: Record<string, unknown>;
  contact?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    state?: string;
    zipCode?: string;
  };
}

function clientIp(req: NextRequest): string | null {
  const fwd = req.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  return req.headers.get('x-real-ip');
}

export async function POST(req: NextRequest) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ ok: false, error: 'bad_json' }, { status: 202 });
  }

  const { event, gateway, eventId, visitorId } = body;

  if (!event || !ALLOWED_EVENTS.has(event)) {
    return NextResponse.json({ ok: false, error: 'bad_event' }, { status: 202 });
  }
  if (!gateway || !(gateway in GATEWAYS)) {
    return NextResponse.json({ ok: false, error: 'bad_gateway' }, { status: 202 });
  }

  const meta = GATEWAYS[gateway as GatewayId];
  const params = body.params ?? {};
  const ip = clientIp(req);
  const ua = (req.headers.get('user-agent') || '').slice(0, 500);

  /* ---------------- 1. Supabase ledger ---------------- */

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  // Service role: RLS is on and the anon key silently drops inserts.
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (url && key) {
    try {
      const supabase = createClient(url, key, { auth: { persistSession: false } });
      const { error } = await supabase.from('analytics_events').insert({
        event_name: event,
        event_category: 'fe_gateway',
        event_label: meta.path,
        session_id: visitorId ?? null,
        page_url: body.pageUrl ?? meta.path,
        referrer: body.referrer ?? null,
        user_agent: ua || null,
        // utm_* get their own columns AND stay in properties, so a query can
        // use either without a join.
        utm_source: params.utm_source ?? null,
        utm_medium: params.utm_medium ?? null,
        utm_campaign: params.utm_campaign ?? null,
        utm_term: params.utm_term ?? null,
        utm_content: params.utm_content ?? null,
        properties: {
          site_key: SITE_KEY,
          gateway: meta.id,
          gateway_label: meta.label,
          funnel_type: meta.funnelType,
          event_id: eventId ?? null,
          visitor_id: visitorId ?? null,
          landing_url: body.landingUrl ?? null,
          // The full inbound param bundle — this is what acceptance
          // criterion 2 is verified against.
          tracking_params: params,
          detail: body.detail ?? {},
        },
      });
      if (error) console.warn('[fe-gateway/event] ledger insert failed', error.message);
    } catch (err) {
      console.warn('[fe-gateway/event] ledger threw', err);
    }
  } else {
    console.warn('[fe-gateway/event] missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  }

  /* ---------------- 2. Server-side CAPI ---------------- */

  const metaEventName = CAPI_EVENTS[event];
  if (metaEventName && eventId) {
    try {
      const c = body.contact ?? {};
      const userData = buildUserData({
        email: c.email ?? null,
        phone: c.phone ?? null,
        first_name: c.firstName ?? null,
        last_name: c.lastName ?? null,
        state: c.state ?? null,
        zip_code: c.zipCode ?? null,
        ip_address: ip,
        user_agent: ua || null,
        external_id: visitorId ?? null,
        fbc: params.fbclid ? `fb.1.${Date.now()}.${params.fbclid}` : null,
      });

      const capiEvent = createCustomEvent({
        eventName: metaEventName,
        leadId: visitorId ?? eventId,
        userData,
        customData: {
          content_name: `fe_gateway_${meta.id}`,
          content_category: 'final_expense',
          ...(body.detail ?? {}),
        },
        eventSourceUrl: body.pageUrl ?? undefined,
      });

      // Force the browser-generated id so Meta dedupes the pixel + CAPI pair.
      capiEvent.event_id = eventId;

      const result = await sendMetaCAPIEvent(capiEvent, {
        pixelId: getMetaPixelIdForFunnel(meta.funnelType),
      });
      if (!result.success) {
        console.warn(`[fe-gateway/event] CAPI ${metaEventName} failed:`, result.error);
      }
    } catch (err) {
      console.warn('[fe-gateway/event] CAPI threw', err);
    }
  }

  return NextResponse.json({ ok: true, eventId: eventId ?? null }, { status: 202 });
}
