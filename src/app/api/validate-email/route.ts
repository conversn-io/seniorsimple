import { NextRequest, NextResponse } from 'next/server';

// In-memory cache (10 minute TTL)
const emailCache = new Map<string, { result: any; timestamp: number }>();
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }
    
    // Check cache
    const cached = emailCache.get(email);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return NextResponse.json(cached.result);
    }
    
    // Call MillionVerifier API
    const apiKey = process.env.MILLIONVERIFIER_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({ error: 'MillionVerifier not configured' }, { status: 500 });
    }
    
    const apiUrl = `https://api.millionverifier.com/api/v3/?api=${apiKey}&email=${encodeURIComponent(email)}`;
    
    const response = await fetch(apiUrl, {
      method: 'GET'
    });
    
    const data = await response.json();
    
    // MillionVerifier returns: 0=ok, 1=bad, 2=unknown, etc.
    const result = {
      valid: data.resultcode === 0,
      deliverable: data.resultcode === 0,
      disposable: data.disposable === '1',
      roleBased: data.role === '1',
      error: data.resultcode !== 0 ? 'Invalid email address' : undefined
    };
    
    emailCache.set(email, { result, timestamp: Date.now() });
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('Email validation error:', error);
    return NextResponse.json({ error: 'Validation failed' }, { status: 500 });
  }
}





