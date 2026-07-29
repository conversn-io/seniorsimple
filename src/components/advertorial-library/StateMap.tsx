'use client';

/**
 * D4 · StateMap — clickable US map with tap-to-navigate.
 *
 * Replacement for D3 · StateSelector (dropdown → link). Tapping any state
 * navigates immediately to the offer with the state code threaded through
 * CtaContext as sub7 — no separate submit button. Every state is also
 * represented as a labeled abbreviation chip below the map so small states
 * (RI/DE/DC/CT/NJ/MD/MA/NH/VT) are equally tap-friendly on mobile.
 *
 * DIFFERENTIATOR (per PS-00 competitor research): every comparable
 * insurance/final-expense advertorial in the swipe library uses a plain
 * <select> dropdown. A real clickable map is a real differentiator.
 *
 * COMPLIANCE:
 *  - Tap-only (state pick is a discrete select-equivalent, no free text).
 *  - Honest CTA labels; never "you're pre-approved" / "guaranteed" style.
 *
 * SVG source: Wikimedia Commons "Blank US Map (states only).svg" — public
 * domain, derived from US Census cartographic files. See us-map-paths.ts.
 */

import { useCallback, useMemo, useState } from 'react';

import styles from './advertorial.module.css';
import { useBuildCtaHref, useSetCtaSelection } from './CtaContext';
import {
  US_MAP_SHAPES,
  US_MAP_VIEWBOX,
  US_STATE_NAMES,
  type UsMapShape,
} from './us-map-paths';

export interface StateMapProps {
  /** Prompt shown above the map. Optional. */
  prompt?: React.ReactNode;
  /** Bolded label above the map (e.g. "Select Your State"). */
  ctaLabel?: React.ReactNode;
  /** Semantic key routed to CtaContext (locked scheme). Should be 'state'. */
  selectionKey: string;
  /** Optional step-indicator label ("Step 1 · Your state"). */
  stepLabel?: React.ReactNode;
  /** Optional second step label (upcoming), shown muted next to stepLabel. */
  step2Label?: React.ReactNode;
  /**
   * Optional per-tap callback for analytics / attribution. Called with the
   * 2-letter code BEFORE navigation happens (async fire-and-forget). The
   * dispatch layer wires this to `fireKitEvent('lp_cta_click', ...)`.
   */
  onStateTap?: (code: string) => void;
}

const CANONICAL_ORDER: readonly string[] = [
  'al','ak','az','ar','ca','co','ct','de','dc','fl','ga','hi','id','il','in',
  'ia','ks','ky','la','me','md','ma','mi','mn','ms','mo','mt','ne','nv','nh',
  'nj','nm','ny','nc','nd','oh','ok','or','pa','ri','sc','sd','tn','tx','ut',
  'vt','va','wa','wv','wi','wy',
];

function shapeKey(el: UsMapShape, i: number): string {
  return el.type === 'path' ? `p-${el.code}-${i}` : `c-${el.code}-${i}`;
}

/**
 * Render all SVG shapes for one state (some states have multiple paths for
 * islands or a panhandle split, plus DC has a circle marker). The whole
 * group is wrapped in a single <a> so tapping any shape navigates.
 */
function StateGroup({
  code,
  href,
  onTap,
  focused,
}: {
  code: string;
  href: string;
  onTap: () => void;
  focused: boolean;
}) {
  const name = US_STATE_NAMES[code];
  const shapes = US_MAP_SHAPES.filter((el) => el.code === code);
  return (
    <a
      href={href}
      onClick={onTap}
      onTouchStart={() => undefined /* iOS :active pseudo-class */}
      rel="sponsored nofollow noopener"
      target="_blank"
      aria-label={name}
      data-state={code}
      className={`${styles.stateMapState} ${focused ? styles.stateMapStateFocused : ''}`}
    >
      <title>{name}</title>
      {shapes.map((el, i) =>
        el.type === 'path' ? (
          <path key={shapeKey(el, i)} d={el.d} />
        ) : (
          <circle key={shapeKey(el, i)} cx={el.cx} cy={el.cy} r={el.r} />
        )
      )}
    </a>
  );
}

export default function StateMap({
  prompt,
  ctaLabel = <>Select Your State</>,
  selectionKey,
  stepLabel = 'Step 1 · Your state',
  step2Label = 'Step 2 · See what you qualify for',
  onStateTap,
}: StateMapProps) {
  const buildHref = useBuildCtaHref();
  const setSelection = useSetCtaSelection();
  const [focused, setFocused] = useState<string | null>(null);

  // Pre-compute one href per state so the SVG re-render on hover is cheap.
  const hrefByCode = useMemo(() => {
    const out: Record<string, string> = {};
    for (const code of CANONICAL_ORDER) {
      out[code] = buildHref({ [selectionKey]: code.toUpperCase() });
    }
    return out;
  }, [buildHref, selectionKey]);

  const handleTap = useCallback(
    (code: string) => {
      // Persist selection in context so any coexisting components (e.g. a
      // sticky CTA rendered elsewhere on the page) also carry the pick.
      setSelection(selectionKey, code.toUpperCase());
      onStateTap?.(code);
    },
    [selectionKey, setSelection, onStateTap]
  );

  return (
    <section
      className={styles.stateMap}
      aria-label={typeof ctaLabel === 'string' ? ctaLabel : 'Select your state'}
    >
      {stepLabel || step2Label ? (
        <div className={styles.steps}>
          {stepLabel ? (
            <span className={`${styles.step} ${styles.stepOn}`}>{stepLabel}</span>
          ) : null}
          {step2Label ? <span className={styles.step}>{step2Label}</span> : null}
        </div>
      ) : null}

      {prompt ? (
        <p className={styles.p}>
          <b>{prompt}</b>
        </p>
      ) : null}

      {ctaLabel ? <div className={styles.stateMapLabel}>{ctaLabel}</div> : null}

      <div className={styles.stateMapFrame}>
        <svg
          className={styles.stateMapSvg}
          viewBox={US_MAP_VIEWBOX}
          xmlns="http://www.w3.org/2000/svg"
          role="img"
          aria-label="Clickable map of the United States. Tap any state to continue."
        >
          {CANONICAL_ORDER.map((code) => (
            <StateGroup
              key={code}
              code={code}
              href={hrefByCode[code]}
              focused={focused === code}
              onTap={() => handleTap(code)}
            />
          ))}
        </svg>
      </div>

      {/* Small-state chip strip: guarantees every state (including
          RI/DE/DC/CT/NJ/MD/MA/NH/VT) has a mobile-tap-friendly target. */}
      <div className={styles.stateMapChips} aria-label="Choose your state by abbreviation">
        {CANONICAL_ORDER.map((code) => (
          <a
            key={`chip-${code}`}
            href={hrefByCode[code]}
            onClick={() => handleTap(code)}
            onMouseEnter={() => setFocused(code)}
            onMouseLeave={() => setFocused(null)}
            onFocus={() => setFocused(code)}
            onBlur={() => setFocused(null)}
            rel="sponsored nofollow noopener"
            target="_blank"
            aria-label={US_STATE_NAMES[code]}
            className={styles.stateMapChip}
            data-state={code}
          >
            {code.toUpperCase()}
          </a>
        ))}
      </div>
    </section>
  );
}
