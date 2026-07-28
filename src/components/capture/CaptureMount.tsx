'use client'

import { useEffect, useState } from 'react'
import CaptureUnit from './CaptureUnit'
import { getKit, getPageConfig, resolvePageMagnet } from '@/lib/capture-kits'
import type { Vertical, CaptureVariant } from '@/lib/capture-kits/types'

interface CaptureMountProps {
  /** Vertical whose kit configures this page's captures (RSC-safe prop). */
  vertical: Vertical
  slug: string
  /** Which variants from the config to render. Defaults to all in the config. */
  only?: CaptureVariant[]
  /** Optional post-tool result payload for tool-gate variant. */
  resultPayload?: unknown
}

/**
 * Client-only wrapper that resolves a page's capture config + A/B arm from
 * the kit, then renders the configured variants. No-ops when the slug isn't
 * in the kit's pageConfigs (safe to drop into any client tree).
 */
export default function CaptureMount({
  vertical,
  slug,
  only,
  resultPayload,
}: CaptureMountProps) {
  const kit = getKit(vertical)
  const config = kit ? getPageConfig(kit, slug) : null
  const [resolved, setResolved] = useState<{
    magnetId: string
    abArm?: string
  } | null>(null)

  useEffect(() => {
    if (!config) return
    setResolved(resolvePageMagnet(config))
  }, [config])

  if (!kit || !config || !resolved) return null

  const requested = only ?? config.variants
  // CaptureUnit only supports the two panel variants; sidebar-ad / inline-ad
  // are rendered elsewhere (ArticleSidebar / ArticleInlineResourceAd).
  const variantsToRender = requested.filter(
    (v): v is 'inline' | 'tool-gate' =>
      (v === 'inline' || v === 'tool-gate') && config.variants.includes(v),
  )

  return (
    <>
      {variantsToRender.map((variant) => (
        <CaptureUnit
          key={variant}
          kit={kit}
          pageSlug={config.slug}
          variant={variant}
          magnetId={resolved.magnetId}
          topicTag={config.topicTag}
          abArm={resolved.abArm}
          resultPayload={variant === 'tool-gate' ? resultPayload : undefined}
        />
      ))}
    </>
  )
}
