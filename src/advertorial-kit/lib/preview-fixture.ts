/**
 * Deterministic sample data for verifying the /lp renderer without seeded
 * DB rows. Only ever returned when NODE_ENV !== 'production' AND the URL has
 * ?preview=1. Never touches production traffic.
 */

import type { AdvertorialBrand } from './brand-config'

export interface PreviewAdvertorial {
  id: string
  slug: string
  site_id: string
  title: string
  headline: string
  subhead: string | null
  intro_md: string | null
  hero_image_url: string | null
  disclosure_md: string | null
  status: 'live'
  noindex: true
}

export interface PreviewItem {
  id: string
  advertorial_id: string
  position: number
  item_type: 'monetized' | 'filler' | 'bonus' | 'recap'
  heading: string | null
  body_md: string | null
  image_url: string | null
  cta_text: string | null
  slot_key: number | null
}

export function buildPreviewFixture(siteId: string): { advertorial: PreviewAdvertorial; items: PreviewItem[] } {
  const advertorial: PreviewAdvertorial = {
    id: 'preview-advertorial',
    slug: 'preview',
    site_id: siteId,
    title: 'Discounts & Special Programs Seniors Forget to Claim',
    headline: 'Discounts & Special Programs Seniors Forget to Claim in 2026',
    subhead:
      'From reverse-mortgage payouts to unclaimed rebate cards, here are the benefits most retirees leave on the table — and how to check if you qualify.',
    intro_md:
      'Millions of Americans over 60 are eligible for programs they never enroll in — some worth hundreds of dollars a year, others worth thousands.\n\nWe pulled together the ones our readers ask about most often. Skim the list, check the ones that apply to you, and follow the links to see what you qualify for.',
    hero_image_url: null,
    disclosure_md: null,
    status: 'live',
    noindex: true,
  }

  const items: PreviewItem[] = [
    {
      id: 'p1', advertorial_id: 'preview-advertorial',
      position: 1,
      item_type: 'monetized',
      heading: 'Senior rewards programs (up to $1,000 in gift-card offers)',
      body_md:
        'Several loyalty programs run monthly gift-card promotions targeted at readers 50+. Enrollment is free and takes about a minute — no credit check, no purchase required.\n\n- Amazon, Walmart, and Target reward tracks\n- Cash-back debit options\n- One entry per household per month',
      image_url: null,
      cta_text: 'Check today\'s program »',
      slot_key: 6,
    },
    {
      id: 'p2', advertorial_id: 'preview-advertorial',
      position: 2,
      item_type: 'filler',
      heading: 'SNAP benefits — most eligible seniors never apply',
      body_md:
        'Fewer than half of eligible adults 60+ actually receive SNAP food benefits. Income limits are higher than most people expect, and application help is free at every county office.\n\n> "We hear the same thing every week — *I thought I made too much*." — county intake officer, TX',
      image_url: null,
      cta_text: null,
      slot_key: null,
    },
    {
      id: 'p3', advertorial_id: 'preview-advertorial',
      position: 3,
      item_type: 'monetized',
      heading: 'Term life insurance from $15/month',
      body_md:
        'Term policies for adults 50–75 have gotten dramatically cheaper in the last two years. If you locked in a policy before 2022, it\'s worth a re-shop.',
      image_url: null,
      cta_text: 'Compare rates in your state »',
      slot_key: 2,
    },
    {
      id: 'p4', advertorial_id: 'preview-advertorial',
      position: 4,
      item_type: 'filler',
      heading: 'Restaurant senior discounts (updated for 2026)',
      body_md:
        'Chains that quietly maintain 10–20% senior discounts include Denny\'s, IHOP, Perkins, Golden Corral, and Applebee\'s. Most require asking at the register — they\'re rarely printed on menus.',
      image_url: null,
      cta_text: null,
      slot_key: null,
    },
    {
      id: 'p5', advertorial_id: 'preview-advertorial',
      position: 5,
      item_type: 'monetized',
      heading: 'Reverse mortgage payouts on paid-off homes',
      body_md:
        'Homeowners 62+ with substantial home equity may qualify for a Home Equity Conversion Mortgage (HECM). Payouts vary by age, home value, and interest rate.\n\nThis is a loan — repayable when you move, sell, or pass away. Read every disclosure before signing.',
      image_url: null,
      cta_text: 'Check your payout estimate »',
      slot_key: 5,
    },
    {
      id: 'p6', advertorial_id: 'preview-advertorial',
      position: 6,
      item_type: 'recap',
      heading: 'The short list',
      body_md:
        'If you only do one thing this week: check the rewards program (#1) and the term-life re-shop (#3). Both take under 3 minutes and neither runs a credit check.',
      image_url: null,
      cta_text: null,
      slot_key: null,
    },
  ]

  return { advertorial, items }
}

export function isPreviewAllowed(): boolean {
  return process.env.NODE_ENV !== 'production'
}

// Type-only import guard so the fixture file is tree-shaken from production
// bundles. If NODE_ENV is production this returns null and the caller 404s.
export function maybeBuildPreview(
  siteId: string,
  requestedPreview: boolean,
): { advertorial: PreviewAdvertorial; items: PreviewItem[] } | null {
  if (!requestedPreview) return null
  if (!isPreviewAllowed()) return null
  return buildPreviewFixture(siteId)
}

// Re-export a helper for the page to check what brand identity to render.
export type { AdvertorialBrand }
