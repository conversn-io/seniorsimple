import type { CaptureKit, QuizAnswers, BucketId } from './types'

// ─── Final Expense kit (stub) ─────────────────────────────────────────
// Ruling 7 acceptance proof: mounts an FE quiz on an FE-tagged page with
// ZERO component edits. Content is placeholder-quality — a real FE launch
// replaces copy + adds a compliance disclaimer + real magnets, but the
// kit shape stays the same.

type FEBucket = 'guaranteed' | 'simplified' | 'traditional'

function resolveFinalExpenseBucket(answers: QuizAnswers): BucketId {
  const health = String(answers.healthStatus ?? '').toLowerCase()
  const age = Number(answers.ageBand ?? 65)
  if (health.includes('serious') || health.includes('condition')) return 'guaranteed'
  if (age >= 75) return 'simplified'
  return 'traditional'
}

export const finalExpenseKit: CaptureKit = {
  vertical: 'final_expense',
  brand: 'seniorsimple',
  monetize: 'lead',
  getHelpRoute: '/get-help/final-expense',

  compliance: {
    disclaimer: null,
    educationalNotice:
      'Educational information only. A licensed insurance agent can walk you through available final-expense options in your state.',
    enabledFlag: 'NEXT_PUBLIC_FE_QUIZ_ENABLED',
  },

  quiz: {
    buckets: [
      { id: 'guaranteed', label: 'Guaranteed Issue' },
      { id: 'simplified', label: 'Simplified Issue' },
      { id: 'traditional', label: 'Traditional Whole Life' },
    ],
    steps: [
      { id: 'zipCode', kind: 'zip', question: "Let's start with your ZIP", helper: 'Coverage and pricing vary by state.', required: true },
      { id: 'ageBand', kind: 'single-choice', question: 'Your age range?', required: true, options: [
        { value: '50-64', label: '50 – 64' },
        { value: '65-74', label: '65 – 74' },
        { value: '75-85', label: '75 – 85' },
      ] },
      { id: 'coverageAmount', kind: 'single-choice', question: 'How much coverage are you looking for?', required: true, options: [
        { value: '5000', label: '$5,000 – $10,000 (basic funeral)' },
        { value: '15000', label: '$10,000 – $20,000 (funeral + expenses)' },
        { value: '25000', label: '$25,000+ (funeral + debts / estate)' },
      ] },
      { id: 'healthStatus', kind: 'single-choice', question: 'How would you describe your health?', required: true, options: [
        { value: 'good', label: 'Good — no major conditions' },
        { value: 'moderate', label: 'Some health concerns' },
        { value: 'serious', label: 'Serious health conditions' },
      ] },
      { id: 'personalInfo', kind: 'email', question: 'Where should we send your coverage match?', required: true },
    ],
    resolver: resolveFinalExpenseBucket,
    cover: {
      headline: 'Which Final Expense Coverage Fits You?',
      subhead:
        'Answer a few questions and get a personalized coverage-type recommendation. No agent, no sales calls.',
      ctaLabel: 'Get My Coverage Match',
    },
    processingMessage: 'Matching you with the right coverage type…',
    resultBadge: 'Your coverage-type match',
    resultCards: [
      {
        bucketId: 'guaranteed',
        headline: 'Guaranteed Issue Whole Life',
        subhead: 'No health questions, no medical exam. Approval is guaranteed if you meet the age requirements.',
        bullets: [
          'No underwriting — everyone who applies is accepted',
          'Coverage typically capped at $25,000',
          '2-year waiting period on natural-cause claims (accidents covered day one)',
          'Fixed premiums that never increase',
        ],
      },
      {
        bucketId: 'simplified',
        headline: 'Simplified Issue Whole Life',
        subhead: 'A short health questionnaire — no medical exam. Faster approval than traditional, cheaper than guaranteed issue.',
        bullets: [
          'A few health questions on the application',
          'Immediate coverage — no waiting period',
          'Coverage up to $50,000 in most cases',
          'Best fit if you have minor / controlled conditions',
        ],
      },
      {
        bucketId: 'traditional',
        headline: 'Traditional Whole Life',
        subhead: 'Full underwriting including a medical exam — the lowest premiums for those who qualify.',
        bullets: [
          'Best rates available if you pass underwriting',
          'Higher coverage amounts ($100,000+)',
          'Builds cash value over time',
          'Longer application process (2–6 weeks)',
        ],
      },
    ],
  },

  // FE MVP does not include a calculator — the kit's `calculator` field is
  // optional. Adding one later means writing a `computeFinalExpenseCosts`
  // function and appending to this kit — no component edits.

  magnets: [
    {
      id: 'fe-decision-kit',
      lpSlug: 'final-expense-planning-guide',
      title: 'Final Expense Planning Guide',
      fileName: 'seniorsimple-final-expense-planning-guide.pdf',
      downloadPath: '/lead-magnets/final-expense-planning-guide.pdf',
      coverImagePath: '/lead-magnets/covers/final-expense-planning-guide.svg',
      emailSubject: 'Your Final Expense Planning Guide is inside',
      successHeadline: 'Your Planning Guide is on the way.',
      successBody:
        "Check your inbox — we've sent the Final Expense Planning Guide. You can also download it now.",
      ctaLabel: 'Send Me the Planning Guide',
      adHeadline: 'Free Final Expense Planning Guide',
      adSubhead:
        'A plain-English guide to burial insurance, funeral costs, and coverage that fits your budget.',
      lpHeadline: 'Everything you need to plan for final expenses.',
      lpSubhead:
        'A step-by-step guide from SeniorSimple. No agent will contact you — just the coverage types, price ranges, and what to look for.',
      lpBullets: [
        'Average funeral costs in your state',
        'Guaranteed Issue vs. Simplified vs. Traditional — a plain-English comparison',
        'The three questions that determine which coverage type fits',
        'How to protect loved ones from unexpected debt',
      ],
    },
  ],

  defaultSidebarMagnetId: 'fe-decision-kit',
  defaultSidebarTopicTag: 'planning',

  pageConfigs: {
    'final-expense-planning-guide': {
      slug: 'final-expense-planning-guide',
      variants: ['inline'],
      magnetId: 'fe-decision-kit',
      topicTag: 'planning',
    },
  },
}
