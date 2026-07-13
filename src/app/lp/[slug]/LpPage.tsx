'use client';

/**
 * Advertorial LP shell (client component).
 *
 * The default surface for every /lp/[slug] advertorial. Composes from the
 * v2 component library — any new advertorial (new slug, new angle) renders
 * through this shell and inherits the editorial-native theme + primitives
 * with zero manual styling.
 *
 * Design spec (typography, color, layout tokens):
 *   02-Expansion-Operations-Planning/shared-utils/ADVERTORIAL_STYLE_GUIDE.md
 *
 * Component-level spec (17 named primitives):
 *   02-Expansion-Operations-Planning/shared-utils/ADVERTORIAL_COMPONENT_LIBRARY_v2.html
 *
 * Split-test contract (allocation, slot resolution):
 *   02-Expansion-Operations-Planning/shared-utils/ADVERTORIAL_SPLIT_TESTING.md
 *
 * Responsibilities:
 *   • Read inbound URL params (state, click_id, widget_id) on mount.
 *   • Compute the CtaContext `subs` object (sub1–sub5) and install
 *     <CtaProvider> so every downstream CTA + interactive quiz resolves to
 *     the same outbound URL. D-series quiz selections append as sub6+.
 *   • Fire GA4 page_view + POST /api/analytics/track-event with
 *     ad_header_variant + ad_headline_variant stamped for downstream
 *     Supabase / Meta CAPI attribution.
 *   • Render <Masthead> + body + <DisclosureFooter> — everything else lives
 *     in the angle-specific body.
 */

import { useEffect, useState } from 'react';
import type { AdvertorialAngle } from '@/lib/advertorial-content';
import AngleABody from './AngleABody';
import AngleBBody from './AngleBBody';
import styles from './advertorial.module.css';
import {
  CtaProvider,
  DisclosureFooter,
  Masthead,
  type CtaSubs,
} from './components';

interface LpPageProps {
  slug: string;
  angle: AdvertorialAngle;
  headerSrc: string | null;
  headerId: string | null;
  headline: string | null;
  headlineId: string | null;
  offerTrackingUrl: string;
}

const SITE_KEY = 'seniorsimple.org';

function getOrCreateSessionId(): string {
  const existing = sessionStorage.getItem('session_id');
  if (existing) return existing;
  const fresh = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
  sessionStorage.setItem('session_id', fresh);
  return fresh;
}

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export default function LpPage({
  slug,
  angle,
  headerSrc,
  headerId,
  headline,
  headlineId,
  offerTrackingUrl,
}: LpPageProps) {
  const [stateName, setStateName] = useState<string>('');
  const [inbound, setInbound] = useState<{ clickId: string; widgetId: string }>({
    clickId: '',
    widgetId: '',
  });

  useEffect(() => {
    const qp = new URLSearchParams(window.location.search);
    const st = (qp.get('state') || '').trim();
    const clickId =
      qp.get('click_id') || qp.get('clickid') || qp.get('sub1') || '';
    const widgetId = qp.get('widget_id') || qp.get('sub2') || '';

    if (st) setStateName(st);
    setInbound({ clickId, widgetId });

    const sessionId = getOrCreateSessionId();
    const commonProps = {
      site_key: SITE_KEY,
      slug,
      angle,
      state: st || null,
      click_id: clickId || null,
      widget_id: widgetId || null,
      ad_header_variant: headerId,
      ad_headline_variant: headlineId,
    };

    if (typeof window.gtag === 'function') {
      window.gtag('event', 'page_view', {
        page_title: document.title,
        page_location: window.location.href,
        page_path: window.location.pathname,
        event_category: 'advertorial',
        ...commonProps,
      });
    }

    fetch('/api/analytics/track-event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_name: 'lp_view',
        properties: commonProps,
        session_id: sessionId,
        user_id: sessionId,
        page_url: window.location.href,
        referrer: document.referrer,
        user_agent: navigator.userAgent,
        event_category: 'advertorial',
        event_label: 'view',
      }),
    }).catch(() => {
      /* non-blocking */
    });
  }, [slug, angle, headerId, headlineId]);

  const subs: CtaSubs = {
    sub1: inbound.clickId,
    sub2: inbound.widgetId,
    sub3: headerId ?? '',
    sub4: headlineId ?? '',
    sub5: slug,
  };

  const stateArea = stateName || 'your area';
  const displayStateName = stateName || 'Your State';

  const bodyProps = {
    headline,
    headerSrc,
    stateName: displayStateName,
    stateArea,
  };

  return (
    <CtaProvider base={offerTrackingUrl} subs={subs}>
      <article className={styles.root}>
        <Masthead />
        <div className={styles.wrap}>
          {angle === 'A' ? (
            <AngleABody {...bodyProps} />
          ) : (
            <AngleBBody {...bodyProps} />
          )}
          <DisclosureFooter
            disclosure={
              <>
                Advertisement. SeniorSimple publishes independent money and
                retirement guides and may earn compensation from products
                featured, including American Perks Club, a third-party
                membership service. Discounts and savings vary by location and
                use.
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
