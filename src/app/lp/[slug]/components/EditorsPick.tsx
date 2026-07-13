/**
 * E1 · EditorsPick — accent-bordered callout for the featured offer.
 *
 * Honest price + fit framing + material-connection line. Sits mid-article,
 * not first-fold. Green left border matches the CTA color.
 */

import styles from '../advertorial.module.css';
import { useCtaHref } from './CtaContext';

interface EditorsPickProps {
  /** Small uppercase kicker, e.g. "Editor's Pick · Easiest way to stack all of these". */
  tag: React.ReactNode;
  /** Body copy for the pick. */
  children: React.ReactNode;
  /** Green CTA label. */
  ctaLabel: React.ReactNode;
  /** Override the outbound URL. Default: resolved offer URL from context. */
  href?: string;
  /**
   * Material-connection disclosure line (small muted sans). Required by
   * compliance (guide §5.1) — always include on the featured-offer pick.
   */
  disclosure: React.ReactNode;
}

export default function EditorsPick({
  tag,
  children,
  ctaLabel,
  href,
  disclosure,
}: EditorsPickProps) {
  const ctaHref = useCtaHref();
  return (
    <div className={styles.pick}>
      <div className={styles.pickTag}>{tag}</div>
      <div className={styles.pickBody}>{children}</div>
      <div className={styles.ctaWrap}>
        <a
          className={styles.cta}
          href={href ?? ctaHref}
          rel="sponsored nofollow noopener"
          target="_blank"
        >
          {ctaLabel}
        </a>
      </div>
      <div className={styles.small}>{disclosure}</div>
    </div>
  );
}
