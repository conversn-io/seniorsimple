import { NextRequest, NextResponse } from 'next/server';
import { callreadyQuizDb } from '@/lib/callready-quiz-db';
import { sendLeadEvent, getMetaPixelIdForFunnel } from '@/lib/meta-capi-service';

/**
 * POST /api/capi/send-lead
 *
 * Production CAPI fire path AND diagnostic endpoint. Submit handlers call this
 * via fetch so that each CAPI fire happens in its own Vercel function invocation
 * — the per-invocation top-level log line is then a CAPI message, making
 * `vercel logs -q "Meta CAPI"` find them directly (without having to dig into
 * the parent request's nested logs[] array).
 *
 * Body:
 *   {
 *     leadId:       string                              // required — lookup key
 *     eventId:      string                              // browser+server dedup eventID
 *     eventName?:   'Lead' | 'QualifiedLead' | string   // default 'Lead'
 *     value?:       number                              // CAPI value field
 *     customData?:  Record<string, any>                 // merged into custom_data
 *     userOverrides?: {                                 // optional override fields from caller
 *       email?: string
 *       phone?: string
 *       firstName?: string
 *       lastName?: string
 *       fbp?: string
 *       fbc?: string
 *       fbLoginId?: string
 *       city?: string
 *       state?: string
 *       zipCode?: string
 *       dateOfBirth?: string  // YYYYMMDD
 *     }
 *   }
 *
 * The route looks up the lead row for IP/UA/contact context, applies any
 * overrides from the caller, fires the CAPI event, and stamps the lead row with
 * the result so we never double-fire the same event.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      leadId,
      eventId,
      eventName = 'Lead',
      value = 0,
      customData = {},
      userOverrides = {},
    } = body || {};

    if (!leadId) {
      console.warn('[Meta CAPI fire] missing leadId');
      return NextResponse.json({ error: 'leadId is required' }, { status: 400 });
    }

    // Look up the lead for context fields. We also use ghl_status to enforce
    // the once-per-lead-per-event idempotency stamps.
    const { data: lead, error: leadError } = await callreadyQuizDb
      .from('leads')
      .select(
        'id, contact, quiz_answers, ip_address, trustedform_cert_url, jornaya_lead_id, zip_code, state, landing_page, funnel_type, ghl_status, created_at',
      )
      .eq('id', leadId)
      .maybeSingle();

    if (leadError || !lead) {
      console.warn(`[Meta CAPI fire] lead not found leadId=${leadId}`, leadError);
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    const existingGhlStatus = lead.ghl_status || {};

    // Per-event dedup stamps. Both browser+server use the same eventId so Meta
    // also dedupes at their end; this stamp prevents OUR side from re-firing
    // (e.g. if submit-without-otp retries the lead row).
    const stampKey =
      eventName === 'QualifiedLead' ? 'capi_qualified_lead_sent' : 'capi_lead_sent';
    const eventIdKey =
      eventName === 'QualifiedLead' ? 'capi_qualified_lead_event_id' : 'capi_lead_event_id';

    if (existingGhlStatus[stampKey]) {
      console.log(
        `[Meta CAPI fire] ⏭️ Skipping ${eventName} for lead=${leadId} — already sent at ${existingGhlStatus[stampKey]}`,
      );
      return NextResponse.json({
        success: true,
        skipped: true,
        reason: 'already_sent',
        leadId,
        previousEventId: existingGhlStatus[eventIdKey],
      });
    }

    const contact = lead.contact || {};
    const qa = lead.quiz_answers || {};
    const addrInfo = qa.addressInfo || {};
    const zip5 = (userOverrides.zipCode || addrInfo.zipCode || qa.zipCode || lead.zip_code || '')
      .replace(/-.*$/, '')
      .substring(0, 5);
    const city = userOverrides.city || addrInfo.city || qa.city || '';
    const state = userOverrides.state || addrInfo.state || lead.state || qa.state || '';
    const funnelPixelId = getMetaPixelIdForFunnel(lead.funnel_type);

    console.log(`[Meta CAPI fire] 🚀 Firing ${eventName}`, {
      leadId,
      eventId,
      eventName,
      funnelType: lead.funnel_type,
      pixelIdPrefix: funnelPixelId?.substring(0, 6) + '...',
      hasEmail: !!contact.email,
      hasPhone: !!contact.phone,
      hasFbp: !!userOverrides.fbp,
      hasFbc: !!userOverrides.fbc,
      value,
      customDataKeys: Object.keys(customData),
    });

    const result = await sendLeadEvent({
      leadId: lead.id,
      eventId,
      eventName,
      email: userOverrides.email || contact.email,
      phone: userOverrides.phone || contact.phone,
      firstName: userOverrides.firstName || contact.first_name || contact.firstName,
      lastName: userOverrides.lastName || contact.last_name || contact.lastName,
      fbp: userOverrides.fbp,
      fbc: userOverrides.fbc,
      fbLoginId: userOverrides.fbLoginId,
      ipAddress:
        lead.ip_address || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '',
      userAgent: request.headers.get('user-agent') || '',
      city,
      state,
      zipCode: zip5,
      country: 'US',
      dateOfBirth: userOverrides.dateOfBirth,
      externalId: lead.id,
      value,
      currency: 'USD',
      customData: {
        quiz_type: lead.funnel_type,
        content_category: lead.funnel_type,
        ...customData,
      },
      options: { pixelId: funnelPixelId },
    });

    if (result.success) {
      console.log(`[Meta CAPI fire] ✅ ${eventName} sent leadId=${leadId} eventId=${result.eventId}`);
      await callreadyQuizDb
        .from('leads')
        .update({
          ghl_status: {
            ...existingGhlStatus,
            [stampKey]: new Date().toISOString(),
            [eventIdKey]: result.eventId,
            ...(eventName === 'QualifiedLead' && customData.ltv
              ? { capi_qualified_lead_ltv: Number(customData.ltv) }
              : {}),
          },
        })
        .eq('id', lead.id);
    } else {
      console.error(`[Meta CAPI fire] ❌ ${eventName} failed leadId=${leadId}`, result.error);
    }

    return NextResponse.json({
      success: result.success,
      leadId,
      eventName,
      eventId: result.eventId,
      pixelId: funnelPixelId?.substring(0, 6) + '...',
      response: result.response,
      error: result.error,
    });
  } catch (error: any) {
    console.error('[Meta CAPI fire] Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
