/**
 * Tap-quiz variant: age band. 3 tiles per the ship order (§3): 55-65,
 * 66-75, 76+. Each tile is an anchor to the offer with s3=<band>. The
 * band value is a URL-safe slug so it composes cleanly into the tracking
 * URL (55_65, 66_75, 76_plus).
 *
 * Server component — every href is baked in at render time.
 */

import styles from './grid.module.css';
import type { QuizVariantProps } from './types';

interface AgeBand {
  /** Label shown on the tile. */
  label: string;
  /** URL-safe s3 value that lands in the tracking URL. */
  value: string;
}

/**
 * Bands ordered youngest → oldest so the qualifying majority (55-65)
 * gets the first tap target (Fitts' law + reading order). The 76+ band
 * uses the ASCII-safe "76_plus" value to avoid URL-encoding the +.
 */
const AGE_BANDS: readonly AgeBand[] = [
  { label: '55 – 65', value: '55_65' },
  { label: '66 – 75', value: '66_75' },
  { label: '76+', value: '76_plus' },
];

export default function AgeBandTap({ buildOfferUrl }: QuizVariantProps) {
  return (
    <div className={styles.card}>
      <div className={styles.label}>What&apos;s your age?</div>
      <div className={`${styles.grid} ${styles.gridThree}`} role="list">
        {AGE_BANDS.map(({ label, value }) => (
          <a
            key={value}
            role="listitem"
            className={styles.tile}
            href={buildOfferUrl(value)}
            rel="nofollow sponsored"
            data-age={value}
          >
            {label}
          </a>
        ))}
      </div>
      <div className={styles.fineprint}>
        Free · No obligation · Licensed partners
      </div>
    </div>
  );
}
