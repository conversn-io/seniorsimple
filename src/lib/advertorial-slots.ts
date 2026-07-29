/**
 * Advertorial slot resolver (Local Copy for SeniorSimple)
 *
 * Canonical: ../../../../shared-utils/advertorial-slots.ts
 * To update: Copy changes from shared-utils/advertorial-slots.ts.
 *
 * Used by the future /lp/[slug] page's server component to map
 * composer-emitted variant arrays + cookie assignments → the header src +
 * H1 text to render. First entry of each variant array is treated as
 * control; unknown assignments fall back safely to control.
 */

export type AdvertorialSlots = {
  headerSrc: string | null;
  headerId: string | null;
  headline: string | null;
  headlineId: string | null;
};

export type HeaderVariant = { id: string; src: string };
export type HeadlineVariant = { id: string; text: string };

export interface ResolveAdvertorialSlotsInput {
  headerVariants: HeaderVariant[];
  headlineVariants: HeadlineVariant[];
  assigned: {
    header?: string | null;
    headline?: string | null;
  };
}

export function resolveAdvertorialSlots(
  input: ResolveAdvertorialSlotsInput
): AdvertorialSlots {
  const { headerVariants, headlineVariants, assigned } = input;

  const header =
    headerVariants.find((v) => v.id === assigned.header) ??
    headerVariants[0] ??
    null;

  const headline =
    headlineVariants.find((v) => v.id === assigned.headline) ??
    headlineVariants[0] ??
    null;

  return {
    headerSrc: header ? header.src : null,
    headerId: header ? header.id : null,
    headline: headline ? headline.text : null,
    headlineId: headline ? headline.id : null,
  };
}
