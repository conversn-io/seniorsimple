/**
 * C2 · PrimaryCTA — full-width CTA for the big moments (post-Editor's-Pick,
 * article close).
 *
 * `variant='blue'` uses the sanctioned CTA alternate `--blue`. A/B against
 * green — never both variants on one screen (guide §Layout button spec).
 */

import styles from '../advertorial.module.css';
import { useCtaHref } from './CtaContext';

interface PrimaryCTAProps {
  variant?: 'green' | 'blue';
  href?: string;
  children: React.ReactNode;
}

export default function PrimaryCTA({
  variant = 'green',
  href,
  children,
}: PrimaryCTAProps) {
  const ctaHref = useCtaHref();
  const className = [
    styles.cta,
    styles.ctaFull,
    variant === 'blue' ? styles.ctaBlue : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={styles.ctaWrap}>
      <a
        className={className}
        href={href ?? ctaHref}
        rel="sponsored nofollow noopener"
        target="_blank"
      >
        {children}
      </a>
    </div>
  );
}
