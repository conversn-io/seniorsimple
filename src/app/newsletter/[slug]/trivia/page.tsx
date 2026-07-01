import type { Metadata } from 'next'
import { createClient } from '@supabase/supabase-js'

// Content is static once an issue is sent; regenerate hourly at most.
export const revalidate = 3600

// Lazy-init: createClient at module load throws "supabaseKey is required" during
// `next build` page-data collection when the env var is missing. Defer to render.
// Mirrors src/app/api/poll/route.ts and src/app/poll/results/page.tsx.
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

interface LeadArticle {
  category?: string
  title?: string
  article_url?: string
  cta_text?: string
}

interface EditorialData {
  trivia_question?: string
  trivia_answer?: string
  lead_article?: LeadArticle
  [key: string]: unknown
}

interface NewsletterIssue {
  issue_number: number | null
  subject: string
  sent_at: string | null
  dynamic_template_data: EditorialData | null
}

async function getIssue(slug: string): Promise<NewsletterIssue | null> {
  if (!slug) return null
  try {
    const supabase = getSupabase()
    const { data, error } = await supabase
      .from('newsletter_issues')
      .select('issue_number, subject, sent_at, dynamic_template_data')
      .eq('slug', slug)
      .eq('site_id', SITE_ID)
      .maybeSingle()
    if (error) {
      console.error('Trivia issue lookup error:', error)
      return null
    }
    return (data as NewsletterIssue) ?? null
  } catch (err) {
    console.error('Trivia issue lookup threw:', err)
    return null
  }
}

/** "June 30, 2026" from an ISO timestamp; empty when missing. */
function formatSentDate(iso: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

/**
 * Split a trivia answer into a short, prominent lead ("2006", "$6,730") and the
 * remaining context sentence(s), per the reveal-page design.
 */
function splitTriviaAnswer(raw: string | undefined): { short: string; context: string } {
  const ans = (raw ?? '').replace(/\s+/g, ' ').trim()
  if (!ans) return { short: '', context: '' }

  const num = ans.match(
    /^\(?([$£€]?\d[\d,]*(?:\.\d+)?\s?(?:%|percent|million|billion|trillion|years?)?)\)?[\s.,—:-]+/i
  )
  if (num) return { short: num[1].trim(), context: ans.slice(num[0].length).trim() }

  const sentence = ans.match(/^(.+?[.!?])\s+(.*)$/)
  if (sentence && sentence[1].length <= 60) {
    return { short: sentence[1].replace(/[.!?]+$/, '').trim(), context: sentence[2].trim() }
  }

  if (ans.length <= 80) return { short: ans, context: '' }
  return { short: '', context: ans }
}

/** Append UTM params without clobbering an existing query string. */
function withUtm(url: string, utm: string): string {
  if (!url) return url
  return url + (url.includes('?') ? '&' : '?') + utm
}

interface TriviaPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: TriviaPageProps): Promise<Metadata> {
  const { slug } = await params
  const issue = await getIssue(slug)
  const editorial = issue?.dynamic_template_data
  if (!issue || !editorial?.trivia_question || !editorial?.trivia_answer) {
    return { title: { absolute: 'Trivia | The Simple Life' }, robots: { index: false } }
  }
  const { short } = splitTriviaAnswer(editorial.trivia_answer)
  return {
    title: { absolute: `${editorial.trivia_question} | The Simple Life Trivia` },
    description: short || editorial.trivia_answer.slice(0, 155),
    robots: { index: false },
  }
}

function NotAvailable() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F5F0] px-4">
      <div className="bg-white rounded-xl shadow-md p-8 max-w-md w-full text-center">
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-[#B69653]">
          The Simple Life · Trivia
        </p>
        <h1 className="text-2xl font-serif font-semibold text-[#36596A] mb-3">
          This trivia isn&apos;t available
        </h1>
        <p className="text-gray-600 mb-6">
          We couldn&apos;t find this issue — it may have expired, or the link may be from a
          preview that was never sent.
        </p>
        <a
          href="https://www.seniorsimple.org"
          className="inline-block py-3 px-6 rounded-lg bg-[#36596A] text-white font-semibold hover:bg-[#2a4654] transition-colors"
        >
          Visit SeniorSimple
        </a>
      </div>
    </div>
  )
}

export default async function NewsletterTriviaPage({ params }: TriviaPageProps) {
  const { slug } = await params
  const issue = await getIssue(slug)
  const editorial = issue?.dynamic_template_data

  if (!issue || !editorial?.trivia_question || !editorial?.trivia_answer) {
    return <NotAvailable />
  }

  const question = editorial.trivia_question
  const { short, context } = splitTriviaAnswer(editorial.trivia_answer)
  const lead = editorial.lead_article ?? {}
  const issueMeta = [
    issue.issue_number != null ? `Issue No. ${issue.issue_number}` : null,
    formatSentDate(issue.sent_at),
  ]
    .filter(Boolean)
    .join(' · ')
  const relatedUrl = lead.article_url
    ? withUtm(lead.article_url, 'utm_source=newsletter&utm_medium=trivia')
    : null

  return (
    <div className="min-h-screen bg-[#F5F5F0] px-4 py-12">
      <div className="max-w-2xl mx-auto">
        {/* Hero */}
        <div className="text-center">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-[#B69653]">
            💡&nbsp; The Simple Life · Trivia
          </p>
          <h1 className="mx-auto max-w-xl font-serif text-2xl sm:text-[26px] leading-9 text-[#36596A]">
            {question}
          </h1>
          {issueMeta && <p className="mt-2 text-sm text-[#9a968b]">From {issueMeta}</p>}
        </div>

        {/* Answer card */}
        <div className="mt-8 bg-white rounded-xl border border-[#EAE7DC] shadow-sm p-8 sm:p-10 text-center">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-[#B69653]">
            The Answer
          </p>
          {short && (
            <p className="mb-4 font-serif font-semibold text-[#36596A] text-5xl leading-tight">
              {short}
            </p>
          )}
          {(context || !short) && (
            <p
              className={`mx-auto max-w-lg text-[#3d4a52] ${
                short ? 'text-base leading-relaxed' : 'text-xl leading-relaxed text-[#36596A]'
              }`}
            >
              {context || editorial.trivia_answer}
            </p>
          )}
        </div>

        {/* Related story */}
        {relatedUrl && (lead.title || lead.cta_text) && (
          <div className="mt-8">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-[#36596A]">
              Read the Related Story
            </p>
            <a
              href={relatedUrl}
              className="block bg-white rounded-xl border border-[#EAE7DC] p-5 hover:border-[#36596A] transition-colors"
            >
              {lead.category && (
                <span className="block mb-1 text-[10px] font-bold uppercase tracking-[0.15em] text-[#C9A961]">
                  {lead.category}
                </span>
              )}
              <span className="block font-serif text-xl leading-7 text-[#36596A]">
                {lead.title || lead.cta_text}
              </span>
            </a>
          </div>
        )}

        {/* Quiz CTA */}
        <div className="mt-8 bg-[#36596A] rounded-xl p-10 text-center">
          <p className="mb-2 font-serif text-2xl font-semibold text-white">
            Find your right next step
          </p>
          <p className="mx-auto mb-6 max-w-md text-[15px] leading-6 text-white/80">
            A few short questions is all it takes. Our retirement quiz is free, with no
            obligation.
          </p>
          <a
            href="/quiz?utm_content=trivia"
            className="inline-block py-4 px-8 rounded-md bg-[#E4CDA1] text-[#36596A] font-bold hover:bg-[#dcc294] transition-colors"
          >
            Take the Retirement Quiz →
          </a>
        </div>

        {/* Back link */}
        <p className="mt-8 text-center text-sm text-[#8b887c]">
          ←{' '}
          <a href="https://www.seniorsimple.org" className="font-semibold text-[#36596A]">
            Back to seniorsimple.org
          </a>
        </p>
      </div>
    </div>
  )
}
