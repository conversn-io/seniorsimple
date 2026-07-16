/**
 * /lp/[slug] server entry — dispatcher.
 *
 * FIRST try the publishare Supabase `advertorials` table (Architecture B —
 * property app reads DB-driven listicle content from the shared CMS). If a
 * live row exists for the slug AND its site_id matches this app's
 * ADVERTORIAL_SITE_ID env, render via the advertorial-kit's listicle chrome.
 *
 * OTHERWISE fall through to the legacy in-code map (`getAdvertorial`) + the
 * bespoke `LpPage.tsx` client shell — this preserves every existing angle-body
 * advertorial (car-insurance-seniors, senior-discounts, things-retirees-cut)
 * with zero behavior change.
 *
 * The two systems coexist by slug: any slug present in advertorials(status='live')
 * wins the DB path; any slug in advertorial-content.ts wins the legacy path.
 * A slug in both places is a config bug — DB wins (log via 404 comparison).
 *
 * force-dynamic because the legacy path reads per-visitor cookies and the DB
 * path reads a live row. noindex on every response.
 */

import type { Metadata } from 'next';
import { cookies, headers } from 'next/headers';
import { notFound } from 'next/navigation';

// Legacy path (kept intact)
import { getAdvertorial } from '@/lib/advertorial-content';
import { resolveAdvertorialSlots } from '@/lib/advertorial-slots';
import { AD_HEADER_COOKIE, AD_HEADLINE_COOKIE } from '@/lib/flag-registry';
import LpPage from './LpPage';

// DB-driven path (advertorial-kit)
import { getAdvertorialSupabase } from '@/advertorial-kit/lib/supabase-admin';
import { getSiteId } from '@/advertorial-kit/lib/get-site-id';
import { getAdvertorialBrand } from '@/advertorial-kit/lib/brand-config';
import { renderMarkdown } from '@/advertorial-kit/lib/markdown';
import { maybeBuildPreview } from '@/advertorial-kit/lib/preview-fixture';
import { AdvertorialLayout } from '@/advertorial-kit/components/AdvertorialLayout';
import {
  AdvertorialItem,
  type AdvertorialItemData,
} from '@/advertorial-kit/components/AdvertorialItem';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  referrer: 'no-referrer',
};

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

interface AdvertorialRow {
  id: string;
  slug: string;
  site_id: string;
  title: string;
  headline: string;
  subhead: string | null;
  intro_md: string | null;
  hero_image_url: string | null;
  disclosure_md: string | null;
  status: string;
}

interface ItemRow {
  id: string;
  advertorial_id: string;
  position: number;
  item_type: 'monetized' | 'filler' | 'bonus' | 'recap';
  heading: string | null;
  body_md: string | null;
  image_url: string | null;
  cta_text: string | null;
  slot_id: string | null;
  slot: { slot_key: number } | null;
}

// ---------------------------------------------------------------------------
// DB-driven renderer (kit path)
// ---------------------------------------------------------------------------

async function renderKitAdvertorial(
  advertorial: AdvertorialRow,
  slug: string,
) {
  const supabase = getAdvertorialSupabase();
  const { data: rawItems } = await supabase
    .from('advertorial_items')
    .select(`
      id, advertorial_id, position, item_type, heading, body_md, image_url,
      cta_text, slot_id,
      slot:advertorial_slots (slot_key)
    `)
    .eq('advertorial_id', advertorial.id)
    .order('position', { ascending: true });

  const itemsRaw = ((rawItems ?? []) as unknown) as ItemRow[];

  const brand = getAdvertorialBrand(advertorial.site_id);
  const disclosureMd = advertorial.disclosure_md?.trim()
    ? advertorial.disclosure_md
    : brand.defaultDisclosureMd;
  const disclosureHtml = renderMarkdown(disclosureMd);
  const introHtml = renderMarkdown(advertorial.intro_md);

  const items: AdvertorialItemData[] = itemsRaw.map((row) => ({
    position: row.position,
    item_type: row.item_type,
    heading: row.heading,
    bodyHtml: renderMarkdown(row.body_md),
    image_url: row.image_url,
    cta_text: row.cta_text,
    slot_key: row.item_type === 'monetized' ? row.slot?.slot_key ?? null : null,
  }));

  return (
    <AdvertorialLayout
      brand={brand}
      headline={advertorial.headline}
      subhead={advertorial.subhead}
      heroImageUrl={advertorial.hero_image_url}
      disclosureHtml={disclosureHtml}
    >
      {introHtml ? (
        <div
          className="advertorial-prose text-lg leading-relaxed text-slate-800 space-y-4 [&_a]:underline [&_a]:text-[color:var(--advertorial-accent)]"
          dangerouslySetInnerHTML={{ __html: introHtml }}
        />
      ) : null}
      {items.map((item) => (
        <AdvertorialItem
          key={`${item.position}-${item.item_type}`}
          item={item}
          slug={slug}
          brand={brand}
        />
      ))}
    </AdvertorialLayout>
  );
}

// ---------------------------------------------------------------------------
// Legacy renderer (SS shell path — kept exactly as it was on main)
// ---------------------------------------------------------------------------

async function renderLegacyLp(slug: string) {
  const spec = getAdvertorial(slug);
  if (!spec) notFound();

  const c = await cookies();
  const slots = resolveAdvertorialSlots({
    headerVariants: spec.header_variants,
    headlineVariants: spec.variant_headlines,
    assigned: {
      header: c.get(AD_HEADER_COOKIE)?.value ?? null,
      headline: c.get(AD_HEADLINE_COOKIE)?.value ?? null,
    },
  });

  return (
    <LpPage
      slug={spec.slug}
      angle={spec.angle}
      headerSrc={slots.headerSrc}
      headerId={slots.headerId}
      headline={slots.headline}
      headlineId={slots.headlineId}
      offerTrackingUrl={spec.offer_tracking_url}
    />
  );
}

// ---------------------------------------------------------------------------
// Dispatcher
// ---------------------------------------------------------------------------

export default async function Page({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const query = await searchParams;
  const previewFlag = query.preview === '1' || query.preview === 'true';

  // --- Dev-only preview mode (kit path) ---
  const previewSiteId = (() => {
    try { return getSiteId(); } catch { return 'seniorsimple'; }
  })();
  const preview = maybeBuildPreview(previewSiteId, previewFlag);
  if (preview) {
    const previewAdvertorial: AdvertorialRow = {
      id: preview.advertorial.id,
      slug: preview.advertorial.slug,
      site_id: preview.advertorial.site_id,
      title: preview.advertorial.title,
      headline: preview.advertorial.headline,
      subhead: preview.advertorial.subhead,
      intro_md: preview.advertorial.intro_md,
      hero_image_url: preview.advertorial.hero_image_url,
      disclosure_md: preview.advertorial.disclosure_md,
      status: 'live',
    };
    return renderKitAdvertorial(previewAdvertorial, slug);
  }

  // --- DB-driven path (kit) ---
  try {
    const appSiteId = getSiteId();
    const supabase = getAdvertorialSupabase();
    const { data: advertorial, error } = await supabase
      .from('advertorials')
      .select('id, slug, site_id, title, headline, subhead, intro_md, hero_image_url, disclosure_md, status')
      .eq('slug', slug)
      .eq('status', 'live')
      .maybeSingle<AdvertorialRow>();

    if (!error && advertorial && advertorial.site_id === appSiteId) {
      return renderKitAdvertorial(advertorial, slug);
    }
  } catch (err) {
    // Env not configured (e.g. ADVERTORIAL_SITE_ID missing) — fall through
    // to legacy path so existing LPs never break on a kit-config issue.
    console.warn('[lp dispatcher] kit path skipped:', (err as Error).message);
  }

  // --- Legacy fallback path (SS shell, unchanged behavior) ---
  return renderLegacyLp(slug);
}
