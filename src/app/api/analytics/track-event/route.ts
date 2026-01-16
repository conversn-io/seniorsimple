import { NextRequest, NextResponse } from 'next/server';
import { callreadyQuizDb } from '@/lib/callready-quiz-db';

/**
 * API Route: Track Generic Analytics Event to Supabase analytics_events
 * 
 * This route handles client-side event tracking and saves to Supabase.
 * Used for quiz_step_viewed, address_entered, and other custom events.
 * 
 * IMPORTANT: Uses 'properties' NOT 'event_data' column
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      event_name,
      properties = {},
      session_id,
      user_id,
      page_url,
      referrer,
      user_agent,
      event_category,
      event_label,
      event_value,
      utm_source,
      utm_medium,
      utm_campaign,
      utm_term,
      utm_content
    } = body;

    // Validate required fields
    if (!event_name) {
      return NextResponse.json(
        { error: 'event_name is required' },
        { status: 400 }
      );
    }

    if (!session_id) {
      return NextResponse.json(
        { error: 'session_id is required' },
        { status: 400 }
      );
    }

    // Ensure page_url is full URL with domain
    let fullPageUrl = page_url;
    if (page_url && !page_url.startsWith('http')) {
      // If only path provided, construct full URL
      const host = request.headers.get('host') || 'www.seniorsimple.org';
      const protocol = request.headers.get('x-forwarded-proto') || 'https';
      fullPageUrl = `${protocol}://${host}${page_url.startsWith('/') ? page_url : '/' + page_url}`;
    }

    // Insert into analytics_events with timeout protection
    const insertPromise = callreadyQuizDb
      .from('analytics_events')
      .insert({
        event_name,
        event_category: event_category || 'quiz',
        event_label: event_label || event_name,
        event_value: event_value || null,
        session_id,
        user_id: user_id || session_id, // Use session_id as user_id if not provided
        page_url: fullPageUrl || null,
        referrer: referrer || null,
        user_agent: user_agent || null,
        ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null,
        utm_source: utm_source || null,
        utm_medium: utm_medium || null,
        utm_campaign: utm_campaign || null,
        utm_term: utm_term || null,
        utm_content: utm_content || null,
        properties: {
          ...properties,
          // Always include path if available
          path: properties.path || (fullPageUrl ? new URL(fullPageUrl).pathname : null),
          search: properties.search || (fullPageUrl ? new URL(fullPageUrl).search : null),
          // Ensure funnel_type is set
          funnel_type: properties.funnel_type || (fullPageUrl?.includes('final-expense') ? 'final-expense-quote' : 'primary')
        }
      })
      .select()
      .single();

    const timeoutPromise = new Promise<{ data: null; error: { message: string } }>((resolve) => {
      setTimeout(() => resolve({ data: null, error: { message: 'Timeout after 2 seconds' } }), 2000);
    });

    // Race between insert and timeout
    const result = await Promise.race([insertPromise, timeoutPromise]) as { data: any; error: any };

    if (result.error) {
      // Log error but return success to prevent blocking client
      console.warn('⚠️ Supabase event insert timeout/error (non-blocking):', result.error.message);
      
      // Return 202 Accepted - fire and forget pattern
      return NextResponse.json(
        { success: true, queued: true, message: 'Event accepted, processing in background' },
        { status: 202 }
      );
    }

    console.log('✅ Event saved to Supabase:', event_name, result.data?.id);

    return NextResponse.json({
      success: true,
      event_id: result.data?.id
    });

  } catch (error: any) {
    // Log error but return success to prevent blocking
    console.error('❌ Event tracking error (non-blocking):', error);
    
    // Return 202 Accepted - fire and forget
    return NextResponse.json(
      { success: true, queued: true, message: 'Event accepted, processing may be delayed' },
      { status: 202 }
    );
  }
}

