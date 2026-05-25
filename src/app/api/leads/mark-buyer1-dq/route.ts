import { NextRequest } from 'next/server';
import { callreadyQuizDb } from '@/lib/callready-quiz-db';
import { createCorsResponse, handleCorsOptions } from '@/lib/cors-headers';

/**
 * POST /api/leads/mark-buyer1-dq
 *
 * Tags a reverse-mortgage lead as not-a-fit for Buyer 1 (LynqFlux) because their
 * existing-mortgage LTV exceeded the 35% threshold. We still captured the lead —
 * this endpoint just records the DQ reason and the verified property numbers so
 * we can:
 *   - Filter these out of Buyer 1 delivery (deliver-lynqflux is never called)
 *   - Segment them in SQL for downstream routing (offer wall, alt buyer)
 *   - Measure conversion of the alt path over time
 *
 * Body: { sessionId, propertyValue, mortgageBalance, ltv, batchDataUsed }
 */

export async function OPTIONS() {
  return handleCorsOptions();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, propertyValue, mortgageBalance, ltv, batchDataUsed } = body;

    if (!sessionId) {
      return createCorsResponse({ error: 'sessionId is required' }, 400);
    }

    const pvNum = Number(propertyValue) || 0;
    const mbNum = Number(mortgageBalance) || 0;
    const ltvNum = Number(ltv) || (pvNum > 0 ? mbNum / pvNum : 0);

    // Look up the lead by session_id (most recent)
    const { data: lead, error: leadError } = await callreadyQuizDb
      .from('leads')
      .select('id, ghl_status')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (leadError || !lead) {
      console.error('[buyer1-dq] Lead not found for session:', sessionId, leadError);
      return createCorsResponse({ error: 'Lead not found' }, 404);
    }

    // Idempotency: if already tagged, return success
    if (lead.ghl_status?.buyer1_dq) {
      console.log(`[buyer1-dq] Already tagged lead=${lead.id}`);
      return createCorsResponse({ success: true, leadId: lead.id, alreadyTagged: true });
    }

    const existingGhlStatus = lead.ghl_status || {};
    const { error: updateError } = await callreadyQuizDb
      .from('leads')
      .update({
        property_value: pvNum || null,
        current_mortgage: mbNum || null,
        ghl_status: {
          ...existingGhlStatus,
          buyer1_dq: {
            reason: 'ltv_above_35',
            ltv: Number(ltvNum.toFixed(4)),
            property_value: pvNum,
            mortgage_balance: mbNum,
            batch_data_used: !!batchDataUsed,
            timestamp: new Date().toISOString(),
          },
        },
      })
      .eq('id', lead.id);

    if (updateError) {
      console.error('[buyer1-dq] Failed to tag lead:', lead.id, updateError);
      return createCorsResponse({ error: 'Failed to tag lead' }, 500);
    }

    console.log(
      `🟠 BUYER1 DQ — lead=${lead.id} ltv=${(ltvNum * 100).toFixed(1)}% (alt-routing candidate)`,
    );
    return createCorsResponse({ success: true, leadId: lead.id });
  } catch (error: any) {
    console.error('[buyer1-dq] Error:', error.message);
    return createCorsResponse({ success: false, error: error.message }, 500);
  }
}
