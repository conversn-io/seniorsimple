import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function POST(request: NextRequest) {
  console.log('📧 Email Capture for Retargeting:', {
    timestamp: new Date().toISOString()
  });

  try {
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
      licensingInfo 
    } = await request.json();

    // Validate required fields
    if (!email || !firstName || !lastName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    // Save to analytics_events for retargeting
    const { data: event, error } = await supabase
      .from('analytics_events')
      .insert({
        event_name: 'email_captured',
        event_category: 'lead_generation',
        event_label: 'rateroots_home_equity_quiz',
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
          status: 'email_captured_for_retargeting'
        },
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Email Capture Failed:', error);
      
      // If the table doesn't exist, we'll still return success to not break the user flow
      if (error.code === '42P01') { // Table doesn't exist
        console.log('⚠️ Analytics events table does not exist, but continuing...');
        return NextResponse.json({ 
          success: true, 
          message: 'Email captured (analytics table not configured)' 
        });
      }
      
      return NextResponse.json({ error: 'Failed to save email for retargeting' }, { status: 500 });
    }

    console.log('✅ Email Captured for Retargeting:', { eventId: event?.id, email });
    return NextResponse.json({ success: true, eventId: event?.id });

  } catch (error) {
    console.error('💥 Email Capture Exception:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}