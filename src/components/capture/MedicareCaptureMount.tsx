'use client'

import { useEffect, useState } from 'react'
import MedicareCaptureUnit from './MedicareCaptureUnit'
import {
  getCaptureConfig,
  resolveCaptureMagnet,
  type CaptureVariant,
} from '@/lib/medicare-capture-config'

interface MedicareCaptureMountProps {
  slug: string
  /** Which variants from the config to render. Defaults to all non-tool-gate. */
  only?: CaptureVariant[]
  /** Optional post-tool result payload for tool-gate variant. */
  resultPayload?: unknown
}

/**
 * Client-only wrapper that resolves the page's capture config + A/B arm, then
 * renders the configured variants. Safe to drop into any client tree — no-ops
 * when the slug isn't in the Medicare capture config.
 */
export default function MedicareCaptureMount({
  slug,
  only,
  resultPayload,
}: MedicareCaptureMountProps) {
  const config = getCaptureConfig(slug)
  const [resolved, setResolved] = useState<{
    magnetId: ReturnType<typeof resolveCaptureMagnet>['magnetId']
    abArm?: string
  } | null>(null)

  useEffect(() => {
    if (!config) return
    setResolved(resolveCaptureMagnet(config))
  }, [config])

  if (!config || !resolved) return null

  const variantsToRender = (only ?? config.variants).filter((v) =>
    config.variants.includes(v),
  )

  return (
    <>
      {variantsToRender.map((variant) => (
        <MedicareCaptureUnit
          key={variant}
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
