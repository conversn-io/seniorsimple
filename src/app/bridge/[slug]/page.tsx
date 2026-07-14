/**
 * /bridge/[slug] — funnel bridge page between the advertorial LP and the
 * offer. Hosts the primary conversion vehicle (SavingsCalculator +
 * SavingsBreakdown + full APC TrustBar).
 *
 * Funnel: /lp/[slug]  →  /bridge/perks  →  https://www.xe54ghj.com/...
 *
 * Sub params from the advertorial land in this page's URL query
 * (?source_id=…&sub1=…&sub3=…&…). BridgePage reads them client-side and
 * seeds CtaContext with them. sub3/sub4 (ad_header, ad_headline) also
 * come from cookies set by middleware on the advertorial visit — cookies
 * persist to this route.
 *
 * force-dynamic because subs are per-visitor. noindex because bridges are
 * paid-traffic destinations, not organic.
 */

import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';

import {
  AD_HEADER_COOKIE,
  AD_HEADLINE_COOKIE,
} from '@/lib/flag-registry';

import BridgePage from './BridgePage';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

/** Available bridges. Extend as new offers come online. */
const BRIDGES: Record<string, { title: string }> = {
  perks: { title: 'Estimate Your Yearly Savings' },
};

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  const bridge = BRIDGES[slug];
  if (!bridge) notFound();

  // Cookies persist from the /lp/* visit that referred the user here.
  // Pass them through as the initial ad_header / ad_headline signals.
  const c = await cookies();
  const initialHeader = c.get(AD_HEADER_COOKIE)?.value ?? '';
  const initialHeadline = c.get(AD_HEADLINE_COOKIE)?.value ?? '';

  return (
    <BridgePage
      bridgeSlug={slug}
      title={bridge.title}
      initialHeaderVariant={initialHeader}
      initialHeadlineVariant={initialHeadline}
    />
  );
}
