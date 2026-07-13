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

// Prismique tracking base — sub params filled at CTA-render time:
//   sub1={click_id}  sub2={widget_id}  sub3={ad_header_variant}
//   sub4={ad_headline_variant}  sub5={slug}
const OFFER_TRACKING_URL = 'https://www.xe54ghj.com/352QZN8/J7HQGBF/';

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
    offer_tracking_url: OFFER_TRACKING_URL,
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
    offer_tracking_url: OFFER_TRACKING_URL,
  },
};

export function getAdvertorial(slug: string): AdvertorialSpec | null {
  return ADVERTORIALS[slug] ?? null;
}

export function listAdvertorialSlugs(): string[] {
  return Object.keys(ADVERTORIALS);
}
