'use client'

/**
 * KitTracker — fires the kit's analytics event stream on the client.
 *
 * Mounted inside KitCtaShell so every DB-driven kit render (any advertorial
 * where at least one item has a component_type) reports the same lp_view
 * event legacy LpPage fires, plus kit-specific lp_cta_click / lp_component_tap
 * events on interaction.
 *
 * The `lp_view` event schema matches legacy exactly (event_category:
 * 'advertorial', event_label: 'view', properties.site_key etc.) so reports
 * that join by session_id + slug see kit + legacy sessions identically.
 *
 * On top, kit events include s1..s8 canonical tokens (W6 taxonomy) plus
 * component_type + variant for slice-and-dice.
 */

import { useEffect } from 'react'

import { SITE_KEY, fireKitEvent, getOrCreateSessionId } from '@/advertorial-kit/lib/analytics'

interface KitTrackerProps {
  slug: string
  brand: string
  variant?: string | null
}

export function KitTracker({ slug, brand, variant }: KitTrackerProps) {
  useEffect(() => {
    const sessionId = getOrCreateSessionId()
    fireKitEvent(
      'lp_view',
      {
        site_key: SITE_KEY,
        brand,
        slug,
        component_type: null,
        variant,
      },
      { sessionId, eventLabel: 'view' },
    )
  }, [slug, brand, variant])

  return null
}
