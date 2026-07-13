/**
 * Generic client-side reader (Local Copy for SeniorSimple)
 *
 * Canonical: ../../../../shared-utils/feature-flags-client.ts
 * To update: Copy changes from shared-utils/feature-flags-client.ts.
 *
 * Reads middleware-set cookies (and query overrides) and returns the current
 * variant per flag. Site tracking helpers call `readActiveFlagsForScope(...,
 * 'advertorial')` and stamp the result onto every event's properties.
 */

import type { FlagRegistry } from './flag-registry-types';

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = document.cookie.match(new RegExp('(?:^|;\\s*)' + escaped + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : null;
}

function readQuery(name: string): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return new URL(window.location.href).searchParams.get(name);
  } catch {
    return null;
  }
}

export interface ReadFlagsOptions {
  queryParams?: Record<string, string>;
  cookieNames?: Record<string, string>;
}

export function readActiveFlags(
  registry: FlagRegistry,
  cookieNameByKey: Record<string, string>,
  opts: ReadFlagsOptions = {}
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, def] of Object.entries(registry)) {
    const allowed = def.variants;
    const fallback = allowed[0];
    const cookie = opts.cookieNames?.[key] ?? cookieNameByKey[key] ?? '';
    const queryParam = opts.queryParams?.[key] ?? key;

    const fromQuery = readQuery(queryParam);
    if (fromQuery && (allowed as ReadonlyArray<string>).includes(fromQuery)) {
      out[key] = fromQuery;
      continue;
    }
    const fromCookie = cookie ? readCookie(cookie) : null;
    if (fromCookie && (allowed as ReadonlyArray<string>).includes(fromCookie)) {
      out[key] = fromCookie;
      continue;
    }
    out[key] = fallback;
  }
  return out;
}

export function readActiveFlagsForScope(
  registry: FlagRegistry,
  cookieNameByKey: Record<string, string>,
  scope: 'quiz' | 'advertorial',
  opts: ReadFlagsOptions = {}
): Record<string, string> {
  const all = readActiveFlags(registry, cookieNameByKey, opts);
  const out: Record<string, string> = {};
  for (const [key, variant] of Object.entries(all)) {
    if (registry[key]?.scope === scope) out[key] = variant;
  }
  return out;
}
