// WORKORDER-Sitemap-Live-Wiring-2026-07-28 TODO 1 — on-domain /sitemap.xml.
//
// Google fetches https://www.<domain>/sitemap.xml. The single source of truth
// for the URL list is the publishare edge function at
// vpysqshhafthuxvokwqj.supabase.co/functions/v1/sitemap — it generates each
// site's <urlset> live from the articles table so publishes self-heal without
// a redeploy. Cross-host sitemaps aren't accepted by Google's Domain
// property, so each tenant's own /sitemap.xml must serve the edge output.
//
// This route is host-aware: strips a leading `www.` from the request's
// hostname and forwards to the edge fn's ?site=<host> query. Same code works
// verbatim across every publishare-shaped tenant deploy (seniorsimple,
// parentsimple, moneysimple, homesimple, etc.) once dropped into their repo.
//
// The metadata-route sitemap.ts previously at src/app/sitemap.ts was removed
// in the same commit — it emitted duplicate /articles/ + /content/ URLs for
// every article and constructed a hand-rolled URL list that drifted from the
// CMS. This route replaces it as the sole /sitemap.xml handler.
//
// Predecessor at this path proxied to the legacy `serve-sitemap` fn with an
// anon-key header. Replaced: the new `sitemap` fn is public (verify_jwt=false
// per the work order), so no auth header needed. force-static was also
// removed — it would collapse per-host handling into one cached response.

const EDGE_FN_URL = 'https://vpysqshhafthuxvokwqj.supabase.co/functions/v1/sitemap'

export const revalidate = 3600

export async function GET(req: Request) {
  const host = new URL(req.url).hostname.replace(/^www\./, '')
  const upstream = await fetch(`${EDGE_FN_URL}?site=${encodeURIComponent(host)}`, {
    next: { revalidate: 3600 },
  })

  if (!upstream.ok) {
    return new Response(`<!-- sitemap unavailable: ${upstream.status} -->`, {
      status: 503,
      headers: { 'Content-Type': 'application/xml; charset=utf-8' },
    })
  }

  return new Response(await upstream.text(), {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
