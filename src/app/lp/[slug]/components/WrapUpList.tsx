/**
 * F1 · WrapUpList — "Don't Forget:" recap.
 *
 * Bold label + blue anchor per line. Renders a full-width CTA at the end
 * (green by default, blue via `ctaVariant='blue'`).
 *
 * COMPLIANCE (guide §5.2): no "may expire this July" / fabricated deadline
 * in the item copy. Author-provided text goes through unchecked — the
 * BANNED §5.3 list is enforced at review, not at component boundaries.
 */

import styles from '../advertorial.module.css';
import { useCtaHref } from './CtaContext';

interface WrapUpItem {
  /** Bold prefix, e.g. "Dining:". */
  label: React.ReactNode;
  /** Blue anchor text, e.g. "see member restaurant pricing »". */
  anchorText: React.ReactNode;
  /** Optional override href. Default: resolved offer URL from context. */
  href?: string;
}

interface WrapUpListProps {
  intro?: React.ReactNode;
  items: WrapUpItem[];
  ctaLabel: React.ReactNode;
  ctaVariant?: 'green' | 'blue';
  ctaHref?: string;
}

export default function WrapUpList({
  intro,
  items,
  ctaLabel,
  ctaVariant = 'blue',
  ctaHref,
}: WrapUpListProps) {
  const defaultHref = useCtaHref();
  const finalCtaHref = ctaHref ?? defaultHref;
  const ctaClassName = [
    styles.cta,
    styles.ctaFull,
    ctaVariant === 'blue' ? styles.ctaBlue : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <>
      {intro ? <p className={styles.p}>{intro}</p> : null}
      <ul className={styles.wrapList}>
        {items.map((item, i) => (
          <li key={i}>
            <b>{item.label}</b>{' '}
            <a
              href={item.href ?? defaultHref}
              rel="sponsored nofollow noopener"
              target="_blank"
            >
              {item.anchorText}
            </a>
          </li>
        ))}
      </ul>
      <div className={styles.ctaWrap}>
        <a
          className={ctaClassName}
          href={finalCtaHref}
          rel="sponsored nofollow noopener"
          target="_blank"
        >
          {ctaLabel}
        </a>
      </div>
    </>
  );
}
