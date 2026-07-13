/**
 * SeniorSimple flag registry.
 *
 * Declares every split-test dimension the site runs. Middleware, admin UI,
 * client-side tracking all read from here. Variant ids MUST match composer
 * output ids exactly (composer emits header_variants[] + variant_headlines[]).
 *
 * Adoption plan (per ADVERTORIAL_SPLIT_TESTING.md): one variable at a time.
 * When header is under test, headline weights are pinned; when headline is
 * under test, header weights are pinned. Weights are runtime-editable via
 * env vars (AD_HEADER_WEIGHTS, AD_HEADLINE_WEIGHTS) — swap to Edge Config
 * later by porting flag-store.ts + installing @vercel/edge-config.
 */

import type { FlagDimension, FlagRegistry } from './flag-registry-types';

/**
 * Cookie names, exported so middleware + client reader + LP page share the
 * exact same strings. `ss_` prefix is the SeniorSimple convention (matches
 * `ss_landing_page_variant` already in use for the quiz split).
 */
export const AD_HEADER_COOKIE = 'ss_ad_header';
export const AD_HEADLINE_COOKIE = 'ss_ad_headline';

export const FLAG_REGISTRY = {
  ad_header: {
    label: 'Advertorial · Header image',
    envName: 'AD_HEADER_WEIGHTS',
    variants: ['control_h2', 'challenger_e2'],
    // AmericanPerksClub launch: 50/50 header test, headline pinned.
    fallback: { control_h2: 0.5, challenger_e2: 0.5 },
    scope: 'advertorial',
    slot: 'header',
  },
  ad_headline: {
    label: 'Advertorial · Headline angle',
    envName: 'AD_HEADLINE_WEIGHTS',
    variants: ['local_geo', 'retiree_listicle'],
    // Pinned to local_geo while the header test runs. Flip weights via
    // AD_HEADLINE_WEIGHTS env var when it's this dimension's turn.
    fallback: { local_geo: 1, retiree_listicle: 0 },
    scope: 'advertorial',
    slot: 'headline',
  },
} as const satisfies Record<string, FlagDimension>;

export type FlagRegistryKey = keyof typeof FLAG_REGISTRY;

/**
 * Client-side cookie lookup — matches the cookie names middleware sets.
 * Kept next to the registry so a rename touches one place.
 */
export const COOKIE_BY_KEY: Record<FlagRegistryKey, string> = {
  ad_header: AD_HEADER_COOKIE,
  ad_headline: AD_HEADLINE_COOKIE,
};

/** Type-cast for consumers that just want the generic shape. */
export const FLAG_REGISTRY_GENERIC: FlagRegistry = FLAG_REGISTRY;
