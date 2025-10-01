/**
 * TEMPORARY CLIENT-SIDE TRACKING FOR SENIORSIMPLE
 * 
 * This is a temporary solution to get ads live immediately.
 * Will be replaced with full Supabase server-side tracking later.
 * Mirrors RateRoots approach for consistency.
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
  state: string;
  stateName: string;
  quizAnswers: Record<string, any>;
  sessionId: string;
  funnelType: string;
  age?: number;
  retirementGoals?: string;
  leadScore?: number;
  riskLevel?: string;
  recommendedProducts?: string[];
}

// Initialize tracking
export function initializeTracking(): void {
  console.log('🎯 SeniorSimple Temporary Tracking Initialized');
  
  // Load GA4 script if not already loaded
  if (typeof window !== 'undefined' && !window.gtag) {
    loadGA4Script();
  }
  
  // Initialize GA4
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', GA4_MEASUREMENT_ID);
    console.log('✅ GA4 initialized with ID:', GA4_MEASUREMENT_ID);
  } else {
    console.log('❌ GA4 not available');
  }

  // Meta Pixel is now loaded in layout.tsx, just verify it's available
  if (typeof window !== 'undefined' && window.fbq) {
    console.log('✅ Meta Pixel already loaded in layout');
  } else {
    console.log('❌ Meta Pixel not available');
  }
}

// Load GA4 script dynamically
function loadGA4Script(): void {
  if (typeof window === 'undefined') return;
  
  // Create script element
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_MEASUREMENT_ID}`;
  
  // Add to head
  document.head.appendChild(script);
  
  // Initialize gtag
  window.dataLayer = window.dataLayer || [];
  window.gtag = function() {
    window.dataLayer.push(arguments);
  };
  
  window.gtag('js', new Date());
  window.gtag('config', GA4_MEASUREMENT_ID);
  
  console.log('📊 GA4 script loaded dynamically');
}

// GA4 Event Tracking
function trackGA4Event(eventName: string, parameters: Record<string, any>): void {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, {
      ...parameters,
      site_key: 'SENIORSIMPLE',
      funnel_type: 'annuity'
    });
  }
}

// Meta Pixel Event Tracking
function trackMetaEvent(eventName: string, parameters: Record<string, any>): void {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', eventName, parameters);
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

// Page view tracking
export function trackPageView(pageName: string, pagePath: string): void {
  console.log('📊 Tracking page view:', pageName);
  
  trackGA4Event('page_view', {
    page_title: pageName,
    page_location: pagePath,
    event_category: 'navigation'
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