import { NextRequest, NextResponse } from 'next/server';
import { sendViewContentEvent, getMetaPixelIdForFunnel } from '@/lib/meta-capi-service';

/**
 * POST /api/capi/view-content
 * Fire a server-side ViewContent event to Meta CAPI.
 * Called from client pages after high-value content is displayed (e.g., property results).
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      eventId,
      email,
      phone,
      firstName,
      lastName,
      city,
      state,
      zipCode,
      dateOfBirth,
      externalId,
      value,
      contentName,
      contentCategory,
      funnelType,
      customData,
      eventSourceUrl,
    } = body;

    if (!eventId) {
      return NextResponse.json({ error: 'eventId is required' }, { status: 400 });
    }

    // Extract cookies from request body (client captures them)
    const fbp = body.fbp || body.metaCookies?.fbp || null;
    const fbc = body.fbc || body.metaCookies?.fbc || null;

    // Server-side data
    const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip')
      || '';
    const userAgent = request.headers.get('user-agent') || '';

    const pixelId = getMetaPixelIdForFunnel(funnelType);

    const result = await sendViewContentEvent({
      eventId,
      email,
      phone,
      firstName,
      lastName,
      fbp,
      fbc,
      ipAddress,
      userAgent,
      city,
      state,
      zipCode,
      country: 'US',
      dateOfBirth: dateOfBirth ? String(dateOfBirth).replace(/-/g, '') : null,
      externalId,
      value: value || 0,
      currency: 'USD',
      contentName: contentName || 'Property Results',
      contentCategory: contentCategory || funnelType || 'reverse-mortgage',
      customData,
      eventSourceUrl,
      options: { pixelId },
    });

    if (result.success) {
      console.log(`[Meta CAPI] ViewContent sent: eventId=${result.eventId} value=${value}`);
    } else {
      console.error(`[Meta CAPI] ViewContent failed: ${result.error}`);
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[Meta CAPI] ViewContent error:', error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
