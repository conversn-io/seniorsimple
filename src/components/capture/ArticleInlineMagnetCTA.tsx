import MedicareCaptureUnit from './MedicareCaptureUnit'
import {
  MAGNETS,
  resolveMagnetForSlug,
  type Pillar,
} from '@/lib/medicare-capture-config'

/**
 * In-body guide-upgrade capture, mounted mid-article on the high-dwell pages
 * listed in `MID_ARTICLE_MAGNET_SLUGS` (WO-666).
 *
 * This is a SERVER component on purpose. The magnet resolves synchronously via
 * `resolveMagnetForSlug` and the copy is picked before render, so the panel
 * ships complete in the initial HTML — `view-source` shows the headline and the
 * form, not an empty slot waiting on hydration. The client boundary starts one
 * level down, inside `MedicareCaptureUnit`, which owns form state, impression
 * tracking and the subscribe call.
 *
 * Contract: `MedicareCaptureUnit` submits with `surface='magnet'`, so
 * source_detail lands as `magnet:<article-slug>`. The magnet id and variant go
 * to `quiz_context`, never into the source_detail tail.
 */

interface CtaCopy {
  heading: string
  subhead: string
}

/**
 * Per-page copy. The offer converts on continuity — it should read as the next
 * step of the article the reader just finished, not as a generic house ad.
 */
const COPY_BY_SLUG: Record<string, CtaCopy> = {
  'glp1-drugs-covered-by-medicare-2026': {
    heading: 'Check your plan before enrollment closes',
    subhead:
      'The free 2026 Medicare Decision Kit lays out Part D and Advantage drug coverage side by side, so you can see where GLP-1s land on your plan. No agent, no sales call.',
  },
  'how-are-social-security-benefits-calculated-guide': {
    heading: 'Now that you have the math, plan the next step',
    subhead:
      'When you claim Social Security and when you start Medicare are the same decision. The free Medicare Starter Guide walks through both in plain English — no jargon, no agent.',
  },
  'medicare-part-d-changes-2027-what-seniors-should-know': {
    heading: 'See what the 2027 Part D changes mean for you',
    subhead:
      'The free 2026 Medicare Decision Kit puts premiums, deductibles and the new out-of-pocket cap in one place, so you can compare before you renew.',
  },
  'best-final-expense-insurance-companies-2026': {
    heading: 'Compare coverage without a sales call',
    subhead:
      "The free Buyer's Guide has monthly premiums by age for the top carriers, plus the graded-benefit period to watch for. Educational only — nobody will call you.",
  },
  'medicare-part-d-drug-plans-ranked-2026': {
    heading: 'Check your prescriptions against the 2026 plans',
    subhead:
      'The free 2026 Medicare Decision Kit breaks down Part D tiers, the coverage gap, and the one question that saves seniors around $700 a year.',
  },

  // --- WO-801: care cluster ---------------------------------------------
  // Bespoke copy for the cost- and shopping-intent pages, where the guide is
  // the literal next step. The rest of the cluster uses the long-term-care
  // fallback below.
  'senior-living-costs-by-state-2026': {
    heading: 'See what care costs in your state',
    subhead:
      'The free Cost of Long-Term Care guide puts assisted living, memory care, in-home care and nursing homes side by side — state by state, with the four ways families pay for it.',
  },
  'senior-living-costs-2026': {
    heading: 'Take the cost comparison with you',
    subhead:
      'The free Cost of Long-Term Care guide has all seven care types priced out, plus what changes the number most — location, hours, and level of care. No agent, no sales call.',
  },
  'how-much-does-in-home-care-cost-hourly-and-monthly-rates': {
    heading: 'Work out what in-home care will really cost',
    subhead:
      'At the current $35/hour median, the monthly number moves fast with hours. The free Cost of Long-Term Care guide does the math at 20, 40 and 44 hours a week — and shows how it compares to assisted living.',
  },
  'how-much-does-memory-care-cost-pricing-guide-for-2025': {
    heading: 'Plan for what memory care costs over time',
    subhead:
      'Memory care runs well above standard assisted living, and the gap widens as needs grow. The free Cost of Long-Term Care guide has current costs by state plus how families cover them.',
  },
  'in-home-care-vs-assisted-living-cost-and-care-comparison': {
    heading: 'Compare the two on paper, not from memory',
    subhead:
      'The free Cost of Long-Term Care guide puts in-home care and assisted living side by side with current numbers, and the break-even point where one overtakes the other.',
  },
  'best-assisted-living-options-by-state-2026': {
    heading: 'Know the price before you tour',
    subhead:
      'The free Cost of Long-Term Care guide has assisted living costs by state, what the monthly fee usually excludes, and the four ways families pay. Educational only — nobody will call you.',
  },
  'long-term-care-insurance-explained-2026': {
    heading: 'Start with the number the policy has to cover',
    subhead:
      'Whether LTC insurance is worth it depends on what care actually costs where you live. The free Cost of Long-Term Care guide has those numbers, plus the four ways families pay without a policy.',
  },
  'long-term-care-insurance-worth-it-checklist': {
    heading: 'Run the checklist against real numbers',
    subhead:
      'The free Cost of Long-Term Care guide gives you the current cost of each care type by state — the figure every question on this checklist ultimately turns on.',
  },
  'long-term-care-planning-guide': {
    heading: 'Put a number on the plan',
    subhead:
      'The free Cost of Long-Term Care guide prices out every care setting by state and lays out the four ways families pay: savings, Medicaid, VA benefits, and LTC insurance.',
  },
}

/** Used for any slug added to the allowlist before it gets bespoke copy. */
const FALLBACK_COPY: Record<Pillar, CtaCopy> = {
  medicare: {
    heading: 'Take the guide with you',
    subhead:
      'A plain-English Medicare guide from SeniorSimple — the numbers, the trade-offs, and a decision framework you can act on. No agent, no sales call.',
  },
  'final-expense': {
    heading: 'Take the guide with you',
    subhead:
      "A plain-English guide to burial and final expense coverage — what each policy actually pays, and the traps to avoid. Educational only, nobody will call you.",
  },
  annuity: {
    heading: 'Take the guide with you',
    subhead:
      "A plain-English guide to annuities — how each type pays, what the riders actually cost, and the terms worth questioning before you sign. Educational only, nobody will call you.",
  },
  'long-term-care': {
    heading: 'Take the cost numbers with you',
    subhead:
      'The free Cost of Long-Term Care guide prices out assisted living, memory care, in-home care and nursing homes by state — plus the four ways families pay for it. Educational only, nobody will call you.',
  },
}

export interface ArticleInlineMagnetCTAProps {
  slug: string
  className?: string
}

export default function ArticleInlineMagnetCTA({
  slug,
  className = '',
}: ArticleInlineMagnetCTAProps) {
  const { magnetId, topicTag } = resolveMagnetForSlug(slug)
  const copy = COPY_BY_SLUG[slug] ?? FALLBACK_COPY[MAGNETS[magnetId].pillar]

  return (
    <MedicareCaptureUnit
      pageSlug={slug}
      variant="inline"
      magnetId={magnetId}
      topicTag={topicTag}
      heading={copy.heading}
      subhead={copy.subhead}
      className={className}
    />
  )
}
