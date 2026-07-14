'use client';

/**
 * Bridge page client shell — installs CtaContext with the OFFER tracking
 * URL as base so every CTA here goes to the affiliate offer. Reads
 * inbound sub params from the URL (forwarded from the advertorial's CTA),
 * merges cookie-based header/headline variants passed in from the server
 * component, then renders the calc + breakdown + TrustBar + CTA.
 *
 * Funnel role: this is the LAST hop before the offer. Any interaction
 * here (calculator touch → sub10=calc) is the final signal Prismique
 * receives.
 */

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

import { APC_BRANDS, OFFER_TRACKING_URL, SOURCE_ID } from '@/lib/advertorial-content';
import styles from '@/app/lp/[slug]/advertorial.module.css';
import {
  CtaProvider,
  DisclosureFooter,
  Masthead,
  SavingsBreakdown,
  SavingsCalculator,
  TrustBar,
  type CtaSubs,
} from '@/app/lp/[slug]/components';

interface BridgePageProps {
  bridgeSlug: string;
  title: string;
  initialHeaderVariant: string;
  initialHeadlineVariant: string;
}

interface InboundSubs {
  sub1: string;
  sub2: string;
  sub5: string;
  sub6: string;
  sub7: string;
  sub8: string;
  sub9: string;
  sub10: string;
}

const EMPTY_INBOUND: InboundSubs = {
  sub1: '',
  sub2: '',
  sub5: '',
  sub6: '',
  sub7: '',
  sub8: '',
  sub9: '',
  sub10: '',
};

export default function BridgePage({
  bridgeSlug,
  title,
  initialHeaderVariant,
  initialHeadlineVariant,
}: BridgePageProps) {
  const [inbound, setInbound] = useState<InboundSubs>(EMPTY_INBOUND);

  useEffect(() => {
    const qp = new URLSearchParams(window.location.search);
    setInbound({
      sub1: qp.get('sub1') || qp.get('click_id') || qp.get('clickid') || '',
      sub2: qp.get('sub2') || qp.get('widget_id') || '',
      sub5: qp.get('sub5') || '',
      sub6: qp.get('sub6') || '',
      sub7: qp.get('sub7') || qp.get('state') || '',
      sub8: qp.get('sub8') || '',
      sub9: qp.get('sub9') || '',
      sub10: qp.get('sub10') || '',
    });
  }, []);

  const subs: CtaSubs = useMemo(
    () => ({
      source_id: SOURCE_ID,
      sub1: inbound.sub1,
      sub2: inbound.sub2,
      // sub3 / sub4 come from cookies set on the /lp/* visit and hydrated
      // in the server component. If someone lands on the bridge directly
      // without visiting an advertorial, these will be empty — that's
      // fine; middleware doesn't run on /bridge/*, we don't allocate here.
      sub3: initialHeaderVariant,
      sub4: initialHeadlineVariant,
      sub5: inbound.sub5,
      sub6: inbound.sub6,
      sub7: inbound.sub7,
      sub8: inbound.sub8,
      sub9: inbound.sub9,
      sub10: inbound.sub10,
    }),
    [
      inbound.sub1,
      inbound.sub2,
      inbound.sub5,
      inbound.sub6,
      inbound.sub7,
      inbound.sub8,
      inbound.sub9,
      inbound.sub10,
      initialHeaderVariant,
      initialHeadlineVariant,
    ]
  );

  return (
    <CtaProvider base={OFFER_TRACKING_URL} subs={subs}>
      <article className={styles.root} data-bridge-slug={bridgeSlug}>
        <Masthead />
        <div className={styles.wrap}>
          <h1 className={styles.h1} style={{ marginTop: 16 }}>
            {title}
          </h1>
          <div className={styles.byline}>
            Members typically save well over $120/yr. See what your profile
            looks like.
          </div>

          <SavingsCalculator />
          <SavingsBreakdown />

          <TrustBar
            label="Member pricing at brands including:"
            brands={APC_BRANDS}
          />

          <div className={styles.small} style={{ marginTop: 16 }}>
            Not what you&apos;re looking for?{' '}
            <Link href={`/lp/${inbound.sub5 || 'senior-discounts'}`}>
              Back to the article
            </Link>
            .
          </div>

          <DisclosureFooter
            disclosure={
              <>
                Advertisement. SeniorSimple publishes independent money and
                retirement guides and may earn compensation from products
                featured, including American Perks Club, a third-party
                membership service. Estimated savings are based on
                self-reported spending and vary by location and use.
              </>
            }
            copyright={
              <>© 2026 SeniorSimple — a Simple Media Network property</>
            }
            legalLinks={[
              { label: 'Privacy', href: '/privacy' },
              { label: 'Terms', href: '/terms' },
              { label: 'Contact', href: '/contact' },
            ]}
          />
        </div>
      </article>
    </CtaProvider>
  );
}

