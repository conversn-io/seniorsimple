/**
 * Shared prop shape between LpPage → AngleABody / AngleBBody.
 */

export interface AngleBodyProps {
  headline: string | null;
  headerSrc: string | null;
  /** Prismique tracking URL with sub1–sub5 already filled in. */
  ctaHref: string;
  /** Geo-personalized state name — used by Angle A for the {STATE} token. */
  stateName: string;
  /** Same value with sensible in-copy fallback (e.g. "your area"). */
  stateArea: string;
}
