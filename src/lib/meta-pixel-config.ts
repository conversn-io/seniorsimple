/**
 * Meta Pixel Configuration for SeniorSimple
 * 
 * Handles multiple pixel IDs based on funnel type:
 * - Main SeniorSimple pixel: 24221789587508633
 * - Final Expense (FEX) pixel: 1963989871164856
 */

export const META_PIXEL_IDS = {
  MAIN: '24221789587508633',
  FEX: '1963989871164856',
} as const;

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
 * Get the appropriate Meta Pixel ID based on the current route
 */
export function getMetaPixelId(pathname: string): string {
  return isFEXFunnel(pathname) ? META_PIXEL_IDS.FEX : META_PIXEL_IDS.MAIN;
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
  
  return pixels;
}

