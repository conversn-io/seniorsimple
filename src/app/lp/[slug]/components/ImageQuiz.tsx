'use client';

/**
 * D1 · ImageQuiz — image/icon-tile single-select qualifier.
 *
 * User's selection reports via CtaContext as a sub-param on the outbound
 * offer URL (sub6 by default, then sub7/... in insertion order per
 * CtaProvider). Every option always routes to the offer regardless of
 * selection — this is a micro-commitment qualifier, not a real gate.
 *
 * COMPLIANCE: honest CTAs only. "See My Discounts," never "See If I Qualify
 * For Free."
 */

import { useState } from 'react';
import styles from '../advertorial.module.css';
import { useCtaHref, useSetCtaSelection } from './CtaContext';

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
  /** Submit button label ("See My Discounts →"). */
  submitLabel: React.ReactNode;
  /** Submit button variant. Default blue (matches reference). */
  submitVariant?: 'green' | 'blue';
}

export default function ImageQuiz({
  question,
  selectionKey,
  options,
  submitLabel,
  submitVariant = 'blue',
}: ImageQuizProps) {
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
    <div style={{ margin: '20px 0' }}>
      <h2 className={styles.h2} style={{ textAlign: 'center' }}>
        {question}
      </h2>
      <div className={styles.tiles} role="radiogroup">
        {options.map((opt) => {
          const isSelected = selected === opt.value;
          const tileClassName = [
            styles.tile,
            isSelected ? styles.tileSelected : '',
          ]
            .filter(Boolean)
            .join(' ');
          return (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={isSelected}
              className={tileClassName}
              onClick={() => {
                setSelected(opt.value);
                setSelection(selectionKey, opt.value);
              }}
            >
              <div className={styles.tileIcon}>{opt.icon}</div>
              <div className={styles.tileLabel}>{opt.label}</div>
            </button>
          );
        })}
      </div>
      <div className={styles.center}>
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
