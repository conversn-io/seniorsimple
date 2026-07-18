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
import { pickVariant, itemMatchesVariant } from '@/advertorial-kit/lib/variant';
import {
  resolveLocation,
  substituteLocation,
  substituteLocationDeep,
  type KitLocation,
} from '@/advertorial-kit/lib/location';
import { AdvertorialLayout } from '@/advertorial-kit/components/AdvertorialLayout';
import {
  AdvertorialItem,
  type AdvertorialItemData,
} from '@/advertorial-kit/components/AdvertorialItem';
import {
  ComponentSwitch,
  type ComponentItem,
} from '@/advertorial-kit/components/ComponentSwitch';
import KitCtaShell from '@/advertorial-kit/components/KitCtaShell';

/** W3 — kept in sync with middleware.ts (KIT_SEED_COOKIE). */
const KIT_SEED_COOKIE = 'ss_kit_seed';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

/**
 * Per-slug metadata: title from the DB row when the kit path wins; robots +
 * referrer applied on every response so noindex/no-referrer never regress on
 * the legacy path either.
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const baseNoindex: Metadata = {
    robots: { index: false, follow: false, nocache: true, noimageindex: true },
    referrer: 'no-referrer',
    openGraph: undefined,
    twitter: undefined,
  };
  try {
    const appSiteId = getSiteId();
    const supabase = getAdvertorialSupabase();
    const { data } = await supabase
      .from('advertorials')
      .select('title, headline, site_id, status')
      .eq('slug', slug)
      .eq('status', 'live')
      .maybeSingle<{ title: string; headline: string; site_id: string; status: string }>();
    if (data && data.site_id === appSiteId) {
      // W4 — same {{location}} substitution as the body render so the
      // browser tab title matches on-page headline.
      const location = resolveLocation(await headers());
      const rawTitle = data.title || data.headline || 'Sponsored Editorial';
      const title = substituteLocation(rawTitle, location) ?? rawTitle;
      return { ...baseNoindex, title };
    }
  } catch {
    // env not configured or DB error — fall through to noindex-only
  }
  return baseNoindex;
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
  /** W3 — weighted split-test config; NULL means single-variant render. */
  variants: Record<string, unknown> | null;
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
  component_type: string | null;
  component_props: Record<string, unknown> | null;
  variant_key: string | null;
}

// ---------------------------------------------------------------------------
// DB-driven renderer (kit path)
// ---------------------------------------------------------------------------

async function renderKitAdvertorial(
  advertorial: AdvertorialRow,
  slug: string,
  variantContext: { chosen: string | null; source: string },
  location: KitLocation,
) {
  const supabase = getAdvertorialSupabase();
  const { data: rawItems } = await supabase
    .from('advertorial_items')
    .select(`
      id, advertorial_id, position, item_type, heading, body_md, image_url,
      cta_text, slot_id, component_type, component_props, variant_key,
      slot:advertorial_slots (slot_key)
    `)
    .eq('advertorial_id', advertorial.id)
    .order('position', { ascending: true });

  const itemsRaw = ((rawItems ?? []) as unknown) as ItemRow[];

  const brand = getAdvertorialBrand(advertorial.site_id);
  const disclosureMd = advertorial.disclosure_md?.trim()
    ? advertorial.disclosure_md
    : brand.defaultDisclosureMd;
  // W4 — location substitution happens BEFORE renderMarkdown so tokens in
  // markdown (e.g. `**{{location}} seniors**`) survive into the final HTML.
  // Disclosure copy is legal boilerplate; a stray {{location}} there would
  // never appear in real content, but running through the substitutor keeps
  // the pipeline uniform and cheap.
  const disclosureHtml = renderMarkdown(substituteLocation(disclosureMd, location));
  const introHtml = renderMarkdown(substituteLocation(advertorial.intro_md, location));
  const localizedHeadline = substituteLocation(advertorial.headline, location) ?? '';
  const localizedSubhead = substituteLocation(advertorial.subhead, location);

  // W3 — filter rows to the chosen variant. Items with variant_key IS NULL
  // are shared across all variants; items with a matching variant_key render
  // only for that variant; items with a non-matching key are hidden this
  // request. See variant.ts / itemMatchesVariant for the acceptance-tested
  // predicate.
  const filteredItems = itemsRaw.filter((row) =>
    itemMatchesVariant(row.variant_key, variantContext.chosen),
  );

  // W4 — substitute {{location}} in every field that renders to the user:
  // heading, body_md, cta_text, and any nested string in component_props.
  // Never in slug/slot/variant_key/item_type — those are structural and flow
  // to /out URLs. Never in image_url — that's already an absolute URL and a
  // token there would be a config bug PS-00 should see.
  const componentItems: ComponentItem[] = filteredItems.map((row) => ({
    position: row.position,
    item_type: row.item_type,
    heading: substituteLocation(row.heading, location),
    body_md: substituteLocation(row.body_md, location),
    image_url: row.image_url,
    cta_text: substituteLocation(row.cta_text, location),
    slot_key: row.item_type === 'monetized' ? row.slot?.slot_key ?? null : null,
    component_type: row.component_type,
    component_props: substituteLocationDeep(row.component_props, location),
    variant_key: row.variant_key,
  }));

  // Kit path is ALWAYS taken when the DB advertorial resolves — regardless of
  // whether any item declares component_type. Rows with a null component_type
  // fall through to ComponentSwitch's default 'listicle_entry' render, which
  // matches the pre-W1 shape. This ensures W2 analytics (lp_view, lp_cta_click)
  // fire on every kit-native advertorial and the sub-scheme is consistent.
  //
  // The legacy AdvertorialItem render is intentionally dead code and can be
  // removed after a green-light window on prod.
  return (
    <KitCtaShell slug={slug} siteId={advertorial.site_id} variant={variantContext.chosen}>
      <AdvertorialLayout
        brand={brand}
        headline={localizedHeadline}
        subhead={localizedSubhead}
        heroImageUrl={advertorial.hero_image_url}
        disclosureHtml={disclosureHtml}
      >
        {introHtml ? (
          <div
            className="advertorial-prose text-lg leading-relaxed text-slate-800 space-y-4 [&_a]:underline [&_a]:text-[color:var(--advertorial-accent)]"
            dangerouslySetInnerHTML={{ __html: introHtml }}
          />
        ) : null}
        {componentItems.map((item) => (
          <ComponentSwitch
            key={`${item.position}-${item.item_type}-${item.variant_key ?? 'shared'}`}
            item={item}
            slug={slug}
            brand={brand}
            chosenVariant={variantContext.chosen}
          />
        ))}
      </AdvertorialLayout>
    </KitCtaShell>
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

  // W3 — read the sticky seed cookie stamped by middleware and the optional
  // ?variant=<key> override. `pickVariant` will decide whether either matters
  // once we have the advertorial's `variants` config.
  const cookieStore = await cookies();
  const kitSeed = cookieStore.get(KIT_SEED_COOKIE)?.value ?? null;
  const variantOverride =
    typeof query.variant === 'string' && query.variant.trim().length > 0
      ? query.variant.trim()
      : null;

  // W4 — server-side geo lookup from Vercel's edge headers. On local dev
  // and non-Vercel hosts this returns the safe fallback ('your area'), so
  // `{{location}}` tokens render as generic copy rather than raw braces.
  const requestHeaders = await headers();
  const location = resolveLocation(requestHeaders);

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
      variants: null,
    };
    const previewPick = pickVariant({
      slug,
      seed: kitSeed,
      weights: null,
      queryOverride: variantOverride,
    });
    return renderKitAdvertorial(previewAdvertorial, slug, {
      chosen: previewPick.variant,
      source: previewPick.source,
    }, location);
  }

  // --- DB-driven path (kit) ---
  try {
    const appSiteId = getSiteId();
    const supabase = getAdvertorialSupabase();
    const { data: advertorial, error } = await supabase
      .from('advertorials')
      .select('id, slug, site_id, title, headline, subhead, intro_md, hero_image_url, disclosure_md, status, variants')
      .eq('slug', slug)
      .eq('status', 'live')
      .maybeSingle<AdvertorialRow>();

    if (!error && advertorial && advertorial.site_id === appSiteId) {
      const pick = pickVariant({
        slug,
        seed: kitSeed,
        weights: advertorial.variants ?? null,
        queryOverride: variantOverride,
      });
      return renderKitAdvertorial(advertorial, slug, {
        chosen: pick.variant,
        source: pick.source,
      }, location);
    }
  } catch (err) {
    // Env not configured (e.g. ADVERTORIAL_SITE_ID missing) — fall through
    // to legacy path so existing LPs never break on a kit-config issue.
    console.warn('[lp dispatcher] kit path skipped:', (err as Error).message);
  }

  // --- Legacy fallback path (SS shell, unchanged behavior) ---
  return renderLegacyLp(slug);
}
