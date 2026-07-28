// CaptureKit — the config-only vertical adapter for the shared capture engine.
// A kit fully describes a vertical's capture behavior (quiz, calculator,
// magnets, help route, compliance). Adding a vertical = adding a kit file;
// no component or template edits.
//
// Ruling 7 (2026-07-28 DECISION brief).

export type Vertical =
  | 'medicare'
  | 'final_expense'
  | 'annuity'
  | 'education'
  | 'home_equity'
  | 'estate_ss'
  | 'debt'

export type Brand =
  | 'seniorsimple'
  | 'parentsimple'
  | 'homesimple'
  | 'creditrepairsimple'
  | 'scalingsimple'
  | 'smallbizsimple'
  | 'legalsimple'
  | 'callready'

// ── Quiz ─────────────────────────────────────────────────────────────

export type QuizStepId = string
export type QuizAnswers = Record<string, unknown>
export type BucketId = string

/**
 * A single quiz step. Rendered by BucketQuiz — the component reads `kind` to
 * pick the input widget. Only kinds listed here are supported today; add more
 * to this union + BucketQuiz's step-renderer switch as new verticals need them.
 */
export type QuizStep =
  | {
      id: QuizStepId
      kind: 'zip'
      question: string
      helper?: string
      required?: boolean
    }
  | {
      id: QuizStepId
      kind: 'single-choice'
      question: string
      helper?: string
      options: Array<{ value: string; label: string; sublabel?: string }>
      required?: boolean
    }
  | {
      id: QuizStepId
      kind: 'multi-choice'
      question: string
      helper?: string
      options: Array<{ value: string; label: string; sublabel?: string }>
      required?: boolean
    }
  | {
      id: QuizStepId
      kind: 'email'
      question: string
      helper?: string
      required?: boolean
    }

/** Content shown when the resolver lands on this bucket. */
export interface BucketResultCard {
  bucketId: BucketId
  headline: string
  subhead?: string
  bullets: string[]
  ctaLabel?: string
  ctaHref?: string
}

/**
 * Optional comparison-card set shown alongside a bucket result. Cost figures
 * are computed as `calcTotalAnnual * costMultiplier` when the quiz is mounted
 * in bridge mode with a calculator result payload; otherwise bullets only.
 */
export interface ComparisonCard {
  key: string
  title: string
  costMultiplier: number
  costCaption: string
  bullets: Array<{ tone: 'good' | 'warn'; text: string }>
}

export interface QuizSpec {
  buckets: Array<{ id: BucketId; label: string }>
  steps: QuizStep[]
  /** Pure function: answers → resolved bucketId. */
  resolver: (answers: QuizAnswers) => BucketId
  resultCards: BucketResultCard[]
  /**
   * Optional cover-step copy shown BEFORE the first question when the first
   * step is a zip. Kits omit to fall through to a generic cover.
   */
  cover?: {
    headline: string
    subhead: string
    ctaLabel: string
  }
  /**
   * Optional comparison-card set rendered inside the result view. Which card
   * is highlighted per bucket is looked up via `highlightForBucket`.
   */
  comparisonCards?: ComparisonCard[]
  /** Returns the ComparisonCard.key to highlight for a given bucket, or null. */
  highlightForBucket?: (bucketId: BucketId) => string | null
  /**
   * Optional extra copy driven by specific answer combinations (e.g. Medicare's
   * rx-level personalization). Rendered as a highlighted note in the result view.
   */
  personalize?: (bucketId: BucketId, answers: QuizAnswers) => string | null
  /** Optional per-vertical "processing" copy shown while the submit resolves. */
  processingMessage?: string
  /** Optional per-vertical result-badge label ("Your plan-type match", etc.). */
  resultBadge?: string
  /**
   * Optional server route to POST the quiz submit to. When set (e.g. Medicare's
   * `/api/leads/medicare-calculator`), the route owns CRM lead insertion +
   * publishare mirroring. When absent, the component POSTs directly to the
   * external subscribe endpoint with `quiz_context` — smart-tagger handles
   * the downstream but no CRM lead is written.
   */
  submitRoute?: string
}

// ── Calculator ───────────────────────────────────────────────────────

export type CalcFieldId = string

export type CalcField =
  | {
      id: CalcFieldId
      kind: 'number'
      label: string
      helper?: string
      min?: number
      max?: number
      step?: number
      default?: number
    }
  | {
      id: CalcFieldId
      kind: 'select'
      label: string
      helper?: string
      options: Array<{ value: string; label: string }>
      default?: string
    }

export interface CalcResultLine {
  id: string
  label: string
  format: 'currency' | 'number' | 'percent'
}

export interface CalculatorSpec {
  fields: CalcField[]
  /** Pure function: inputs (keyed by field id) → results (keyed by result line id). */
  compute: (inputs: Record<string, string | number>) => Record<string, number>
  resultLines: CalcResultLine[]
  /** Tool-archetype primary — resolves the two-primaries ambiguity (Ruling 1). */
  primary: 'gate' | 'quiz-bridge'
}

// ── Magnets ──────────────────────────────────────────────────────────

export type MagnetId = string
export type TopicTag = string

export interface MagnetSpec {
  id: MagnetId
  /** URL slug for the landing page: /resources/[lpSlug] */
  lpSlug: string
  title: string
  fileName: string
  downloadPath: string
  coverImagePath: string
  emailSubject: string
  successHeadline: string
  successBody: string
  ctaLabel: string
  adHeadline: string
  adSubhead: string
  lpHeadline: string
  lpSubhead: string
  lpBullets: string[]
}

// ── Per-page config ──────────────────────────────────────────────────

export type CaptureVariant =
  | 'inline'
  | 'tool-gate'
  | 'sidebar-ad'
  | 'inline-ad'

export interface PageCaptureConfig {
  slug: string
  variants: CaptureVariant[]
  magnetId: MagnetId
  topicTag: TopicTag
  abTest?: { armA: MagnetId; armB: MagnetId }
}

// ── Compliance ───────────────────────────────────────────────────────

export interface ComplianceSpec {
  /**
   * The disclaimer copy shown alongside asks. `null` = not yet compliance-
   * signed → components render nothing. Callers may fall back to
   * `educationalNotice` (neutral non-regulatory text).
   */
  disclaimer: string | null
  educationalNotice: string
  /** Env var that gates the primary ask on this vertical. */
  enabledFlag: string
}

// ── Kit ──────────────────────────────────────────────────────────────

export interface CaptureKit {
  vertical: Vertical
  brand: Brand
  /** Optional — verticals that don't need a quiz omit this. */
  quiz?: QuizSpec
  /** Optional — verticals that don't need a calculator omit this. */
  calculator?: CalculatorSpec
  magnets: MagnetSpec[]
  /** Per-slug magnet + variant assignment. Keyed by page slug. */
  pageConfigs: Record<string, PageCaptureConfig>
  /** Fallback magnet used on non-configured articles (sidebar). */
  defaultSidebarMagnetId: MagnetId
  defaultSidebarTopicTag: TopicTag
  /** Route users go to for high-intent phone contact (Ruling 1). */
  getHelpRoute: string
  compliance: ComplianceSpec
  monetize: 'lead' | 'lead+affiliate'
  /**
   * Optional structured educational content shown by EducationalFacts on
   * articles/tool pages within this vertical. Kept purely declarative so
   * the component stays vertical-agnostic; kits without this render nothing.
   */
  educationalContent?: {
    headline: string
    sections: Array<{ title: string; items: string[] }>
  }
}
