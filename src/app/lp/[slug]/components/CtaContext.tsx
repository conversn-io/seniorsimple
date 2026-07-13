'use client';

/**
 * CtaContext — one source of truth for the outbound offer URL on an LP.
 *
 * LpPage computes the base tracking URL + the server-known subs (header
 * variant, headline variant, slug) and reads the inbound RevContent params
 * (click_id, widget_id) from the URL, then passes those into <CtaProvider>.
 *
 * Every non-interactive CTA (SectionCTA, PrimaryCTA, StickyCTA, BlueAnchor
 * that has no explicit href, WrapUpList) reads the resolved href via
 * `useCtaHref()`.
 *
 * D-series interactive components (ImageQuiz, MultiSelectQuiz, StateSelector)
 * call `useSetSelection(key, value)` to append their user selection as a
 * higher-numbered sub param (sub6, sub7, ...) so Prismique attribution can
 * split by the quiz answer. sub1–sub5 are RESERVED for the split-test +
 * RevContent chain (see ADVERTORIAL_SPLIT_TESTING.md §Downstream propagation).
 */

import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

export interface CtaSubs {
  /** RevContent click id (inbound). */
  sub1: string;
  /** RevContent widget id (inbound). */
  sub2: string;
  /** Assigned ad_header variant. */
  sub3: string;
  /** Assigned ad_headline variant. */
  sub4: string;
  /** Slug of the LP. */
  sub5: string;
}

interface CtaContextValue {
  base: string;
  href: string;
  setSelection: (key: string, value: string) => void;
}

const Ctx = createContext<CtaContextValue | null>(null);

interface CtaProviderProps {
  base: string;
  subs: CtaSubs;
  children: React.ReactNode;
}

export function CtaProvider({ base, subs, children }: CtaProviderProps) {
  // Selection keys are ordered by insertion so sub6/sub7/... are stable.
  const [selection, setSelection] = useState<Record<string, string>>({});

  const setSelectionCb = useCallback((key: string, value: string) => {
    setSelection((prev) => {
      if (prev[key] === value) return prev;
      return { ...prev, [key]: value };
    });
  }, []);

  const href = useMemo(() => {
    try {
      const url = new URL(base);
      url.searchParams.set('sub1', subs.sub1);
      url.searchParams.set('sub2', subs.sub2);
      url.searchParams.set('sub3', subs.sub3);
      url.searchParams.set('sub4', subs.sub4);
      url.searchParams.set('sub5', subs.sub5);
      // Assign interactive selections to sub6+ in stable insertion order.
      Object.entries(selection).forEach(([, v], i) => {
        if (v) url.searchParams.set(`sub${6 + i}`, v);
      });
      return url.toString();
    } catch {
      return base;
    }
  }, [base, subs, selection]);

  const value = useMemo<CtaContextValue>(
    () => ({ base, href, setSelection: setSelectionCb }),
    [base, href, setSelectionCb]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

/** Resolved outbound URL (base + subs + interactive selections). */
export function useCtaHref(): string {
  const ctx = useContext(Ctx);
  return ctx?.href ?? '#';
}

/**
 * Report an interactive component's user selection. `key` is the semantic
 * dimension (e.g. 'discount_category', 'state', 'frequency'); `value` is
 * the user's answer. The provider maps each unique key to sub6/sub7/... in
 * insertion order.
 */
export function useSetCtaSelection() {
  const ctx = useContext(Ctx);
  return ctx?.setSelection ?? (() => {});
}
