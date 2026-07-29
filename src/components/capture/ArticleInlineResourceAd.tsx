'use client'

import ResourceAdCard from './ResourceAdCard'
import { useResolvedMagnet } from './useResolvedMagnet'
import { resolveKitForPage } from '@/lib/capture-kits'
import { medicareKit } from '@/lib/capture-kits/medicare'

export interface ArticleInlineResourceAdProps {
  slug: string
  /**
   * When true, this card only renders on mobile viewports (<lg) — used as the
   * sidebar's mobile fallback. Set to false when you want it inline on all
   * widths (e.g. inside a tool-page column).
   */
  mobileOnly?: boolean
}

/**
 * Horizontal ResourceAdCard mounted inside the article body. Pairs with
 * <ArticleSidebar> so mobile visitors still see an ad (the sidebar is hidden
 * on <lg) while desktop visitors only see the sidebar card.
 */
export default function ArticleInlineResourceAd({
  slug,
  mobileOnly = true,
}: ArticleInlineResourceAdProps) {
  const kit = resolveKitForPage(slug) ?? medicareKit
  const resolved = useResolvedMagnet(kit, slug)
  if (!resolved) return null

  const wrapperClass = mobileOnly ? 'lg:hidden' : ''

  return (
    <div className={wrapperClass}>
      <ResourceAdCard
        kit={kit}
        magnetId={resolved.magnetId}
        pageSlug={`inline-ad:${slug}`}
        topicTag={resolved.topicTag}
        abArm={resolved.abArm}
        layout="inline"
      />
    </div>
  )
}
