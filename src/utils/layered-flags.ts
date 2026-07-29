/**
 * Layered Feature Flags (Local Copy for SeniorSimple)
 *
 * Canonical: ../../../../shared-utils/layered-flags.ts
 * To update: Copy changes from shared-utils/layered-flags.ts.
 *
 * Advertorial-type split test allocation core. Multi-dimensional flag
 * assignment on the same page (header + headline vary independently),
 * no redirect. Contrast with `ab-test-middleware.ts` (redirect model for
 * quiz-funnel splits) — both coexist in `middleware.ts`.
 */
import type { NextRequest, NextResponse } from 'next/server';

export interface FlagDef {
  cookie: string;
  variants: string[];
  weights?: Record<string, number>;
  queryParam?: string;
  cookieTtlDays?: number;
}

export interface LayeredFlagsConfig {
  flags: Record<string, FlagDef>;
  siteKey?: string;
}

export interface FlagAssignment {
  variant: string;
  persist: boolean;
  cookieName: string;
  cookieTtlDays: number;
}

export type FlagAssignments = Record<string, FlagAssignment>;

function assignVariant(def: FlagDef): string {
  const allowed = def.variants;
  const weights = def.weights || {};

  const valid: Array<[string, number]> = [];
  let total = 0;
  for (const v of allowed) {
    const w = weights[v];
    if (typeof w === 'number' && Number.isFinite(w) && w >= 0) {
      valid.push([v, w]);
      total += w;
    }
  }

  if (total === 0) {
    const i = Math.floor(Math.random() * allowed.length);
    return allowed[i] || allowed[0];
  }

  const r = Math.random() * total;
  let acc = 0;
  for (const [v, w] of valid) {
    acc += w;
    if (r < acc) return v;
  }
  return valid[valid.length - 1]?.[0] || allowed[0];
}

export function resolveFlags(
  request: NextRequest,
  config: LayeredFlagsConfig
): FlagAssignments {
  const { searchParams } = request.nextUrl;
  const out: FlagAssignments = {};

  for (const [key, def] of Object.entries(config.flags)) {
    const cookieName = def.cookie;
    const queryParam = def.queryParam || key;
    const cookieTtlDays = def.cookieTtlDays ?? 30;

    const queryVal = searchParams.get(queryParam);
    if (queryVal && def.variants.includes(queryVal)) {
      out[key] = { variant: queryVal, persist: true, cookieName, cookieTtlDays };
      continue;
    }

    const cookieVal = request.cookies?.get?.(cookieName)?.value;
    if (cookieVal && def.variants.includes(cookieVal)) {
      out[key] = { variant: cookieVal, persist: false, cookieName, cookieTtlDays };
      continue;
    }

    out[key] = { variant: assignVariant(def), persist: true, cookieName, cookieTtlDays };
  }

  return out;
}

export function applyFlagAssignments(
  response: NextResponse,
  assignments: FlagAssignments,
  siteKey?: string
): NextResponse {
  for (const [key, a] of Object.entries(assignments)) {
    if (a.persist) {
      const expires = new Date();
      expires.setTime(expires.getTime() + a.cookieTtlDays * 24 * 60 * 60 * 1000);
      response.cookies.set(a.cookieName, a.variant, {
        expires,
        path: '/',
        sameSite: 'lax',
        httpOnly: false,
      });
    }
    response.headers.set(`X-Flag-${key}`, a.variant);
  }
  if (siteKey) response.headers.set('X-Flag-Site', siteKey);
  return response;
}

export function readFlagWeights(
  envName: string,
  fallback: Record<string, number>
): Record<string, number> {
  const raw = process.env[envName];
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return fallback;
    const out: Record<string, number> = {};
    for (const [k, v] of Object.entries(parsed)) {
      if (typeof v !== 'number' || !Number.isFinite(v) || v < 0) return fallback;
      out[k] = v;
    }
    return Object.keys(out).length > 0 ? out : fallback;
  } catch {
    return fallback;
  }
}
