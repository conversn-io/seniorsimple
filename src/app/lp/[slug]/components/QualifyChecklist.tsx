/**
 * B3 · QualifyChecklist — checkmark benefit list with optional "point" line.
 *
 * Mirrors the "3 simple requirements" pattern from senior-native winners —
 * but framed as an HONEST fit-check ("it's worth a look if..."), not a
 * fake gate. The only allowed emoji are ✅ (baked into the list style)
 * and 👉 (the point pointer).
 */

import styles from '../advertorial.module.css';

interface QualifyChecklistProps {
  /** Optional intro sentence before the list. */
  intro?: React.ReactNode;
  items: React.ReactNode[];
  /** Trailing "👉 See what a membership unlocks »" line — blue + bold sans. */
  pointLabel?: React.ReactNode;
}

export default function QualifyChecklist({
  intro,
  items,
  pointLabel,
}: QualifyChecklistProps) {
  return (
    <>
      {intro ? <p className={styles.p}>{intro}</p> : null}
      <ul className={styles.chk}>
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
      {pointLabel ? (
        <p className={styles.p}>
          <span className={styles.point}>👉 {pointLabel}</span>
        </p>
      ) : null}
    </>
  );
}
