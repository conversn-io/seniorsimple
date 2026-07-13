'use client';

/**
 * Angle A body — "Senior Discounts in {STATE}" (perks_bridge_lp.html).
 *
 * Editorial listicle with geo personalization: {STATE} token in H1 + "your
 * area" tokens in body. Ported 1:1 from the source HTML — do NOT restyle to
 * a branded font, the native/editorial feel is the whole point.
 */

import type { AngleBodyProps } from './lp-types';
import styles from './perks.module.css';

export default function AngleABody({
  headline,
  headerSrc,
  ctaHref,
  stateName,
  stateArea,
}: AngleBodyProps) {
  return (
    <>
      <h1
        className={styles.h1}
        data-variant-slot="headline"
        dangerouslySetInnerHTML={{
          __html: (headline ?? '').replace('{STATE}', escapeHtml(stateName)),
        }}
      />
      <div className={styles.byline}>By the Editorial Team · Updated this week · 7 min read</div>

      <p className={styles.lead}>
        Ask most retirees where their money actually goes, and it isn&apos;t the mortgage or
        the car payment — it&apos;s the steady drip of everyday spending. Dinner out on a
        Friday, a full grocery cart, a tank of gas, a weekend to see the grandkids. None of
        it feels like much on its own, but it&apos;s the part of the budget that quietly
        decides whether the month feels comfortable or tight.
      </p>

      <p className={styles.p}>
        The good news: a surprising amount of that spending qualifies for discounts that
        adults over 55 simply never claim — often because the savings aren&apos;t
        advertised at the register, and knowing which businesses offer what is its own
        part-time job. Below is a plain-English rundown of where the real everyday savings
        live for older adults in {stateArea}, how each one actually works, and the single
        tool a growing number of people use to stop chasing them one at a time.
      </p>

      {headerSrc ? (
        <img
          className={styles.hero}
          data-variant-slot="header"
          src={headerSrc}
          alt="Adults 55+ checking discounts on a phone while out shopping"
          loading="eager"
          fetchPriority="high"
        />
      ) : null}
      <div className={styles.cap}>
        The habit that separates people who save from people who don&apos;t: checking
        before they spend, not after.
      </div>

      <h2 className={styles.h2}>
        <span className={styles.num}>1.</span> Dining out — the category most people underuse
      </h2>
      <p className={styles.p}>
        Restaurants are where older adults save most often, for the simple reason that
        eating out happens weekly and adds up faster than almost anything else. Plenty of
        sit-down chains and local spots run a senior menu or a members&apos; rate that
        never appears on the front door or the online menu — you have to ask, or carry
        something that flags you for it. A couple that eats out twice a week can quietly
        give back a meaningful slice of that spending over a year without changing where
        they go or what they order.
      </p>
      <p className={styles.p}>
        The catch is consistency. The discount only helps if you remember it exists at the
        moment you&apos;re handed the check — which is exactly why a single place to check
        beats trying to memorize which of a dozen restaurants offers what.
      </p>

      <h2 className={styles.h2}>
        <span className={styles.num}>2.</span> Travel &amp; hotels — where one booking pays for a year
      </h2>
      <p className={styles.p}>
        Travel is the highest-dollar category on this list. Hotels, flights, cruises, and
        rental cars routinely carry member or age-based rates, and because the
        per-transaction amounts are large, a single well-timed booking can return more than
        a full year of what you&apos;d pay to access those rates in the first place. If
        there&apos;s a trip on the calendar — visiting family, a long-postponed vacation,
        even a weekend drive that needs a hotel — this is the first place worth checking
        before you book anything.
      </p>

      <h2 className={styles.h2}>
        <span className={styles.num}>3.</span> Groceries &amp; everyday shopping
      </h2>
      <p className={styles.p}>
        This is the quiet one. Member pricing on groceries, household basics, and the
        pharmacy run rarely feels dramatic in the moment — a few dollars here, a percentage
        there — but it&apos;s attached to the purchases you make most often, so it
        compounds. Over a year, the ordinary cart is where a lot of retirees are surprised
        to find they&apos;ve left the most on the table, precisely because none of it felt
        big enough to notice.
      </p>

      <h2 className={styles.h2}>
        <span className={styles.num}>4.</span> Entertainment &amp; family outings
      </h2>
      <p className={styles.p}>
        Movie tickets, museums, zoos, concerts, and amusement parks — the outings that
        make retirement feel like retirement — are loaded with member and age-based
        discounts that go unclaimed more often than not. These are also the purchases
        where it&apos;s easiest to treat the grandkids without the day quietly turning
        into a bigger number than you planned, if you know to look first.
      </p>

      <div className={styles.pick}>
        <div className={styles.pickTag}>Editor&apos;s Pick · The easiest way to stack all of these</div>
        <p className={styles.pickBody}>
          Chasing each of these separately is the reason most people give up on them. A
          growing number of adults 55+ skip the hunt entirely with{' '}
          <b>American Perks Club</b> — a private membership that unlocks member pricing
          across every category on this page at more than <b>1.5 million locations</b>,
          for <b>$9.99 a month</b>. It puts dining, travel, groceries, entertainment, and
          the rest in one place you can check before you spend. With regular use it tends
          to pay for itself; if it doesn&apos;t fit how you actually spend, it&apos;s an
          easy pass.
        </p>
        <div className={styles.ctaWrap}>
          <a className={styles.cta} href={ctaHref} rel="sponsored nofollow noopener" target="_blank">
            See the Discounts in {stateArea} →
          </a>
        </div>
        <div className={styles.small}>
          Membership pricing. American Perks Club is a third-party service; SeniorSimple
          may be compensated if you join.
        </div>
      </div>

      <h2 className={styles.h2}>
        <span className={styles.num}>5.</span> Auto &amp; fuel — small each time, steady over the year
      </h2>
      <p className={styles.p}>
        Keeping a car on the road is one of the most predictable costs in retirement, and
        it&apos;s quietly discountable. Tires, routine service, oil changes, roadside
        assistance, and everyday fuel programs all show up in member and age-based savings.
        No single visit moves the needle — a few dollars off an oil change, a per-gallon
        break at the pump — but auto and fuel spending is relentless and repeat, and steady
        is exactly what matters when you&apos;re managing a fixed income. This is the
        category people dismiss as too small to bother with, right up until they add up a
        year of it.
      </p>
      <p className={styles.p}>
        It&apos;s also where verifying eligibility is easiest to forget, because
        you&apos;re usually paying in a hurry. Having the discount attached to something
        you already carry removes the friction that makes most people skip it.
      </p>

      <h2 className={styles.h2}>
        <span className={styles.num}>6.</span> Health &amp; wellness — the part insurance doesn&apos;t touch
      </h2>
      <p className={styles.p}>
        A lot of staying well simply isn&apos;t covered by insurance, and that&apos;s where
        this category earns its place. Gym and fitness memberships, wellness and spa
        services, vision and dental discount programs, hearing services, and everyday
        beauty and self-care all commonly carry member or 55+ pricing. One important
        clarification: these are <b>discount programs, not insurance</b> — they lower what
        you pay out of pocket for services you&apos;re choosing to use, and they&apos;re a
        complement to your coverage, never a replacement for it. Used that way, they take
        the sting out of the wellness spending that tends to get cut first when a budget
        gets tight — which is often exactly the spending that keeps people feeling good.
      </p>

      <h2 className={styles.h2}>How these discounts actually work</h2>
      <p className={styles.p}>
        There are really three kinds. Some are <b>age-based at the point of sale</b> — you
        ask, you show ID, you save, and it costs nothing. Some require a{' '}
        <b>membership or card</b> that unlocks pricing the general public doesn&apos;t see.
        And some are <b>online codes or member portals</b> you have to log into before you
        buy. The savings are real in all three cases; the friction is knowing which
        businesses fall into which bucket, and remembering at the moment you&apos;re
        actually spending. That administrative burden — not the discounts themselves — is
        the reason most people leave this money unclaimed, and it&apos;s the specific
        problem a single membership is built to solve.
      </p>

      <div className={styles.ctaWrap}>
        <a className={styles.cta} href={ctaHref} rel="sponsored nofollow noopener" target="_blank">
          See Member Discounts in {stateArea} →
        </a>
      </div>

      <h2 className={styles.h2}>Is a paid membership actually worth it?</h2>
      <p className={styles.p}>
        Here&apos;s the honest math, because it&apos;s the question that matters. At $9.99
        a month, a membership like American Perks Club runs about $120 a year. Whether
        that&apos;s a good deal comes down to one thing and one thing only: do you use it?
        People who build a two-second habit of checking it before they dine out, book a
        trip, or make a larger purchase tend to cover the cost quickly and then some.
        People who sign up and forget it exists get nothing for their money. It isn&apos;t
        a windfall and it isn&apos;t magic — it&apos;s a tool, and a tool only helps the
        person who picks it up.
      </p>
      <p className={styles.p}>
        So the honest filter is simple. If your everyday spending already runs through
        dining, travel, groceries, and the occasional outing, a membership that stacks
        discounts across all of them is worth a look. If you rarely spend in those
        categories, it probably isn&apos;t for you — and that&apos;s a perfectly good
        answer too.
      </p>

      <div className={styles.faq}>
        <h2 className={styles.h2}>Common questions</h2>
        <h3 className={styles.h3}>Is this a government program?</h3>
        <p className={styles.p}>
          No. American Perks Club is a private membership service — not a government
          benefit, and not tied to Social Security or Medicare. Many individual senior
          discounts are free to ask for at the register; a membership like this simply
          gathers them in one place.
        </p>
        <h3 className={styles.h3}>Do I have to pay to get senior discounts?</h3>
        <p className={styles.p}>
          Not for all of them — plenty are free just for asking. The membership is $9.99 a
          month and is for people who&apos;d rather have one place that stacks discounts
          across many categories than track them business by business.
        </p>
        <h3 className={styles.h3}>What if it doesn&apos;t fit how I spend?</h3>
        <p className={styles.p}>
          Then it isn&apos;t for you, and that&apos;s fine. You can browse the categories
          that matter to you first and decide from there; the provider handles membership
          and cancellation on its own terms.
        </p>
      </div>

      <div className={styles.ctaWrap}>
        <a className={styles.cta} href={ctaHref} rel="sponsored nofollow noopener" target="_blank">
          See the Discounts →
        </a>
      </div>
    </>
  );
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
