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
import { fppAnalytics } from './_lib/analytics';
import { buildCheckoutUrl, IS_CHECKOUT_CONFIGURED } from './_lib/checkoutUrl';
import { IS_DRAFT_MODE } from './_lib/featureFlag';
import { playfairDisplay } from './_lib/fonts';
import './_lib/tokens.css';

/**
 * Family Peace Plan — standalone Direct sales letter (v2 canonical copy).
 * The launch page. Copy is verbatim from
 * `_design-refs/family-peace-plan/Family-Peace-Plan-Sales-Letter-v2.md`.
 *
 * Architecture rule (2026-07-08): commerce lives in GHL. Every CTA is a
 * top-level `<a>` navigating to `NEXT_PUBLIC_FPP_CHECKOUT_URL` with
 * `price_bucket=47` + preserved `utm_*`. NO iframe / popup embed — a
 * cross-origin embed of the GHL form loads but won't accept input.
 */
export function SalesLetterPage() {
  useMinimalFunnelLayout({ variant: 'insurance' });

  const [utm, setUtm] = useState<UTMParameters>({});
  const [modalOpen, setModalOpen] = useState(false);
  const [warmed, setWarmed] = useState(false);
  const warmCheckout = () => setWarmed(true);

  useEffect(() => {
    const inbound = extractUTMParameters();
    if (hasUTMParameters(inbound)) storeUTMParameters(inbound);
    setUtm(inbound && hasUTMParameters(inbound) ? inbound : getStoredUTMParameters() ?? {});
    fppAnalytics.offerView(47);
  }, []);

  const checkoutHref = useMemo(
    () =>
      buildCheckoutUrl({
        priceBucket: 47,
        utm: utm as Record<string, string | undefined>,
      }),
    [utm],
  );

  /**
   * CTA handler. Intercepts left-click on a plain <a> to open the modal iframe.
   * Modifier / right / middle clicks fall through so users can still open the
   * GHL form in a new tab if the modal misbehaves (see CheckoutModal note on
   * the cross-origin risk).
   */
  const handleCtaClick = (e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => {
    const me = e as React.MouseEvent<HTMLAnchorElement>;
    if (me.metaKey || me.ctrlKey || me.shiftKey || me.altKey || me.button === 1) return;
    e.preventDefault();
    fppAnalytics.offerCtaClick(47);
    setModalOpen(true);
  };

  // Handlers spread onto every CTA so hover/focus warms the iframe and click
  // opens the modal. onPointerEnter fires on both mouse hover and touchstart
  // for a small but real head-start on the GHL fetch.
  const ctaProps = {
    onClick: handleCtaClick,
    onPointerEnter: warmCheckout,
    onFocus: warmCheckout,
  };

  return (
    <div className={playfairDisplay.variable}>
      {/*
        Warm the connection to GHL before the first CTA click.
        React 19 hoists these <link> tags into <head>, so they take effect on
        initial load — DNS, TCP, and TLS handshake to go.seniorsimple.org are
        already done by the time the modal iframe requests the page.
      */}
      <link rel="preconnect" href="https://go.seniorsimple.org" crossOrigin="anonymous" />
      <link rel="dns-prefetch" href="https://go.seniorsimple.org" />
      <div className="fpp fpp-letter">
        {IS_DRAFT_MODE && (
          <div className="fpp-draft-badge">Draft · Not published · Awaiting sign-off</div>
        )}
        <div className="fpp-bar">SeniorSimple · The Simple Life</div>
        <div className="fpp-page">
          <div className="fpp-inner">
            <div className="fpp-eyebrow">
              For retirees, parents, and grandparents who&apos;ve ever said, &ldquo;I really need to get all of this organized one day.&rdquo;
            </div>

            <h1>
              The greatest gift you may ever give your family isn&apos;t more money. It&apos;s the certainty they&apos;ll never have to guess.
            </h1>

            <p className="fpp-dek">
              There&apos;s a simple, guided plan that helps you gather everything your loved ones would one day need to find — into one calm place — with a method built for one quiet afternoon. Even if you&apos;ve put it off for years, hate paperwork, or have no idea where to begin. And for the first time, finishing finally feels simple.
            </p>

            <figure className="fpp-photo">
              <Image
                src="/images/family-peace-plan/product-01-hero.png"
                alt="The finished Family Peace Plan open on a kitchen table beside a warm cup of coffee"
                width={1472}
                height={981}
                sizes="(max-width: 720px) 100vw, 640px"
                priority
              />
            </figure>

            <p className="fpp-lead">
              Before I tell you what&apos;s inside, I need to tell you about the worst filing cabinet I ever saw.
            </p>

            <p>
              It belonged to a man named Bob. And Bob wasn&apos;t disorganized — far from it. He&apos;d worked the same company for thirty-eight years, never missed a mortgage payment, raised three kids, coached Little League, and took his wife dancing every Friday night. By every measure, Bob had built a beautiful life. He was the kind of man people describe as having everything together.
            </p>

            <p>
              So when his daughter asked me over one Saturday to help &ldquo;find a few papers,&rdquo; I figured we&apos;d be done in an hour. I couldn&apos;t have been more wrong.
            </p>

            <p>
              We opened one drawer, then another. Envelopes from fifteen years ago. Expired insurance cards. Old tax returns. A deed to a house he&apos;d sold twenty years earlier. Three checkbooks, six notebooks, and a safe nobody had the combination to. And somewhere, mixed into all of it, were the documents his family actually needed.
            </p>

            <p>
              His daughter looked at me — half laughing, half crying — and said something I&apos;ve never forgotten. <i>&ldquo;Dad knew where everything was.&rdquo;</i> She paused. <i>&ldquo;We don&apos;t.&rdquo;</i>
            </p>

            <p>
              That sentence hit me like a truck. Because Bob hadn&apos;t done a single thing wrong. He simply did what millions of loving parents do: he kept everything in his head. It worked beautifully — right up until the day it couldn&apos;t.
            </p>

            <div className="fpp-pull">
              The problem was never missing documents. Everything existed. <b>The problem was missing directions.</b>
            </div>

            <p>
              The insurance policy existed. The investment statements existed. The passwords, the pension paperwork, the attorney&apos;s number, the house title — all of it existed. The family just couldn&apos;t find any of it.
            </p>

            <p>
              Imagine buying the world&apos;s most beautiful 5,000-piece puzzle, then throwing every piece into ten different closets. That&apos;s what happens to most families over forty years. Life doesn&apos;t get complicated overnight. It gets complicated one drawer at a time — one move, one new account, one more password — until eventually nobody knows where anything is. Not even you.
            </p>

            <h2>And that&apos;s when I understood the real problem. It has a name: the Guessing Gap.&trade;</h2>

            <div className="fpp-gap-diagram" role="img" aria-label="The Guessing Gap: the documents exist, but nobody knows where they are, so the family has to guess.">
              <div className="fpp-gap-chip">The documents exist</div>
              <div className="fpp-gap-arrow" aria-hidden>→</div>
              <div className="fpp-gap-chip">Nobody knows where</div>
              <div className="fpp-gap-arrow" aria-hidden>→</div>
              <div className="fpp-gap-chip">The family has to guess</div>
            </div>

            <p>
              Families don&apos;t panic because someone forgot to plan. They panic because they have to <b>guess.</b> Guess which bank. Guess which account. Guess which attorney. Guess which password. And every guess carries a cost — hours, days, sometimes weeks, and sometimes tension between people who love each other. Not because they don&apos;t care. Because uncertainty does that to good people.
            </p>

            <p>
              The Guessing Gap&trade; is the distance between what you know and what your family can actually find. Close it, and your family has a calmer place to begin.
            </p>

            <h2>The mistake almost every family makes</h2>

            <p>
              Most people believe that once the will is done, the important part is handled. A will matters. So does life insurance, and a trust. But none of them answer the questions your family actually asks first:
            </p>

            <div className="fpp-questions">
              <p>Where&apos;s the Medicare card? Which bank has the checking account? Who insures the house? Does Mom have another pension? Who has the spare key? What&apos;s on automatic payment? Which lawyer did they use? Where are the passwords?</p>
            </div>

            <p>
              A will can&apos;t answer one of those. Your attorney usually can&apos;t. Your financial advisor probably can&apos;t. Only one person can. <b>You.</b> And that&apos;s exactly why loving families spend days — sometimes weeks — piecing together information that could have been written down in a single afternoon.
            </p>

            <p>
              The missing piece has never been more paperwork. It&apos;s been a simple <b>map.</b> You can have the address, the destination, even the keys to the car — but without directions, you&apos;re still lost. The Family Peace Plan doesn&apos;t replace your legal documents. It connects them. Instead of leaving the people you love a puzzle, you leave them a map.
            </p>

            <h2>If you&apos;ve started before and it didn&apos;t stick, it wasn&apos;t your fault</h2>

            <p>
              Here&apos;s the honest reason getting organized never seems to happen. It isn&apos;t that people don&apos;t care. It&apos;s that they picture <i>weeks</i> of it — boxes everywhere, the dining table buried for days. So they promise to start &ldquo;later.&rdquo; And later never comes.
            </p>

            <p>
              I&apos;ve watched people buy an empty binder and a fireproof box, start a spreadsheet twice, scribble notes on a legal pad and tuck them in a drawer where no one would ever think to look. Nothing stuck — because nothing told them where to <i>begin.</i> A blank page is the easiest thing in the world to put off.
            </p>

            <p>
              So here&apos;s what surprised me most. The hardest part isn&apos;t filling it out. <b>The hardest part is opening the cover.</b> After that, it&apos;s one page, one section, one small win at a time.
            </p>

            <p>
              That&apos;s the whole reason this is built the way it is — so finishing finally feels simple.
            </p>

            <h2>The Sunday Afternoon Method&trade;</h2>

            <p>
              You won&apos;t do this alone, and you won&apos;t do it staring at a blank book. A calm, watch-anytime walkthrough sits beside you and takes you through it, one plain question at a time — the way a patient friend would if they were at the table with you. No legal language. No live class, no Zoom, no schedule, nothing to set up. You can complete it by hand, or type it online and print it — whichever feels easier.
            </p>

            <p>Three unhurried steps:</p>

            <ol className="fpp-method-steps">
              <li>
                <span className="fpp-method-num" aria-hidden>1</span>
                <span><b>Open your workbook.</b> It&apos;s already organized into the sections your family would look for first. You just begin with the first simple prompt.</span>
              </li>
              <li>
                <span className="fpp-method-num" aria-hidden>2</span>
                <span><b>Fill in what you know.</b> Each page asks one plain question at a time. Large print, room to write, nothing you have to finish perfectly before moving forward.</span>
              </li>
              <li>
                <span className="fpp-method-num" aria-hidden>3</span>
                <span><b>Finish your first pass.</b> Save it, print it, or add the printed edition if you want a copy your family can hold. Either way, your most important answers are no longer only in your head.</span>
              </li>
            </ol>

            <figure className="fpp-photo">
              <Image
                src="/images/family-peace-plan/product-04-openflat.png"
                alt="The Family Peace Plan workbook lying open, showing large-print prompts across two sections"
                width={1472}
                height={981}
                sizes="(max-width: 720px) 100vw, 640px"
              />
            </figure>

            <p>
              There&apos;s no class to miss, no schedule to keep, and no perfect way to do it. You simply make progress, one page at a time — five minutes today, ten tomorrow, or one quiet afternoon this weekend.
            </p>

            <h2>What became clear as we built this</h2>

            <p>
              Families don&apos;t need more blank pages. They need the right prompts, in the right order. The first things people look for are almost always the same: where the money is, who to call, what wishes matter, where the important documents live, and how to reach the digital parts of life. So those became the backbone of the plan — the answers families actually reach for first, on the first pages.
            </p>

            <figure className="fpp-photo">
              <Image
                src="/images/family-peace-plan/product-03-inhands.png"
                alt="Hands filling in a large-print page of the Family Peace Plan beside a cup of coffee"
                width={1472}
                height={981}
                sizes="(max-width: 720px) 100vw, 640px"
              />
            </figure>

            <p>
              This is the moment the plan is designed to create: you sit down expecting another project, but once the first page is open, the next step is obvious. One answer leads to another. Before long, the information that used to live only in your head has a place your family can actually find.
            </p>

            {/* Real-story slot per handoff — placeholder, never rendered as "verified." */}
            {/* PLACEHOLDER: drop 1–2 real customer stories here once sourced —
                outcome-specific, first name + consent, no rating claims. */}

            <p>
              And here&apos;s the part that matters most. This was never really about paper. It&apos;s about how it feels afterward — sleeping a little easier, finally quieting the low hum of <i>&ldquo;I really should,&rdquo;</i> knowing the people you love won&apos;t have to guess. That&apos;s what this is built to deliver. Not information. Peace.
            </p>

            <h2>What you&apos;ll find inside</h2>

            <p>
              Every section was built around one question: <i>what would the people I love wish they knew?</i>
            </p>

            <ul className="fpp-checklist">
              <li>The one page your children may thank you for more than any other.</li>
              <li>Why writing down <b>where</b> your documents are can matter even more than the documents themselves.</li>
              <li>Your accounts and insurance gathered so your family knows where to <i>begin</i> — instead of where to <i>search.</i></li>
              <li>Medical details, medications, and wishes, ready when they&apos;re needed — not after a frantic hunt.</li>
              <li>The people to call first, in order, so no one&apos;s left guessing who knows what.</li>
              <li>Your digital life made findable — with password <i>clues and where-to-find,</i> never the passwords themselves.</li>
              <li>The one page most people find surprisingly emotional to fill in — and are so glad they did.</li>
              <li>Personal wishes and notes that matter just as much as the paperwork.</li>
            </ul>

            <p>Every page has one purpose: to replace uncertainty with clarity.</p>

            <h2>This isn&apos;t really about getting organized</h2>

            <p>
              It&apos;s about becoming the person who finally took care of it. The one who, quietly and without fuss, made sure the people they love will never have to guess. You gave them a map instead of a mystery. Your children and grandchildren will never have to start from scratch on a hard day — because you already thought of it.
            </p>

            <p>
              This is about dignity. You worked hard. You built a life, raised children, paid the mortgages, made the sacrifices. The last thing that life should become is confusion. Your family deserves better — and honestly, so do you.
            </p>

            <h2>Picture the afternoon it&apos;s done</h2>

            <p>
              It&apos;s Sunday. Sunlight through the window, coffee beside you, no rushing. You fill in one section, then another. Before you realize it, everything you&apos;ve carried in your head for years has finally found a home. You lean back, take a breath, and quietly say the word people always say when they finish: <i>&ldquo;Finally.&rdquo;</i>
            </p>

            <p>
              Not because your life suddenly changed. Because something important is no longer unfinished.
            </p>

            <h2>Here&apos;s everything you get — and what it&apos;s honestly worth</h2>

            <p>
              Many families spend hundreds — sometimes thousands — getting the legal side of their affairs in order. And they should. A will, a trust, or an estate plan can matter deeply.
            </p>

            <p>
              But even the best legal documents usually don&apos;t answer the first questions your family may ask: <i>Where is it? Who do we call? What needs attention first?</i>
            </p>

            <p>
              That&apos;s the gap the Family Peace Plan was built to close — not as a replacement for your legal documents, but as the simple map that helps your family actually find and use everything you&apos;ve already put in place.
            </p>

            <figure className="fpp-photo">
              <Image
                src="/images/family-peace-plan/product-02-straighton.png"
                alt="The complete Family Peace Plan workbook, front cover, straight-on"
                width={1472}
                height={981}
                sizes="(max-width: 720px) 100vw, 640px"
              />
            </figure>

            <p>Here&apos;s what&apos;s included today:</p>

            <table className="fpp-value-table" aria-label="What's included and comparable value">
              <tbody>
                <tr>
                  <td>The 12-section <b>Family Peace Plan&trade; workbook</b></td>
                  <td>$49</td>
                </tr>
                <tr>
                  <td>The <b>Sunday Afternoon Method&trade;</b> guided walkthrough</td>
                  <td>$67</td>
                </tr>
                <tr>
                  <td>The <b>Family Map&trade;</b> Quick-Start</td>
                  <td>$19</td>
                </tr>
                <tr>
                  <td>The <b>Open First Page + Family Letter&trade;</b> template</td>
                  <td>$19</td>
                </tr>
                <tr>
                  <td>The <b>Annual Peace Review&trade;</b></td>
                  <td>$17</td>
                </tr>
                <tr className="fpp-value-free">
                  <td><b>60 days of The Simple Life Club</b> <i>(our gift, yours free)</i></td>
                  <td>$10</td>
                </tr>
                <tr className="fpp-value-total">
                  <td>Total comparable value</td>
                  <td>$181</td>
                </tr>
              </tbody>
            </table>

            <p>
              But the point was never to create a big, expensive package. The point was to make this simple enough, calm enough, and affordable enough that people actually take the step. So today, the complete Family Peace Plan is <b>$47, one time.</b> Instant access, watch anytime, large print, yours to keep.
            </p>

            <div className="fpp-price">
              <span className="fpp-price-anchor">Comparable value <s>$181</s></span>
              <span className="fpp-price-big">$47</span>
              <span className="fpp-price-note">One time · instant access · large print</span>
            </div>

            <div className="fpp-antidote">
              You don&apos;t need to solve your whole life today. You just need a simple place to begin.
            </div>

            <div className="fpp-cta-block">
              <CtaButton href={checkoutHref} size="lg" {...ctaProps}>
                Get My Family Peace Plan
              </CtaButton>
              <p className="fpp-cta-note">
                One-time $47 · instant access · 60-day Peace of Mind Promise
              </p>
              {!IS_CHECKOUT_CONFIGURED && (
                <p className="fpp-cta-note" style={{ color: '#B15A3C' }}>
                  NEXT_PUBLIC_FPP_CHECKOUT_URL not set — CTA is a placeholder.
                </p>
              )}
            </div>

            <div className="fpp-guarantee">
              <h3>The Peace of Mind Promise</h3>
              <p>
                Get it. Fill it out. Talk with your family. If you don&apos;t feel more prepared after finally seeing everything gathered in one place, tell us any time in the next 60 days and we&apos;ll refund every penny — and you keep the workbook. The only thing you can&apos;t get back is another year of &ldquo;I really should.&rdquo; This is how we make sure you never risk a dime to find out how good it feels to see your plan finally coming together.
              </p>
            </div>

            <div className="fpp-cta-block">
              <CtaButton href={checkoutHref} size="lg" {...ctaProps}>
                Get My Family Peace Plan
              </CtaButton>
            </div>

            <h2>Five years from now</h2>

            <p>
              You won&apos;t remember buying this. But one day, someone you love may open the copy you saved — or pull the printed edition off the shelf — and find every answer waiting for them, calmly, clearly, in one place. They&apos;ll smile. And they&apos;ll think, <i>&ldquo;They really did think of everything.&rdquo;</i>
            </p>

            <p>
              That&apos;s the gift. Not the organizer — the peace. The certainty that the people you love will never have to guess.
            </p>

            <p>
              You&apos;ve spent a lifetime taking care of everyone else. This is the one thing you&apos;ve probably postponed the longest — and it takes one quiet afternoon to finally set it down. Not out of worry. Just because it feels good to know it&apos;s handled.
            </p>

            <figure className="fpp-photo">
              <Image
                src="/images/family-peace-plan/product-05-shelf.png"
                alt="The finished Family Peace Plan resting on a family bookshelf, ready to be found"
                width={1472}
                height={981}
                sizes="(max-width: 720px) 100vw, 640px"
              />
            </figure>

            <div className="fpp-cta-block">
              <CtaButton href={checkoutHref} size="lg" {...ctaProps}>
                Get My Family Peace Plan
              </CtaButton>
              <p className="fpp-cta-note">
                One-time $47 · instant access · 60-day Peace of Mind Promise
              </p>
            </div>
          </div>
        </div>

        <ComplianceFooter>
          The Family Peace Plan is an organizational tool — not legal, financial, tax, or medical advice, and not a will or a substitute for one; consult the appropriate licensed professional for those. It never asks for full account numbers, PINs, or passwords — only where they&apos;re kept (for example, where the Medicare card is, not the number). Stories shown are illustrative of the experience it&apos;s designed to create. © SeniorSimple · The Simple Life&trade;
        </ComplianceFooter>

        <PostFormBlock checkoutHref={checkoutHref} ctaProps={ctaProps} />

        <CheckoutModal
          open={modalOpen}
          warm={warmed}
          src={checkoutHref}
          onClose={() => setModalOpen(false)}
        />
      </div>
    </div>
  );
}

interface CtaPropsBundle {
  onClick: (e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => void;
  onPointerEnter: () => void;
  onFocus: () => void;
}

function PostFormBlock({
  checkoutHref,
  ctaProps,
}: {
  checkoutHref: string;
  ctaProps: CtaPropsBundle;
}) {
  return (
    <section className="fpp-postform">
      <div className="fpp-inner">
        <div className="fpp-guarantee" style={{ marginTop: 0 }}>
          <h3 style={{ textAlign: 'center' }}>The Peace of Mind Promise</h3>
          <p>
            Get it. Fill it out. Talk with your family. If you don&apos;t feel more prepared after finally seeing everything gathered in one place, tell us any time in the next 60 days and we&apos;ll refund every penny — and you keep the workbook. The only thing you can&apos;t get back is another year of &ldquo;I really should.&rdquo; This is how we make sure you never risk a dime to find out how good it feels to see your plan finally coming together.
          </p>
        </div>

        <div className="fpp-trust-row" role="list" aria-label="Purchase reassurances">
          <div className="fpp-trust-cell" role="listitem">
            <span className="fpp-trust-icon" aria-hidden>♥</span>
            <span className="fpp-trust-label">60-Day Peace of Mind Promise</span>
          </div>
          <div className="fpp-trust-cell" role="listitem">
            <span className="fpp-trust-icon" aria-hidden>🔒</span>
            <span className="fpp-trust-label">Secure checkout · card details never stored</span>
          </div>
          <div className="fpp-trust-cell" role="listitem">
            <span className="fpp-trust-icon" aria-hidden>⏱</span>
            <span className="fpp-trust-label">Instant digital access · watch anytime</span>
          </div>
          <div className="fpp-trust-cell" role="listitem">
            <span className="fpp-trust-icon" aria-hidden>✉</span>
            <span className="fpp-trust-label">No spam · unsubscribe in one click</span>
          </div>
        </div>

        <h2>Questions people ask before they start</h2>
        <div className="fpp-faq">
          <details>
            <summary>Is this a will or a legal document?</summary>
            <p>
              No. The Family Peace Plan is an organizational tool — a simple, guided place to gather where everything is and what your family would need to find. It doesn&apos;t replace a will, a trust, or legal advice; it connects them, so the documents you already have are actually findable. For legal matters, consult the appropriate licensed professional.
            </p>
          </details>
          <details>
            <summary>I&apos;m not &ldquo;techy.&rdquo; Is this hard to use?</summary>
            <p>
              Not at all. It&apos;s built for exactly this. You can fill it in by hand in large print, or type it online and print it — whichever feels easier. There&apos;s no app to install, no login to remember, and no live class or Zoom. A calm, watch-anytime walkthrough guides you one plain question at a time.
            </p>
          </details>
          <details>
            <summary>How long does it take?</summary>
            <p>
              Most people finish a first pass in one quiet afternoon. But you can&apos;t fall behind — five minutes today, ten tomorrow is perfectly fine. Each page asks one simple question at a time, and nothing has to be perfect before you move on.
            </p>
          </details>
          <details>
            <summary>Is my information safe? Do you ask for account numbers or passwords?</summary>
            <p>
              Never. The plan only asks <b>where</b> things are kept — for example, where the Medicare card is, not the number itself. It never asks for full account numbers, PINs, or passwords. You stay in control of the sensitive details; your family simply knows where to look.
            </p>
          </details>
          <details>
            <summary>What exactly do I get for $47?</summary>
            <p>
              The complete Family Peace Plan: the 12-section workbook, the Sunday Afternoon Method&trade; guided walkthrough, the Family Map&trade; Quick-Start, the Open First Page + Family Letter&trade; template, the Annual Peace Review&trade;, and 60 days of The Simple Life Club free. One time, instant access, yours to keep. If you&apos;d like a professionally printed copy shipped to your door, you can add the printed edition for $49 at checkout.
            </p>
          </details>
          <details>
            <summary>What if it&apos;s not right for me?</summary>
            <p>
              You&apos;re covered by the 60-Day Peace of Mind Promise. Fill it out, talk with your family, and if you don&apos;t feel more prepared, tell us any time within 60 days for a full refund — and you keep the workbook. You never risk a dime to find out how it feels to have it done.
            </p>
          </details>
        </div>

        <div className="fpp-cta-block">
          <CtaButton href={checkoutHref} size="lg" {...ctaProps}>
            Get My Family Peace Plan
          </CtaButton>
          <p className="fpp-cta-note">
            One-time $47 · instant access · 60-day Peace of Mind Promise
          </p>
        </div>
      </div>
    </section>
  );
}
