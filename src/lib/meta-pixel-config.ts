/**
 * Meta Pixel Configuration for SeniorSimple
 *
 * Handles multiple pixel IDs based on funnel type:
 * - Main SeniorSimple pixel: 24221789587508633   (hardcoded)
 * - Final Expense (FEX) pixel: 1963989871164856  (hardcoded)
 * - Reverse Mortgage pixel: from NEXT_PUBLIC_META_PIXEL_ID_REVERSE_MORTGAGE
 *
 * The reverse-mortgage pixel ID is sourced from env (not hardcoded) so it can
 * be rotated without a code deploy. The server-side `meta-capi-service.ts`
 * already reads `META_PIXEL_ID_REVERSE_MORTGAGE` for CAPI Lead fires; this
 * file mirrors it for the BROWSER pixel so client `fbq('init', ...)` lands on
 * the same pixel the server CAPI events land on. Without this mirror, the
 * reverse-mortgage pixel only ever sees server events — no browser PageView /
 * Lead — which crushes Meta's match quality and breaks Ads Manager attribution.
 */

// Note: this is read at module load. NEXT_PUBLIC_* env vars are statically
// inlined by Next.js at build time, so this resolves to the literal value (or
// the empty string if unset) in the client bundle.
const REVERSE_MORTGAGE_PIXEL_ID =
  process.env.NEXT_PUBLIC_META_PIXEL_ID_REVERSE_MORTGAGE || '';

export const META_PIXEL_IDS = {
  MAIN: '24221789587508633',
  FEX: '1963989871164856',
  REVERSE_MORTGAGE: REVERSE_MORTGAGE_PIXEL_ID,
};

/**
 * Check if current path is part of the Final Expense funnel
 */
export function isFEXFunnel(pathname: string): boolean {
  const fexFunnelPaths = [
    '/free-burial-life-insurance-guide',
    '/final-expense-quote',
    '/insurance-guide-confirmation',
    '/custom-quote-confirmation',
    '/appointmentconfirmation',
    '/new-burial-life-insurance-quote',
    '/appointment-follow-up',
    '/burial-insurance-guide',
  ];

  return fexFunnelPaths.some(path => pathname.startsWith(path));
}

/**
 * Check if current path is part of the Reverse Mortgage funnel.
 *
 * Covers the full funnel surface: landing, quiz, results, results-alt, and
 * the not-qualified page. Lets `MetaPixelInitializer` know it should init the
 * reverse-mortgage pixel (in addition to MAIN) so browser PageView + Lead
 * fires reach the same pixel the server-side CAPI events use.
 */
export function isReverseMortgageFunnel(pathname: string): boolean {
  return pathname.startsWith('/reverse-mortgage-calculator');
}

/**
 * Get the appropriate Meta Pixel ID based on the current route
 */
export function getMetaPixelId(pathname: string): string {
  if (isFEXFunnel(pathname)) return META_PIXEL_IDS.FEX;
  if (isReverseMortgageFunnel(pathname) && META_PIXEL_IDS.REVERSE_MORTGAGE) {
    return META_PIXEL_IDS.REVERSE_MORTGAGE;
  }
  return META_PIXEL_IDS.MAIN;
}

/**
 * Get all active pixel IDs (for dual tracking if needed)
 */
export function getActivePixelIds(pathname: string): string[] {
  const pixels: string[] = [];

  // Always include main pixel
  pixels.push(META_PIXEL_IDS.MAIN);

  // Add FEX pixel if on FEX funnel
  if (isFEXFunnel(pathname)) {
    pixels.push(META_PIXEL_IDS.FEX);
  }

  // Add reverse-mortgage pixel if on RM funnel AND the env var is set. The
  // env-var guard makes this a safe no-op until ops sets
  // NEXT_PUBLIC_META_PIXEL_ID_REVERSE_MORTGAGE in Vercel; nothing changes
  // until that's in place.
  if (isReverseMortgageFunnel(pathname) && META_PIXEL_IDS.REVERSE_MORTGAGE) {
    pixels.push(META_PIXEL_IDS.REVERSE_MORTGAGE);
  }

  return pixels;
}

