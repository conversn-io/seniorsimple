/**
 * Quiz-variant switcher for the auto-insurance LP.
 *
 * Selects the correct tap-quiz component for the active variant. The
 * variant comes from `quiz/config.ts` (config flip) with an optional
 * per-request override via the caller — page.tsx accepts `?quiz=<variant>`
 * for QA.
 *
 * Implementations: `vehicle_make`, `age_tap`. Other declared variants
 * fall back to the ACTIVE_VARIANT so a mis-typed config never renders a
 * blank page.
 */

import AgeBandTap from './AgeBandTap';
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
    case 'age_tap':
      return <AgeBandTap buildOfferUrl={buildOfferUrl} />;
    case 'vehicle_make':
      return <VehicleMakeGrid buildOfferUrl={buildOfferUrl} />;
    default:
      return <VehicleMakeGrid buildOfferUrl={buildOfferUrl} />;
  }
}
