/**
 * A single ordered block in an advertorial. Monetized items render a CTA
 * button that ALWAYS points at /out/[slug]/[slot_key] — never a raw affiliate
 * URL — so copy can be edited without touching offer wiring.
 *
 * item_type semantics (matches the DB CHECK constraint):
 *   • monetized — has a slot; renders a CTA + tracked link.
 *   • filler    — plain editorial, no slot, no link out.
 *   • bonus     — extra editorial (tips, sidebars). Same render as filler.
 *   • recap     — closing summary. Same render as filler.
 */

import type { AdvertorialBrand } from '@/lib/advertorials/brand-config'
import { AdvertorialCta } from './AdvertorialCta'

export interface AdvertorialItemData {
  position: number
  item_type: 'monetized' | 'filler' | 'bonus' | 'recap'
  heading: string | null
  bodyHtml: string       // pre-rendered from body_md (safe HTML)
  image_url: string | null
  cta_text: string | null
  slot_key: number | null   // present for monetized; null otherwise
}

interface Props {
  item: AdvertorialItemData
  slug: string
  brand: AdvertorialBrand
}

export function AdvertorialItem({ item, slug, brand }: Props) {
  const showCta = item.item_type === 'monetized' && item.slot_key !== null

  return (
    <section
      data-item-type={item.item_type}
      data-position={item.position}
      className="mt-10 pt-8 border-t border-slate-200 first:border-t-0 first:pt-0 first:mt-0"
    >
      {item.heading ? (
        <h2 className={`${brand.headlineFontClass} text-2xl md:text-3xl font-bold text-slate-900 leading-snug`}>
          <span
            className="inline-block mr-2 text-sm align-middle font-sans font-semibold px-2 py-0.5 rounded"
            style={{ background: brand.accent, color: brand.accentText }}
          >
            #{item.position}
          </span>
          {item.heading}
        </h2>
      ) : null}

      {item.image_url ? (
        <figure className="mt-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.image_url}
            alt=""
            className="w-full rounded-md border border-slate-200"
            loading="lazy"
          />
        </figure>
      ) : null}

      <div
        className="advertorial-prose mt-4 text-base leading-relaxed text-slate-800 space-y-4 [&_a]:underline [&_a]:text-[color:var(--advertorial-accent)] [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_blockquote]:border-l-4 [&_blockquote]:border-slate-300 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-slate-600 [&_h2]:mt-6 [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:mt-4 [&_h3]:text-lg [&_h3]:font-semibold"
        dangerouslySetInnerHTML={{ __html: item.bodyHtml }}
      />

      {showCta ? (
        <div className="mt-5">
          <AdvertorialCta
            href={`/out/${encodeURIComponent(slug)}/${item.slot_key}`}
            ctaText={item.cta_text || 'See if you qualify »'}
            brand={brand}
          />
        </div>
      ) : null}
    </section>
  )
}
