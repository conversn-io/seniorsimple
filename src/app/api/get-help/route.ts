// §7-E write path for /get-help/<vertical>.
//
// Contract (packet §5 + §7-E acceptance):
//   - Server-computed hem_sha256 from email (never trust client hash).
//   - Writes CRM lead (funnel_type = 'GetHelp:<vertical>') so phone leads
//     from this route are attributable to the get-help path, not article
//     content. Carries quiz_bucket + hem_sha256 for identity-bridge join.
//   - Mirrors to publishare newsletter_subscribers with source='get_help',
//     source_detail='<vertical>' — best-effort, non-fatal (CRM lead is the
//     primary record).
//
// This route is intentionally the ONE phone-capture endpoint. Article-level
// forms (the legacy Medicare quote form) are removed per §7-B.

import { NextRequest } from 'next/server'
import { callreadyQuizDb } from '@/lib/callready-quiz-db'
import { createCorsResponse, handleCorsOptions } from '@/lib/cors-headers'
import { formatE164 } from '@/utils/phone-utils'
import * as crypto from 'crypto'

export async function OPTIONS() {
  return handleCorsOptions()
}

const VALID_VERTICALS = ['medicare', 'annuity', 'final-expense'] as const
const VALID_QUIZ_BUCKETS = ['advantage', 'medigap', 'dual', 'working'] as const

function hemSha256(email: string | null | undefined): string | null {
  if (!email) return null
  const norm = email.trim().toLowerCase()
  if (!norm) return null
  return crypto.createHash('sha256').update(norm).digest('hex')
}

function phoneHash(phone: string | null): string | null {
  if (!phone) return null
  return crypto.createHash('sha256').update(phone).digest('hex')
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      vertical,
      firstName,
      lastName,
      phone,
      zip,
      email,
      quizBucket: rawQuizBucket,
      sourceSlug,
    } = body

    if (!vertical || !(VALID_VERTICALS as readonly string[]).includes(vertical)) {
      return createCorsResponse({ error: `vertical must be one of ${VALID_VERTICALS.join(', ')}` }, 400)
    }
    if (!phone) return createCorsResponse({ error: 'phone is required' }, 400)
    if (!zip || !/^\d{5}$/.test(zip)) {
      return createCorsResponse({ error: 'valid 5-digit zip is required' }, 400)
    }

    const quizBucket = rawQuizBucket && (VALID_QUIZ_BUCKETS as readonly string[]).includes(rawQuizBucket)
      ? rawQuizBucket
      : null
    const hem = hemSha256(email)
    const normalizedPhone = phone ? formatE164(phone) : null

    // Upsert contact by email or phone_hash — same pattern as
    // /api/leads/medicare-calculator upsertContact.
    let contact: any = null
    if (email) {
      const { data: byEmail } = await callreadyQuizDb
        .from('contacts')
        .select('*')
        .eq('email', email.toLowerCase())
        .maybeSingle()
      contact = byEmail
    }
    if (!contact && normalizedPhone) {
      const { data: byPhone } = await callreadyQuizDb
        .from('contacts')
        .select('*')
        .eq('phone_hash', phoneHash(normalizedPhone))
        .maybeSingle()
      contact = byPhone
    }
    if (contact?.id) {
      const patch: any = {}
      if (firstName && !contact.first_name) patch.first_name = firstName
      if (lastName && !contact.last_name) patch.last_name = lastName
      if (email && !contact.email) patch.email = email.toLowerCase()
      if (normalizedPhone && !contact.phone) {
        patch.phone = normalizedPhone
        patch.phone_hash = phoneHash(normalizedPhone)
      }
      if (Object.keys(patch).length > 0) {
        const { data: updated } = await callreadyQuizDb
          .from('contacts')
          .update(patch)
          .eq('id', contact.id)
          .select('*')
          .single()
        contact = updated ?? contact
      }
    } else {
      const { data: created, error } = await callreadyQuizDb
        .from('contacts')
        .insert({
          email: email ? email.toLowerCase() : null,
          first_name: firstName,
          last_name: lastName,
          phone: normalizedPhone,
          phone_hash: normalizedPhone ? phoneHash(normalizedPhone) : null,
        })
        .select('*')
        .single()
      if (error) throw error
      contact = created
    }

    // CRM lead — funnel_type identifies the get-help origin so this doesn't
    // get bucketed alongside article-quiz or calculator leads.
    const sessionId = crypto.randomUUID()
    const leadPayload: any = {
      contact_id: contact.id,
      session_id: sessionId,
      funnel_type: `GetHelp:${vertical}`,
      status: 'new',
      is_verified: false, // callback flow — not OTP-verified
      quiz_answers: {
        get_help_vertical: vertical,
        source_slug: sourceSlug || null,
      },
      zip_code: zip,
      hem_sha256: hem,
      quiz_bucket: quizBucket,
      verified_at: null,
    }
    const { data: lead, error: leadErr } = await callreadyQuizDb
      .from('leads')
      .insert(leadPayload)
      .select('*')
      .single()
    if (leadErr) throw leadErr

    // Mirror to publishare newsletter_subscribers — only if email supplied.
    // Best-effort: a publishare failure must not fail the CRM write.
    if (email) {
      try {
        const subscribeUrl = new URL('/api/subscribe', request.url).toString()
        await fetch(subscribeUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            first_name: firstName || null,
            zip_code: zip,
            site_id: 'seniorsimple',
            source: 'get_help',
            source_detail: vertical,
            tags: ['get_help', vertical, ...(quizBucket ? [`bucket:${quizBucket}`] : [])],
            quiz_bucket: quizBucket,
          }),
        })
      } catch (subErr) {
        console.error('get-help publishare mirror failed:', subErr)
      }
    }

    return createCorsResponse({
      success: true,
      leadId: lead.id,
      contactId: contact.id,
    })
  } catch (err: any) {
    console.error('get-help route error:', err)
    return createCorsResponse({ error: 'Failed to submit', details: err?.message ?? String(err) }, 500)
  }
}
