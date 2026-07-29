'use client'

// Generic bucket quiz — fully driven by kit.quiz (see @/lib/capture-kits/types).
// Adding a vertical = writing a kit file; no edits to this component.
//
// UI shape (kept consistent across verticals so QA / a11y coverage transfers):
//   step 0 (if kind='zip')  → CoverStep (headline + subhead + ZIP + CTA)
//   step 1..N              → QuizProgress + QuizQuestion (existing widgets)
//   final (kind='email')   → personal-info-with-benefits step
//   post-submit            → ProcessingState → result view
//
// Kit-owned content: buckets, steps, resolver, resultCards, cover copy,
// processing message, result badge, comparison cards + highlight, per-answer
// personalization, compliance disclaimer, /get-help route. Component owns
// the flow, state, telemetry, and submit wiring.

import { useState, useEffect } from 'react'
import { QuizProgress } from './QuizProgress'
import { QuizQuestion } from './QuizQuestion'
import { ProcessingState } from './ProcessingState'
import { getKit } from '@/lib/capture-kits'
import type { CaptureKit, Vertical, QuizStep, QuizAnswers, BucketId } from '@/lib/capture-kits/types'

const SUBSCRIBE_ENDPOINT =
  'https://vpysqshhafthuxvokwqj.supabase.co/functions/v1/subscribe'

export interface BucketQuizPrefill {
  zip?: string
  ageBand?: string
  incomeTier?: string
  rxLevel?: string
  currentCoverage?: string
  /** Free-form pass-through — pre-answers keyed by step id. */
  [key: string]: unknown
}

export interface BucketQuizCalcResults {
  totalAnnualCost?: number
  monthlyPremiums?: number
}

export interface BucketQuizProps {
  /**
   * Which vertical's kit drives the quiz. String prop for RSC-safety —
   * kit objects hold non-serializable resolver / personalize functions.
   */
  vertical: Vertical
  slug: string
  variant?: 'standalone' | 'bridge'
  prefill?: BucketQuizPrefill
  calculatorResults?: BucketQuizCalcResults
  compact?: boolean
  onComplete?: (bucket: BucketId) => void
}

// ─── Compliance disclaimer ───────────────────────────────────────────
function DisclaimerLine({
  kit,
  className,
}: {
  kit: CaptureKit
  className?: string
}) {
  const text = kit.compliance.disclaimer ?? kit.compliance.educationalNotice
  return <p className={className}>{text}</p>
}

// ─── Kit-step → QuizQuestion widget adapter ──────────────────────────
function toQuizQuestionShape(step: QuizStep) {
  switch (step.kind) {
    case 'zip':
      return {
        id: step.id,
        title: step.question,
        subtitle: step.helper,
        type: 'zip-only' as const,
        placeholder: 'Enter 5-digit ZIP',
        maxlength: 5,
      }
    case 'single-choice':
      return {
        id: step.id,
        title: step.question,
        subtitle: step.helper,
        type: 'multiple-choice' as const,
        options: step.options.map((o) => o.label),
      }
    case 'multi-choice':
      return {
        id: step.id,
        title: step.question,
        subtitle: step.helper,
        type: 'multi-select' as const,
        options: step.options.map((o) => o.label),
      }
    case 'email':
      return {
        id: step.id,
        title: step.question,
        subtitle: step.helper,
        type: 'personal-info-with-benefits' as const,
        benefits: [
          'Personalized match based on your answers',
          'Optional agent match — a licensed advisor in your area',
          'No obligation, no cost — educational only',
        ],
      }
  }
}

// ─── Telemetry beacon (kit-agnostic) ─────────────────────────────────
function trackQuiz(
  event: 'quiz_view' | 'quiz_step_advance' | 'quiz_bucket_resolved' | 'quiz_email_submit',
  payload: { kit: CaptureKit; slug: string; variant: string; step?: number; bucket?: string },
) {
  if (typeof window === 'undefined') return
  let sessionId: string | null = null
  try {
    sessionId = window.localStorage.getItem('ss_cta_session')
    if (!sessionId) {
      sessionId = crypto.randomUUID()
      window.localStorage.setItem('ss_cta_session', sessionId)
    }
  } catch {
    /* Safari ITP */
  }
  const body = JSON.stringify({
    event: event === 'quiz_view' ? 'reveal' : event === 'quiz_email_submit' ? 'click' : 'reveal',
    cta_type: 'quiz',
    cta_position: 'inline',
    slug: `${payload.kit.vertical.replace('_', '-')}-quiz:${payload.slug}`,
    is_money_page: true,
    device: window.matchMedia?.('(max-width: 768px)').matches ? 'mobile' : 'desktop',
    session_id: sessionId,
    quiz_event: event,
    quiz_variant: payload.variant,
    quiz_step: payload.step,
    quiz_bucket: payload.bucket,
    quiz_vertical: payload.kit.vertical,
  })
  try {
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/telemetry/cta', new Blob([body], { type: 'application/json' }))
      return
    }
  } catch {
    /* fall through */
  }
  fetch('/api/telemetry/cta', {
    method: 'POST',
    body,
    keepalive: true,
    headers: { 'Content-Type': 'application/json' },
  }).catch(() => {})
}

function formatCurrency(n: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n)
}

// ─── Component ───────────────────────────────────────────────────────
export default function BucketQuiz({
  vertical,
  slug,
  variant = 'standalone',
  prefill = {},
  calculatorResults,
  compact = false,
  onComplete,
}: BucketQuizProps) {
  const kit = getKit(vertical)
  if (!kit?.quiz) {
    // Kit doesn't define a quiz — render nothing. Component is safe to drop
    // into any tree that might match a non-quiz-having kit.
    return null
  }
  const quizSpec = kit.quiz

  // Bridge skip: for the bridge variant, skip steps whose id already appears
  // in prefill with a non-empty value. Standalone always asks every step.
  const questions = quizSpec.steps.filter((step) => {
    if (variant !== 'bridge') return true
    const pre = prefill[step.id]
    if (pre === undefined || pre === null || pre === '') return true
    return false
  })
  const totalSteps = questions.length

  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<QuizAnswers>(() => {
    const seed: QuizAnswers = {}
    for (const step of quizSpec.steps) {
      const pre = prefill[step.id]
      if (pre !== undefined && pre !== null && pre !== '') seed[step.id] = pre
    }
    return seed
  })
  const [submitting, setSubmitting] = useState(false)
  const [showResult, setShowResult] = useState<BucketId | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    trackQuiz('quiz_view', { kit, slug, variant })
  }, [kit, slug, variant])

  const handleAnswer = async (answer: unknown) => {
    const q = questions[currentStep]
    const nextAnswers: QuizAnswers = { ...answers, [q.id]: answer }
    setAnswers(nextAnswers)
    trackQuiz('quiz_step_advance', { kit, slug, variant, step: currentStep + 1 })

    if (q.kind === 'email') {
      const personalInfo = answer as { email?: string; firstName?: string; lastName?: string; phone?: string; preferredContact?: string }
      const email = (personalInfo?.email ?? '').trim()
      if (!email || !email.includes('@')) {
        setErrorMsg('A valid email is required so we can send your match.')
        return
      }
      const bucket = quizSpec.resolver(nextAnswers)
      trackQuiz('quiz_bucket_resolved', { kit, slug, variant, bucket })
      setSubmitting(true)
      setErrorMsg(null)
      try {
        const referrer =
          typeof document !== 'undefined' ? document.referrer || null : null
        const landingPage =
          typeof window !== 'undefined' ? window.location.href : null
        const utmStorage =
          typeof sessionStorage !== 'undefined'
            ? sessionStorage.getItem('seniorsimple_utm')
            : null
        const utmParams = utmStorage ? JSON.parse(utmStorage) : {}

        // If the kit defines a submit route, post the full CRM payload there.
        // Otherwise post directly to the external subscribe endpoint with
        // quiz_context so the smart-tagger fires.
        const submitUrl = quizSpec.submitRoute
        if (submitUrl) {
          const res = await fetch(submitUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              firstName: personalInfo?.firstName ?? null,
              lastName: personalInfo?.lastName ?? null,
              email,
              phone: personalInfo?.phone ?? null,
              zipCode: nextAnswers.zipCode ?? null,
              preferredContact: personalInfo?.preferredContact ?? 'email',
              source: 'article_quiz',
              siteKey: kit.brand,
              articleSlug: slug,
              landingPage,
              referrer,
              quizBucket: bucket,
              rxLevel: nextAnswers.rxLevel ?? null,
              quizAnswers: { ...nextAnswers, prefill, variant },
              ...utmParams,
            }),
          })
          if (!res.ok) {
            const errorText = await res.text().catch(() => '')
            throw new Error(
              `Submission failed (${res.status}): ${errorText.slice(0, 200)}`,
            )
          }
        } else {
          const res = await fetch(SUBSCRIBE_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email,
              first_name: personalInfo?.firstName ?? null,
              zip_code: nextAnswers.zipCode ?? null,
              site_id: kit.brand,
              source: 'article_quiz',
              source_detail: `${kit.vertical.replace('_', '-')}-quiz:${slug}`,
              tags: [kit.vertical, `bucket:${bucket}`],
              quiz_context: { bucket, vertical: kit.vertical, answers: nextAnswers },
              website: '',
            }),
          })
          if (!res.ok) throw new Error(`Submission failed (${res.status})`)
        }
        trackQuiz('quiz_email_submit', { kit, slug, variant, bucket })
        setShowResult(bucket)
        onComplete?.(bucket)
      } catch (e) {
        setErrorMsg(
          e instanceof Error ? e.message : 'Something went wrong. Please try again.',
        )
      } finally {
        setSubmitting(false)
      }
      return
    }

    if (currentStep < totalSteps - 1) setCurrentStep(currentStep + 1)
  }

  if (submitting)
    return (
      <ProcessingState
        message={quizSpec.processingMessage ?? 'Matching you with the right option…'}
      />
    )

  if (showResult) {
    const meta = quizSpec.buckets.find((b) => b.id === showResult)
    const card = quizSpec.resultCards.find((c) => c.bucketId === showResult)
    if (!meta || !card) return null
    const personalization = quizSpec.personalize?.(showResult, answers) ?? null
    const highlightedCardKey = quizSpec.highlightForBucket?.(showResult) ?? null
    const totalAnnual = calculatorResults?.totalAnnualCost
    const showCosts = typeof totalAnnual === 'number' && totalAnnual > 0

    return (
      <div className={compact ? 'max-w-2xl mx-auto p-4' : 'max-w-4xl mx-auto p-6'}>
        <div className="bg-white rounded-xl border-2 border-[#36596A] shadow-lg p-6 sm:p-8">
          <div className="inline-block px-3 py-1 mb-3 rounded-full bg-[#36596A] text-white text-xs font-semibold uppercase tracking-wider">
            {quizSpec.resultBadge ?? 'Your match'}
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#36596A] mb-2">
            {card.headline}
          </h2>
          {card.subhead && <p className="text-gray-700 mb-5">{card.subhead}</p>}

          <div className="bg-[#F3F6F8] rounded-lg p-4 mb-5">
            <h3 className="text-sm font-semibold text-[#36596A] uppercase tracking-wider mb-2">
              What to look for
            </h3>
            <ul className="space-y-1.5 text-sm text-gray-700">
              {card.bullets.map((item, i) => (
                <li key={i} className="flex items-start">
                  <span className="text-[#36596A] mr-2 mt-0.5">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {personalization && (
            <p className="text-sm text-gray-700 bg-[#FFF8E7] border-l-4 border-[#E0A800] pl-3 py-2 mb-5">
              {personalization}
            </p>
          )}

          {quizSpec.comparisonCards && quizSpec.comparisonCards.length > 0 && (
            <div className="border-t border-gray-200 pt-5 mb-5">
              <h3 className="text-sm font-semibold text-[#36596A] uppercase tracking-wider mb-3">
                How the options compare
              </h3>
              <div className="grid gap-3 sm:grid-cols-3">
                {quizSpec.comparisonCards.map((cc) => {
                  const isHighlighted = cc.key === highlightedCardKey
                  return (
                    <div
                      key={cc.key}
                      className={
                        'rounded-lg p-4 border-2 ' +
                        (isHighlighted
                          ? 'bg-green-50 border-green-500'
                          : 'bg-white border-gray-200')
                      }
                    >
                      {isHighlighted && (
                        <div className="inline-block bg-green-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full mb-2 uppercase tracking-wider">
                          Best fit for you
                        </div>
                      )}
                      <h4 className="text-sm font-bold text-gray-800 mb-2 leading-tight">
                        {cc.title}
                      </h4>
                      {showCosts && (
                        <>
                          <div
                            className={
                              'text-xl font-bold mb-0.5 ' +
                              (isHighlighted ? 'text-green-700' : 'text-gray-700')
                            }
                          >
                            {formatCurrency(totalAnnual! * cc.costMultiplier)}
                          </div>
                          <p className="text-[11px] text-gray-500 mb-2">{cc.costCaption}</p>
                        </>
                      )}
                      <ul className="space-y-1 text-xs text-gray-600">
                        {cc.bullets.map((b, i) => (
                          <li key={i} className="flex items-start">
                            <span
                              className={
                                'mr-1.5 mt-0.5 ' +
                                (b.tone === 'warn' ? 'text-orange-600' : 'text-green-600')
                              }
                            >
                              {b.tone === 'warn' ? '⚠' : '✓'}
                            </span>
                            <span>{b.text}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )
                })}
              </div>
              {!highlightedCardKey && (
                <p className="text-xs text-gray-500 mt-3">
                  Your match ({meta.label}) has its own path outside these three
                  categories. The cards above are for reference — a licensed advisor can
                  walk you through how they interact with your situation.
                </p>
              )}
            </div>
          )}

          <p className="text-sm text-gray-600 mb-4">
            A licensed advisor will follow up shortly. In the meantime, we&apos;ll send
            you educational resources about {meta.label} to the email you provided.
          </p>
          <p className="text-sm mb-6">
            <a
              href={`${kit.getHelpRoute}?bucket=${encodeURIComponent(showResult)}&slug=${encodeURIComponent(slug)}`}
              className="inline-flex items-center text-[#36596A] font-semibold underline hover:text-[#264657]"
            >
              Prefer to talk to an advisor now? Request a callback →
            </a>
          </p>
          <DisclaimerLine kit={kit} className="text-xs text-gray-500 border-t border-gray-200 pt-3" />
        </div>
      </div>
    )
  }

  const q = questions[currentStep]

  // §8-A cover: step 0 + first step is zip → show cover.
  if (currentStep === 0 && q.kind === 'zip') {
    return (
      <CoverStep
        kit={kit}
        onContinue={(zip) => handleAnswer(zip)}
        errorMsg={errorMsg}
      />
    )
  }

  const qShape = toQuizQuestionShape(q)
  return (
    <div className={compact ? 'max-w-xl mx-auto p-4' : 'max-w-2xl mx-auto p-6'}>
      <QuizProgress currentStep={currentStep} totalSteps={totalSteps} />
      <div className="mt-2">
        <QuizQuestion
          question={qShape as any}
          onAnswer={handleAnswer}
          currentAnswer={answers[q.id]}
          isLoading={submitting}
        />
        {errorMsg && (
          <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {errorMsg}
          </div>
        )}
        <DisclaimerLine kit={kit} className="mt-6 text-xs text-gray-500 text-center" />
      </div>
    </div>
  )
}

function CoverStep({
  kit,
  onContinue,
  errorMsg,
}: {
  kit: CaptureKit
  onContinue: (zip: string) => void
  errorMsg: string | null
}) {
  const cover = kit.quiz?.cover
  const headline = cover?.headline ?? 'Get your match'
  const subhead = cover?.subhead ?? 'Answer a few questions and get a personalized recommendation.'
  const ctaLabel = cover?.ctaLabel ?? 'Continue'

  const [zip, setZip] = useState('')
  const [localErr, setLocalErr] = useState<string | null>(null)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLocalErr(null)
    if (!/^\d{5}$/.test(zip)) {
      setLocalErr('Please enter a valid 5-digit ZIP.')
      return
    }
    onContinue(zip)
  }
  const showError = localErr ?? errorMsg
  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-xl border-2 border-[#36596A] shadow-lg p-6 sm:p-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-[#36596A] mb-2">{headline}</h2>
        <p className="text-gray-700 mb-5">{subhead}</p>
        <form onSubmit={handleSubmit} className="space-y-3">
          <label className="block">
            <span className="text-sm font-medium text-gray-700 mb-1 block">ZIP code</span>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="postal-code"
              placeholder="5-digit ZIP"
              value={zip}
              maxLength={5}
              onChange={(e) => setZip(e.target.value.replace(/\D/g, '').slice(0, 5))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#36596A] focus:border-[#36596A] text-lg"
            />
          </label>
          {showError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {showError}
            </div>
          )}
          <button
            type="submit"
            className="w-full bg-[#36596A] text-white font-semibold py-3 rounded-lg hover:bg-[#264657] transition-colors text-lg"
          >
            {ctaLabel}
          </button>
        </form>
        <DisclaimerLine kit={kit} className="mt-6 text-xs text-gray-500" />
      </div>
    </div>
  )
}
