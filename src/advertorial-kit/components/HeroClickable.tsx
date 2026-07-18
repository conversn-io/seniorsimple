'use client'

/**
 * HeroClickable — wraps the advertorial hero image in an `/out` anchor with
 * the same analytics payload the button + item-image CTAs fire.
 *
 * Mounted from page.tsx when the advertorial has a hero_image_url AND slot 1
 * is active. Renders inside AdvertorialLayout via the `heroImageNode` slot so
 * the click is a real client-side event source (AdvertorialLayout itself is
 * a server component).
 *
 * Handoff §"Change 2": "Hero (advertorials.hero_image_url): clickable to
 * /out/<slug>/1?component=hero when slot 1 is active."
 */

import { SITE_KEY, fireKitEvent } from '@/advertorial-kit/lib/analytics'

interface HeroClickableProps {
  src: string
  alt?: string
  outHref: string
  brand: string
  slug: string
  variant: string | null
  slotKey: number
}

export function HeroClickable({
  src, alt, outHref, brand, slug, variant, slotKey,
}: HeroClickableProps) {
  return (
    <a
      href={outHref}
      rel="nofollow sponsored"
      target="_blank"
      data-component="hero"
      data-slot-key={slotKey}
      onClick={() => {
        fireKitEvent(
          'lp_cta_click',
          {
            site_key: SITE_KEY,
            brand,
            slug,
            component_type: 'hero',
            variant,
          },
          {
            eventLabel: `slot_${slotKey}`,
            extraProps: {
              slot_key: slotKey,
              cta_target: 'hero_image',
            },
          },
        )
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt ?? ''}
        className="w-full rounded-md border border-slate-200"
        loading="eager"
      />
    </a>
  )
}
