export type MagnetId =
  | 'decision-kit'
  | 'tool-result'
  | 'starter-guide'
  | 'fe-buyers-guide'

/**
 * Content pillar — determines source_detail prefix, LP category, and where in
 * the site the magnet is offered. `medicare` covers Medicare/Medigap/Advantage/
 * Part D; `final-expense` covers FE/burial/funeral/life-insurance.
 */
export type Pillar = 'medicare' | 'final-expense'
export type CaptureVariant =
  | 'inline'
  | 'tool-gate'
  | 'sidebar-ad'
  | 'inline-ad'

/** Fallback magnet shown in the sidebar for non-Medicare articles. */
export const DEFAULT_SIDEBAR_MAGNET_ID: MagnetId = 'decision-kit'
export const DEFAULT_SIDEBAR_TOPIC_TAG: TopicTag = 'open-enrollment'

export type TopicTag =
  | 'glp1'
  | 'medigap'
  | 'part-d'
  | 'advantage'
  | 'medicaid-vs-medicare'
  | 'open-enrollment'
  | 'cost-tool'
  | 'final-expense'
  | 'burial'
  | 'life-insurance'

export interface MagnetSpec {
  id: MagnetId
  /**
   * Content pillar the magnet belongs to. Combined with `assetKey` to form the
   * `source_detail` prefix per the CallReady capture contract:
   *   source_detail = `<pillar>-<assetKey>:<slug>`
   */
  pillar: Pillar
  /**
   * Short asset key — the second segment of the source_detail prefix. Kept
   * distinct from `id` so we can rename magnets internally without breaking
   * downstream newsletter routing / attribution.
   */
  assetKey: string
  /** URL slug for the landing page: /resources/[lpSlug] */
  lpSlug: string
  title: string
  fileName: string
  downloadPath: string
  coverImagePath: string
  emailSubject: string
  successHeadline: string
  successBody: string
  ctaLabel: string
  /** Ad-card copy shown inline in article body / sidebar */
  adHeadline: string
  adSubhead: string
  /** LP hero copy */
  lpHeadline: string
  lpSubhead: string
  lpBullets: string[]
}

// Hosted magnets + covers live in Supabase Storage (public bucket).
// downloadPath / coverImagePath below are ABSOLUTE URLs — the deliver-magnet
// route + the ad-card / LP <img> tags all accept absolute URLs unchanged.
const ASSETS_BUCKET =
  'https://vpysqshhafthuxvokwqj.supabase.co/storage/v1/object/public/lead-magnets/seniorsimple'
const ASSETS_MEDICARE = `${ASSETS_BUCKET}/medicare`
const ASSETS_FE = `${ASSETS_BUCKET}/final-expense`

export const MAGNETS: Record<MagnetId, MagnetSpec> = {
  'decision-kit': {
    id: 'decision-kit',
    pillar: 'medicare',
    assetKey: 'decision-kit',
    lpSlug: 'medicare-decision-kit-2026',
    title: '2026 Medicare Decision Kit',
    fileName: 'seniorsimple-medicare-decision-kit-2026.pdf',
    downloadPath: `${ASSETS_MEDICARE}/medicare-decision-kit-2026.pdf`,
    coverImagePath: `${ASSETS_MEDICARE}/covers/medicare-decision-kit-2026-cover.png`,
    emailSubject: 'Your 2026 Medicare Decision Kit is inside',
    successHeadline: 'Your Decision Kit is on the way.',
    successBody:
      "Check your inbox — we've sent the 2026 Medicare Decision Kit. You can also download it now.",
    ctaLabel: 'Send Me the Decision Kit',
    adHeadline: 'Original Medicare or Advantage? Decide With Confidence.',
    adSubhead:
      'Plain-English guide to Medicare, Medigap, Advantage, and Part D — 2026 rates included.',
    lpHeadline: 'Everything you need to pick a Medicare plan this year.',
    lpSubhead:
      "A step-by-step guide from SeniorSimple. No agent will contact you — just the numbers, the trade-offs, and a decision framework you can act on.",
    lpBullets: [
      "2026 premiums, deductibles, and out-of-pocket caps for every plan type",
      "Medigap vs. Medicare Advantage — a plain-English side-by-side",
      "The one Part D question that saves seniors ~$700/year",
      "A 3-step enrollment checklist so you don't miss a deadline",
    ],
  },
  'tool-result': {
    id: 'tool-result',
    pillar: 'medicare',
    assetKey: 'estimate-template',
    lpSlug: 'medicare-estimate',
    title: 'Your Medicare Estimate',
    fileName: 'seniorsimple-medicare-estimate.pdf',
    downloadPath: `${ASSETS_MEDICARE}/medicare-estimate-template.pdf`,
    coverImagePath: `${ASSETS_MEDICARE}/covers/medicare-estimate-template-cover.png`,
    emailSubject: 'Your Medicare estimate is inside',
    successHeadline: "Your estimate is on the way.",
    successBody:
      "We've emailed your Medicare estimate. You can also download a copy now.",
    ctaLabel: 'Email Me My Estimate',
    adHeadline: 'See Your 2026 Medicare Costs — Free Worksheet',
    adSubhead:
      'A saved copy of your Medicare cost estimate, plus the SeniorSimple planning guide.',
    lpHeadline: 'Your Medicare estimate, on paper.',
    lpSubhead:
      "Save your Medicare cost estimate as a PDF and get the SeniorSimple planning guide alongside it. No agent, no sales call.",
    lpBullets: [
      "Your monthly premium estimate broken down by Medicare part",
      "How your income triggers IRMAA — and what to do about it",
      "The 4-question checklist for picking Medigap vs. Advantage",
      "Enrollment periods and late-enrollment penalties, explained",
    ],
  },
  'starter-guide': {
    id: 'starter-guide',
    pillar: 'medicare',
    assetKey: 'starter-guide',
    lpSlug: 'medicare-starter-guide',
    title: 'Medicare Starter Guide',
    fileName: 'seniorsimple-medicare-starter-guide.pdf',
    downloadPath: `${ASSETS_MEDICARE}/medicare-starter-guide.pdf`,
    coverImagePath: `${ASSETS_MEDICARE}/covers/medicare-starter-guide-cover.png`,
    emailSubject: 'Your Medicare Starter Guide is inside',
    successHeadline: 'Your Starter Guide is on the way.',
    successBody:
      "Check your inbox — we've sent the plain-English Medicare Starter Guide. You can also download it now.",
    ctaLabel: 'Send Me the Starter Guide',
    adHeadline: 'New to Medicare? Start Here.',
    adSubhead:
      'A plain-English Medicare Starter Guide from SeniorSimple. No jargon, no sales calls.',
    lpHeadline: 'The plain-English Medicare Starter Guide.',
    lpSubhead:
      "Everything a newly eligible senior needs to know — in one short, plain-English guide. No jargon, no agents.",
    lpBullets: [
      "The four parts of Medicare, in ten minutes",
      "Enrollment windows and how to avoid a lifetime penalty",
      "Medicaid vs. Medicare — who qualifies for what",
      "The 5 questions to ask before picking a plan",
    ],
  },
  'fe-buyers-guide': {
    id: 'fe-buyers-guide',
    pillar: 'final-expense',
    assetKey: 'fe-buyers-guide',
    lpSlug: 'final-expense-buyers-guide',
    title: 'Final Expense Buyer’s Guide',
    fileName: 'seniorsimple-final-expense-buyers-guide.pdf',
    downloadPath: `${ASSETS_FE}/final-expense-buyers-guide.pdf`,
    coverImagePath: `${ASSETS_FE}/final-expense-buyers-guide-cover.png`,
    emailSubject: 'Your Final Expense Buyer’s Guide is inside',
    successHeadline: 'Your Buyer’s Guide is on the way.',
    successBody:
      "Check your inbox — we've sent the SeniorSimple Final Expense Buyer's Guide. You can also download it now.",
    ctaLabel: 'Send Me the Buyer’s Guide',
    adHeadline: 'Final Expense, Made Simple — Free Guide',
    adSubhead:
      'A plain-English guide to burial + final expense coverage. Educational, no agent CTA.',
    lpHeadline: 'Final expense coverage, without the sales pitch.',
    lpSubhead:
      "A SeniorSimple guide to burial + final expense insurance. What each policy actually pays, how simplified issue differs from guaranteed issue, and how to avoid the graded-benefit trap.",
    lpBullets: [
      "5 top carriers compared — monthly premiums by age",
      "Simplified issue vs. guaranteed issue — who each is right for",
      "The graded-benefit period explained (and when it matters)",
      "Current average U.S. funeral cost + what a $10K/$15K/$25K policy covers",
    ],
  },
}

export function getMagnetByLpSlug(lpSlug: string): MagnetSpec | null {
  return (
    Object.values(MAGNETS).find((m) => m.lpSlug === lpSlug) ?? null
  )
}

export function getAllMagnets(): MagnetSpec[] {
  return Object.values(MAGNETS)
}

export interface PageCaptureConfig {
  slug: string
  variants: CaptureVariant[]
  magnetId: MagnetId
  topicTag: TopicTag
  abTest?: {
    armA: MagnetId
    armB: MagnetId
  }
}

const AB_TEST_TOOL: PageCaptureConfig['abTest'] = {
  armA: 'tool-result',
  armB: 'decision-kit',
}

export const MEDICARE_CAPTURE_CONFIG: Record<string, PageCaptureConfig> = {
  'medicare-cost-calculator': {
    slug: 'medicare-cost-calculator',
    variants: ['tool-gate', 'inline'],
    magnetId: 'tool-result',
    topicTag: 'cost-tool',
    abTest: AB_TEST_TOOL,
  },
  'medicare-comparison-tool': {
    slug: 'medicare-comparison-tool',
    variants: ['tool-gate', 'inline'],
    magnetId: 'tool-result',
    topicTag: 'cost-tool',
    abTest: AB_TEST_TOOL,
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
}

export function getCaptureConfig(slug: string): PageCaptureConfig | null {
  return MEDICARE_CAPTURE_CONFIG[slug] ?? null
}

/**
 * Resolve the magnet + A/B arm for a given page config. If the config has no
 * abTest, returns the default magnetId. If it does, flips a coin the first time
 * per session and persists the arm in sessionStorage so the same visitor sees a
 * consistent variant across every capture unit on the page.
 *
 * Client-only — safe to call from SSR (returns default), but the arm is only
 * assigned in the browser.
 */
export function resolveCaptureMagnet(config: PageCaptureConfig): {
  magnetId: MagnetId
  abArm?: string
} {
  if (!config.abTest) return { magnetId: config.magnetId }
  if (typeof window === 'undefined') return { magnetId: config.magnetId }
  try {
    const key = `ss_capture_ab_arm:${config.slug}`
    let arm = window.sessionStorage.getItem(key)
    if (arm !== 'A' && arm !== 'B') {
      arm = Math.random() < 0.5 ? 'A' : 'B'
      window.sessionStorage.setItem(key, arm)
    }
    const magnetId = arm === 'A' ? config.abTest.armA : config.abTest.armB
    return { magnetId, abArm: arm }
  } catch {
    return { magnetId: config.magnetId }
  }
}

/**
 * Canonical capture surface — first segment of source_detail per the audit
 * contract (Ruling 4 of the 2026-07-28 branch-reconciliation brief).
 *
 * `v_capture_contract_compliance` classifies by `split_part(source_detail, ':', 1)`
 * so the surface taxonomy needs to be small + stable — dashboards + weekly
 * audit snapshots group on this exact set. Extend deliberately.
 *
 *  - `resource`    → magnet form on an LP under /resources/*
 *  - `magnet`      → inline / tool-gate capture panel embedded in article body
 *  - `simple-life` → SeniorSimple newsletter sticky bar
 *  - `sidebar-ad`  → ResourceAdCard rendered in the article right rail
 *  - `inline-ad`   → ResourceAdCard rendered inline on mobile
 */
export type CaptureSurface =
  | 'resource'
  | 'magnet'
  | 'simple-life'
  | 'sidebar-ad'
  | 'inline-ad'

/**
 * Build the source_detail string per the CallReady capture contract:
 *   `<surface>:<slug>`
 * Where slug is the raw page slug (article slug, LP slug, or tool slug — the
 * semantic origin of the lead). Never re-prefix a slug that already contains
 * the surface; callers pass raw slugs, this helper adds the prefix.
 */
export function buildSourceDetail(
  surface: CaptureSurface,
  slug: string,
): string {
  return `${surface}:${slug}`
}

/**
 * Persona bucket accepted by `newsletter_subscribers.quiz_bucket` — enforced
 * by a CHECK constraint. Any value outside this set gets rejected at INSERT.
 * Keep in sync with the constraint definition.
 */
export type QuizBucket =
  | 'advantage'
  | 'medigap'
  | 'dual'
  | 'working'
  | 'college'
  | 'life-insurance'

/**
 * Map article topic → persona bucket for direct captures (LP / sidebar / inline
 * ad) that don't come from a quiz. Populates `quiz_bucket` on the subscribe
 * payload when the topic aligns with an allowed persona; returns null otherwise
 * so the field is omitted (NULL is allowed by the CHECK constraint).
 *
 * Only send quiz_bucket for quiz-funnel captures OR direct captures whose topic
 * clearly maps to a persona. Don't invent buckets — the constraint will reject
 * anything else.
 */
const TOPIC_TO_BUCKET: Partial<Record<TopicTag, QuizBucket>> = {
  medigap: 'medigap',
  advantage: 'advantage',
  'medicaid-vs-medicare': 'dual',
  'final-expense': 'life-insurance',
  burial: 'life-insurance',
  'life-insurance': 'life-insurance',
}

export function resolveBucketForTopic(topicTag: TopicTag): QuizBucket | null {
  return TOPIC_TO_BUCKET[topicTag] ?? null
}

/**
 * Slug patterns that route to the Final Expense pillar's default magnet in the
 * sidebar / mobile-inline ad. Anything else falls back to the site-wide
 * Medicare default (decision-kit). Extend when new pillars come online.
 */
const FE_SLUG_PATTERNS: RegExp[] = [
  /final-expense/i,
  /burial/i,
  /funeral/i,
  /life-insurance/i,
]

/**
 * Pillar routing for slugs without an explicit MEDICARE_CAPTURE_CONFIG entry.
 * Returns the default magnet + topicTag to show in the sidebar/inline ad slot.
 */
export function resolveDefaultForSlug(slug: string): {
  magnetId: MagnetId
  topicTag: TopicTag
} {
  if (FE_SLUG_PATTERNS.some((rx) => rx.test(slug))) {
    return { magnetId: 'fe-buyers-guide', topicTag: 'final-expense' }
  }
  return {
    magnetId: DEFAULT_SIDEBAR_MAGNET_ID,
    topicTag: DEFAULT_SIDEBAR_TOPIC_TAG,
  }
}
