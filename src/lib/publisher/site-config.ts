/**
 * SMN publisher chassis — per-site config (WO-1507).
 *
 * Every Simple Media Network property renders the same chassis components
 * (hub schema, article directory, extended footer). Only this file changes
 * per site: brand, hubs, topic taxonomy, money action, network links.
 * "Structurally identical, visually per-vertical."
 * Spec: 00 - Reports/SMN-Publisher-Template-Spec-2026-11-12.md
 */

export interface PublisherHub {
  key: string
  name: string
  href: string
  /** <title> segment — the root layout template appends " | SeniorSimple". Keep ≤ 45 chars. */
  title: string
  /** Meta description, ≤ 155 chars. */
  description: string
}

export interface PublisherTopic {
  key: string
  name: string
  /** Matched against the free-text `articles.category` column (case-insensitive). */
  match: RegExp
}

export const SITE = {
  key: 'seniorsimple',
  name: 'SeniorSimple',
  url: 'https://www.seniorsimple.org',
  logo: 'https://www.seniorsimple.org/images/logos/senior-simple-logo-circle-mark-favicon.png',
  tagline: 'Plain-English retirement, Medicare, and estate guidance for people 55+.',
  description:
    'Free retirement planning help for seniors. Expert guidance on annuities, taxes, estate planning, reverse mortgages, Medicare, and more.',
  /** GHL SeniorSimple location default number (toll-free), confirmed 2026-11-12. */
  phoneDisplay: '(888) 423-0069',
  phoneE164: '+18884230069',
  email: 'support@seniorsimple.org',
  /** Physical mailing address — CAN-SPAM + Organization schema. */
  address: { street: '1026 40th St', city: 'San Diego', region: 'CA', postalCode: '92102', country: 'US' },
  sameAs: [] as string[],
  /** The site's money action — mega menu button, sidebar card, footer. */
  primaryCta: { label: 'Take the Retirement Rescue™ Quiz', href: '/quiz' },
  directory: { href: '/articles', name: 'All Articles' },
} as const

export const HUBS: PublisherHub[] = [
  {
    key: 'retirement',
    name: 'Retirement Planning',
    href: '/retirement',
    title: 'Retirement Planning Guides & Calculators',
    description:
      'Plan retirement income with confidence: guides on annuities, Social Security, and savings, plus free calculators built for people 55 and older.',
  },
  {
    key: 'health',
    name: 'Medicare & Healthcare',
    href: '/health',
    title: 'Medicare & Healthcare Planning for Seniors',
    description:
      'Understand Medicare enrollment, supplement vs. Advantage plans, long-term care, and healthcare costs in retirement — explained in plain English.',
  },
  {
    key: 'estate',
    name: 'Estate Planning',
    href: '/estate',
    title: 'Estate Planning Guides: Wills, Trusts & POA',
    description:
      'Protect your family and legacy: plain-English guides to wills, trusts, beneficiaries, power of attorney, and estate taxes for retirees.',
  },
  {
    key: 'tax',
    name: 'Tax Planning',
    href: '/tax',
    title: 'Retirement Tax Planning: RMDs, Roth & IRAs',
    description:
      'Keep more of your retirement income: RMD rules, Roth conversions, IRA withdrawals, and tax-smart strategies, with free calculators.',
  },
  {
    key: 'housing',
    name: 'Housing & Home Equity',
    href: '/housing',
    title: 'Senior Housing, Home Equity & Reverse Mortgages',
    description:
      'Compare aging in place, downsizing, home equity loans, and reverse mortgages — guides and calculators to make the most of your home in retirement.',
  },
  {
    key: 'insurance',
    name: 'Insurance',
    href: '/insurance',
    title: 'Life, Final Expense & Long-Term Care Insurance',
    description:
      'Compare life insurance, final expense, and long-term care coverage for seniors — what it costs, what it covers, and how to choose.',
  },
]

/** Directory "By topic" taxonomy — first match wins, unmatched → Senior Resources. */
export const TOPICS: PublisherTopic[] = [
  { key: 'annuities', name: 'Annuities', match: /annuit/i },
  { key: 'medicare', name: 'Medicare & Healthcare', match: /medicare|health/i },
  { key: 'social-security', name: 'Social Security', match: /social/i },
  { key: 'taxes', name: 'Taxes', match: /tax/i },
  { key: 'estate', name: 'Estate & Legal Planning', match: /estate|legal|legacy/i },
  { key: 'insurance', name: 'Insurance', match: /insurance/i },
  { key: 'senior-living', name: 'Senior Living & Care', match: /living|care|nursing|assisted|hospice|memory/i },
  { key: 'housing', name: 'Housing & Home Equity', match: /hous|home equity|financing|moving/i },
  { key: 'retirement', name: 'Retirement Planning', match: /retire|account|income/i },
]
export const FALLBACK_TOPIC = { key: 'senior-resources', name: 'Senior Resources' }

export function topicFor(category: string | null | undefined): { key: string; name: string } {
  if (category) {
    for (const t of TOPICS) if (t.match.test(category)) return { key: t.key, name: t.name }
  }
  return FALLBACK_TOPIC
}

/** Footer Zone B — life-stage cross-sell across Simple Media Network. */
export const NETWORK_SITES = [
  { name: 'ParentSimple', href: 'https://www.parentsimple.org', blurb: 'Family & college planning' },
  { name: 'LegalSimple', href: 'https://www.legalsimple.org', blurb: 'Know your legal rights' },
  { name: 'MoneySimple', href: 'https://www.moneysimple.org', blurb: 'Everyday money' },
  { name: 'HomeSimple', href: 'https://www.homesimple.org', blurb: 'Home projects & services' },
  { name: 'RateRoots', href: 'https://www.rateroots.com', blurb: 'Home equity options' },
]
export const NETWORK = { name: 'Simple Media Network', href: 'https://www.simplemedianetwork.com' }

export function absoluteUrl(path: string): string {
  return path.startsWith('http') ? path : `${SITE.url}${path === '/' ? '' : path}`
}
