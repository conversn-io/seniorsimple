import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// P1 phone-lead-rate instrumentation.
// Accepts POSTs (or sendBeacon) from article-page CTA components and writes
// one row per event to public.article_cta_events. Rows are the baseline the
// v_article_phone_lead_rate view aggregates; snapshot the phone_ctr_pct_28d
// BEFORE flipping NEXT_PUBLIC_ARTICLE_EMAIL_CTAS=on so we can measure whether
// the email flip cannibalizes phone leads.
//
// Body:
//   { event: 'reveal' | 'click',
//     cta_type: 'phone' | 'email',
//     cta_position: 'sticky' | 'interstitial',
//     slug?: string,
//     is_money_page: boolean,
//     session_id?: string,
//     device?: 'mobile' | 'desktop' | 'tablet' }
//
// Response is always 202 (accepted) as long as the shape parses — the client
// is a beacon and can't retry, so we absorb noise + log the DB error.

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const ALLOWED_EVENT = new Set(['reveal', 'click'])
const ALLOWED_CTA_TYPE = new Set(['phone', 'email'])
const ALLOWED_POSITION = new Set(['sticky', 'interstitial'])
const ALLOWED_DEVICE = new Set(['mobile', 'desktop', 'tablet', 'unknown'])

interface Body {
  event?: string
  cta_type?: string
  cta_position?: string
  slug?: string | null
  is_money_page?: boolean
  session_id?: string | null
  device?: string
}

export async function POST(req: Request) {
  let body: Body
  try {
    body = (await req.json()) as Body
  } catch {
    return NextResponse.json({ ok: false, error: 'bad_json' }, { status: 202 })
  }

  if (
    !body.event || !ALLOWED_EVENT.has(body.event) ||
    !body.cta_type || !ALLOWED_CTA_TYPE.has(body.cta_type) ||
    !body.cta_position || !ALLOWED_POSITION.has(body.cta_position)
  ) {
    return NextResponse.json({ ok: false, error: 'bad_shape' }, { status: 202 })
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    console.warn('[telemetry/cta] missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
    return NextResponse.json({ ok: false, error: 'not_configured' }, { status: 202 })
  }

  const supabase = createClient(url, key, { auth: { persistSession: false } })
  const ua = (req.headers.get('user-agent') || '').slice(0, 200)
  const device = body.device && ALLOWED_DEVICE.has(body.device) ? body.device : 'unknown'

  const { error } = await supabase.from('article_cta_events').insert({
    event: body.event,
    cta_type: body.cta_type,
    cta_position: body.cta_position,
    site_id: 'seniorsimple',
    slug: body.slug ?? null,
    is_money_page: Boolean(body.is_money_page),
    session_id: body.session_id ?? null,
    device,
    user_agent: ua || null,
  })
  if (error) console.warn('[telemetry/cta] insert failed', error.message)

  return NextResponse.json({ ok: !error }, { status: 202 })
}
