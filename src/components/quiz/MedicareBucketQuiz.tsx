'use client'

// §2 Medicare Bucket Quiz — segments user into a plan-type lane and captures
// email as a qualified lead. Two entry points, one component:
//   variant='standalone'  → mid-scroll insertion on Medicare articles
//   variant='bridge'      → post-output bridge on the cost calculator
//
// Clone-basis: FinalExpenseQuiz (progressive shell, QuizProgress + QuizQuestion).
// Submit path: reuses /api/leads/medicare-calculator/route.ts (extended to
// accept quizBucket + articleSlug + quizAnswers; server-computes hem_sha256).
//
// Bucket taxonomy (deterministic; ships as a mapping table in resolveBucket):
//   advantage — all-in-one / dental+vision / $0-premium interest
//   medigap   — provider freedom / travel / predictable costs
//   dual      — income/asset signals Medicaid eligibility
//   working   — employer coverage / delaying enrollment
//
// Compliance: framing is educational + agent-match ONLY. Never "enroll in X."
// TPMO-style disclaimer renders below the form (COPY PLACEHOLDER pending
// compliance sign-off — see COMPLIANCE_DISCLAIMER_PLACEHOLDER below; do NOT
// change to final text without approval).

import { useState, useEffect } from 'react'
import { QuizProgress } from './QuizProgress'
import { QuizQuestion } from './QuizQuestion'
import { ProcessingState } from './ProcessingState'

export type MedicareBucket = 'advantage' | 'medigap' | 'dual' | 'working'

export interface MedicareBucketQuizPrefill {
  ageBand?: string       // e.g. '65–69'
  zip?: string           // 5-digit
  incomeTier?: string    // IRMAA-like bucket, e.g. 'standard' | 'irmaa_tier_1'
  currentCoverage?: string  // e.g. 'employer' | 'medicare' | 'none'
}

export interface MedicareBucketQuizProps {
  slug: string
  variant?: 'standalone' | 'bridge'
  prefill?: MedicareBucketQuizPrefill
  compact?: boolean
  onComplete?: (bucket: MedicareBucket) => void
}

// ─────────────────────────────────────────────────────────────
// COMPLIANCE — TPMO-style disclaimer. Placeholder pending sign-off.
// DO NOT change this text without compliance approval.
// ─────────────────────────────────────────────────────────────
const COMPLIANCE_DISCLAIMER_PLACEHOLDER =
  '[PLACEHOLDER — awaiting compliance sign-off] We do not offer every plan available in your area. Any information we provide is limited to those plans we do offer in your area. Please contact Medicare.gov or 1-800-MEDICARE to get information on all your options.'

// ─────────────────────────────────────────────────────────────
// Question definitions. Each question keys against a step id used by the
// bucket resolver + the bridge skip logic.
// ─────────────────────────────────────────────────────────────

const Q_MEDICARE_STATUS = {
  id: 'medicareStatus',
  title: 'Where are you today with Medicare?',
  subtitle: 'Helps us tailor the plan-type options we show you.',
  type: 'multiple-choice' as const,
  options: [
    'Turning 65 — enrolling soon',
    'Already on Medicare',
    'Still working, 65+ (employer coverage)',
    'Not sure / just exploring',
  ],
}

const Q_MATTERS_MOST = {
  id: 'mattersMost',
  title: 'What matters most to you in a plan?',
  subtitle: 'Pick the one that fits best — this drives which plan type we match you with.',
  type: 'multiple-choice' as const,
  options: [
    'Keep my doctors, freedom to travel',
    'Dental, vision, hearing included',
    'Lowest monthly premium',
    'Help paying costs (I have limited income)',
  ],
}

const Q_ZIP = {
  id: 'zipCode',
  title: "Let's start with your ZIP",
  subtitle: 'Medicare plans and pricing vary by county — this narrows to what is actually available near you.',
  type: 'zip-only' as const,
  placeholder: 'Enter 5-digit ZIP',
  maxlength: 5,
}

const Q_PERSONAL = {
  id: 'personalInfo',
  title: 'Where should we send your plan-type match?',
  subtitle: 'A licensed Medicare advisor can walk you through the plans in your area.',
  type: 'personal-info-with-benefits' as const,
  benefits: [
    'Personalized plan-type recommendation based on your answers',
    'Optional agent match — a licensed advisor in your area',
    'No obligation, no cost — educational only',
  ],
}

// ─────────────────────────────────────────────────────────────
// Deterministic bucket resolver. Fires after all non-personal questions have
// been answered. Priority order matters:
//   1. Explicit "help paying costs" → dual (Medicaid signal)
//   2. Explicit "still working, employer coverage" → working
//   3. mattersMost drives advantage vs medigap
// Never returns null when called at the resolve point; ships a fallback.
// ─────────────────────────────────────────────────────────────

function resolveBucket(answers: Record<string, any>, prefill?: MedicareBucketQuizPrefill): MedicareBucket {
  const matters = String(answers.mattersMost ?? '').toLowerCase()
  const status = String(answers.medicareStatus ?? '').toLowerCase()

  // 1. Dual-eligible signal (highest priority — legal/regulatory lane)
  if (matters.includes('help paying costs')) return 'dual'
  if ((prefill?.incomeTier ?? '').toLowerCase() === 'medicaid_eligible') return 'dual'

  // 2. Still-working lane (delaying enrollment path)
  if (status.includes('still working')) return 'working'
  if ((prefill?.currentCoverage ?? '').toLowerCase() === 'employer') return 'working'

  // 3. Advantage-style preferences
  if (matters.includes('dental') || matters.includes('lowest monthly premium')) return 'advantage'

  // 4. Medigap-style preferences
  if (matters.includes('keep my doctors') || matters.includes('travel')) return 'medigap'

  // Fallback — advantage has broadest fit for undecided users.
  return 'advantage'
}

const BUCKET_META: Record<MedicareBucket, { label: string; blurb: string }> = {
  advantage: {
    label: 'Medicare Advantage',
    blurb: 'All-in-one plans that often include dental, vision, and prescription coverage. Frequently $0-premium.',
  },
  medigap: {
    label: 'Medigap + Part D',
    blurb: 'Original Medicare plus a supplement — see any doctor that accepts Medicare, predictable out-of-pocket costs.',
  },
  dual: {
    label: 'Dual-Eligible (Medicaid + Medicare)',
    blurb: 'Special programs for people with limited income and resources. May cover premiums and reduce out-of-pocket costs.',
  },
  working: {
    label: 'Still Working, 65+',
    blurb: 'You may be able to delay Part B without penalty if your employer coverage qualifies. Timing matters.',
  },
}

// ─────────────────────────────────────────────────────────────
// Telemetry beacon — first-party CTA events. Reuses the article_cta_events
// pattern (see /api/telemetry/cta) so bucket-mix funnel is queryable
// alongside phone/email CTA rates.
// ─────────────────────────────────────────────────────────────

function trackQuiz(event: 'quiz_view' | 'quiz_step_advance' | 'quiz_bucket_resolved' | 'quiz_email_submit',
                   payload: { slug: string; variant: string; step?: number; bucket?: string }) {
  if (typeof window === 'undefined') return
  let sessionId: string | null = null
  try {
    sessionId = window.localStorage.getItem('ss_cta_session')
    if (!sessionId) {
      sessionId = crypto.randomUUID()
      window.localStorage.setItem('ss_cta_session', sessionId)
    }
  } catch { /* Safari ITP */ }
  const body = JSON.stringify({
    event: event === 'quiz_view' ? 'reveal' : event === 'quiz_email_submit' ? 'click' : 'reveal',
    cta_type: 'quiz',
    cta_position: 'inline',
    slug: `medicare-quiz:${payload.slug}`,
    is_money_page: true,
    device: window.matchMedia?.('(max-width: 768px)').matches ? 'mobile' : 'desktop',
    session_id: sessionId,
    // Extended fields — safe if the endpoint ignores unknowns.
    quiz_event: event,
    quiz_variant: payload.variant,
    quiz_step: payload.step,
    quiz_bucket: payload.bucket,
  })
  try {
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/telemetry/cta', new Blob([body], { type: 'application/json' }))
      return
    }
  } catch { /* fall through */ }
  fetch('/api/telemetry/cta', {
    method: 'POST', body, keepalive: true,
    headers: { 'Content-Type': 'application/json' },
  }).catch(() => {})
}

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────

export default function MedicareBucketQuiz({
  slug,
  variant = 'standalone',
  prefill = {},
  compact = false,
  onComplete,
}: MedicareBucketQuizProps) {
  // Bridge skip rules: if the calculator has already told us these, skip the ask.
  const skipStatus = variant === 'bridge' && !!prefill.currentCoverage
  const skipZip    = variant === 'bridge' && !!(prefill.zip && /^\d{5}$/.test(prefill.zip))

  // Build the effective question list dynamically.
  // ZIP goes FIRST — it narrows the search window ("plans in your area") and
  // sets a concrete-not-abstract opening step, which lifts the completion
  // rate on the softer preference questions that follow.
  const questions = [
    ...(skipZip ? [] : [Q_ZIP]),
    ...(skipStatus ? [] : [Q_MEDICARE_STATUS]),
    Q_MATTERS_MOST,
    Q_PERSONAL,
  ]
  const totalSteps = questions.length

  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, any>>(() => {
    // Seed with prefill values so the resolver + submit see them.
    const seed: Record<string, any> = {}
    if (prefill.zip) seed.zipCode = prefill.zip
    return seed
  })
  const [submitting, setSubmitting] = useState(false)
  const [showResult, setShowResult] = useState<MedicareBucket | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    trackQuiz('quiz_view', { slug, variant })
  }, [slug, variant])

  const handleAnswer = async (answer: any) => {
    const q = questions[currentStep]
    const nextAnswers = { ...answers, [q.id]: answer }
    setAnswers(nextAnswers)
    trackQuiz('quiz_step_advance', { slug, variant, step: currentStep + 1 })

    // Personal-info step = final submit.
    if (q.id === 'personalInfo') {
      const email: string = (answer?.email ?? '').trim()
      if (!email || !email.includes('@')) {
        setErrorMsg('A valid email is required so we can send your plan-type match.')
        return
      }
      const bucket = resolveBucket(nextAnswers, prefill)
      trackQuiz('quiz_bucket_resolved', { slug, variant, bucket })

      setSubmitting(true)
      setErrorMsg(null)
      try {
        const referrer = typeof document !== 'undefined' ? document.referrer || null : null
        const landingPage = typeof window !== 'undefined' ? window.location.href : null
        const utmStorage = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('seniorsimple_utm') : null
        const utmParams = utmStorage ? JSON.parse(utmStorage) : {}

        // Extend the medicare-calculator route with quiz-specific fields.
        // Server-side handler computes hem_sha256 (never client-side).
        const res = await fetch('/api/leads/medicare-calculator', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            firstName: answer.firstName ?? null,
            lastName:  answer.lastName ?? null,
            email,
            phone: answer.phone ?? null,
            zipCode: nextAnswers.zipCode ?? prefill.zip ?? null,
            preferredContact: answer.preferredContact ?? 'email',
            source: 'article_quiz',
            siteKey: 'seniorsimple',
            articleSlug: slug,
            landingPage,
            referrer,
            quizBucket: bucket,
            quizAnswers: {
              medicareStatus: nextAnswers.medicareStatus ?? null,
              mattersMost: nextAnswers.mattersMost ?? null,
              zipCode: nextAnswers.zipCode ?? prefill.zip ?? null,
              prefill,
              variant,
            },
            ...utmParams,
          }),
        })
        if (!res.ok) {
          const errorText = await res.text().catch(() => '')
          throw new Error(`Submission failed (${res.status}): ${errorText.slice(0, 200)}`)
        }
        trackQuiz('quiz_email_submit', { slug, variant, bucket })
        setShowResult(bucket)
        onComplete?.(bucket)
      } catch (e) {
        setErrorMsg(e instanceof Error ? e.message : 'Something went wrong. Please try again.')
      } finally {
        setSubmitting(false)
      }
      return
    }

    // Otherwise advance.
    if (currentStep < totalSteps - 1) setCurrentStep(currentStep + 1)
  }

  if (submitting) return <ProcessingState message="Matching you with the right Medicare plan type…" />

  if (showResult) {
    const meta = BUCKET_META[showResult]
    return (
      <div className={compact ? 'max-w-xl mx-auto p-4' : 'max-w-2xl mx-auto p-6'}>
        <div className="bg-white rounded-xl border-2 border-[#36596A] shadow-lg p-6 sm:p-8">
          <div className="inline-block px-3 py-1 mb-3 rounded-full bg-[#36596A] text-white text-xs font-semibold uppercase tracking-wider">
            Your plan-type match
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#36596A] mb-2">{meta.label}</h2>
          <p className="text-gray-700 mb-4">{meta.blurb}</p>
          <p className="text-sm text-gray-600 mb-6">
            A licensed advisor will follow up shortly with plan options in your area. In the meantime,
            we'll send you educational resources about {meta.label} to the email you provided.
          </p>
          <p className="text-xs text-gray-500 border-t border-gray-200 pt-3">
            {COMPLIANCE_DISCLAIMER_PLACEHOLDER}
          </p>
        </div>
      </div>
    )
  }

  const q = questions[currentStep]
  return (
    <div className={compact ? 'max-w-xl mx-auto p-4' : 'max-w-2xl mx-auto p-6'}>
      <QuizProgress currentStep={currentStep} totalSteps={totalSteps} />
      <div className="mt-2">
        <QuizQuestion
          question={q}
          onAnswer={handleAnswer}
          currentAnswer={answers[q.id]}
          isLoading={submitting}
        />
        {errorMsg && (
          <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {errorMsg}
          </div>
        )}
        <p className="mt-6 text-xs text-gray-500 text-center">
          {COMPLIANCE_DISCLAIMER_PLACEHOLDER}
        </p>
      </div>
    </div>
  )
}
