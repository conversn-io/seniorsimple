import { NextRequest, NextResponse } from 'next/server';
import { callreadyQuizDb } from '@/lib/callready-quiz-db';
import { createCorsResponse, handleCorsOptions } from '@/lib/cors-headers';
import { formatPhoneForGHL, formatE164 } from '@/utils/phone-utils';
import * as crypto from 'crypto';

const GHL_WEBHOOK_URL = process.env.annuity_GHL_webhook || "https://services.leadconnectorhq.com/hooks/vTM82D7FNpIlnPgw6XNC/webhook-trigger/28ef726d-7ead-4cd2-aa85-dfc6192adfb6";

export async function OPTIONS() {
  return handleCorsOptions();
}

// Helper function to hash phone number
function phoneHash(phone: string | null): string | null {
  if (!phone) return null;
  return crypto.createHash('sha256').update(phone).digest('hex');
}

// Helper function to upsert contact
async function upsertContact(email: string, firstName: string | null, lastName: string | null, phone: string | null) {
  const emailLower = email?.toLowerCase();
  const normalizedPhone = phone ? formatE164(phone) : null;
  
  // Try to find existing contact by email or phone
  const { data: existingByEmail } = await callreadyQuizDb
    .from('contacts')
    .select('*')
    .eq('email', emailLower)
    .maybeSingle();
  
  // If phone provided, also check by phone_hash
  let existingByPhone = null;
  if (normalizedPhone) {
    const phoneHashVal = phoneHash(normalizedPhone);
    const { data: phoneMatch } = await callreadyQuizDb
      .from('contacts')
      .select('*')
      .eq('phone_hash', phoneHashVal)
      .maybeSingle();
    existingByPhone = phoneMatch;
  }
  
  const existing = existingByEmail || existingByPhone;
  
  if (existing?.id) {
    // Update existing contact with new info
    const updateData: any = {};
    if (firstName && !existing.first_name) updateData.first_name = firstName;
    if (lastName && !existing.last_name) updateData.last_name = lastName;
    if (normalizedPhone && !existing.phone) {
      updateData.phone = normalizedPhone;
      updateData.phone_e164 = normalizedPhone;
      updateData.phone_hash = phoneHash(normalizedPhone);
    }
    
    if (Object.keys(updateData).length > 0) {
      const { data: updated, error } = await callreadyQuizDb
        .from('contacts')
        .update(updateData)
        .eq('id', existing.id)
        .select('*')
        .single();
      
      if (error) throw error;
      return updated;
    }
    return existing;
  }
  
  // Create new contact
  const { data: newContact, error } = await callreadyQuizDb
    .from('contacts')
    .insert({
      email: emailLower,
      first_name: firstName,
      last_name: lastName,
      phone: normalizedPhone,
      phone_e164: normalizedPhone,
      phone_hash: normalizedPhone ? phoneHash(normalizedPhone) : null,
    })
    .select('*')
    .single();
  
  if (error) {
    // If insert fails, try to find by email as fallback
    const { data: fallbackContact } = await callreadyQuizDb
      .from('contacts')
      .select('*')
      .eq('email', emailLower)
      .maybeSingle();
    
    if (fallbackContact) return fallbackContact;
    throw error;
  }
  
  return newContact;
}

// Helper function to find or create lead
async function upsertLead(
  contactId: string,
  sessionId: string | null,
  funnelType: string,
  zipCode: string | null,
  state: string | null,
  stateName: string | null,
  quizAnswers: any,
  calculatedResults: any,
  licensingInfo: any,
  utmParams: any,
  isVerified: boolean = true, // Default to true for no-OTP flow
  fallbackEmail?: string | null,
  fallbackPhone?: string | null,
  fallbackFirstName?: string | null,
  fallbackLastName?: string | null
) {
  const verifiedAt = isVerified ? new Date().toISOString() : null;
  
  // Try to find existing lead by contact_id and session_id
  let existingLead = null;
  if (sessionId) {
    const { data: existing } = await callreadyQuizDb
      .from('leads')
      .select('*')
      .eq('contact_id', contactId)
      .eq('session_id', sessionId)
      .maybeSingle();
    existingLead = existing;
  }
  
  // Extract UTM parameters
  const utmSource = utmParams?.utm_source || null;
  const utmMedium = utmParams?.utm_medium || null;
  const utmCampaign = utmParams?.utm_campaign || null;
  
  // Get referrer and landing page from analytics_events
  let referrer = null;
  let landingPage = null;
  if (sessionId) {
    const { data: sessionEvent } = await callreadyQuizDb
      .from('analytics_events')
      .select('referrer, page_url, user_id')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (sessionEvent) {
      referrer = sessionEvent.referrer || null;
      landingPage = sessionEvent.page_url || null;
    }
  }
  
  // Get user_id from analytics_events if available
  let userId = null;
  if (sessionId) {
    const { data: sessionEvent } = await callreadyQuizDb
      .from('analytics_events')
      .select('user_id')
      .eq('session_id', sessionId)
      .not('user_id', 'is', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    userId = sessionEvent?.user_id || null;
  }
  
  // Get contact data for contact JSONB field
  const { data: contact, error: contactFetchError } = await callreadyQuizDb
    .from('contacts')
    .select('email, phone_e164, first_name, last_name, zip_code')
    .eq('id', contactId)
    .maybeSingle();
  
  // Log errors for debugging
  if (contactFetchError) {
    console.error('❌ Error fetching contact data:', {
      contactId,
      error: contactFetchError,
      timestamp: new Date().toISOString()
    });
  }
  
  if (!contact) {
    console.error('⚠️ WARNING: Contact not found in database!', {
      contactId,
      willUseFallback: true,
      timestamp: new Date().toISOString()
    });
  }
  
  // Use contact from DB if available, otherwise fallback to data from request
  // This prevents NULL contact fields if the DB query fails
  const contactData = contact ? {
    email: contact.email,
    phone: contact.phone_e164 || null,
    first_name: contact.first_name,
    last_name: contact.last_name,
    zip_code: contact.zip_code || zipCode || null
  } : {
    // Fallback: use data from the current request
    email: fallbackEmail || null,
    phone: fallbackPhone || null,
    first_name: fallbackFirstName || null,
    last_name: fallbackLastName || null,
    zip_code: zipCode || null
  };
  
  // Log if we're using fallback data
  if (!contact && contactData.email) {
    console.warn('✅ Using fallback contact data from request', {
      contactId,
      hasEmail: !!contactData.email,
      hasPhone: !!contactData.phone,
      hasName: !!(contactData.first_name && contactData.last_name)
    });
  }

  const leadData: any = {
    contact_id: contactId,
    session_id: sessionId,
    site_key: 'seniorsimple.org',
    funnel_type: funnelType || 'insurance',
    status: isVerified ? 'verified' : 'email_captured',
    is_verified: isVerified,
    verified_at: verifiedAt,
    zip_code: zipCode,
    state: state,
    state_name: stateName,
    referrer: referrer,
    landing_page: landingPage,
    user_id: userId,
    contact: contactData,
    quiz_answers: {
      ...quizAnswers,
      calculated_results: calculatedResults,
      licensing_info: licensingInfo,
      utm_parameters: utmParams || {},
    },
    utm_source: utmSource,
    utm_medium: utmMedium,
    utm_campaign: utmCampaign,
  };
  
  if (existingLead?.id) {
    // Update existing lead
    const { data: updated, error } = await callreadyQuizDb
      .from('leads')
      .update({
        ...leadData,
        id: existingLead.id,
      })
      .eq('id', existingLead.id)
      .select('*')
      .single();
    
    if (error) {
      console.error('❌ Error updating lead:', error);
      throw error;
    }
    return updated || existingLead;
  } else {
    // Create new lead
    const { data: newLead, error } = await callreadyQuizDb
      .from('leads')
      .insert(leadData)
      .select('*')
      .single();
    
    if (error) {
      console.error('❌ Error creating lead:', error);
      throw error;
    }
    return newLead;
  }
}

export async function POST(request: NextRequest) {
  console.log('📝 Form Submission (No OTP) & GHL Webhook API Called');
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

    if (!email || !phoneNumber) {
      return createCorsResponse({ error: 'Email and phone number are required' }, 400);
    }

    // Find or create contact
    console.log('👤 Upserting contact...');
    const contact = await upsertContact(email, firstName, lastName, phoneNumber);
    console.log('✅ Contact upserted:', contact.id);

    // Find or create lead (marked as verified since no OTP required)
    console.log('📋 Upserting lead...');
    const lead = await upsertLead(
      contact.id,
      sessionId,
      funnelType || 'insurance',
      zipCode,
      state,
      stateName,
      quizAnswers,
      calculatedResults,
      licensingInfo,
      utmParams,
      true, // is_verified = true (no OTP required)
      email, // fallbackEmail
      phoneNumber, // fallbackPhone
      firstName, // fallbackFirstName
      lastName // fallbackLastName
    );
    console.log('✅ Lead upserted:', lead.id);

    // Prepare GHL webhook payload
    const formattedPhone = formatPhoneForGHL(phoneNumber);
    const ghlPayload = {
      firstName: firstName || contact.first_name,
      lastName: lastName || contact.last_name,
      email: email,
      phone: formattedPhone,
      zipCode: zipCode || lead.zip_code,
      state: state || lead.state,
      stateName: stateName || lead.state_name,
      source: 'SeniorSimple Quiz',
      funnelType: funnelType || lead.funnel_type || 'insurance',
      quizAnswers: lead.quiz_answers || quizAnswers,
      calculatedResults: calculatedResults,
      licensingInfo: licensingInfo,
      leadScore: 75, // Default lead score
      timestamp: new Date().toISOString(),
      utmParams: utmParams || lead.quiz_answers?.utm_parameters || {},
      skipOTP: true // Flag to indicate this was submitted without OTP
    };

    console.log('📤 Sending to GHL Webhook:', {
      url: GHL_WEBHOOK_URL,
      payload: ghlPayload
    });

    // Send to GHL webhook with timeout
    console.log('🚀 Making GHL webhook request...');
    const WEBHOOK_TIMEOUT = 10000; // 10 seconds
    
    let ghlResponse: Response;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), WEBHOOK_TIMEOUT);
      
      ghlResponse = await fetch(GHL_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ghlPayload),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.error('❌ GHL Webhook Timeout:', {
          url: GHL_WEBHOOK_URL,
          timeout: WEBHOOK_TIMEOUT
        });
        return createCorsResponse({ 
          success: true, 
          leadId: lead.id,
          error: 'GHL webhook timeout', 
          leadSaved: true 
        }, 200);
      }
      throw error;
    }

    console.log('📡 GHL Response Status:', ghlResponse.status);
    console.log('📡 GHL Response Headers:', Object.fromEntries(ghlResponse.headers.entries()));

    let ghlResponseData: any = {};
    try {
      const text = await ghlResponse.text();
      if (text) {
        try {
          ghlResponseData = JSON.parse(text);
        } catch {
          ghlResponseData = { raw: text };
        }
      }
    } catch (parseError) {
      console.warn('⚠️ Could not parse GHL response:', parseError);
    }
    console.log('📡 GHL Response Body:', ghlResponseData);

    // Log webhook attempt to analytics_events
    try {
      await callreadyQuizDb
        .from('analytics_events')
        .insert({
          event_name: 'ghl_webhook_sent',
          session_id: sessionId,
          user_id: email,
          event_data: {
            lead_id: lead.id,
            webhook_url: GHL_WEBHOOK_URL,
            request_payload: ghlPayload,
            response_status: ghlResponse.status,
            response_body: ghlResponseData,
            success: ghlResponse.ok,
            skipOTP: true
          }
        });
    } catch (analyticsError) {
      console.warn('⚠️ Could not log webhook to analytics_events:', analyticsError);
    }

    if (ghlResponse.ok) {
      console.log('✅ Lead Sent to GHL Successfully:', { leadId: lead.id, status: ghlResponse.status });
      
      // Update lead with GHL status
      await callreadyQuizDb
        .from('leads')
        .update({ 
          ghl_status: {
            status: ghlResponse.status,
            timestamp: new Date().toISOString(),
            success: true
          }
        })
        .eq('id', lead.id);

      return createCorsResponse({
        success: true,
        leadId: lead.id,
        contactId: contact.id,
        ghlStatus: ghlResponse.status,
        message: 'Lead submitted and sent to GHL successfully (no OTP required)'
      }, 200);
    } else {
      console.error('❌ GHL Webhook Failed:', { 
        status: ghlResponse.status,
        statusText: ghlResponse.statusText,
        response: ghlResponseData,
        payload: ghlPayload,
        url: GHL_WEBHOOK_URL,
      });

      // Update lead with failed GHL status
      await callreadyQuizDb
        .from('leads')
        .update({ 
          ghl_status: {
            status: ghlResponse.status,
            statusText: ghlResponse.statusText,
            response: ghlResponseData,
            timestamp: new Date().toISOString(),
            success: false,
            error: `HTTP ${ghlResponse.status}: ${ghlResponse.statusText}`
          }
        })
        .eq('id', lead.id);

      return createCorsResponse({ 
        success: true, // Still return success since lead was saved
        leadId: lead.id,
        contactId: contact.id,
        error: 'GHL webhook failed', 
        ghlStatus: ghlResponse.status,
        ghlStatusText: ghlResponse.statusText,
        ghlResponse: ghlResponseData,
        leadSaved: true,
        message: 'Lead saved but GHL webhook failed'
      }, 200);
    }
  } catch (error: any) {
    console.error('❌ Form Submission Error:', {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });

    return createCorsResponse({ 
      success: false,
      error: error.message || 'Internal server error',
      timestamp: new Date().toISOString()
    }, 500);
  }
}

