/**
 * Build the LayeredFlagsConfig middleware feeds into `resolveFlags` for
 * advertorial (`/lp/*`) paths.
 *
 * Weight resolution today: env var → registry fallback (via
 * `readFlagWeights` from layered-flags). Swap to `flag-store.getWeights`
 * (three-tier: Edge Config → env → fallback) once @vercel/edge-config is
 * added to package.json.
 */

import { readFlagWeights, type LayeredFlagsConfig } from '../utils/layered-flags';
import {
  FLAG_REGISTRY,
  COOKIE_BY_KEY,
  type FlagRegistryKey,
} from './flag-registry';

const ADVERTORIAL_KEYS: FlagRegistryKey[] = ['ad_header', 'ad_headline'];

/**
 * Static, sync build — safe on the edge runtime. When Edge Config is added,
 * switch this to async and await `getWeights(envName, fallback)` per key.
 */
export function buildAdvertorialFlagsConfig(siteKey: string): LayeredFlagsConfig {
  const flags: LayeredFlagsConfig['flags'] = {};
  for (const key of ADVERTORIAL_KEYS) {
    const dim = FLAG_REGISTRY[key];
    flags[key] = {
      cookie: COOKIE_BY_KEY[key],
      variants: [...dim.variants],
      weights: readFlagWeights(dim.envName, dim.fallback),
      queryParam: key, // matches guideline: ?ad_header=... / ?ad_headline=...
      cookieTtlDays: 30,
    };
  }
  return { flags, siteKey };
}
