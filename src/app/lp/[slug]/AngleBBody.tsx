'use client';

/**
 * Angle B body — "9 Things Retirees Are Quietly Cutting" (perks_lp_B_listicle.html).
 *
 * Numbered retirement listicle, no geo personalization. Composes from the
 * v2 primitives — LeadIn (H1 + byline), hero, numbered Section blocks,
 * Editor's Pick, section CTAs.
 */

import type { AngleBodyProps } from './lp-types';
import styles from './advertorial.module.css';
import {
  EditorsPick,
  LeadIn,
  Section,
  SectionCTA,
} from './components';

export default function AngleBBody({ headline, headerSrc }: AngleBodyProps) {
  return (
    <>
      <LeadIn
        headline={headline ?? ''}
        bylineText="By the Editorial Team · Updated this week · 7 min read"
      />

      <p className={styles.lead}>
        Living well on a fixed income isn&apos;t about one big sacrifice — it&apos;s about
        a handful of small, almost invisible cuts that quietly add up month after month.
        The retirees who feel comfortable rarely earn more than the ones who feel squeezed;
        they&apos;ve just trimmed the leaks the rest of us don&apos;t notice. Here are
        nine of the most common ones, in rough order of how much they tend to give back.
      </p>

      {headerSrc ? (
        <img
          className={styles.hero}
          data-variant-slot="header"
          src={headerSrc}
          alt="Adults 55+ reviewing everyday spending on a phone while out shopping"
          loading="eager"
          fetchPriority="high"
        />
      ) : null}
      <div className={styles.cap}>
        Most of these take minutes to set up once — and keep paying off every month after.
      </div>

      <Section number={1} title="Paying full price on everyday spending">
        <p className={styles.p}>
          This is the biggest and quietest leak of all. Dining, groceries, travel,
          entertainment, auto, everyday errands — most of it qualifies for member or
          age-based discounts that simply never get claimed, because tracking which business
          offers what is its own chore. Retirees who plug this leak don&apos;t spend less on
          the things they enjoy; they just stop paying the sticker price for them. Because
          it touches nearly every category, it&apos;s usually where the most money is hiding.
        </p>
      </Section>

      <EditorsPick
        tag={<>Editor&apos;s Pick · The one that covers most of this list</>}
        ctaLabel={<>See the Member Discounts →</>}
        disclosure={
          <>
            Membership pricing. American Perks Club is a third-party service;
            SeniorSimple may be compensated if you join.
          </>
        }
      >
        <p className={styles.p}>
          Rather than hunt for each discount separately, a growing number of adults 55+
          use <b>American Perks Club</b> — a private membership that unlocks member
          pricing at more than <b>1.5 million locations</b> across dining, travel,
          groceries, entertainment, auto, and wellness, for <b>$9.99 a month</b>. It&apos;s
          the single move that quietly addresses several items on this list at once. With
          regular use it tends to pay for itself; if it doesn&apos;t fit how you spend,
          it&apos;s an easy pass.
        </p>
      </EditorsPick>

      <Section number={2} title="Subscriptions you forgot you had">
        <p className={styles.p}>
          Streaming services, apps, a magazine that auto-renews, a box you signed up for
          once — the average household quietly pays for several it no longer uses. Twenty
          minutes with a bank statement and a highlighter is often the single highest-dollar
          hour of the year. Cancel what you don&apos;t use; keep what earns its place.
        </p>
      </Section>

      <Section number={3} title="Overpaying on insurance out of loyalty">
        <p className={styles.p}>
          Auto and home insurers count on inertia. Rates drift up for existing customers
          while new-customer pricing stays low, so the reward for staying put is often a
          bigger bill. Re-shopping every year or two — or simply asking your carrier to
          re-quote — is one of the least glamorous and most reliable ways retirees cut a
          fixed cost.
        </p>
      </Section>

      <Section number={4} title="Bank and card fees">
        <p className={styles.p}>
          Monthly maintenance fees, out-of-network ATM charges, and annual fees on cards
          you barely use are small individually and steady in aggregate. Fee-free checking
          and a card that fits how you actually spend can quietly erase a line item
          you&apos;d stopped noticing years ago.
        </p>
      </Section>

      <Section number={5} title="Brand-name groceries and prescriptions">
        <p className={styles.p}>
          Store brands and generics are frequently the same product in different packaging,
          and the gap is largest on the staples you buy most. On prescriptions especially,
          asking about generics and comparing pharmacy pricing can turn a recurring monthly
          cost into a noticeably smaller one.
        </p>
      </Section>

      <Section number={6} title="Dining out at the posted price">
        <p className={styles.p}>
          Eating out is one of retirement&apos;s real pleasures, and there&apos;s no reason
          to give it up — but paying rack rate is optional. Senior menus and member rates go
          unclaimed constantly because you have to ask or carry something that flags you for
          them. Same restaurants, same meals, smaller check.
        </p>
      </Section>

      <Section number={7} title="Booking travel without member rates">
        <p className={styles.p}>
          Because travel spending is large per transaction, it&apos;s where a single
          overlooked discount costs the most. Hotels, flights, cruises, and rental cars
          routinely carry member or age-based pricing; checking before you book — rather
          than after — is the whole game.
        </p>
      </Section>

      <Section
        number={8}
        title={<>Utility and phone bills you&apos;ve never questioned</>}
      >
        <p className={styles.p}>
          Providers rarely volunteer their lowest rate. A short call to ask about current
          promotions, a right-sized phone plan, or a lower-tier package you&apos;d never
          miss can shave a recurring bill without changing your day-to-day at all.
        </p>
      </Section>

      <Section number={9} title="Entertainment and outings at full cost">
        <p className={styles.p}>
          Movie tickets, museums, concerts, and the trips to amusement parks with the
          grandkids are loaded with member and age-based discounts that mostly go unused.
          These are also the purchases where it&apos;s easiest to treat the family without
          the day quietly becoming a bigger number than you planned.
        </p>
      </Section>

      <Section title="The theme behind all nine">
        <p className={styles.p}>
          Notice what these have in common: none of them ask you to give up anything you
          enjoy. They ask you to stop overpaying for it. That&apos;s why the everyday-discount
          leak at the top of the list matters most — it&apos;s the one that repeats across
          dining, travel, groceries, and outings all at once, which is exactly what a single
          membership is built to handle.
        </p>
      </Section>

      <SectionCTA>See What a Membership Unlocks →</SectionCTA>

      <Section title="Is a paid membership actually worth it?">
        <p className={styles.p}>
          Honest answer: only if you use it. At about $120 a year, a membership like
          American Perks Club pays off quickly for people who check it before they spend,
          and does nothing for people who forget it exists. It&apos;s a tool, not a windfall.
          If your spending already runs through dining, travel, groceries, and the
          occasional outing, it&apos;s worth a look; if it doesn&apos;t, it isn&apos;t —
          and that&apos;s a fine answer too. It&apos;s also worth being clear on one thing:
          this is a private membership service, not a government program and not tied to
          Social Security or Medicare.
        </p>
      </Section>

      <SectionCTA>See the Member Discounts →</SectionCTA>
    </>
  );
}
