// WORKORDER-Sitemap-Live-Wiring-2026-07-28 §2b:
//   146/196 seniorsimple articles have DB canonical_url pointing at the root
//   path (https://www.seniorsimple.org/<slug>) — which currently 404s because
//   there is no root [slug] route. Google's crawl of the sitemap follows the
//   canonical → dead URL → doesn't index.
//
// This route intercepts root slugs that map to a real published article and
// 308-redirects them to /articles/<slug>. Slugs that don't match a published
// article fall through to notFound() (correct — a random typo at root should
// still 404).
//
// Next.js matches static routes (e.g. /retirement, /contact, /faq) BEFORE
// this dynamic segment, so those routes are unaffected. This ONLY fires for
// slugs that don't already own a route file.

import { notFound, permanentRedirect } from 'next/navigation'
import { supabase } from '@/lib/supabase'

interface RootSlugPageProps {
  params: Promise<{ slug: string }>
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function RootSlugPage({ params }: RootSlugPageProps) {
  const { slug } = await params

  // Bail early on obviously non-article paths so we don't hit the DB on every
  // rogue crawler request. Slugs live in kebab-case a-z0-9; anything else
  // isn't a candidate.
  if (!/^[a-z0-9][a-z0-9-]*$/.test(slug)) {
    notFound()
  }

  const { data, error } = await supabase
    .from('articles')
    .select('slug')
    .eq('slug', slug)
    .eq('site_id', 'seniorsimple')
    .eq('status', 'published')
    .maybeSingle()

  if (error || !data) {
    notFound()
  }

  permanentRedirect(`/articles/${slug}`)
}
