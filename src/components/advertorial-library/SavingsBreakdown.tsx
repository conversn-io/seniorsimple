/**
 * H2 · SavingsBreakdown — sourced member deals + category estimates.
 *
 * Companion to SavingsCalculator — validates the estimated total by listing
 * the real deals that make it up. Everything here MUST be sourced from
 * APC's live public deals directory; quote as "current member deal, offers
 * change." Do not invent percentages (guide §5.3).
 *
 * Default deals + category estimates are from the v2 reference. Update
 * when APC refreshes their directory.
 */

import styles from './advertorial.module.css';

interface SavingsBreakdownProps {
  /** Deal lines. Author-supplied so this component doesn't hardcode brands. */
  deals?: React.ReactNode[];
  /** Category-level estimate summary line. */
  categoryEstimate?: React.ReactNode;
  /** Section heading above the list. */
  heading?: React.ReactNode;
}

const DEFAULT_DEALS: React.ReactNode[] = [
  <>Bealls — up to <b>70% off</b></>,
  <>HelloFresh — <b>55% off</b> first box</>,
  <>Member travel — up to <b>50% off</b> hotels</>,
  <>Bass Pro Shops — up to <b>40% off</b> · LeafFilter — up to <b>35% off</b></>,
  <>Papa John&apos;s — <b>20% off</b> · Denny&apos;s — <b>15% off</b> · IHOP — <b>10% off</b></>,
];

const DEFAULT_CATEGORY_ESTIMATE = (
  <>
    Category estimate (APC estimator): Dining ~$520 · Entertainment ~$322 ·
    Travel ~$280 · Home ~$131 / yr.
  </>
);

export default function SavingsBreakdown({
  deals = DEFAULT_DEALS,
  categoryEstimate = DEFAULT_CATEGORY_ESTIMATE,
  heading = 'Real member deals right now:',
}: SavingsBreakdownProps) {
  return (
    <section className={styles.breakdown} aria-label="Current member deals">
      <p className={styles.breakdownHeading}>{heading}</p>
      <ul className={styles.chk}>
        {deals.map((deal, i) => (
          <li key={i}>{deal}</li>
        ))}
      </ul>
      <div className={styles.cap}>{categoryEstimate}</div>
      <div className={styles.breakdownFine}>
        Current member deal — offers change. Verify at the merchant before
        checkout.
      </div>
    </section>
  );
}
