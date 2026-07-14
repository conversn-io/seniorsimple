/**
 * E3 · TrustBar — "member pricing at brands including..." logo strip.
 *
 * COMPLIANCE (style guide §5.3 spirit): only use REAL brand marks the
 * offer actually includes. Never imply an endorsement or affiliation that
 * isn't real. Callers pass an ApcBrand (or plain string) list they've
 * verified against the offer's own directory.
 *
 * Logos are pulled from DuckDuckGo's public favicon service — reliable
 * (HTTP 200 for every brand tested), no API key, no CORS drama. Renders
 * an inline <img> at 24×24 inside a gray pill next to the brand name.
 * Upgrade path: swap `logoUrl(domain)` for a Supabase-hosted full-color
 * brand SVG per-brand without changing the component.
 */

import type { ApcBrand } from '@/lib/advertorial-content';
import styles from '../advertorial.module.css';

type BrandInput = string | ApcBrand;

interface TrustBarProps {
  label?: React.ReactNode;
  brands: BrandInput[];
}

/** Public favicon endpoint — always returns a 200 with a favicon image. */
function logoUrl(domain: string): string {
  return `https://icons.duckduckgo.com/ip3/${domain}.ico`;
}

function normalize(input: BrandInput): ApcBrand {
  return typeof input === 'string' ? { name: input, domain: '' } : input;
}

export default function TrustBar({ label, brands }: TrustBarProps) {
  return (
    <div className={styles.trust}>
      {label ? <span className={styles.trustLabel}>{label}</span> : null}
      <div className={styles.trustPills}>
        {brands.map((raw) => {
          const brand = normalize(raw);
          return (
            <span key={brand.name} className={styles.logo}>
              {brand.domain ? (
                <img
                  className={styles.logoIcon}
                  src={logoUrl(brand.domain)}
                  alt=""
                  loading="lazy"
                  width={24}
                  height={24}
                />
              ) : null}
              <span>{brand.name}</span>
            </span>
          );
        })}
      </div>
    </div>
  );
}
