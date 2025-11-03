import { NextRequest, NextResponse } from 'next/server';
import { callreadyQuizDb } from '@/lib/callready-quiz-db';
import { createCorsResponse, handleCorsOptions } from '@/lib/cors-headers';
import { formatE164 } from '@/utils/phone-utils';
import * as crypto from 'crypto';

export async function OPTIONS() {
  return handleCorsOptions();
}

// Helper function to hash phone number
function phoneHash(phone: string | null): string | null {
  if (!phone) return null;
  return crypto.createHash('sha256').update(phone).digest('hex');
}

// Helper function to upsert contact
async function upsertContact(email: string, firstName: string | null, lastName: string | null, phone: string | null = null) {
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
    if (emailLower && !existing.email) updateData.email = emailLower;
    
    if (Object.keys(updateData).length > 0) {
      const { data: updated } = await callreadyQuizDb
        .from('contacts')
        .update(updateData)
        .eq('id', existing.id)
        .select('*')
        .single();
      return updated || existing;
    }
    return existing;
  }
  
  // Create new contact
  const contactData: any = {
    email: emailLower,
    first_name: firstName,
    last_name: lastName,
    source: 'seniorsimple_quiz',
  };
  
  if (normalizedPhone) {
    contactData.phone = normalizedPhone;
    contactData.phone_hash = phoneHash(normalizedPhone);
  }
  
  const { data: newContact, error } = await callreadyQuizDb
    .from('contacts')
    .insert(contactData)
    .select('*')
    .single();
  
  if (error) {
    // Try without optional columns if they don't exist
    if (error.message?.includes('phone_hash') || error.message?.includes('source')) {
      const fallbackData: any = {
        email: emailLower,
        first_name: firstName,
        last_name: lastName,
      };
      if (normalizedPhone) fallbackData.phone = normalizedPhone;
      
      const { data: fallbackContact } = await callreadyQuizDb
        .from('contacts')
        .insert(fallbackData)
        .select('*')
        .single();
      
      if (fallbackContact) return fallbackContact;
    }
    throw error;
  }
  
  return newContact;
}

export async function POST(request: NextRequest) {
  console.log('📧 Lead Capture (All Contact Data):', {
    timestamp: new Date().toISOString()
  });

  try {
    const body = await request.json();
    const { 
      email, 
      firstName, 
      lastName,
      phoneNumber, // Now accepts phone number
      quizAnswers, 
      sessionId, 
      funnelType = 'insurance', // Default for SeniorSimple
      zipCode,
      state,
      stateName,
      licensingInfo,
      calculatedResults,
      utmParams 
    } = body;

    if (!email) {
      return createCorsResponse({ error: 'Email is required' }, 400);
    }

    // Upsert contact (with phone if provided)
    const contact = await upsertContact(email, firstName, lastName, phoneNumber || null);
    const contactId = contact.id || contact;
    console.log('✅ Contact upserted:', contactId);

    // Extract UTM parameters
    const utmSource = utmParams?.utm_source || 'seniorsimple';
    const utmMedium = utmParams?.utm_medium || 'quiz';
    const utmCampaign = utmParams?.utm_campaign || null;

    // Check if lead already exists for this contact and session
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

    // Insert or update lead (not verified yet - OTP verification comes later)
    const leadData: any = {
      contact_id: contactId,
      session_id: sessionId,
      site_key: 'seniorsimple.org',
      funnel_type: funnelType || 'insurance',
      form_type: 'quiz',
      status: phoneNumber ? 'phone_captured' : 'email_captured',
      is_verified: false, // Will be set to true when OTP is verified
      zip_code: zipCode,
      state: state,
      state_name: stateName,
      quiz_answers: {
        ...quizAnswers,
        calculated_results: calculatedResults,
        licensing_info: licensingInfo,
        utm_parameters: utmParams,
      },
      utm_source: utmSource,
      utm_medium: utmMedium,
      utm_campaign: utmCampaign,
      attributed_ad_account: 'CallReady - Insurance',
      profit_center: 'SeniorSimple.org',
    };

    let lead;
    if (existingLead?.id) {
      // Update existing lead with all new data
      const { data: updated, error: updateError } = await callreadyQuizDb
        .from('leads')
        .update({
          ...leadData,
          id: existingLead.id, // Preserve existing ID
        })
        .eq('id', existingLead.id)
        .select('*')
        .single();

      if (updateError) {
        // Try without optional columns if they don't exist
        const optionalColumns = ['form_type', 'attributed_ad_account', 'profit_center'];
        let shouldRetry = false;
        
        for (const col of optionalColumns) {
          if (updateError.message?.includes(col)) {
            delete leadData[col];
            shouldRetry = true;
          }
        }
        
        if (shouldRetry) {
          const { data: fallbackUpdated } = await callreadyQuizDb
            .from('leads')
            .update(leadData)
            .eq('id', existingLead.id)
            .select('*')
            .single();
          
          if (fallbackUpdated) {
            lead = fallbackUpdated;
            console.log('✅ Lead updated (without optional columns):', lead.id);
          } else {
            throw updateError;
          }
        } else {
          throw updateError;
        }
      } else {
        lead = updated || existingLead;
        console.log('✅ Lead updated:', lead.id);
      }
    } else {
      // Create new lead
      const { data: newLead, error: leadError } = await callreadyQuizDb
        .from('leads')
        .insert(leadData)
        .select('*')
        .single();

      if (leadError) {
        // Try without optional columns if they don't exist
        const optionalColumns = ['form_type', 'attributed_ad_account', 'profit_center'];
        let shouldRetry = false;
        
        for (const col of optionalColumns) {
          if (leadError.message?.includes(col)) {
            delete leadData[col];
            shouldRetry = true;
          }
        }
        
        if (shouldRetry) {
          const { data: fallbackLead } = await callreadyQuizDb
            .from('leads')
            .insert(leadData)
            .select('*')
            .single();
          
          if (fallbackLead) {
            lead = fallbackLead;
            console.log('✅ Lead created (without optional columns):', lead.id);
          } else {
            throw leadError;
          }
        } else {
          throw leadError;
        }
      } else {
        lead = newLead;
        console.log('✅ Lead created:', lead.id);
      }
    }

    // Save to analytics_events for retargeting
    const eventName = phoneNumber ? 'lead_captured' : 'email_captured';
    const { data: event, error } = await callreadyQuizDb
      .from('analytics_events')
      .insert({
        event_name: eventName,
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
          phone: phoneNumber || null,
          quiz_answers: quizAnswers,
          calculated_results: calculatedResults,
          funnel_type: funnelType,
          zip_code: zipCode,
          state: state,
          state_name: stateName,
          licensing_info: licensingInfo,
          status: phoneNumber ? 'lead_captured' : 'email_captured_for_retargeting',
          is_verified: false,
          utm_parameters: utmParams
        }
      })
      .select()
      .single();

    if (error) {
      console.error('⚠️ Analytics event save failed (non-critical):', error);
    } else {
      console.log('✅ Analytics event saved:', event.id);
    }

    return createCorsResponse({ 
      success: true, 
      eventId: event?.id,
      contactId,
      leadId: lead?.id,
      isVerified: false // Will be true after OTP verification
    });

  } catch (error: any) {
    console.error('💥 Email Capture Exception:', {
      error: error.message || error,
      stack: error.stack,
      details: error.details || error.hint || 'No additional details',
      code: error.code,
      timestamp: new Date().toISOString()
    });
    return createCorsResponse({ 
      error: 'Internal server error', 
      details: error.message || 'Unknown error',
      code: error.code 
    }, 500);
  }
}


