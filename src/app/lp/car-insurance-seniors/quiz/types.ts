/**
 * Shared shape for every tap-quiz variant on the auto-insurance LP.
 *
 * Every variant is a server component that renders tap tiles. Each tile is
 * an `<a>` pointing at the fully-composed offer URL for its s3 value —
 * built by the parent via `buildOfferUrl(s3)`, so no variant touches the
 * MaxBounty base URL directly. Config flip = swap the component; the
 * interface is the same.
 *
 * v1 ships `vehicle_make`. Future variants (state_map_tap, age_tap,
 * make_age combos) implement the same interface with no page changes.
 */

export type QuizVariantId =
  | 'vehicle_make'
  | 'state_map_tap'
  | 'age_tap'
  | 'make_age';

export interface QuizVariantProps {
  /** Compose the final offer URL for a tapped tile's s3 value. */
  buildOfferUrl: (s3: string) => string;
}
