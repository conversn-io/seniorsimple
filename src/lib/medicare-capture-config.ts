export type MagnetId = 'decision-kit' | 'tool-result' | 'starter-guide'
export type CaptureVariant =
  | 'inline'
  | 'exit'
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

export interface MagnetSpec {
  id: MagnetId
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

export const MAGNETS: Record<MagnetId, MagnetSpec> = {
  'decision-kit': {
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
    lpSlug: 'medicare-estimate',
    title: 'Your Medicare Estimate',
    fileName: 'seniorsimple-medicare-estimate.pdf',
    downloadPath: '/lead-magnets/medicare-estimate-template.pdf',
    coverImagePath: '/lead-magnets/covers/medicare-estimate.svg',
    emailSubject: 'Your Medicare estimate is inside',
    successHeadline: "Your estimate is on the way.",
    successBody:
      "We've emailed your Medicare estimate. You can also download a copy now.",
    ctaLabel: 'Email Me My Estimate',
    adHeadline: 'Get your Medicare estimate — by email',
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
      "Everything a newly eligible senior needs to know — in one short, plain-English guide. No jargon, no agents.",
    lpBullets: [
      "The four parts of Medicare, in ten minutes",
      "Enrollment windows and how to avoid a lifetime penalty",
      "Medicaid vs. Medicare — who qualifies for what",
      "The 5 questions to ask before picking a plan",
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
    variants: ['inline', 'exit'],
    magnetId: 'decision-kit',
    topicTag: 'glp1',
  },
  'best-medicare-supplement-plans-medigap-2026': {
    slug: 'best-medicare-supplement-plans-medigap-2026',
    variants: ['inline', 'exit'],
    magnetId: 'decision-kit',
    topicTag: 'medigap',
  },
  'best-medicare-advantage-plans-2026': {
    slug: 'best-medicare-advantage-plans-2026',
    variants: ['inline', 'exit'],
    magnetId: 'decision-kit',
    topicTag: 'advantage',
  },
  'best-medicare-part-d-drug-plans-2026': {
    slug: 'best-medicare-part-d-drug-plans-2026',
    variants: ['inline', 'exit'],
    magnetId: 'decision-kit',
    topicTag: 'part-d',
  },
  'medicaid-vs-medicare-differences': {
    slug: 'medicaid-vs-medicare-differences',
    variants: ['inline', 'exit'],
    magnetId: 'starter-guide',
    topicTag: 'medicaid-vs-medicare',
  },
  'medicare-open-enrollment-2027-seniors-guide': {
    slug: 'medicare-open-enrollment-2027-seniors-guide',
    variants: ['inline', 'exit'],
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
