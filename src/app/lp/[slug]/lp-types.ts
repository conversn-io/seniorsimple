/**
 * Shared prop shape between LpPage → AngleABody / AngleBBody.
 *
 * No `ctaHref` field — bodies pull the resolved offer URL from CtaContext
 * (see components/CtaContext.tsx). LpPage installs the provider once at
 * the top of the tree.
 */

export interface AngleBodyProps {
  headline: string | null;
  headerSrc: string | null;
  /** Geo-personalized state name — used by Angle A for the {STATE} token. */
  stateName: string;
  /** Same value with sensible in-copy fallback (e.g. "your area"). */
  stateArea: string;
}
