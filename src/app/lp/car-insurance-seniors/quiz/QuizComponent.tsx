/**
 * Quiz-variant switcher for the auto-insurance LP.
 *
 * Selects the correct tap-quiz component for the active variant. The
 * variant comes from `quiz/config.ts` (config flip) with an optional
 * per-request override via the caller — page.tsx accepts `?quiz=<variant>`
 * for QA.
 *
 * v1 implementations: `vehicle_make`. Other declared variants fall back
 * to vehicle_make so a mis-typed config never renders a blank page.
 */

import { ACTIVE_VARIANT, isImplemented } from './config';
import type { QuizVariantId, QuizVariantProps } from './types';
import VehicleMakeGrid from './VehicleMakeGrid';

export interface QuizComponentProps extends QuizVariantProps {
  variant?: QuizVariantId;
}

export function QuizComponent({ variant, buildOfferUrl }: QuizComponentProps) {
  const chosen: QuizVariantId =
    variant && isImplemented(variant) ? variant : ACTIVE_VARIANT;

  switch (chosen) {
    case 'vehicle_make':
      return <VehicleMakeGrid buildOfferUrl={buildOfferUrl} />;
    default:
      return <VehicleMakeGrid buildOfferUrl={buildOfferUrl} />;
  }
}
