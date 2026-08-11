'use client'

import { useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Mail } from 'lucide-react'
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
const WATCH_PATH = '/life-insurance-webinar/watch'

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

const DISCLAIMER_PARAGRAPHS = [
  'This webinar is educational content designed to help you understand how life insurance works and the common types of coverage available. It does not recommend a specific policy, carrier, or product and does not create an advisor- or agent-client relationship.',
  'Nothing in this series is investment, tax, or legal advice. Coverage availability, eligibility, and pricing depend on your individual circumstances, the state you live in, and the carrier’s underwriting.',
  'SeniorSimple is an educational publisher. Insurance products are offered through licensed professionals and are not available in all states. No coverage is guaranteed and no guaranteed-issue product is being marketed here.',
]

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type Status = 'idle' | 'submitting' | 'success' | 'error'

export default function WebinarOptinPage() {
  const router = useRouter()
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

        router.push(WATCH_PATH)
      } catch {
        setStatus('error')
        setErrorMsg('Network error. Please try again.')
      }
    },
    [status, email, firstName, honeypot, router],
  )

  return (
    <div className="w-full">
      {/* Hero + opt-in card (2-col on lg) */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#36596A] to-[#2a4a5a]" />
        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            {/* Left: pitch */}
            <div className="text-white">
              <div className="mb-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#E4CDA1]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#E4CDA1]" />
                Free webinar · Life insurance
              </div>
              <h1 className="mb-5 font-serif text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">
                Understand Your Life Insurance Options — Before You Decide
              </h1>
              <p className="max-w-xl text-lg leading-relaxed text-white/85 md:text-xl">
                A free video series that explains how life insurance works at
                this stage of life — final expense, whole, and term — in plain
                language, at your pace. No pressure, no obligation.
              </p>
              <ul className="mt-8 space-y-2.5 text-base text-white/90">
                {HERO_BULLETS.map((b) => (
                  <li key={b} className="flex items-start gap-2">
                    <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#E4CDA1]" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right: opt-in card */}
            <div className="w-full max-w-md mx-auto lg:mx-0 lg:ml-auto">
              <div className="rounded-2xl border border-[#E7E1D2] bg-white p-6 shadow-lg md:p-8">
                {status !== 'success' ? (
                  <>
                    <div className="mb-6">
                      <div className="mb-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#B08E4E]">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#E4CDA1]" />
                        Free webinar · No obligation
                      </div>
                      <h2 className="font-serif text-2xl font-semibold text-[#36596A] md:text-3xl">
                        Get Free Access
                      </h2>
                      <p className="mt-3 text-[15px] leading-relaxed text-gray-600">
                        A five-part video series that explains life insurance
                        in plain language — start watching the moment you sign
                        up.
                      </p>
                    </div>

                    <form
                      onSubmit={handleSubmit}
                      noValidate
                      className="space-y-4"
                    >
                      <div>
                        <label
                          htmlFor="webinar-first-name"
                          className="mb-1.5 block text-sm font-medium text-[#36596A]"
                        >
                          First name{' '}
                          <span className="font-normal text-gray-400">
                            (optional)
                          </span>
                        </label>
                        <input
                          id="webinar-first-name"
                          type="text"
                          name="first_name"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          autoComplete="given-name"
                          placeholder="Your first name"
                          disabled={status === 'submitting'}
                          className="w-full rounded-lg border border-[#E7E1D2] px-4 py-3 focus:border-[#36596A] focus:outline-none focus:ring-2 focus:ring-[#36596A]/30 disabled:opacity-60"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="webinar-email"
                          className="mb-1.5 block text-sm font-medium text-[#36596A]"
                        >
                          Email{' '}
                          <span className="text-[#B45E5E]">*</span>
                        </label>
                        <div className="relative">
                          <Mail
                            aria-hidden
                            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                          />
                          <input
                            id="webinar-email"
                            type="email"
                            name="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            autoComplete="email"
                            required
                            aria-label="Email address"
                            placeholder="you@example.com"
                            disabled={status === 'submitting'}
                            className="w-full rounded-lg border border-[#E7E1D2] pl-10 pr-4 py-3 focus:border-[#36596A] focus:outline-none focus:ring-2 focus:ring-[#36596A]/30 disabled:opacity-60"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={status === 'submitting'}
                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#36596A] px-6 py-3.5 font-semibold text-white transition-colors hover:bg-[#2a4a5a] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {status === 'submitting'
                          ? 'Sending…'
                          : 'Get Free Access'}
                      </button>

                      <p className="text-center text-xs text-gray-500">
                        Free to watch. We&rsquo;ll never pressure you — when
                        you&rsquo;re ready, we can match you with a licensed
                        agent to talk through your options.
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
                          className="text-center text-sm text-red-700"
                        >
                          {errorMsg}
                        </p>
                      )}
                    </form>
                  </>
                ) : (
                  <div className="py-4 text-center">
                    <h2 className="font-serif text-2xl font-semibold text-[#36596A]">
                      You&rsquo;re in.
                    </h2>
                    <p className="mt-2 text-[15px] leading-relaxed text-gray-600">
                      Taking you to the webinar&hellip;
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What you'll learn */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="mb-10 text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#B08E4E]">
            What you&rsquo;ll learn
          </p>
          <h2 className="font-serif text-3xl font-semibold text-[#36596A] md:text-4xl">
            A calm, useful primer — not a sales pitch
          </h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {WHAT_YOU_LEARN.map((item) => (
            <div
              key={item.title}
              className="rounded-xl border border-[#E7E1D2] bg-[#F5F5F0] p-6"
            >
              <h3 className="mb-3 font-serif text-xl font-semibold text-[#36596A]">
                {item.title}
              </h3>
              <p className="text-[15px] leading-relaxed text-gray-700">
                {item.body}
              </p>
            </div>
          ))}
        </div>
        <p className="mx-auto mt-10 max-w-2xl text-center text-[15px] leading-relaxed text-gray-600">
          The series is five short videos you can watch in order or jump
          around. Together they cover the ground above — no jargon, no
          pressure to buy anything.
        </p>
      </section>

      {/* About this webinar */}
      <section className="border-t border-[#E7E1D2] bg-white">
        <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
          <h2 className="mb-3 font-serif text-xl font-semibold text-[#36596A]">
            About this webinar
          </h2>
          <div className="space-y-3 text-sm leading-relaxed text-gray-600">
            {DISCLAIMER_PARAGRAPHS.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
