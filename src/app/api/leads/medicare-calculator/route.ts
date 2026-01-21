import { NextRequest, NextResponse } from 'next/server';
import { callreadyQuizDb } from '@/lib/callready-quiz-db';
import { createCorsResponse, handleCorsOptions } from '@/lib/cors-headers';
import { formatPhoneForGHL, formatE164 } from '@/utils/phone-utils';
import * as crypto from 'crypto';

// Medicare GHL Webhook URL - Use same webhook as other SeniorSimple funnels
const MEDICARE_GHL_WEBHOOK_URL = process.env.NEXT_PUBLIC_GHL_WEBHOOK_SENIORSIMPLE || 
  process.env.annuity_GHL_webhook || 
  "https://services.leadconnectorhq.com/hooks/vTM82D7FNpIlnPgw6XNC/webhook-trigger/28ef726d-7ead-4cd2-aa85-dfc6192adfb6";

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

// Helper function to upsert lead
async function upsertLead(
  contactId: string,
  sessionId: string | null,
  quizAnswers: any,
  calculatorResults: any,
  utmParams: any,
  zipCode: string | null
) {
  // Generate session ID if not provided
  const finalSessionId = sessionId || crypto.randomUUID();
  
  // Try to find existing lead by contact_id and session_id
  let existingLead = null;
  if (finalSessionId) {
    const { data: existing } = await callreadyQuizDb
      .from('leads')
      .select('*')
      .eq('contact_id', contactId)
      .eq('session_id', finalSessionId)
      .maybeSingle();
    existingLead = existing;
  }
  
  // Extract UTM parameters
  const utmSource = utmParams?.utm_source || null;
  const utmMedium = utmParams?.utm_medium || null;
  const utmCampaign = utmParams?.utm_campaign || null;
  const utmTerm = utmParams?.utm_term || null;
  const utmContent = utmParams?.utm_content || null;
  
  const leadData: any = {
    contact_id: contactId,
    session_id: finalSessionId,
    funnel_type: 'Medicare',
    status: 'new',
    is_verified: true, // No OTP required for calculator leads
    quiz_answers: {
      ...quizAnswers,
      calculator_results: calculatorResults
    },
    zip_code: zipCode,
    utm_source: utmSource,
    utm_medium: utmMedium,
    utm_campaign: utmCampaign,
    utm_term: utmTerm,
    utm_content: utmContent,
    verified_at: new Date().toISOString(),
  };

  if (existingLead?.id) {
    // Update existing lead
    const { data: updatedLead, error } = await callreadyQuizDb
      .from('leads')
      .update(leadData)
      .eq('id', existingLead.id)
      .select('*')
      .single();
    
    if (error) throw error;
    return updatedLead;
  }
  
  // Create new lead
  const { data: newLead, error } = await callreadyQuizDb
    .from('leads')
    .insert(leadData)
    .select('*')
    .single();
  
  if (error) throw error;
  return newLead;
}

export async function POST(request: NextRequest) {
  console.log('📝 Medicare Calculator Lead Submission API Called');
  
  try {
    const body = await request.json();
    console.log('📥 Request Body:', JSON.stringify({ ...body, phone: '***' }, null, 2));
    
    const { 
      firstName, 
      lastName, 
      email, 
      phone, 
      zipCode,
      preferredContact,
      calculatorResults,
      source,
      landingPage,
      sessionId,
      ...utmParams
    } = body;

    if (!email || !phone) {
      return createCorsResponse({ error: 'Email and phone number are required' }, 400);
    }

    // Find or create contact
    console.log('👤 Upserting contact...');
    const contact = await upsertContact(email, firstName, lastName, phone);
    console.log('✅ Contact upserted:', contact.id);

    // Find or create lead
    console.log('📋 Upserting lead...');
    const lead = await upsertLead(
      contact.id,
      sessionId || null,
      {
        firstName,
        lastName,
        email,
        phone,
        zipCode,
        preferredContact
      },
      calculatorResults,
      utmParams,
      zipCode || null
    );
    console.log('✅ Lead upserted:', lead.id);

    // Prepare GHL webhook payload
    const formattedPhone = formatPhoneForGHL(phone);
    const ghlPayload = {
      firstName: firstName || contact.first_name,
      lastName: lastName || contact.last_name,
      email: email || contact.email,
      phone: formattedPhone,
      zipCode: zipCode || '',
      source: source || 'medicare_calculator',
      landingPage: landingPage || '',
      calculatorResults: calculatorResults || {},
      funnelType: 'Medicare',
      leadId: lead.id,
      sessionId: lead.session_id,
      ...utmParams
    };

    // Send to GHL webhook
    console.log('📤 Sending to GHL webhook...');
    try {
      const ghlResponse = await fetch(MEDICARE_GHL_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ghlPayload),
      });

      if (!ghlResponse.ok) {
        console.warn('⚠️ GHL webhook returned non-OK status:', ghlResponse.status);
      } else {
        console.log('✅ GHL webhook sent successfully');
      }
    } catch (ghlError) {
      console.error('❌ GHL webhook error (non-fatal):', ghlError);
      // Don't fail the request if GHL webhook fails
    }

    return createCorsResponse({
      success: true,
      leadId: lead.id,
      contactId: contact.id,
      message: 'Lead submitted successfully'
    });

  } catch (error: any) {
    console.error('❌ Error processing Medicare calculator lead:', error);
    return createCorsResponse(
      { 
        error: 'Failed to process lead submission',
        details: error.message 
      },
      500
    );
  }
}

