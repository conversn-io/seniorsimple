/**
 * DealCard — visual card showing one sample deal from inside the offer's
 * portal. Bigger logo box than a TrustBar pill (48×48) so the brand
 * mark is a real anchor of the card.
 *
 * COMPLIANCE (style guide §5.3): only render deals sourced from the
 * offer's live public directory. Discounts are quoted as they appear
 * there and framed as "current member deal — offers change." Never
 * invent a percentage.
 */

import { brandLogoSrc } from '@/lib/advertorial-content';
import styles from './advertorial.module.css';

export interface Deal {
  brand: string;
  /** Canonical brand domain — used for the DuckDuckGo favicon fallback. */
  domain: string;
  /** Optional local logo path in public/logos/apc/*. Wins over `domain`. */
  logoPath?: string;
  /** Discount copy — e.g. "Up to 70% off". Quoted verbatim from source. */
  discount: string;
  /** Category chip label — e.g. "Retail", "Dining". */
  category: string;
}

export default function DealCard({
  brand,
  domain,
  logoPath,
  discount,
  category,
}: Deal) {
  const src = brandLogoSrc({ domain, logoPath });
  return (
    <article className={styles.dealCard}>
      <div className={styles.dealCardLogoBox}>
        {src ? (
          <img
            className={styles.dealCardLogo}
            src={src}
            alt={brand}
            loading="lazy"
          />
        ) : null}
      </div>
      <div className={styles.dealCardBody}>
        <div className={styles.dealCardBrand}>{brand}</div>
        <div className={styles.dealCardDiscount}>{discount}</div>
        <div className={styles.dealCardCategory}>{category}</div>
      </div>
    </article>
  );
}
