/**
 * DealsShowcase — "here's a sample of what members see inside" grid.
 *
 * Replaces the bulleted SavingsBreakdown list with a scannable card grid
 * that shows real brand imagery + discount + category. A reader gets the
 * texture of the portal's value in one glance — without needing to
 * click through.
 *
 * COMPLIANCE (style guide §5.3): DEFAULT_DEALS are sourced from APC's
 * live public deals directory and quoted as "current member deal —
 * offers change." Verify at the merchant before checkout. Do NOT
 * fabricate percentages. When APC's directory refreshes, update
 * DEFAULT_DEALS in one place; every render inherits.
 */

import styles from '../advertorial.module.css';
import DealCard, { type Deal } from './DealCard';

interface DealsShowcaseProps {
  /** Author-supplied deal cards. Default is a sourced APC sampling. */
  deals?: Deal[];
  /** Section heading. */
  heading?: React.ReactNode;
  /** Sub-line under the heading. */
  subline?: React.ReactNode;
}

/**
 * Sourced from APC's live public deals directory (see
 * ADVERTORIAL_COMPONENT_LIBRARY_v2.html §H2). Spans 6 categories so a
 * reader sees the breadth of the value in one glance.
 */
export const DEFAULT_DEALS: Deal[] = [
  {
    brand: 'Bealls',
    domain: 'beallsflorida.com',
    discount: 'Up to 70% off',
    category: 'Retail',
  },
  {
    brand: 'HelloFresh',
    domain: 'hellofresh.com',
    discount: '55% off first box',
    category: 'Meal delivery',
  },
  {
    brand: 'Member travel (hotels)',
    domain: 'ihg.com',
    discount: 'Up to 50% off hotels',
    category: 'Travel',
  },
  {
    brand: 'Bass Pro Shops',
    domain: 'basspro.com',
    discount: 'Up to 40% off',
    category: 'Outdoor',
  },
  {
    brand: 'LeafFilter',
    domain: 'leaffilter.com',
    discount: 'Up to 35% off',
    category: 'Home services',
  },
  {
    brand: "Papa John's",
    domain: 'papajohns.com',
    discount: '20% off',
    category: 'Dining',
  },
];

export default function DealsShowcase({
  deals = DEFAULT_DEALS,
  heading = 'A sample of what members see inside',
  subline = 'Current member deals — offers change. Verify at the merchant before checkout.',
}: DealsShowcaseProps) {
  return (
    <section
      className={styles.deals}
      aria-label="Sample deals available to members"
    >
      <div className={styles.dealsHeader}>
        <h2 className={styles.dealsHeading}>{heading}</h2>
        {subline ? <p className={styles.dealsSubline}>{subline}</p> : null}
      </div>
      <div className={styles.dealsGrid}>
        {deals.map((deal) => (
          <DealCard key={`${deal.brand}-${deal.discount}`} {...deal} />
        ))}
      </div>
    </section>
  );
}
