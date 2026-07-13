/**
 * E2 · Rating — star display with attribution.
 *
 * COMPLIANCE (style guide §5.3): only render with a real, sourced aggregate
 * rating. `attribution` is REQUIRED at the type level — no "4.8 from 2,487
 * reviews" without a citation. If the rating is unverifiable, omit this
 * component.
 */

import styles from '../advertorial.module.css';

interface RatingProps {
  /** 0–5. Filled = ★, empty = ☆. Fractional values round down. */
  starsFilled: number;
  /** Citation — required, e.g. "Based on 412 Trustpilot member reviews". */
  attribution: React.ReactNode;
}

export default function Rating({ starsFilled, attribution }: RatingProps) {
  const filled = Math.max(0, Math.min(5, Math.floor(starsFilled)));
  const empty = 5 - filled;
  return (
    <>
      <p className={styles.stars} aria-label={`${filled} out of 5 stars`}>
        {'★'.repeat(filled)}
        {'☆'.repeat(empty)}
      </p>
      <p className={styles.rev}>{attribution}</p>
    </>
  );
}
