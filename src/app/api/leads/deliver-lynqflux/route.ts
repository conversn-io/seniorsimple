import { NextRequest } from 'next/server';
import { callreadyQuizDb } from '@/lib/callready-quiz-db';
import { createCorsResponse, handleCorsOptions } from '@/lib/cors-headers';

/**
 * POST /api/leads/deliver-lynqflux
 *
 * Called from the reverse mortgage results page AFTER BatchData returns
 * property data. This is the only time we have propertyvalue, ltv, and
 * loanamount — all required by LynqFlux.
 *
 * Body: { sessionId, propertyValue, mortgageBalance, ltvRatio, creditRating? }
 */

const LYNQFLUX_URL = 'https://lynqflux.com/data/244/incoming.php';
const LYNQFLUX_PSWD = 'bXC9qjy4DEnMd4c7';
const LYNQFLUX_LID = '244';

export async function OPTIONS() {
  return handleCorsOptions();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, propertyValue, mortgageBalance, ltvRatio, creditRating } = body;

    if (!sessionId) {
      return createCorsResponse({ error: 'sessionId is required' }, 400);
    }
    if (!propertyValue) {
      return createCorsResponse({ error: 'propertyValue is required' }, 400);
    }

    // Look up the lead by session_id
    const { data: lead, error: leadError } = await callreadyQuizDb
      .from('leads')
      .select('id, contact, quiz_answers, ip_address, trustedform_cert_url, jornaya_lead_id, ghl_status, landing_page, zip_code, state')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (leadError || !lead) {
      console.error('[LynqFlux] Lead not found for session:', sessionId, leadError);
      return createCorsResponse({ error: 'Lead not found' }, 404);
    }

    // Check if already delivered
    if (lead.ghl_status?.lynqflux?.success) {
      console.log(`[LynqFlux] Already delivered for lead=${lead.id}, skipping`);
      return createCorsResponse({ success: true, message: 'Already delivered', leadId: lead.id });
    }

    // Contact data is JSONB
    const contact = lead.contact || {};

    // Extract address from quiz_answers
    const qa = lead.quiz_answers || {};
    const addrInfo = qa.addressInfo || {};
    const rawZip = addrInfo.zipCode || qa.zipCode || lead.zip_code || '';
    const zip5 = rawZip.replace(/-.*$/, '').substring(0, 5); // Strip ZIP+4

    // Build LynqFlux payload
    const lynqTimestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const lynqParams = new URLSearchParams({
      pswd: LYNQFLUX_PSWD,
      lid: LYNQFLUX_LID,
      email: contact.email || '',
      fname: contact.first_name || contact.firstName || '',
      lname: contact.last_name || contact.lastName || '',
      address: addrInfo.street || addrInfo.fullAddress || '',
      city: addrInfo.city || '',
      state: addrInfo.state || qa.state || '',
      zip: zip5,
      country: 'US',
      phone: contact.phone || contact.phoneNumber || '',
      leadid: lead.jornaya_lead_id || qa.jornayaLeadId || qa.jornaya_lead_id || '',
      trustedformurl: lead.trustedform_cert_url || qa.trustedFormCertUrl || '',
      listcode: 'callready',
      ip: lead.ip_address || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '',
      url: (lead.landing_page || 'https://www.seniorsimple.org/reverse-mortgage-calculator').split('?')[0],
      timestamp: lynqTimestamp,
    });

    // Required fields (validated by LynqFlux)
    // creditrating: Excellent, Good, Fair, Poor
    const creditMap: Record<string, string> = {
      'excellent': 'Excellent', '700+': 'Excellent', '720+': 'Excellent',
      'good': 'Good', '680-719': 'Good', '650-699': 'Good',
      'fair': 'Fair', '620-679': 'Fair', '600-649': 'Fair',
      'poor': 'Poor', 'below 620': 'Poor', 'below 600': 'Poor',
    };
    const rawCredit = creditRating || qa.creditScore || qa.credit_score || '';
    const mappedCredit = creditMap[String(rawCredit).toLowerCase()] || 'Good';
    lynqParams.set('creditrating', mappedCredit);

    // loanamount = mortgage balance from BatchData
    const loanAmt = Number(mortgageBalance) || 0;
    lynqParams.set('loanamount', loanAmt > 0 ? String(loanAmt) : '10000'); // min 10000 per LynqFlux

    // loantype: Fixed, ARM, Balloon, FHA, VA, Fannie, Freddie, USDA
    lynqParams.set('loantype', 'FHA');

    // Property data from BatchData
    lynqParams.set('propertyvalue', String(Math.round(Number(propertyValue))));
    lynqParams.set('ltv', String(Number(ltvRatio || 0).toFixed(2)));

    console.log('[LynqFlux] 📤 Sending reverse mortgage lead (deferred):', {
      leadId: lead.id,
      email: contact.email,
      zip: zip5,
      propertyValue,
      mortgageBalance: loanAmt,
      ltv: ltvRatio,
      creditRating: mappedCredit,
    });

    // POST to LynqFlux
    const lynqController = new AbortController();
    const lynqTimeout = setTimeout(() => lynqController.abort(), 10000);

    const lynqResponse = await fetch(LYNQFLUX_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: lynqParams.toString(),
      signal: lynqController.signal,
    });
    clearTimeout(lynqTimeout);

    const lynqBody = await lynqResponse.text();
    let lynqJson: any = {};
    try { lynqJson = JSON.parse(lynqBody); } catch { lynqJson = { raw: lynqBody }; }

    console.log('[LynqFlux] 📡 Response:', {
      status: lynqResponse.status,
      body: lynqJson,
      leadId: lead.id,
    });

    // Persist result in ghl_status.lynqflux
    const existingGhlStatus = lead.ghl_status || {};
    await callreadyQuizDb
      .from('leads')
      .update({
        ghl_status: {
          ...existingGhlStatus,
          lynqflux: {
            status: lynqResponse.status,
            response: lynqJson,
            timestamp: new Date().toISOString(),
            success: lynqResponse.ok && lynqJson.status === 'success',
          },
        },
      })
      .eq('id', lead.id);

    if (!lynqResponse.ok || lynqJson.status !== 'success') {
      console.error(`🔴 LYNQFLUX REJECTED — lead=${lead.id} status=${lynqResponse.status} reason="${lynqJson.message || lynqJson.errors?.join(', ') || 'unknown'}"`);
      return createCorsResponse({
        success: false,
        leadId: lead.id,
        lynqflux: { status: lynqResponse.status, response: lynqJson },
      });
    }

    console.log(`🟢 LYNQFLUX ACCEPTED — lead=${lead.id} email=${contact.email}`);
    return createCorsResponse({
      success: true,
      leadId: lead.id,
      lynqflux: { status: lynqResponse.status, response: lynqJson },
    });
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.error('[LynqFlux] ⏱️ Timeout after 10s');
      return createCorsResponse({ success: false, error: 'LynqFlux timeout' }, 504);
    }
    console.error('[LynqFlux] ❌ Error:', error.message);
    return createCorsResponse({ success: false, error: error.message }, 500);
  }
}
