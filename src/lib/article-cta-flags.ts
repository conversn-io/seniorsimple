// Feature flags for the article-page CTAs. Read from NEXT_PUBLIC env so the
// values are inlined at build time and readable from both server and client
// components. Toggle in Vercel → redeploy to flip.
//
// Semantics:
//
// - `phoneCtasEnabled` (default: FALSE — opt-in per phone-off-content doctrine):
//   phone CTAs render on money-in-motion pages (isMoneyInMotionArticle) ONLY
//   when explicitly enabled. Doctrine: agent/phone CTAs belong on
//   `/get-help/<vertical>` LPs, never mid-article — a Medicare-branded phone
//   bar leaking onto a Final Expense article is a compliance defect
//   (phone-off-content + wrong vertical). Set
//   NEXT_PUBLIC_ARTICLE_PHONE_CTAS=on to opt any deploy back into in-article
//   phone CTAs (won't happen on prod without a deliberate config change).
//   Historical note: default flipped 2026-08-05 after a CoS P0 escalation —
//   was TRUE (kill-switch), now FALSE (opt-in).
//
// - `emailCtasEnabled` (default: FALSE — opt-in): email CTAs render on ALL
//   article pages regardless of intent. Set NEXT_PUBLIC_ARTICLE_EMAIL_CTAS=on
//   to turn on the mid-scroll + sticky email captures.

function readFlagBool(name: string, defaultValue: boolean): boolean {
  const raw = process.env[name]
  if (raw === undefined) return defaultValue
  const v = raw.toLowerCase().trim()
  if (v === 'on' || v === 'true' || v === '1' || v === 'yes') return true
  if (v === 'off' || v === 'false' || v === '0' || v === 'no' || v === '') return false
  return defaultValue
}

export const articleCtaFlags = {
  // Default FALSE — phone-off-content doctrine (see header comment).
  phoneCtasEnabled: readFlagBool('NEXT_PUBLIC_ARTICLE_PHONE_CTAS', false),
  emailCtasEnabled: readFlagBool('NEXT_PUBLIC_ARTICLE_EMAIL_CTAS', false),
} as const
