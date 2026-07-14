/**
 * E3 · TrustBar — "member pricing at brands including..." logo strip,
 * grouped by category for scannability.
 *
 * COMPLIANCE (style guide §5.3 spirit): only use REAL brand marks the
 * offer actually includes. Never imply an endorsement or affiliation
 * that isn't real. Callers pass an ApcBrand list they've verified
 * against the offer's own partner directory.
 *
 * Logos are pulled from DuckDuckGo's public favicon service (reliable
 * HTTP 200 for every APC brand tested, no API key, no CORS). Upgrade
 * path: swap `logoUrl(domain)` for a Supabase-hosted full-color brand
 * SVG per brand without changing the component.
 */

import type { ApcBrand, ApcCategory } from '@/lib/advertorial-content';
import styles from '../advertorial.module.css';

type BrandInput = string | ApcBrand;

interface TrustBarProps {
  label?: React.ReactNode;
  brands: BrandInput[];
}

function logoUrl(domain: string): string {
  return `https://icons.duckduckgo.com/ip3/${domain}.ico`;
}

function normalize(input: BrandInput): ApcBrand {
  if (typeof input !== 'string') return input;
  return { name: input, domain: '', category: 'Retail' };
}

/** Preserves the caller's insertion order across categories. */
function groupByCategory(brands: ApcBrand[]): Array<[ApcCategory, ApcBrand[]]> {
  const order: ApcCategory[] = [];
  const bucket = new Map<ApcCategory, ApcBrand[]>();
  for (const b of brands) {
    if (!bucket.has(b.category)) {
      order.push(b.category);
      bucket.set(b.category, []);
    }
    bucket.get(b.category)!.push(b);
  }
  return order.map((cat) => [cat, bucket.get(cat)!]);
}

function Pill({ brand }: { brand: ApcBrand }) {
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
}

export default function TrustBar({ label, brands }: TrustBarProps) {
  const normalized = brands.map(normalize);
  const hasCategories = normalized.every((b) => b.category);
  const groups = hasCategories ? groupByCategory(normalized) : null;

  return (
    <div className={styles.trust}>
      {label ? <span className={styles.trustLabel}>{label}</span> : null}
      {groups ? (
        <div className={styles.trustGroups}>
          {groups.map(([category, group]) => (
            <div key={category} className={styles.trustGroup}>
              <div className={styles.trustGroupHeading}>{category}</div>
              <div className={styles.trustPills}>
                {group.map((brand) => (
                  <Pill key={brand.name} brand={brand} />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.trustPills}>
          {normalized.map((brand) => (
            <Pill key={brand.name} brand={brand} />
          ))}
        </div>
      )}
    </div>
  );
}
