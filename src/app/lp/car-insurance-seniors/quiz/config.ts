/**
 * Quiz-variant config flip for the auto-insurance LP.
 *
 * Change ACTIVE_VARIANT to swap the tap component; no other files need to
 * change. Also accepts a per-request override via `?quiz=<variant>` (see
 * page.tsx) so ops can QA a new variant without a redeploy.
 *
 * Implemented: `vehicle_make`, `age_tap`. Other ids are declared for
 * type-safety and will fall back to ACTIVE_VARIANT until wired up.
 */

import type { QuizVariantId } from './types';

export const ACTIVE_VARIANT: QuizVariantId = 'age_tap';

export const IMPLEMENTED_VARIANTS: readonly QuizVariantId[] = [
  'vehicle_make',
  'age_tap',
];

export function isImplemented(v: QuizVariantId): boolean {
  return IMPLEMENTED_VARIANTS.includes(v);
}
