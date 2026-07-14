/**
 * Server-side helpers for the car-insurance advertorial LP.
 *
 * - `sanitizeSrc`   : the ?src= param → safe s2 value ([a-z0-9_-]{1,24})
 * - `sanitizeS3`    : any tap-quiz value → safe s3 value (same rules as s2)
 * - `resolveState`  : Vercel geo header (or ?geo= override) → full state name
 * - `buildOfferUrl` : composes the MaxBounty URL with s1/s2/s3
 *
 * All exports are pure and side-effect-free so page.tsx can call them
 * directly during server render — the whole page ships with correct
 * hrefs already baked in, no client hydration race.
 */

const OFFER_BASE =
  'https://afflat3e1.com/trk/lnk/ED76605C-06E6-44A5-AC98-5C09AAA86D2C/?o=30818&c=918277&a=784419&k=2262A8C4945D00C702149A659B427F4B&l=35510&s1=seniorsimple';

const SAFE = /[^a-z0-9_-]/gi;

export function sanitizeSrc(raw: string | null | undefined): string {
  const cleaned = (raw ?? '').replace(SAFE, '').slice(0, 24);
  return cleaned || 'direct';
}

export function sanitizeS3(raw: string): string {
  const cleaned = raw.replace(SAFE, '').slice(0, 24);
  return cleaned || 'unknown';
}

/**
 * Compose the offer URL. `s2` = source (already sanitized), `s3` = the
 * tapped quiz value (sanitized here). Callers should pass the raw tile
 * value — sanitization is centralized so no tile forgets it.
 */
export function buildOfferUrl(s2: string, s3?: string): string {
  const url = `${OFFER_BASE}&s2=${encodeURIComponent(s2)}`;
  if (!s3) return url;
  return `${url}&s3=${encodeURIComponent(sanitizeS3(s3))}`;
}

/**
 * ISO 3166-2 US state code → full name. Covers all 50 states + DC + PR
 * so the H1 reads naturally for any US visitor Vercel can geo-locate.
 */
const US_STATES: Record<string, string> = {
  AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas',
  CA: 'California', CO: 'Colorado', CT: 'Connecticut', DE: 'Delaware',
  FL: 'Florida', GA: 'Georgia', HI: 'Hawaii', ID: 'Idaho',
  IL: 'Illinois', IN: 'Indiana', IA: 'Iowa', KS: 'Kansas',
  KY: 'Kentucky', LA: 'Louisiana', ME: 'Maine', MD: 'Maryland',
  MA: 'Massachusetts', MI: 'Michigan', MN: 'Minnesota', MS: 'Mississippi',
  MO: 'Missouri', MT: 'Montana', NE: 'Nebraska', NV: 'Nevada',
  NH: 'New Hampshire', NJ: 'New Jersey', NM: 'New Mexico', NY: 'New York',
  NC: 'North Carolina', ND: 'North Dakota', OH: 'Ohio', OK: 'Oklahoma',
  OR: 'Oregon', PA: 'Pennsylvania', RI: 'Rhode Island', SC: 'South Carolina',
  SD: 'South Dakota', TN: 'Tennessee', TX: 'Texas', UT: 'Utah',
  VT: 'Vermont', VA: 'Virginia', WA: 'Washington', WV: 'West Virginia',
  WI: 'Wisconsin', WY: 'Wyoming', DC: 'District of Columbia',
  PR: 'Puerto Rico',
};

export interface ResolveStateInput {
  /** From next/headers headers().get(...) */
  countryRegionHeader: string | null;
  regionHeader: string | null;
  countryHeader: string | null;
  /** Optional query-param override (?geo=TX) — useful for QA + local dev. */
  geoOverride?: string | null;
}

/**
 * Vercel Edge Network sets `x-vercel-ip-country-region` (ISO 3166-2 sub-
 * division, e.g. "TX") on every request. Older code and some proxies use
 * `x-vercel-ip-region` — accept either. Only trust US regions; a Canadian
 * "ON" shouldn't render "Ontario" in a US-only insurance advertorial.
 */
export function resolveState({
  countryRegionHeader,
  regionHeader,
  countryHeader,
  geoOverride,
}: ResolveStateInput): string | null {
  const rawOverride = geoOverride?.trim().toUpperCase();
  if (rawOverride && US_STATES[rawOverride]) return US_STATES[rawOverride];

  const isUS = (countryHeader ?? '').toUpperCase() === 'US';
  if (!isUS && countryHeader != null) return null;

  const raw = (countryRegionHeader ?? regionHeader ?? '').toUpperCase();
  if (!raw) return null;
  const code = raw.startsWith('US-') ? raw.slice(3) : raw;
  return US_STATES[code] ?? null;
}
