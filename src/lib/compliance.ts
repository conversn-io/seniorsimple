// Compliance-copy accessor.
//
// The Medicare TPMO-style disclaimer must be compliance-signed before it
// renders to a user. Historically we hardcoded a placeholder in the
// component; that placeholder ended up shipping to preview visible to users.
// This module is the guardrail so that can never happen again.
//
// Contract:
//   getMedicareComplianceDisclaimer()
//     → returns the disclaimer text if NEXT_PUBLIC_MEDICARE_COMPLIANCE_DISCLAIMER
//       is set and non-empty AND does not begin with "[PLACEHOLDER"
//     → otherwise returns null; callers MUST render nothing in that case.
//       Optionally, callers may render getMedicareEducationalNotice() as a
//       neutral, non-regulatory fallback line — that string contains no plan
//       claims, no offer language, and passes as generic educational context.
//
// A defensive "[PLACEHOLDER" reject is baked in: even if someone sets the
// env var to a placeholder string, the accessor still returns null. The
// placeholder is truly unreachable in user-facing UI.
//
// To go live: set NEXT_PUBLIC_MEDICARE_COMPLIANCE_DISCLAIMER on Vercel to the
// exact compliance-approved copy. No code change required.

export function getMedicareComplianceDisclaimer(): string | null {
  const raw = process.env.NEXT_PUBLIC_MEDICARE_COMPLIANCE_DISCLAIMER
  if (!raw) return null
  const trimmed = raw.trim()
  if (!trimmed) return null
  if (trimmed.toUpperCase().startsWith('[PLACEHOLDER')) return null
  return trimmed
}

// Neutral fallback line for use when the real disclaimer is not yet set.
// This is NOT a compliance disclaimer — it is educational framing text with
// no plan claims. Safe to render without sign-off.
export function getMedicareEducationalNotice(): string {
  return 'Educational information only. A licensed advisor can walk you through the specific plans available where you live.'
}
