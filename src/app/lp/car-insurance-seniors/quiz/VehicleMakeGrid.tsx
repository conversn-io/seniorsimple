/**
 * v1 tap-quiz: vehicle-make grid. 8 tiles, each an anchor that ships the
 * visitor to the offer with `s3=<make>` appended by buildOfferUrl.
 *
 * Server component — every href is baked in at render time.
 */

import styles from './grid.module.css';
import type { QuizVariantProps } from './types';

/**
 * Fixed set + order per the ship order (§3). Keep "Other" last so the
 * common makes get the top-left tap targets (Fitts' law) — matters on
 * mobile for the 55+ audience.
 */
const MAKES: readonly string[] = [
  'Toyota',
  'Ford',
  'Honda',
  'Chevrolet',
  'Nissan',
  'Subaru',
  'Jeep',
  'Other',
];

export default function VehicleMakeGrid({ buildOfferUrl }: QuizVariantProps) {
  return (
    <div className={styles.card}>
      <div className={styles.label}>What do you drive?</div>
      <div className={styles.grid} role="list">
        {MAKES.map((make) => (
          <a
            key={make}
            role="listitem"
            className={styles.tile}
            href={buildOfferUrl(make.toLowerCase())}
            rel="nofollow sponsored"
            data-make={make.toLowerCase()}
          >
            {make}
          </a>
        ))}
      </div>
      <div className={styles.fineprint}>
        Free · No obligation · Licensed partners
      </div>
    </div>
  );
}
