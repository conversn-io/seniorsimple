import { NextRequest, NextResponse } from 'next/server';

const FINAL_EXPENSE_GHL_WEBHOOK_URL = "https://services.leadconnectorhq.com/hooks/vTM82D7FNpIlnPgw6XNC/webhook-trigger/28ef726d-7ead-4cd2-aa85-dfc6192adfb6";

/**
 * Test endpoint to send a flat payload structure for final-expense-quote
 * POST /api/leads/test-final-expense-webhook
 */
export async function POST(request: NextRequest) {
  try {
    // Sample flat payload for final-expense-quote with realistic test data
    // This payload is designed to activate Facebook Pixel and CAPI tracking in GHL
    // Includes DOB and country for US and Canada support
    const now = Date.now();
    const testDate = new Date(1965, 5, 15); // June 15, 1965 (age ~60)
    
    const flatPayload = {
      // Contact Information
      firstName: "Test",
      lastName: "Conversion",
      email: `test.conversion.${now}@seniorsimple.org`,
      phone: "+15551234567",
      phoneLast4: "4567",
      
      // Address Information
      address: "123 Main Street",
      city: "Phoenix",
      state: "AZ",
      stateName: "Arizona",
      zipCode: "85001",
      country: "US", // US or CA for Canada
      
      // Date of Birth (ISO format: YYYY-MM-DD)
      dateOfBirth: testDate.toISOString().split('T')[0], // "1965-06-15"
      dobMonth: "06",
      dobDay: "15",
      dobYear: "1965",
      
      // Final Expense Specific Fields
      coverageAmount: 15000,
      ageRange: "60-69",
      healthStatus: "Good - Managed conditions, no recent hospitalizations",
      tobaccoUse: "No, never",
      coveragePurpose: "Funeral & Burial Costs,Leave Money to Family",
      
      // System Fields
      ipAddress: "192.168.1.1",
      source: "SeniorSimple Final Expense Quiz",
      funnelType: "final-expense-quote",
      originallyCreated: new Date().toISOString(),
      timestamp: new Date().toISOString(),
      
      // UTM Parameters (flat) - Critical for Facebook CAPI tracking
      utmSource: "facebook",
      utmMedium: "cpc",
      utmCampaign: "final_expense_test_conversion",
      utmTerm: "test",
      utmContent: "test_conversion_webhook",
      
      // Session Tracking - Important for deduplication
      sessionId: `test_conversion_${now}`,
      
      // Lead Scoring
      leadScore: 85,
      
      // Additional Context - Helps with attribution
      landingPage: "/final-expense-quote",
      referrer: "https://www.facebook.com",
    };

    console.log('📤 Sending flat payload to GHL webhook:', JSON.stringify(flatPayload, null, 2));

    const response = await fetch(FINAL_EXPENSE_GHL_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(flatPayload),
    });

    const responseText = await response.text();
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = { raw: responseText };
    }

    console.log('📥 GHL Webhook Response:', {
      status: response.status,
      statusText: response.statusText,
      data: responseData,
    });

    return NextResponse.json({
      success: response.ok,
      status: response.status,
      payload: flatPayload,
      response: responseData,
    }, { status: response.ok ? 200 : 400 });

  } catch (error: any) {
    console.error('❌ Error testing webhook:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack,
    }, { status: 500 });
  }
}

