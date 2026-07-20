'use client';

/**
 * D2 · MultiSelectQuiz — pill-row single-tap qualifier (tap-to-navigate).
 *
 * Despite the name (kept for continuity with earlier drafts), this is a
 * single-answer quiz that now navigates on the FIRST tap — a user picking
 * "A few times a month" is immediately routed to the offer with that answer
 * threaded through CtaContext. No submit button.
 *
 * `submitLabel` / `submitVariant` retained on the prop shape for backward
 * compatibility with existing DB rows; no longer rendered.
 */

import styles from './advertorial.module.css';
import { useBuildCtaHref, useSetCtaSelection } from './CtaContext';

export interface QuizOption {
  value: string;
  label: React.ReactNode;
}

interface MultiSelectQuizProps {
  question: React.ReactNode;
  selectionKey: string;
  options: QuizOption[];
  /** Retained for prop backward-compat; no longer rendered. */
  submitLabel?: React.ReactNode;
  /** Retained for prop backward-compat; no longer rendered. */
  submitVariant?: 'green' | 'blue';
}

export default function MultiSelectQuiz({
  question,
  selectionKey,
  options,
}: MultiSelectQuizProps) {
  const buildHref = useBuildCtaHref();
  const setSelection = useSetCtaSelection();

  return (
    <div style={{ margin: '16px 0' }}>
      <p className={styles.p}>
        <b>{question}</b>
      </p>
      <div className={styles.ms} role="list">
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
            className={styles.opt}
          >
            {opt.label} ➤
          </a>
        ))}
      </div>
    </div>
  );
}
