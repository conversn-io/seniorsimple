'use client';

/**
 * Angle B body — "9 Things Retirees Are Quietly Cutting" (perks_lp_B_listicle.html).
 *
 * v2-optimized composition per the conversion pass:
 *   P1 · MultiSelectQuiz above Section 1 (micro-commitment above the fold)
 *   P1 · BlueAnchor inline links in #1/#5/#6/#7/#9 (offer-relevant sections only)
 *   P1 · ClickableImage on #1/#6/#7/#9 (see TODO below re: real body imagery)
 *   P1 · SectionCTA "See Travel Member Rates »" after Section 7 (mid-page cadence)
 *   P1 · Bolding rule applied to #2–#9 (1–2 phrases/paragraph, benefit-focused)
 *   P2 · QualifyChecklist right after EditorsPick
 *   P2 · TrustBar near EditorsPick — categories, not brand-specific
 *       (verify real brand coverage against the offer's own logo wall before
 *       flipping to specific brand names — compliance guide §5.3 requires
 *       real, sourced trust signals)
 *   P2 · WrapUpList + PrimaryCTA (blue alternate) as the article closer
 *   P3 · StickyCTA mobile-only persistent bar
 *
 * TODO — section body images. No advertorial_body/* images exist in the
 * Supabase media bucket yet; ClickableImage currently points at alternate
 * advertorial_hero variants as visual stand-ins. Batch-generate real
 * section art (image_type='advertorial_body') for:
 *   #1 · everyday-spending (55+ shopping / checkout)
 *   #6 · dining (older adults at a diner / booth)
 *   #7 · travel (older adults with luggage / at counter)
 *   #9 · entertainment (family + grandkids at movies / park)
 * then swap the BODY_IMAGES map below.
 */

import { APC_BRANDS } from '@/lib/advertorial-content';
import type { AngleBodyProps } from './lp-types';
import styles from './advertorial.module.css';
import {
  BlueAnchor,
  ClickableImage,
  EditorsPick,
  LeadIn,
  MultiSelectQuiz,
  QualifyChecklist,
  SavingsBreakdown,
  SavingsCalculator,
  Section,
  SectionCTA,
  StickyCTA,
  TrustBar,
  WrapUpList,
} from './components';

const BODY_IMG_BASE =
  'https://vpysqshhafthuxvokwqj.supabase.co/storage/v1/object/public/media/ai-hero/';
const BODY_IMAGES = {
  everyday: `${BODY_IMG_BASE}advertorial_hero/1783962954923-qdy1h3-0.png`,
  dining: `${BODY_IMG_BASE}advertorial_hero/1783715724515-o1kop7-0.png`,
  travel: `${BODY_IMG_BASE}advertorial_hero/1783739548253-omcezm-1.png`,
  entertainment: `${BODY_IMG_BASE}advertorial_hero/1783739548253-omcezm-2.png`,
} as const;

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

      {/* H1 · SavingsCalculator + H2 · SavingsBreakdown — the primary
          above-the-fold conversion vehicle. Live yearly total → checkout
          CTA (blue full-width) → offer. sub10=calc gets set on any input
          touch so Prismique attributes calc-driven conversions distinctly. */}
      <SavingsCalculator />
      <SavingsBreakdown />

      {/* P1.1 — secondary qualifier below the calculator. Both fire into
          the same outbound URL: quiz → sub6=spend_focus, calc → sub10=calc. */}
      <MultiSelectQuiz
        question="What do you spend the most on?"
        selectionKey="spend_focus"
        options={[
          { value: 'dining', label: 'Dining' },
          { value: 'travel', label: 'Travel' },
          { value: 'groceries', label: 'Groceries' },
          { value: 'everything', label: 'A bit of everything' },
        ]}
        submitLabel="See My Discounts →"
      />

      <Section number={1} title="Paying full price on everyday spending">
        <p className={styles.p}>
          This is <b>the biggest and quietest leak of all</b>. Dining, groceries, travel,
          entertainment, auto, everyday errands — most of it qualifies for member or
          age-based discounts that simply never get claimed, because tracking which
          business offers what is its own chore. Retirees who plug this leak don&apos;t
          spend less on the things they enjoy; they just stop paying the sticker price
          for them. Because it touches nearly every category, it&apos;s{' '}
          <b>usually where the most money is hiding</b> — which is why{' '}
          <BlueAnchor>a single membership that stacks discounts</BlueAnchor> tends to do
          the most work here.
        </p>
        <ClickableImage
          src={BODY_IMAGES.everyday}
          alt="Adults 55+ checking member discounts before an everyday purchase"
          caption="Retirees who check before they spend — not after — are where the savings actually land."
        />
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

      {/* P2.7 — honest fit-check at the highest-intent moment on the page. */}
      <QualifyChecklist
        intro={
          <>
            <b>Is it a fit?</b> It&apos;s worth a look if:
          </>
        }
        items={[
          'You dine out, travel, or shop regularly',
          <>
            You&apos;re <b>55+</b> and want member pricing in one place
          </>,
          "You'll actually check it before you spend",
        ]}
        pointLabel="See what a membership unlocks »"
      />

      {/* P2.8 — TrustBar with REAL APC brand set (per E3 reference).
          Costco/Sam's/InterContinental/Palace = operator-confirmed; the
          rest are from APC's public directory — spot-verify before scaling
          spend (see APC_BRANDS docstring in advertorial-content.ts). */}
      <TrustBar label="Member pricing at brands including:" brands={APC_BRANDS} />

      <Section number={2} title="Subscriptions you forgot you had">
        <p className={styles.p}>
          Streaming services, apps, a magazine that auto-renews, a box you signed up for
          once — <b>the average household quietly pays for several it no longer uses</b>.
          Twenty minutes with a bank statement and a highlighter is often{' '}
          <b>the single highest-dollar hour of the year</b>. Cancel what you don&apos;t
          use; keep what earns its place.
        </p>
      </Section>

      <Section number={3} title="Overpaying on insurance out of loyalty">
        <p className={styles.p}>
          Auto and home insurers count on inertia. <b>Rates drift up for existing
          customers while new-customer pricing stays low</b>, so the reward for staying
          put is often a bigger bill. Re-shopping every year or two — or simply asking
          your carrier to re-quote — is <b>one of the least glamorous and most reliable
          ways retirees cut a fixed cost</b>.
        </p>
      </Section>

      <Section number={4} title="Bank and card fees">
        <p className={styles.p}>
          Monthly maintenance fees, out-of-network ATM charges, and annual fees on cards
          you barely use are <b>small individually and steady in aggregate</b>. Fee-free
          checking and a card that fits how you actually spend can{' '}
          <b>quietly erase a line item you&apos;d stopped noticing years ago</b>.
        </p>
      </Section>

      <Section number={5} title="Brand-name groceries and prescriptions">
        <p className={styles.p}>
          Store brands and generics are frequently <b>the same product in different
          packaging</b>, and the gap is largest on the staples you buy most. On
          prescriptions especially, asking about generics and comparing pharmacy pricing
          can <b>turn a recurring monthly cost into a noticeably smaller one</b>. Worth{' '}
          <BlueAnchor>checking member grocery pricing</BlueAnchor> once, then leaving it
          in your habit.
        </p>
      </Section>

      <Section number={6} title="Dining out at the posted price">
        <p className={styles.p}>
          Eating out is one of retirement&apos;s real pleasures, and there&apos;s no
          reason to give it up — but <b>paying rack rate is optional</b>. Senior menus
          and member rates go unclaimed constantly because you have to ask or carry
          something that flags you for them. <b>Same restaurants, same meals, smaller
          check.</b> Worth{' '}
          <BlueAnchor>checking member restaurant pricing</BlueAnchor> before you sit
          down.
        </p>
        <ClickableImage
          src={BODY_IMAGES.dining}
          alt="Older adults enjoying a meal at a diner"
          caption="Senior menus and member rates rarely make it to the front door — you have to ask."
        />
      </Section>

      <Section number={7} title="Booking travel without member rates">
        <p className={styles.p}>
          Because travel spending is large per transaction, it&apos;s where{' '}
          <b>a single overlooked discount costs the most</b>. Hotels, flights, cruises,
          and rental cars routinely carry member or age-based pricing;{' '}
          <b>checking before you book — rather than after — is the whole game</b>. For
          repeat travelers, <BlueAnchor>the member rates on hotels alone</BlueAnchor>{' '}
          often cover a year of membership.
        </p>
        <ClickableImage
          src={BODY_IMAGES.travel}
          alt="Older adults with luggage checking rates on a phone"
          caption="One well-timed booking often returns more than a full year of member fees."
        />
      </Section>

      {/* P1.4 — mid-page benefit-specific CTA (~600 words since Editor's Pick,
          well past the 150–250-word cadence). */}
      <SectionCTA>See Travel Member Rates »</SectionCTA>

      <Section
        number={8}
        title={<>Utility and phone bills you&apos;ve never questioned</>}
      >
        <p className={styles.p}>
          Providers rarely volunteer their lowest rate. A short call to ask about current
          promotions, a right-sized phone plan, or a lower-tier package you&apos;d never
          miss can <b>shave a recurring bill without changing your day-to-day at all</b>.
        </p>
      </Section>

      <Section number={9} title="Entertainment and outings at full cost">
        <p className={styles.p}>
          Movie tickets, museums, concerts, and the trips to amusement parks with the
          grandkids are <b>loaded with member and age-based discounts that mostly go
          unused</b>. These are also the purchases where <b>it&apos;s easiest to treat
          the family without the day quietly becoming a bigger number than you
          planned</b>. Worth a check for{' '}
          <BlueAnchor>member entertainment pricing</BlueAnchor> before you buy tickets.
        </p>
        <ClickableImage
          src={BODY_IMAGES.entertainment}
          alt="Older adults with grandkids at a family outing"
          caption="Movies, museums, amusement parks — loaded with age-based and member discounts that go unclaimed."
        />
      </Section>

      <Section title="The theme behind all nine">
        <p className={styles.p}>
          Notice what these have in common: <b>none of them ask you to give up anything
          you enjoy</b>. They ask you to stop overpaying for it. That&apos;s why the
          everyday-discount leak at the top of the list matters most — it&apos;s the one
          that repeats across dining, travel, groceries, and outings all at once, which
          is <b>exactly what a single membership is built to handle</b>.
        </p>
      </Section>

      <SectionCTA>See What a Membership Unlocks »</SectionCTA>

      <Section title="Is a paid membership actually worth it?">
        <p className={styles.p}>
          Honest answer: <b>only if you use it</b>. At about $120 a year, a membership
          like American Perks Club pays off quickly for people who check it before they
          spend, and does nothing for people who forget it exists. It&apos;s a tool, not
          a windfall. If your spending already runs through dining, travel, groceries,
          and the occasional outing, it&apos;s worth a look; if it doesn&apos;t, it
          isn&apos;t — and that&apos;s a fine answer too. It&apos;s also worth being
          clear on one thing: this is a private membership service,{' '}
          <b>not a government program</b> and not tied to Social Security or Medicare.
        </p>
      </Section>

      {/* P2.6 — recap closer + full-width primary CTA. Blue alternate against
          the green section CTAs above (guide §Layout — never both variants on
          the same screen; this one is far enough down that the last green
          button is off-screen). */}
      <WrapUpList
        intro={
          <>
            If your spending runs through these categories, one membership stacks them
            all. Worth checking first:
          </>
        }
        items={[
          { label: 'Dining:', anchorText: 'see member restaurant pricing »' },
          { label: 'Travel & hotels:', anchorText: 'check member travel rates »' },
          { label: 'Groceries:', anchorText: 'see everyday member pricing »' },
          { label: 'Entertainment:', anchorText: 'check member entertainment rates »' },
        ]}
        ctaLabel="See All Member Discounts »"
        ctaVariant="blue"
      />

      {/* P3.9 — mobile sticky CTA. Hidden ≥ 900px viewport (see .sticky
          media query in advertorial.module.css). */}
      <StickyCTA>See Member Discounts »</StickyCTA>
    </>
  );
}
