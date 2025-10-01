import { NextRequest, NextResponse } from 'next/server';
import { callreadyQuizDb } from '@/lib/callready-quiz-db';
import { createCorsResponse, handleCorsOptions } from '@/lib/cors-headers';

export async function OPTIONS() {
  return handleCorsOptions();
}

export async function POST(request: NextRequest) {
  console.log('📧 Email Capture for Retargeting:', {
    timestamp: new Date().toISOString()
  });

  try {
    const body = await request.json();
    const { 
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
      utmParams 
    } = body;

    // Save to analytics_events for retargeting (since verified_leads requires phone)
    const { data: event, error } = await callreadyQuizDb
      .from('analytics_events')
      .insert({
        event_name: 'email_captured',
        event_category: 'lead_generation',
        event_label: 'seniorsimple_quiz',
        user_id: email,
        session_id: sessionId,
        page_url: request.headers.get('referer'),
        user_agent: request.headers.get('user-agent'),
        ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
        properties: {
          email,
          first_name: firstName,
          last_name: lastName,
          quiz_answers: quizAnswers,
          funnel_type: funnelType,
          zip_code: zipCode,
          state: state,
          state_name: stateName,
          licensing_info: licensingInfo,
          status: 'email_captured_for_retargeting',
          utm_parameters: utmParams // Store UTM in properties JSONB
        }
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Email Capture Failed:', error);
      return createCorsResponse({ error: 'Failed to save email for retargeting' }, 500);
    }

    console.log('✅ Email Captured for Retargeting:', { eventId: event.id, email });
    return createCorsResponse({ success: true, eventId: event.id });

  } catch (error) {
    console.error('💥 Email Capture Exception:', error);
    return createCorsResponse({ error: 'Internal server error' }, 500);
  }
}


