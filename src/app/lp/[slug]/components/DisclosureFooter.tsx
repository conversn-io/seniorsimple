/**
 * F3 · DisclosureFooter — material-connection disclosure + SMN copyright.
 *
 * COMPLIANCE (guide §5.1): required on every LP. This component encodes
 * the shape so the disclosure line + copyright line + legal links can't
 * drift between advertorials.
 */

import styles from '../advertorial.module.css';

interface LegalLink {
  label: React.ReactNode;
  href: string;
}

interface DisclosureFooterProps {
  /**
   * Full material-connection disclosure sentence. e.g.
   * "Advertisement. SeniorSimple publishes independent money and retirement
   * guides and may earn compensation from products featured, including
   * American Perks Club, a third-party membership service. Discounts and
   * savings vary by location and use."
   */
  disclosure: React.ReactNode;
  /** e.g. "© 2026 SeniorSimple — a Simple Media Network property". */
  copyright: React.ReactNode;
  /** Legal links row (Privacy, Terms, Contact). */
  legalLinks: LegalLink[];
}

export default function DisclosureFooter({
  disclosure,
  copyright,
  legalLinks,
}: DisclosureFooterProps) {
  return (
    <footer className={styles.footer}>
      <p className={styles.p}>{disclosure}</p>
      <p className={styles.footerSecond}>
        {copyright}
        {legalLinks.length > 0 ? ' · ' : ''}
        {legalLinks.map((link, i) => (
          <span key={i}>
            <a href={link.href}>{link.label}</a>
            {i < legalLinks.length - 1 ? ' · ' : ''}
          </span>
        ))}
      </p>
    </footer>
  );
}
