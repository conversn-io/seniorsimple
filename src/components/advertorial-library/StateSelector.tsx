'use client';

/**
 * D3 · StateSelector — dropdown geo qualifier with step indicator.
 *
 * Baseline: <select>. Visual upgrade path noted in the reference: an
 * SVG US map with clickable state paths. Both surface the same
 * onSelect(stateCode) event; swap the render layer, keep the wiring.
 *
 * Reports the picked state to CtaContext as a sub-param. Renders a
 * BlueAnchor-styled "See the Discounts in My State »" link — user must
 * pick before the link routes them out (otherwise the offer URL loads
 * with an empty state selection param).
 *
 * COMPLIANCE: honest geo qualifier only. No "$219,200" / "vital you act
 * now" claims (guide §5.3).
 */

import { useState } from 'react';
import styles from './advertorial.module.css';
import { useCtaHref, useSetCtaSelection } from './CtaContext';

export interface StateOption {
  /** Two-letter code or state name to send as the sub-param. */
  value: string;
  /** Display label in the dropdown. */
  label: string;
}

interface StateSelectorProps {
  /** Step 1 label (active). */
  step1Label?: React.ReactNode;
  /** Step 2 label (upcoming). */
  step2Label?: React.ReactNode;
  /** Prompt above the dropdown. */
  prompt?: React.ReactNode;
  selectionKey: string;
  options: StateOption[];
  /** Anchor label under the dropdown. */
  ctaLabel: React.ReactNode;
}

export default function StateSelector({
  step1Label = 'Step 1 · Your state',
  step2Label = 'Step 2 · See discounts',
  prompt,
  selectionKey,
  options,
  ctaLabel,
}: StateSelectorProps) {
  const setSelection = useSetCtaSelection();
  const ctaHref = useCtaHref();
  const [selected, setSelected] = useState<string>('');

  return (
    <div style={{ margin: '16px 0' }}>
      <div className={styles.steps}>
        <span className={`${styles.step} ${styles.stepOn}`}>{step1Label}</span>
        <span className={styles.step}>{step2Label}</span>
      </div>
      {prompt ? (
        <p className={styles.p}>
          <b>{prompt}</b>
        </p>
      ) : null}
      <select
        className={styles.stateSelect}
        value={selected}
        onChange={(e) => {
          const val = e.target.value;
          setSelected(val);
          if (val) setSelection(selectionKey, val);
        }}
      >
        <option value="">Select Your State…</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <p style={{ marginTop: 12 }}>
        <a
          href={ctaHref}
          rel="sponsored nofollow noopener"
          target="_blank"
        >
          <b>{ctaLabel}</b>
        </a>
      </p>
    </div>
  );
}
