'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { useMinimalFunnelLayout } from '@/hooks/useMinimalFunnelLayout';
import {
  extractUTMParameters,
  getStoredUTMParameters,
  hasUTMParameters,
  storeUTMParameters,
  type UTMParameters,
} from '@/utils/utm-utils';
import { CtaButton } from './CtaButton';
import { CheckoutModal } from './CheckoutModal';
import { ComplianceFooter } from './ComplianceFooter';
import { fppAnalytics, type PriceBucket } from './_lib/analytics';
import { buildCheckoutUrl, IS_CHECKOUT_CONFIGURED } from './_lib/checkoutUrl';
import { IS_DRAFT_MODE } from './_lib/featureFlag';
import { playfairDisplay } from './_lib/fonts';
import './_lib/tokens.css';

/**
 * Read the $47/$67 price bucket from the URL. GHL owns the split-test —
 * upstream ads and preview links pass `?price_bucket=67` to route into the
 * premium test bucket. Default is 47 (control). Never fabricate 67 client-side.
 */
function readPriceBucket(): PriceBucket {
  if (typeof window === 'undefined') return 47;
  const p = new URLSearchParams(window.location.search).get('price_bucket');
  return p === '67' ? 67 : 47;
}

/**
 * Simple Estate Prep™ (featuring The Family Peace Plan™) — cold-traffic sales
 * letter, v3.1. Copy is verbatim from
 * `_design-refs/family-peace-plan/Simple-Estate-Prep-Letter-v3.1.md`.
 *
 * v3.1 vs v2 (Founder decision 2026-07-16):
 *  - Layered naming: Simple Estate Prep™ = product/doorway, The Family Peace
 *    Plan™ = artifact, Sunday Afternoon Method™ = mechanism.
 *  - Priced comparable-value grid REMOVED. One system, one price, no tote-board.
 *  - Bob is alive: near-miss health scare, recovers, fixes it himself.
 *  - Deliverable framed as GUIDED COMPLETION, not "a PDF." Print-first.
 *  - New sections: status-quo agitation, differentiation (path-not-pages),
 *    guided-completion delivery beat, reader-identification.
 *  - 60-Day Club REMOVED from stack.
 *  - Digital-first imagery: hero + mess + Bob + before/after diagram + "finally"
 *    scene. Printed-binder shots only at the $49 bump.
 *
 * Architecture (unchanged): every CTA opens the GHL 2-step order form in the
 * CheckoutModal. Preconnect + warm-on-hover speed up the first click. Post-
 * purchase pages (OTO 1, Order Confirmation) postMessage the parent from GHL
 * so the modal breaks out to full-page after the form completes.
 */

// -- Reader-identification anchor (used inline). Naming is layered per spec.
const PRODUCT_DOORWAY = 'Simple Estate Prep';
const ARTIFACT = 'Family Peace Plan';

export function SalesLetterPage() {
  useMinimalFunnelLayout({ variant: 'insurance' });

  const [utm, setUtm] = useState<UTMParameters>({});
  const [modalOpen, setModalOpen] = useState(false);
  const [priceBucket, setPriceBucket] = useState<PriceBucket>(47);
  // NOTE: warm-on-hover was removed 2026-07-16 — mounting a hidden GHL iframe
  // on hover was preventing document_idle (see never-idle diagnosis). The
  // preconnect below still saves the DNS/TCP/TLS handshake before first click,
  // which is 80% of the perceived-speed win at 0% of the idle cost.

  useEffect(() => {
    const inbound = extractUTMParameters();
    if (hasUTMParameters(inbound)) storeUTMParameters(inbound);
    setUtm(inbound && hasUTMParameters(inbound) ? inbound : getStoredUTMParameters() ?? {});
    const bucket = readPriceBucket();
    setPriceBucket(bucket);
    fppAnalytics.offerView(bucket);
  }, []);

  const checkoutHref = useMemo(
    () =>
      buildCheckoutUrl({
        priceBucket,
        utm: utm as Record<string, string | undefined>,
      }),
    [priceBucket, utm],
  );

  const handleCtaClick = (e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => {
    const me = e as React.MouseEvent<HTMLAnchorElement>;
    if (me.metaKey || me.ctrlKey || me.shiftKey || me.altKey || me.button === 1) return;
    e.preventDefault();
    fppAnalytics.offerCtaClick(priceBucket);
    setModalOpen(true);
  };

  const ctaProps = {
    onClick: handleCtaClick,
  };

  return (
    <div className={playfairDisplay.variable}>
      <link rel="preconnect" href="https://go.seniorsimple.org" crossOrigin="anonymous" />
      <link rel="dns-prefetch" href="https://go.seniorsimple.org" />

      <div className="fpp fpp-letter">
        {IS_DRAFT_MODE && (
          <div className="fpp-draft-badge">Draft · Not published · Awaiting sign-off</div>
        )}
        <div className="fpp-bar">SeniorSimple · The Simple Life</div>

        <div className="fpp-page">
          <div className="fpp-inner">
            {/* ============ HERO ============ */}
            <div className="fpp-eyebrow">
              {PRODUCT_DOORWAY}&trade; · SeniorSimple · The Simple Life
            </div>
            <h1>Before you hire an estate specialist, get organized first.</h1>
            <p className="fpp-dek">
              The {ARTIFACT}&trade; helps you gather the information your family, attorney, or
              advisor may one day need &mdash; in one calm Sunday afternoon, without legal jargon,
              complicated apps, or another unfinished binder. So when the time comes, no one you
              love ever has to guess.
            </p>

            {/* IMG-1 — ordinary person at sunlit kitchen table, coffee, filling large-print page */}
            <figure className="fpp-photo">
              <Image
                src="/images/family-peace-plan/hero-carol-organizer.png"
                alt="A retiree at a sunlit kitchen table, coffee beside her, calmly filling in a large-print page of her Family Peace Plan"
                width={1472}
                height={981}
                sizes="(max-width: 720px) 100vw, 640px"
                priority
              />
            </figure>

            {/* Disclaimer immediately under hero — per v3.1 compliance spec */}
            <p className="fpp-hero-disclaimer">
              This is not legal advice and does not replace a will, trust, or estate plan. It
              helps you organize the information that makes those conversations easier &mdash;
              and helps your family know where to begin.
            </p>

            <div className="fpp-cta-block">
              <CtaButton href={checkoutHref} size="lg" {...ctaProps}>
                Start My Simple Estate Prep
              </CtaButton>
              <p className="fpp-cta-note">
                $47 one-time &middot; instant access &middot; 60-day Peace of Mind Promise
              </p>
              {!IS_CHECKOUT_CONFIGURED && (
                <p className="fpp-cta-note" style={{ color: '#B15A3C' }}>
                  NEXT_PUBLIC_FPP_CHECKOUT_URL not set &mdash; CTA is a placeholder.
                </p>
              )}
            </div>

            {/* ============ STATUS-QUO AGITATION (NEW in v3.1) ============ */}
            <h2>You already know you need to do this. That&rsquo;s not the problem.</h2>
            <p>The problem is it feels heavy. So it waits.</p>
            <p>
              There are papers in one drawer. Insurance cards in another. Old tax folders in a
              box in the closet. Passwords scribbled on something, somewhere. An attorney&rsquo;s
              card from years ago. A will or a trust that may be current &mdash; or may not be.
            </p>
            <p>And every time you think about pulling it together, the same quiet thought shows up:</p>
            <div className="fpp-antidote" style={{ fontSize: 'clamp(18px, 2.3vw, 22px)' }}>
              &ldquo;I really need to do that one day.&rdquo;
            </div>
            <p>
              So you close the drawer. You&rsquo;ll handle it after the holidays. After the next
              appointment. When life slows down. But life rarely slows down.
            </p>

            {/* IMG-2 — the mess: overstuffed drawer / unsorted envelopes */}
            <figure className="fpp-photo">
              <div className="fpp-photo-placeholder" role="img" aria-label="An honest kitchen counter piled with unsorted envelopes, old folders, and a rubber-banded stack of statements">
                <span className="k">IMG-2 · Pod 2</span>
                <p>The mess &mdash; overstuffed junk drawer or a kitchen counter piled with unsorted envelopes, old folders, rubber-banded statements. Honest, a little chaotic, relatable &mdash; not staged-perfect.</p>
              </div>
            </figure>

            <h2>What it quietly costs to leave it the way it is</h2>
            <p>
              This is the part most people never add up. Leaving it scattered isn&rsquo;t free
              &mdash; it just sends the bill to the people you love, later:
            </p>
            <ul className="fpp-checklist" style={{ listStyle: 'disc', paddingLeft: 26 }}>
              <li style={{ paddingLeft: 0 }}>
                <b>Days, sometimes weeks</b> of their time &mdash; searching drawers, calling
                companies, guessing passwords, waiting on hold &mdash; during a stretch when they
                have the least energy to spare.
              </li>
              <li style={{ paddingLeft: 0 }}>
                <b>Money that didn&rsquo;t need to be spent</b> &mdash; paying a professional by
                the hour to help find what a simple list could have shown them in minutes.
              </li>
              <li style={{ paddingLeft: 0 }}>
                <b>Tension between people who love each other</b> &mdash; not because they don&rsquo;t
                care, but because uncertainty does that to good families.
              </li>
              <li style={{ paddingLeft: 0 }}>
                <b>The weight you keep carrying</b> &mdash; that low hum of &ldquo;I really should,&rdquo;
                every time you open the drawer and close it again.
              </li>
            </ul>
            <p>
              None of it is because anyone failed. It&rsquo;s because the information only lives
              in one place: your head.
            </p>

            {/* ============ MECHANISM: MISSING DIRECTIONS ============ */}
            <h2>The problem is not missing documents. It&rsquo;s missing directions.</h2>
            <p>
              Here&rsquo;s the part that surprises people. Usually, everything <i>exists.</i> The
              insurance exists. The accounts exist. The contacts, the wishes, the documents
              &mdash; all there. Your family just can&rsquo;t find any of it.
            </p>
            <p>
              What&rsquo;s missing was never more paperwork. It&rsquo;s a simple <b>map.</b> You
              can have the address, the destination, even the keys to the car &mdash; but without
              directions, you&rsquo;re still lost.
            </p>
            <p>
              That&rsquo;s what <b>{PRODUCT_DOORWAY}&trade;</b> was built to fix. Let me show you why it works.
            </p>

            {/* ============ BOB (ALIVE — near-miss, recovers, fixes it) ============ */}
            <h2>The worst filing cabinet I ever saw</h2>
            <p>Before I tell you what&rsquo;s inside, I need to tell you about a man named Bob.</p>
            <p>
              Bob wasn&rsquo;t disorganized &mdash; far from it. Thirty-eight years at the same
              company. Never missed a mortgage payment. Raised three kids, coached Little League,
              took his wife dancing every Friday night. The kind of man people describe as having
              everything together.
            </p>

            {/* IMG-3 — Bob portrait, warm, character-not-product */}
            <figure className="fpp-photo">
              <div className="fpp-photo-placeholder" role="img" aria-label="Bob — a warm portrait of a capable ~70-year-old man in an everyday moment">
                <span className="k">IMG-3 · Pod 2</span>
                <p>&ldquo;Bob&rdquo; &mdash; a warm portrait of a capable ~70 man in an everyday moment (garage workbench, or coaching a kid&rsquo;s ball team years ago). Dignified, likable, &ldquo;had it together.&rdquo; Establishes the character, not the product.</p>
              </div>
            </figure>

            <p>
              Then one morning Bob took a fall and spent a few days in the hospital. He&rsquo;s
              fine now &mdash; better than fine. But for about two weeks, while he recovered, his
              family had to step into his life for him: pay the bills, call the insurance
              company, find the policies, reach the attorney.
            </p>
            <p>They couldn&rsquo;t find a thing.</p>
            <p>
              One drawer, then another. Envelopes from fifteen years ago. Expired insurance cards.
              A deed to a house he&rsquo;d sold twenty years earlier. Three checkbooks, six
              notebooks, a safe nobody had the combination to. Somewhere in all of it were the
              documents the family needed <i>that week</i> &mdash; and no map to any of it.
            </p>
            <p>
              His daughter looked at me &mdash; half laughing, half crying, worn out &mdash; and
              said something I&rsquo;ve never forgotten:
            </p>
            <div className="fpp-pull">
              &ldquo;Dad always knew where everything was.&rdquo; She paused. &ldquo;We don&rsquo;t.&rdquo;
            </div>
            <p>
              Here&rsquo;s the good news, and the whole reason I&rsquo;m telling you this. Bob
              recovered. He came home. And the first thing he did &mdash; before anything else
              &mdash; was sit down at that same kitchen table and put it all in one place, so his
              family would never have to scramble like that again.
            </p>
            <p>
              Bob got the warning most families never get in time. You don&rsquo;t need a scare
              to do what Bob did. You just need one quiet afternoon.
            </p>

            {/* ============ GUESSING GAP ============ */}
            <h2>The real enemy has a name: the Guessing Gap&trade;</h2>
            <p>
              Families don&rsquo;t panic because someone forgot to plan. They panic because they
              have to <b>guess.</b> Which bank. Which account. Which attorney. Which password.
              Every guess costs time, money, and calm.
            </p>
            <p>
              The Guessing Gap&trade; is the distance between what <i>you</i> know and what your
              <i> family</i> can actually find.
            </p>

            {/* IMG-4 — BEFORE/AFTER diagram (key custom graphic) */}
            <figure className="fpp-photo">
              <div className="fpp-photo-placeholder" role="img" aria-label="Before-and-after diagram: on the left, scattered icons connected by tangled lines with question marks; on the right, one calm hub with clean lines to each item">
                <span className="k">IMG-4 · Pod 2 (key custom graphic)</span>
                <p><b>BEFORE / AFTER diagram.</b> LEFT &ldquo;Before&rdquo;: scattered icons (drawers, folders, a phone, a key, question marks) with tangled lines. RIGHT &ldquo;After&rdquo;: one calm page/hub with clean lines to each item. Simple, brand teal/gold, senior-legible.</p>
              </div>
            </figure>

            <p>
              Close that gap, and your family has a calm place to begin instead of a mystery to
              solve.
            </p>

            <h2>A will answers &ldquo;who.&rdquo; It doesn&rsquo;t answer &ldquo;where.&rdquo;</h2>
            <p>
              Once the will is done, most people think the important part is handled. A will
              matters. So does life insurance, and a trust. But none of them answer the questions
              your family asks <i>first:</i>
            </p>
            <div className="fpp-questions">
              <p>
                Where&rsquo;s the Medicare card? Which bank has the checking account? Who insures
                the house? Who has the spare key? What&rsquo;s on autopay? Which lawyer did they
                use? Where are the passwords kept?
              </p>
            </div>
            <p>
              A will can&rsquo;t answer one of those. Your attorney usually can&rsquo;t. Only you
              can. {PRODUCT_DOORWAY} doesn&rsquo;t replace your legal documents &mdash; it
              <b> connects</b> them. A map instead of a puzzle.
            </p>

            {/* ============ DIFFERENTIATION (NEW in v3.1) ============ */}
            <h2>Why this is different from anything you&rsquo;ve tried before</h2>
            <p>
              You may have started before. A binder. A spreadsheet. A folder labeled &ldquo;important.&rdquo;
              It didn&rsquo;t stick &mdash; and that wasn&rsquo;t your fault. Here&rsquo;s the
              honest difference:
            </p>

            <h3 style={{ marginTop: 24 }}>What it&rsquo;s <i>not</i>:</h3>
            <ul className="fpp-diff-list fpp-diff-not">
              <li>Not a blank binder that still makes you figure out what goes where.</li>
              <li>Not a will, a trust, or legal advice &mdash; and not a replacement for your attorney.</li>
              <li>Not a complicated app or subscription you have to keep logging into.</li>
              <li>Not a vault that just <i>stores</i> files and leaves the hard part to you.</li>
            </ul>

            <h3 style={{ marginTop: 24 }}>What it <i>is</i>:</h3>
            <ul className="fpp-diff-list fpp-diff-is">
              <li>
                A guided <b>path</b>, not a pile of pages &mdash; it tells you exactly where to
                begin and what comes next.
              </li>
              <li>
                Built around <b>completion</b>, not collection &mdash; the whole design exists to
                get you <i>finished.</i>
              </li>
              <li>
                Organized the way a family actually looks for things &mdash; money, people, home,
                health, documents, digital.
              </li>
              <li>
                Yours in one calm afternoon, by hand or typed &mdash; no class, no schedule, no
                catching up.
              </li>
            </ul>

            <div className="fpp-antidote">
              An empty binder gives you pages. This gives you a <b>path.</b> That&rsquo;s the
              whole difference &mdash; and it&rsquo;s why this one gets finished when the others
              didn&rsquo;t.
            </div>

            <h2>If you&rsquo;ve started before and it stalled, it wasn&rsquo;t you</h2>
            <p>
              It&rsquo;s not that people don&rsquo;t care. It&rsquo;s that they picture <i>weeks</i>
              of it and put it off. The hardest part was never filling it out. <b>The hardest
              part is opening the cover.</b> After that, it&rsquo;s one page, one small win at a
              time. This is built so the opening is easy &mdash; and so you can&rsquo;t fall behind.
            </p>

            {/* ============ SUNDAY AFTERNOON METHOD ============ */}
            <h2>The Sunday Afternoon Method&trade;</h2>
            <p>
              You won&rsquo;t do this alone, and you won&rsquo;t stare at a blank book. A calm,
              watch-anytime walkthrough sits beside you and takes you through it one plain
              question at a time &mdash; like a patient friend at the table. Three unhurried steps:
            </p>
            <ol className="fpp-method-steps">
              <li>
                <span className="fpp-method-num" aria-hidden>1</span>
                <span>
                  <b>Open your workbook.</b> Already organized into the sections your family
                  looks for first. Just start at the first prompt.
                </span>
              </li>
              <li>
                <span className="fpp-method-num" aria-hidden>2</span>
                <span>
                  <b>Fill in what you know.</b> One plain question at a time. Large print, room
                  to write, nothing to perfect before moving on.
                </span>
              </li>
              <li>
                <span className="fpp-method-num" aria-hidden>3</span>
                <span>
                  <b>Finish your first pass.</b> Save it, print it, or add the printed edition
                  later. Either way, your most important answers are no longer only in your head.
                </span>
              </li>
            </ol>
            <p>
              Five minutes today, ten tomorrow, or one quiet afternoon this weekend. No class to
              miss, no schedule to keep.
            </p>

            {/* ============ SINGLE-SYSTEM OFFER — no priced grid (v3.1) ============ */}
            <h2>Everything you get &mdash; one complete system</h2>
            <p>
              When you start today, you get the complete <b>{PRODUCT_DOORWAY}&trade; system,
              featuring The {ARTIFACT}&trade;</b> &mdash; not a pile of add-ons, one integrated
              path from scattered to done:
            </p>
            <ul className="fpp-checklist">
              <li>
                The <b>12-section {ARTIFACT}&trade; workbook</b> &mdash; the heart of it,
                organized the way families actually search.
              </li>
              <li>
                The <b>Sunday Afternoon Method&trade; walkthrough</b> &mdash; the guided companion
                that gets you finished.
              </li>
              <li>
                The <b>Family Map&trade; Quick-Start</b> &mdash; so you close the biggest gaps
                first, without turning the house over.
              </li>
              <li>
                The <b>Open First Page + Family Letter&trade;</b> &mdash; the one page your family
                sees first, in your own words.
              </li>
              <li>
                The <b>Completion Checklist</b> &mdash; so &ldquo;I hope I covered it&rdquo;
                becomes &ldquo;I know what&rsquo;s handled.&rdquo;
              </li>
              <li>
                The <b>Annual Peace Review&trade;</b> &mdash; one quiet afternoon a year keeps it
                current as life changes.
              </li>
            </ul>
            <p>
              One system. One price. No monthly anything, no app to manage, no upsold
              &ldquo;modules.&rdquo;
            </p>

            {/* ============ GUIDED-COMPLETION DELIVERY BEAT (NEW in v3.1) ============ */}
            <p>
              <b>And here&rsquo;s how it works.</b> The moment you start, your complete system is
              ready &mdash; you&rsquo;re <i>guided</i> through it, one plain question at a time,
              so you&rsquo;re never staring at a blank page. Complete it right on your computer,
              or print it and fill it in by hand at the kitchen table &mdash; whichever feels
              easier. Nothing to install. Nothing to keep paying for. And because you keep your
              plan on your own device and in your own home, your information stays entirely yours
              &mdash; we never hold it.
            </p>
            <p style={{ fontStyle: 'italic', color: 'var(--fpp-muted)' }}>
              (Prefer a copy you can hold? A professionally printed, large-print edition in a
              3-ring binder &mdash; shipped to your door &mdash; is available when you check out,
              or anytime after.)
            </p>

            {/* ============ READER IDENTIFICATION (NEW in v3.1) ============ */}
            <h2>If your daughter had to step in tomorrow, would she know where to begin?</h2>
            <p>
              This is what adult children feel before their parents admit it. If someone you love
              had to step in &mdash; even briefly &mdash; would they find a clear place to start,
              or piece your life together one drawer at a time?
            </p>
            <p>
              And it works in your favor <i>now,</i> too. Before you ever sit across from an
              attorney, advisor, or specialist, you walk in prepared &mdash; <i>here&rsquo;s what
              I have, here&rsquo;s where it is, here&rsquo;s what I&rsquo;m unsure about</i>
              &mdash; instead of paying someone by the hour to help you find your own paperwork.
            </p>

            {/* ============ IDENTITY BEAT ============ */}
            <h2>This isn&rsquo;t really about getting organized</h2>
            <p>
              It&rsquo;s about becoming the person who finally took care of it. Quietly, without
              fuss, you made sure the people you love will never have to guess. You built a life,
              raised a family, made the sacrifices. The last thing that life should become is
              confusion. Your family deserves better &mdash; and honestly, so do you.
            </p>

            {/* ============ FUTURE-CAST ============ */}
            <h2>Picture the afternoon it&rsquo;s done</h2>
            <p>
              It&rsquo;s Sunday. Sunlight through the window, coffee beside you, no rushing. One
              section, then another. Before you realize it, everything you&rsquo;ve carried in
              your head for years has a home. You lean back, take a breath, and say the word
              people always say when they finish: <i>&ldquo;Finally.&rdquo;</i>
            </p>

            {/* IMG-5 — the "finally" moment */}
            <figure className="fpp-photo">
              <div className="fpp-photo-placeholder" role="img" aria-label="The same person from the hero image, leaning back with a quiet relieved smile beside a finished page and cup of coffee">
                <span className="k">IMG-5 · Pod 2</span>
                <p>The &ldquo;finally&rdquo; moment &mdash; the same person from the hero, leaning back with a quiet, relieved smile, finished page/coffee on the table. Emotional payoff shot.</p>
              </div>
            </figure>

            {/* ============ HONEST-MATH ANCHOR (no priced grid — v3.1) ============ */}
            <h2>Start today for $47 &mdash; one time</h2>
            <p>
              Here&rsquo;s the honest math. What&rsquo;s it worth to close the Guessing Gap?
              Consider the alternative: the days your family would spend searching, the
              specialist&rsquo;s hourly time you&rsquo;d burn just <i>locating</i> things, the
              weight you&rsquo;d keep carrying in the meantime.
            </p>
            <p>
              Against that, the complete {PRODUCT_DOORWAY} system is <b>$47, one time.</b>
              Instant access, watch anytime, large print, yours to keep. No subscription. No app.
              No waiting for a live class.
            </p>

            <div className="fpp-antidote">
              You don&rsquo;t need to solve your whole life today. You just need a simple place
              to begin.
            </div>

            <div className="fpp-cta-block">
              <CtaButton href={checkoutHref} size="lg" {...ctaProps}>
                Start My Simple Estate Prep
              </CtaButton>
              <p className="fpp-cta-note">
                $47 one-time &middot; instant access &middot; 60-day Peace of Mind Promise
              </p>
            </div>

            {/* ============ GUARANTEE ============ */}
            <div className="fpp-guarantee">
              <h3>The Peace of Mind Promise</h3>
              <p>
                Get it. Fill it out. Talk with your family. If you don&rsquo;t feel more prepared
                after finally seeing everything gathered in one place, tell us any time in the
                next 60 days and we&rsquo;ll refund every penny &mdash; and you keep the
                workbook. The only thing you can&rsquo;t get back is another year of &ldquo;I
                really should.&rdquo;
              </p>
            </div>

            {/* ============ CLOSE ============ */}
            <h2>Five years from now</h2>
            <p>
              You won&rsquo;t remember buying this. But one day, someone you love may open the
              copy you saved and find every answer waiting &mdash; calmly, clearly, in one place.
              They&rsquo;ll smile, and think, <i>&ldquo;They really did think of everything.&rdquo;</i>
            </p>
            <p>
              That&rsquo;s the gift. Not the organizer &mdash; the peace. You&rsquo;ve spent a
              lifetime taking care of everyone else. This takes one quiet afternoon to finally
              set down.
            </p>

            <div className="fpp-cta-block">
              <CtaButton href={checkoutHref} size="lg" {...ctaProps}>
                Start My Simple Estate Prep
              </CtaButton>
              <p className="fpp-cta-note">
                $47 one-time &middot; instant access &middot; 60-day Peace of Mind Promise
              </p>
            </div>
          </div>
        </div>

        <ComplianceFooter>
          {PRODUCT_DOORWAY}&trade; and The {ARTIFACT}&trade; are organizational tools &mdash; not
          legal, financial, tax, or medical advice, and not a will or a substitute for one;
          consult the appropriate licensed professional. They never ask for full account numbers,
          PINs, or passwords &mdash; only where they&rsquo;re kept (for example, where the
          Medicare card is, not the number). Stories shown are illustrative of the experience the
          plan is designed to create. &copy; SeniorSimple &middot; The Simple Life&trade;
        </ComplianceFooter>

        <CheckoutModal
          open={modalOpen}
          src={checkoutHref}
          onClose={() => setModalOpen(false)}
        />
      </div>
    </div>
  );
}
