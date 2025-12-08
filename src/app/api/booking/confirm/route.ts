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

export async function POST(req: NextRequest) {
  if (REQUIRED_SECRET) {
    const headerSecret = req.headers.get('x-booking-secret')
    if (!headerSecret || headerSecret !== REQUIRED_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  try {
    const body = await req.json()
    const email = (body.email || '').toString().trim().toLowerCase()
    const phone = (body.phone || '').toString().trim()
    const name = (body.name || '').toString().trim()
    const appointmentId = body.appointmentId || body.id || body.appointment_id
    const source = body.event || body.source || 'webhook'

    const key = email || phone
    if (!key) {
      return NextResponse.json({ error: 'Missing email or phone' }, { status: 400 })
    }

    recordBooking(key, {
      email,
      phone,
      name,
      source,
      payload: { appointmentId, raw: body },
    })

    return NextResponse.json({ success: true, key })
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

  if (!key) {
    return NextResponse.json({ error: 'Missing email or phone' }, { status: 400 })
  }

  const confirmed = hasBooking(key)
  const record = confirmed ? getBooking(key) : null

  return NextResponse.json({
    confirmed,
    name: record?.name,
    email: record?.email,
    phone: record?.phone,
    source: record?.source,
    payload: record?.payload, // Include full payload (appointmentId, bookingTimes, etc.)
  })
}

