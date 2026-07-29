'use client';

import { useEffect, useMemo, useState } from 'react';
import { FunnelLayout } from './FunnelLayout';
import { ComplianceFooter } from './ComplianceFooter';
import { CtaButton } from './CtaButton';
import { fppAnalytics, type Band, type PriceBucket } from './_lib/analytics';
import { buildCheckoutUrl, IS_CHECKOUT_CONFIGURED } from './_lib/checkoutUrl';
import {
  extractUTMParameters,
  getStoredUTMParameters,
  hasUTMParameters,
  storeUTMParameters,
  type UTMParameters,
} from '@/utils/utm-utils';

const BAND_FROM_SLUG: Record<string, Band> = {
  'ahead-of-most-families': 'Ahead of Most Families',
  'a-few-gaps-to-close': 'A Few Gaps to Close',
  'real-guessing-gap': 'Real Guessing Gap',
};

interface OfferPageProps {
  priceBucket: PriceBucket;
  bandSlug?: string;
}

export function OfferPage({ priceBucket, bandSlug }: OfferPageProps) {
  const band = bandSlug ? BAND_FROM_SLUG[bandSlug] : undefined;
  const [utm, setUtm] = useState<UTMParameters>({});

  useEffect(() => {
    const inbound = extractUTMParameters();
    if (hasUTMParameters(inbound)) storeUTMParameters(inbound);
    setUtm(inbound && hasUTMParameters(inbound) ? inbound : getStoredUTMParameters() ?? {});
    fppAnalytics.offerView(priceBucket, band);
  }, [priceBucket, band]);

  const checkoutHref = useMemo(
    () =>
      buildCheckoutUrl({
        priceBucket,
        band,
        utm: utm as Record<string, string | undefined>,
      }),
    [priceBucket, band, utm],
  );

  function fireCheckoutClick() {
    fppAnalytics.offerCtaClick(priceBucket);
  }

  return (
    <>
      <FunnelLayout topBar="SeniorSimple · The Simple Life">
        <div className="fpp-inner">
          <div className="fpp-eyebrow">The Family Peace Plan&trade;</div>
          <h1>Get Your Family Peace Plan Done This Sunday Afternoon</h1>
          <p className="fpp-dek">
            A guided, watch-anytime system that walks you through organizing the most important information
            your family would ever need — in one calm afternoon. Press play, fill in the most important pages,
            and finally get everything into one simple place.
          </p>
          <div className="fpp-pull">
            Most organizers just hand you more pages to figure out. The Family Peace Plan <b>guides you through
            it</b> — so you actually finish.
          </div>

          <p>
            By Sunday evening, the coffee cup is empty, the pages are filled, and one important thing you&apos;ve
            carried for years is finally handled.
          </p>

          <p className="fpp-lead">
            Before I tell you what&apos;s inside, I need to tell you about the worst filing cabinet I ever saw.
          </p>

          <p>
            It belonged to a man named Bob. Bob wasn&apos;t disorganized — far from it. Thirty-eight years at
            the same company. Never missed a mortgage payment. Raised three kids. Took his wife dancing every
            Friday night. By every measure, Bob had built a beautiful life. The kind of person people describe
            as having &ldquo;everything together.&rdquo;
          </p>

          <p>
            So when his daughter asked me over one Saturday to help &ldquo;find a few papers,&rdquo; I figured
            we&apos;d be done in an hour. We opened one drawer. Then another. Envelopes from fifteen years ago.
            Expired insurance cards. A deed to a house he&apos;d sold twenty years earlier. Six notebooks. A safe
            nobody had the combination to. And somewhere, mixed into all of it, were the documents his family
            actually needed.
          </p>

          <p>
            His daughter looked at me — half laughing, half crying — and said something I&apos;ll never forget.
            &ldquo;Dad knew where everything was.&rdquo; She paused. &ldquo;We don&apos;t.&rdquo;
          </p>

          <div className="fpp-pull">
            The problem was never missing documents. Everything existed. The problem was missing directions.
          </div>

          <h2>What a will can&apos;t tell your family</h2>
          <p>
            Here&apos;s what almost nobody realizes. A will is important. So is life insurance. But those
            documents tell your family <b>who</b> gets what. They never tell them <b>where</b> anything is —
            or what to do first.
          </p>

          <p>And those are the questions families actually ask first:</p>

          <div className="fpp-qlist">
            <div>Where&apos;s the Medicare card?</div>
            <div>Which bank has the checking account?</div>
            <div>Who insures the house?</div>
            <div>Who has the spare key?</div>
            <div>What bills are on automatic payment?</div>
            <div>Where are the passwords?</div>
          </div>

          <p>
            A will can&apos;t answer those. Your attorney usually can&apos;t. Your financial advisor probably
            can&apos;t. Only one person can. <b>You.</b> And that&apos;s exactly why loving families spend days
            — sometimes weeks — piecing together information that could have been written down in a single
            afternoon.
          </p>

          <p>
            Families don&apos;t panic because someone forgot to plan. They panic because they have to <i>guess.</i>
            {' '}And every guess carries a cost — hours, stress, and sometimes tension between people who love
            each other. I started calling that space the <b>Guessing Gap&trade;.</b>
          </p>

          <h2>Why getting organized never seems to happen</h2>
          <p>
            It isn&apos;t because people don&apos;t care. It&apos;s because they picture it taking weeks —
            boxes everywhere, the dining table covered for days. So they promise to start &ldquo;later.&rdquo;
            But here&apos;s what surprises everyone who finally does it: the hardest part isn&apos;t filling
            it out. The hardest part is opening the cover. After that, it&apos;s just one page, one section,
            one small win at a time. No legal language. No computer. No app. No password to remember.
          </p>

          <h2>Introducing The Family Peace Plan&trade;</h2>
          <p>
            It isn&apos;t another planner, a stack of legal forms, or a blank workbook you have to figure out
            alone. It&apos;s a <b>guided system</b>: a large-print, 12-section workbook <b>plus a watch-anytime
            video walkthrough</b> — the Sunday Afternoon Method — that sits beside you and walks you through
            it, one page at a time. Press play, and we do it together. The Sunday Afternoon Method&trade; isn&apos;t
            a class to attend — it&apos;s a calm afternoon you spend with us. Think of it as the map that goes
            with your life: a will tells people what you wanted; the Family Peace Plan helps them know where
            everything is.
          </p>

          <div className="fpp-steps">
            <div className="fpp-how">How it works</div>
            <div className="fpp-step">
              <span className="fpp-step-n">1</span>
              <span>Press play. The Sunday Afternoon Method guides you, one page at a time.</span>
            </div>
            <div className="fpp-step">
              <span className="fpp-step-n">2</span>
              <span>Fill in the most important pages as we go — at your own pace.</span>
            </div>
            <div className="fpp-step">
              <span className="fpp-step-n">3</span>
              <span>
                Close the cover. Slide it onto the shelf. For the first time in years, your family&apos;s most
                important answers are no longer only in your head.
              </span>
            </div>
            <div className="fpp-friction">
              No live class. No Zoom. No camera. No schedule. No tech setup. Pause anytime, come back anytime.
            </div>
          </div>

          <ul className="fpp-bullets">
            <li>The one page your children may thank you for more than any other.</li>
            <li>Why writing down <i>where</i> your documents are can matter even more than the documents themselves.</li>
            <li>The simple &ldquo;Sunday Afternoon Method&rdquo; that helps most families finish years of procrastination in one relaxed afternoon.</li>
            <li>The one mistake that sends loving families searching the wrong places first.</li>
            <li>Why the real goal isn&apos;t organizing your paperwork — it&apos;s organizing your family&apos;s confidence.</li>
          </ul>

          <div className="fpp-inside">
            <h3>All 12 sections — everything has a place</h3>
            <div className="fpp-inside-row">
              <span className="fpp-inside-ic" aria-hidden>♥</span>
              <span><b>Health &amp; Medical</b> — medications, doctors, and health details on one page.</span>
            </div>
            <div className="fpp-inside-row">
              <span className="fpp-inside-ic" aria-hidden>⚑</span>
              <span><b>Benefits &amp; Coverage</b> — Medicare, Social Security, and insurance in one spot.</span>
            </div>
            <div className="fpp-inside-row">
              <span className="fpp-inside-ic" aria-hidden>💼</span>
              <span><b>Money &amp; Accounts</b> — where every account and document is kept.</span>
            </div>
            <div className="fpp-inside-row">
              <span className="fpp-inside-ic" aria-hidden>☉</span>
              <span><b>Family Wishes</b> — who to call first, and anything you&apos;d like them to know.</span>
            </div>
            <div className="fpp-inside-row">
              <span className="fpp-inside-ic" aria-hidden>+</span>
              <span>
                <b>…and 8 more</b> — Open First, Emergency Contacts, Bills &amp; Household, Home &amp; Utilities,
                Digital Life, Insurance &amp; Advisors, Important Documents, and your Annual Peace Review.
              </span>
            </div>
          </div>

          <div className="fpp-quote">
            <p className="fpp-stars" aria-label="Five stars">★★★★★</p>
            <p>
              &ldquo;I&apos;d been putting this off for years. I sat down one evening and just started. For the
              first time, everything is finally in order — and my kids know where to look.&rdquo;
            </p>
            <span className="fpp-quote-who">
              — Patricia D., verified SeniorSimple reader
              {' '}<span style={{ color: '#B15A3C', fontWeight: 700 }}>[illustrative — replace before publish]</span>
            </span>
          </div>

          <h2>This isn&apos;t about getting organized</h2>
          <p>
            It&apos;s about becoming the person who finally took care of it — the one who, quietly and without
            fuss, made sure the people they love will never have to guess.
          </p>
          <p>
            That&apos;s why the very first page isn&apos;t a form. Before the forms begin, it reminds you why
            you&apos;re doing this: you&apos;re not filling out paperwork, you&apos;re making a promise.
          </p>
          <p>
            And it doesn&apos;t have to be perfect the first time. Every year, one quiet Sunday afternoon can
            become the moment your family&apos;s peace gets updated — a small ritual that keeps the promise kept.
          </p>

          <PeaceOfferCard
            checkoutHref={checkoutHref}
            fireCheckoutClick={fireCheckoutClick}
            checkoutConfigured={IS_CHECKOUT_CONFIGURED}
          />

          <PeaceOfMindPromise />

          <h2>Five years from now</h2>
          <p>
            You won&apos;t remember buying this. But one day, someone you love may quietly pull it off a shelf,
            open it, and find every answer waiting for them — calmly, clearly, in your own handwriting.
            They&apos;ll smile. And they&apos;ll think, &ldquo;They really did think of everything.&rdquo;
            That&apos;s the gift. Not the organizer. The peace.
          </p>

          <p style={{ marginTop: 24 }}>
            Don&apos;t wait for the &ldquo;right time.&rdquo; Sit down this weekend with a cup of coffee and a
            pen — and finally close your family&apos;s Guessing Gap.
          </p>

          <div style={{ textAlign: 'center', marginTop: 22 }}>
            <CtaButton
              href={checkoutHref}
              size="lg"
              onFire={fireCheckoutClick}
            >
              Get My Family Peace Plan →
            </CtaButton>
          </div>
        </div>
      </FunnelLayout>
      <div className="fpp">
        <ComplianceFooter>
          Patricia D. is illustrative of the experience the Family Peace Plan is designed to provide; replace
          with a verified customer story before publishing. The Family Peace Plan is
          an organizational tool. It is not legal, financial, tax, or medical advice, and it is not a will or
          a substitute for one — consult the appropriate licensed professional for those matters. Value
          figures reflect standalone pricing of the components and are shown for comparison. Any resources
          referenced connect you with SeniorSimple&apos;s help line at no cost and with no obligation. © SeniorSimple.
        </ComplianceFooter>
      </div>
    </>
  );
}

/**
 * Offer card. Per the 2026-07-08 decision, the Next.js page does NOT show a
 * hard price — the value stack + anchor live here, but the price + bump +
 * upsell are revealed on the GHL order form. `checkoutConfigured=false` shows a
 * QA-safe placeholder instead of a dead link.
 */
function PeaceOfferCard({
  checkoutHref,
  fireCheckoutClick,
  checkoutConfigured,
}: {
  checkoutHref: string;
  fireCheckoutClick: () => void;
  checkoutConfigured: boolean;
}) {
  return (
    <div className="fpp-offer">
      <div className="k">Instant access · Watch anytime · Large print</div>
      <div className="ttl">The Family Peace Plan&trade;</div>
      <div className="sub">The complete guided system — done in one calm afternoon.</div>
      <div className="fpp-stack">
        <div className="fpp-stack-li">
          <span>The complete 12-section Family Peace Plan workbook (large print)</span>
          <span className="val">$49</span>
        </div>
        <div className="fpp-stack-li">
          <span>The Sunday Afternoon Method — guided video walkthrough</span>
          <span className="val">$79</span>
        </div>
        <div className="fpp-stack-li">
          <span>Open First page + Completion Checklist</span>
          <span className="val">$15</span>
        </div>
        <div className="fpp-stack-li">
          <span>The Family Letter template</span>
          <span className="val">$19</span>
        </div>
        <div className="fpp-stack-li">
          <span>The Annual Peace Review</span>
          <span className="val">$19</span>
        </div>
        <div className="fpp-stack-li free">
          <span>BONUS: 60 Days of The Simple Life Club</span>
          <span className="val">FREE</span>
        </div>
        <div className="fpp-tot">
          <span>Total value</span>
          <span>$181</span>
        </div>
      </div>
      {/* Per handoff (2026-07-08): price lives on the GHL order form, not here.
          The offer page shows value + anchor; the CTA hands off to GHL. */}
      <div style={{ margin: '10px 0 12px', color: '#CFE0E6', fontSize: 13 }}>
        Get everything above for a single one-time payment on the next page.
      </div>
      <CtaButton
        href={checkoutHref}
        size="lg"
        onFire={fireCheckoutClick}
      >
        Get My Family Peace Plan →
      </CtaButton>
      <div className="fpp-guar-badge">60-day peace-of-mind guarantee · No obligation, ever</div>
      {!checkoutConfigured && (
        <div style={{ marginTop: 12, fontSize: 12, color: '#F0B37E' }}>
          NEXT_PUBLIC_FPP_CHECKOUT_URL not set — CTA is a placeholder. Wire the GHL order-form URL to go live.
        </div>
      )}
      <div className="fpp-bumps">
        <div className="fpp-bump">
          <span className="chk" aria-hidden>☐</span>
          <span>
            <b>Prefer paper? Add the printed Family Peace Plan on the next page.</b> Professionally printed,
            large-print, and shipped to your door — so you can fill it out by hand and keep it somewhere your
            family can find.
          </span>
        </div>
      </div>
    </div>
  );
}

function PeaceOfMindPromise() {
  return (
    <div className="fpp-guarantee">
      <h3>The Peace of Mind Promise</h3>
      <p>
        Get it. Fill it out. Talk with your family. If you don&apos;t feel more prepared after finally seeing
        everything gathered in one place, tell us any time in the next 60 days and we&apos;ll refund every
        penny — and you keep the organizer. The only thing you can&apos;t get back is another year of &ldquo;I
        really should.&rdquo; This is how we make sure you never risk a dime to find out how good it feels to
        have it done.
      </p>
    </div>
  );
}
