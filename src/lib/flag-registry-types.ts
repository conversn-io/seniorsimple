/**
 * Shared registry types (Local Copy for SeniorSimple)
 *
 * Canonical: ../../../../shared-utils/flag-registry-types.ts
 * To update: Copy changes from shared-utils/flag-registry-types.ts.
 */

export type FlagScope = 'quiz' | 'advertorial';

export type FlagDimension = {
  label: string;
  envName: string;
  variants: ReadonlyArray<string>;
  fallback: Record<string, number>;
  scope: FlagScope;
  /**
   * For advertorial dimensions only: which slot on the LP this dimension swaps.
   * Undefined for scope='quiz'.
   */
  slot?: 'header' | 'headline';
};

export type FlagRegistry = Readonly<Record<string, FlagDimension>>;
