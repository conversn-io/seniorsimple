import { NextRequest, NextResponse } from 'next/server';
import { callreadyQuizDb } from '@/lib/callready-quiz-db';
import { sendLeadEvent, getMetaPixelIdForFunnel } from '@/lib/meta-capi-service';

/**
 * POST /api/capi/send-lead
 * Diagnostic endpoint: manually send a Lead event to Meta CAPI for an existing lead.
 * Returns the full Meta API response for debugging.
 * Body: { leadId }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { leadId } = body;

    if (!leadId) {
      return NextResponse.json({ error: 'leadId is required' }, { status: 400 });
    }

    // Look up lead
    const { data: lead, error: leadError } = await callreadyQuizDb
      .from('leads')
      .select('id, contact, quiz_answers, ip_address, trustedform_cert_url, jornaya_lead_id, zip_code, state, landing_page, funnel_type, created_at')
      .eq('id', leadId)
      .maybeSingle();

    if (leadError || !lead) {
      return NextResponse.json({ error: 'Lead not found', detail: leadError }, { status: 404 });
    }

    const contact = lead.contact || {};
    const qa = lead.quiz_answers || {};
    const addrInfo = qa.addressInfo || {};
    const zip5 = (addrInfo.zipCode || qa.zipCode || lead.zip_code || '').replace(/-.*$/, '').substring(0, 5);
    const city = addrInfo.city || '';
    const state = addrInfo.state || lead.state || '';

    const funnelPixelId = getMetaPixelIdForFunnel(lead.funnel_type);

    const result = await sendLeadEvent({
      leadId: lead.id,
      email: contact.email,
      phone: contact.phone,
      firstName: contact.first_name || contact.firstName,
      lastName: contact.last_name || contact.lastName,
      ipAddress: lead.ip_address || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '',
      userAgent: request.headers.get('user-agent') || '',
      city,
      state,
      zipCode: zip5,
      country: 'US',
      externalId: lead.id,
      value: 0,
      currency: 'USD',
      customData: {
        quiz_type: lead.funnel_type,
        content_name: `${lead.funnel_type} Lead`,
        content_category: lead.funnel_type,
      },
      options: {
        pixelId: funnelPixelId,
      },
    });

    console.log(`[Meta CAPI] Manual Lead send for ${leadId}:`, JSON.stringify(result));

    return NextResponse.json({
      leadId: lead.id,
      email: contact.email,
      pixelId: funnelPixelId?.substring(0, 6) + '...',
      result,
    });
  } catch (error: any) {
    console.error('[Meta CAPI] Manual send error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
