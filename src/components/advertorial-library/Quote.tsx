/**
 * B4 · Quote — pull-quote with gold left border + attribution.
 *
 * COMPLIANCE (style guide §5.3): only render with a real, attributable
 * member review. `attribution` is REQUIRED at the type level so a
 * fabricated quote can't slip through as a component call with no source.
 * If no verifiable review exists, omit this component — do not fabricate.
 */

import styles from './advertorial.module.css';

interface QuoteProps {
  quote: string;
  /**
   * Attribution — required. e.g. "— Jane R., verified American Perks Club
   * member (Yelp)". No optional prop by design; guide §5.3 bans invented
   * quotes and "Verified" badges on invented ones.
   */
  attribution: React.ReactNode;
}

export default function Quote({ quote, attribution }: QuoteProps) {
  return (
    <blockquote className={styles.quote}>
      &ldquo;{quote}&rdquo;
      <div className={styles.quoteWho}>{attribution}</div>
    </blockquote>
  );
}
