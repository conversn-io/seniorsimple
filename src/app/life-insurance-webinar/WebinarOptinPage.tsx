'use client'

import { useCallback, useState } from 'react'
import { Check, Mail } from 'lucide-react'
import { fireGa4LeadCapture } from '@/lib/capture-identity'

const SUBSCRIBE_ENDPOINT =
  'https://vpysqshhafthuxvokwqj.supabase.co/functions/v1/subscribe'

const ASSET_KEY = 'life-insurance-webinar'
const PAGE_SLUG = 'life-insurance-webinar'
const PILLAR = 'final-expense'
const QUIZ_BUCKET = 'life-insurance'
// Reuses the existing `resource` CaptureSurface — `<surface>:<slug>` per the
// capture contract. See src/lib/medicare-capture-config.ts:326.
const SOURCE_DETAIL = `resource:${PAGE_SLUG}`

// Vimeo IDs from the ParentSimple 5-part series (spec §4). Order matters.
const VIDEO_IDS = [
  '1213427905',
  '1213427907',
  '1213427908',
  '1213427906',
  '1213427951',
] as const

const HERO_BULLETS = [
  'Learn how final expense and burial coverage actually work',
  'Understand whole vs. term vs. guaranteed-issue — and where each fits',
  'See what determines how much you may need, and what moves the cost',
]

const WHAT_YOU_LEARN = [
  {
    title: 'How life insurance works later in life',
    body: 'What a policy actually promises, and how it differs from other coverage.',
  },
  {
    title: 'The types that fit retirement',
    body: 'Final expense, whole, and term, and which tends to fit which situation.',
  },
  {
    title: 'How much you may need, and why',
    body: 'Covering final expenses without overpaying, and what moves the price.',
  },
]

const DISCLAIMER =
  "This webinar is educational content to help you understand how life insurance works and the common types of coverage. It does not recommend a specific policy, carrier, or product and does not create an advisor- or agent-client relationship. Nothing here is investment, tax, or legal advice. Coverage availability, eligibility, and pricing depend on your circumstances, your state, and the carrier's underwriting. SeniorSimple is an educational publisher; insurance products are offered through licensed professionals and are not available in all states. No coverage is guaranteed and no guaranteed-issue product is being marketed here."

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type Status = 'idle' | 'submitting' | 'success' | 'error'

export default function WebinarOptinPage() {
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [honeypot, setHoneypot] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (status === 'submitting') return

      const trimmed = email.trim().toLowerCase()
      if (!EMAIL_RE.test(trimmed)) {
        setStatus('error')
        setErrorMsg('Please enter a valid email address.')
        return
      }

      setStatus('submitting')
      setErrorMsg('')

      try {
        const res = await fetch(SUBSCRIBE_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: trimmed,
            first_name: firstName.trim() || null,
            site_id: 'seniorsimple',
            source: 'webinar',
            source_detail: SOURCE_DETAIL,
            quiz_bucket: QUIZ_BUCKET,
            quiz_context: {
              surface: 'resource',
              asset_key: ASSET_KEY,
              pillar: PILLAR,
              variant: 'webinar-optin',
            },
            tags: [
              PILLAR,
              QUIZ_BUCKET,
              'unit:webinar-optin',
              `magnet:${ASSET_KEY}`,
            ],
            website: honeypot,
          }),
        })

        if (res.status === 429) {
          setStatus('error')
          setErrorMsg('One moment — please try again shortly.')
          return
        }
        if (!res.ok && res.status !== 200 && res.status !== 201) {
          const data = await res.json().catch(() => ({}))
          setStatus('error')
          setErrorMsg(
            typeof data?.error === 'string'
              ? data.error
              : 'Something went wrong. Please try again.',
          )
          return
        }

        setStatus('success')
        fireGa4LeadCapture({
          method: 'lp_form',
          slug: PAGE_SLUG,
          pillar: PILLAR,
          assetKey: ASSET_KEY,
          list: 'seniorsimple-newsletter',
        })

        // Scroll the reveal into view so 55+ visitors immediately see the videos.
        setTimeout(() => {
          document
            .getElementById('webinar-series')
            ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }, 80)
      } catch {
        setStatus('error')
        setErrorMsg('Network error. Please try again.')
      }
    },
    [status, email, firstName, honeypot],
  )

  return (
    <div
      style={{ fontFamily: "Georgia, 'Times New Roman', ui-serif, serif" }}
      className="w-full"
    >
      {/* Hero */}
      <section className="bg-[#36596A] text-white">
        <div className="mx-auto max-w-5xl px-4 py-16 md:py-20">
          <p className="mb-3 text-sm font-medium uppercase tracking-widest text-[#E4CDA1]">
            Free webinar · Life insurance
          </p>
          <h1 className="mb-5 text-[2rem] leading-tight font-semibold md:text-[2.75rem]">
            Understand Your Life Insurance Options — Before You Decide
          </h1>
          <p
            className="mb-8 max-w-3xl text-[1.125rem] leading-[1.65] text-white/90 md:text-[1.25rem]"
            style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}
          >
            A free video series that explains how life insurance works at this
            stage of life — final expense, whole, and term — in plain language,
            at your pace. No pressure, no obligation.
          </p>
          <ul
            className="grid gap-3 md:grid-cols-3"
            style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}
          >
            {HERO_BULLETS.map((b) => (
              <li
                key={b}
                className="flex items-start gap-3 rounded-lg bg-white/10 p-4 text-[1rem] leading-[1.55]"
              >
                <Check
                  className="mt-0.5 h-5 w-5 shrink-0 text-[#E4CDA1]"
                  aria-hidden
                />
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Opt-in card OR video reveal */}
      <section className="bg-[#F5F5F0]">
        <div className="mx-auto max-w-3xl px-4 py-14 md:py-16">
          {status !== 'success' ? (
            <div className="rounded-2xl border border-[#E4CDA1]/60 bg-white p-6 shadow-sm md:p-10">
              <div className="mb-6 text-center">
                <h2 className="mb-2 text-[1.75rem] font-semibold text-[#36596A] md:text-[2rem]">
                  Get Free Access
                </h2>
                <p
                  className="mx-auto max-w-xl text-[1.0625rem] leading-[1.6] text-[#36596A]/85"
                  style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}
                >
                  A five-part video series that explains life insurance in
                  plain language — start watching the moment you sign up.
                </p>
              </div>

              <form
                onSubmit={handleSubmit}
                noValidate
                className="mx-auto flex max-w-md flex-col gap-4"
                style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}
              >
                <label className="block text-left">
                  <span className="mb-1 block text-[0.95rem] font-medium text-[#36596A]">
                    First name (optional)
                  </span>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    autoComplete="given-name"
                    disabled={status === 'submitting'}
                    className="w-full rounded-lg border-2 border-[#36596A]/20 bg-white px-4 py-3 text-[1rem] text-gray-900 placeholder:text-gray-500 focus:border-[#36596A] focus:ring-2 focus:ring-[#36596A]/20 focus:outline-none"
                  />
                </label>

                <label className="block text-left">
                  <span className="mb-1 block text-[0.95rem] font-medium text-[#36596A]">
                    Email address
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                    aria-label="Email address"
                    placeholder="you@example.com"
                    disabled={status === 'submitting'}
                    className="w-full rounded-lg border-2 border-[#36596A]/20 bg-white px-4 py-3 text-[1rem] text-gray-900 placeholder:text-gray-500 focus:border-[#36596A] focus:ring-2 focus:ring-[#36596A]/20 focus:outline-none"
                  />
                </label>

                <button
                  type="submit"
                  disabled={status === 'submitting'}
                  className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#36596A] px-6 py-4 text-[1.0625rem] font-medium text-white transition-colors hover:bg-[#2a4a5a] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {status === 'submitting' ? (
                    'Sending…'
                  ) : (
                    <>
                      <Mail className="h-5 w-5" aria-hidden />
                      Get Free Access
                    </>
                  )}
                </button>

                <p className="mt-1 text-center text-[0.9rem] leading-[1.5] text-[#36596A]/75">
                  Free to watch. We&rsquo;ll never pressure you — when
                  you&rsquo;re ready, we can match you with a licensed agent to
                  talk through your options.
                </p>

                <input
                  type="text"
                  name="website"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                  style={{
                    position: 'absolute',
                    left: '-10000px',
                    width: 1,
                    height: 1,
                    opacity: 0,
                  }}
                />

                {status === 'error' && errorMsg && (
                  <p
                    role="alert"
                    className="text-center text-[0.95rem] text-red-700"
                  >
                    {errorMsg}
                  </p>
                )}
              </form>
            </div>
          ) : (
            <div
              id="webinar-series"
              className="rounded-2xl border border-[#E4CDA1]/60 bg-white p-6 shadow-sm md:p-10"
            >
              <div className="mb-6 flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#E4CDA1]/50">
                  <Check
                    className="h-5 w-5 text-[#36596A]"
                    aria-hidden
                  />
                </div>
                <div>
                  <h2 className="text-[1.5rem] font-semibold text-[#36596A] md:text-[1.75rem]">
                    You&rsquo;re in. Watch the series below.
                  </h2>
                  <p
                    className="mt-1 text-[1rem] leading-[1.6] text-[#36596A]/80"
                    style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}
                  >
                    Five short videos — watch in order or jump around. No
                    jargon, no pressure to buy anything.
                  </p>
                </div>
              </div>

              <div className="grid gap-6">
                {VIDEO_IDS.map((id, i) => (
                  <div key={id}>
                    <p
                      className="mb-2 text-[0.9rem] font-medium uppercase tracking-widest text-[#36596A]/70"
                      style={{
                        fontFamily: 'Arial, Helvetica, sans-serif',
                      }}
                    >
                      Part {i + 1} of {VIDEO_IDS.length}
                    </p>
                    <div
                      className="relative w-full overflow-hidden rounded-lg bg-black"
                      style={{ paddingTop: '56.25%' }}
                    >
                      <iframe
                        src={`https://player.vimeo.com/video/${id}`}
                        title={`Life insurance webinar — part ${i + 1}`}
                        loading="lazy"
                        allow="autoplay; fullscreen; picture-in-picture"
                        allowFullScreen
                        className="absolute inset-0 h-full w-full border-0"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* What you'll learn */}
      <section className="bg-white">
        <div className="mx-auto max-w-4xl px-4 py-14 md:py-16">
          <h2 className="mb-3 text-center text-[1.75rem] font-semibold text-[#36596A] md:text-[2rem]">
            What you&rsquo;ll learn
          </h2>
          <p
            className="mx-auto mb-10 max-w-2xl text-center text-[1.0625rem] leading-[1.6] text-[#36596A]/80"
            style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}
          >
            A calm, useful primer — not a sales pitch.
          </p>
          <ul className="grid gap-6 md:grid-cols-3">
            {WHAT_YOU_LEARN.map((item) => (
              <li
                key={item.title}
                className="rounded-xl border border-[#E4CDA1]/50 bg-[#F5F5F0] p-6"
              >
                <h3 className="mb-2 text-[1.125rem] font-semibold text-[#36596A]">
                  {item.title}
                </h3>
                <p
                  className="text-[1rem] leading-[1.6] text-[#36596A]/85"
                  style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}
                >
                  {item.body}
                </p>
              </li>
            ))}
          </ul>
          <p
            className="mx-auto mt-10 max-w-2xl text-center text-[1rem] leading-[1.65] text-[#36596A]/80"
            style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}
          >
            The series is five short videos you can watch in order or jump
            around — no jargon, no pressure to buy anything.
          </p>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="bg-[#F5F5F0]">
        <div className="mx-auto max-w-3xl px-4 py-10">
          <p
            className="text-center text-[0.9rem] leading-[1.65] text-[#36596A]/70"
            style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}
          >
            {DISCLAIMER}
          </p>
        </div>
      </section>
    </div>
  )
}
