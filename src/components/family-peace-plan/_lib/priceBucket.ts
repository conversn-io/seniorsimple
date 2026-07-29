import type { PriceBucket } from './analytics';

/**
 * Server-side deterministic price bucket for the $47/$67 A/B test.
 * We derive it from the request's inbound cookies via searchParams, or fall
 * back to control ($47). The user-visible price never appears on the Next.js
 * offer page — this bucket just tags analytics + is forwarded to GHL so GHL's
 * order form shows the matching price.
 *
 * Reading a `?price_bucket=67` query param lets us hand-force a bucket for QA
 * without dropping any cookies. Real 50/50 split happens in GHL.
 */
export function resolvePriceBucket(searchParams?: Record<string, string | string[] | undefined>): PriceBucket {
  const raw = searchParams?.price_bucket;
  const val = Array.isArray(raw) ? raw[0] : raw;
  return val === '67' ? 67 : 47;
}
