/**
 * WO-843 §3A — inbound param passthrough.
 *
 * Capture every tracking param on load, persist it, and make it available to
 * the Retreaver tag, the analytics ledger and the CAPI fire. Acceptance
 * criterion 2: "Never drop a param between ad click and call."
 *
 * Persistence is deliberately belt-and-braces:
 *   - localStorage  → survives a hard reload and back/forward
 *   - cookie        → readable server-side on the /api/fe-gateway/event POST
 *
 * FIRST-TOUCH WINS. A visitor who lands with full params, wanders to an
 * article and comes back bare must still attribute to the original ad click,
 * so a later param-less load never overwrites a stored bundle. A later load
 * WITH params does overwrite (new ad click = new attribution).
 */

const STORAGE_KEY = 'ss_fe_attr';
const COOKIE_NAME = 'ss_fe_attr';
const COOKIE_TTL_DAYS = 30;

/** Retreaver's own param family — forwarded to the call record as tags. */
export const RETREAVER_PARAMS = [
  'rt_campaign',
  'rt_adgroup',
  'rt_ad',
  'rt_source',
  'rt_campaignid',
  'rt_adid',
  'rt_adgroupid',
] as const;

export const UTM_PARAMS = [
  'utm_source',
  'utm_campaign',
  'utm_medium',
  'utm_content',
  'utm_term',
] as const;

/** Native/DG partner family. */
export const EXT_PARAMS = [
  'ext_ad_id',
  'ext_source',
  'ext_click_id',
  'ext_placement',
  'ext_adgroup_id',
  'ext_campaign_id',
] as const;

/** Click IDs + Meta's flat macro names. */
export const CLICK_PARAMS = [
  'clickid',
  'fbclid',
  'gclid',
  'msclkid',
  'ttclid',
  'campaign_name',
  'campaign',
  'site_source_name',
  'placement',
] as const;

export const ALL_TRACKED_PARAMS: readonly string[] = [
  ...RETREAVER_PARAMS,
  ...UTM_PARAMS,
  ...EXT_PARAMS,
  ...CLICK_PARAMS,
];

export interface AttributionBundle {
  /** Every tracked param that was present on the landing URL. */
  params: Record<string, string>;
  /** Per-visitor id — becomes the join key across page → Retreaver → ledger. */
  visitorId: string;
  /** ms epoch of first touch. */
  capturedAt: number;
  /** Landing URL of the first touch, full query string intact. */
  landingUrl: string;
  /** document.referrer at first touch. */
  referrer: string;
}

/* ------------------------------------------------------------------ *
 * Storage helpers
 * ------------------------------------------------------------------ */

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const re = new RegExp(
    '(?:^|;\\s*)' + name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '=([^;]+)',
  );
  const m = document.cookie.match(re);
  return m ? decodeURIComponent(m[1]) : null;
}

function writeCookie(name: string, value: string, days: number): void {
  if (typeof document === 'undefined') return;
  const d = new Date();
  d.setTime(d.getTime() + days * 86_400_000);
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie =
    `${name}=${encodeURIComponent(value)}; expires=${d.toUTCString()};` +
    ` path=/; SameSite=Lax${secure}`;
}

function safeParse(raw: string | null): AttributionBundle | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as AttributionBundle;
    if (!parsed || typeof parsed !== 'object' || !parsed.visitorId) return null;
    if (!parsed.params || typeof parsed.params !== 'object') return null;
    return parsed;
  } catch {
    return null;
  }
}

function generateVisitorId(): string {
  const uuid =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID().replace(/-/g, '')
      : `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 12)}`;
  return `fev_${uuid}`;
}

/** Read whatever is already persisted, preferring localStorage. */
export function readStoredAttribution(): AttributionBundle | null {
  if (typeof window === 'undefined') return null;
  let stored: AttributionBundle | null = null;
  try {
    stored = safeParse(window.localStorage.getItem(STORAGE_KEY));
  } catch {
    /* Safari private mode / storage disabled — fall through to cookie. */
  }
  return stored ?? safeParse(readCookie(COOKIE_NAME));
}

function persist(bundle: AttributionBundle): void {
  const raw = JSON.stringify(bundle);
  try {
    window.localStorage.setItem(STORAGE_KEY, raw);
  } catch {
    /* Non-fatal — the cookie below is the fallback. */
  }
  // Cookies cap around 4KB; our bundle is far smaller, but guard anyway so a
  // hostile query string can't silently blow the write.
  if (raw.length < 3500) writeCookie(COOKIE_NAME, raw, COOKIE_TTL_DAYS);
}

/* ------------------------------------------------------------------ *
 * Capture
 * ------------------------------------------------------------------ */

/** Cap any single value so a hostile/huge query string can't bloat storage. */
const MAX_VALUE_LEN = 300;

function extractParams(search: string): Record<string, string> {
  const sp = new URLSearchParams(search);
  const out: Record<string, string> = {};
  for (const key of ALL_TRACKED_PARAMS) {
    const v = sp.get(key);
    if (v != null && v !== '') out[key] = v.slice(0, MAX_VALUE_LEN);
  }
  return out;
}

/**
 * Capture params from the current URL and merge with any stored bundle.
 * Idempotent — safe to call on every mount.
 *
 * Merge rule: params present on THIS load win; params only in the stored
 * bundle are carried forward. So a mid-session navigation that drops the
 * query string keeps the original attribution, while a fresh ad click
 * overwrites the fields it actually carries.
 */
export function captureAttribution(): AttributionBundle {
  const stored = readStoredAttribution();
  const fresh = extractParams(window.location.search);
  const hasFresh = Object.keys(fresh).length > 0;

  if (stored && !hasFresh) return stored;

  const bundle: AttributionBundle = {
    params: { ...(stored?.params ?? {}), ...fresh },
    visitorId: stored?.visitorId ?? generateVisitorId(),
    capturedAt: stored?.capturedAt ?? Date.now(),
    landingUrl: hasFresh
      ? window.location.href.slice(0, 1000)
      : stored?.landingUrl ?? window.location.href.slice(0, 1000),
    referrer: stored?.referrer ?? (document.referrer || '').slice(0, 500),
  };

  persist(bundle);
  return bundle;
}

/* ------------------------------------------------------------------ *
 * Projections
 * ------------------------------------------------------------------ */

/**
 * Flatten a bundle into the tag map Retreaver attaches to the call record.
 * Retreaver tag keys must be lowercase alphanumeric + underscore.
 *
 * `rt_*` params are sent under their bare name (rt_campaign → campaign) since
 * that is the convention Retreaver's own reporting expects; everything else
 * keeps its full key so it stays unambiguous in the call log.
 */
export function toRetreaverTags(
  bundle: AttributionBundle,
  extra: Record<string, string> = {},
): Record<string, string> {
  const tags: Record<string, string> = {};

  for (const [key, value] of Object.entries(bundle.params)) {
    const tagKey = key.startsWith('rt_') ? key.slice(3) : key;
    tags[tagKey.toLowerCase().replace(/[^a-z0-9_]/g, '_')] = value;
  }

  tags.visitor_id = bundle.visitorId;
  return { ...tags, ...extra };
}

/** Pull the utm_* subset out for analytics_events' dedicated columns. */
export function toUtmColumns(bundle: AttributionBundle): Record<string, string | null> {
  const p = bundle.params;
  return {
    utm_source: p.utm_source ?? null,
    utm_medium: p.utm_medium ?? null,
    utm_campaign: p.utm_campaign ?? null,
    utm_term: p.utm_term ?? null,
    utm_content: p.utm_content ?? null,
  };
}

/** Best-available click id, in the order Meta/partners prefer. */
export function primaryClickId(bundle: AttributionBundle): string | null {
  const p = bundle.params;
  return (
    p.fbclid ?? p.clickid ?? p.ext_click_id ?? p.gclid ?? p.msclkid ?? p.ttclid ?? null
  );
}

export const FE_ATTR_COOKIE = COOKIE_NAME;
