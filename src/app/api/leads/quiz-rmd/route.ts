import { NextRequest, NextResponse } from 'next/server';
import { callreadyQuizDb } from '@/lib/callready-quiz-db';
import { createCorsResponse, handleCorsOptions } from '@/lib/cors-headers';
import { formatPhoneForGHL, formatE164 } from '@/utils/phone-utils';
import * as crypto from 'crypto';

// Webhook URL for RMD quiz leads
const RMD_GHL_WEBHOOK_URL = process.env.rmd_GHL_webhook || process.env.annuity_GHL_webhook || "https://services.leadconnectorhq.com/hooks/vTM82D7FNpIlnPgw6XNC/webhook-trigger/28ef726d-7ead-4cd2-aa85-dfc6192adfb6";

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
  
  const { data: existingByEmail } = await callreadyQuizDb
    .from('contacts')
    .select('*')
    .eq('email', emailLower)
    .maybeSingle();
  
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
    const updateData: any = {};
    if (firstName && !existing.first_name) updateData.first_name = firstName;
    if (lastName && !existing.last_name) updateData.last_name = lastName;
    if (normalizedPhone && !existing.phone) {
      updateData.phone = normalizedPhone;
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
  
  const { data: newContact, error } = await callreadyQuizDb
    .from('contacts')
    .insert({
      email: emailLower,
      first_name: firstName,
      last_name: lastName,
      phone: normalizedPhone,
      phone_hash: normalizedPhone ? phoneHash(normalizedPhone) : null,
    })
    .select('*')
    .single();
  
  if (error) {
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
  quizAnswers: any,
  utmParams: any,
  trustedFormCertUrl?: string | null
) {
  const verifiedAt = new Date().toISOString();
  
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
  
  const utmSource = utmParams?.utm_source || null;
  const utmMedium = utmParams?.utm_medium || null;
  const utmCampaign = utmParams?.utm_campaign || null;
  
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
  
  const { data: contact } = await callreadyQuizDb
    .from('contacts')
    .select('email, phone, first_name, last_name')
    .eq('id', contactId)
    .maybeSingle();
  
  const contactData = contact ? {
    email: contact.email,
    phone: contact.phone || null,
    first_name: contact.first_name,
    last_name: contact.last_name,
  } : {
    email: null,
    phone: null,
    first_name: null,
    last_name: null,
  };

  const leadData: any = {
    contact_id: contactId,
    session_id: sessionId,
    site_key: 'seniorsimple.org',
    funnel_type: 'rmd-quiz',
    status: 'verified',
    is_verified: true,
    verified_at: verifiedAt,
    referrer: referrer,
    landing_page: landingPage,
    user_id: userId,
    contact: contactData,
    quiz_answers: {
      ...quizAnswers,
      utm_parameters: utmParams || {},
      trusted_form_cert_url: trustedFormCertUrl || null,
    },
    utm_source: utmSource,
    utm_medium: utmMedium,
    utm_campaign: utmCampaign,
    trustedform_cert_url: trustedFormCertUrl || null,
  };
  
  if (existingLead?.id) {
    const { data: updated, error } = await callreadyQuizDb
      .from('leads')
      .update({
        ...leadData,
        id: existingLead.id,
      })
      .eq('id', existingLead.id)
      .select('*')
      .single();
    
    if (error) throw error;
    return updated || existingLead;
  } else {
    const { data: newLead, error } = await callreadyQuizDb
      .from('leads')
      .insert(leadData)
      .select('*')
      .single();
    
    if (error) throw error;
    return newLead;
  }
}

export async function POST(request: NextRequest) {
  console.log('📝 RMD Quiz Lead Submission API Called');
  
  try {
    const body = await request.json();
    const { 
      phoneNumber, 
      email, 
      firstName, 
      lastName, 
      quizAnswers, 
      sessionId, 
      variant,
      entryVariant,
      route,
      utmParams,
      trustedFormCertUrl
    } = body;

    if (!email || !phoneNumber) {
      return createCorsResponse({ error: 'Email and phone number are required' }, 400);
    }

    // Upsert contact
    const contact = await upsertContact(email, firstName, lastName, phoneNumber);
    
    if (!contact || !contact.id) {
      console.error('❌ Failed to create or retrieve contact:', { email, phoneNumber });
      return createCorsResponse({ 
        success: false,
        error: 'Failed to create contact record' 
      }, 500);
    }
    
    // Upsert lead
    const lead = await upsertLead(
      contact.id,
      sessionId,
      quizAnswers,
      utmParams,
      trustedFormCertUrl
    );

    // Prepare GHL webhook payload
    const formattedPhone = formatPhoneForGHL(phoneNumber);
    const phoneLast4 = phoneNumber ? phoneNumber.slice(-4) : '';
    const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0] || 
                     request.headers.get('x-real-ip') || 
                     null;
    
    const totalSavings = quizAnswers?.total_savings || 0;
    const protectAllocation = quizAnswers?.protect_allocation || 0;
    const allocationAmount = Math.round((totalSavings * protectAllocation) / 100);

    const ghlPayload = {
      firstName,
      lastName,
      email,
      phone: formattedPhone,
      phoneLast4,
      source: 'SeniorSimple RMD Quiz',
      funnelType: 'rmd-quiz',
      variant: variant || 'rmd_v1',
      entryVariant: entryVariant || 'immediate_q1',
      route: route || '/quiz-rmd',
      sessionId: sessionId || lead.session_id || '',
      ipAddress: ipAddress,
      originallyCreated: new Date().toISOString(),
      timestamp: new Date().toISOString(),
      leadScore: 75,
      // Quiz answers
      rmd_concern: quizAnswers?.rmd_concern || '',
      age_range: quizAnswers?.age_range || '',
      retire_timeline: quizAnswers?.retire_timeline || '',
      risk_tolerance: quizAnswers?.risk_tolerance || '',
      account_types: Array.isArray(quizAnswers?.account_types) ? quizAnswers.account_types.join(', ') : '',
      total_savings: totalSavings,
      protect_allocation: protectAllocation,
      allocation_amount: allocationAmount,
      // UTM parameters
      utmSource: utmParams?.utm_source || '',
      utmMedium: utmParams?.utm_medium || '',
      utmCampaign: utmParams?.utm_campaign || '',
      utmTerm: utmParams?.utm_term || '',
      utmContent: utmParams?.utm_content || '',
      // TrustedForm
      trustedFormCertUrl: trustedFormCertUrl || null,
    };

    // Send to GHL webhook
    try {
      const ghlResponse = await fetch(RMD_GHL_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ghlPayload),
      });

      if (!ghlResponse.ok) {
        console.error('⚠️ GHL webhook error:', await ghlResponse.text());
      }
    } catch (ghlError) {
      console.error('⚠️ GHL webhook failed:', ghlError);
      // Don't fail the request if GHL fails
    }

    return createCorsResponse({
      success: true,
      lead_id: lead.id,
      next_url: `/booking?email=${encodeURIComponent(email)}`
    }, 200);

  } catch (error: any) {
    console.error('❌ Error processing RMD quiz lead:', error);
    console.error('❌ Error stack:', error.stack);
    console.error('❌ Error details:', {
      message: error.message,
      name: error.name,
      code: error.code,
    });
    return createCorsResponse({
      success: false,
      error: error.message || 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, 500);
  }
}

