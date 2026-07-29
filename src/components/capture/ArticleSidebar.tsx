'use client'

import ResourceAdCard from './ResourceAdCard'
import { useResolvedMagnet } from './useResolvedMagnet'

export interface ArticleSidebarProps {
  slug: string
  className?: string
}

/**
 * Right rail rendered alongside `EnhancedArticleDisplay` on desktop.
 * Slots:
 *   1. Internal ResourceAdCard — Medicare magnet from slug config, or the
 *      site-wide default (decision-kit) for non-Medicare articles.
 *   2. External ad slot (AdSense placeholder — see comment below).
 *
 * Hidden on <lg viewports. Pair with `<ArticleInlineResourceAd>` inside the
 * article body for mobile placement.
 */
export default function ArticleSidebar({ slug, className = '' }: ArticleSidebarProps) {
  const resolved = useResolvedMagnet(slug)

  return (
    <aside
      aria-label="Article sidebar"
      className={`hidden lg:block ${className}`}
    >
      <div className="sticky top-8 space-y-6">
        {resolved && (
          <ResourceAdCard
            magnetId={resolved.magnetId}
            pageSlug={slug}
            topicTag={resolved.topicTag}
            abArm={resolved.abArm}
            layout="sidebar"
          />
        )}

        {/*
          External ad slot — AdSense integration TBD.

          To wire AdSense later:
            1. Add the loader script once in src/app/layout.tsx:
               <Script
                 async
                 crossOrigin="anonymous"
                 src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX"
                 strategy="afterInteractive"
               />
            2. Replace the placeholder <div> below with:
               <ins
                 className="adsbygoogle block"
                 style={{ display: 'block' }}
                 data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
                 data-ad-slot="YYYYYYYYYY"
                 data-ad-format="auto"
                 data-full-width-responsive="true"
               />
            3. In a useEffect on mount:
               ;(window as any).adsbygoogle = (window as any).adsbygoogle || []
               ;(window as any).adsbygoogle.push({})
        */}
        <div
          className="rounded-xl border border-dashed border-[#36596A]/20 bg-[#F5F5F0]/40 p-6 text-center"
          aria-label="Advertisement slot"
        >
          <p className="text-xs uppercase tracking-widest text-[#36596A]/40 mb-2">
            Advertisement
          </p>
          <p className="text-sm text-[#36596A]/60">Ad slot reserved</p>
        </div>
      </div>
    </aside>
  )
}
