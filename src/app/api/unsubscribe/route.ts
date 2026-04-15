import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const SITE_ID = process.env.NEXT_PUBLIC_SITE_ID || 'seniorsimple'

// Site display names for the confirmation page
const SITE_NAMES: Record<string, string> = {
  seniorsimple: 'SeniorSimple',
  moneysimple: 'MoneySimple',
  homesimple: 'HomeSimple',
  parentsimple: 'ParentSimple',
  creditrepairsimple: 'CreditRepairSimple',
  scalingsimple: 'ScalingSimple',
  smallbizsimple: 'SmallBizSimple',
}

/**
 * GET /api/unsubscribe?sid=<uuid> OR ?email=<email>&site=<site_id>
 *
 * Called from List-Unsubscribe header in emails.
 * Looks up subscriber and redirects to the confirmation page.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const sid = searchParams.get('sid')
  const email = searchParams.get('email')
  const site = searchParams.get('site') || SITE_ID

  let subscriber: { id: string; status: string; site_id: string } | null = null

  if (sid) {
    const { data } = await supabase
      .from('newsletter_subscribers')
      .select('id, status, site_id')
      .eq('id', sid)
      .single()
    subscriber = data
  } else if (email) {
    const { data } = await supabase
      .from('newsletter_subscribers')
      .select('id, status, site_id')
      .eq('email', email.toLowerCase())
      .eq('site_id', site)
      .single()
    subscriber = data
  }

  const baseUrl = new URL(request.url).origin

  if (!subscriber) {
    return NextResponse.redirect(`${baseUrl}/unsubscribe/confirmed?status=not_found`)
  }
  if (subscriber.status === 'unsubscribed') {
    return NextResponse.redirect(`${baseUrl}/unsubscribe/confirmed?status=already`)
  }

  const siteName = SITE_NAMES[subscriber.site_id] || subscriber.site_id
  return NextResponse.redirect(
    `${baseUrl}/unsubscribe?sid=${subscriber.id}&site_name=${encodeURIComponent(siteName)}`
  )
}

/**
 * POST /api/unsubscribe
 * Body: { subscriber_id } or { email, site_id }
 *
 * Marks the subscriber as unsubscribed. DB trigger handles GHL sync.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { subscriber_id, email, site_id } = body

    let targetId = subscriber_id

    if (!targetId && email) {
      const resolvedSite = site_id || SITE_ID
      const { data } = await supabase
        .from('newsletter_subscribers')
        .select('id')
        .eq('email', email.toLowerCase())
        .eq('site_id', resolvedSite)
        .single()
      if (!data) {
        return NextResponse.json({ success: false, error: 'Subscriber not found' }, { status: 404 })
      }
      targetId = data.id
    }

    if (!targetId) {
      return NextResponse.json(
        { success: false, error: 'subscriber_id or email+site_id required' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('newsletter_subscribers')
      .update({
        status: 'unsubscribed',
        unsubscribed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', targetId)

    if (error) {
      console.error('Unsubscribe error:', error)
      return NextResponse.json({ success: false, error: 'Failed to unsubscribe' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Unsubscribe route error:', err)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
