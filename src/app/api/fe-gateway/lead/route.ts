/**
 * WO-843 §2C.5 — Gateway C lead capture.
 *
 * POST /api/fe-gateway/lead
 *
 * Gateway C is the only gateway that captures a lead. The captured contact
 * becomes a callback list when the visitor never dials or the call does not
 * connect — which is the whole reason C exists as a distinct architecture.
 *
 * Pipeline: validate → insert `leads` → push GHL (SeniorSimple sub-account,
 * the same FE webhook the existing FE quiz uses) → return leadId. The CAPI
 * `Lead` fire is handled by /api/fe-gateway/event with the browser's eventId
 * so the pixel + server pair dedupes; this route does not fire it again.
 *
 * Unlike the event beacon, this one returns real status codes — the form
 * needs to know whether to advance.
 */

import { NextRequest, NextResponse } from 'next/server';
import { callreadyQuizDb } from '@/lib/callready-quiz-db';

import { GATEWAYS } from '@/lib/fe-gateway/config';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const FE_GHL_WEBHOOK =
  process.env.final_expense_GHL_webhook ||
  process.env.annuity_GHL_webhook ||
  'https://services.leadconnectorhq.com/hooks/vTM82D7FNpIlnPgw6XNC/webhook-trigger/28ef726d-7ead-4cd2-aa85-dfc6192adfb6';

const SITE_KEY = 'seniorsimple.org';
const META = GATEWAYS.c;

interface Body {
  visitorId?: string;
  segment?: string;
  answers?: Record<string, string>;
  contact?: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    email?: string;
    state?: string;
  };
  consent?: boolean;
  consentText?: string;
  params?: Record<string, string>;
  landingUrl?: string;
  referrer?: string;
  pageUrl?: string;
}

/** US 10-digit → +1XXXXXXXXXX. Returns null if it isn't a plausible US number. */
function toE164(raw: string | undefined): string | null {
  if (!raw) return null;
  const d = raw.replace(/\D/g, '');
  const ten = d.length === 11 && d.startsWith('1') ? d.slice(1) : d;
  if (ten.length !== 10) return null;
  // NANP: area code and exchange cannot start with 0 or 1.
  if (/^[01]/.test(ten) || /^[01]/.test(ten.slice(3))) return null;
  return `+1${ten}`;
}

function isEmail(raw: string | undefined): boolean {
  return !!raw && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(raw);
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
    return NextResponse.json({ ok: false, error: 'bad_json' }, { status: 400 });
  }

  const c = body.contact ?? {};
  const phone = toE164(c.phone);

  /* ---------------- Validation ---------------- */

  if (!c.firstName?.trim()) {
    return NextResponse.json({ ok: false, error: 'first_name_required' }, { status: 400 });
  }
  if (!phone) {
    return NextResponse.json({ ok: false, error: 'invalid_phone' }, { status: 400 });
  }
  if (!isEmail(c.email)) {
    return NextResponse.json({ ok: false, error: 'invalid_email' }, { status: 400 });
  }
  // TCPA: express written consent is not optional on this form. A submit
  // without it is refused outright rather than stored unconsented.
  if (body.consent !== true) {
    return NextResponse.json({ ok: false, error: 'consent_required' }, { status: 400 });
  }

  // CRM, not CMS. `leads` lives in the CallReady CRM project
  // (jqjftrlnyysqcwbbigpw) — the same client the existing FE quiz submit path
  // uses. NEXT_PUBLIC_SUPABASE_URL points at the CMS project, where this table
  // does not exist. callreadyQuizDb is service-role, which RLS requires.
  const params = body.params ?? {};
  const visitorId = body.visitorId || `fev_${Date.now().toString(36)}`;
  const leadId = `fe_c_${visitorId}_${Date.now().toString(36)}`;
  const answers = body.answers ?? {};

  /* ---------------- 1. Insert lead ---------------- */

  const { data: lead, error } = await callreadyQuizDb
    .from('leads')
    .insert({
      lead_id: leadId,
      site_key: SITE_KEY,
      funnel_type: META.funnelType,
      session_id: visitorId,
      contact: {
        firstName: c.firstName?.trim(),
        lastName: c.lastName?.trim() ?? null,
        email: c.email?.trim().toLowerCase(),
        phone,
      },
      quiz_answers: { ...answers, segment: body.segment ?? null },
      state: c.state ?? null,
      // Express written TCPA consent, captured with the exact text shown.
      consent: true,
      status: 'new',
      landing_page: body.landingUrl ?? META.path,
      entry_url: body.landingUrl ?? null,
      entry_referrer: body.referrer ?? null,
      referrer: body.referrer ?? null,
      utm_source: params.utm_source ?? null,
      utm_medium: params.utm_medium ?? null,
      utm_campaign: params.utm_campaign ?? null,
      utm_term: params.utm_term ?? null,
      utm_content: params.utm_content ?? null,
      entry_utm_source: params.utm_source ?? null,
      entry_utm_medium: params.utm_medium ?? null,
      entry_utm_campaign: params.utm_campaign ?? null,
      ip_address: clientIp(req),
      attribution_source: 'fe_gateway_c',
      fb_data: {
        fbclid: params.fbclid ?? null,
        // Full inbound bundle travels with the lead so a buyer-side or
        // ledger-side reconciliation never has to join back to analytics.
        tracking_params: params,
        consent_text: body.consentText ?? null,
        consent_at: new Date().toISOString(),
        segment: body.segment ?? null,
      },
    })
    .select('id, lead_id')
    .single();

  if (error || !lead) {
    console.error('[fe-gateway/lead] insert failed', error?.message);
    return NextResponse.json({ ok: false, error: 'insert_failed' }, { status: 500 });
  }

  /* ---------------- 2. Push to GHL ---------------- */
  // Non-fatal: the lead is already durable in Supabase. A GHL failure must
  // not cost us the capture, so we stamp the result and move on.

  try {
    const ghlRes = await fetch(FE_GHL_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        first_name: c.firstName?.trim(),
        last_name: c.lastName?.trim() ?? '',
        email: c.email?.trim().toLowerCase(),
        phone,
        state: c.state ?? '',
        source: 'SeniorSimple FE Gateway C',
        funnel_type: META.funnelType,
        lead_id: lead.lead_id,
        segment: body.segment ?? '',
        ...answers,
        utm_source: params.utm_source ?? '',
        utm_campaign: params.utm_campaign ?? '',
        utm_medium: params.utm_medium ?? '',
        utm_content: params.utm_content ?? '',
        fbclid: params.fbclid ?? '',
        consent: 'true',
        consent_text: body.consentText ?? '',
      }),
    });

    await callreadyQuizDb
      .from('leads')
      .update({
        ghl_status: {
          sent: ghlRes.ok,
          status: ghlRes.status,
          at: new Date().toISOString(),
        },
        delivered_at: ghlRes.ok ? new Date().toISOString() : null,
      })
      .eq('id', lead.id);

    if (!ghlRes.ok) {
      console.warn(`[fe-gateway/lead] GHL webhook returned ${ghlRes.status}`);
    }
  } catch (err) {
    console.warn('[fe-gateway/lead] GHL push threw', err);
  }

  return NextResponse.json({ ok: true, leadId: lead.id, leadRef: lead.lead_id });
}
