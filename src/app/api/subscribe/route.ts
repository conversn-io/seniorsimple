import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

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
    const { email, first_name, zip_code, source, source_detail, tags } = body
    const site_id = body.site_id || SITE_ID

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
