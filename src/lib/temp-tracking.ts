/**
 * TEMPORARY CLIENT-SIDE TRACKING FOR SENIORSIMPLE
 * 
 * This is a temporary solution to get ads live immediately.
 * Will be replaced with full Supabase server-side tracking later.
 * Mirrors RateRoots approach for consistency.
 * 
 * Sitewide Tracking Scripts (installed in layout.tsx):
 * - GA4: Google Analytics 4
 * - Meta Pixel: Facebook/Meta pixel tracking
 * - ContentSquare: UX analytics (https://t.contentsquare.net/uxa/d494cfb6027da.js)
 * - PageTest.ai: Performance testing
 * - Consolidata: Analytics platform
 * - Visitoredge: Cookie script
 * - LeadID: Lead tracking
 */

// Declare global interfaces for tracking
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    fbq: any;
    dataLayer: any[];
  }
}

// Configuration - SeniorSimple specific
const GA4_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID_SENIORSIMPLE || 'G-XXXXXXXXXX';
const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID_SENIORSIMPLE || '24221789587508633';
const GHL_WEBHOOK = process.env.NEXT_PUBLIC_GHL_WEBHOOK_SENIORSIMPLE;
const SUPABASE_QUIZ_URL = process.env.NEXT_PUBLIC_SUPABASE_QUIZ_URL || 'https://jqjftrlnyysqcwbbigpw.supabase.co';
const SUPABASE_QUIZ_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_QUIZ_ANON_KEY || '';

// Debug logging
console.log('🔧 SeniorSimple Temp Tracking Config:', {
  GA4_ID: GA4_MEASUREMENT_ID,
  META_ID: META_PIXEL_ID,
  GHL_WEBHOOK: GHL_WEBHOOK ? 'Set' : 'Missing'
});

// Lead data interface
export interface LeadData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  zipCode: string;
  state?: string; // Optional - ZIP-only funnels don't collect state
  stateName?: string; // Optional - ZIP-only funnels don't collect state
  quizAnswers: Record<string, any>;
  sessionId: string;
  funnelType: string;
  age?: number;
  retirementGoals?: string;
  leadScore?: number;
  riskLevel?: string;
  recommendedProducts?: string[];
}

// Bot detection utility
export function isBot(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return false;
  }
  
  const ua = navigator.userAgent || '';
  const botPatterns = [
    /bot/i,
    /crawler/i,
    /spider/i,
    /crawling/i,
    /facebookexternalhit/i,
    /Googlebot/i,
    /Bingbot/i,
    /Slurp/i,
    /DuckDuckBot/i,
    /Baiduspider/i,
    /YandexBot/i,
    /Sogou/i,
    /Exabot/i,
    /facebot/i,
    /ia_archiver/i,
    /Twitterbot/i,
    /LinkedInBot/i,
    /WhatsApp/i,
    /TelegramBot/i
  ];
  
  return botPatterns.some(pattern => pattern.test(ua));
}

// Initialize tracking
export function initializeTracking(): void {
  console.log('🎯 SeniorSimple Temporary Tracking Initialized');
  
  // GA4 is now loaded in layout.tsx, just verify it's available
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    console.log('✅ GA4 already loaded in layout');
  } else {
    console.log('⚠️ GA4 not available (may be blocked or loading)');
  }

  // Meta Pixel is now loaded in layout.tsx, just verify it's available
  if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
    console.log('✅ Meta Pixel already loaded in layout');
  } else {
    console.log('⚠️ Meta Pixel not available');
  }
}

// GA4 Event Tracking
export function trackGA4Event(eventName: string, parameters: Record<string, any>): void {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', eventName, {
      ...parameters,
      site_key: 'SENIORSIMPLE',
      funnel_type: 'annuity'
    });
  }
}

// Meta Pixel Event Tracking
// Note: When multiple pixels are initialized, fbq('track') sends events to all initialized pixels
function trackMetaEvent(eventName: string, parameters: Record<string, any>): void {
  if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
    window.fbq('track', eventName, parameters);
  }
}

// Track Meta Pixel event with funnel context
export function trackMetaPixelEvent(
  eventName: string, 
  parameters: Record<string, any> = {},
  funnelType?: string
): void {
  if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
    // Add funnel context to parameters
    const enrichedParams = {
      ...parameters,
      funnel_type: funnelType || 'unknown',
      site_key: 'SENIORSIMPLE',
    };
    
    window.fbq('track', eventName, enrichedParams);
    console.log('📊 Meta Pixel Event:', eventName, enrichedParams);
  }
}

// GHL Webhook
async function sendToGHL(leadData: LeadData): Promise<void> {
  if (!GHL_WEBHOOK) {
    console.warn('GHL webhook not configured');
    return;
  }

  try {
    const response = await fetch(GHL_WEBHOOK, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...leadData,
        source: 'SeniorSimple',
        funnel_type: 'annuity'
      })
    });

    if (!response.ok) {
      console.error('GHL webhook failed:', response.statusText);
    } else {
      console.log('✅ Lead sent to GHL successfully');
    }
  } catch (error) {
    console.error('GHL webhook error:', error);
  }
}

// Public tracking functions
export function trackQuizStart(quizType: string, sessionId: string): void {
  console.log('📊 Tracking quiz start:', sessionId);
  
  // Ensure tracking is initialized
  initializeTracking();
  
  trackGA4Event('quiz_start', {
    session_id: sessionId,
    event_category: 'quiz_interaction'
  });
  
  // ❌ REMOVED: InitiateCheckout Meta event
  // Only track GA4 events, Meta events handled by Lead event only
}

export function trackQuestionAnswer(
  questionId: string,
  answer: any,
  step: number,
  totalSteps: number,
  sessionId: string,
  funnelType: string = 'annuity'
): void {
  console.log('📊 Tracking question answer:', questionId, answer);
  
  trackGA4Event('question_answer', {
    question_id: questionId,
    answer,
    step,
    total_steps: totalSteps,
    session_id: sessionId,
    progress_percentage: Math.round((step / totalSteps) * 100),
    event_category: 'quiz_interaction'
  });
}

export function trackQuizComplete(
  quizType: string,
  sessionId: string,
  funnelType: string,
  completionTime: number
): void {
  console.log('📊 Tracking quiz complete:', sessionId);
  
  trackGA4Event('quiz_complete', {
    quiz_type: quizType,
    session_id: sessionId,
    completion_time_seconds: completionTime,
    event_category: 'quiz_interaction'
  });
  
  // ❌ REMOVED: CompleteRegistration Meta event
  // Only track GA4 events, Meta events handled by Lead event only
}

export function trackLeadFormSubmit(leadData: LeadData): void {
  console.log('📊 Tracking lead form submit:', leadData);
  
  trackGA4Event('lead_form_submit', {
    session_id: leadData.sessionId,
    value: leadData.leadScore || 0,
    event_category: 'lead_generation',
    lead_source: 'SeniorSimple',
    age: leadData.age,
    lead_score: leadData.leadScore,
    state: leadData.state,
    zip_code: leadData.zipCode
  });
  
  trackMetaEvent('Lead', {
    content_name: 'SeniorSimple Retirement Lead',
    content_category: 'lead_generation',
    value: leadData.leadScore || 0,
    currency: 'USD'
  });
  
  // ❌ REMOVED: sendToGHL() to prevent duplicate GHL submissions
  // API route handles GHL webhook sending
}

// Send event to Supabase analytics_events
async function sendPageViewToSupabase(
  pageName: string,
  pagePath: string,
  sessionId: string
): Promise<void> {
  // Skip if bot
  if (isBot()) {
    console.log('🤖 Bot detected, skipping Supabase tracking');
    return;
  }

  // Skip if Supabase not configured
  if (!SUPABASE_QUIZ_URL || !SUPABASE_QUIZ_ANON_KEY) {
    console.warn('⚠️ Supabase not configured, skipping PageView tracking');
    return;
  }

  try {
    // Get tracking IDs
    const gaClientId = getGAClientId();
    const metaIds = getMetaPixelIds();
    
    // Get UTM parameters
    const utmParams = getUTMParams();
    
    // Get landing page variant and entry variant from sessionStorage
    const landingPageVariant = typeof window !== 'undefined' 
      ? sessionStorage.getItem('landing_page_variant') || 
        (pagePath?.includes('quiz-book-b') ? 'control' : 
         pagePath?.includes('quiz-rmd-v1') ? 'rmd_v1' :
         pagePath?.includes('quiz-rmd-v2') ? 'rmd_v2' : null)
      : null;
    const entryVariant = typeof window !== 'undefined' 
      ? sessionStorage.getItem('entryVariant') || null
      : null;

    // Send to Supabase via API route (more reliable than direct client insert)
    const response = await fetch('/api/analytics/track-pageview', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event_name: 'page_view',
        page_title: pageName,
        page_path: pagePath,
        session_id: sessionId,
        page_url: typeof window !== 'undefined' ? window.location.href : pagePath,
        referrer: typeof document !== 'undefined' ? document.referrer : null,
        user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
        properties: {
          site_key: 'seniorsimple.org',
          path: pagePath, // Always include path
          search: typeof window !== 'undefined' ? window.location.search : null, // Always include search params
          funnel_type: pagePath?.includes('final-expense') ? 'final-expense-quote' : 
                      pagePath?.includes('quiz-rmd') ? 'rmd-quiz' : 'primary', // Determine from path
          landing_page_variant: landingPageVariant, // 'control' | 'rmd_v1' | 'rmd_v2' | null
          entry_variant: entryVariant, // 'start_button' | 'immediate_q1' | null
          utm_parameters: utmParams,
          contact: {
            ga_client_id: gaClientId,
            ...metaIds
          }
        },
        utm_source: utmParams.utm_source || null,
        utm_medium: utmParams.utm_medium || null,
        utm_campaign: utmParams.utm_campaign || null
      })
    });

    if (!response.ok) {
      console.warn('⚠️ Supabase PageView tracking failed:', response.statusText);
    } else {
      console.log('✅ PageView sent to Supabase');
    }
  } catch (error) {
    console.error('❌ Failed to send PageView to Supabase:', error);
  }
}

// Get GA Client ID
function getGAClientId(): string | undefined {
  if (typeof window === 'undefined') return undefined;
  
  // Try to get from cookies
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === '_ga') {
      // GA4 format: G-XXXXXXXXXX.1234567890.1234567890
      // Extract client ID (last two parts)
      const parts = value?.split('.');
      if (parts && parts.length >= 2) {
        return parts.slice(-2).join('.');
      }
    }
  }
  
  return undefined;
}

// Get Meta Pixel IDs
function getMetaPixelIds(): { fbc?: string; fbp?: string } {
  if (typeof window === 'undefined') return {};
  
  const result: { fbc?: string; fbp?: string } = {};
  const cookies = document.cookie.split(';');
  
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === '_fbc') result.fbc = value;
    if (name === '_fbp') result.fbp = value;
  }
  
  return result;
}

// Get UTM parameters
function getUTMParams(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  
  const urlParams = new URLSearchParams(window.location.search);
  return {
    utm_source: urlParams.get('utm_source') || '',
    utm_medium: urlParams.get('utm_medium') || '',
    utm_campaign: urlParams.get('utm_campaign') || ''
  };
}

// Page view tracking
export function trackPageView(pageName: string, pagePath: string): void {
  console.log('📊 Tracking page view:', pageName);
  
  // Skip if bot
  if (isBot()) {
    console.log('🤖 Bot detected, skipping client-side tracking');
    return;
  }
  
  // Get landing page variant and entry variant for tracking
  const landingPageVariant = typeof window !== 'undefined' 
    ? sessionStorage.getItem('landing_page_variant') || 
      (pagePath?.includes('quiz-book-b') ? 'control' : 
       pagePath?.includes('quiz-rmd-v1') ? 'rmd_v1' :
       pagePath?.includes('quiz-rmd-v2') ? 'rmd_v2' : null)
    : null;
  const entryVariant = typeof window !== 'undefined' 
    ? sessionStorage.getItem('entryVariant') || null
    : null;
  
  // Generate session ID if not exists
  const sessionId = typeof window !== 'undefined' 
    ? (sessionStorage.getItem('session_id') || `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`)
    : `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('session_id', sessionId);
  }
  
  // Track to GA4
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    trackGA4Event('page_view', {
      page_title: pageName,
      page_location: pagePath,
      page_path: pagePath,
      event_category: 'navigation',
      landing_page_variant: landingPageVariant || undefined,
      entry_variant: entryVariant || undefined
    });
  }
  
  // Track to Supabase (async, non-blocking)
  sendPageViewToSupabase(pageName, pagePath, sessionId).catch(error => {
    console.error('Failed to send PageView to Supabase:', error);
  });
}

// Legacy CAPI functions - now handled client-side
export function sendCAPILeadEventMultiSite(leadData: LeadData): void {
  console.log('📊 CAPI event handled client-side:', leadData);
  // This is now handled by trackLeadFormSubmit above
}

export function sendCAPIViewContentEventMultiSite(params: any): void {
  console.log('📊 CAPI view content handled client-side:', params);
  // This is now handled by trackQuizStart above
}

/**
 * Track quiz step view event
 * Fires when user views a new step in the quiz
 */
export async function trackQuizStepViewed(params: {
  stepNumber: number;
  stepName: string;
  funnelType: string;
  previousStep?: string | null;
  timeOnPreviousStep?: number | null;
  sessionId: string;
}): Promise<void> {
  if (isBot()) {
    return;
  }

  try {
    const { stepNumber, stepName, funnelType, previousStep, timeOnPreviousStep, sessionId } = params;
    
    // Get UTM parameters if available
    const utmParams = typeof window !== 'undefined' 
      ? JSON.parse(sessionStorage.getItem('utm_params') || '{}')
      : {};
    
    // Get landing page variant if available
    const landingPageVariant = typeof window !== 'undefined' 
      ? sessionStorage.getItem('landing_page_variant') || null
      : null;
    const entryVariant = typeof window !== 'undefined' 
      ? sessionStorage.getItem('entryVariant') || null
      : null;

    // Track to Supabase analytics_events
    await fetch('/api/analytics/track-event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_name: 'quiz_step_viewed',
        properties: {
          step_number: stepNumber,
          step_name: stepName,
          funnel_type: funnelType,
          previous_step: previousStep || null,
          landing_page_variant: landingPageVariant,
          entry_variant: entryVariant,
          time_on_previous_step: timeOnPreviousStep || null
        },
        session_id: sessionId,
        user_id: sessionId, // Use session_id as user_id for anonymous users
        page_url: typeof window !== 'undefined' ? window.location.href : '',
        referrer: typeof document !== 'undefined' ? document.referrer : '',
        user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
        event_category: 'quiz',
        event_label: 'step_view',
        utm_source: utmParams.utm_source || null,
        utm_medium: utmParams.utm_medium || null,
        utm_campaign: utmParams.utm_campaign || null,
        utm_term: utmParams.utm_term || null,
        utm_content: utmParams.utm_content || null
      })
    }).catch(err => {
      console.warn('⚠️ Failed to track quiz step view (non-blocking):', err);
    });

    // Also track to GA4
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('event', 'quiz_step_viewed', {
        step_number: stepNumber,
        step_name: stepName,
        funnel_type: funnelType,
        session_id: sessionId,
        event_category: 'quiz'
      });
    }
  } catch (error) {
    console.warn('⚠️ Error tracking quiz step view (non-blocking):', error);
  }
}

/**
 * Track address entered event
 * Fires when user completes address/zip code field (primary funnel only)
 */
export async function trackAddressEntered(params: {
  hasZip: boolean;
  hasState: boolean;
  funnelType: string;
  stepNumber: number;
  fieldInteractionCount: number;
  sessionId: string;
}): Promise<void> {
  // Only track for primary funnel, not final-expense
  if (params.funnelType === 'final-expense-quote') {
    return;
  }

  if (isBot()) {
    return;
  }

  try {
    const { hasZip, hasState, funnelType, stepNumber, fieldInteractionCount, sessionId } = params;
    
    // Get UTM parameters if available
    const utmParams = typeof window !== 'undefined' 
      ? JSON.parse(sessionStorage.getItem('utm_params') || '{}')
      : {};

    // Track to Supabase analytics_events
    await fetch('/api/analytics/track-event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_name: 'address_entered',
        properties: {
          has_zip: hasZip,
          has_state: hasState,
          funnel_type: funnelType,
          step_number: stepNumber,
          field_interaction_count: fieldInteractionCount
        },
        session_id: sessionId,
        user_id: sessionId,
        page_url: typeof window !== 'undefined' ? window.location.href : '',
        referrer: typeof document !== 'undefined' ? document.referrer : '',
        user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
        event_category: 'quiz',
        event_label: 'address_capture',
        utm_source: utmParams.utm_source || null,
        utm_medium: utmParams.utm_medium || null,
        utm_campaign: utmParams.utm_campaign || null,
        utm_term: utmParams.utm_term || null,
        utm_content: utmParams.utm_content || null
      })
    }).catch(err => {
      console.warn('⚠️ Failed to track address entered (non-blocking):', err);
    });

    // Also track to GA4
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('event', 'address_entered', {
        has_zip: hasZip,
        has_state: hasState,
        funnel_type: funnelType,
        step_number: stepNumber,
        session_id: sessionId,
        event_category: 'quiz'
      });
    }
  } catch (error) {
    console.warn('⚠️ Error tracking address entered (non-blocking):', error);
  }
}