// Feature flags for the article-page CTAs. Read from NEXT_PUBLIC env so the
// values are inlined at build time and readable from both server and client
// components. Toggle in Vercel → redeploy to flip.
//
// Semantics:
//
// - `phoneCtasEnabled` (default: TRUE — kill-switch): phone CTAs render on
//   money-in-motion pages (isMoneyInMotionArticle). Set NEXT_PUBLIC_ARTICLE_PHONE_CTAS=off
//   to force all phone CTAs dark. Money-in-motion = Medicare/Medigap/annuity/
//   final-expense/life-insurance pages, where a phone call = $8.75-$12.50/lead.
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
  phoneCtasEnabled: readFlagBool('NEXT_PUBLIC_ARTICLE_PHONE_CTAS', true),
  emailCtasEnabled: readFlagBool('NEXT_PUBLIC_ARTICLE_EMAIL_CTAS', false),
} as const
