import { NextRequest, NextResponse } from 'next/server';

// In-memory cache (5 minute TTL)
const phoneCache = new Map<string, { result: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json();
    
    if (!phone) {
      return NextResponse.json({ error: 'Phone number required' }, { status: 400 });
    }
    
    // Check cache
    const cached = phoneCache.get(phone);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return NextResponse.json(cached.result);
    }
    
    // Format phone for Twilio (E.164 format: +1XXXXXXXXXX)
    const digits = phone.replace(/\D/g, '');
    const e164Phone = digits.length === 10 ? `+1${digits}` : phone;
    
    // Call Twilio Lookup API
    const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
    const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
    
    if (!twilioAccountSid || !twilioAuthToken) {
      return NextResponse.json({ error: 'Twilio not configured' }, { status: 500 });
    }
    
    const twilioUrl = `https://lookups.twilio.com/v1/PhoneNumbers/${e164Phone}`;
    const auth = Buffer.from(`${twilioAccountSid}:${twilioAuthToken}`).toString('base64');
    
    const response = await fetch(twilioUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${auth}`
      }
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      // Invalid number
      const result = { valid: false, error: 'Invalid phone number' };
      phoneCache.set(phone, { result, timestamp: Date.now() });
      return NextResponse.json(result);
    }
    
    // Valid number
    const result = {
      valid: true,
      lineType: data.line_type_identity,
      carrier: data.carrier?.name,
      nationalFormat: data.national_format
    };
    
    phoneCache.set(phone, { result, timestamp: Date.now() });
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('Phone validation error:', error);
    return NextResponse.json({ error: 'Validation failed' }, { status: 500 });
  }
}

