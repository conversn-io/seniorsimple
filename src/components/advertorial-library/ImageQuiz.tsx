'use client';

/**
 * D1 · ImageQuiz — image/icon-tile single-tap qualifier (tap-to-navigate).
 *
 * TAP-TO-NAVIGATE: as of the state_map/tap-to-nav update, tapping any tile
 * navigates immediately to the offer with the choice threaded through
 * CtaContext (sub-slot per `selectionKey`) — no separate submit button. One
 * tap = next page.
 *
 * Legacy `submitLabel` / `submitVariant` props remain accepted for backward
 * compatibility with existing DB rows and PS-00's dispatch layer but are no
 * longer rendered as a separate button. They're preserved on the type so a
 * later revert (should we ever want to reintroduce a submit gate) doesn't
 * require a DB schema change.
 *
 * COMPLIANCE: honest CTAs only. "See My Discounts," never "See If I Qualify
 * For Free."
 */

import styles from './advertorial.module.css';
import { useBuildCtaHref, useSetCtaSelection } from './CtaContext';

export interface ImageQuizOption {
  /** Machine value (routed to Prismique as sub-param). */
  value: string;
  /** Display label. */
  label: React.ReactNode;
  /** Icon (emoji default; production may pass an SVG or an <img>). */
  icon: React.ReactNode;
}

interface ImageQuizProps {
  question: React.ReactNode;
  /**
   * CtaContext key that this quiz reports to. Choose a semantic name (e.g.
   * "discount_category", "policy_need") — the provider maps unique keys to
   * sub6/sub7/... in insertion order.
   */
  selectionKey: string;
  options: ImageQuizOption[];
  /** Retained for prop backward-compat; no longer rendered. */
  submitLabel?: React.ReactNode;
  /** Retained for prop backward-compat; no longer rendered. */
  submitVariant?: 'green' | 'blue';
}

export default function ImageQuiz({
  question,
  selectionKey,
  options,
}: ImageQuizProps) {
  const buildHref = useBuildCtaHref();
  const setSelection = useSetCtaSelection();

  return (
    <div style={{ margin: '20px 0' }}>
      <h2 className={styles.h2} style={{ textAlign: 'center' }}>
        {question}
      </h2>
      <div className={styles.tiles} role="list">
        {options.map((opt) => (
          <a
            key={opt.value}
            role="listitem"
            href={buildHref({ [selectionKey]: opt.value })}
            onClick={() => setSelection(selectionKey, opt.value)}
            rel="sponsored nofollow noopener"
            target="_blank"
            aria-label={typeof opt.label === 'string' ? opt.label : opt.value}
            data-quiz-choice={opt.value}
            className={styles.tile}
          >
            <div className={styles.tileIcon}>{opt.icon}</div>
            <div className={styles.tileLabel}>{opt.label}</div>
          </a>
        ))}
      </div>
    </div>
  );
}
