'use client'

// §2 Medicare Bucket Quiz — segments user into a plan-type lane and captures
// email as a qualified lead. Two entry points, one component:
//   variant='standalone'  → mid-scroll insertion on Medicare articles
//   variant='bridge'      → post-output bridge on the cost calculator
//
// Clone-basis: FinalExpenseQuiz (progressive shell, QuizProgress + QuizQuestion).
// Submit path: reuses /api/leads/medicare-calculator/route.ts (extended to
// accept quizBucket + rxLevel + articleSlug + quizAnswers; server-computes
// hem_sha256 — never trust a client hash).
//
// It's a MATCH, not a quote (packet §3a):
//   The result is a plan-type match + "what to look for" + agent connection.
//   Never a binding premium. The word "quote" MUST NOT appear in this
//   component's user-visible copy. Medicare Advantage is routinely $0-premium;
//   Medigap needs underwriting — the calculator owns cost estimates, the quiz
//   owns plan-type direction.
//
// Bucket taxonomy (deterministic; ships as a mapping table in resolveBucket):
//   advantage — all-in-one / dental+vision / $0-premium interest
//   medigap   — provider freedom / travel / predictable costs;
//               also captures rx-heavy + cost-sensitive tilt
//   dual      — Medicaid / low-income situation signal
//   working   — employer coverage / delaying enrollment
//
// Compliance: framing is educational + agent-match ONLY. Never "enroll in X."
// TPMO-style disclaimer renders below the form and result — text pulled from
// lib/compliance.getMedicareComplianceDisclaimer() (env-gated so the
// placeholder can never ship). Falls back to a neutral educational notice
// when compliance copy is unset.

import { useState, useEffect } from 'react'
import { QuizProgress } from './QuizProgress'
import { QuizQuestion } from './QuizQuestion'
import { ProcessingState } from './ProcessingState'
import { getMedicareComplianceDisclaimer, getMedicareEducationalNotice } from '@/lib/compliance'

export type MedicareBucket = 'advantage' | 'medigap' | 'dual' | 'working'
export type RxLevel = 'several' | 'few' | 'none'
export type SituationEnum = 'turning_65' | 'already_medicare' | 'working_employer' | 'medicaid_low_income'
export type PreferenceEnum = 'keep_my_doctors' | 'dental_vision' | 'lowest_premium' | 'help_paying_costs'

export interface MedicareBucketQuizPrefill {
  ageBand?: string
  zip?: string
  incomeTier?: string
  currentCoverage?: string  // maps to a SituationEnum when possible
  rxLevel?: RxLevel         // when supplied, bridge skips the Rx question
}

// Calculator cost figures forwarded into the result view. Only supplied in
// bridge mode — the standalone article mount has no numbers, so the result
// renders bullet copy without dollar figures.
export interface MedicareBucketQuizCalcResults {
  totalAnnualCost?: number
  monthlyPremiums?: number
}

export interface MedicareBucketQuizProps {
  slug: string
  variant?: 'standalone' | 'bridge'
  prefill?: MedicareBucketQuizPrefill
  calculatorResults?: MedicareBucketQuizCalcResults
  compact?: boolean
  onComplete?: (bucket: MedicareBucket) => void
}

// ─────────────────────────────────────────────────────────────
// COMPLIANCE — TPMO-style disclaimer.
// Sourced via lib/compliance.ts from NEXT_PUBLIC_MEDICARE_COMPLIANCE_DISCLAIMER.
// If unset, the accessor returns null and we render the neutral educational
// notice instead. It is IMPOSSIBLE for a "[PLACEHOLDER…" string to reach the
// UI — the accessor rejects it defensively even if the env var is misset.
// ─────────────────────────────────────────────────────────────
function DisclaimerLine({ className }: { className?: string }) {
  const compliance = getMedicareComplianceDisclaimer()
  const text = compliance ?? getMedicareEducationalNotice()
  return <p className={className}>{text}</p>
}

// ─────────────────────────────────────────────────────────────
// Question definitions. Options carry human copy; normalizers below map that
// copy to stable enum values the resolver consumes. If you change option
// text, keep the normalizer's substring match in sync.
// ─────────────────────────────────────────────────────────────

const Q_ZIP = {
  id: 'zipCode',
  title: "Let's start with your ZIP",
  subtitle: 'So we can check what is actually available where you live — Medicare plans and pricing vary by county.',
  type: 'zip-only' as const,
  placeholder: 'Enter 5-digit ZIP',
  maxlength: 5,
}

const Q_MEDICARE_STATUS = {
  id: 'medicareStatus',
  title: 'Where are you today with Medicare?',
  subtitle: 'This is the strongest signal for which plan type actually fits.',
  type: 'multiple-choice' as const,
  options: [
    'Turning 65 — enrolling soon',
    'Already on Medicare',
    'Still working, 65+ (employer coverage)',
    'Have Medicaid or limited income',
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

const Q_PRESCRIPTIONS = {
  id: 'rxLevel',
  title: 'Do you take regular prescription medications?',
  subtitle: 'We do not ask which medications — this just tells us how much Part D drug coverage should factor in.',
  type: 'multiple-choice' as const,
  options: [
    'Yes — several regular prescriptions',
    'A few (1–3 regular prescriptions)',
    'No — none right now',
  ],
}

const Q_PERSONAL = {
  id: 'personalInfo',
  title: 'Where should we send your plan-type match?',
  subtitle: 'A licensed Medicare advisor can walk you through the plans in your area.',
  type: 'personal-info-with-benefits' as const,
  benefits: [
    'Personalized plan-type match based on your answers',
    'Optional agent match — a licensed advisor in your area',
    'No obligation, no cost — educational only',
  ],
}

// ─────────────────────────────────────────────────────────────
// Option → enum normalizers. Keeps the resolver decoupled from copy.
// ─────────────────────────────────────────────────────────────

function normSituation(s: unknown): SituationEnum | null {
  const t = String(s ?? '').toLowerCase()
  if (t.includes('medicaid') || t.includes('limited income')) return 'medicaid_low_income'
  if (t.includes('still working')) return 'working_employer'
  if (t.includes('already')) return 'already_medicare'
  if (t.includes('turning 65') || t.includes('enrolling soon')) return 'turning_65'
  // Prefill "currentCoverage" from calculator: 'employer' → working, 'medicare' → already
  if (t === 'employer') return 'working_employer'
  if (t === 'medicare') return 'already_medicare'
  return null
}

function normPreference(s: unknown): PreferenceEnum | null {
  const t = String(s ?? '').toLowerCase()
  if (t.includes('keep my doctors') || t.includes('travel')) return 'keep_my_doctors'
  if (t.includes('dental') || t.includes('vision')) return 'dental_vision'
  if (t.includes('lowest') || t.includes('premium')) return 'lowest_premium'
  if (t.includes('help paying')) return 'help_paying_costs'
  return null
}

function normRxLevel(s: unknown): RxLevel | null {
  const t = String(s ?? '').toLowerCase()
  if (['several', 'few', 'none'].includes(t)) return t as RxLevel
  if (t.includes('several')) return 'several'
  if (t.includes('a few') || t.includes('1–3') || t.includes('1-3')) return 'few'
  if (t.includes('no') || t.includes('none')) return 'none'
  return null
}

// ─────────────────────────────────────────────────────────────
// Deterministic bucket resolver (packet §3):
//   dual        — situation = medicaid_low_income
//   working     — situation = working_employer
//   medigap     — preference = keep_my_doctors
//                 OR (rx_level in several/few AND preference = help_paying_costs)
//   advantage   — preference in (lowest_premium, dental_vision)
//   else        — advantage (default fork; broadest fit for undecided users)
//
// NOTE: "help paying costs" alone no longer routes to dual — dual is reserved
// for the explicit Medicaid situation signal. This is a deliberate change
// from the earlier resolver; the situation question is the compliant channel
// for identifying dual-eligibles, and "help paying" is a preference/tilt.
// ─────────────────────────────────────────────────────────────

function resolveBucket(answers: Record<string, any>, prefill?: MedicareBucketQuizPrefill): MedicareBucket {
  const situation = normSituation(answers.medicareStatus ?? prefill?.currentCoverage)
  const preference = normPreference(answers.mattersMost)
  const rx = normRxLevel(answers.rxLevel ?? prefill?.rxLevel)

  if (situation === 'medicaid_low_income') return 'dual'
  if (situation === 'working_employer') return 'working'

  if (preference === 'keep_my_doctors') return 'medigap'
  if ((rx === 'several' || rx === 'few') && preference === 'help_paying_costs') return 'medigap'

  if (preference === 'lowest_premium' || preference === 'dental_vision') return 'advantage'

  return 'advantage'
}

// ─────────────────────────────────────────────────────────────
// Result-view copy. "What to look for" bullets are the packet §3a
// deliverable — they replace the missing "quote" with concrete signals the
// user can raise with an agent. Rx-driven personalization sits below the
// bullets so the user can see their Part D answer visibly shape the result.
// ─────────────────────────────────────────────────────────────

// Exported so the internal preview page can render the same label / blurb /
// what-to-look-for content Keenan will see without having to complete the
// quiz five times. Downstream code should treat this as read-only reference.
export const MEDICARE_BUCKET_META: Record<MedicareBucket, {
  label: string
  blurb: string
  whatToLookFor: string[]
}> = {
  advantage: {
    label: 'Medicare Advantage',
    blurb: 'All-in-one plans that bundle Part A, B, and usually D — often with dental, vision, and fitness benefits and frequently $0-premium.',
    whatToLookFor: [
      'A plan with a 4-star or 5-star CMS rating',
      'Your doctors and hospitals in the plan\'s network',
      'Included drug coverage that lists your regular prescriptions',
      'Extra benefits that actually match how you use care (dental / vision / OTC)',
    ],
  },
  medigap: {
    label: 'Medigap + Part D',
    blurb: 'Original Medicare paired with a supplement — see any doctor that accepts Medicare, predictable out-of-pocket costs, no network to check.',
    whatToLookFor: [
      'A standardized letter plan (Plan G or Plan N are the common picks)',
      'Whether you\'re still in your guaranteed-issue window (no underwriting)',
      'Rate history for the specific insurer — some raise premiums fast',
      'A standalone Part D plan that covers your prescriptions',
    ],
  },
  dual: {
    label: 'Dual-Eligible (Medicaid + Medicare)',
    blurb: 'Special programs for people who qualify for both Medicare and Medicaid. Can cover premiums, reduce copays, and add benefits.',
    whatToLookFor: [
      'A D-SNP (Dual Special Needs Plan) in your county',
      'Whether you qualify for a Medicare Savings Program to cover Part B',
      'Extra Help / LIS for prescription drug costs',
      'Care coordination benefits that come with dual-eligible plans',
    ],
  },
  working: {
    label: 'Still Working, 65+',
    blurb: 'You may be able to delay Part B (and its late-enrollment penalty) if your employer coverage qualifies. Timing is the whole game here.',
    whatToLookFor: [
      'Whether your employer plan is creditable coverage (20+ employees usually is)',
      'How Medicare would coordinate as primary vs. secondary payer',
      'Your Part B Special Enrollment Period window when you retire',
      'Whether enrolling in Part A only (premium-free) makes sense now',
    ],
  },
}

// ─────────────────────────────────────────────────────────────
// Plan-comparison cards. Lifted from the standalone Medicare Plan Comparison
// widget that used to sit alongside the calculator on article pages (§7-B
// removed it). These cards now render as the quiz's RESULT SURFACE, themed
// to the resolved bucket:
//   - `advantage` bucket → Medicare Advantage card is highlighted
//   - `medigap` bucket   → Original Medicare + Medigap card is highlighted
//   - `dual` / `working` → cards render as reference; the bucket's own
//     card (Dual-Eligible / Still Working) shows above the comparison as
//     the primary recommendation, since these buckets have no direct match
//     among the 3 comparison-card categories.
// Cost figures render only when calculatorResults is supplied (bridge mode);
// standalone article mount shows the same cards without dollar amounts.
// ─────────────────────────────────────────────────────────────

type CardKey = 'medigap' | 'advantage' | 'advantage_supplement'
const PLAN_COMPARISON_CARDS: Array<{
  key: CardKey
  title: string
  costMultiplier: number   // multiplier against calculator totalAnnualCost
  costCaption: string
  bullets: Array<{ tone: 'good' | 'warn'; text: string }>
}> = [
  {
    key: 'medigap',
    title: 'Original Medicare + Medigap',
    costMultiplier: 1.0,
    costCaption: 'Your baseline estimate',
    bullets: [
      { tone: 'good', text: 'See any doctor that accepts Medicare' },
      { tone: 'good', text: 'No referrals, no network to check' },
      { tone: 'good', text: 'Predictable out-of-pocket costs' },
    ],
  },
  {
    key: 'advantage',
    title: 'Medicare Advantage',
    costMultiplier: 0.85,
    costCaption: 'Typically ~15% less',
    bullets: [
      { tone: 'good', text: 'Lower or $0 monthly premium' },
      { tone: 'good', text: 'Often includes dental / vision / drug coverage' },
      { tone: 'warn', text: 'Network + prior-auth restrictions' },
    ],
  },
  {
    key: 'advantage_supplement',
    title: 'Medicare Advantage + Supplement',
    costMultiplier: 0.75,
    costCaption: 'Best value when it fits',
    bullets: [
      { tone: 'good', text: 'Lowest total cost when eligible' },
      { tone: 'good', text: 'Comprehensive coverage' },
      { tone: 'good', text: 'Extra benefits included' },
    ],
  },
]

// Which comparison card should be highlighted for each resolved bucket.
// Null means the bucket doesn't map to a comparison card (dual / working):
// those buckets show their own bucket-specific recommendation above and use
// the cards purely as reference.
const BUCKET_HIGHLIGHTED_CARD: Record<MedicareBucket, CardKey | null> = {
  advantage: 'advantage',
  medigap: 'medigap',
  dual: null,
  working: null,
}

function formatCurrency(n: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n)
}

function rxPersonalization(bucket: MedicareBucket, rx: RxLevel | null): string | null {
  if (!rx) return null
  if (rx === 'several' || rx === 'few') {
    if (bucket === 'medigap') {
      return "Because you take regular prescriptions, your match pairs Medigap with a standalone Part D plan — that combination gives you predictable costs on doctor visits AND drug coverage tuned to your medications."
    }
    if (bucket === 'advantage') {
      return "Because you take regular prescriptions, look closely at each Advantage plan's included Part D formulary — the same plan can be a great fit or a bad fit depending on whether it covers your specific medications."
    }
    if (bucket === 'dual') {
      return "Because you take regular prescriptions, ask about Extra Help / LIS — it can dramatically lower what you pay for medications on top of the dual-eligible benefits."
    }
    if (bucket === 'working') {
      return "Because you take regular prescriptions, compare your employer plan's drug coverage to Medicare Part D before deciding when to switch — one may cost you much less."
    }
  }
  if (rx === 'none') {
    return "Since you're not on regular prescriptions right now, a basic or lower-tier Part D plan is usually enough — but it's still worth enrolling to avoid a late-enrollment penalty later."
  }
  return null
}

// ─────────────────────────────────────────────────────────────
// Telemetry beacon — first-party CTA events. Reuses the article_cta_events
// pattern (see /api/telemetry/cta) so bucket-mix funnel is queryable
// alongside phone/email CTA rates.
// ─────────────────────────────────────────────────────────────

function trackQuiz(event: 'quiz_view' | 'quiz_step_advance' | 'quiz_bucket_resolved' | 'quiz_email_submit',
                   payload: { slug: string; variant: string; step?: number; bucket?: string; rxLevel?: string }) {
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
    quiz_rx_level: payload.rxLevel,
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
  calculatorResults,
  compact = false,
  onComplete,
}: MedicareBucketQuizProps) {
  // Bridge skip rules: if the calculator (or upstream) has already told us
  // these, skip the ask. Only the bridge variant skips — standalone always
  // asks all five.
  const skipZip    = variant === 'bridge' && !!(prefill.zip && /^\d{5}$/.test(prefill.zip))
  const skipStatus = variant === 'bridge' && !!normSituation(prefill.currentCoverage)
  const skipRx     = variant === 'bridge' && !!normRxLevel(prefill.rxLevel)

  // Build the effective question list dynamically.
  // ZIP first — concrete "plans in your area" step lifts completion on the
  // softer preference questions that follow (packet §3, UI order).
  const questions = [
    ...(skipZip ? [] : [Q_ZIP]),
    ...(skipStatus ? [] : [Q_MEDICARE_STATUS]),
    Q_MATTERS_MOST,
    ...(skipRx ? [] : [Q_PRESCRIPTIONS]),
    Q_PERSONAL,
  ]
  const totalSteps = questions.length

  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, any>>(() => {
    // Seed with prefill values so the resolver + submit see them.
    const seed: Record<string, any> = {}
    if (prefill.zip) seed.zipCode = prefill.zip
    if (prefill.rxLevel) seed.rxLevel = prefill.rxLevel
    if (normSituation(prefill.currentCoverage)) seed.medicareStatus = prefill.currentCoverage
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
      const rx = normRxLevel(nextAnswers.rxLevel ?? prefill.rxLevel)
      trackQuiz('quiz_bucket_resolved', { slug, variant, bucket, rxLevel: rx ?? undefined })

      setSubmitting(true)
      setErrorMsg(null)
      try {
        const referrer = typeof document !== 'undefined' ? document.referrer || null : null
        const landingPage = typeof window !== 'undefined' ? window.location.href : null
        const utmStorage = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('seniorsimple_utm') : null
        const utmParams = utmStorage ? JSON.parse(utmStorage) : {}

        // Submit to the shared medicare-calculator route. Server computes
        // hem_sha256 from email — do NOT send a client hash (packet §6).
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
            rxLevel: rx,
            quizAnswers: {
              medicareStatus: nextAnswers.medicareStatus ?? null,
              mattersMost: nextAnswers.mattersMost ?? null,
              rxLevel: rx,
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
        trackQuiz('quiz_email_submit', { slug, variant, bucket, rxLevel: rx ?? undefined })
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
    const meta = MEDICARE_BUCKET_META[showResult]
    const rx = normRxLevel(answers.rxLevel ?? prefill.rxLevel)
    const rxCopy = rxPersonalization(showResult, rx)
    const highlightedCard = BUCKET_HIGHLIGHTED_CARD[showResult]
    const totalAnnual = calculatorResults?.totalAnnualCost
    // Bridge mode = we have calculator numbers. Standalone mode = show bullets only.
    const showCosts = typeof totalAnnual === 'number' && totalAnnual > 0
    return (
      <div className={compact ? 'max-w-2xl mx-auto p-4' : 'max-w-4xl mx-auto p-6'}>
        <div className="bg-white rounded-xl border-2 border-[#36596A] shadow-lg p-6 sm:p-8">
          <div className="inline-block px-3 py-1 mb-3 rounded-full bg-[#36596A] text-white text-xs font-semibold uppercase tracking-wider">
            Your plan-type match
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#36596A] mb-2">{meta.label}</h2>
          <p className="text-gray-700 mb-5">{meta.blurb}</p>

          <div className="bg-[#F3F6F8] rounded-lg p-4 mb-5">
            <h3 className="text-sm font-semibold text-[#36596A] uppercase tracking-wider mb-2">
              What to look for when you compare plans
            </h3>
            <ul className="space-y-1.5 text-sm text-gray-700">
              {meta.whatToLookFor.map((item, i) => (
                <li key={i} className="flex items-start">
                  <span className="text-[#36596A] mr-2 mt-0.5">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {rxCopy && (
            <p className="text-sm text-gray-700 bg-[#FFF8E7] border-l-4 border-[#E0A800] pl-3 py-2 mb-5">
              {rxCopy}
            </p>
          )}

          {/* Comparison cards — moved out of the legacy standalone widget in
              §7-B; they now live here, themed to the resolved bucket. Bridge
              mode fills in dollar figures; standalone mode shows bullets only. */}
          <div className="border-t border-gray-200 pt-5 mb-5">
            <h3 className="text-sm font-semibold text-[#36596A] uppercase tracking-wider mb-3">
              How the plan types compare
            </h3>
            <div className="grid gap-3 sm:grid-cols-3">
              {PLAN_COMPARISON_CARDS.map((card) => {
                const isHighlighted = card.key === highlightedCard
                return (
                  <div
                    key={card.key}
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
                    <h4 className="text-sm font-bold text-gray-800 mb-2 leading-tight">{card.title}</h4>
                    {showCosts && (
                      <>
                        <div className={'text-xl font-bold mb-0.5 ' + (isHighlighted ? 'text-green-700' : 'text-gray-700')}>
                          {formatCurrency(totalAnnual! * card.costMultiplier)}
                        </div>
                        <p className="text-[11px] text-gray-500 mb-2">{card.costCaption}</p>
                      </>
                    )}
                    <ul className="space-y-1 text-xs text-gray-600">
                      {card.bullets.map((b, i) => (
                        <li key={i} className="flex items-start">
                          <span className={'mr-1.5 mt-0.5 ' + (b.tone === 'warn' ? 'text-orange-600' : 'text-green-600')}>
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
            {!highlightedCard && (
              <p className="text-xs text-gray-500 mt-3">
                Your match ({meta.label}) has its own path outside these three categories. The
                cards above are for reference — a licensed advisor can walk you through how they
                interact with your situation.
              </p>
            )}
          </div>

          <p className="text-sm text-gray-600 mb-4">
            A licensed advisor will follow up shortly with plan options in your area. In the meantime,
            we'll send you educational resources about {meta.label} to the email you provided.
          </p>
          {/* High-intent path — packet §4: phone lives on /get-help/<vertical>,
              not on article pages. Bucket + slug pass through as query params
              so the get-help write path carries them into CRM lead / mirror. */}
          <p className="text-sm mb-6">
            <a
              href={`/get-help/medicare?bucket=${encodeURIComponent(showResult)}&slug=${encodeURIComponent(slug)}`}
              className="inline-flex items-center text-[#36596A] font-semibold underline hover:text-[#264657]"
            >
              Prefer to talk to an advisor now? Request a callback →
            </a>
          </p>
          <DisclaimerLine className="text-xs text-gray-500 border-t border-gray-200 pt-3" />
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
        <DisclaimerLine className="mt-6 text-xs text-gray-500 text-center" />
      </div>
    </div>
  )
}
