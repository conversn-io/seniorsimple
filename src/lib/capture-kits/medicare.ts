import type { CaptureKit, QuizAnswers, BucketId } from './types'

// ─── Medicare kit ────────────────────────────────────────────────────
// The vertical-specific data + resolver + compute functions that drive the
// generic BucketQuiz, Calculator, CaptureUnit, CaptureMount, and
// EducationalFacts components. Medicare-specific logic (bucket taxonomy,
// question copy, IRMAA math, comparison-card themes, TPMO disclaimer,
// magnets) lives here — the components themselves don't know Medicare exists.

type MedicareBucket = 'advantage' | 'medigap' | 'dual' | 'working'
type SituationEnum = 'turning_65' | 'already_medicare' | 'working_employer' | 'medicaid_low_income'
type PreferenceEnum = 'keep_my_doctors' | 'dental_vision' | 'lowest_premium' | 'help_paying_costs'
type RxLevel = 'several' | 'few' | 'none'

// Option-copy → stable enum normalizers. Keeps the resolver decoupled from
// user-facing option text.
function normSituation(s: unknown): SituationEnum | null {
  const t = String(s ?? '').toLowerCase()
  if (t.includes('medicaid') || t.includes('limited income')) return 'medicaid_low_income'
  if (t.includes('still working')) return 'working_employer'
  if (t.includes('already')) return 'already_medicare'
  if (t.includes('turning 65') || t.includes('enrolling soon')) return 'turning_65'
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

function resolveMedicareBucket(answers: QuizAnswers): BucketId {
  const situation = normSituation(answers.medicareStatus)
  const preference = normPreference(answers.mattersMost)
  const rx = normRxLevel(answers.rxLevel)

  if (situation === 'medicaid_low_income') return 'dual'
  if (situation === 'working_employer') return 'working'
  if (preference === 'keep_my_doctors') return 'medigap'
  if ((rx === 'several' || rx === 'few') && preference === 'help_paying_costs') return 'medigap'
  if (preference === 'lowest_premium' || preference === 'dental_vision') return 'advantage'
  return 'advantage'
}

function medicareRxPersonalize(bucket: BucketId, answers: QuizAnswers): string | null {
  const rx = normRxLevel(answers.rxLevel)
  if (!rx) return null
  if (rx === 'several' || rx === 'few') {
    if (bucket === 'medigap')
      return 'Because you take regular prescriptions, your match pairs Medigap with a standalone Part D plan — that combination gives you predictable costs on doctor visits AND drug coverage tuned to your medications.'
    if (bucket === 'advantage')
      return "Because you take regular prescriptions, look closely at each Advantage plan's included Part D formulary — the same plan can be a great fit or a bad fit depending on whether it covers your specific medications."
    if (bucket === 'dual')
      return 'Because you take regular prescriptions, ask about Extra Help / LIS — it can dramatically lower what you pay for medications on top of the dual-eligible benefits.'
    if (bucket === 'working')
      return "Because you take regular prescriptions, compare your employer plan's drug coverage to Medicare Part D before deciding when to switch — one may cost you much less."
  }
  if (rx === 'none') {
    return "Since you're not on regular prescriptions right now, a basic or lower-tier Part D plan is usually enough — but it's still worth enrolling to avoid a late-enrollment penalty later."
  }
  return null
}

function medicareHighlightForBucket(bucket: BucketId): string | null {
  if (bucket === 'advantage') return 'advantage'
  if (bucket === 'medigap') return 'medigap'
  return null
}

// ─── Calculator math (Medicare-specific IRMAA + state/health multipliers) ─
interface CalcInputs {
  age: number
  income: number
  state: string
  healthStatus: string
  prescriptions: number
}

function computeMedicareCosts(rawInputs: Record<string, string | number>): Record<string, number> {
  const inputs: CalcInputs = {
    age: Number(rawInputs.age ?? 65),
    income: Number(rawInputs.income ?? 50000),
    state: String(rawInputs.state ?? 'average'),
    healthStatus: String(rawInputs.healthStatus ?? 'good'),
    prescriptions: Number(rawInputs.prescriptions ?? 2),
  }
  const { income, state, healthStatus, prescriptions } = inputs

  const partAPremium = 0
  let partBPremium = 174.7
  let partDPremium = 48
  let medigapPremium = 150

  if (income > 103000) { partBPremium += 69.9; partDPremium += 12.9 }
  if (income > 129000) { partBPremium += 174.7; partDPremium += 33.3 }
  if (income > 161000) { partBPremium += 279.2; partDPremium += 53.8 }
  if (income > 193000) { partBPremium += 383.7; partDPremium += 74.2 }
  if (income > 500000) { partBPremium += 454.2; partDPremium += 81 }

  const stateMultipliers: Record<string, number> = {
    alabama: 0.85, alaska: 1.3, arizona: 0.95, california: 1.15,
    florida: 0.9, georgia: 0.88, illinois: 1.05, michigan: 0.92,
    newyork: 1.25, ohio: 0.87, pennsylvania: 0.95, texas: 0.9,
    virginia: 0.98, average: 1.0,
  }
  medigapPremium *= stateMultipliers[state] ?? 1.0

  const healthMultipliers: Record<string, number> = {
    excellent: 0.8, good: 1.0, fair: 1.3, poor: 1.6,
  }
  const healthMultiplier = healthMultipliers[healthStatus] ?? 1.0

  const outOfPocket = 2000 * healthMultiplier + prescriptions * 200
  const monthlyPremiums = partAPremium + partBPremium + partDPremium + medigapPremium
  const annualPremiums = monthlyPremiums * 12
  const totalAnnualCost = annualPremiums + outOfPocket

  return {
    partAPremium,
    partBPremium,
    partDPremium,
    medigapPremium,
    outOfPocket,
    monthlyPremiums,
    annualPremiums,
    totalAnnualCost,
  }
}

// ─── The kit ─────────────────────────────────────────────────────────

export const medicareKit: CaptureKit = {
  vertical: 'medicare',
  brand: 'seniorsimple',
  monetize: 'lead',
  getHelpRoute: '/get-help/medicare',

  compliance: {
    // Sourced at build time from the env var. Placeholder rejection is baked
    // into the accessor in @/lib/compliance so a "[PLACEHOLDER…" string
    // cannot reach the UI even if the env var is misset.
    disclaimer:
      (() => {
        const raw = process.env.NEXT_PUBLIC_MEDICARE_COMPLIANCE_DISCLAIMER
        if (!raw) return null
        const trimmed = raw.trim()
        if (!trimmed) return null
        if (trimmed.toUpperCase().startsWith('[PLACEHOLDER')) return null
        return trimmed
      })(),
    educationalNotice:
      'Educational information only. A licensed advisor can walk you through the specific plans available where you live.',
    enabledFlag: 'NEXT_PUBLIC_MEDICARE_QUIZ_ENABLED',
  },

  quiz: {
    buckets: [
      { id: 'advantage', label: 'Medicare Advantage' },
      { id: 'medigap', label: 'Medigap + Part D' },
      { id: 'dual', label: 'Dual-Eligible (Medicaid + Medicare)' },
      { id: 'working', label: 'Still Working, 65+' },
    ],
    steps: [
      { id: 'zipCode', kind: 'zip', question: "Let's start with your ZIP", helper: 'So we can check what is actually available where you live — Medicare plans and pricing vary by county.', required: true },
      { id: 'medicareStatus', kind: 'single-choice', question: 'Where are you today with Medicare?', helper: 'This is the strongest signal for which plan type actually fits.', required: true, options: [
        { value: 'Turning 65 — enrolling soon', label: 'Turning 65 — enrolling soon' },
        { value: 'Already on Medicare', label: 'Already on Medicare' },
        { value: 'Still working, 65+ (employer coverage)', label: 'Still working, 65+ (employer coverage)' },
        { value: 'Have Medicaid or limited income', label: 'Have Medicaid or limited income' },
      ] },
      { id: 'mattersMost', kind: 'single-choice', question: 'What matters most to you in a plan?', helper: 'Pick the one that fits best — this drives which plan type we match you with.', required: true, options: [
        { value: 'Keep my doctors, freedom to travel', label: 'Keep my doctors, freedom to travel' },
        { value: 'Dental, vision, hearing included', label: 'Dental, vision, hearing included' },
        { value: 'Lowest monthly premium', label: 'Lowest monthly premium' },
        { value: 'Help paying costs (I have limited income)', label: 'Help paying costs (I have limited income)' },
      ] },
      { id: 'rxLevel', kind: 'single-choice', question: 'Do you take regular prescription medications?', helper: 'We do not ask which medications — this just tells us how much Part D drug coverage should factor in.', required: true, options: [
        { value: 'Yes — several regular prescriptions', label: 'Yes — several regular prescriptions' },
        { value: 'A few (1–3 regular prescriptions)', label: 'A few (1–3 regular prescriptions)' },
        { value: 'No — none right now', label: 'No — none right now' },
      ] },
      { id: 'personalInfo', kind: 'email', question: 'Where should we send your plan-type match?', helper: 'A licensed Medicare advisor can walk you through the plans in your area.', required: true },
    ],
    resolver: resolveMedicareBucket,
    cover: {
      headline: 'Which Medicare Plan is Right for You?',
      subhead:
        'Get a personalized recommendation of which Medicare plan is right for your unique situation.',
      ctaLabel: 'Get Your Medicare Plan',
    },
    processingMessage: 'Matching you with the right Medicare plan type…',
    resultBadge: 'Your plan-type match',
    comparisonCards: [
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
    ],
    highlightForBucket: medicareHighlightForBucket,
    personalize: medicareRxPersonalize,
    submitRoute: '/api/leads/medicare-calculator',
    resultCards: [
      {
        bucketId: 'advantage',
        headline: 'Medicare Advantage',
        subhead: 'All-in-one plans that bundle Part A, B, and usually D — often with dental, vision, and fitness benefits and frequently $0-premium.',
        bullets: [
          'A plan with a 4-star or 5-star CMS rating',
          "Your doctors and hospitals in the plan's network",
          'Included drug coverage that lists your regular prescriptions',
          'Extra benefits that actually match how you use care (dental / vision / OTC)',
        ],
      },
      {
        bucketId: 'medigap',
        headline: 'Medigap + Part D',
        subhead: 'Original Medicare paired with a supplement — see any doctor that accepts Medicare, predictable out-of-pocket costs, no network to check.',
        bullets: [
          'A standardized letter plan (Plan G or Plan N are the common picks)',
          "Whether you're still in your guaranteed-issue window (no underwriting)",
          'Rate history for the specific insurer — some raise premiums fast',
          'A standalone Part D plan that covers your prescriptions',
        ],
      },
      {
        bucketId: 'dual',
        headline: 'Dual-Eligible (Medicaid + Medicare)',
        subhead: 'Special programs for people who qualify for both Medicare and Medicaid. Can cover premiums, reduce copays, and add benefits.',
        bullets: [
          'A D-SNP (Dual Special Needs Plan) in your county',
          'Whether you qualify for a Medicare Savings Program to cover Part B',
          'Extra Help / LIS for prescription drug costs',
          'Care coordination benefits that come with dual-eligible plans',
        ],
      },
      {
        bucketId: 'working',
        headline: 'Still Working, 65+',
        subhead: 'You may be able to delay Part B (and its late-enrollment penalty) if your employer coverage qualifies. Timing is the whole game here.',
        bullets: [
          'Whether your employer plan is creditable coverage (20+ employees usually is)',
          'How Medicare would coordinate as primary vs. secondary payer',
          'Your Part B Special Enrollment Period window when you retire',
          'Whether enrolling in Part A only (premium-free) makes sense now',
        ],
      },
    ],
  },

  calculator: {
    primary: 'gate', // Ruling 1: tool page = tool-gate email primary
    fields: [
      { id: 'age', kind: 'number', label: 'Age', min: 65, max: 100, default: 65 },
      { id: 'income', kind: 'number', label: 'Annual Income', helper: 'Affects IRMAA surcharges for higher earners', min: 0, step: 1000, default: 50000 },
      { id: 'state', kind: 'select', label: 'State', default: 'average', options: [
        { value: 'average', label: 'US Average' },
        { value: 'alabama', label: 'Alabama' },
        { value: 'alaska', label: 'Alaska' },
        { value: 'arizona', label: 'Arizona' },
        { value: 'california', label: 'California' },
        { value: 'florida', label: 'Florida' },
        { value: 'georgia', label: 'Georgia' },
        { value: 'illinois', label: 'Illinois' },
        { value: 'michigan', label: 'Michigan' },
        { value: 'newyork', label: 'New York' },
        { value: 'ohio', label: 'Ohio' },
        { value: 'pennsylvania', label: 'Pennsylvania' },
        { value: 'texas', label: 'Texas' },
        { value: 'virginia', label: 'Virginia' },
      ] },
      { id: 'healthStatus', kind: 'select', label: 'Health Status', default: 'good', options: [
        { value: 'excellent', label: 'Excellent' },
        { value: 'good', label: 'Good' },
        { value: 'fair', label: 'Fair' },
        { value: 'poor', label: 'Poor' },
      ] },
      { id: 'prescriptions', kind: 'number', label: 'Prescription Medications', helper: 'Approximate number of regular prescriptions', min: 0, max: 20, default: 2 },
    ],
    compute: computeMedicareCosts,
    resultLines: [
      { id: 'partBPremium', label: 'Part B Premium (Monthly)', format: 'currency' },
      { id: 'partDPremium', label: 'Part D Premium (Monthly)', format: 'currency' },
      { id: 'medigapPremium', label: 'Medigap Premium (Monthly)', format: 'currency' },
      { id: 'monthlyPremiums', label: 'Total Monthly Premiums', format: 'currency' },
      { id: 'annualPremiums', label: 'Annual Premiums', format: 'currency' },
      { id: 'outOfPocket', label: 'Estimated Out-of-Pocket', format: 'currency' },
      { id: 'totalAnnualCost', label: 'Total Annual Cost', format: 'currency' },
    ],
  },

  magnets: [
    {
      id: 'decision-kit',
      lpSlug: 'medicare-decision-kit-2026',
      title: '2026 Medicare Decision Kit',
      fileName: 'seniorsimple-medicare-decision-kit-2026.pdf',
      downloadPath: '/lead-magnets/medicare-decision-kit-2026.pdf',
      coverImagePath: '/lead-magnets/covers/medicare-decision-kit-2026.svg',
      emailSubject: 'Your 2026 Medicare Decision Kit is inside',
      successHeadline: 'Your Decision Kit is on the way.',
      successBody:
        "Check your inbox — we've sent the 2026 Medicare Decision Kit. You can also download it now.",
      ctaLabel: 'Send Me the Decision Kit',
      adHeadline: 'Free 2026 Medicare Decision Kit',
      adSubhead:
        'Plain-English guide to Medicare, Medigap, Advantage, and Part D — 2026 rates included.',
      lpHeadline: 'Everything you need to pick a Medicare plan this year.',
      lpSubhead:
        'A step-by-step guide from SeniorSimple. No agent will contact you — just the numbers, the trade-offs, and a decision framework you can act on.',
      lpBullets: [
        '2026 premiums, deductibles, and out-of-pocket caps for every plan type',
        'Medigap vs. Medicare Advantage — a plain-English side-by-side',
        'The one Part D question that saves seniors ~$700/year',
        "A 3-step enrollment checklist so you don't miss a deadline",
      ],
    },
    {
      id: 'tool-result',
      lpSlug: 'medicare-estimate',
      title: 'Your Medicare Estimate',
      fileName: 'seniorsimple-medicare-estimate.pdf',
      downloadPath: '/lead-magnets/medicare-estimate-template.pdf',
      coverImagePath: '/lead-magnets/covers/medicare-estimate.svg',
      emailSubject: 'Your Medicare estimate is inside',
      successHeadline: 'Your estimate is on the way.',
      successBody: "We've emailed your Medicare estimate. You can also download a copy now.",
      ctaLabel: 'Email Me My Estimate',
      adHeadline: 'Get your Medicare estimate — by email',
      adSubhead:
        'A saved copy of your Medicare cost estimate, plus the SeniorSimple planning guide.',
      lpHeadline: 'Your Medicare estimate, on paper.',
      lpSubhead:
        'Save your Medicare cost estimate as a PDF and get the SeniorSimple planning guide alongside it. No agent, no sales call.',
      lpBullets: [
        'Your monthly premium estimate broken down by Medicare part',
        'How your income triggers IRMAA — and what to do about it',
        'The 4-question checklist for picking Medigap vs. Advantage',
        'Enrollment periods and late-enrollment penalties, explained',
      ],
    },
    {
      id: 'starter-guide',
      lpSlug: 'medicare-starter-guide',
      title: 'Medicare Starter Guide',
      fileName: 'seniorsimple-medicare-starter-guide.pdf',
      downloadPath: '/lead-magnets/medicare-starter-guide.pdf',
      coverImagePath: '/lead-magnets/covers/medicare-starter-guide.svg',
      emailSubject: 'Your Medicare Starter Guide is inside',
      successHeadline: 'Your Starter Guide is on the way.',
      successBody:
        "Check your inbox — we've sent the plain-English Medicare Starter Guide. You can also download it now.",
      ctaLabel: 'Send Me the Starter Guide',
      adHeadline: 'New to Medicare? Start here.',
      adSubhead:
        'A plain-English Medicare Starter Guide from SeniorSimple. No jargon, no sales calls.',
      lpHeadline: 'The plain-English Medicare Starter Guide.',
      lpSubhead:
        'Everything a newly eligible senior needs to know — in one short, plain-English guide. No jargon, no agents.',
      lpBullets: [
        'The four parts of Medicare, in ten minutes',
        'Enrollment windows and how to avoid a lifetime penalty',
        'Medicaid vs. Medicare — who qualifies for what',
        'The 5 questions to ask before picking a plan',
      ],
    },
  ],

  defaultSidebarMagnetId: 'decision-kit',
  defaultSidebarTopicTag: 'open-enrollment',

  educationalContent: {
    headline: 'Important Medicare Facts',
    sections: [
      {
        title: 'Enrollment Periods',
        items: [
          'Initial Enrollment: 3 months before to 3 months after your 65th birthday',
          'General Enrollment: January 1 – March 31 (coverage starts July 1)',
          'Open Enrollment: October 15 – December 7 (coverage starts January 1)',
        ],
      },
      {
        title: 'Late Enrollment Penalties',
        items: [
          'Part B: 10% penalty for each 12-month period you delay enrollment',
          'Part D: 1% penalty for each month you delay enrollment',
          'Lifetime penalties: These penalties continue as long as you have Medicare',
        ],
      },
    ],
  },

  pageConfigs: {
    'medicare-cost-calculator': {
      slug: 'medicare-cost-calculator',
      variants: ['tool-gate', 'inline'],
      magnetId: 'tool-result',
      topicTag: 'cost-tool',
      abTest: { armA: 'tool-result', armB: 'decision-kit' },
    },
    'medicare-comparison-tool': {
      slug: 'medicare-comparison-tool',
      variants: ['tool-gate', 'inline'],
      magnetId: 'tool-result',
      topicTag: 'cost-tool',
      abTest: { armA: 'tool-result', armB: 'decision-kit' },
    },
    'glp1-drugs-covered-by-medicare-2026': {
      slug: 'glp1-drugs-covered-by-medicare-2026',
      variants: ['inline'],
      magnetId: 'decision-kit',
      topicTag: 'glp1',
    },
    'best-medicare-supplement-plans-medigap-2026': {
      slug: 'best-medicare-supplement-plans-medigap-2026',
      variants: ['inline'],
      magnetId: 'decision-kit',
      topicTag: 'medigap',
    },
    'best-medicare-advantage-plans-2026': {
      slug: 'best-medicare-advantage-plans-2026',
      variants: ['inline'],
      magnetId: 'decision-kit',
      topicTag: 'advantage',
    },
    'best-medicare-part-d-drug-plans-2026': {
      slug: 'best-medicare-part-d-drug-plans-2026',
      variants: ['inline'],
      magnetId: 'decision-kit',
      topicTag: 'part-d',
    },
    'medicaid-vs-medicare-differences': {
      slug: 'medicaid-vs-medicare-differences',
      variants: ['inline'],
      magnetId: 'starter-guide',
      topicTag: 'medicaid-vs-medicare',
    },
    'medicare-open-enrollment-2027-seniors-guide': {
      slug: 'medicare-open-enrollment-2027-seniors-guide',
      variants: ['inline'],
      magnetId: 'starter-guide',
      topicTag: 'open-enrollment',
    },
  },
}
