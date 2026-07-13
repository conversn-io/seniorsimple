'use client';

/**
 * Advertorial LP shell (client component).
 *
 * Renders masthead + adnote + footer around the angle-specific body. Handles:
 *   • Geo personalization — `?state=Ohio` populates the H1 {STATE} token and
 *     in-body "your area" mentions; empty falls back to "Your State" /
 *     "your area".
 *   • CTA URL construction — appends sub1={click_id}&sub2={widget_id}
 *     &sub3={ad_header}&sub4={ad_headline}&sub5={slug} to the Prismique
 *     tracking base. click_id / widget_id come from inbound RevContent
 *     params (?click_id or ?clickid or ?sub1; ?widget_id or ?sub2); variant
 *     ids are server-resolved (from ss_ad_header + ss_ad_headline cookies)
 *     and passed in as props.
 *   • Analytics — fires GA4 page_view + POST /api/analytics/track-event with
 *     ad_header_variant + ad_headline_variant stamped so downstream Supabase
 *     attribution splits by variant without re-joining sessions.
 */

import { useEffect, useState } from 'react';
import type { AdvertorialAngle } from '@/lib/advertorial-content';
import AngleABody from './AngleABody';
import AngleBBody from './AngleBBody';
import styles from './perks.module.css';

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

interface CtaSubs {
  clickId: string;
  widgetId: string;
  headerId: string;
  headlineId: string;
  slug: string;
}

function buildCtaHref(base: string, subs: CtaSubs): string {
  try {
    const url = new URL(base);
    url.searchParams.set('sub1', subs.clickId);
    url.searchParams.set('sub2', subs.widgetId);
    url.searchParams.set('sub3', subs.headerId);
    url.searchParams.set('sub4', subs.headlineId);
    url.searchParams.set('sub5', subs.slug);
    return url.toString();
  } catch {
    return base;
  }
}

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
  const [ctaHref, setCtaHref] = useState<string>(() =>
    buildCtaHref(offerTrackingUrl, {
      clickId: '',
      widgetId: '',
      headerId: headerId ?? '',
      headlineId: headlineId ?? '',
      slug,
    })
  );

  useEffect(() => {
    const qp = new URLSearchParams(window.location.search);
    const st = (qp.get('state') || '').trim();
    const clickId =
      qp.get('click_id') || qp.get('clickid') || qp.get('sub1') || '';
    const widgetId = qp.get('widget_id') || qp.get('sub2') || '';

    if (st) setStateName(st);

    setCtaHref(
      buildCtaHref(offerTrackingUrl, {
        clickId,
        widgetId,
        headerId: headerId ?? '',
        headlineId: headlineId ?? '',
        slug,
      })
    );

    const sessionId = getOrCreateSessionId();
    const flagProps = {
      ad_header_variant: headerId,
      ad_headline_variant: headlineId,
    };
    const commonProps = {
      site_key: SITE_KEY,
      slug,
      angle,
      state: st || null,
      click_id: clickId || null,
      widget_id: widgetId || null,
      ...flagProps,
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
  }, [slug, angle, headerId, headlineId, offerTrackingUrl]);

  const stateArea = stateName || 'your area';
  const displayStateName = stateName || 'Your State';

  const bodyProps = {
    headline,
    headerSrc,
    ctaHref,
    stateName: displayStateName,
    stateArea,
  };

  return (
    <article className={styles.root}>
      <div className={styles.adnote}>Advertisement</div>
      <div className={styles.masthead}>
        <span className={styles.mastheadName}>SeniorSimple</span>
        <span className={styles.mastheadSection}>Money · Retirement</span>
      </div>
      <div className={styles.wrap}>
        {angle === 'A' ? <AngleABody {...bodyProps} /> : <AngleBBody {...bodyProps} />}

        <footer className={styles.footer}>
          <p className={styles.p}>
            Advertisement. SeniorSimple publishes independent money and retirement
            guides and may earn compensation from products featured, including American
            Perks Club, a third-party membership service. Discounts and savings vary by
            location and use.
          </p>
          <p className={styles.footerSecond}>
            © 2026 SeniorSimple — a Simple Media Network property ·{' '}
            <a href="/privacy">Privacy</a> · <a href="/terms">Terms</a> ·{' '}
            <a href="/contact">Contact</a>
          </p>
        </footer>
      </div>
    </article>
  );
}
