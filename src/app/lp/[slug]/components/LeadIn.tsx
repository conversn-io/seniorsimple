/**
 * A2 · LeadIn — headline + byline + optional dek + hero + caption.
 *
 * The `<h1>` carries `data-variant-slot="headline"` and the `<img>` carries
 * `data-variant-slot="header"` so QA and observability tools can locate the
 * split-test slots by attribute, per the split-testing contract.
 *
 * Rule (per style guide): no CTA in the lead-in. This is a hook, not a sell.
 */

import styles from '../advertorial.module.css';

interface LeadInProps {
  /** Article H1 text. Already state-interpolated by the caller. */
  headline: React.ReactNode;
  /** Sans byline strip: "By the Editorial Team · Updated this week · 7 min read". */
  bylineText: string;
  /** Optional single-sentence dek (Georgia serif, softer color). */
  dek?: React.ReactNode;
  /**
   * Optional hero + caption. If omitted, LeadIn renders headline + byline
   * (+ optional dek) only, and the body can render prose before placing
   * the hero manually. Include for the canonical A2 layout in the
   * component reference.
   */
  heroSrc?: string | null;
  heroAlt?: string;
  caption?: React.ReactNode;
}

export default function LeadIn({
  headline,
  bylineText,
  dek,
  heroSrc,
  heroAlt = '',
  caption,
}: LeadInProps) {
  return (
    <>
      <h1 className={styles.h1} data-variant-slot="headline">
        {headline}
      </h1>
      <div className={styles.byline}>{bylineText}</div>
      {dek ? <p className={styles.dek}>{dek}</p> : null}
      {heroSrc ? (
        <img
          className={styles.hero}
          data-variant-slot="header"
          src={heroSrc}
          alt={heroAlt}
          loading="eager"
          fetchPriority="high"
        />
      ) : null}
      {caption ? <div className={styles.cap}>{caption}</div> : null}
    </>
  );
}
