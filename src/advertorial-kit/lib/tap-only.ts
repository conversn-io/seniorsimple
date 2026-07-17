/**
 * Tap-only invariant — server-side guard.
 *
 * Advertorial components may collect selections/taps and numeric calculator
 * inputs ONLY. NO free-text field for identifying data (ZIP, email, phone,
 * name, address, DOB, SSN). Doctrine: identifying data enters the funnel on
 * the affiliate's landing page — not on ours.
 *
 * Rules enforced against component_props at render time:
 *   1. No prop named/shaped like an identifying-data field.
 *   2. If a component declares an `inputs` array (e.g. SavingsCalculator),
 *      each input entry may only have `type: 'number' | 'select' | 'tap'`.
 *      `type: 'text' | 'email' | 'tel' | 'zip'` → reject.
 *   3. Explicit component-type allow-list — components not in the list are
 *      rejected (fail-closed) so a typo doesn't smuggle in a text-input widget.
 */

export interface TapOnlyResult {
  ok: boolean
  reason?: string
  offendingPath?: string
}

/**
 * Components allowed in the kit render path. Adding one is a deliberate
 * choice: the added component MUST be verifiable as tap-only.
 */
export const ALLOWED_COMPONENT_TYPES = new Set<string>([
  // Chrome
  'masthead',
  'lead_in',
  'disclosure_footer',
  // Text primitives
  'section',
  'listicle_entry',
  'blue_anchor',
  'qualify_checklist',
  'quote',
  'clickable_image',
  'trust_bar',
  'rating',
  // CTAs
  'primary_cta',
  'section_cta',
  'sticky_cta',
  'editors_pick',
  // Tap-only interactive
  'image_quiz',
  'multi_select_quiz',
  'state_selector',
  // Numeric-only interactive
  'savings_calculator',
  'savings_breakdown',
  // Curated data
  'deal_card',
  'deals_showcase',
  // Recap
  'wrap_up_list',
])

/**
 * Prop keys that would smuggle in identifying data. Rejected outright when
 * they appear on any component_props. Case-insensitive.
 */
const IDENTIFYING_FIELD_KEYS = new Set([
  'email',
  'phone',
  'phone_number',
  'phonenumber',
  'zip',
  'zipcode',
  'zip_code',
  'postal',
  'postal_code',
  'postalcode',
  'firstname',
  'first_name',
  'lastname',
  'last_name',
  'fullname',
  'full_name',
  'name',
  'address',
  'street',
  'city',                    // free-text city → identifying; StateSelector uses a select, allowed
  'ssn',
  'social_security',
  'dob',
  'date_of_birth',
  'birthdate',
  'birthday',
])

// input.type values allowed on SavingsCalculator-shaped inputs
const ALLOWED_INPUT_TYPES = new Set(['number', 'select', 'tap', 'toggle'])
const FORBIDDEN_INPUT_TYPES = new Set([
  'text',
  'email',
  'tel',
  'phone',
  'zip',
  'zipcode',
  'password',
  'search',
])

export function checkTapOnly(input: {
  component_type: string | null | undefined
  component_props: Record<string, unknown> | null | undefined
}): TapOnlyResult {
  const ct = (input.component_type ?? '').trim()
  if (!ct) return { ok: true }               // NULL type = default listicle path, no props to validate

  if (!ALLOWED_COMPONENT_TYPES.has(ct)) {
    return {
      ok: false,
      reason: `Unknown component_type '${ct}' — not in the tap-only allow-list. Add it to ALLOWED_COMPONENT_TYPES after verifying no free-text identifying fields.`,
      offendingPath: 'component_type',
    }
  }

  const props = input.component_props ?? {}

  // 1. Top-level key-name check ONLY. Nested keys (e.g. `inputs[].name`) are
  //    structural — not user-facing form fields. Top-level `component_props.email`
  //    is exactly the pattern we forbid.
  for (const key of Object.keys(props)) {
    if (IDENTIFYING_FIELD_KEYS.has(key.toLowerCase())) {
      return {
        ok: false,
        reason: `component_props.${key} — identifying-data field. Kit render path forbids ZIP/email/name/phone/SSN/DOB inputs.`,
        offendingPath: `component_props.${key}`,
      }
    }
  }
  // Also block identifying keys anywhere on nested option objects (e.g.
  // options: [{ zip_code: '...' }]) — those are still leaf form-field patterns.
  const nestedBad = firstIdentifyingKey(props, /*topLevelSkip*/ true)
  if (nestedBad) {
    return {
      ok: false,
      reason: `component_props contains a nested identifying-data key '${nestedBad}'. Kit render path forbids ZIP/email/name/phone/SSN/DOB anywhere.`,
      offendingPath: `component_props.**.${nestedBad}`,
    }
  }

  // 2. inputs[].type check (SavingsCalculator-shaped)
  const inputs = (props as { inputs?: unknown }).inputs
  if (Array.isArray(inputs)) {
    for (let i = 0; i < inputs.length; i++) {
      const entry = inputs[i]
      if (entry && typeof entry === 'object') {
        const t = String((entry as { type?: unknown }).type ?? '').toLowerCase()
        if (t && FORBIDDEN_INPUT_TYPES.has(t)) {
          return {
            ok: false,
            reason: `component_props.inputs[${i}].type='${t}' is a text/identifying-data input. Only ${[...ALLOWED_INPUT_TYPES].join(' / ')} are allowed.`,
            offendingPath: `component_props.inputs[${i}].type`,
          }
        }
        if (t && !ALLOWED_INPUT_TYPES.has(t)) {
          return {
            ok: false,
            reason: `component_props.inputs[${i}].type='${t}' is not in the allow-list.`,
            offendingPath: `component_props.inputs[${i}].type`,
          }
        }
      }
    }
  }

  return { ok: true }
}

function firstIdentifyingKey(obj: unknown, topLevelSkip = false): string | null {
  if (obj === null || obj === undefined) return null
  if (Array.isArray(obj)) {
    for (const v of obj) {
      const k = firstIdentifyingKey(v, false)
      if (k) return k
    }
    return null
  }
  if (typeof obj === 'object') {
    for (const key of Object.keys(obj as Record<string, unknown>)) {
      // Skip 'name' at any level — it's used structurally (e.g. inputs[].name).
      // If a component_type wants to collect a user name it must use
      // firstname/lastname/fullname, which stay banned.
      if (key.toLowerCase() === 'name') {
        const nested = firstIdentifyingKey((obj as Record<string, unknown>)[key], false)
        if (nested) return nested
        continue
      }
      if (!topLevelSkip && IDENTIFYING_FIELD_KEYS.has(key.toLowerCase())) return key
      const nested = firstIdentifyingKey((obj as Record<string, unknown>)[key], false)
      if (nested) return nested
    }
  }
  return null
}
