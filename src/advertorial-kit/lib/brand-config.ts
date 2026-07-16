/**
 * Per-site editorial identity for advertorial pages.
 *
 * The `brand_editorial_config` DB table exists (see 20260225000001) but is
 * oriented at social generation — it lacks masthead / palette / disclosure
 * fields. We keep those in code for v1; promote to DB when the config surface
 * stabilizes. The consumer only reads through getAdvertorialBrand(siteId), so
 * a future swap to a DB fetch is a one-file change.
 *
 * Palettes intentionally stay conservative — editorial-native, not brand-loud.
 * The whole point of the /lp page is to read as an editorial listicle from the
 * property, so this is muted mastheads + newspaper serif body, per §3 of the
 * mega-listicle design doc.
 */

export interface AdvertorialBrand {
  siteId: string
  masthead: string                // display name on the top bar / masthead
  publisherLegal: string          // shown in the footer (© <publisher>)
  accent: string                  // CSS color used for CTAs / rules
  accentText: string              // legible text on the accent background
  bodyFontClass: string           // Tailwind class for body copy
  headlineFontClass: string       // Tailwind class for headlines
  defaultDisclosureMd: string     // fallback when advertorial.disclosure_md is empty
}

const DEFAULT_DISCLOSURE_MD = `
**Advertising disclosure.** This page is a sponsored editorial. We may earn a
commission when a reader takes an action through one of the programs featured
below. All content is informational only and not financial, tax, insurance,
legal, or medical advice. Program availability, terms, and payouts change
without notice — read each provider's own disclosures before enrolling.
`.trim()

const REVERSE_MORTGAGE_ADDENDUM = `

**Reverse mortgage note.** Reverse mortgages are loans. They must be repaid
when the borrower moves out, sells the home, or passes away. Interest accrues,
and the balance grows over time. Borrowers remain responsible for property
taxes, homeowners insurance, and home maintenance.
`.trim()

/** Registry of per-site brand chrome. Add a new site by adding a row. */
export const ADVERTORIAL_BRANDS: Record<string, AdvertorialBrand> = {
  seniorsimple: {
    siteId: 'seniorsimple',
    masthead: 'SeniorSimple',
    publisherLegal: 'Simple Media Network',
    accent: '#0F766E',           // muted teal — editorial, not neon
    accentText: '#FFFFFF',
    bodyFontClass: 'font-serif',
    headlineFontClass: 'font-serif',
    defaultDisclosureMd: DEFAULT_DISCLOSURE_MD + REVERSE_MORTGAGE_ADDENDUM,
  },
  moneysimple: {
    siteId: 'moneysimple',
    masthead: 'MoneySimple',
    publisherLegal: 'Simple Media Network',
    accent: '#166534',           // deep green
    accentText: '#FFFFFF',
    bodyFontClass: 'font-serif',
    headlineFontClass: 'font-serif',
    defaultDisclosureMd: DEFAULT_DISCLOSURE_MD,
  },
  'rateroots.com': {
    siteId: 'rateroots.com',
    masthead: 'RateRoots',
    publisherLegal: 'Simple Media Network',
    accent: '#1D4ED8',           // steady blue
    accentText: '#FFFFFF',
    bodyFontClass: 'font-serif',
    headlineFontClass: 'font-serif',
    defaultDisclosureMd: DEFAULT_DISCLOSURE_MD + REVERSE_MORTGAGE_ADDENDUM,
  },
  homesimple: {
    siteId: 'homesimple',
    masthead: 'HomeSimple',
    publisherLegal: 'Simple Media Network',
    accent: '#B45309',           // amber
    accentText: '#FFFFFF',
    bodyFontClass: 'font-serif',
    headlineFontClass: 'font-serif',
    defaultDisclosureMd: DEFAULT_DISCLOSURE_MD,
  },
  parentsimple: {
    siteId: 'parentsimple',
    masthead: 'ParentSimple',
    publisherLegal: 'Simple Media Network',
    accent: '#6D28D9',           // aubergine
    accentText: '#FFFFFF',
    bodyFontClass: 'font-serif',
    headlineFontClass: 'font-serif',
    defaultDisclosureMd: DEFAULT_DISCLOSURE_MD,
  },
}

const FALLBACK_BRAND: AdvertorialBrand = {
  siteId: 'unknown',
  masthead: 'Editorial',
  publisherLegal: 'Simple Media Network',
  accent: '#1F2937',
  accentText: '#FFFFFF',
  bodyFontClass: 'font-serif',
  headlineFontClass: 'font-serif',
  defaultDisclosureMd: DEFAULT_DISCLOSURE_MD,
}

export function getAdvertorialBrand(siteId: string | null | undefined): AdvertorialBrand {
  if (!siteId) return FALLBACK_BRAND
  return ADVERTORIAL_BRANDS[siteId] ?? FALLBACK_BRAND
}
