import { Playfair_Display } from 'next/font/google';

/**
 * Playfair Display — the DR-editorial serif used for FPP headlines.
 * Geist (body sans) is already loaded globally in the root layout as
 * `--font-geist-sans`, so we don't reload it here.
 *
 * Applied by adding `playfairDisplay.variable` to a wrapper's className, then
 * referencing `var(--font-playfair)` in tokens.css under the `.fpp` scope.
 */
export const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--font-playfair',
  display: 'swap',
});
