/**
 * DealCard — visual card showing one sample deal from inside the offer's
 * portal. Larger than a TrustBar pill: renders the brand favicon at a
 * meaningful size next to the discount + category chip so a reader can
 * scan "what kinds of deals are in here" without opening a link.
 *
 * COMPLIANCE (style guide §5.3): only render deals sourced from the
 * offer's live public directory. Discounts are quoted as they appear
 * there and framed as "current member deal — offers change." Never
 * invent a percentage.
 */

import styles from '../advertorial.module.css';

export interface Deal {
  brand: string;
  /** Canonical brand domain — used to fetch the favicon. */
  domain: string;
  /** Discount copy — e.g. "Up to 70% off". Quoted verbatim from source. */
  discount: string;
  /** Category chip label — e.g. "Retail", "Dining". */
  category: string;
}

function logoUrl(domain: string): string {
  return `https://icons.duckduckgo.com/ip3/${domain}.ico`;
}

export default function DealCard({ brand, domain, discount, category }: Deal) {
  return (
    <article className={styles.dealCard}>
      <img
        className={styles.dealCardLogo}
        src={logoUrl(domain)}
        alt=""
        loading="lazy"
        width={48}
        height={48}
      />
      <div className={styles.dealCardBody}>
        <div className={styles.dealCardBrand}>{brand}</div>
        <div className={styles.dealCardDiscount}>{discount}</div>
        <div className={styles.dealCardCategory}>{category}</div>
      </div>
    </article>
  );
}
