export type MagnetId =
  | 'decision-kit'
  | 'tool-result'
  | 'starter-guide'
  | 'fe-buyers-guide'
  | 'annuity-dos-donts'
  | 'cost-of-care-guide'
  | 'social-security-guide'

/**
 * Content pillar — determines source_detail prefix, LP category, and where in
 * the site the magnet is offered. `medicare` covers Medicare/Medigap/Advantage/
 * Part D; `final-expense` covers FE/burial/funeral/life-insurance; `annuity`
 * covers the annuity cluster (product explainers, carrier reviews, MYGA/SPIA/
 * QLAC/RILA); `long-term-care` covers the senior-living / care cluster
 * (assisted living, memory care, nursing homes, in-home care, aging in place,
 * LTC insurance); `social-security` covers the claiming cluster (benefit
 * calculation, FRA, 62/67/70 timing, spousal + survivor, the earnings test).
 */
export type Pillar =
  | 'medicare'
  | 'final-expense'
  | 'annuity'
  | 'long-term-care'
  | 'social-security'
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
  | 'annuity'
  | 'long-term-care'
  | 'senior-living'
  | 'social-security'

export interface MagnetSpec {
  id: MagnetId
  /**
   * Content pillar the magnet belongs to. Combined with `assetKey`, used for
   * routing + internal segmentation. NOT emitted in source_detail — the
   * capture contract uses canonical surface labels instead (see
   * `buildSourceDetail`).
   */
  pillar: Pillar
  /**
   * Short asset key. Kept distinct from `id` so we can rename magnets
   * internally without breaking downstream tag-based segmentation.
   */
  assetKey: string
  /** URL slug for the landing page: /resources/[lpSlug] */
  lpSlug: string
  /**
   * Canonical published-article slug used when the LP is direct-navigated
   * (no ?from=<article> query param). Must exist as `articles.slug` with
   * status='published' on site_id='seniorsimple' — otherwise the resulting
   * `source_detail` fails the `v_capture_contract_compliance` view's
   * `slug_not_a_page` check.
   */
  defaultArticleSlug: string
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
// The annuity magnet predates the storage-bucket convention — it ships in the
// repo under /public and is served straight off the site origin.
const ASSETS_ANNUITY = ''
// WO-800 hosted the LTC guide under `/care/`, not the `/ltc/` path its scope
// line predicted. Verified against storage.objects before wiring — don't
// "correct" this to /ltc/ without moving the object first.
const ASSETS_CARE = `${ASSETS_BUCKET}/care`
// WO-667's guide + cover, uploaded 2026-08-17. Paths verified against
// storage.objects and fetched over the public URL before wiring.
const ASSETS_SS = `${ASSETS_BUCKET}/social-security`

export const MAGNETS: Record<MagnetId, MagnetSpec> = {
  'decision-kit': {
    id: 'decision-kit',
    pillar: 'medicare',
    assetKey: 'decision-kit',
    lpSlug: 'medicare-decision-kit-2026',
    defaultArticleSlug: 'medicare-planning-guide',
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
    defaultArticleSlug: 'medicare-cost-calculator',
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
    defaultArticleSlug: 'medicare-planning-guide',
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
    defaultArticleSlug: 'best-final-expense-insurance-companies-2026',
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
  // WO-722 — the annuity pillar's own magnet. Until this existed every annuity
  // page (56 of them after the consolidation) fell through
  // `resolveDefaultForSlug` to `decision-kit` and offered a *Medicare* guide to
  // a reader researching annuities: the wrong-vertical mismatch this file's own
  // CTA doctrine calls a defect. The asset was already written and live at
  // /downloads/ebook/annuity-dos-donts.pdf — it just was never registered.
  'annuity-dos-donts': {
    id: 'annuity-dos-donts',
    pillar: 'annuity',
    assetKey: 'annuity-dos-donts',
    lpSlug: 'annuity-dos-and-donts',
    defaultArticleSlug:
      'what-is-an-annuity-complete-guide-retirement-income-planning-2026',
    title: 'Annuity Do’s & Don’ts',
    fileName: 'seniorsimple-annuity-dos-and-donts.pdf',
    downloadPath: `${ASSETS_ANNUITY}/downloads/ebook/annuity-dos-donts.pdf`,
    coverImagePath: `${ASSETS_ANNUITY}/images/ebook/cover-dosdonts-3d.png`,
    emailSubject: 'Your Annuity Do’s & Don’ts guide is inside',
    successHeadline: 'Your Annuity guide is on the way.',
    successBody:
      "Check your inbox — we've sent the SeniorSimple Annuity Do's & Don'ts guide. You can also download it now.",
    ctaLabel: 'Send Me the Annuity Guide',
    adHeadline: 'Thinking About an Annuity? Read This First.',
    adSubhead:
      'The questions to ask before you sign — surrender charges, income riders, and the fees that rarely come up at the seminar.',
    lpHeadline: 'Annuities, explained before someone tries to sell you one.',
    lpSubhead:
      "A SeniorSimple guide to what annuities actually do. How each type pays, what a rider really costs, and the terms worth pushing back on — written for the reader getting a second opinion.",
    lpBullets: [
      "Fixed, indexed, variable, and immediate — what each one is actually for",
      "Surrender charges: how long your money is locked and what it costs to leave",
      "Income riders — the fee, the roll-up rate, and when they earn their keep",
      "15 questions to ask before signing anything",
    ],
  },
  // WO-800 / WO-801 — the care cluster's first magnet. Before this the cluster
  // had no registered magnet at all, so every care page fell through
  // `resolveDefaultForSlug` to the Medicare Decision Kit — the same
  // live-but-unregistered defect that hit the annuity guide.
  // Figures below are CareScout's 2025 Cost of Care survey (the current
  // release), verified in WO-800. Update them here and in the PDF together.
  'cost-of-care-guide': {
    id: 'cost-of-care-guide',
    pillar: 'long-term-care',
    assetKey: 'cost-of-care-guide',
    lpSlug: 'cost-of-care-guide',
    defaultArticleSlug: 'long-term-care-planning-guide',
    title: 'Cost of Long-Term Care by State (2026)',
    fileName: 'seniorsimple-cost-of-care-guide.pdf',
    downloadPath: `${ASSETS_CARE}/cost-of-care-guide.pdf`,
    coverImagePath: `${ASSETS_CARE}/covers/cost-of-care-guide-cover.png`,
    emailSubject: 'Your Cost of Long-Term Care guide is inside',
    successHeadline: 'Your Cost of Care guide is on the way.',
    successBody:
      "Check your inbox — we've sent the Cost of Long-Term Care guide. You can also download it now.",
    ctaLabel: 'Send Me the Cost of Care Guide',
    adHeadline: 'What Does Care Actually Cost Where You Live?',
    adSubhead:
      'Assisted living, in-home care, memory care and nursing homes — current costs by state, plus the four ways families pay for it.',
    lpHeadline: 'The real cost of long-term care — by state, in plain numbers.',
    lpSubhead:
      "A SeniorSimple guide to what care costs today and how families actually pay for it. Educational only — no agent will contact you.",
    lpBullets: [
      "National medians: $6,200/mo assisted living, $9,581/mo nursing home (semi-private), $10,798/mo private room",
      "In-home care at $35/hour — what 20, 40, and 44 hours a week really costs",
      "The four ways families pay: savings, Medicaid, VA benefits, and LTC insurance",
      "When long-term care insurance is worth buying — and the age where it stops being",
    ],
  },
  // WO-667 built this guide and shipped it to storage on 2026-08-17, but
  // nothing ever referenced it — the third instance of the live-but-unregistered
  // defect after the annuity guide (WO-722) and the LTC guide (WO-801). Until
  // now every Social Security page fell through `resolveDefaultForSlug` to the
  // Medicare Decision Kit, and the calculation guide carried an explicit
  // interim pointer at the Medicare Starter Guide.
  // Figures below are the official 2026 SSA amounts as printed in the PDF —
  // update them here and in the guide together.
  'social-security-guide': {
    id: 'social-security-guide',
    pillar: 'social-security',
    assetKey: 'social-security-guide',
    lpSlug: 'social-security-guide',
    defaultArticleSlug: 'how-are-social-security-benefits-calculated-guide',
    title: 'The Social Security Guide',
    fileName: 'seniorsimple-social-security-guide.pdf',
    downloadPath: `${ASSETS_SS}/social-security-guide.pdf`,
    coverImagePath: `${ASSETS_SS}/covers/social-security-guide-cover.png`,
    emailSubject: 'Your Social Security Guide is inside',
    successHeadline: 'Your Social Security Guide is on the way.',
    successBody:
      "Check your inbox — we've sent The Social Security Guide. You can also download it now.",
    ctaLabel: 'Send Me the Social Security Guide',
    adHeadline: 'Claim at 62, 67, or 70? See What Each One Pays.',
    adSubhead:
      'How your benefit is actually calculated, what waiting adds, and the 2026 numbers — in plain English.',
    lpHeadline:
      'The most permanent decision in your retirement, explained in plain English.',
    lpSubhead:
      "A SeniorSimple guide to how your Social Security benefit is calculated and what your claiming age does to it for the rest of your life. Educational — nobody will call you.",
    lpBullets: [
      "The 3-step formula behind your check — your 35 highest years, the 2026 bend points, and your PIA",
      "Your Full Retirement Age by birth year, and what 62 vs. 67 vs. 70 pays on the same benefit",
      "The 2026 numbers: a 2.8% COLA, $4,152 max at FRA, $5,181 at 70, and the $24,480 earnings test",
      "Spousal and survivor benefits — and why the higher earner delaying protects the survivor for life",
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

  // --- WO-666: top-5 high-engagement / 0-capture pages -------------------
  // These carried only click-through ad surfaces (`sidebar-ad` / `inline-ad`),
  // which hand off to the LP and credit `resource:<slug>`. They now also get
  // an in-body magnet form (see MID_ARTICLE_MAGNET_SLUGS) crediting
  // `magnet:<slug>`. Explicit entries so the magnet is intentional per page
  // rather than falling through to the site-wide default.
  'medicare-part-d-changes-2027-what-seniors-should-know': {
    slug: 'medicare-part-d-changes-2027-what-seniors-should-know',
    variants: ['inline'],
    magnetId: 'decision-kit',
    topicTag: 'part-d',
  },
  'medicare-part-d-drug-plans-ranked-2026': {
    slug: 'medicare-part-d-drug-plans-ranked-2026',
    variants: ['inline'],
    magnetId: 'decision-kit',
    topicTag: 'part-d',
  },
  'best-final-expense-insurance-companies-2026': {
    slug: 'best-final-expense-insurance-companies-2026',
    variants: ['inline'],
    magnetId: 'fe-buyers-guide',
    topicTag: 'final-expense',
  },
  // The pillar page of the Social Security cluster, and the magnet's own
  // `defaultArticleSlug`. Explicit rather than left to the cluster default so
  // the flagship page's routing is visible in this file.
  'how-are-social-security-benefits-calculated-guide': {
    slug: 'how-are-social-security-benefits-calculated-guide',
    variants: ['inline'],
    magnetId: 'social-security-guide',
    topicTag: 'social-security',
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
 *  - `quote`       → MedicareLeadForm in the mid-scroll article quote card
 *                    (phone-bearing quote request, not an email magnet)
 */
export type CaptureSurface =
  | 'resource'
  | 'magnet'
  | 'simple-life'
  | 'sidebar-ad'
  | 'inline-ad'
  | 'quote'

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
  // `long-term-care` / `senior-living` are deliberately absent. WO-800's
  // handoff asked for quiz_bucket='care', but the
  // `newsletter_subscribers_quiz_bucket_check` constraint only accepts
  // advantage / medigap / dual / working / college / life-insurance — sending
  // 'care' would reject the INSERT and lose the capture. Care leads carry
  // their segmentation in tags + quiz_context.pillar instead until the
  // constraint gains a care bucket (see WO-791 LTC offer routing).
  //
  // `social-security` is absent for the same reason — the constraint has no
  // Social Security bucket, and 'working' describes a Medicare persona
  // (still-employed at 65), not a claiming-age reader.
}

export function resolveBucketForTopic(topicTag: TopicTag): QuizBucket | null {
  return TOPIC_TO_BUCKET[topicTag] ?? null
}

/**
 * Slug patterns that route to the Final Expense pillar's default magnet in the
 * sidebar / mobile-inline ad. Checked after ANNUITY_SLUG_PATTERNS; anything
 * matching neither falls back to the site-wide Medicare default
 * (decision-kit). Extend when new pillars come online.
 */
const FE_SLUG_PATTERNS: RegExp[] = [
  /final-expense/i,
  /burial/i,
  /funeral/i,
  /life-insurance/i,
]

/**
 * WO-722 — annuity pillar slugs. Covers the product-type explainers, the
 * "best X" comparison listicles, and the carrier/product reviews (which often
 * name only the carrier and product, e.g. `athene-agility-10-annuity-review`
 * or `best-qlac-providers-2026`).
 *
 * Checked BEFORE the FE patterns: `fixed-index-annuity-vs-variable-annuity`
 * must not be captured by /life-insurance/ style overlap, and annuity reviews
 * are the more specific match wherever both could apply.
 */
const ANNUITY_SLUG_PATTERNS: RegExp[] = [
  /annuit/i,
  /\bmyga\b/i,
  /-myga-/i,
  /\bspia\b/i,
  /\bqlac\b/i,
  /\brila\b/i,
  /income-rider/i,
]

/**
 * WO-801 — the SeniorSimple care cluster, as published in the CMS
 * (`articles.cluster_id IN ('ss-senior-living-care','ss-long-term-care')`,
 * site_id='seniorsimple', status='published', 34 pages as of 2026-08-23).
 *
 * Held as an explicit list rather than inferred at request time: the config is
 * a static module with no DB access, and an exact set is what makes the routing
 * auditable against the cluster. Refresh it with:
 *
 *   select slug from articles
 *   where site_id='seniorsimple' and status='published'
 *     and cluster_id in ('ss-senior-living-care','ss-long-term-care')
 *   order by slug;
 *
 * `CARE_SLUG_PATTERNS` below covers care pages published after this snapshot,
 * so a new care article still routes correctly before anyone edits this file.
 */
export const CARE_CLUSTER_SLUGS: readonly string[] = [
  'aging-in-place-guide',
  'aging-in-place-home-modification-checklist',
  'assisted-living-vs-independent-living-key-differences-explained',
  'assisted-living-vs-memory-care-which-is-right-for-your-loved-one',
  'best-aging-in-place-technology-2026',
  'best-assisted-living-options-by-state-2026',
  'best-caregiver-support-resources-2026',
  'best-home-care-agencies-for-seniors-2026',
  'best-medical-alert-systems-2026',
  'best-medical-alert-systems-seniors-2026',
  'best-short-term-care-insurance-2026',
  'complete-guide-to-assisted-living-everything-you-need-to-know',
  'complete-guide-to-hospice-care-end-of-life-support-and-comfort',
  'complete-guide-to-in-home-care-aging-in-place-with-support',
  'complete-guide-to-independent-living-for-seniors',
  'complete-guide-to-memory-care-understanding-alzheimer-s-and-dementia-care',
  'complete-guide-to-nursing-homes-when-skilled-nursing-is-needed',
  'home-modification-planner-strategy-guide',
  'how-much-does-in-home-care-cost-hourly-and-monthly-rates',
  'how-much-does-memory-care-cost-pricing-guide-for-2025',
  'in-home-care-vs-assisted-living-cost-and-care-comparison',
  'long-term-care-insurance-best-policies-2026',
  'long-term-care-insurance-explained-2026',
  'long-term-care-insurance-worth-it-checklist',
  'long-term-care-planning-guide',
  'long-term-care-planning-strategy-guide',
  'memory-care-vs-nursing-home-understanding-the-differences',
  'nursing-home-vs-assisted-living-when-to-choose-each',
  'questions-to-ask-when-touring-memory-care-facilities',
  'senior-living-costs-2026',
  'senior-living-costs-by-state-2026',
  'veterans-benefits-seniors-never-claim',
  'veterans-long-term-care-benefits-2026',
  'when-to-move-from-independent-to-assisted-living',
]

const CARE_CLUSTER_SLUG_SET = new Set(CARE_CLUSTER_SLUGS)

/** Forward-compat routing for care pages published after the snapshot above. */
const CARE_SLUG_PATTERNS: RegExp[] = [
  /long-term-care/i,
  /short-term-care/i,
  /assisted-living/i,
  /independent-living/i,
  /senior-living/i,
  /memory-care/i,
  /nursing-home/i,
  /home-care/i,
  /hospice/i,
  /aging-in-place/i,
  /caregiver/i,
  /medical-alert/i,
  /home-modification/i,
]

/**
 * Medicare/Medicaid pages that happen to mention a care setting stay on the
 * Medicare pillar — `medicare-and-assisted-living-what-s-covered-and-what-s-not`
 * and `medicaid-and-assisted-living-eligibility-and-coverage-by-state` are
 * coverage questions, not LTC-insurance shopping. Only applies to the pattern
 * fallback; an explicit CARE_CLUSTER_SLUGS membership or a
 * MEDICARE_CAPTURE_CONFIG entry still wins.
 */
const MEDICARE_GUARD = /medicare|medicaid/i

function isCareSlug(slug: string): boolean {
  if (CARE_CLUSTER_SLUG_SET.has(slug)) return true
  if (MEDICARE_GUARD.test(slug)) return false
  return CARE_SLUG_PATTERNS.some((rx) => rx.test(slug))
}

/**
 * Topic tag for a care page. LTC-insurance pages get `long-term-care`; the
 * rest of the cluster (settings, costs, caregiving, aging in place) gets
 * `senior-living`, so downstream tag segmentation can tell shopping intent
 * from research intent.
 */
function careTopicTag(slug: string): TopicTag {
  return /(long|short)-term-care-insurance/i.test(slug)
    ? 'long-term-care'
    : 'senior-living'
}

/**
 * WO-802 — the SeniorSimple Social Security cluster, as published in the CMS
 * (`articles.cluster_id = 'social-security'`, site_id='seniorsimple',
 * status='published', 12 pages as of 2026-08-23). Same explicit-set approach as
 * CARE_CLUSTER_SLUGS: the config is a static module with no DB access, and an
 * exact set is what makes the routing auditable against the cluster. Refresh
 * it with:
 *
 *   select slug from articles
 *   where site_id='seniorsimple' and status='published'
 *     and cluster_id = 'social-security'
 *   order by slug;
 */
export const SOCIAL_SECURITY_CLUSTER_SLUGS: readonly string[] = [
  'early-vs-full-retirement-benefits',
  'how-are-social-security-benefits-calculated-guide',
  'social-security-benefits-calculator',
  'social-security-benefits-maximize-2026',
  'social-security-changes-2026',
  'social-security-claiming-age-timing-strategy',
  'social-security-claiming-strategies-for-couples-2026',
  'social-security-cola-2027',
  'social-security-optimization-calculator',
  'social-security-spousal-benefits',
  'social-security-spousal-benefits-guide',
  'when-to-claim-social-security-62-vs-67-vs-70',
]

const SOCIAL_SECURITY_CLUSTER_SLUG_SET = new Set(SOCIAL_SECURITY_CLUSTER_SLUGS)

/**
 * Forward-compat routing for claiming-intent pages published after the
 * snapshot above, and for the Social Security pages that live outside the
 * cluster — `social-security-optimization-strategy-guide` sits in
 * `retirement-income` and is squarely this guide's subject.
 *
 * Deliberately NOT extended to the rest of the 35-page `retirement-income`
 * cluster. That cluster is RMDs, Roth conversions, withdrawal sequencing and
 * HSA/tax planning; this guide is 11 pages of Social Security only (benefit
 * formula, FRA, 62/67/70, earnings test, spousal/survivor, taxation of
 * benefits). Routing all of retirement-income here would trade one
 * wrong-offer mismatch for another — those pages need their own
 * retirement-income magnet, tracked separately.
 */
const SOCIAL_SECURITY_SLUG_PATTERNS: RegExp[] = [
  /social-security/i,
  /full-retirement-age/i,
  /early-vs-full-retirement/i,
  /when-to-claim/i,
  /claiming-age/i,
  /claiming-strateg/i,
  /spousal-benefit/i,
  /survivor-benefit/i,
]

/**
 * Pattern fallback only — an explicit SOCIAL_SECURITY_CLUSTER_SLUGS membership
 * still wins (checked first in `resolveDefaultForSlug`). MEDICARE_GUARD keeps a
 * Medicare-cluster page that merely coordinates with Social Security — e.g. a
 * "when to start Medicare vs. when to claim" explainer — on the Decision Kit.
 */
function matchesSocialSecurityPattern(slug: string): boolean {
  if (MEDICARE_GUARD.test(slug)) return false
  return SOCIAL_SECURITY_SLUG_PATTERNS.some((rx) => rx.test(slug))
}

/**
 * Pillar routing for slugs without an explicit MEDICARE_CAPTURE_CONFIG entry.
 * Returns the default magnet + topicTag to show in the sidebar/inline ad slot.
 */
export function resolveDefaultForSlug(slug: string): {
  magnetId: MagnetId
  topicTag: TopicTag
} {
  // The published Social Security cluster is an exact set, so it resolves
  // ahead of the pattern chain — no cluster page depends on pattern
  // precedence. The SS *pattern* fallback runs after annuity/FE below, where a
  // product-shopping slug should still win over a claiming-research match.
  if (SOCIAL_SECURITY_CLUSTER_SLUG_SET.has(slug)) {
    return { magnetId: 'social-security-guide', topicTag: 'social-security' }
  }
  if (ANNUITY_SLUG_PATTERNS.some((rx) => rx.test(slug))) {
    return { magnetId: 'annuity-dos-donts', topicTag: 'annuity' }
  }
  if (FE_SLUG_PATTERNS.some((rx) => rx.test(slug))) {
    return { magnetId: 'fe-buyers-guide', topicTag: 'final-expense' }
  }
  if (matchesSocialSecurityPattern(slug)) {
    return { magnetId: 'social-security-guide', topicTag: 'social-security' }
  }
  if (isCareSlug(slug)) {
    return {
      magnetId: 'cost-of-care-guide',
      topicTag: careTopicTag(slug),
    }
  }
  return {
    magnetId: DEFAULT_SIDEBAR_MAGNET_ID,
    topicTag: DEFAULT_SIDEBAR_TOPIC_TAG,
  }
}

/**
 * Pure, synchronous magnet resolution for a page slug — the server-safe core
 * shared by `useResolvedMagnet` (client) and the SSR-rendered in-body magnet
 * CTA. No hooks, no browser APIs, so a server component can call it directly
 * and emit complete markup in the initial HTML.
 *
 * Order: explicit MEDICARE_CAPTURE_CONFIG entry → pillar default for the slug.
 * A/B arms are deliberately NOT resolved here (they need sessionStorage); the
 * article pages that use this have no A/B configured.
 */
export function resolveMagnetForSlug(slug: string): {
  magnetId: MagnetId
  topicTag: TopicTag
} {
  const config = getCaptureConfig(slug)
  if (config) return { magnetId: config.magnetId, topicTag: config.topicTag }
  return resolveDefaultForSlug(slug)
}

/**
 * WO-666 — pages that mount the in-body (mid-article) magnet capture form.
 *
 * These five are the network's highest-dwell owned articles and were capturing
 * nothing: their only in-body surfaces were click-through ad cards, which
 * credit `resource:<slug>` only if the reader follows through to the LP. The
 * in-body form captures on the page itself and credits `magnet:<slug>`.
 *
 * Deliberately an allowlist rather than a site-wide default — this is a
 * measured rollout; widen it once the 7-day capture read is in.
 */
export const MID_ARTICLE_MAGNET_SLUGS: readonly string[] = [
  'glp1-drugs-covered-by-medicare-2026',
  'how-are-social-security-benefits-calculated-guide',
  'medicare-part-d-changes-2027-what-seniors-should-know',
  'best-final-expense-insurance-companies-2026',
  'medicare-part-d-drug-plans-ranked-2026',
  // WO-801 — the whole care cluster. Unlike WO-666's measured five, this is a
  // full-cluster mount: the cluster was capturing at 1.2% with no magnet
  // registered at all, so there is no in-body surface here to regress.
  ...CARE_CLUSTER_SLUGS,
  // WO-802 — the whole Social Security cluster, on the same reasoning: no
  // magnet was registered for it, so there is no in-body surface to regress.
  // (`how-are-social-security-benefits-calculated-guide` is already listed
  // above from WO-666; the dedupe below keeps the mount idempotent.)
  ...SOCIAL_SECURITY_CLUSTER_SLUGS,
]

/** Deduped — `how-are-social-security-benefits-calculated-guide` appears both
 * in WO-666's five and in the Social Security cluster spread. */
const MID_ARTICLE_MAGNET_SLUG_SET = new Set(MID_ARTICLE_MAGNET_SLUGS)

export function hasMidArticleMagnet(slug: string): boolean {
  return MID_ARTICLE_MAGNET_SLUG_SET.has(slug)
}
