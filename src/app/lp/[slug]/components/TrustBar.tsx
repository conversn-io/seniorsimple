/**
 * E3 · TrustBar — "member pricing at brands including..." logo strip,
 * grouped by category for scannability.
 *
 * Renders each brand as a fixed-height pill with the logo `object-fit:
 * contain`-ed so mixed logo aspect ratios (wide Walmart wordmark, square
 * Costco disc, round Ford oval) normalize to a consistent row height.
 *
 * COMPLIANCE (style guide §5.3 spirit): only use REAL brand marks the
 * offer actually includes. Never imply an endorsement or affiliation
 * that isn't real. Callers pass an ApcBrand list they've verified
 * against the offer's own partner directory.
 *
 * Logo source: `brandLogoSrc()` from advertorial-content — local file
 * in public/logos/apc/* when present, DuckDuckGo favicon fallback
 * otherwise.
 */

import {
  brandLogoSrc,
  type ApcBrand,
  type ApcCategory,
} from '@/lib/advertorial-content';
import styles from '../advertorial.module.css';

type BrandInput = string | ApcBrand;

interface TrustBarProps {
  label?: React.ReactNode;
  brands: BrandInput[];
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
  const src = brandLogoSrc(brand);
  return (
    <span className={styles.logo} title={brand.name}>
      {src ? (
        <img
          className={styles.logoIcon}
          src={src}
          alt={brand.name}
          loading="lazy"
        />
      ) : (
        <span className={styles.logoText}>{brand.name}</span>
      )}
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
