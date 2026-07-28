import type { CaptureKit, Vertical, MagnetSpec, PageCaptureConfig } from './types'
import { medicareKit } from './medicare'
import { finalExpenseKit } from './final-expense'

// Registry of every vertical's kit. Adding a vertical = adding a kit file +
// one entry here. Selection uses the vertical inferred from the page
// (articles.archetype / fn_intent_bucket / per-page tag).

export const KITS: Record<Vertical, CaptureKit | undefined> = {
  medicare: medicareKit,
  final_expense: finalExpenseKit,
  annuity: undefined,
  education: undefined,
  home_equity: undefined,
  estate_ss: undefined,
  debt: undefined,
}

export function getKit(vertical: Vertical): CaptureKit | null {
  return KITS[vertical] ?? null
}

/**
 * Resolve a kit's page-config by slug. Returns null if no matching page
 * config exists in the kit — components render nothing in that case.
 */
export function getPageConfig(kit: CaptureKit, slug: string): PageCaptureConfig | null {
  return kit.pageConfigs[slug] ?? null
}

/**
 * Client-side A/B resolver — assigns the arm on first call per session and
 * persists it in sessionStorage so every capture unit on the page sees the
 * same variant. Safe to call from SSR (falls through to the default magnet).
 */
export function resolvePageMagnet(config: PageCaptureConfig): {
  magnetId: string
  abArm?: string
} {
  if (!config.abTest) return { magnetId: config.magnetId }
  if (typeof window === 'undefined') return { magnetId: config.magnetId }
  try {
    const key = `ss_capture_ab_arm:${config.slug}`
    let arm = window.sessionStorage.getItem(key)
    if (arm !== 'A' && arm !== 'B') {
      arm = Math.random() < 0.5 ? 'A' : 'B'
      window.sessionStorage.setItem(key, arm)
    }
    const magnetId = arm === 'A' ? config.abTest.armA : config.abTest.armB
    return { magnetId, abArm: arm }
  } catch {
    return { magnetId: config.magnetId }
  }
}

export function getMagnet(kit: CaptureKit, magnetId: string): MagnetSpec | null {
  return kit.magnets.find((m) => m.id === magnetId) ?? null
}

export function getMagnetByLpSlug(kit: CaptureKit, lpSlug: string): MagnetSpec | null {
  return kit.magnets.find((m) => m.lpSlug === lpSlug) ?? null
}

/**
 * Cross-kit LP-slug lookup — used by /resources/[slug]/page.tsx which doesn't
 * know the vertical ahead of time (it dispatches by lpSlug).
 */
export function findMagnetByLpSlug(lpSlug: string): { kit: CaptureKit; magnet: MagnetSpec } | null {
  for (const kit of Object.values(KITS)) {
    if (!kit) continue
    const magnet = getMagnetByLpSlug(kit, lpSlug)
    if (magnet) return { kit, magnet }
  }
  return null
}

/**
 * Which kit owns this page? Searches every kit's `pageConfigs` for a matching
 * slug and returns the first match. When multiple kits share a slug (they
 * shouldn't — kits are vertical-scoped), the first hit in registry order
 * wins. Returns null for pages that no kit configures.
 *
 * MVP vertical detection — a follow-up will replace this with a per-article
 * `vertical` column read from the CMS. Kit-owned pageConfigs are the
 * authority until then.
 */
export function resolveKitForPage(slug: string): CaptureKit | null {
  for (const kit of Object.values(KITS)) {
    if (!kit) continue
    if (kit.pageConfigs[slug]) return kit
  }
  return null
}

export function getAllMagnetsAcrossKits(): Array<{ kit: CaptureKit; magnet: MagnetSpec }> {
  const result: Array<{ kit: CaptureKit; magnet: MagnetSpec }> = []
  for (const kit of Object.values(KITS)) {
    if (!kit) continue
    for (const magnet of kit.magnets) {
      result.push({ kit, magnet })
    }
  }
  return result
}
