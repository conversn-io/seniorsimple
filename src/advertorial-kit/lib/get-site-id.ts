/**
 * Which brand am I? The advertorial kit is installed into a per-property
 * Next.js app (Architecture B) — each app knows its own site_id from env,
 * so the router / renderer never has to sniff the Host header.
 *
 * Configure in .env.local / Vercel:
 *
 *   ADVERTORIAL_SITE_ID=seniorsimple          # SeniorSimple
 *   ADVERTORIAL_SITE_ID=moneysimple           # MoneySimple
 *   ADVERTORIAL_SITE_ID=rateroots.com         # RateRoots (canonical key includes .com)
 *   ADVERTORIAL_SITE_ID=homesimple            # HomeSimple
 *   ADVERTORIAL_SITE_ID=parentsimple          # ParentSimple
 *
 * Falls back to the value passed to configureAdvertorialSiteId() at app boot,
 * or to 'seniorsimple' as an absolute last resort in dev (never in production).
 */

let configured: string | null = null

/**
 * Set the app-level default at boot when you don't want to rely on env.
 * Property apps can call this in a top-level module.
 */
export function configureAdvertorialSiteId(siteId: string): void {
  configured = siteId
}

export function getSiteId(): string {
  const fromEnv = process.env.ADVERTORIAL_SITE_ID
  if (fromEnv && fromEnv.length > 0) return fromEnv
  if (configured) return configured
  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'ADVERTORIAL_SITE_ID is not set. Configure it in your Vercel env or call ' +
      'configureAdvertorialSiteId() at boot.',
    )
  }
  // Dev fallback so previews render without env plumbing.
  return 'seniorsimple'
}
