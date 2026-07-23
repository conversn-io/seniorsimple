import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Lazy-init: see /api/poll/route.ts for full rationale. Module-load createClient
// throws "supabaseKey is required" during `next build` when env var is missing.
// Typed `any` to avoid createClient's generic database type collapsing to never.
let _supabase: any = null
function getSupabase() {
  if (_supabase) return _supabase
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error('Supabase not configured: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing')
  }
  _supabase = createClient(url, key)
  return _supabase
}

const SITE_ID = process.env.NEXT_PUBLIC_SITE_ID || 'seniorsimple'

// Simple in-memory rate limiter: 5 requests per IP per minute
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60_000 })
    return false
  }
  entry.count++
  return entry.count > 5
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { success: false, error: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { email, first_name, zip_code, source, source_detail, tags, quiz_bucket, rx_level } = body
    const site_id = body.site_id || SITE_ID

    // §2 Medicare Bucket Quiz — validate quiz_bucket + rx_level if present.
    // DB CHECK constraints are the authority; validate here so bad input
    // returns a 400 instead of a downstream 500.
    const VALID_BUCKETS = ['advantage', 'medigap', 'dual', 'working'] as const
    if (quiz_bucket && !VALID_BUCKETS.includes(quiz_bucket)) {
      return NextResponse.json(
        { success: false, error: `quiz_bucket must be one of ${VALID_BUCKETS.join(', ')}` },
        { status: 400 }
      )
    }
    const VALID_RX_LEVELS = ['several', 'few', 'none'] as const
    if (rx_level && !VALID_RX_LEVELS.includes(rx_level)) {
      return NextResponse.json(
        { success: false, error: `rx_level must be one of ${VALID_RX_LEVELS.join(', ')}` },
        { status: 400 }
      )
    }

    // Validation
    if (!email || !site_id) {
      return NextResponse.json(
        { success: false, error: 'email and site_id are required' },
        { status: 400 }
      )
    }
    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      )
    }

    const supabase = getSupabase()

    // Check if subscriber already exists
    const { data: existing } = await supabase
      .from('newsletter_subscribers')
      .select('id, status, tags')
      .eq('email', email.toLowerCase())
      .eq('site_id', site_id)
      .single()

    let subscriberId: string
    let isNew: boolean

    if (existing) {
      // Existing subscriber — merge tags and reactivate if unsubscribed
      isNew = false
      subscriberId = existing.id
      const existingTags: string[] = existing.tags || []
      const incomingTags: string[] = tags || []
      const mergedTags = [...new Set([...existingTags, ...incomingTags])]

      const updatePayload: Record<string, unknown> = {
        tags: mergedTags,
        updated_at: new Date().toISOString(),
      }
      // Reactivate if previously unsubscribed
      if (existing.status === 'unsubscribed') {
        updatePayload.status = 'active'
        updatePayload.unsubscribed_at = null
      }
      // Merge optional fields if provided
      if (first_name) updatePayload.first_name = first_name
      if (zip_code) updatePayload.zip_code = zip_code
      if (source) updatePayload.source = source
      if (source_detail) updatePayload.source_detail = source_detail
      // Only stamp quiz_bucket / rx_level when this call carries one — never
      // null out an existing value. A later non-quiz capture on the same
      // email shouldn't erase the person's resolved lane or Part D signal.
      if (quiz_bucket) updatePayload.quiz_bucket = quiz_bucket
      if (rx_level) updatePayload.rx_level = rx_level

      const { error: updateError } = await supabase
        .from('newsletter_subscribers')
        .update(updatePayload)
        .eq('id', existing.id)

      if (updateError) {
        console.error('Subscribe update error:', updateError)
        return NextResponse.json(
          { success: false, error: 'Failed to update subscriber' },
          { status: 500 }
        )
      }
    } else {
      // New subscriber — insert
      isNew = true
      const now = new Date().toISOString()
      const { data: inserted, error: insertError } = await supabase
        .from('newsletter_subscribers')
        .insert({
          email: email.toLowerCase(),
          site_id,
          first_name: first_name || null,
          zip_code: zip_code || null,
          source: source || null,
          source_detail: source_detail || null,
          tags: tags || [],
          quiz_bucket: quiz_bucket || null,
          rx_level: rx_level || null,
          status: 'active',
          subscribed_at: now,
          created_at: now,
          updated_at: now,
        })
        .select('id')
        .single()

      if (insertError) {
        console.error('Subscribe insert error:', insertError)
        return NextResponse.json(
          { success: false, error: 'Failed to create subscriber' },
          { status: 500 }
        )
      }
      subscriberId = inserted!.id
    }

    return NextResponse.json({
      success: true,
      subscriber_id: subscriberId,
      is_new: isNew,
      site: site_id,
    })
  } catch (err) {
    console.error('Subscribe route error:', err)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
