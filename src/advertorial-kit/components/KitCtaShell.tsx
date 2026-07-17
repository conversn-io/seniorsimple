'use client'

/**
 * KitCtaShell — client-side wrapper that installs a CtaProvider for library
 * components that call `useCtaHref()` / `useSetCtaSelection()` (EditorsPick,
 * MultiSelectQuiz, ImageQuiz, PrimaryCTA, SectionCTA, StickyCTA, etc.).
 *
 * The kit builds per-slot outbound URLs at server render time and passes
 * them into each component via the `href` override where the component
 * supports it. This provider therefore only exists to satisfy the hook call
 * on components that don't accept an override — its `base` is unused when
 * overrides are supplied everywhere.
 *
 * The `subs` map still flows through the provider so an interactive quiz
 * (e.g. MultiSelectQuiz) can attach its selection to the CTA it renders — but
 * the base is a per-slug fallback ('/lp/<slug>') so a misconfigured component
 * navigates back to the article rather than emitting an off-brand URL.
 */

import { CtaProvider, type CtaSubs } from '@/components/advertorial-library'

interface KitCtaShellProps {
  slug: string
  siteId: string
  children: React.ReactNode
}

export default function KitCtaShell({ slug, siteId, children }: KitCtaShellProps) {
  const subs: CtaSubs = {
    source_id: siteId,
    sub1: '',
    sub2: '',
    sub3: '',
    sub4: '',
    sub5: slug,
  }
  return (
    <CtaProvider base={`/lp/${encodeURIComponent(slug)}`} subs={subs}>
      {children}
    </CtaProvider>
  )
}
