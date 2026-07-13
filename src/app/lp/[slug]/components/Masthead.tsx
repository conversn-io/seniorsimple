/**
 * A1 · Masthead — "Advertisement" band + wordmark + section label.
 * Native-ad label is required by compliance; the teal wordmark is the only
 * brand hint above the fold. No nav menu, no large logo.
 */

import styles from '../advertorial.module.css';

interface MastheadProps {
  /** Native-ad label text. Default keeps the strict "Advertisement". */
  adLabel?: string;
  /** Publisher wordmark. */
  wordmark?: string;
  /** Section label (right side). */
  section?: string;
}

export default function Masthead({
  adLabel = 'Advertisement',
  wordmark = 'SeniorSimple',
  section = 'Money · Retirement',
}: MastheadProps) {
  return (
    <>
      <div className={styles.adnote}>{adLabel}</div>
      <div className={styles.masthead}>
        <span className={styles.mastheadName}>{wordmark}</span>
        <span className={styles.mastheadSection}>{section}</span>
      </div>
    </>
  );
}
