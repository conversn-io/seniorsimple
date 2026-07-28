// WORKORDER-Sitemap-Live-Wiring-2026-07-28 §2b:
//   seniorsimple's ONE canonical served path is /articles/<slug>. The
//   /content/ prefix was serving duplicate content that competed with
//   /articles/ in Google's index (documented "Duplicate without user-selected
//   canonical" ticket). This route now unconditionally 308-redirects to
//   /articles/<slug>. Any /content/<slug> href in the wild — nav, internal
//   links, external inbound — resolves to a single canonical URL.
//
// A 308 is the App-Router-native permanent redirect (Google treats 301 and
// 308 equivalently for canonical-signal purposes). No DB lookup here: if the
// destination slug doesn't exist, /articles/[slug] will 404 downstream, which
// is the correct behavior for a bogus slug either way, and saves a per-crawl
// Supabase round-trip.

import { permanentRedirect } from 'next/navigation'

interface ContentPageProps {
  params: Promise<{ slug: string }>
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function ContentPage({ params }: ContentPageProps) {
  const { slug } = await params
  permanentRedirect(`/articles/${slug}`)
}
