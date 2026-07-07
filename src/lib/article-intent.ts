// Page-intent classifier for CTA routing.
//
// Money-in-motion pages (Medicare, Medigap, annuity, life insurance, final
// expense) are where a phone call is worth real money right now — Medicare
// = $8.75/lead, annuity = $12.50/lead. On those pages we keep phone CTAs
// live regardless of the email-CTA rollout; email is added, not swapped.
//
// Everything else (Social Security explainers, retirement basics, general
// how-to) is editorial / top-of-funnel — email is the right primary and
// phone CTAs get suppressed.

interface ArticleLike {
  title?: string | null
  slug?: string | null
  tags?: string[] | null
  category_details?: { name?: string | null } | null
}

const MONEY_IN_MOTION_TERMS = [
  'medicare',
  'medigap',
  'annuity',
  'final expense',
  'final-expense',
  'life insurance',
  'life-insurance',
  'insurance',
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
