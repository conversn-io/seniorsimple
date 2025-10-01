import { NextRequest, NextResponse } from 'next/server';
import { callreadyQuizDb } from '@/lib/callready-quiz-db';
import { createCorsResponse, handleCorsOptions } from '@/lib/cors-headers';

const GHL_WEBHOOK_URL = process.env.annuity_GHL_webhook || "https://services.leadconnectorhq.com/hooks/vTM82D7FNpIlnPgw6XNC/webhook-trigger/28ef726d-7ead-4cd2-aa85-dfc6192adfb6";

export async function OPTIONS() {
  return handleCorsOptions();
}

export async function POST(request: NextRequest) {
  console.log('🔐 OTP Verification & GHL Webhook API Called');
  console.log('🔗 GHL Webhook URL:', GHL_WEBHOOK_URL);
  console.log('🌍 Environment:', process.env.NODE_ENV);
  console.log('⏰ Timestamp:', new Date().toISOString());

  try {
    const body = await request.json();
    console.log('📥 Request Body:', JSON.stringify(body, null, 2));
    
    const { 
      phoneNumber, 
      email, 
      firstName, 
      lastName, 
      quizAnswers, 
      sessionId, 
      funnelType,
      zipCode,
      state,
      stateName,
      licensingInfo,
      calculatedResults,
      utmParams 
    } = body;

    console.log('📊 Extracted Data:', {
      phoneNumber,
      email,
      firstName,
      lastName,
      sessionId,
      funnelType
    });

    // Save to verified_leads table (this is the main leads table)
    console.log('💾 Saving lead to database...');
    const { data: lead, error: leadError } = await callreadyQuizDb
      .from('verified_leads')
      .insert({
        phone_number: phoneNumber,
        email: email,
        first_name: firstName,
        last_name: lastName,
        source: `seniorsimple_${funnelType}_funnel`,
        status: 'verified',
        quiz_answers: {
          ...quizAnswers,
          calculated_results: calculatedResults,
          session_id: sessionId,
          funnel_type: funnelType,
          zip_code: zipCode,
          state: state,
          state_name: stateName,
          licensing_info: licensingInfo,
          utm_parameters: utmParams // Include UTM parameters in quiz_answers
        },
        property_location: zipCode, // Using existing field for ZIP
        verified_at: new Date().toISOString()
      })
      .select()
      .single();

    if (leadError) {
      console.error('❌ Lead Save Failed:', leadError);
      return createCorsResponse({ error: 'Failed to save verified lead' }, 500);
    }

    console.log('✅ Lead Saved Successfully:', { leadId: lead.id, email: lead.email });

    // Prepare GHL webhook payload with both ZIP and state
    const ghlPayload = {
      firstName: lead.first_name,
      lastName: lead.last_name,
      email: lead.email,
      phone: lead.phone_number,
      zipCode: zipCode,
      state: state,
      stateName: stateName,
      source: 'SeniorSimple Quiz',
      funnelType: funnelType,
      quizAnswers: lead.quiz_answers,
      licensingInfo: licensingInfo,
      leadScore: 75, // Default lead score
      timestamp: new Date().toISOString(),
      utmParams: utmParams // Include UTM parameters in GHL webhook
    };

    console.log('📤 Sending to GHL Webhook:', {
      url: GHL_WEBHOOK_URL,
      payload: ghlPayload
    });

    // Send to GHL webhook
    console.log('🚀 Making GHL webhook request...');
    const ghlResponse = await fetch(GHL_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(ghlPayload),
    });

    console.log('📡 GHL Response Status:', ghlResponse.status);
    console.log('📡 GHL Response Headers:', Object.fromEntries(ghlResponse.headers.entries()));

    const ghlResponseData = await ghlResponse.json().catch(() => ({}));
    console.log('📡 GHL Response Body:', ghlResponseData);

    // Log webhook attempt to analytics_events
    console.log('📊 Logging to analytics_events...');
    await callreadyQuizDb.from('analytics_events').insert({
      event_name: 'ghl_webhook_sent',
      event_category: 'lead_distribution',
      event_label: 'seniorsimple_quiz',
      user_id: lead.phone_number,
      session_id: sessionId,
      page_url: request.headers.get('referer'),
      user_agent: request.headers.get('user-agent'),
      ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
      properties: {
        lead_id: lead.id,
        webhook_url: GHL_WEBHOOK_URL,
        request_payload: ghlPayload,
        response_status: ghlResponse.status,
        response_body: ghlResponseData,
        success: ghlResponse.ok
      }
    });

    if (ghlResponse.ok) {
      // Update lead status to contacted
      await callreadyQuizDb
        .from('verified_leads')
        .update({
          status: 'contacted',
          contacted_at: new Date().toISOString()
        })
        .eq('id', lead.id);

      console.log('✅ Lead Sent to GHL Successfully:', { leadId: lead.id, status: ghlResponse.status });
      return createCorsResponse({ 
        success: true, 
        leadId: lead.id,
        ghlStatus: ghlResponse.status 
      });
    } else {
      console.error('❌ GHL Webhook Failed:', { status: ghlResponse.status, response: ghlResponseData });
      return createCorsResponse({ 
        error: 'GHL webhook failed', 
        ghlStatus: ghlResponse.status 
      }, 500);
    }

  } catch (error) {
    console.error('💥 OTP Verification Exception:', error);
    return createCorsResponse({ error: 'Internal server error' }, 500);
  }
}