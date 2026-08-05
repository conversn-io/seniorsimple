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
import { Fragment } from 'react';
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
import { checkTapOnly } from '@/advertorial-kit/lib/tap-only';
import { checkItemStrings } from '@/advertorial-kit/lib/block-line';
import {
  resolveLocation,
  substituteLocation,
  substituteLocationDeep,
  type KitLocation,
} from '@/advertorial-kit/lib/location';
import {
  readInboundSubsFromSearchParams,
  appendInboundSubs,
  parseSsAttrCookie,
  mergeInboundSubs,
  SS_ATTR_COOKIE,
  type InboundSubsServer,
} from '@/advertorial-kit/lib/inbound-subs';
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
import { HeroClickable } from '@/advertorial-kit/components/HeroClickable';

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
  /**
   * PS-00 free-form config bag. Used today for per-variant content overrides
   * without a schema change:
   *   • `headline_variants`: `{ [variant_key]: string }` — when the chosen
   *     variant has an entry here, it renders in place of `headline`.
   *   • `headline_variant_weights`: reference/staging, informational only —
   *     the actual weights live on `variants` (W3 canonical). Kept so PS-00
   *     can stage a test without flipping it on.
   * Extension pattern: any future per-variant field goes here as
   *   `<field>_variants[<variant_key>]` → falls back to the single column.
   */
  meta: Record<string, unknown> | null;
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
  inboundSubs: InboundSubsServer,
  debugMode: boolean = false,
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

  // Handoff §"Change 2" — is slot 1 active? Only then does the hero become
  // an /out link. One-row read; page is force-dynamic so no cache concern.
  const { data: heroSlot } = await supabase
    .from('advertorial_slots')
    .select('slot_key, is_active')
    .eq('advertorial_id', advertorial.id)
    .eq('slot_key', 1)
    .maybeSingle<{ slot_key: number; is_active: boolean }>();
  const heroSlotActive = Boolean(heroSlot?.is_active);

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

  // Headline split-test (2026-07-21): if the chosen variant has an entry in
  // `meta.headline_variants`, render that headline; otherwise the base
  // `headline` column. Fallback chain: variant headline → column → ''.
  // Items still share `variant_key = NULL` so ONLY the headline changes
  // between variants — clean isolation of the H1 as the sole variable.
  // {{location}} substitution runs AFTER selection so v3 (no token) is fine.
  const chosen = variantContext.chosen;
  const headlineVariants =
    advertorial.meta && typeof advertorial.meta === 'object'
      ? ((advertorial.meta as Record<string, unknown>).headline_variants as
          | Record<string, string>
          | null
          | undefined)
      : null;
  const rawHeadline =
    chosen && headlineVariants && typeof headlineVariants[chosen] === 'string'
      ? headlineVariants[chosen]
      : advertorial.headline;
  const localizedHeadline = substituteLocation(rawHeadline, location) ?? '';
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
  // Handoff §"Change 2" — hero click surface. If the advertorial has a hero
  // image AND slot 1 is active, render a client HeroClickable that fires
  // lp_cta_click + routes to /out/<slug>/1?component=hero&variant=<v>. Falls
  // through to the passive <img> otherwise.
  const heroImageNode =
    advertorial.hero_image_url && heroSlotActive
      ? (
        <HeroClickable
          src={advertorial.hero_image_url}
          alt=""
          outHref={buildHeroOutHref(slug, variantContext.chosen, inboundSubs)}
          brand={brand.siteId}
          slug={slug}
          variant={variantContext.chosen}
          slotKey={1}
        />
      )
      : null;

  return (
    <KitCtaShell slug={slug} siteId={advertorial.site_id} variant={variantContext.chosen}>
      <AdvertorialLayout
        brand={brand}
        headline={localizedHeadline}
        subhead={localizedSubhead}
        heroImageUrl={advertorial.hero_image_url}
        heroImageNode={heroImageNode}
        disclosureHtml={disclosureHtml}
      >
        {introHtml ? (
          <div
            className="advertorial-prose text-lg leading-relaxed text-slate-800 space-y-4 [&_a]:underline [&_a]:text-[color:var(--advertorial-link)]"
            dangerouslySetInnerHTML={{ __html: introHtml }}
          />
        ) : null}
        {(() => {
          // Pre-filter items (2026-07-27 fix — WO "silent suppression +
          // broken numbering"). Prior behavior: ComponentSwitch ran its
          // tap-only + block-line guards at render time and silently
          // returned null on failure, but numbering was assigned BEFORE
          // the render — so a suppressed pos-1 + pos-2 could leave the
          // first VISIBLE item rendered as "#3" with #1/#2 nowhere in the
          // DOM. That failure mode ate hours on the RM funnel because the
          // page looked "cut off" with no error.
          //
          // Fix: evaluate every item up-front. Suppressed items are
          //   (a) logged to the Vercel function log (greppable),
          //   (b) emitted as a <div hidden data-advertorial-suppressed …>
          //       marker in the HTML (view-source discoverable — search
          //       "advertorial-suppressed" to find every dropped item + its
          //       rule + reason), and
          //   (c) shown inline as a red alert badge when ?debug=1 is on
          //       (QA-only; users never see it).
          // Numbering iterates over the visible-only list, so "#N" always
          // corresponds to the reader-visible sequence.
          type ItemEval =
            | { visible: true; item: ComponentItem }
            | { visible: false; item: ComponentItem; ruleId: string; reason: string }

          const evaluated: ItemEval[] = componentItems.map((item) => {
            const tap = checkTapOnly({
              component_type: item.component_type,
              component_props: item.component_props,
            })
            if (!tap.ok) {
              console.warn(
                `[advertorial-kit] pos ${item.position} SUPPRESSED by tap-only (${tap.offendingPath ?? '?'}): ${tap.reason}`,
              )
              return {
                visible: false,
                item,
                ruleId: 'tap_only',
                reason: tap.reason ?? 'unknown',
              }
            }
            const bl = checkItemStrings({
              heading: item.heading,
              body_md: item.body_md,
              cta_text: item.cta_text,
              component_props: item.component_props,
            })
            if (!bl.ok) {
              console.warn(
                `[advertorial-kit] pos ${item.position} SUPPRESSED by block-line ${bl.ruleId}: ${bl.reason} — matched: "${bl.matched}"`,
              )
              return {
                visible: false,
                item,
                ruleId: bl.ruleId ?? 'block_line',
                reason: `${bl.reason ?? 'unknown'} — matched: "${bl.matched ?? ''}"`,
              }
            }
            return { visible: true, item }
          })

          let running = 0
          return evaluated.map((ev) => {
            if (!ev.visible) {
              return (
                <Fragment key={`suppressed-${ev.item.position}`}>
                  {/* View-source discoverable: search for
                      `data-advertorial-suppressed` in the HTML source to
                      surface every dropped item + its rule + reason. */}
                  <div
                    hidden
                    data-advertorial-suppressed
                    data-position={ev.item.position}
                    data-component={ev.item.component_type ?? 'null'}
                    data-rule={ev.ruleId}
                    data-reason={ev.reason}
                  />
                  {debugMode ? (
                    <div
                      role="alert"
                      className="my-4 p-3 border border-red-400 bg-red-50 text-sm text-red-900 rounded"
                    >
                      <strong>⚠ Suppressed item #{ev.item.position}</strong>{' '}
                      <span className="text-red-700">
                        ({ev.item.component_type ?? 'null'})
                      </span>{' '}
                      — rule <code className="font-mono">{ev.ruleId}</code>: {ev.reason}
                    </div>
                  ) : null}
                </Fragment>
              )
            }
            const { item } = ev
            const type = (item.component_type ?? 'listicle_entry').toLowerCase()
            const isNumbered = type === 'listicle_entry' || type === 'section'
            const listicleNumber = isNumbered ? ++running : null
            return (
              <ComponentSwitch
                key={`${item.position}-${item.item_type}-${item.variant_key ?? 'shared'}`}
                item={item}
                slug={slug}
                brand={brand}
                chosenVariant={variantContext.chosen}
                listicleNumber={listicleNumber}
                inboundSubs={inboundSubs}
              />
            )
          })
        })()}
      </AdvertorialLayout>
    </KitCtaShell>
  );
}

/**
 * Handoff §"Change 2" — the /out URL for the hero image. Kept next to the
 * dispatcher so the taxonomy stays in one place. component=hero flows into
 * s3 and the /out click row so PS-01 reports can slice "hero tap vs button
 * tap vs image tap" without inspecting a mixed s3='listicle_entry' bucket.
 */
function buildHeroOutHref(
  slug: string,
  variant: string | null,
  inboundSubs: InboundSubsServer | null,
): string {
  const params = new URLSearchParams();
  params.set('component', 'hero');
  if (variant) params.set('variant', variant);
  const base = `/out/${encodeURIComponent(slug)}/1?${params.toString()}`;
  return appendInboundSubs(base, inboundSubs);
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
  // ?debug=1 opts into inline suppression alerts (WO 2026-07-27 fix). Off
  // for users, on for QA — every suppressed advertorial_item renders as a
  // red alert badge naming the offending rule + reason so authors can see
  // exactly why block-line / tap-only dropped their content instead of
  // chasing a "cache bug" for hours. Silent HTML markers ship regardless.
  const debugMode = query.debug === '1' || query.debug === 'true';

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

  // Handoff (2026-07-21) — capture non-PII inbound s-tokens (s2 source /
  // s4 hook / s5 creative / s6 placement / s8 network click-id) from the
  // LP request URL so every /out href in the SSR HTML carries them. The
  // /out router already reads these names — we just make sure they show up
  // on the CTA URLs so paid traffic's network + angle land in
  // advertorial_clicks for per-network / per-angle ROAS.
  //
  // Mobile in-app browsers sometimes strip query params between first landing
  // and subsequent nav (measured 13% leak in prod). Middleware stamps ss_attr
  // cookie whenever a request carries subs; we now read that cookie as a
  // fallback so params-stripped re-visits still SSR the correct /out hrefs.
  const inboundFromUrl = readInboundSubsFromSearchParams(query);
  const ssAttrCookie = (await cookies()).get(SS_ATTR_COOKIE)?.value ?? null;
  const inboundFromCookie = parseSsAttrCookie(ssAttrCookie);
  const inboundSubs = mergeInboundSubs(inboundFromUrl, inboundFromCookie);

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
      meta: null,
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
    }, location, inboundSubs, debugMode);
  }

  // --- DB-driven path (kit) ---
  try {
    const appSiteId = getSiteId();
    const supabase = getAdvertorialSupabase();
    const { data: advertorial, error } = await supabase
      .from('advertorials')
      .select('id, slug, site_id, title, headline, subhead, intro_md, hero_image_url, disclosure_md, status, variants, meta')
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
      }, location, inboundSubs, debugMode);
    }
  } catch (err) {
    // Env not configured (e.g. ADVERTORIAL_SITE_ID missing) — fall through
    // to legacy path so existing LPs never break on a kit-config issue.
    console.warn('[lp dispatcher] kit path skipped:', (err as Error).message);
  }

  // --- Legacy fallback path (SS shell, unchanged behavior) ---
  return renderLegacyLp(slug);
}
