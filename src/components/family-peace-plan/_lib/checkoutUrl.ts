import type { PriceBucket, Band } from './analytics';

/**
 * Builds the GHL order-form URL for the Family Peace Plan offer.
 * Handoff (2026-07-08): commerce lives in GHL — the Next.js offer page never
 * reveals price; the CTA hands off to a GHL funnel with price_bucket + band + utm
 * on the query string so GHL A/B tests $47/$67 and analytics reconciles.
 *
 * Set NEXT_PUBLIC_FPP_CHECKOUT_URL to the GHL order-form URL. If unset (draft),
 * the CTA points at a placeholder that logs the intent instead of redirecting.
 */
const CHECKOUT_BASE = process.env.NEXT_PUBLIC_FPP_CHECKOUT_URL || '';

export function buildCheckoutUrl(opts: {
  priceBucket: PriceBucket;
  band?: Band;
  utm?: Record<string, string | undefined>;
}): string {
  if (!CHECKOUT_BASE) return '#checkout-not-configured';

  const url = new URL(CHECKOUT_BASE);
  url.searchParams.set('price_bucket', String(opts.priceBucket));
  if (opts.band) url.searchParams.set('band', opts.band);
  if (opts.utm) {
    for (const [k, v] of Object.entries(opts.utm)) {
      if (v) url.searchParams.set(k, v);
    }
  }
  return url.toString();
}

export const IS_CHECKOUT_CONFIGURED = Boolean(CHECKOUT_BASE);
