/**
 * E3 · TrustBar — "member pricing at brands including..." logo strip.
 *
 * COMPLIANCE: only use REAL brand marks the offer actually includes. Never
 * imply an endorsement or affiliation that isn't real (style guide §5.3
 * spirit — no fake trust signals).
 */

import styles from '../advertorial.module.css';

interface TrustBarProps {
  /** Leading label, e.g. "Member pricing at brands including:". */
  label?: React.ReactNode;
  /** Brand names to render as logo pills. */
  brands: string[];
}

export default function TrustBar({ label, brands }: TrustBarProps) {
  return (
    <div className={styles.trust}>
      {label ? <span>{label}</span> : null}
      {brands.map((brand) => (
        <span key={brand} className={styles.logo}>
          {brand}
        </span>
      ))}
    </div>
  );
}
