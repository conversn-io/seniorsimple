// callready-tracker — client-side pixel that POSTs a native ad-click row to
// CRM `public.ad_clicks` via the `track-click` edge fn. Framework-agnostic core.
//
// Contract: browser-side only; SSR-safe (no-ops if window undefined). Fires ONCE
// on landing. Never blocks page render — all work runs after DOMContentLoaded
// and every failure is swallowed silently (fraud/telemetry data must never crash
// a live LP).
//
// What it captures (per tracking_convention.md, s1-s8):
//   s1_brand      = explicit ?s1 → config.brand → derived from hostname
//   s2_network    = explicit ?s2 → normalized utm_source (fb/google/tiktok/bing/…)
//   s3_offer      = explicit ?s3 → config.offer
//   s4_angle      = explicit ?s4 → utm_campaign
//   s5_creative   = explicit ?s5 → utm_content → utm_term
//   s6_placement  = explicit ?s6 → ?placement (from Meta {placement} macro)
//   s7_variant    = explicit ?s7 → ?variant
//   s8/click_id   = explicit ?s8 → fbclid → gclid → msclkid → ttclid → twclid → li_fat_id
//
// Skip rules (fire ZERO requests when true):
//   1. No click_id resolvable (organic traffic) — nothing to postback later, skip.
//   2. Path matches config.excludePaths (Everflow-owned surfaces like RM/RateZip).
//   3. navigator.doNotTrack === '1' AND config.honorDnt !== false (default: honor).
//   4. Global Privacy Control header (window.globalPrivacyControl).

export type TrackerConfig = {
  /** Override the endpoint (default: CRM production track-click). */
  endpoint?: string;
  /** Hardcoded brand → s1_brand. Falls back to hostname derivation if omitted. */
  brand?: string;
  /** Hardcoded offer key → s3_offer. Set per-LP. */
  offer?: string;
  /** Path regexes to skip (e.g. Everflow-owned RM funnel). */
  excludePaths?: RegExp[];
  /** Session cookie name (default: cr_session). */
  sessionCookieName?: string;
  /** Session cookie lifetime days (default: 30). */
  sessionCookieDays?: number;
  /** Log to console when true. */
  debug?: boolean;
  /** Set to false to ignore DNT / GPC signals. Default: true (honor them). */
  honorDnt?: boolean;
};

const DEFAULT_ENDPOINT =
  "https://jqjftrlnyysqcwbbigpw.supabase.co/functions/v1/track-click";
const DEFAULT_COOKIE = "cr_session";
const DEFAULT_COOKIE_DAYS = 30;

function log(cfg: TrackerConfig, ...args: unknown[]) {
  if (cfg.debug) console.log("[callready-tracker]", ...args);
}

function getCookie(name: string): string | null {
  const re = new RegExp(
    "(?:^|;\\s*)" + name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "=([^;]+)",
  );
  const m = document.cookie.match(re);
  return m ? decodeURIComponent(m[1]) : null;
}

function setCookie(name: string, value: string, days: number) {
  const d = new Date();
  d.setTime(d.getTime() + days * 86_400_000);
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie =
    `${name}=${encodeURIComponent(value)}; expires=${d.toUTCString()};` +
    ` path=/; SameSite=Lax${secure}`;
}

function normalizeSource(src: string | undefined): string | undefined {
  if (!src) return undefined;
  const s = src.toLowerCase().trim();
  if (["facebook", "fb", "meta", "instagram", "ig"].includes(s)) return "fb";
  if (["google", "adwords", "google-ads"].includes(s)) return "google";
  if (["bing", "microsoft", "microsoft-ads"].includes(s)) return "bing";
  if (s === "tiktok") return "tiktok";
  if (["twitter", "x"].includes(s)) return "twitter";
  if (s === "linkedin") return "linkedin";
  if (["revcontent", "rev"].includes(s)) return "revcontent";
  if (s === "mgid") return "mgid";
  if (s === "newsbreak") return "newsbreak";
  if (["taboola", "realize"].includes(s)) return "realize";
  return s;
}

function deriveBrandFromHostname(): string {
  const host = window.location.hostname.replace(/^www\./, "");
  // "seniorsimple.org" → "seniorsimple"; "quiz.rateroots.com" → "rateroots"
  const parts = host.split(".");
  if (parts.length >= 2) return parts[parts.length - 2];
  return host;
}

function isDntOn(): boolean {
  const w = window as Window & { globalPrivacyControl?: boolean };
  if (w.globalPrivacyControl === true) return true;
  const dnt =
    navigator.doNotTrack ??
    (navigator as Navigator & { msDoNotTrack?: string }).msDoNotTrack;
  return dnt === "1" || dnt === "yes";
}

/**
 * Fire the click-capture request. Safe to call multiple times — the endpoint
 * is idempotent on (s2_network, click_id). Should only need to run once per LP
 * landing, so callers typically wrap this in an idempotency guard.
 */
export function fireTrackClick(config: TrackerConfig = {}): void {
  if (typeof window === "undefined") return; // SSR safety

  // Path exclusion
  const excludes = config.excludePaths ?? [];
  const path = window.location.pathname;
  if (excludes.some((re) => re.test(path))) {
    log(config, "excluded path:", path);
    return;
  }

  // Privacy signals
  const honorDnt = config.honorDnt !== false;
  if (honorDnt && isDntOn()) {
    log(config, "DNT/GPC on — skipping");
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const get = (k: string) => {
    const v = params.get(k);
    return v && v.trim() ? v.trim() : undefined;
  };

  // click_id: explicit s8 wins; otherwise walk known network click macros
  const click_id =
    get("s8") ||
    get("click_id") ||
    get("fbclid") ||
    get("gclid") ||
    get("msclkid") ||
    get("ttclid") ||
    get("twclid") ||
    get("li_fat_id") ||
    get("nb_click_id") ||   // NewsBreak native macro
    get("nbclid") ||
    get("sub1");            // Everflow-style click id used by NewsBreak when Everflow tracker preset is selected (confirmed 2026-07-16)

  if (!click_id) {
    log(config, "no click_id (organic traffic) — skipping");
    return;
  }

  // s2_network: explicit s2 wins; otherwise normalized utm_source; otherwise infer from click_id macro
  let s2_network = get("s2") || normalizeSource(get("utm_source"));
  if (!s2_network) {
    if (get("fbclid")) s2_network = "fb";
    else if (get("gclid")) s2_network = "google";
    else if (get("msclkid")) s2_network = "bing";
    else if (get("ttclid")) s2_network = "tiktok";
    else if (get("twclid")) s2_network = "twitter";
    else if (get("li_fat_id")) s2_network = "linkedin";
    else if (get("nb_click_id") || get("nbclid")) s2_network = "newsbreak";
  }
  if (!s2_network) {
    log(config, "no s2_network (cannot route postback) — skipping");
    return;
  }

  // Session cookie (create if absent)
  const cookieName = config.sessionCookieName ?? DEFAULT_COOKIE;
  let session_id = getCookie(cookieName);
  if (!session_id) {
    session_id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `s_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
    setCookie(
      cookieName,
      session_id,
      config.sessionCookieDays ?? DEFAULT_COOKIE_DAYS,
    );
  }

  const payload = {
    s1_brand: get("s1") || config.brand || deriveBrandFromHostname(),
    s2_network,
    s3_offer: get("s3") || config.offer,
    s4_angle: get("s4") || get("utm_campaign"),
    s5_creative: get("s5") || get("utm_content") || get("utm_term"),
    s6_placement: get("s6") || get("placement"),
    s7_variant: get("s7") || get("variant"),
    click_id,
    session_id,
    campaign_id: get("campaign_id") || get("utm_id"),
    placement_id: get("placement_id"),
    landing_url: window.location.href,
  };

  const endpoint = config.endpoint ?? DEFAULT_ENDPOINT;

  try {
    fetch(endpoint, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true, // survives navigation
      credentials: "omit",
      mode: "cors",
    })
      .then((r) => log(config, "sent", r.status, payload))
      .catch((err) => log(config, "fetch error", err));
  } catch (err) {
    log(config, "sync error", err);
  }

  // Network-specific landing beacon: some ad networks need a client-side pixel fired
  // on landing (not just on conversion) to validate the postback integration. NewsBreak's
  // test flow requires their `view_content` event to fire from the browser on landing —
  // our dispatcher only fires on conversion (from the ledger trigger), so we handle the
  // landing signal here. Fire-and-forget, no-cors (endpoint is a 1x1 pixel-style tracker).
  const beaconUrl = buildLandingBeacon(s2_network, click_id);
  if (beaconUrl) {
    try {
      fetch(beaconUrl, {
        method: "GET",
        mode: "no-cors",
        keepalive: true,
        credentials: "omit",
      })
        .then(() => log(config, "landing beacon fired", s2_network))
        .catch((err) => log(config, "beacon error", err));
    } catch (err) {
      log(config, "beacon sync error", err);
    }
  }
}

// Per-network landing beacons. Add here when a new network needs a client-side signal
// on page load. Called synchronously; return null to skip.
function buildLandingBeacon(s2_network: string, click_id: string): string | null {
  switch (s2_network) {
    case "newsbreak":
      // NewsBreak Postback URL confirmed 2026-07-16 via ad-manager UI (Everflow tracker preset).
      // NewsBreak's server identifies the ad account via the callback token; no per-brand creds.
      return `https://business.newsbreak.com/tracking/attribute?callback=${encodeURIComponent(click_id)}&event_type=view_content`;
    default:
      return null;
  }
}

/**
 * Initialize the tracker. Idempotent — safe to call from multiple mount points;
 * the underlying fetch is idempotent on (s2_network, click_id) and this fn
 * guards against firing twice in the same page load via a window flag.
 */
export function initTracker(config: TrackerConfig = {}): void {
  if (typeof window === "undefined") return;
  const w = window as Window & { __CR_TRACKER_FIRED__?: boolean };
  if (w.__CR_TRACKER_FIRED__) return;
  w.__CR_TRACKER_FIRED__ = true;

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      () => fireTrackClick(config),
      { once: true },
    );
  } else {
    fireTrackClick(config);
  }
}

// Auto-init when loaded as a <script> tag with a config global set.
if (
  typeof window !== "undefined" &&
  (window as Window & { CALLREADY_TRACKER_CONFIG?: TrackerConfig })
    .CALLREADY_TRACKER_CONFIG !== undefined
) {
  initTracker(
    (window as Window & { CALLREADY_TRACKER_CONFIG?: TrackerConfig })
      .CALLREADY_TRACKER_CONFIG ?? {},
  );
}
