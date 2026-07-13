/**
 * C1 · SectionCTA — the green section-end CTA button.
 *
 * Benefit-specific label + » suffix (author writes the label). One per
 * monetized section per style guide §Layout.
 */

import styles from '../advertorial.module.css';
import { useCtaHref } from './CtaContext';

interface SectionCTAProps {
  /** Override the outbound URL. Default: resolved offer URL from context. */
  href?: string;
  children: React.ReactNode;
}

export default function SectionCTA({ href, children }: SectionCTAProps) {
  const ctaHref = useCtaHref();
  return (
    <div className={styles.ctaWrap}>
      <a
        className={styles.cta}
        href={href ?? ctaHref}
        rel="sponsored nofollow noopener"
        target="_blank"
      >
        {children}
      </a>
    </div>
  );
}
