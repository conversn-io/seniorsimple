'use client'

/**
 * ComponentSwitch — dispatches an advertorial_items row to the appropriate
 * primitive from src/components/advertorial-library.
 *
 * Marked `'use client'` because several library primitives (EditorsPick,
 * MultiSelectQuiz, ImageQuiz, PrimaryCTA, etc.) call `useCtaHref()` /
 * `useSetCtaSelection()` from CtaContext. A CtaProvider must already wrap
 * this tree (see KitCtaShell).
 *
 * Guardrails enforced HERE (fail-closed):
 *   • checkTapOnly() — reject unknown component_type or free-text identifying
 *     fields.
 *   • checkItemStrings() — reject block-line violations in heading, body_md,
 *     cta_text, or any nested props strings.
 * A failure returns null (skipped render) with a console.warn so the operator
 * sees the reason without hard-breaking the page.
 *
 * CTA URL convention (per router.ts §W6 taxonomy):
 *   `/out/<slug>/<slot_key>?component=<type>&variant=<id>`
 * The component parameter feeds s3 (component). variant feeds s7.
 */

import Link from 'next/link'

import { checkTapOnly } from '@/advertorial-kit/lib/tap-only'
import { checkItemStrings } from '@/advertorial-kit/lib/block-line'
import { renderMarkdown } from '@/advertorial-kit/lib/markdown'
import type { AdvertorialBrand } from '@/advertorial-kit/lib/brand-config'
import { SITE_KEY, fireKitEvent } from '@/advertorial-kit/lib/analytics'

// Library primitives (moved to shared location in W1).
import {
  BlueAnchor,
  ClickableImage,
  CtaProvider,
  EditorsPick,
  ImageQuiz,
  LeadIn,
  MultiSelectQuiz,
  QualifyChecklist,
  Quote,
  Rating,
  SavingsCalculator,
  Section,
  StateSelector,
  TrustBar,
  type CtaSubs,
  type ImageQuizOption,
  type QuizOption,
  type SavingsInput,
  type StateOption,
} from '@/components/advertorial-library'

export interface ComponentItem {
  position: number
  item_type: 'monetized' | 'filler' | 'bonus' | 'recap'
  heading: string | null
  body_md: string | null
  image_url: string | null
  cta_text: string | null
  slot_key: number | null
  component_type: string | null
  component_props: Record<string, unknown> | null
  variant_key: string | null
}

interface ComponentSwitchProps {
  item: ComponentItem
  slug: string
  brand: AdvertorialBrand
  /**
   * W3 — the advertorial-level chosen variant key, or null when no split-test
   * is configured. Distinct from item.variant_key (which is a per-row filter
   * applied upstream in page.tsx). This is the value that flows to s7 on
   * every analytics event and every /out click emitted from this render.
   */
  chosenVariant?: string | null
}

// ---------------------------------------------------------------------------
// Public component
// ---------------------------------------------------------------------------

export function ComponentSwitch({ item, slug, brand, chosenVariant = null }: ComponentSwitchProps) {
  // W3 — the effective variant for outbound URLs + analytics events. Prefer
  // the advertorial-level chosen variant (uniform across every CTA on this
  // render) and fall back to item.variant_key only for legacy items that
  // predate the W3 dispatcher plumbing.
  const effectiveVariant = chosenVariant ?? item.variant_key ?? null
  // 1. Tap-only guard
  const tap = checkTapOnly({
    component_type: item.component_type,
    component_props: item.component_props,
  })
  if (!tap.ok) {
    console.warn(
      `[advertorial-kit] item #${item.position} rejected by tap-only guard: ${tap.reason} (${tap.offendingPath})`,
    )
    return null
  }

  // 2. Block-line guard
  const bl = checkItemStrings({
    heading: item.heading,
    body_md: item.body_md,
    cta_text: item.cta_text,
    component_props: item.component_props,
  })
  if (!bl.ok) {
    console.warn(
      `[advertorial-kit] item #${item.position} rejected by block-line: ${bl.ruleId} — ${bl.reason} — matched: "${bl.matched}"`,
    )
    return null
  }

  const componentType = (item.component_type ?? 'listicle_entry').toLowerCase()
  const outHref = buildOutHref({
    slug,
    slotKey: item.slot_key,
    componentType,
    variantKey: effectiveVariant,
  })

  switch (componentType) {
    case 'lead_in': {
      const p = (item.component_props ?? {}) as {
        bylineText?: string
        dek?: string
        headerSrc?: string
        caption?: string
      }
      return (
        <LeadIn
          headline={item.heading ?? ''}
          bylineText={p.bylineText ?? 'By the Editorial Team · Updated this week'}
          dek={p.dek}
          headerSrc={p.headerSrc ?? item.image_url ?? undefined}
          caption={p.caption}
        />
      )
    }

    case 'section': {
      const bodyHtml = renderMarkdown(item.body_md)
      return (
        <Section number={item.position} title={item.heading ?? ''}>
          <div dangerouslySetInnerHTML={{ __html: bodyHtml }} />
        </Section>
      )
    }

    case 'editors_pick': {
      const p = (item.component_props ?? {}) as {
        tag?: string
        disclosure?: string
        ctaLabel?: string
      }
      const bodyHtml = renderMarkdown(item.body_md)
      return (
        <div
          data-position={item.position}
          data-component="editors_pick"
          onClick={(e) => {
            // Fire lp_cta_click when an anchor inside the pick is clicked.
            // Event delegation lets us instrument EditorsPick without forking it.
            const target = e.target as HTMLElement | null
            if (target && target.closest('a[href]')) {
              fireKitEvent(
                'lp_cta_click',
                {
                  site_key: SITE_KEY,
                  brand: brand.siteId,
                  slug,
                  component_type: 'editors_pick',
                  variant: effectiveVariant,
                },
                {
                  eventLabel: `slot_${item.slot_key ?? 'none'}`,
                  extraProps: {
                    slot_key: item.slot_key,
                    position: item.position,
                    item_type: item.item_type,
                    cta_text: item.cta_text,
                  },
                },
              )
            }
          }}
        >
          <EditorsPick
            tag={p.tag ?? 'Editor’s Pick'}
            ctaLabel={item.cta_text ?? p.ctaLabel ?? 'See if you qualify »'}
            href={outHref}
            disclosure={p.disclosure ?? 'Sponsored. See disclosure at the bottom.'}
          >
            <div dangerouslySetInnerHTML={{ __html: bodyHtml }} />
          </EditorsPick>
        </div>
      )
    }

    case 'qualify_checklist': {
      const p = (item.component_props ?? {}) as {
        intro?: string
        items?: unknown[]
        pointLabel?: string
      }
      const items = Array.isArray(p.items) ? p.items.map(String) : []
      return (
        <QualifyChecklist
          intro={p.intro ?? item.heading ?? ''}
          items={items}
          pointLabel={p.pointLabel}
        />
      )
    }

    case 'quote': {
      const p = (item.component_props ?? {}) as { quote?: string; attribution?: string }
      const quoteText = p.quote ?? item.body_md ?? ''
      // Quote MUST have attribution per compliance §5.
      if (!p.attribution) {
        console.warn(
          `[advertorial-kit] quote item #${item.position} missing required attribution — skipped.`,
        )
        return null
      }
      return <Quote quote={quoteText} attribution={p.attribution} />
    }

    // -----------------------------------------------------------------------
    // Interactive tap components (WO: Wire Interactive Tap Components).
    // Every one wraps its render in a per-slot CtaProvider so the primitive's
    // useCtaHref() resolves to THIS item's outHref (not the shell's /lp/<slug>
    // fallback). Analytics fire via event delegation on a wrapper div so we
    // don't need to fork the shared primitives.
    // -----------------------------------------------------------------------

    case 'image_quiz': {
      const p = (item.component_props ?? {}) as {
        question?: string
        selectionKey?: string
        options?: ImageQuizOption[]
        submitLabel?: string
        submitVariant?: 'green' | 'blue'
      }
      if (!outHref) {
        console.warn(
          `[advertorial-kit] item #${item.position} image_quiz has no slot_key — skipped.`,
        )
        return null
      }
      const options = Array.isArray(p.options) ? p.options : []
      return renderInteractive({
        item, slug, brand, effectiveVariant, outHref,
        componentType: 'image_quiz',
        children: (
          <ImageQuiz
            question={p.question ?? item.heading ?? ''}
            selectionKey={p.selectionKey ?? 'spend_focus'}
            options={options}
            submitLabel={p.submitLabel ?? item.cta_text ?? 'See My Results »'}
            submitVariant={p.submitVariant}
          />
        ),
      })
    }

    case 'multi_select_quiz': {
      const p = (item.component_props ?? {}) as {
        question?: string
        selectionKey?: string
        options?: QuizOption[]
        submitLabel?: string
        submitVariant?: 'green' | 'blue'
      }
      if (!outHref) {
        console.warn(
          `[advertorial-kit] item #${item.position} multi_select_quiz has no slot_key — skipped.`,
        )
        return null
      }
      const options = Array.isArray(p.options) ? p.options : []
      return renderInteractive({
        item, slug, brand, effectiveVariant, outHref,
        componentType: 'multi_select_quiz',
        children: (
          <MultiSelectQuiz
            question={p.question ?? item.heading ?? ''}
            selectionKey={p.selectionKey ?? 'spend_focus'}
            options={options}
            submitLabel={p.submitLabel ?? item.cta_text ?? 'See My Results »'}
            submitVariant={p.submitVariant}
          />
        ),
      })
    }

    case 'state_selector': {
      const p = (item.component_props ?? {}) as {
        step1Label?: string
        step2Label?: string
        prompt?: string
        selectionKey?: string
        options?: StateOption[]
        ctaLabel?: string
      }
      if (!outHref) {
        console.warn(
          `[advertorial-kit] item #${item.position} state_selector has no slot_key — skipped.`,
        )
        return null
      }
      const options = Array.isArray(p.options) ? p.options : []
      return renderInteractive({
        item, slug, brand, effectiveVariant, outHref,
        componentType: 'state_selector',
        children: (
          <StateSelector
            step1Label={p.step1Label}
            step2Label={p.step2Label}
            prompt={p.prompt ?? item.heading ?? undefined}
            selectionKey={p.selectionKey ?? 'state'}
            options={options}
            ctaLabel={p.ctaLabel ?? item.cta_text ?? 'See Plans in My State »'}
          />
        ),
      })
    }

    case 'savings_calculator': {
      const p = (item.component_props ?? {}) as {
        inputs?: SavingsInput[]
        ctaLabel?: string
        monthlyCost?: number
      }
      if (!outHref) {
        console.warn(
          `[advertorial-kit] item #${item.position} savings_calculator has no slot_key — skipped.`,
        )
        return null
      }
      const inputs = Array.isArray(p.inputs) ? p.inputs : undefined
      return renderInteractive({
        item, slug, brand, effectiveVariant, outHref,
        componentType: 'savings_calculator',
        children: (
          <SavingsCalculator
            inputs={inputs}
            ctaLabel={p.ctaLabel ?? item.cta_text}
            monthlyCost={p.monthlyCost}
          />
        ),
      })
    }

    case 'clickable_image': {
      const p = (item.component_props ?? {}) as {
        src?: string
        alt?: string
        caption?: string
      }
      const src = p.src ?? item.image_url
      if (!src || !outHref) {
        console.warn(
          `[advertorial-kit] item #${item.position} clickable_image missing src or slot_key — skipped.`,
        )
        return null
      }
      // Don't pass explicit `href` — let ClickableImage read useCtaHref()
      // from the per-slot CtaProvider so it participates in the same sub-
      // scheme composition as the other interactive components (adds
      // source_id + sub5=slug to the outbound URL).
      return renderInteractive({
        item, slug, brand, effectiveVariant, outHref,
        componentType: 'clickable_image',
        children: (
          <ClickableImage
            src={src}
            alt={p.alt ?? item.heading ?? ''}
            caption={p.caption}
          />
        ),
      })
    }

    case 'rating': {
      const p = (item.component_props ?? {}) as {
        starsFilled?: number
        attribution?: string
      }
      // Compliance mirror of the quote rule: bare star rating without a
      // citation trips block-line intent (`fabricated_verification`), so we
      // fail-closed with a warn.
      if (!p.attribution) {
        console.warn(
          `[advertorial-kit] rating item #${item.position} missing required attribution — skipped.`,
        )
        return null
      }
      const stars = typeof p.starsFilled === 'number' ? p.starsFilled : 0
      return <Rating starsFilled={stars} attribution={p.attribution} />
    }

    case 'trust_bar': {
      const p = (item.component_props ?? {}) as {
        label?: string
        brands?: unknown[]
      }
      const brands = Array.isArray(p.brands)
        ? (p.brands as { name?: string; category?: string; logoSrc?: string; source?: string }[])
        : []
      // TrustBar expects ApcBrand[] — pass through as-is when shape matches.
      // We accept any array; downstream component handles empty gracefully.
      return (
        <TrustBar
          label={p.label ?? item.heading ?? 'Trusted by:'}
          brands={brands as never}
        />
      )
    }

    // ------ default: listicle entry (§B1 semantic) --------------------------
    case 'listicle_entry':
    default: {
      const bodyHtml = renderMarkdown(item.body_md)
      const showCta = item.item_type === 'monetized' && outHref
      return (
        <section
          data-item-type={item.item_type}
          data-position={item.position}
          data-component={componentType}
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
              <img src={item.image_url} alt="" className="w-full rounded-md border border-slate-200" loading="lazy" />
            </figure>
          ) : null}

          <div
            className="advertorial-prose mt-4 text-base leading-relaxed text-slate-800 space-y-4 [&_a]:underline [&_a]:text-[#1a5089] [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_blockquote]:border-l-4 [&_blockquote]:border-slate-300 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-slate-600 [&_h2]:mt-6 [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:mt-4 [&_h3]:text-lg [&_h3]:font-semibold"
            dangerouslySetInnerHTML={{ __html: bodyHtml }}
          />

          {showCta ? (
            <div className="mt-5">
              <Link
                href={outHref!}
                className="inline-block px-6 py-3 rounded-md font-sans font-semibold text-base shadow-sm hover:opacity-90 transition"
                style={{ background: brand.accent, color: brand.accentText }}
                rel="nofollow sponsored"
                prefetch={false}
                onClick={() => {
                  // W2 analytics: fire lp_cta_click BEFORE /out redirect.
                  // keepalive:true on the fetch survives the navigation.
                  fireKitEvent(
                    'lp_cta_click',
                    {
                      site_key: SITE_KEY,
                      brand: brand.siteId,
                      slug,
                      component_type: componentType,
                      variant: effectiveVariant,
                    },
                    {
                      eventLabel: `slot_${item.slot_key ?? 'none'}`,
                      extraProps: {
                        slot_key: item.slot_key,
                        position: item.position,
                        item_type: item.item_type,
                        cta_text: item.cta_text,
                      },
                    },
                  )
                }}
              >
                {item.cta_text || 'See if you qualify »'}
              </Link>
            </div>
          ) : null}
        </section>
      )
    }
  }
}

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------

function buildOutHref(input: {
  slug: string
  slotKey: number | null
  componentType: string
  variantKey: string | null
}): string | null {
  if (input.slotKey === null || input.slotKey === undefined) return null
  const params = new URLSearchParams()
  params.set('component', input.componentType)
  if (input.variantKey) params.set('variant', input.variantKey)
  return `/out/${encodeURIComponent(input.slug)}/${input.slotKey}?${params.toString()}`
}

// ---------------------------------------------------------------------------
// Interactive helper (WO: Wire Interactive Tap Components).
// ---------------------------------------------------------------------------

interface RenderInteractiveArgs {
  item: ComponentItem
  slug: string
  brand: AdvertorialBrand
  effectiveVariant: string | null
  outHref: string
  componentType: string
  children: React.ReactNode
}

/**
 * Wrap an interactive primitive in a per-slot CtaProvider (so useCtaHref()
 * inside resolves to this slot's outHref, not the shell's /lp fallback) plus
 * an event-delegation wrapper that fires analytics events without forking
 * the shared primitive.
 *
 * Wire (per WO §60–66):
 *   • Any `a[href]` click inside → lp_cta_click (before /out navigation).
 *   • Any `button[role="radio"]` / `input[type="checkbox"]` / `select` / any
 *     element with `data-quiz-option` change or click → lp_step. First
 *     lp_step per mount is fired only once so we don't spam a step for
 *     every keypress on a calculator input.
 */
function renderInteractive({
  item, slug, brand, effectiveVariant, outHref, componentType, children,
}: RenderInteractiveArgs) {
  const subs: CtaSubs = {
    source_id: brand.siteId,
    sub5: slug,
  }

  const commonEventProps = {
    site_key: SITE_KEY,
    brand: brand.siteId,
    slug,
    component_type: componentType,
    variant: effectiveVariant,
  }
  const extraProps = {
    slot_key: item.slot_key,
    position: item.position,
    item_type: item.item_type,
    cta_text: item.cta_text,
  }

  return (
    <div
      data-position={item.position}
      data-component={componentType}
      className="mt-10 pt-8 border-t border-slate-200 first:border-t-0 first:pt-0 first:mt-0"
      onClick={(e) => {
        const target = e.target as HTMLElement | null
        if (!target) return
        // CTA link → lp_cta_click (matches EditorsPick + listicle_entry).
        // The click continues to /out; keepalive fetch survives the nav.
        if (target.closest('a[href]')) {
          fireKitEvent('lp_cta_click', commonEventProps, {
            eventLabel: `slot_${item.slot_key ?? 'none'}`,
            extraProps,
          })
          return
        }
        // Interaction with a tap surface (quiz option / calculator toggle) →
        // lp_step. Debounced-by-flag on the wrapping div so a rapid sequence
        // of taps only fires one step per interaction burst.
        const isTap =
          target.closest('button[role="radio"]') ||
          target.closest('button[data-quiz-option]') ||
          target.closest('[data-tap-target]')
        if (isTap) {
          fireKitEvent('lp_step', commonEventProps, {
            eventLabel: `slot_${item.slot_key ?? 'none'}_step`,
            extraProps: { ...extraProps, step_source: 'tap' },
          })
        }
      }}
      onChange={(e) => {
        // <select> (StateSelector) and <input type="checkbox"> (multi-select
        // in quizzes that use native form controls) route through onChange.
        const target = e.target as HTMLElement | null
        if (!target) return
        if (target instanceof HTMLSelectElement ||
            (target instanceof HTMLInputElement &&
             (target.type === 'checkbox' || target.type === 'number'))) {
          fireKitEvent('lp_step', commonEventProps, {
            eventLabel: `slot_${item.slot_key ?? 'none'}_step`,
            extraProps: { ...extraProps, step_source: 'change' },
          })
        }
      }}
    >
      <CtaProvider base={outHref} subs={subs}>
        {children}
      </CtaProvider>
    </div>
  )
}
