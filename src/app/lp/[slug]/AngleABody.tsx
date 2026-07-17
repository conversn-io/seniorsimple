'use client';

/**
 * Angle A body — "Senior Discounts in {STATE}" (perks_bridge_lp.html).
 *
 * v2-optimized composition (same conversion pass as Angle B, tailored for
 * the geo/local angle):
 *   P1 · ImageQuiz above Section 1 (A/B differentiator vs Angle B's
 *        MultiSelectQuiz — same qualifier question, different modality)
 *   P1 · BlueAnchor inline links in every numbered section (all six are
 *        offer-relevant on this angle)
 *   P1 · ClickableImage on #1 (Dining) / #2 (Travel) / #3 (Groceries) /
 *        #4 (Entertainment) — placeholder body images pending real
 *        advertorial_body/* art
 *   P1 · SectionCTA "See Auto & Fuel Member Rates »" after Section 5
 *        (mid-page cadence — closes the ~500-word gap between EditorsPick
 *        and the next CTA)
 *   P1 · Bolding rule applied across every section
 *   P2 · QualifyChecklist after EditorsPick
 *   P2 · TrustBar next to EditorsPick — categories (compliance-safe)
 *   P2 · WrapUpList + PrimaryCTA closer with all 6 categories + geo CTA
 *   P3 · StickyCTA mobile-only persistent bar
 *
 * Geo personalization preserved throughout: H1 uses {STATE} token, CTA
 * labels + WrapUpList intro use {stateArea} fallback ("your area").
 *
 * TODO — section body images. Same as Angle B: no advertorial_body/*
 * images exist yet, so BODY_IMAGES points at alternate advertorial_hero
 * variants as stand-ins. Batch-generate real section art for:
 *   #1 · dining (older adults at diner / booth — {stateArea} local flavor)
 *   #2 · travel (older adults with luggage / at hotel counter)
 *   #3 · groceries (older adults at grocery register / with cart)
 *   #4 · entertainment (family + grandkids at movies / museum)
 * then swap the BODY_IMAGES map below.
 */

import { APC_BRANDS } from '@/lib/advertorial-content';
import type { AngleBodyProps } from './lp-types';
import styles from '@/components/advertorial-library/advertorial.module.css';
import {
  BlueAnchor,
  ClickableImage,
  EditorsPick,
  ImageQuiz,
  LeadIn,
  QualifyChecklist,
  Section,
  SectionCTA,
  StickyCTA,
  TrustBar,
  WrapUpList,
} from '@/components/advertorial-library';

const BODY_IMG_BASE =
  'https://vpysqshhafthuxvokwqj.supabase.co/storage/v1/object/public/media/ai-hero/';
const BODY_IMAGES = {
  dining: `${BODY_IMG_BASE}advertorial_hero/1783715724515-o1kop7-1.png`,
  travel: `${BODY_IMG_BASE}advertorial_hero/1783739548253-omcezm-0.png`,
  groceries: `${BODY_IMG_BASE}advertorial_hero/1783962954923-qdy1h3-2.png`,
  entertainment: `${BODY_IMG_BASE}advertorial_hero/1783715724515-o1kop7-0.png`,
} as const;

export default function AngleABody({
  headline,
  headerSrc,
  stateName,
  stateArea,
}: AngleBodyProps) {
  const h1 = (headline ?? '').replace('{STATE}', stateName);

  return (
    <>
      <LeadIn
        headline={h1}
        bylineText="By the Editorial Team · Updated this week · 7 min read"
      />

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

      {/* P1.1 — micro-commitment above the fold. Selection persists as
          sub6 on the outbound URL, which points at /bridge/perks where
          the SavingsCalculator + full APC TrustBar live. Advertorial =
          editorial framing + click-through; bridge = conversion vehicle. */}
      <ImageQuiz
        question="Which discounts matter most to you?"
        selectionKey="spend_focus"
        options={[
          { value: 'dining', label: 'Dining', icon: '🍽️' },
          { value: 'travel', label: 'Travel', icon: '✈️' },
          { value: 'groceries', label: 'Groceries', icon: '🛒' },
          { value: 'everything', label: 'A bit of everything', icon: '🏷️' },
        ]}
        submitLabel={<>See My Discounts →</>}
      />

      <Section number={1} title="Dining out — the category most people underuse">
        <p className={styles.p}>
          Restaurants are where older adults save most often, for the simple reason that
          eating out happens weekly and adds up faster than almost anything else. Plenty of
          sit-down chains and local spots run a senior menu or a members&apos; rate that{' '}
          <b>never appears on the front door or the online menu</b> — you have to ask, or
          carry something that flags you for it. A couple that eats out twice a week can{' '}
          <b>quietly give back a meaningful slice of that spending over a year without
          changing where they go or what they order</b>.
        </p>
        <p className={styles.p}>
          The catch is consistency. The discount only helps if you remember it exists at
          the moment you&apos;re handed the check — which is exactly why{' '}
          <b>a single place to check beats trying to memorize which of a dozen restaurants
          offers what</b>. Worth{' '}
          <BlueAnchor>checking member restaurant pricing in {stateArea}</BlueAnchor>{' '}
          before you sit down.
        </p>
        <ClickableImage
          src={BODY_IMAGES.dining}
          alt="Older adults enjoying a meal at a local diner"
          caption="Senior menus and member rates rarely make it to the front door — you have to ask."
        />
      </Section>

      <Section
        number={2}
        title={<>Travel &amp; hotels — where one booking pays for a year</>}
      >
        <p className={styles.p}>
          Travel is <b>the highest-dollar category on this list</b>. Hotels, flights,
          cruises, and rental cars routinely carry member or age-based rates, and because
          the per-transaction amounts are large, <b>a single well-timed booking can return
          more than a full year of what you&apos;d pay to access those rates in the first
          place</b>. If there&apos;s a trip on the calendar — visiting family, a
          long-postponed vacation, even a weekend drive that needs a hotel — this is the
          first place worth checking before you book anything. For repeat travelers,{' '}
          <BlueAnchor>the member rates on hotels alone</BlueAnchor> often cover a year of
          membership.
        </p>
        <ClickableImage
          src={BODY_IMAGES.travel}
          alt="Older adults with luggage checking rates on a phone"
          caption="One well-timed booking often returns more than a full year of member fees."
        />
      </Section>

      <Section number={3} title={<>Groceries &amp; everyday shopping</>}>
        <p className={styles.p}>
          This is <b>the quiet one</b>. Member pricing on groceries, household basics, and
          the pharmacy run rarely feels dramatic in the moment — a few dollars here, a
          percentage there — but it&apos;s attached to the purchases you make most often,
          so it compounds. Over a year, the ordinary cart is where{' '}
          <b>a lot of retirees are surprised to find they&apos;ve left the most on the
          table</b>, precisely because none of it felt big enough to notice. Worth{' '}
          <BlueAnchor>checking member grocery pricing</BlueAnchor> once, then leaving it
          in your habit.
        </p>
        <ClickableImage
          src={BODY_IMAGES.groceries}
          alt="Older adults at a grocery store checkout"
          caption="The everyday cart is where the most quietly-lost dollars hide."
        />
      </Section>

      <Section number={4} title={<>Entertainment &amp; family outings</>}>
        <p className={styles.p}>
          Movie tickets, museums, zoos, concerts, and amusement parks — the outings that
          make retirement feel like retirement — are <b>loaded with member and age-based
          discounts that go unclaimed more often than not</b>. These are also the
          purchases where it&apos;s easiest to <b>treat the grandkids without the day
          quietly turning into a bigger number than you planned</b>, if you know to look
          first. Worth a check for{' '}
          <BlueAnchor>member entertainment pricing in {stateArea}</BlueAnchor> before you
          buy tickets.
        </p>
        <ClickableImage
          src={BODY_IMAGES.entertainment}
          alt="Older adults at a family outing with grandkids"
          caption="Movies, museums, amusement parks — loaded with age-based discounts that go unclaimed."
        />
      </Section>

      <EditorsPick
        tag={<>Editor&apos;s Pick · The easiest way to stack all of these</>}
        ctaLabel={<>See the Discounts in {stateArea} →</>}
        disclosure={
          <>
            Membership pricing. American Perks Club is a third-party service;
            SeniorSimple may be compensated if you join.
          </>
        }
      >
        <p className={styles.p}>
          Chasing each of these separately is the reason most people give up on them. A
          growing number of adults 55+ skip the hunt entirely with{' '}
          <b>American Perks Club</b> — a private membership that unlocks member pricing
          across every category on this page at more than <b>1.5 million locations</b>,
          for <b>$9.99 a month</b>. It puts dining, travel, groceries, entertainment, and
          the rest in one place you can check before you spend. With regular use it tends
          to pay for itself; if it doesn&apos;t fit how you actually spend, it&apos;s an
          easy pass.
        </p>
      </EditorsPick>

      {/* P2.7 — honest fit-check right after the pick. */}
      <QualifyChecklist
        intro={
          <>
            <b>Is it a fit?</b> It&apos;s worth a look if:
          </>
        }
        items={[
          <>You dine out, travel, or shop regularly in {stateArea}</>,
          <>
            You&apos;re <b>55+</b> and want member pricing in one place
          </>,
          "You'll actually check it before you spend",
        ]}
        pointLabel={<>See what a membership unlocks in {stateArea} »</>}
      />

      {/* P2.8 — TrustBar with REAL APC brand set (per E3 reference).
          Costco/Sam's/InterContinental/Palace = operator-confirmed; the
          rest are from APC's public directory — spot-verify before scaling
          spend (see APC_BRANDS docstring in advertorial-content.ts). */}
      <TrustBar label="Member pricing at brands including:" brands={APC_BRANDS} />

      <Section
        number={5}
        title={<>Auto &amp; fuel — small each time, steady over the year</>}
      >
        <p className={styles.p}>
          Keeping a car on the road is one of the most predictable costs in retirement,
          and it&apos;s quietly discountable. Tires, routine service, oil changes,
          roadside assistance, and everyday fuel programs all show up in member and
          age-based savings. No single visit moves the needle — a few dollars off an oil
          change, a per-gallon break at the pump — but{' '}
          <b>steady is exactly what matters when you&apos;re managing a fixed income</b>.
          This is the category people dismiss as too small to bother with,{' '}
          <b>right up until they add up a year of it</b>.
        </p>
        <p className={styles.p}>
          It&apos;s also where verifying eligibility is easiest to forget, because
          you&apos;re usually paying in a hurry. Having the discount attached to something
          you already carry removes the friction that makes most people skip it —{' '}
          <BlueAnchor>see member pricing on tires and roadside</BlueAnchor> before your
          next service.
        </p>
      </Section>

      {/* P1.4 — mid-page benefit-specific CTA. Breaks the ~500-word gap
          between EditorsPick and the next CTA that violated the 150–250-word
          cadence rule. */}
      <SectionCTA>See Auto &amp; Fuel Member Rates »</SectionCTA>

      <Section
        number={6}
        title={<>Health &amp; wellness — the part insurance doesn&apos;t touch</>}
      >
        <p className={styles.p}>
          A lot of staying well simply isn&apos;t covered by insurance, and that&apos;s
          where this category earns its place. Gym and fitness memberships, wellness and
          spa services, vision and dental discount programs, hearing services, and
          everyday beauty and self-care all commonly carry member or 55+ pricing. One
          important clarification: these are <b>discount programs, not insurance</b> —
          they lower what you pay out of pocket for services you&apos;re choosing to use,
          and they&apos;re a complement to your coverage, never a replacement for it.
          Used that way, <b>they take the sting out of the wellness spending that tends
          to get cut first when a budget gets tight</b> — which is often exactly the
          spending that keeps people feeling good.{' '}
          <BlueAnchor>See member wellness pricing</BlueAnchor> before you renew a gym or
          book a service.
        </p>
      </Section>

      <Section title="How these discounts actually work">
        <p className={styles.p}>
          There are really three kinds. Some are <b>age-based at the point of sale</b> —
          you ask, you show ID, you save, and it costs nothing. Some require a{' '}
          <b>membership or card</b> that unlocks pricing the general public doesn&apos;t
          see. And some are <b>online codes or member portals</b> you have to log into
          before you buy. The savings are real in all three cases; the friction is knowing
          which businesses fall into which bucket, and remembering at the moment
          you&apos;re actually spending. That administrative burden — not the discounts
          themselves — is the reason most people leave this money unclaimed, and
          it&apos;s the specific problem a single membership is built to solve.
        </p>
      </Section>

      <SectionCTA>See Member Discounts in {stateArea} »</SectionCTA>

      <Section title="Is a paid membership actually worth it?">
        <p className={styles.p}>
          Here&apos;s the honest math, because it&apos;s the question that matters. At
          $9.99 a month, a membership like American Perks Club runs about $120 a year.
          Whether that&apos;s a good deal comes down to one thing and one thing only:{' '}
          <b>do you use it?</b> People who build a two-second habit of checking it before
          they dine out, book a trip, or make a larger purchase tend to cover the cost
          quickly and then some. People who sign up and forget it exists get nothing for
          their money. It isn&apos;t a windfall and it isn&apos;t magic —{' '}
          <b>it&apos;s a tool, and a tool only helps the person who picks it up</b>.
        </p>
        <p className={styles.p}>
          So the honest filter is simple. <b>If your everyday spending already runs
          through dining, travel, groceries, and the occasional outing</b>, a membership
          that stacks discounts across all of them is worth a look. If you rarely spend
          in those categories, it probably isn&apos;t for you — and that&apos;s a
          perfectly good answer too.
        </p>
      </Section>

      <div className={styles.faq}>
        <h2 className={styles.h2}>Common questions</h2>
        <h3 className={styles.h3}>Is this a government program?</h3>
        <p className={styles.p}>
          No. American Perks Club is a private membership service —{' '}
          <b>not a government benefit</b>, and not tied to Social Security or Medicare.
          Many individual senior discounts are free to ask for at the register; a
          membership like this simply gathers them in one place.
        </p>
        <h3 className={styles.h3}>Do I have to pay to get senior discounts?</h3>
        <p className={styles.p}>
          Not for all of them — plenty are free just for asking. The membership is $9.99 a
          month and is for people who&apos;d rather have{' '}
          <b>one place that stacks discounts across many categories</b> than track them
          business by business.
        </p>
        <h3 className={styles.h3}>What if it doesn&apos;t fit how I spend?</h3>
        <p className={styles.p}>
          Then it isn&apos;t for you, and that&apos;s fine. You can browse the categories
          that matter to you first and decide from there; the provider handles membership
          and cancellation on its own terms.
        </p>
      </div>

      {/* P2.6 — recap closer with all 6 categories (mirrors Angle A's article
          structure). Blue-alternate PrimaryCTA — the last green button is far
          enough above that both aren't on-screen simultaneously. */}
      <WrapUpList
        intro={
          <>
            If your spending in {stateArea} runs through these categories, one membership
            stacks them all. Worth checking first:
          </>
        }
        items={[
          { label: 'Dining:', anchorText: 'see member restaurant pricing »' },
          { label: 'Travel & hotels:', anchorText: 'check member travel rates »' },
          { label: 'Groceries:', anchorText: 'see everyday member pricing »' },
          { label: 'Entertainment:', anchorText: 'check member entertainment rates »' },
          { label: 'Auto & fuel:', anchorText: 'see member auto pricing »' },
          { label: 'Wellness:', anchorText: 'check member wellness rates »' },
        ]}
        ctaLabel={<>See All Discounts in {stateArea} »</>}
        ctaVariant="blue"
      />

      {/* P3.9 — mobile-first persistent CTA. */}
      <StickyCTA>See Discounts in {stateArea} »</StickyCTA>
    </>
  );
}
