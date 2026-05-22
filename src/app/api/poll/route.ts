import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createHash } from 'crypto'

// Lazy-init: calling createClient at module load with undefined env vars throws
// "supabaseKey is required" during `next build` page-data collection, which
// crashes every preview deploy where the env var isn't set. Defer construction
// to first handler invocation — same runtime semantics, build no longer crashes.
// Cache typed `any` because createClient's generic return type otherwise collapses
// to a `never` database type and breaks downstream .from(...).single() calls.
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
const IP_HASH_SALT = process.env.POLL_IP_HASH_SALT || 'default-poll-salt-change-me'

function hashIP(ip: string): string {
  return createHash('sha256').update(`${ip}:${IP_HASH_SALT}`).digest('hex')
}

/**
 * GET /api/poll?issue=<slug>&q=<question_key>&a=<answer_value>&al=<answer_label>&sid=<subscriber_id>
 *
 * Records a poll vote (via link click from newsletter email) and redirects to results.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const issueSlug = searchParams.get('issue')
  const questionKey = searchParams.get('q')
  const answerValue = searchParams.get('a')
  const answerLabel = searchParams.get('al') || answerValue
  const subscriberId = searchParams.get('sid') || null

  const baseUrl = new URL(request.url).origin

  if (!issueSlug || !questionKey || !answerValue) {
    return NextResponse.json(
      { success: false, error: 'Missing required params: issue, q, a' },
      { status: 400 }
    )
  }

  const supabase = getSupabase()

  // Resolve issue_id from slug
  const { data: issue, error: issueError } = await supabase
    .from('newsletter_issues')
    .select('id')
    .eq('slug', issueSlug)
    .single()

  if (issueError || !issue) {
    return NextResponse.redirect(`${baseUrl}/poll/results?issue=${issueSlug}&q=${questionKey}&err=issue_not_found`)
  }

  // Hash the IP
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  const ipHash = hashIP(ip)

  // Look up subscriber email if sid provided
  let email: string | null = null
  if (subscriberId) {
    const { data: sub } = await supabase
      .from('newsletter_subscribers')
      .select('email')
      .eq('id', subscriberId)
      .single()
    email = sub?.email || null
  }

  // UPSERT vote — allows changing vote, prevents duplicates
  const { error: voteError } = await supabase
    .from('newsletter_poll_responses')
    .upsert(
      {
        issue_id: issue.id,
        site_id: SITE_ID,
        email,
        subscriber_id: subscriberId,
        question_key: questionKey,
        answer_value: answerValue,
        answer_label: answerLabel,
        ip_hash: ipHash,
        created_at: new Date().toISOString(),
      },
      { onConflict: 'ip_hash,issue_id,question_key' }
    )

  if (voteError) {
    console.error('Poll vote error:', voteError)
  }

  return NextResponse.redirect(
    `${baseUrl}/poll/results?issue=${encodeURIComponent(issueSlug)}&q=${encodeURIComponent(questionKey)}`
  )
}
