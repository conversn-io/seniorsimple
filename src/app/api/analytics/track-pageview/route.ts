import { NextRequest, NextResponse } from 'next/server';
import { callreadyQuizDb } from '@/lib/callready-quiz-db';

/**
 * API Route: Track PageView to Supabase analytics_events
 * 
 * This route handles client-side PageView tracking and saves to Supabase.
 * Used by temp-tracking.ts to send page_view events.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      event_name = 'page_view',
      page_title,
      page_path,
      session_id,
      page_url,
      referrer,
      user_agent,
      properties,
      utm_source,
      utm_medium,
      utm_campaign
    } = body;

    if (!session_id) {
      return NextResponse.json(
        { error: 'session_id is required' },
        { status: 400 }
      );
    }

    // Insert into analytics_events with timeout protection
    // Use Promise.race to timeout after 2 seconds
    const insertPromise = callreadyQuizDb
      .from('analytics_events')
      .insert({
        event_name,
        event_category: 'navigation',
        event_label: 'seniorsimple.org',
        session_id,
        page_url: page_url || page_path,
        referrer: referrer || null,
        user_agent: user_agent || null,
        ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null,
        properties: {
          ...properties,
          page_title,
          page_path: page_path || (page_url ? new URL(page_url).pathname : null),
          path: page_path || (page_url ? new URL(page_url).pathname : null), // Always include path
          search: page_url ? new URL(page_url).search : null, // Always include search params
          site_key: 'seniorsimple.org',
          funnel_type: properties?.funnel_type || (page_url?.includes('final-expense') ? 'final-expense-quote' : 
                      page_url?.includes('quiz-rmd') ? 'rmd-quiz' : 'primary'),
          // Landing page split test variant tracking
          landing_page_variant: properties?.landing_page_variant || 
            (page_url?.includes('quiz-book-b') ? 'control' : 
             page_url?.includes('quiz-rmd-v1') ? 'rmd_v1' :
             page_url?.includes('quiz-rmd-v2') ? 'rmd_v2' : null),
          entry_variant: properties?.entry_variant || null
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
      console.warn('⚠️ Supabase PageView insert timeout/error (non-blocking):', result.error.message);
      
      // Return 202 Accepted - fire and forget pattern
      // Client doesn't need to wait for Supabase response
      return NextResponse.json(
        { success: true, queued: true, message: 'Event accepted, processing in background' },
        { status: 202 }
      );
    }

    console.log('✅ PageView saved to Supabase:', result.data?.id);

    return NextResponse.json({
      success: true,
      event_id: result.data?.id
    });

  } catch (error: any) {
    // Log error but return success to prevent blocking
    console.error('❌ PageView tracking error (non-blocking):', error);
    
    // Return 202 Accepted - fire and forget
    return NextResponse.json(
      { success: true, queued: true, message: 'Event accepted, processing may be delayed' },
      { status: 202 }
    );
  }
}




