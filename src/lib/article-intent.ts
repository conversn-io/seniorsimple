// Page-intent classifier for CTA routing.
//
// Money-in-motion pages are where a phone call is worth real money right now —
// Medicare = $8.75/lead, annuity = $12.50/lead. On those pages we keep phone
// CTAs live regardless of the email-CTA rollout; email is added, not swapped.
//
// Everything else (general retirement basics, unrelated how-to) is editorial /
// top-of-funnel — email is the right primary and phone CTAs get suppressed.
//
// Term list scope note: Social Security / pension / lump sum / retirement
// income / IRA rollover / reverse mortgage pages all buy annuity leads. The
// #3 seniorsimple page by impressions is a Social Security calculator
// (~6k/28d); it MUST be in-scope for phone CTAs.

interface ArticleLike {
  title?: string | null
  slug?: string | null
  tags?: string[] | null
  category_details?: { name?: string | null } | null
}

const MONEY_IN_MOTION_TERMS = [
  // Insurance verticals
  'medicare',
  'medigap',
  'annuity',
  'final expense',
  'final-expense',
  'life insurance',
  'life-insurance',
  'insurance',
  // Annuity-lead-adjacent retirement topics
  'social security',
  'social-security',
  'pension',
  'lump sum',
  'lump-sum',
  'retirement income',
  'retirement-income',
  'ira rollover',
  'ira-rollover',
  'reverse mortgage',
  'reverse-mortgage',
]

function includesAny(haystack: string | null | undefined, needles: string[]): boolean {
  if (!haystack) return false
  const lower = haystack.toLowerCase()
  return needles.some((n) => lower.includes(n))
}

export function isMoneyInMotionArticle(article: ArticleLike): boolean {
  if (!article) return false
  if (includesAny(article.title, MONEY_IN_MOTION_TERMS)) return true
  if (includesAny(article.slug, MONEY_IN_MOTION_TERMS)) return true
  if (includesAny(article.category_details?.name, MONEY_IN_MOTION_TERMS)) return true
  if (Array.isArray(article.tags)) {
    for (const tag of article.tags) {
      if (typeof tag === 'string' && includesAny(tag, MONEY_IN_MOTION_TERMS)) return true
    }
  }
  return false
}
