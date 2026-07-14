/**
 * Composer stub for advertorial LPs.
 *
 * Temporary hard-coded map until the composer (advertorials table +
 * render_payload) ships. Shape matches the composer output contract in
 * shared-utils/ADVERTORIAL_SPLIT_TESTING.md so /lp/[slug]/page.tsx can be
 * swapped over with no call-site change once the DB path lands.
 *
 * Angles ship as separate slugs (route-level angle allocation, not headline
 * slot swap) so each angle can carry its own body content. Header image
 * split test (control_h2 vs challenger_e2) is shared across both slugs and
 * driven by the ss_ad_header cookie set by middleware.
 */

import type { HeaderVariant, HeadlineVariant } from './advertorial-slots';

export type AdvertorialAngle = 'A' | 'B';

export interface AdvertorialSpec {
  slug: string;
  angle: AdvertorialAngle;
  header_variants: HeaderVariant[];
  variant_headlines: HeadlineVariant[];
  offer_tracking_url: string;
}

// Shared header image variants — same 50/50 test on both angle LPs.
const HEADER_VARIANTS: HeaderVariant[] = [
  {
    id: 'control_h2',
    src: 'https://vpysqshhafthuxvokwqj.supabase.co/storage/v1/object/public/media/ai-hero/advertorial_hero/1783962954923-qdy1h3-1.png',
  },
  {
    id: 'challenger_e2',
    src: 'https://vpysqshhafthuxvokwqj.supabase.co/storage/v1/object/public/media/ai-hero/native_ad/1783958462695-oewlyl-1.png',
  },
];

/**
 * Funnel targets:
 *   Advertorial LP (/lp/[slug])   →  Bridge (/bridge/perks)   →  Offer
 *
 * Advertorial CTAs point at the bridge page, not the offer directly.
 * The bridge hosts the SavingsCalculator + SavingsBreakdown + full logo
 * TrustBar and is the conversion vehicle. Sub params flow through the
 * whole chain via CtaContext (see components/CtaContext.tsx and
 * ADVERTORIAL_STYLE_GUIDE.md §6 for the locked parameter scheme).
 */
export const BRIDGE_TRACKING_URL = '/bridge/perks';

/**
 * Offer tracking URL — final funnel target. Used by BridgePage (not by
 * advertorial LPs directly). Every sub-param slot documented in the
 * LOCKED parameter scheme (ADVERTORIAL_STYLE_GUIDE.md §6) + CtaContext.tsx:
 *   source_id — publisher id (see SOURCE_ID export below)
 *   sub1={click_id}  sub2={widget_id}  sub3={ad_header_variant}
 *   sub4={ad_headline_variant}  sub5={slug}  sub6={spend_focus}
 *   sub7={state}  sub8={frequency}  sub9={angle}  sub10={click_source}
 */
export const OFFER_TRACKING_URL = 'https://www.xe54ghj.com/352QZN8/J7HQGBF/';

/**
 * Static publisher identifier. Same value on every SeniorSimple LP so
 * Prismique rolls all our clicks into one publisher bucket. Locked by
 * Keenan 2026-07-13 — change here (single source of truth) if it moves.
 */
export const SOURCE_ID = 'keenanshaw_1323';

/**
 * Real American Perks Club brand set used by the E3 TrustBar component,
 * categorized (Retail · Theme parks · Hotels · Rental cars · Dining · Auto).
 * Sourced from APC's public partner directory per the reference:
 * ADVERTORIAL_COMPONENT_LIBRARY_v2.html §E3 + perks_lp_optimization_v2_calculator.md.
 *
 * `domain` is the brand's canonical domain — used by TrustBar to fetch a
 * favicon-quality logo from a public icon service. Real logo files can
 * later be uploaded to Supabase Storage and swapped in per-brand without
 * touching the component (change domain URL to a full logo CDN URL).
 *
 * OPERATOR-CONFIRMED (verified against APC's live directory):
 *   Costco, Sam's Club, InterContinental, Palace Resorts
 *
 * TO-VERIFY (from reference — check APC's directory before paid traffic):
 *   Walmart, Target, Amazon, Home Depot,
 *   Disney World, Universal, Six Flags,
 *   Extended Stay America,
 *   Avis, Budget, Enterprise, Alamo,
 *   IHOP, Papa John's,
 *   Ford, Goodyear
 */
export interface ApcBrand {
  name: string;
  domain: string;
}

export const APC_BRANDS: ApcBrand[] = [
  // Retail (6)
  { name: 'Walmart', domain: 'walmart.com' },
  { name: 'Costco', domain: 'costco.com' },
  { name: "Sam's Club", domain: 'samsclub.com' },
  { name: 'Target', domain: 'target.com' },
  { name: 'Amazon', domain: 'amazon.com' },
  { name: 'Home Depot', domain: 'homedepot.com' },
  // Theme parks (3)
  { name: 'Disney World', domain: 'disneyworld.disney.go.com' },
  { name: 'Universal', domain: 'universalstudios.com' },
  { name: 'Six Flags', domain: 'sixflags.com' },
  // Hotels (3)
  { name: 'InterContinental', domain: 'ihg.com' },
  { name: 'Extended Stay America', domain: 'extendedstayamerica.com' },
  { name: 'Palace Resorts', domain: 'palaceresorts.com' },
  // Rental cars (4)
  { name: 'Avis', domain: 'avis.com' },
  { name: 'Budget', domain: 'budget.com' },
  { name: 'Enterprise', domain: 'enterprise.com' },
  { name: 'Alamo', domain: 'alamo.com' },
  // Dining (2)
  { name: 'IHOP', domain: 'ihop.com' },
  { name: "Papa John's", domain: 'papajohns.com' },
  // Auto (2)
  { name: 'Ford', domain: 'ford.com' },
  { name: 'Goodyear', domain: 'goodyear.com' },
];

const ADVERTORIALS: Record<string, AdvertorialSpec> = {
  'senior-discounts': {
    slug: 'senior-discounts',
    angle: 'A',
    header_variants: HEADER_VARIANTS,
    variant_headlines: [
      {
        id: 'local_geo',
        text: 'Senior Discounts in {STATE}: Where Adults 55+ Are Quietly Saving in 2026',
      },
    ],
    offer_tracking_url: BRIDGE_TRACKING_URL,
  },
  'things-retirees-cut': {
    slug: 'things-retirees-cut',
    angle: 'B',
    header_variants: HEADER_VARIANTS,
    variant_headlines: [
      {
        id: 'retiree_listicle',
        text: '9 Things Retirees Are Quietly Cutting to Stretch Every Dollar in 2026',
      },
    ],
    offer_tracking_url: BRIDGE_TRACKING_URL,
  },
};

export function getAdvertorial(slug: string): AdvertorialSpec | null {
  return ADVERTORIALS[slug] ?? null;
}

export function listAdvertorialSlugs(): string[] {
  return Object.keys(ADVERTORIALS);
}
