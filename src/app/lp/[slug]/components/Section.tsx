/**
 * B1 · Section — numbered listicle heading + body.
 *
 * `number` (optional) renders as a teal-tinted numeral prefix ("1.", "2.")
 * per the sparing brand-teal rule in the style guide.
 *
 * Bolding rule (guide §1): 1–2 bold phrases per paragraph. Yellow highlight
 * via <mark> ≤ 1 per section. Authors write content directly inside the
 * component's children.
 */

import styles from '../advertorial.module.css';

interface SectionProps {
  /** Numbered listicle prefix; omit for un-numbered sections. */
  number?: number;
  /** Section title text. */
  title: React.ReactNode;
  children: React.ReactNode;
}

export default function Section({ number, title, children }: SectionProps) {
  return (
    <>
      <h2 className={styles.h2}>
        {typeof number === 'number' ? (
          <span className={styles.num}>{number}.</span>
        ) : null}
        {typeof number === 'number' ? ' ' : null}
        {title}
      </h2>
      {children}
    </>
  );
}
