/**
 * Block-line validator — server-side, fail-closed.
 *
 * Rejects advertorial copy (item body_md, CTA text, quiz options, etc.) that
 * contains language / claims we've committed to keep out of paid-native
 * creative. Grounded in `00 - Skills/_shared/positioning-standard.md` §6
 * (reverse mortgage compliance) and the broader §W1 GO-LIVE SPEC block-line.
 *
 * Semantics:
 *   - Every rule returns a `reason` string when triggered.
 *   - `validateBlockLine(text)` returns `{ ok: true } | { ok: false, reason }`.
 *   - `sanitizeOrReject(item)` walks all string fields on an item and returns
 *     the first block-line violation found, if any.
 *
 * NOT a copy-editor: this rejects language patterns, not stylistic weakness.
 * If a rule fires, the copy needs a rewrite, not a tweak.
 */

export interface BlockLineResult {
  ok: boolean
  reason?: string
  ruleId?: string
  matched?: string
}

/**
 * Banned patterns. Ordered from most-common → most-obscure so the first hit
 * is usually the most actionable feedback. Each rule keeps a stable `id` so
 * the render log can flag "which rule fired on which item."
 */
interface Rule {
  id: string
  reason: string
  test: (haystack: string) => string | null   // returns matched slice or null
}

const RULES: Rule[] = [
  // Manufactured urgency / countdown
  {
    id: 'manufactured_urgency',
    reason: 'Manufactured urgency / countdown language (act now, ends today, last chance, etc).',
    test: reMatch(/\b(act now|today only|ends? (today|tonight|soon)|last chance|expires? (soon|today|tonight)|only \d+ (spots?|left)|limited (time|spots?))\b/i),
  },
  // Fake scarcity / limited-time gates
  {
    id: 'false_scarcity',
    reason: 'False scarcity — no "program ending" or fabricated deadline claims.',
    test: reMatch(/\b(program (is )?(ending|closing|about to close)|before (this|the) (offer|program) (ends|goes away)|hurry (before|while))\b/i),
  },
  // Fabricated testimonial / rating markers
  {
    id: 'fabricated_verification',
    reason: 'Fake verification / rating badges ("verified", star-rating without attribution).',
    test: reMatch(/\b(verified (customer|reviewer|user)|100% (verified|real)|5[- ]?star (rated|rating)|rated 5\/5)\b/i),
  },
  // Government / SS entitlement badge language
  {
    id: 'govt_entitlement_badge',
    reason: 'Government-benefit / Social-Security-entitlement framing (e.g. "government-approved", "SS-approved").',
    test: reMatch(/\b(government[- ]?(approved|backed|sponsored|program)|federally[- ]?approved|SS[- ]?approved|social security (benefit|entitlement|program) (you|seniors) (can|are|deserve))\b/i),
  },
  // Conspiracy hook
  {
    id: 'conspiracy_hook',
    reason: 'Conspiracy hook ("they don\'t want you to know", "hidden secret").',
    test: reMatch(/\b(they don'?t want you to know|the (secret|trick) (banks?|the government|companies|insurers) (don'?t want|hide|are hiding)|one weird trick|hidden secret|the truth about)\b/i),
  },
  // Guaranteed payout / income claims. Allow up to ~30 chars of copy between
  // "guaranteed" and the outcome word so "Guaranteed $1,000 payout" trips.
  {
    id: 'guaranteed_payout',
    reason: 'Guaranteed-payout / guaranteed-income claim — advertorials must never promise a number.',
    test: reMatch(/\bguarantee(d)?[\s\S]{0,30}?(payout|income|check|earnings|refund|approval|return|savings)\b/i),
  },
  // Free-on-a-paid-offer bait
  {
    id: 'free_on_paid_offer',
    reason: '"Free" / "no cost" claim on an offer that is actually paid or recurring — bait-and-switch.',
    test: reMatch(/\b(100% (free|no cost)|absolutely free|no cost to you|free membership|free money|free (\$?\d+|gift|reward)( |,|\.|!))\b/i),
  },
  // Reverse-mortgage specific (positioning-standard §6): "no payments" without caveat
  {
    id: 'rm_no_payments_no_caveat',
    reason: 'Reverse mortgage: "no payments" without the obligation caveat. Use "No Monthly Mortgage Payments" + the taxes/insurance caveat.',
    test: (s) => {
      const bad = /\bno (mortgage )?payments?\b/i
      const caveat = /(taxes and insurance|property taxes|insurance and (property )?taxes|comply with the terms of the loan)/i
      if (bad.test(s) && !caveat.test(s) && !/no monthly mortgage payments?/i.test(s)) {
        const m = s.match(bad)
        return m ? m[0] : null
      }
      return null
    },
  },
  // Reverse-mortgage specific: "stay in your home" without the terms caveat
  {
    id: 'rm_stay_in_home_no_caveat',
    reason: 'Reverse mortgage: "stay in your home" claim requires "as long as you comply with the terms of the loan".',
    test: (s) => {
      const bad = /\bstay in (your|the) (home|house)\b/i
      const caveat = /(comply with the terms of the loan|comply with loan terms|meet the loan requirements|maintain the property, taxes, and insurance)/i
      if (bad.test(s) && !caveat.test(s)) {
        const m = s.match(bad)
        return m ? m[0] : null
      }
      return null
    },
  },
  // Reverse-mortgage specific: "counselor" (must be "Professional")
  {
    id: 'rm_counselor_term',
    reason: 'Reverse mortgage compliance: use "Professional", never "Counselor".',
    test: reMatch(/\bcounselor\b/i),
  },
]

function reMatch(re: RegExp): (s: string) => string | null {
  return (s: string) => {
    const m = s.match(re)
    return m ? m[0] : null
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function validateBlockLine(text: string | null | undefined): BlockLineResult {
  if (!text) return { ok: true }
  for (const rule of RULES) {
    const hit = rule.test(text)
    if (hit) {
      return { ok: false, ruleId: rule.id, reason: rule.reason, matched: hit }
    }
  }
  return { ok: true }
}

/**
 * Walk all string / string-array fields on a component_props object + a
 * headline/body/cta text bundle, return the FIRST block-line violation.
 *
 * Fail-closed: if any rule fires, the caller should skip rendering the item
 * (or the whole advertorial) and log the reason.
 */
export function checkItemStrings(input: {
  heading?: string | null
  body_md?: string | null
  cta_text?: string | null
  component_props?: Record<string, unknown> | null
}): BlockLineResult {
  const check = (t: string | null | undefined): BlockLineResult | null => {
    if (!t) return null
    const r = validateBlockLine(t)
    return r.ok ? null : r
  }
  const hit =
    check(input.heading) ??
    check(input.body_md) ??
    check(input.cta_text) ??
    checkNested(input.component_props ?? {})
  return hit ?? { ok: true }
}

function checkNested(obj: unknown): BlockLineResult | null {
  if (obj === null || obj === undefined) return null
  if (typeof obj === 'string') {
    const r = validateBlockLine(obj)
    return r.ok ? null : r
  }
  if (Array.isArray(obj)) {
    for (const v of obj) {
      const r = checkNested(v)
      if (r) return r
    }
    return null
  }
  if (typeof obj === 'object') {
    for (const v of Object.values(obj as Record<string, unknown>)) {
      const r = checkNested(v)
      if (r) return r
    }
    return null
  }
  return null
}
