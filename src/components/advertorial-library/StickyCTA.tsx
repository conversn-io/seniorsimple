/**
 * C3 · StickyCTA — persistent bottom bar CTA on mobile scroll.
 *
 * Optional per campaign — test for lift vs. intrusiveness. Author places
 * this at the end of the article; CSS `position: sticky; bottom: 0` keeps
 * it visible during scroll.
 */

import styles from './advertorial.module.css';
import { useCtaHref } from './CtaContext';

interface StickyCTAProps {
  variant?: 'green' | 'blue';
  href?: string;
  children: React.ReactNode;
}

export default function StickyCTA({
  variant = 'blue',
  href,
  children,
}: StickyCTAProps) {
  const ctaHref = useCtaHref();
  const className = [
    styles.cta,
    styles.ctaFull,
    variant === 'blue' ? styles.ctaBlue : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={styles.sticky}>
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
