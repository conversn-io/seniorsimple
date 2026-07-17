'use client';

/**
 * D2 · MultiSelectQuiz — pill-row single-answer micro-commitment.
 *
 * Despite the name, this is a single-answer quiz (matches "How often do you
 * eat out?"). The name mirrors the reference; if we later add true
 * multi-select we can accept it via a `mode` prop.
 *
 * Reports the picked option to CtaContext (sub-param). All options route
 * to the offer regardless of pick — micro-commitment only.
 */

import { useState } from 'react';
import styles from './advertorial.module.css';
import { useCtaHref, useSetCtaSelection } from './CtaContext';

export interface QuizOption {
  value: string;
  label: React.ReactNode;
}

interface MultiSelectQuizProps {
  question: React.ReactNode;
  selectionKey: string;
  options: QuizOption[];
  submitLabel: React.ReactNode;
  submitVariant?: 'green' | 'blue';
}

export default function MultiSelectQuiz({
  question,
  selectionKey,
  options,
  submitLabel,
  submitVariant = 'green',
}: MultiSelectQuizProps) {
  const setSelection = useSetCtaSelection();
  const ctaHref = useCtaHref();
  const [selected, setSelected] = useState<string | null>(null);

  const submitClassName = [
    styles.cta,
    submitVariant === 'blue' ? styles.ctaBlue : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div style={{ margin: '16px 0' }}>
      <p className={styles.p}>
        <b>{question}</b>
      </p>
      <div className={styles.ms} role="radiogroup">
        {options.map((opt) => {
          const isSelected = selected === opt.value;
          const optClassName = [styles.opt, isSelected ? styles.optSelected : '']
            .filter(Boolean)
            .join(' ');
          return (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={isSelected}
              className={optClassName}
              onClick={() => {
                setSelected(opt.value);
                setSelection(selectionKey, opt.value);
              }}
            >
              {opt.label} ➤
            </button>
          );
        })}
      </div>
      <div className={styles.ctaWrap}>
        <a
          className={submitClassName}
          href={ctaHref}
          rel="sponsored nofollow noopener"
          target="_blank"
        >
          {submitLabel}
        </a>
      </div>
    </div>
  );
}
