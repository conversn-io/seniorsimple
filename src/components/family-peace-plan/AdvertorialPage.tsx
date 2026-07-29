'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import { FunnelLayout } from './FunnelLayout';
import { ComplianceFooter } from './ComplianceFooter';
import { CtaButton } from './CtaButton';
import { fppAnalytics } from './_lib/analytics';
import { extractUTMParameters, hasUTMParameters, storeUTMParameters } from '@/utils/utm-utils';

const QUIZ_HREF = '/the-simple-life/family-readiness-check';

export function AdvertorialPage() {
  useEffect(() => {
    const utm = extractUTMParameters();
    if (hasUTMParameters(utm)) storeUTMParameters(utm);
    fppAnalytics.advertorialView();
  }, []);

  return (
    <>
      <FunnelLayout topBar="A SeniorSimple Story · Advertisement">
        <div className="fpp-inner">
          <div className="fpp-eyebrow">The Simple Life</div>
          <h1>The One Question From My Daughter That Made Me Finally Get Organized</h1>
          <p className="fpp-dek">
            For years our whole life lived in three drawers, a shoebox, and my memory. Here&apos;s the simple
            idea that changed it — and gave my kids something more valuable than money: the certainty they&apos;ll
            never have to guess.
          </p>
          <div className="fpp-byline">
            By Carol M., 68 · Shared with the SeniorSimple community
            {' '}<span style={{ color: '#B15A3C', fontWeight: 700 }}>[illustrative — replace before publish]</span>
          </div>

          <div className="fpp-hero-photo">
            <Image
              src="/images/family-peace-plan/hero-carol-organizer.png"
              alt="A retired woman at a sunlit kitchen table, writing in her open Family Peace Plan organizer beside a coffee mug and a framed family photo"
              width={1472}
              height={981}
              sizes="(max-width: 720px) 100vw, 640px"
              priority
            />
          </div>

          <p className="fpp-lead">
            Last spring, my daughter asked me a question that stopped me cold. &ldquo;Mom — if something
            ever happened to you and Dad, would I know where everything is?&rdquo;
          </p>

          <p>I opened my mouth to answer. And nothing came out.</p>

          <p>
            Because the honest answer was no. Our life insurance policy was in a drawer somewhere. The Medicare
            cards were in my purse. The list of my medications was in my head. The Wi-Fi password was on a
            sticky note that had fallen behind the desk. If anything ever came up, my kids would be opening
            every drawer in the house trying to piece it together.
          </p>

          <p>
            I&apos;d been meaning to &ldquo;get organized&rdquo; for about ten years. But every time I sat
            down to do it, it felt like too big a mountain. Where would I even start?
          </p>

          <div className="fpp-pull">
            I didn&apos;t want to leave my family a scavenger hunt. I wanted to leave them a simple map.
          </div>

          <h2>Here&apos;s what almost nobody realizes</h2>
          <p>
            A will is important. So is life insurance. But I learned something that surprised me: those documents
            tell your family <b>who</b> gets what. They never tell them <b>where</b> anything is.
          </p>

          <p>
            And that gap — the space between &ldquo;the documents exist somewhere&rdquo; and &ldquo;my family
            can actually find them&rdquo; — is where all the stress lives. Estate attorneys will tell you the
            same thing: families rarely struggle because a parent didn&apos;t plan. They struggle because they&apos;re
            left <i>guessing.</i> Which account. Which drawer. Which password. Who to call first.
          </p>

          <p>
            I started calling it <b>the Guessing Gap.</b> And once I saw it, I couldn&apos;t un-see it.
          </p>

          <h2>Everything I tried first didn&apos;t stick</h2>
          <p>
            I bought a big empty binder once. It sat on the shelf, still empty, for a year — I never knew what
            to actually put in it. A friend suggested one of those apps, but I didn&apos;t want another password
            to remember, and honestly I don&apos;t love keeping all of that on a computer. I even looked into
            having a lawyer help — wonderful for a will, but a lawyer wasn&apos;t going to help my daughter find
            the safe deposit key or know which account pays the mortgage.
          </p>

          <p>
            What I needed wasn&apos;t complicated. I needed one simple place, in plain large print, where I
            could just write it all down by hand — and clear prompts so I&apos;d never wonder what goes where.
          </p>

          <h2>Then it finally clicked</h2>
          <p>
            I stopped thinking of it as &ldquo;organizing paperwork.&rdquo; I started thinking of it as making
            a <b>Family Peace Plan</b> — one simple place that answers every question my family might one day
            need to ask, so they never have to guess.
          </p>

          <p>
            I sat down at the kitchen table on a Saturday with a cup of coffee and a pen, and I just started
            filling in the blanks, one section at a time. The hardest part wasn&apos;t filling it out. The
            hardest part was opening the cover. By Sunday afternoon, I was done. Ten years of &ldquo;I really
            should&rdquo; — finished in one quiet weekend.
          </p>

          <div className="fpp-inside">
            <h3>What a Family Peace Plan actually holds</h3>
            <div className="fpp-inside-row">
              <span className="fpp-inside-ic" aria-hidden>♥</span>
              <span><b>Health &amp; Medical</b> — your medications, doctors, and important health details, all on one page.</span>
            </div>
            <div className="fpp-inside-row">
              <span className="fpp-inside-ic" aria-hidden>⚑</span>
              <span><b>Benefits &amp; Coverage</b> — your Medicare, Social Security, and insurance, tracked in one spot.</span>
            </div>
            <div className="fpp-inside-row">
              <span className="fpp-inside-ic" aria-hidden>💼</span>
              <span><b>Accounts &amp; Papers</b> — where every account and document is kept, so nothing&apos;s ever lost.</span>
            </div>
            <div className="fpp-inside-row">
              <span className="fpp-inside-ic" aria-hidden>☉</span>
              <span><b>Family &amp; Wishes</b> — the people who matter, who to call first, and anything you&apos;d like them to know.</span>
            </div>
          </div>

          <h2>The best part came later</h2>
          <p>
            A few weeks after, I handed a copy to my daughter. I watched her flip through it, and she got quiet,
            and then she just hugged me. She said, &ldquo;Mom, this is the most thoughtful thing you could have done.&rdquo;
          </p>

          <p>
            That&apos;s when it hit me. This wasn&apos;t a chore I&apos;d finished. It was a gift — the gift of
            not having to guess, not having to scramble, during a hard moment. And a gift to myself, too:
            I finally stopped carrying all of it in my head.
          </p>

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

          <div className="fpp-cta-card">
            <div className="k">Free · 60 seconds · No obligation</div>
            <div className="ttl">How ready is <i>your</i> family?</div>
            <div className="sub">
              Take the free Family Readiness Check and find out where your Guessing Gap is — and get a simple,
              personalized plan to close it, plus The Simple Life weekly letter.
            </div>
            <CtaButton
              href={QUIZ_HREF}
              onFire={fppAnalytics.advertorialCtaClick}
              aria-label="Take the Free Family Readiness Check"
            >
              Take the Free Check →
            </CtaButton>
            <div className="micro">Join 50,000+ readers living the Simple Life</div>
          </div>

          <p style={{ marginTop: 26 }}>
            If you&apos;ve been meaning to do this for years like I was, don&apos;t wait for the &ldquo;right time.&rdquo;
            Take the check, see where your family stands, and start closing the gap this weekend. You&apos;ll
            feel the weight lift — and your family will thank you for it.
          </p>
        </div>
      </FunnelLayout>
      <div className="fpp">
        <ComplianceFooter>
          Advertisement. Carol M. and Patricia D. are illustrative of the experience the Family Peace Plan is
          designed to provide; replace with verified customer stories before publishing.
          The Family Peace Plan is an organizational tool. It is not legal, financial,
          tax, or medical advice, and it is not a will or a substitute for one — consult the appropriate
          licensed professional for those matters. The Family Readiness Check is a free educational
          self-assessment. Any resources referenced connect you with SeniorSimple&apos;s help line at no cost
          and with no obligation. © SeniorSimple.
        </ComplianceFooter>
      </div>
    </>
  );
}
