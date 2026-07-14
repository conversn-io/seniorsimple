/**
 * /lp/car-insurance-seniors — standalone paid-traffic advertorial LP for
 * the MaxBounty auto-insurance offer.
 *
 * Ship-order v2 (tap-only + IP geo):
 *   - No text-input anywhere on the page (native winners are tap-only).
 *   - H1 injects visitor state from Vercel geo headers server-side;
 *     falls back to "Your Area" when geo is unknown. `?geo=<CODE>`
 *     query-param override supports QA + local dev.
 *   - Primary conversion vehicle is the swappable <QuizComponent>
 *     (v1: vehicle_make). Every tile's href is composed server-side via
 *     buildOfferUrl(s3) — no client-side hydration race on the CTA URL.
 *   - Sub-params on the offer: s1 (fixed brand) · s2 (?src=) · s3 (tap).
 *
 * Sibling to /lp/[slug] (the angle-A/B advertorial system): shares the
 * /lp/* chrome-suppression from ConditionalHeader/ConditionalFooter, but
 * doesn't participate in that pipeline — different offer, different
 * sub-param scheme, no bridge, no angle test.
 *
 * force-dynamic because geo headers + ?src= are per-request; noindex,
 * nofollow because this is a paid LP.
 */

import type { Metadata } from 'next';
import { headers } from 'next/headers';

import { DisclosureAnchor, DisclosureButton } from './DisclosureLink';
import { buildOfferUrl, resolveState, sanitizeSrc } from './lib';
import { QuizComponent } from './quiz/QuizComponent';
import type { QuizVariantId } from './quiz/types';
import styles from './styles.module.css';

export const dynamic = 'force-dynamic';

const HERO_SRC =
  'https://vpysqshhafthuxvokwqj.supabase.co/storage/v1/object/public/media/ai-hero/native_ad/1784063550461-ea9p6q-0.png';

const VALID_QUIZ_VARIANTS = new Set<QuizVariantId>([
  'vehicle_make',
  'state_map_tap',
  'age_tap',
  'make_age',
]);

export const metadata: Metadata = {
  title:
    'Who Has the Cheapest Car Insurance for Seniors in Your Area? | SeniorSimple',
  description:
    'Many drivers 55+ are re-shopping their car insurance and finding lower rates in their zip code. Here’s how to check yours in about 2 minutes.',
  robots: { index: false, follow: false },
};

interface PageProps {
  searchParams: Promise<{ src?: string; geo?: string; quiz?: string }>;
}

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;
  const src = sanitizeSrc(params.src);

  const h = await headers();
  const stateName = resolveState({
    countryRegionHeader: h.get('x-vercel-ip-country-region'),
    regionHeader: h.get('x-vercel-ip-region'),
    countryHeader: h.get('x-vercel-ip-country'),
    geoOverride: params.geo ?? null,
  });
  const locLabel = stateName ?? 'Your Area';

  const quizVariant =
    params.quiz && VALID_QUIZ_VARIANTS.has(params.quiz as QuizVariantId)
      ? (params.quiz as QuizVariantId)
      : undefined;

  const composeOfferUrl = (s3: string) => buildOfferUrl(src, s3);
  const bottomCtaUrl = buildOfferUrl(src);

  return (
    <div className={styles.page}>
      <div className={styles.wrap}>
        <div className={styles.adlabel}>
          Advertisement · Sponsored content by SeniorSimple
        </div>
        <div className={styles.masthead}>
          <div className={styles.logo}>
            Senior<span>Simple</span>
          </div>
          <DisclosureButton className={styles.discTop} />
        </div>
        <div className={styles.discBox}>
          SeniorSimple is an independent, advertising-supported publisher. When
          you request quotes we connect you with licensed insurance partners
          who may compensate us — see our{' '}
          <DisclosureAnchor>full disclosure</DisclosureAnchor>.
        </div>

        <main className={styles.main}>
          <h1 className={styles.h1}>
            Who Has the Cheapest Car Insurance for Seniors in{' '}
            <span id="loc">{locLabel}</span>?
          </h1>
          <div className={styles.byline}>
            <div className={styles.avatar}>S</div>
            <div>
              <strong>SeniorSimple Editorial Team</strong> · Updated July 2026
            </div>
          </div>
          {/*
            Hero is the LCP element (near/above the fold on both desktop and
            mobile). Ship order §6 says "lazy-load"; browser testing showed
            loading="lazy" delayed the hero paint enough to blow §7's <3s
            budget. Eager + fetchpriority="high" is the correct choice for
            an LCP hero and satisfies the more important requirement.
          */}
          <img
            src={HERO_SRC}
            alt=""
            fetchPriority="high"
            decoding="async"
            width={1200}
            height={675}
            className={styles.hero}
          />

          <p className={`${styles.p} ${styles.lede}`}>
            Here&apos;s something a lot of older drivers don&apos;t realize:
            car insurance rates change constantly, and they vary a surprising
            amount from one zip code to the next. Many people 55 and older
            have been with the same company for years and have never
            re-shopped — which means they could be leaving real money on the
            table.
          </p>
          <p className={styles.p}>
            Insurers weigh your age, driving record, and location differently,
            and a driver who compares a few options can sometimes find a
            noticeably lower rate for the same coverage. Drivers who switched
            last year reported saving a median of around{' '}
            <strong>$461</strong>
            <a href="#fn1" className={styles.footnoteMark}>¹</a> — not a
            guarantee, but enough that it&apos;s worth two minutes to check.
          </p>

          <QuizComponent
            variant={quizVariant}
            buildOfferUrl={composeOfferUrl}
          />

          <h2 className={styles.h2}>Why re-shopping tends to pay off after 55</h2>
          <p className={styles.p}>
            Loyalty rarely gets rewarded in auto insurance. Companies adjust
            their pricing models often, and the rate that was competitive when
            you signed up may have quietly drifted higher. A free comparison
            tool lets you see current offers from several insurers side by
            side, so you can decide whether your current policy still makes
            sense — or whether a switch would save you money for the same
            protection.
          </p>
          <h2 className={styles.h2}>How it works</h2>
          <p className={styles.p}>
            Tap the tile that matches your car above and answer a few quick
            questions about your driving history. The tool returns real
            quotes from insurers competing for your business. There&apos;s no
            obligation to switch — many people simply use it to confirm they
            aren&apos;t overpaying.
          </p>

          <a
            className={`${styles.cta} ${styles.ctaBlock}`}
            id="bottomcta"
            href={bottomCtaUrl}
            rel="nofollow sponsored"
          >
            Compare Car Insurance Quotes →
          </a>
          <p className={styles.fineprint}>
            Quotes and eligibility are determined by each insurer. Rates vary
            by location, driving record, and coverage.
          </p>
        </main>

        <footer id="disc" className={styles.footer}>
          <h4>Advertiser Disclosure</h4>
          <p>
            SeniorSimple is an independent, advertising-supported publisher
            and is <strong>not</strong> an insurance company or agency. When
            you request quotes, we connect you with licensed third-party
            partners who may compensate us, which may affect which offers
            appear and their order. A quote request is required; rates and
            approval are determined by the insurer.
          </p>
          <p className={styles.fineprint} id="fn1">
            ¹ Median annual savings among drivers who switched, based on a
            2025 Consumer Reports national survey. Individual results vary by
            state, driving record, coverage level, and insurer; savings are
            not guaranteed.
          </p>
          <div className={styles.footlinks}>
            <a href="#">About Us</a>
            <a href="#">Editorial Guidelines</a>
            <a href="#">How We Make Money</a>
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Use</a>
            <a href="#">Do Not Sell My Information</a>
            <a href="#">Contact</a>
          </div>
          <p className={styles.entity}>
            SeniorSimple · The Simple Life™ · A property of Simple Media
            Network. © 2026 Simple Media Network.
          </p>
        </footer>
      </div>
    </div>
  );
}
