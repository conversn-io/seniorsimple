/**
 * WO-843 §3C — Retreaver DNI number resolution.
 *
 * Requests a per-visitor tracking number from the Retreaver pool and tags it
 * with the full attribution bundle, so the call record carries
 * campaign/adset/ad/placement all the way to `fet_call_facts`.
 *
 * Design rule: THE VISITOR ALWAYS GETS A WORKING NUMBER. Every failure path
 * (script blocked, campaign paused, timeout, JS error) resolves to the static
 * FET line rather than rejecting. Losing attribution on one visitor is a
 * reporting gap; showing them a dead number is a lost sale.
 */

import { FALLBACK_NUMBER, RETREAVER, formatPhoneDisplay } from './config';
import type { AttributionBundle } from './params';
import { toRetreaverTags } from './params';

export interface ResolvedNumber {
  /** E.164, for the tel: href. */
  e164: string;
  /** Pretty form, for display. */
  display: string;
  /** True when this came from Retreaver DNI; false when it's the fallback. */
  tracked: boolean;
}

export const FALLBACK_RESOLVED: ResolvedNumber = {
  e164: FALLBACK_NUMBER.e164,
  display: FALLBACK_NUMBER.display,
  tracked: false,
};

/* ------------------------------------------------------------------ *
 * Retreaver global (loaded by the CDN script)
 * ------------------------------------------------------------------ */

interface RetreaverNumber {
  get(key: 'number'): string;
  get(key: 'formatted_number'): string;
  get(key: string): string;
}

interface RetreaverCampaign {
  request_number(
    tags: Record<string, string>,
    onSuccess: (number: RetreaverNumber) => void,
    onError?: (err: unknown) => void,
  ): void;
}

declare global {
  interface Window {
    Retreaver?: {
      configure?: (opts: Record<string, unknown>) => void;
      Campaign: new (opts: { campaign_key: string }) => RetreaverCampaign;
    };
  }
}

/* ------------------------------------------------------------------ *
 * Script loading — one shared promise, never blocks render
 * ------------------------------------------------------------------ */

let scriptPromise: Promise<boolean> | null = null;

function loadRetreaverScript(): Promise<boolean> {
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise<boolean>((resolve) => {
    if (typeof window === 'undefined') return resolve(false);
    if (window.Retreaver) return resolve(true);

    const existing = document.querySelector<HTMLScriptElement>(
      `script[data-fe-retreaver="1"]`,
    );
    if (existing) {
      existing.addEventListener('load', () => resolve(true));
      existing.addEventListener('error', () => resolve(false));
      return;
    }

    const el = document.createElement('script');
    el.src = RETREAVER.scriptSrc;
    el.async = true;
    el.dataset.feRetreaver = '1';
    el.addEventListener('load', () => resolve(true));
    el.addEventListener('error', () => resolve(false));
    document.head.appendChild(el);
  });

  return scriptPromise;
}

/* ------------------------------------------------------------------ *
 * Number resolution
 * ------------------------------------------------------------------ */

/**
 * Resolve a tracking number for this visitor.
 *
 * @param bundle  attribution captured on landing
 * @param extraTags  page-level tags (gateway id, path, segment)
 *
 * Never rejects. Resolves to FALLBACK_RESOLVED on any failure, including a
 * paused Retreaver campaign — which is the current state of campaign 50184,
 * so expect `tracked: false` until it is unpaused.
 */
export async function resolveTrackingNumber(
  bundle: AttributionBundle,
  extraTags: Record<string, string> = {},
): Promise<ResolvedNumber> {
  if (typeof window === 'undefined') return FALLBACK_RESOLVED;

  const loaded = await Promise.race([
    loadRetreaverScript(),
    new Promise<boolean>((r) => window.setTimeout(() => r(false), RETREAVER.timeoutMs)),
  ]);

  if (!loaded || !window.Retreaver) return FALLBACK_RESOLVED;

  const tags = toRetreaverTags(bundle, extraTags);

  return new Promise<ResolvedNumber>((resolve) => {
    let settled = false;
    const finish = (value: ResolvedNumber) => {
      if (settled) return;
      settled = true;
      resolve(value);
    };

    // Hard ceiling — a hung request must not leave the CTA without a number.
    window.setTimeout(() => finish(FALLBACK_RESOLVED), RETREAVER.timeoutMs);

    try {
      const campaign = new window.Retreaver!.Campaign({
        campaign_key: RETREAVER.campaignKey,
      });

      campaign.request_number(
        tags,
        (num) => {
          try {
            const raw = num.get('number');
            if (!raw) return finish(FALLBACK_RESOLVED);
            const e164 = raw.startsWith('+') ? raw : `+${raw.replace(/\D/g, '')}`;
            finish({
              e164,
              display: num.get('formatted_number') || formatPhoneDisplay(e164),
              tracked: true,
            });
          } catch {
            finish(FALLBACK_RESOLVED);
          }
        },
        () => finish(FALLBACK_RESOLVED),
      );
    } catch {
      finish(FALLBACK_RESOLVED);
    }
  });
}
