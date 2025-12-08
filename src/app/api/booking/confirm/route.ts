import { NextRequest, NextResponse } from 'next/server'
import { recordBooking, hasBooking, getBooking } from '@/lib/bookingConfirmationStore'

/**
 * Booking Confirmation Webhook
 *
 * Intended for GHL (or Conversn) appointment creation webhooks.
 * Expects JSON with at least { email } or { phone } to key the session.
 *
 * Security:
 * - Provide a shared secret header: "x-booking-secret: <value>"
 * - Set BOOKING_WEBHOOK_SECRET in environment.
 *
 * How to call from GHL webhook:
 *   POST https://yourdomain.com/api/booking/confirm
 *   Headers:
 *     Content-Type: application/json
 *     x-booking-secret: <your-secret>
 *   Body (example):
 *   {
 *     "email": "user@example.com",
 *     "phone": "+16193335531",
 *     "name": "Keenan Shaw",
 *     "appointmentId": "abc123",
 *     "event": "appointment.created",
 *     "timestamp": "2025-12-08T12:00:00Z"
 *   }
 *
 * Front-end polling (example):
 *   GET /api/booking/confirm?email=user@example.com
 *   -> { confirmed: true } or { confirmed: false }
 */

const REQUIRED_SECRET = process.env.BOOKING_WEBHOOK_SECRET

// Handle OPTIONS for CORS preflight
export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, x-booking-secret',
    },
  })
}

export async function POST(req: NextRequest) {
  if (REQUIRED_SECRET) {
    const headerSecret = req.headers.get('x-booking-secret')
    if (!headerSecret || headerSecret !== REQUIRED_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  try {
    const body = await req.json()
    
    // Active logging for debugging
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📥 BOOKING WEBHOOK POST RECEIVED')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📋 Full Request Body:', JSON.stringify(body, null, 2))
    console.log('📋 Body Keys:', Object.keys(body))
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    
    const email = (body.email || '').toString().trim().toLowerCase()
    const phone = (body.phone || '').toString().trim()
    const name = (body.name || '').toString().trim()
    const appointmentId = body.appointmentId || body.id || body.appointment_id
    const source = body.event || body.source || 'webhook'
    const bookingTimes = body.bookingTimes || body.start_time || body.appointment?.start_time

    console.log('🔍 Extracted Data:')
    console.log('  - Email:', email || '❌ NOT FOUND')
    console.log('  - Phone:', phone || '❌ NOT FOUND')
    console.log('  - Name:', name || '❌ NOT FOUND')
    console.log('  - Appointment ID:', appointmentId || '❌ NOT FOUND')
    console.log('  - Booking Times:', bookingTimes || '❌ NOT FOUND')
    console.log('  - Source:', source)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

    const key = email || phone
    if (!key) {
      console.error('❌ Missing email or phone in webhook payload')
      return NextResponse.json({ error: 'Missing email or phone' }, { status: 400 })
    }

    const bookingData = {
      email,
      phone,
      name,
      source,
      payload: { appointmentId, bookingTimes, raw: body },
    }
    
    console.log('💾 Storing booking data:', JSON.stringify(bookingData, null, 2))
    recordBooking(key, bookingData)
    console.log('✅ Booking data stored successfully')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

    return NextResponse.json(
      { success: true, key },
      {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, x-booking-secret',
        },
      }
    )
  } catch (error) {
    console.error('Booking webhook error:', error)
    return NextResponse.json(
      { error: 'Invalid payload' },
      { status: 400 }
    )
  }
}

// Simple polling endpoint: GET /api/booking/confirm?email=... or ?phone=...
export async function GET(req: NextRequest) {
  const email = (req.nextUrl.searchParams.get('email') || '').toString().trim().toLowerCase()
  const phone = (req.nextUrl.searchParams.get('phone') || '').toString().trim()
  const key = email || phone

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📥 BOOKING CONFIRMATION GET REQUEST')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🔍 Query Params:', { email, phone, key })

  if (!key) {
    console.error('❌ Missing email or phone in query params')
    return NextResponse.json({ error: 'Missing email or phone' }, { status: 400 })
  }

  const confirmed = hasBooking(key)
  const record = confirmed ? getBooking(key) : null

  console.log('📋 Record Status:', {
    confirmed,
    hasRecord: !!record,
    recordKeys: record ? Object.keys(record) : [],
  })

  if (record) {
    console.log('📋 Full Record:', JSON.stringify(record, null, 2))
    console.log('📋 Record Payload:', JSON.stringify(record.payload, null, 2))
  }

  // Explicitly extract payload data for better serialization
  const payload = record?.payload || {}
  const appointmentId = payload?.appointmentId || payload?.id || payload?.appointment_id
  const rawPayload = payload?.raw || {}
  const bookingTimes = payload?.bookingTimes || rawPayload?.bookingTimes || rawPayload?.start_time || rawPayload?.appointment?.start_time

  console.log('🔍 Extracted Payload Data:')
  console.log('  - Appointment ID:', appointmentId || '❌ NOT FOUND')
  console.log('  - Booking Times:', bookingTimes || '❌ NOT FOUND')
  console.log('  - Raw Payload Keys:', Object.keys(rawPayload))
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  const response = {
    confirmed,
    name: record?.name,
    email: record?.email,
    phone: record?.phone,
    source: record?.source,
    payload: {
      appointmentId,
      bookingTimes,
      raw: rawPayload,
    },
  }

  console.log('📤 Response:', JSON.stringify(response, null, 2))
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  return NextResponse.json(response)
}

