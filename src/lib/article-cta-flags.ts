// Feature flags for the article-page CTAs. Read from NEXT_PUBLIC env so the
// values are inlined at build time and readable from both server and client
// components. Toggle in Vercel → redeploy to flip.
//
// Defaults: BOTH off. Phone CTAs (ScrollRevealedCallButton + InterstitialCTABanner)
// stay dark until we've evaluated the email-capture variants, per the
// 2026-07-07 capture-leak fix.

function readFlag(name: string): boolean {
  const raw = process.env[name]
  if (!raw) return false
  const v = raw.toLowerCase().trim()
  return v === 'on' || v === 'true' || v === '1' || v === 'yes'
}

export const articleCtaFlags = {
  phoneCtasEnabled: readFlag('NEXT_PUBLIC_ARTICLE_PHONE_CTAS'),
  emailCtasEnabled: readFlag('NEXT_PUBLIC_ARTICLE_EMAIL_CTAS'),
} as const
