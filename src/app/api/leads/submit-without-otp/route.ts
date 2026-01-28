import { NextRequest, NextResponse } from 'next/server';
import { callreadyQuizDb } from '@/lib/callready-quiz-db';
import { createCorsResponse, handleCorsOptions } from '@/lib/cors-headers';
import { formatPhoneForGHL, formatE164, extractUSPhoneNumber } from '@/utils/phone-utils';
import * as crypto from 'crypto';
import { sendLeadEvent, getMetaPixelIdForFunnel } from '@/lib/meta-capi-service';

// Webhook URLs by funnel type
const ANNUITY_GHL_WEBHOOK_URL = process.env.annuity_GHL_webhook || "https://services.leadconnectorhq.com/hooks/vTM82D7FNpIlnPgw6XNC/webhook-trigger/28ef726d-7ead-4cd2-aa85-dfc6192adfb6";
const FINAL_EXPENSE_GHL_WEBHOOK_URL = process.env.final_expense_GHL_webhook || process.env.annuity_GHL_webhook || "https://services.leadconnectorhq.com/hooks/vTM82D7FNpIlnPgw6XNC/webhook-trigger/28ef726d-7ead-4cd2-aa85-dfc6192adfb6";
const REVERSE_MORTGAGE_GHL_WEBHOOK_URL = process.env.reverse_mortgage_GHL_webhook || "https://services.leadconnectorhq.com/hooks/rqTRxGq1yRvvDT6axp0M/webhook-trigger/Lt2rfsXak8KkqufbSHcE";

// Helper function to get webhook URL based on funnel type
function getGHLWebhookUrl(funnelType: string | null | undefined): string {
  if (funnelType === 'final-expense-quote') {
    return FINAL_EXPENSE_GHL_WEBHOOK_URL;
  }
  if (funnelType === 'reverse-mortgage' || funnelType === 'reverse-mortgage-calculator') {
    return REVERSE_MORTGAGE_GHL_WEBHOOK_URL;
  }
  return ANNUITY_GHL_WEBHOOK_URL;
}

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
  fallbackLastName?: string | null,
  trustedFormCertUrl?: string | null, // TrustedForm certificate URL (stored as trustedform_cert_url)
  jornayaId?: string | null // Journaya Lead ID (stored in quiz_answers)
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
    .select('email, phone, first_name, last_name, zip_code')
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
    phone: contact.phone || null,
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
      trusted_form_cert_url: trustedFormCertUrl || null, // Store in quiz_answers
      jornayaLeadId: jornayaId || null, // Store Journaya Lead ID in quiz_answers (not as leadId)
    },
    utm_source: utmSource,
    utm_medium: utmMedium,
    utm_campaign: utmCampaign,
    trustedform_cert_url: trustedFormCertUrl || null, // Store TrustedForm certificate URL
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
      utmParams,
      trustedFormCertUrl, // TrustedForm certificate URL
      jornayaLeadId, // Journaya Lead ID
      jornayaLeadID // Alternative field name for Journaya
    } = body;
    
    // Extract Journaya ID from body or quizAnswers
    const jornayaId = jornayaLeadId || jornayaLeadID || quizAnswers?.jornayaLeadId || quizAnswers?.jornaya_lead_id || quizAnswers?.jornaya_leadid || null;
    
    // Extract TrustedForm Cert URL from body or quizAnswers (with fallback)
    const finalTrustedFormCertUrl = trustedFormCertUrl || quizAnswers?.trustedFormCertUrl || quizAnswers?.trusted_form_cert_url || quizAnswers?.xxTrustedFormCertUrl || '';
    console.log('[DEBUG] 🔵 Backend received request body values', { 
      trustedFormCertUrl: trustedFormCertUrl || 'NULL', 
      jornayaLeadId: jornayaId || 'NULL', 
      finalTrustedFormCertUrl: finalTrustedFormCertUrl || 'EMPTY', 
      funnelType 
    })

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

    // Normalize phone number: strip leading 1 if present (handles autocomplete edge cases)
    const normalizedPhoneNumber = extractUSPhoneNumber(phoneNumber);
    console.log('📞 Phone normalization:', { original: phoneNumber, normalized: normalizedPhoneNumber });

    // Find or create contact
    console.log('👤 Upserting contact...');
    const contact = await upsertContact(email, firstName, lastName, normalizedPhoneNumber);
    
    if (!contact || !contact.id) {
      console.error('❌ Failed to create or retrieve contact:', { email, phoneNumber: normalizedPhoneNumber });
      return createCorsResponse({ 
        success: false,
        error: 'Failed to create contact record',
        timestamp: new Date().toISOString()
      }, 500);
    }
    
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
      normalizedPhoneNumber, // fallbackPhone (normalized)
      firstName, // fallbackFirstName
      lastName, // fallbackLastName
      finalTrustedFormCertUrl || null, // TrustedForm certificate URL (stored as trustedform_cert_url)
      jornayaId || null // Journaya Lead ID (stored in quiz_answers)
    );
    console.log('✅ Lead upserted:', lead.id);

    // Prepare GHL webhook payload - use normalized phone number
    const formattedPhone = formatPhoneForGHL(normalizedPhoneNumber);
    
    // Extract phone last 4 digits from normalized number
    const phoneLast4 = normalizedPhoneNumber ? normalizedPhoneNumber.slice(-4) : '';
    
    // Extract address info from quizAnswers, addressInfo parameter, or locationInfo
    // For CRO-optimized funnel: ZIP only (no full address)
    // For reverse mortgage: full address is available
    const addressData = quizAnswers?.addressInfo || quizAnswers?.locationInfo || {};
    const streetNumber = addressData.streetNumber || '';
    const address = addressData.street || addressData.fullAddress || '';
    const city = addressData.city || '';
    const addressState = addressData.stateAbbr || addressData.state || state || '';
    // For CRO-optimized: use zipCode directly if available (from zip-only field)
    // For reverse mortgage: use zipCode from addressInfo
    const addressZip = addressData.zipCode || quizAnswers?.zipCode || zipCode || '';
    
    // Extract coverage_amount - handle both annuity and final expense quizzes
    const retirementSavings = quizAnswers?.retirementSavings || 0;
    const allocationPercent = quizAnswers?.allocationPercent?.percentage || quizAnswers?.allocationPercent || 0;
    const finalExpenseCoverage = quizAnswers?.coverageAmount || 0;
    
    // For final expense, use coverageAmount directly; for annuity, calculate from allocation
    const coverageAmount = funnelType === 'final-expense-quote' && finalExpenseCoverage > 0
      ? finalExpenseCoverage
      : (typeof allocationPercent === 'number' && allocationPercent > 0
          ? Math.round((retirementSavings * allocationPercent) / 100)
          : retirementSavings);
    
    // Extract originally_created timestamp
    const originallyCreated = new Date().toISOString();
    
    // Get the appropriate webhook URL based on funnel type
    const ghlWebhookUrl = getGHLWebhookUrl(funnelType);
    
    // Extract UTM parameters (flatten for final-expense-quote)
    const utmSource = utmParams?.utm_source || lead.quiz_answers?.utm_parameters?.utm_source || '';
    const utmMedium = utmParams?.utm_medium || lead.quiz_answers?.utm_parameters?.utm_medium || '';
    const utmCampaign = utmParams?.utm_campaign || lead.quiz_answers?.utm_parameters?.utm_campaign || '';
    const utmTerm = utmParams?.utm_term || lead.quiz_answers?.utm_parameters?.utm_term || '';
    const utmContent = utmParams?.utm_content || lead.quiz_answers?.utm_parameters?.utm_content || '';
    
    // Get referrer and landing page from analytics_events
    let referrer = null;
    let landingPage = null;
    if (sessionId) {
      const { data: sessionEvent } = await callreadyQuizDb
        .from('analytics_events')
        .select('referrer, page_url')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (sessionEvent) {
        referrer = sessionEvent.referrer || null;
        landingPage = sessionEvent.page_url || null;
      }
    }
    
    // Extract final expense specific fields from quiz answers
    const quizData = lead.quiz_answers || quizAnswers || {};
    const ageRange = quizData.ageRange || '';
    const healthStatus = quizData.healthStatus || '';
    const tobaccoUse = quizData.tobaccoUse || '';
    const coveragePurpose = Array.isArray(quizData.coveragePurpose) 
      ? quizData.coveragePurpose.join(',') 
      : (quizData.coveragePurpose || '');
    
    // Extract beneficiary relationship (new CRO-optimized field)
    const beneficiaryRelationship = quizData.beneficiaryRelationship || '';
    
    // For reverse mortgage: Wait for trustedFormCertUrl and jornayaLeadId from Supabase
    // These values may be populated asynchronously, so we need to poll until they're available
    // Use null/undefined check instead of empty string to ensure proper falsy detection
    let savedTrustedFormCertUrl = lead.trustedform_cert_url || 
                                  lead.quiz_answers?.trusted_form_cert_url || 
                                  lead.quiz_answers?.trustedFormCertUrl ||
                                  finalTrustedFormCertUrl || 
                                  null; // Use null instead of empty string
    
    let savedJornayaLeadId = jornayaId || 
                             lead.quiz_answers?.jornayaLeadId || 
                             lead.quiz_answers?.jornaya_lead_id || 
                             lead.quiz_answers?.jornaya_leadid || 
                             null;
    
    // Normalize empty strings to null for consistent checking
    if (savedTrustedFormCertUrl === '') savedTrustedFormCertUrl = null;
    if (savedJornayaLeadId === '') savedJornayaLeadId = null;
    
    // For reverse mortgage, wait and poll for required fields
    console.log('[DEBUG] 🔵 Checking funnel type for polling', { 
      funnelType, 
      isReverseMortgage: funnelType === 'reverse-mortgage' || funnelType === 'reverse-mortgage-calculator',
      savedTrustedFormCertUrl: savedTrustedFormCertUrl || 'EMPTY', 
      savedJornayaLeadId: savedJornayaLeadId || 'NULL'
    })
    
    if (funnelType === 'reverse-mortgage' || funnelType === 'reverse-mortgage-calculator') {
      const MAX_RETRIES = 10; // Maximum number of retries
      const RETRY_DELAY_MS = 500; // Wait 500ms between retries
      let retryCount = 0;
      const backendPollStartTime = Date.now();
      
      console.log('[DEBUG] 🔵 Backend polling check started - ENTERING POLLING BLOCK', { 
        funnelType, 
        isReverseMortgage: true, 
        savedTrustedFormCertUrl: savedTrustedFormCertUrl || 'EMPTY', 
        savedJornayaLeadId: savedJornayaLeadId || 'NULL (optional)', 
        leadId: lead.id,
        willPoll: !savedTrustedFormCertUrl // Only poll for TrustedForm
      })
      
      console.log('🔵 APLINE WEBHOOK - Checking for required fields:', {
        trustedFormCertUrl: savedTrustedFormCertUrl || 'MISSING',
        jornayaLeadId: savedJornayaLeadId || 'MISSING',
        leadId: lead.id
      });
      
      // Poll until TrustedForm is available (Jornaya is optional - don't block on it)
      while (!savedTrustedFormCertUrl && retryCount < MAX_RETRIES) {
        retryCount++;
        const iterationStartTime = Date.now();
        
        console.log('[DEBUG] 🔵 Backend polling iteration start', { 
          retryCount, 
          MAX_RETRIES, 
          hasTrustedForm: !!savedTrustedFormCertUrl, 
          hasJornaya: !!savedJornayaLeadId, 
          conditionResult: !savedTrustedFormCertUrl && retryCount < MAX_RETRIES,
          trustedFormValue: savedTrustedFormCertUrl || 'EMPTY',
          jornayaValue: savedJornayaLeadId || 'NULL (optional)'
        })
        
        console.log(`🔵 APLINE WEBHOOK - Retry ${retryCount}/${MAX_RETRIES} - Waiting for TrustedForm (Jornaya optional)...`);
        
        // Wait before retrying
        const waitStartTime = Date.now();
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
        const waitEndTime = Date.now();
        console.log('[DEBUG] 🔵 Backend wait completed', { 
          retryCount, 
          waitDuration: waitEndTime - waitStartTime, 
          expectedDelay: RETRY_DELAY_MS 
        })
        
        // Fetch latest lead data from Supabase
        try {
          const dbFetchStartTime = Date.now();
          const { data: updatedLead, error: fetchError } = await callreadyQuizDb
            .from('leads')
            .select('trustedform_cert_url, quiz_answers')
            .eq('id', lead.id)
            .single();
          const dbFetchEndTime = Date.now();
          
          console.log('[DEBUG] 🔵 Database fetch result', { 
            retryCount, 
            hasError: !!fetchError, 
            hasData: !!updatedLead, 
            dbFetchDuration: dbFetchEndTime - dbFetchStartTime, 
            trustedform_cert_url: updatedLead?.trustedform_cert_url || 'NULL', 
            quiz_answers_trusted_form: updatedLead?.quiz_answers?.trusted_form_cert_url || 'NULL', 
            quiz_answers_jornaya: updatedLead?.quiz_answers?.jornayaLeadId || 'NULL' 
          })
          
          if (!fetchError && updatedLead) {
            // Update values from fresh database fetch
            const oldTrustedForm = savedTrustedFormCertUrl;
            const oldJornaya = savedJornayaLeadId;
            
            savedTrustedFormCertUrl = updatedLead.trustedform_cert_url || 
                                     updatedLead.quiz_answers?.trusted_form_cert_url || 
                                     updatedLead.quiz_answers?.trustedFormCertUrl ||
                                     savedTrustedFormCertUrl || 
                                     null; // Use null instead of empty string
            
            savedJornayaLeadId = updatedLead.quiz_answers?.jornayaLeadId || 
                                updatedLead.quiz_answers?.jornaya_lead_id || 
                                updatedLead.quiz_answers?.jornaya_leadid || 
                                savedJornayaLeadId || 
                                null;
            
            // Normalize empty strings to null
            if (savedTrustedFormCertUrl === '') savedTrustedFormCertUrl = null;
            if (savedJornayaLeadId === '') savedJornayaLeadId = null;
            
            console.log('[DEBUG] 🔵 Values updated from DB', { 
              retryCount, 
              oldTrustedForm: oldTrustedForm || 'EMPTY', 
              newTrustedForm: savedTrustedFormCertUrl || 'EMPTY', 
              oldJornaya: oldJornaya || 'NULL', 
              newJornaya: savedJornayaLeadId || 'NULL', 
              changed: oldTrustedForm !== savedTrustedFormCertUrl || oldJornaya !== savedJornayaLeadId 
            })
            
            console.log(`🔵 APLINE WEBHOOK - Retry ${retryCount} result:`, {
              trustedFormCertUrl: savedTrustedFormCertUrl || 'STILL MISSING',
              jornayaLeadId: savedJornayaLeadId || 'STILL MISSING'
            });
          }
        } catch (pollError) {
          console.log('[DEBUG] 🔵 Database fetch error', { 
            retryCount, 
            error: String(pollError) 
          })
          console.warn(`🔵 APLINE WEBHOOK - Error polling lead data (retry ${retryCount}):`, pollError);
        }
        
        const iterationEndTime = Date.now();
        console.log('[DEBUG] 🔵 Backend polling iteration end', { 
          retryCount, 
          iterationDuration: iterationEndTime - iterationStartTime, 
          hasTrustedForm: !!savedTrustedFormCertUrl, 
          hasJornaya: !!savedJornayaLeadId, 
          willContinue: !savedTrustedFormCertUrl && retryCount < MAX_RETRIES 
        })
      }
      
      const backendPollEndTime = Date.now();
      const totalBackendPollTime = backendPollEndTime - backendPollStartTime;
      console.log('[DEBUG] 🔵 Backend polling completed', { 
        retryCount, 
        MAX_RETRIES, 
        totalBackendPollTime, 
        savedTrustedFormCertUrl: savedTrustedFormCertUrl || 'EMPTY', 
        savedJornayaLeadId: savedJornayaLeadId || 'NULL (optional)', 
        hasTrustedForm: !!savedTrustedFormCertUrl,
        hasJornaya: !!savedJornayaLeadId
      })
      
      // Final check - only TrustedForm is required (Jornaya is optional)
      const hasTrustedForm = savedTrustedFormCertUrl && savedTrustedFormCertUrl !== '';
      const hasJornaya = savedJornayaLeadId && savedJornayaLeadId !== '';
      
      if (!hasTrustedForm) {
        console.error('🔵 APLINE WEBHOOK - CRITICAL: TrustedForm missing after retries (required):', {
          trustedFormCertUrl: savedTrustedFormCertUrl || 'MISSING',
          jornayaLeadId: savedJornayaLeadId || 'NULL (optional)',
          leadId: lead.id,
          retries: retryCount,
          hasTrustedForm,
          hasJornaya
        });
        
        // Return success but indicate webhook was not sent
        return createCorsResponse({
          success: true,
          leadId: lead.id,
          warning: 'Lead saved but APLINE webhook not sent - missing required field (trustedFormCertUrl)',
          missingFields: {
            trustedFormCertUrl: !hasTrustedForm,
            jornayaLeadId: !hasJornaya // Optional, but logged for visibility
          },
          leadSaved: true
        }, 200);
      }
      
      console.log('🔵 APLINE WEBHOOK - Required fields confirmed (Jornaya optional):', {
        trustedFormCertUrl: savedTrustedFormCertUrl ? 'PRESENT' : 'MISSING',
        jornayaLeadId: savedJornayaLeadId ? 'PRESENT' : 'NULL (optional)',
        retries: retryCount
      });
    } else {
      // For non-reverse-mortgage funnels, use original logic
      console.log('🔍 TrustedForm Cert URL Check:', {
        fromRequest: finalTrustedFormCertUrl || 'NOT IN REQUEST',
        fromSavedLead: lead.trustedform_cert_url || 'NOT IN LEAD',
        fromQuizAnswers: lead.quiz_answers?.trusted_form_cert_url || 'NOT IN QUIZ_ANSWERS',
        finalValue: savedTrustedFormCertUrl || 'EMPTY'
      });
    }
    
    // Extract Date of Birth (format: { month, day, year, dateString, iso })
    // Note: DOB not collected in CRO-optimized funnel, but keeping for backward compatibility
    const dateOfBirth = quizData.dateOfBirth;
    let dobFormatted = '';
    let dobMonth = '';
    let dobDay = '';
    let dobYear = '';
    if (dateOfBirth) {
      if (typeof dateOfBirth === 'object') {
        dobMonth = String(dateOfBirth.month || '').padStart(2, '0');
        dobDay = String(dateOfBirth.day || '').padStart(2, '0');
        dobYear = String(dateOfBirth.year || '');
        if (dobYear && dobMonth && dobDay) {
          dobFormatted = `${dobYear}-${dobMonth}-${dobDay}`;
        } else if (dateOfBirth.iso) {
          dobFormatted = dateOfBirth.iso.split('T')[0];
        } else if (dateOfBirth.dateString) {
          dobFormatted = dateOfBirth.dateString;
        }
      } else if (typeof dateOfBirth === 'string') {
        dobFormatted = dateOfBirth;
      }
    }
    
    // Extract country from addressInfo or default to 'US'
    // For CRO-optimized funnel: ZIP only, no addressInfo
    const addressInfo = quizData.addressInfo || {};
    const country = addressInfo.country || addressInfo.countryCode || 'US';
    
    const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0] ||
      request.headers.get('x-real-ip') ||
      null;
    const userAgent = request.headers.get('user-agent') || null;

    // Build flat payload structure (no nested objects)
    const ghlPayload: Record<string, any> = {
      // Contact Information
      firstName: firstName || contact.first_name,
      lastName: lastName || contact.last_name,
      email: email,
      phone: formattedPhone,
      phoneLast4: phoneLast4,
      
      // Address Information
      // For CRO-optimized: ZIP only, no full address
      // For reverse mortgage: full address is available
      address: streetNumber ? `${streetNumber} ${address}`.trim() : (address || addressData.fullAddress || ''), // Full address for reverse mortgage
      city: city || '', // May be empty for ZIP-only
      state: addressState || '', // May be empty for ZIP-only
      stateName: addressData.state || stateName || lead.state_name || '',
      zipCode: addressZip,
      country: country, // US or CA for Canada
      // Full address string for reverse mortgage
      fullAddress: addressData.fullAddress || (address && city && addressState && addressZip ? `${address}, ${city}, ${addressState} ${addressZip}` : ''),
      
      // System Fields
      ipAddress: ipAddress,
      source: funnelType === 'final-expense-quote' 
        ? 'SeniorSimple Final Expense Quiz' 
        : funnelType === 'reverse-mortgage' || funnelType === 'reverse-mortgage-calculator'
        ? 'SeniorSimple Reverse Mortgage Calculator'
        : 'SeniorSimple Quiz',
      funnelType: funnelType || lead.funnel_type || 'insurance',
      originallyCreated: originallyCreated,
      timestamp: new Date().toISOString(),
      sessionId: sessionId || lead.session_id || '',
      leadScore: 75, // Default lead score
    };
    
    // Add Date of Birth if available
    if (dobFormatted) {
      ghlPayload.dateOfBirth = dobFormatted;
      if (dobMonth) ghlPayload.dobMonth = dobMonth;
      if (dobDay) ghlPayload.dobDay = dobDay;
      if (dobYear) ghlPayload.dobYear = dobYear;
    }
    
    // Add reverse mortgage specific fields
    if (funnelType === 'reverse-mortgage' || funnelType === 'reverse-mortgage-calculator') {
      // Buyer-specific field names (matching their expected format)
      ghlPayload.first_name = firstName || contact.first_name || '';
      ghlPayload.last_name = lastName || contact.last_name || '';
      ghlPayload.full_name = `${ghlPayload.first_name} ${ghlPayload.last_name}`.trim();
      ghlPayload.tags = 'reverse-mortgage';
      ghlPayload.address1 = streetNumber ? `${streetNumber} ${address}`.trim() : (address || '');
      ghlPayload.postal_code = addressZip || '';
      ghlPayload.lead_id = lead.id || '';
      
      // Age 62+ status: "62" if true, empty string if false/unknown
      const is62Plus = quizData.is62Plus;
      ghlPayload.age_62 = is62Plus === true ? '62' : '';
      ghlPayload.age62Plus = is62Plus === true ? 'Yes' : 'No';
      
      // Status: "DQ" if under 62, otherwise "qualified" or "active"
      ghlPayload.status = is62Plus === false ? 'DQ' : 'qualified';
      
      // Homeowner status
      ghlPayload.isHomeowner = quizData.isHomeowner ? 'Yes' : 'No';
      
      // Reason for reverse mortgage
      if (quizData.reason) {
        ghlPayload.reason = quizData.reason;
      }
      
      // Age and age range
      if (quizData.age) {
        ghlPayload.age = quizData.age;
      }
      if (quizData.ageRange) {
        ghlPayload.ageRange = quizData.ageRange;
      }
      
      // Property data if available
      if (quizData.propertyData) {
        ghlPayload.propertyValue = quizData.propertyData.property_value || 0;
        ghlPayload.mortgageBalance = quizData.propertyData.mortgage_balance || 0;
        ghlPayload.equityAvailable = quizData.propertyData.equity_available || 0;
      }
      
      // Calculation results if available
      if (quizData.calculation) {
        ghlPayload.estimatedNetProceeds = quizData.calculation.netProceeds || 0;
        ghlPayload.estimatedGrossProceeds = quizData.calculation.grossProceeds || 0;
      }
    }
    // Add final expense specific fields if this is a final expense quote
    else if (funnelType === 'final-expense-quote') {
      ghlPayload.coverageAmount = coverageAmount;
      ghlPayload.ageRange = ageRange;
      ghlPayload.tobaccoUse = tobaccoUse;
      // Beneficiary relationship (new CRO-optimized field)
      if (beneficiaryRelationship) {
        ghlPayload.beneficiaryRelationship = beneficiaryRelationship;
      }
      // Health status and coverage purpose (optional, may not be present in CRO-optimized)
      if (healthStatus) {
        ghlPayload.healthStatus = healthStatus;
      }
      if (coveragePurpose) {
        ghlPayload.coveragePurpose = coveragePurpose;
      }
    } else {
      // For annuity/retirement quotes - include all quiz fields
      ghlPayload.coverageAmount = coverageAmount;
      ghlPayload.retirementSavings = quizData.retirementSavings;
      ghlPayload.ageRange = quizData.ageRange;
      ghlPayload.retirementTimeline = quizData.retirementTimeline;
      ghlPayload.riskTolerance = quizData.riskTolerance;
      
      // Allocation percentage (flatten from object if needed)
      if (quizData.allocationPercent) {
        if (typeof quizData.allocationPercent === 'object') {
          ghlPayload.allocationPercent = quizData.allocationPercent.percentage || quizData.allocationPercent.allocation;
          ghlPayload.allocationAmount = quizData.allocationPercent.amount;
        } else {
          ghlPayload.allocationPercent = quizData.allocationPercent;
        }
      }
      
      // Current retirement plans (convert array to comma-separated string for GHL)
      if (quizData.currentRetirementPlans && Array.isArray(quizData.currentRetirementPlans)) {
        ghlPayload.currentRetirementPlans = quizData.currentRetirementPlans.join(', ');
      }
      
      // Calculated results (projected income)
      if (quizData.calculated_results) {
        ghlPayload.projectedMonthlyIncomeMin = quizData.calculated_results.projected_monthly_income_min;
        ghlPayload.projectedMonthlyIncomeMax = quizData.calculated_results.projected_monthly_income_max;
      }
    }
    
    // Add UTM parameters (flat structure)
    if (utmSource) ghlPayload.utmSource = utmSource;
    if (utmMedium) ghlPayload.utmMedium = utmMedium;
    if (utmCampaign) ghlPayload.utmCampaign = utmCampaign;
    if (utmTerm) ghlPayload.utmTerm = utmTerm;
    if (utmContent) ghlPayload.utmContent = utmContent;
    
    // Add TrustedForm and Journaya IDs (flat structure)
    // Use saved value from database (after Supabase save) - always include for reverse mortgage
    if (funnelType === 'reverse-mortgage' || funnelType === 'reverse-mortgage-calculator') {
      // For reverse mortgage, we've already confirmed these values exist via polling
      // Only include if they're not null/undefined/empty
      if (savedTrustedFormCertUrl && savedTrustedFormCertUrl !== '') {
        ghlPayload.trustedFormCertUrl = savedTrustedFormCertUrl;
        ghlPayload.trusted_form_cert_url = savedTrustedFormCertUrl;
        ghlPayload.trusted_form = savedTrustedFormCertUrl;
      }
      
      // Add jornayaLeadId (confirmed via polling)
      if (savedJornayaLeadId && savedJornayaLeadId !== '') {
        ghlPayload.jornayaLeadId = savedJornayaLeadId;
        ghlPayload.jornaya_lead_id = savedJornayaLeadId;
        ghlPayload.jornaya_leadid = savedJornayaLeadId;
      }
    } else {
      // For other funnels, use original logic
      if (savedTrustedFormCertUrl) {
        ghlPayload.trustedFormCertUrl = savedTrustedFormCertUrl;
        ghlPayload.trusted_form_cert_url = savedTrustedFormCertUrl;
      }
      if (jornayaId) {
        ghlPayload.jornayaLeadId = jornayaId;
        ghlPayload.jornaya_lead_id = jornayaId;
        ghlPayload.jornaya_leadid = jornayaId;
      }
    }
    
    // Add additional context if available
    if (landingPage) ghlPayload.landingPage = landingPage;
    if (referrer) ghlPayload.referrer = referrer;

    // Log with APLINE WEBHOOK label for reverse mortgage
    const webhookLabel = (funnelType === 'reverse-mortgage' || funnelType === 'reverse-mortgage-calculator') 
      ? '🔵 APLINE WEBHOOK' 
      : '📤 GHL Webhook';
    
    console.log(`${webhookLabel} - Sending to webhook:`, {
      url: ghlWebhookUrl,
      funnelType: funnelType,
      trustedFormCertUrl: savedTrustedFormCertUrl || 'NOT PROVIDED',
      payload: ghlPayload
    });

    // Fire Meta CAPI Lead event (after Supabase save, before GHL webhook)
    try {
      // Get funnel-specific pixel ID
      const funnelPixelId = getMetaPixelIdForFunnel(funnelType);
      
      const capiResult = await sendLeadEvent({
        leadId: lead.id,
        email: email,
        phone: phoneNumber,
        firstName: firstName,
        lastName: lastName,
        fbp: body.metaCookies?.fbp,
        fbc: body.metaCookies?.fbc,
        fbLoginId: body.metaCookies?.fbLoginId,
        ipAddress: ipAddress,
        userAgent: userAgent,
        value: coverageAmount || 0,
        currency: 'USD',
        customData: {
          quiz_type: funnelType,
          state: state || addressState || '',
          zip_code: zipCode || addressZip || '',
          coverage_amount: coverageAmount,
          retirement_savings: retirementSavings,
          allocation_percent: allocationPercent,
        },
        options: {
          pixelId: funnelPixelId, // Use funnel-specific pixel ID
        },
      });
      
      if (!capiResult.success) {
        console.error('[Meta CAPI] Lead event failed:', capiResult.error);
        // Don't fail the request - just log
      } else {
        console.log('[Meta CAPI] Lead event sent:', capiResult.eventId);
      }
    } catch (capiError) {
      console.error('[Meta CAPI] Error:', capiError);
      // Don't fail the request - CAPI is non-critical
    }

    // Send to GHL webhook with timeout
    const webhookRequestLabel = (funnelType === 'reverse-mortgage' || funnelType === 'reverse-mortgage-calculator') 
      ? '🔵 APLINE WEBHOOK - Making request...' 
      : '🚀 Making GHL webhook request...';
    
    console.log('[DEBUG] 🔵 About to send webhook - FINAL VALUES CHECK', {
      funnelType,
      webhookRequestLabel,
      trustedFormCertUrl: ghlPayload.trustedFormCertUrl || ghlPayload.trusted_form || 'MISSING',
      jornayaLeadId: ghlPayload.jornayaLeadId || ghlPayload.jornaya_lead_id || 'MISSING',
      savedTrustedFormCertUrl: savedTrustedFormCertUrl || 'EMPTY',
      savedJornayaLeadId: savedJornayaLeadId || 'NULL'
    })
    
    console.log(webhookRequestLabel);
    const WEBHOOK_TIMEOUT = 10000; // 10 seconds
    
    let ghlResponse: Response;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), WEBHOOK_TIMEOUT);
      
      ghlResponse = await fetch(ghlWebhookUrl, {
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
        const timeoutLabel = (funnelType === 'reverse-mortgage' || funnelType === 'reverse-mortgage-calculator') 
          ? '🔵 APLINE WEBHOOK - Timeout' 
          : '❌ GHL Webhook Timeout';
        console.error(`${timeoutLabel}:`, {
          url: ghlWebhookUrl,
          funnelType: funnelType,
          timeout: WEBHOOK_TIMEOUT,
          trustedFormCertUrl: savedTrustedFormCertUrl || 'NOT PROVIDED'
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

    const responseLabel = (funnelType === 'reverse-mortgage' || funnelType === 'reverse-mortgage-calculator') 
      ? '🔵 APLINE WEBHOOK - Response' 
      : '📡 GHL Response';
    console.log(`${responseLabel} Status:`, ghlResponse.status);
    console.log(`${responseLabel} Headers:`, Object.fromEntries(ghlResponse.headers.entries()));

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
    console.log(`${responseLabel} Body:`, ghlResponseData);

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
            webhook_url: ghlWebhookUrl,
            funnel_type: funnelType,
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
      const successLabel = (funnelType === 'reverse-mortgage' || funnelType === 'reverse-mortgage-calculator') 
        ? '🔵 APLINE WEBHOOK - Lead Sent Successfully' 
        : '✅ Lead Sent to GHL Successfully';
      console.log(`${successLabel}:`, { leadId: lead.id, status: ghlResponse.status, trustedFormCertUrl: savedTrustedFormCertUrl || 'NOT PROVIDED' });
      
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
      const errorLabel = (funnelType === 'reverse-mortgage' || funnelType === 'reverse-mortgage-calculator') 
        ? '🔵 APLINE WEBHOOK - Failed' 
        : '❌ GHL Webhook Failed';
      console.error(`${errorLabel}:`, { 
        status: ghlResponse.status,
        statusText: ghlResponse.statusText,
        response: ghlResponseData,
        payload: ghlPayload,
        url: ghlWebhookUrl,
        funnelType: funnelType,
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
      name: error.name,
      code: error.code,
      details: error.details || error.hint || error.message,
      timestamp: new Date().toISOString()
    });

    // Log specific error types for debugging
    if (error.code) {
      console.error('❌ Database Error Code:', error.code);
    }
    if (error.details) {
      console.error('❌ Error Details:', error.details);
    }
    if (error.hint) {
      console.error('❌ Error Hint:', error.hint);
    }

    return createCorsResponse({ 
      success: false,
      error: error.message || 'Internal server error',
      code: error.code || undefined,
      details: process.env.NODE_ENV === 'development' ? error.details : undefined,
      timestamp: new Date().toISOString()
    }, 500);
  }
}

