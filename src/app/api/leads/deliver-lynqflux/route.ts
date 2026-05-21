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

// Buyer requires existing-mortgage LTV ≤ 35% to avoid "short to close" DNQs.
const MAX_QUALIFYING_LTV = 0.35;

export async function OPTIONS() {
  return handleCorsOptions();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, propertyValue, mortgageBalance, ltvRatio, creditRating, userVerified } = body;

    if (!sessionId) {
      return createCorsResponse({ error: 'sessionId is required' }, 400);
    }
    if (!propertyValue) {
      return createCorsResponse({ error: 'propertyValue is required' }, 400);
    }

    // Compute LTV defensively — client-supplied ratio may be a string or stale.
    const pvNum = Number(propertyValue) || 0;
    const mbNum = Number(mortgageBalance) || 0;
    const ratioFromValues = pvNum > 0 ? mbNum / pvNum : 0;
    const effectiveLtv = Math.max(Number(ltvRatio) || 0, ratioFromValues);

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

    // Hard gate: LTV must be ≤ 35% to avoid buyer "short to close" DNQs.
    if (effectiveLtv > MAX_QUALIFYING_LTV) {
      console.log(
        `🛑 LYNQFLUX SKIPPED — lead=${lead.id} ltv=${(effectiveLtv * 100).toFixed(1)}% exceeds ${MAX_QUALIFYING_LTV * 100}% cap`,
      );
      const existingGhlStatus = lead.ghl_status || {};
      await callreadyQuizDb
        .from('leads')
        .update({
          property_value: pvNum || null,
          current_mortgage: mbNum || null,
          ghl_status: {
            ...existingGhlStatus,
            lynqflux: {
              skipped: true,
              reason: 'ltv_above_35',
              ltv: Number(effectiveLtv.toFixed(4)),
              user_verified: !!userVerified,
              timestamp: new Date().toISOString(),
            },
          },
        })
        .eq('id', lead.id);
      return createCorsResponse({
        success: false,
        skipped: true,
        reason: 'ltv_above_35',
        ltv: Number(effectiveLtv.toFixed(4)),
        leadId: lead.id,
      });
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

    // Property data (BatchData or user-verified)
    // ─── LynqFlux schema mapping ──────────────────────────────────────────────
    // propertyvalue: integer USD (no commas, no currency symbol). e.g. "684899"
    // loanamount:    integer USD (set above; min 10000 per LynqFlux validation)
    // ltv:           DECIMAL ratio 0–1, two decimals. e.g. "0.67" (NOT "67")
    //                This is the format LynqFlux has accepted historically; do not
    //                change to percentage without confirming with them first
    //                (their `incoming.php` endpoint is undocumented in our repo;
    //                acceptance ≠ correct interpretation but they may also compute
    //                LTV themselves from propertyvalue + loanamount downstream).
    // loantype:      enum "Fixed|ARM|Balloon|FHA|VA|Fannie|Freddie|USDA"
    // creditrating:  enum "Excellent|Good|Fair|Poor" (set above)
    // ──────────────────────────────────────────────────────────────────────────
    lynqParams.set('propertyvalue', String(Math.round(pvNum)));
    lynqParams.set('ltv', effectiveLtv.toFixed(2));

    console.log('[LynqFlux] 📤 Sending reverse mortgage lead (deferred):', {
      leadId: lead.id,
      email: contact.email,
      zip: zip5,
      propertyValue: pvNum,
      mortgageBalance: loanAmt,
      ltv: effectiveLtv.toFixed(4),
      userVerified: !!userVerified,
      creditRating: mappedCredit,
    });

    // Local dev escape hatch: skip the actual POST when DISABLE_LYNQFLUX is set.
    if (process.env.DISABLE_LYNQFLUX === 'true') {
      console.log('🧪 [LynqFlux] DISABLE_LYNQFLUX=true — skipping real POST, returning mock success');
      const existingGhlStatus = lead.ghl_status || {};
      await callreadyQuizDb
        .from('leads')
        .update({
          property_value: pvNum || null,
          current_mortgage: mbNum || null,
          ghl_status: {
            ...existingGhlStatus,
            lynqflux: {
              status: 200,
              response: { status: 'mocked', message: 'DISABLE_LYNQFLUX=true' },
              timestamp: new Date().toISOString(),
              success: true,
              mocked: true,
              ltv: Number(effectiveLtv.toFixed(4)),
              user_verified: !!userVerified,
            },
          },
        })
        .eq('id', lead.id);
      return createCorsResponse({
        success: true,
        mocked: true,
        leadId: lead.id,
        wouldHaveSent: Object.fromEntries(lynqParams.entries()),
      });
    }

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

    // Persist result in ghl_status.lynqflux + property/mortgage on the lead row
    const existingGhlStatus = lead.ghl_status || {};
    await callreadyQuizDb
      .from('leads')
      .update({
        property_value: pvNum || null,
        current_mortgage: mbNum || null,
        ghl_status: {
          ...existingGhlStatus,
          lynqflux: {
            status: lynqResponse.status,
            response: lynqJson,
            timestamp: new Date().toISOString(),
            success: lynqResponse.ok && lynqJson.status === 'success',
            ltv: Number(effectiveLtv.toFixed(4)),
            user_verified: !!userVerified,
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
