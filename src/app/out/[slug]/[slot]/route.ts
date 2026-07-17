/**
 * GET /out/[slug]/[slot]
 *
 * The mega-listicle click router. Resolves an advertorial + slot, picks the
 * live offer (offer_id → weighted rotation → fallback_url → advertorial page),
 * captures native tracking (s1..s8 + source), logs a click row (id === click_id),
 * substitutes {CLICK_ID}/{SUB_ID}/{S1..S8} into the offer's tracking template,
 * and 302 redirects to the network. Target < 50ms.
 *
 * Copy this file to: app/out/[slug]/[slot]/route.ts (in the property app)
 *
 * Design: 00 - Reports/mega_listicle_backend_design_2026-07-15.md §2.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createHash } from 'crypto'
import {
  assembleTracking,
  captureQueryTracking,
  encodeSubId,
  inferSourceFromReferrer,
  pickRotationOffer,
  substituteTemplate,
  type RotationEntry,
} from '@/advertorial-kit/lib/router'
import { getAdvertorialSupabase } from '@/advertorial-kit/lib/supabase-admin'
import { getSiteId } from '@/advertorial-kit/lib/get-site-id'

export const dynamic = 'force-dynamic'
export const revalidate = 0

function hashIp(ip: string): string {
  return createHash('sha256')
    .update(ip + (process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''))
    .digest('hex')
}

function readClientIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'anonymous'
  )
}

function absoluteFallback(req: NextRequest, path: string): string {
  return new URL(path, req.url).toString()
}

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ slug: string; slot: string }> },
) {
  const { slug, slot: slotParam } = await ctx.params
  const slotKey = Number.parseInt(slotParam, 10)
  if (!slug || !Number.isFinite(slotKey)) {
    return new NextResponse('Not found', { status: 404 })
  }

  const supabase = getAdvertorialSupabase()
  const appSiteId = getSiteId()

  // 1. Resolve advertorial (live-only) — must belong to this app's site.
  //    In Architecture B each property app owns its site_id from env; a slug
  //    from a different property just 404s.
  const { data: advertorial, error: advertorialErr } = await supabase
    .from('advertorials')
    .select('id, site_id, status')
    .eq('slug', slug)
    .eq('status', 'live')
    .maybeSingle()

  if (advertorialErr || !advertorial) {
    return new NextResponse('Not found', { status: 404 })
  }
  if (advertorial.site_id !== appSiteId) {
    return new NextResponse('Not found', { status: 404 })
  }

  const { data: slotRow, error: slotErr } = await supabase
    .from('advertorial_slots')
    .select('id, slot_key, offer_id, rotation, fallback_url, is_active')
    .eq('advertorial_id', advertorial.id)
    .eq('slot_key', slotKey)
    .maybeSingle()

  if (slotErr || !slotRow || !slotRow.is_active) {
    return NextResponse.redirect(absoluteFallback(req, `/lp/${slug}`), 302)
  }

  // 2. Pick offer: rotation → offer_id → fallback → advertorial page.
  const rotation = Array.isArray(slotRow.rotation)
    ? (slotRow.rotation as RotationEntry[])
    : []
  const pickedOfferId = pickRotationOffer(rotation) ?? slotRow.offer_id ?? null

  // 3. Capture tracking per the canonical taxonomy (see router.ts header).
  //    s1 = brand (server state)
  //    s2 = source (query or referrer inference)
  //    s3 = component (CTA-provided via ?component=<type>)
  //    s4..s6, s8 = query
  //    s7 = variant (CTA-provided via ?variant=<id>)
  //    slug + slot_key = reconciliation-only, encoded into sub_id
  const url = new URL(req.url)
  const query = captureQueryTracking(url.searchParams)
  const referrer = req.headers.get('referer')
  const componentType = url.searchParams.get('component') || null
  const tracking = assembleTracking({
    brand: advertorial.site_id,
    component: componentType,
    queryCapture: {
      ...query,
      source: query.source ?? inferSourceFromReferrer(referrer),
    },
  })
  const subId = encodeSubId(tracking, { slug, slotKey })

  // 4. Load offer template (metadata.tracking_template preferred over offer_url).
  let offerTemplate: string | null = null
  let resolvedOfferId: string | null = null
  if (pickedOfferId) {
    const { data: offer } = await supabase
      .from('affiliate_offers')
      .select('id, offer_url, metadata, is_active')
      .eq('id', pickedOfferId)
      .maybeSingle()

    if (offer && offer.is_active !== false) {
      const meta = (offer.metadata ?? {}) as Record<string, unknown>
      const template =
        typeof meta.tracking_template === 'string' && meta.tracking_template.length > 0
          ? (meta.tracking_template as string)
          : typeof offer.offer_url === 'string'
            ? offer.offer_url
            : null
      if (template) {
        offerTemplate = template
        resolvedOfferId = offer.id
      }
    }
  }

  // 5. Log click (id === click_id).
  const clickRow = {
    advertorial_id: advertorial.id,
    slot_id: slotRow.id,
    offer_id: resolvedOfferId,
    ip_hash: hashIp(readClientIp(req)),
    user_agent: req.headers.get('user-agent'),
    referrer,
    s1: tracking.s1, s2: tracking.s2, s3: tracking.s3, s4: tracking.s4,
    s5: tracking.s5, s6: tracking.s6, s7: tracking.s7, s8: tracking.s8,
    source: tracking.source,
    sub_id: subId,
    dest_url: null as string | null,
  }

  const { data: clickInsert, error: clickErr } = await supabase
    .from('advertorial_clicks')
    .insert(clickRow)
    .select('id')
    .single()

  const clickId = clickInsert?.id ?? null

  // 6. Resolve destination + fire-and-forget dest_url audit.
  let destUrl: string
  if (offerTemplate && clickId) {
    destUrl = substituteTemplate({
      template: offerTemplate,
      clickId,
      subId,
      siteId: advertorial.site_id,
      tracking,
    })
  } else if (slotRow.fallback_url) {
    destUrl = slotRow.fallback_url
  } else {
    destUrl = absoluteFallback(req, `/lp/${slug}`)
  }

  if (clickId && !clickErr) {
    void supabase
      .from('advertorial_clicks')
      .update({ dest_url: destUrl })
      .eq('id', clickId)
  }

  return NextResponse.redirect(destUrl, 302)
}
