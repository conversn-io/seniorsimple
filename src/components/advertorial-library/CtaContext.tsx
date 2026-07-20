'use client';

/**
 * CtaContext — one source of truth for the outbound offer URL on an LP.
 *
 * LOCKED parameter scheme (do not reorder without updating
 * ADVERTORIAL_STYLE_GUIDE.md §6 + every downstream Prismique / RevContent
 * mapping):
 *
 *   source_id — static publisher identifier ("keenanshaw_1323")
 *   sub1      — RevContent click_id (inbound URL param)
 *   sub2      — RevContent widget_id (inbound URL param)
 *   sub3      — ad_header variant (server-resolved from cookie)
 *   sub4      — ad_headline variant (server-resolved from cookie)
 *   sub5      — LP slug
 *   sub6      — spend_focus (above-fold quiz answer)
 *   sub7      — state (URL param + / StateSelector selection)
 *   sub8      — frequency (secondary quiz — reserved)
 *   sub9      — angle A/B (server-known — creative id)
 *   sub10     — reserved
 *
 * Slot assignment is explicit via SLOT_BY_KEY (semantic key → sub#), not
 * insertion order — a component that mounts second can't accidentally
 * claim a slot meant for something else.
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from 'react';

export type CtaSubKey =
  | 'source_id'
  | 'sub1'
  | 'sub2'
  | 'sub3'
  | 'sub4'
  | 'sub5'
  | 'sub6'
  | 'sub7'
  | 'sub8'
  | 'sub9'
  | 'sub10';

export type CtaSubs = Partial<Record<CtaSubKey, string>>;

/**
 * Semantic key → sub-slot mapping. Interactive components pass a semantic
 * name (`selectionKey="spend_focus"`) and the provider routes it to the
 * canonical slot. Locked per ADVERTORIAL_STYLE_GUIDE.md §6.
 */
const SLOT_BY_KEY: Record<string, CtaSubKey> = {
  spend_focus: 'sub6',
  state: 'sub7',
  frequency: 'sub8',
  angle: 'sub9',
  // SavingsCalculator engagement — value = 'calc' when user has touched
  // any calculator input. Distinct slot from sub6 so quiz answer +
  // calculator engagement can coexist without stomping each other.
  click_source: 'sub10',
};

/** URL param output order — matches the locked scheme. */
const ORDERED_KEYS: CtaSubKey[] = [
  'source_id',
  'sub1',
  'sub2',
  'sub3',
  'sub4',
  'sub5',
  'sub6',
  'sub7',
  'sub8',
  'sub9',
  'sub10',
];

interface CtaContextValue {
  base: string;
  href: string;
  setSub: (key: CtaSubKey, value: string) => void;
  /**
   * Synchronously compute the outbound URL with a set of semantic-key
   * overrides layered on top of the current runtime subs. Used by
   * tap-to-navigate components (StateMap, single-tap ImageQuiz /
   * MultiSelectQuiz) that need the final URL baked into an `<a href="…">`
   * at render time — no React re-render race.
   */
  buildHref: (overrides?: Record<string, string>) => string;
}

const Ctx = createContext<CtaContextValue | null>(null);

interface CtaProviderProps {
  base: string;
  /**
   * Initial (server-known + inbound-URL-read) subs. LpPage should memoize
   * this so the internal sync effect only fires when a slot value actually
   * changes.
   */
  subs: CtaSubs;
  children: React.ReactNode;
}

function subsReducer(
  state: CtaSubs,
  action: { key: CtaSubKey; value: string }
): CtaSubs {
  if (state[action.key] === action.value) return state;
  return { ...state, [action.key]: action.value };
}

export function CtaProvider({ base, subs, children }: CtaProviderProps) {
  const [runtimeSubs, dispatch] = useReducer(subsReducer, subs);

  // Sync `subs` prop → reducer state when parent-owned slots update.
  // In practice this fires once after mount (LpPage's useEffect reads
  // URL params and re-renders with the populated subs); after that the
  // memoized subs prop is stable and this effect skips.
  useEffect(() => {
    for (const [key, value] of Object.entries(subs) as [
      CtaSubKey,
      string | undefined,
    ][]) {
      if (value !== undefined && value !== '') {
        dispatch({ key, value });
      }
    }
  }, [subs]);

  const setSub = useCallback((key: CtaSubKey, value: string) => {
    dispatch({ key, value });
  }, []);

  const buildHref = useCallback(
    (overrides?: Record<string, string>): string => {
      // Merge runtime subs with any semantic-key overrides. Overrides are
      // translated through SLOT_BY_KEY to sub-slots so a tap-to-navigate
      // component can pass `{ state: 'CA', spend_focus: 'dining' }` and the
      // resulting URL carries `sub7=CA&sub6=dining` without touching
      // context state.
      const merged: CtaSubs = { ...runtimeSubs };
      if (overrides) {
        for (const [key, value] of Object.entries(overrides)) {
          if (!value) continue;
          const slot = SLOT_BY_KEY[key];
          if (!slot) {
            console.warn(
              `[CtaContext] Unknown selection key "${key}" — add it to SLOT_BY_KEY + ADVERTORIAL_STYLE_GUIDE.md §6.`
            );
            continue;
          }
          merged[slot] = value;
        }
      }

      // Build the params in canonical order. Supports absolute URLs (offer
      // tracking link on the bridge) AND relative paths (advertorial CTA →
      // /bridge/perks) — no more `new URL('/bridge/perks')` throw.
      const params = new URLSearchParams();
      for (const key of ORDERED_KEYS) {
        const value = merged[key];
        if (value !== undefined && value !== '') {
          params.set(key, value);
        }
      }
      const qs = params.toString();
      if (!qs) return base;
      // Absolute URL — round-trip through URL so pre-existing query params
      // on `base` are preserved and de-duped by name.
      if (/^https?:\/\//i.test(base)) {
        try {
          const url = new URL(base);
          params.forEach((v, k) => url.searchParams.set(k, v));
          return url.toString();
        } catch {
          return base + (base.includes('?') ? '&' : '?') + qs;
        }
      }
      // Relative path — plain string concat.
      return base + (base.includes('?') ? '&' : '?') + qs;
    },
    [base, runtimeSubs]
  );

  const href = useMemo(() => buildHref(), [buildHref]);

  const value = useMemo<CtaContextValue>(
    () => ({ base, href, setSub, buildHref }),
    [base, href, setSub, buildHref]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

/** Resolved outbound URL (base + all populated slots in canonical order). */
export function useCtaHref(): string {
  const ctx = useContext(Ctx);
  return ctx?.href ?? '#';
}

/**
 * Report an interactive component's selection by semantic key. Routes via
 * SLOT_BY_KEY to the canonical sub-slot per the locked scheme.
 *
 * Known keys: 'spend_focus' → sub6, 'state' → sub7, 'frequency' → sub8,
 * 'angle' → sub9. Passing an unknown key logs a warning and is a no-op —
 * don't invent new keys; edit SLOT_BY_KEY and the style guide together.
 */
export function useSetCtaSelection() {
  const ctx = useContext(Ctx);
  const setSub = ctx?.setSub;
  return useCallback(
    (key: string, value: string) => {
      if (!setSub) return;
      const slot = SLOT_BY_KEY[key];
      if (!slot) {
        console.warn(
          `[CtaContext] Unknown selection key "${key}" — add it to SLOT_BY_KEY + ADVERTORIAL_STYLE_GUIDE.md §6.`
        );
        return;
      }
      setSub(slot, value);
    },
    [setSub]
  );
}

/**
 * Advanced: write to a specific sub-slot directly. Used for programmatic
 * writes from LpPage (e.g. propagating URL params on mount). Prefer
 * useSetCtaSelection in interactive components so the semantic key stays
 * greppable across the codebase.
 */
export function useSetCtaSub() {
  const ctx = useContext(Ctx);
  return ctx?.setSub ?? (() => {});
}

/**
 * Synchronous URL builder — returns a fresh outbound href with optional
 * semantic-key overrides layered on top of the current runtime subs.
 *
 * Used by tap-to-navigate components that need to bake a selection into
 * an `<a href="…">` at render time (e.g. StateMap wraps each state in an
 * <a> whose href already carries `?sub7=CA`). Because the URL is computed
 * synchronously from React state, there is no re-render race between
 * `setSub` and the navigation.
 *
 * Example:
 *   const buildHref = useBuildCtaHref();
 *   <a href={buildHref({ state: 'CA' })} …>California</a>
 */
export function useBuildCtaHref(): (overrides?: Record<string, string>) => string {
  const ctx = useContext(Ctx);
  return ctx?.buildHref ?? (() => '#');
}
