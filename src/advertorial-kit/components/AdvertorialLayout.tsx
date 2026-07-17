/**
 * Chrome for an advertorial page: masthead, hero, disclosure, editorial footer.
 * Site-specific look is driven by getAdvertorialBrand(siteId).
 */

import type { AdvertorialBrand } from '@/lib/advertorials/brand-config'

interface AdvertorialLayoutProps {
  brand: AdvertorialBrand
  headline: string
  subhead?: string | null
  heroImageUrl?: string | null
  disclosureHtml: string
  children: React.ReactNode
}

export function AdvertorialLayout({
  brand,
  headline,
  subhead,
  heroImageUrl,
  disclosureHtml,
  children,
}: AdvertorialLayoutProps) {
  const now = new Date()
  const dateLabel = now.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <article
      data-advertorial={brand.siteId}
      className={`bg-white text-slate-900 ${brand.bodyFontClass}`}
      style={{ ['--advertorial-accent' as any]: brand.accent }}
    >
      {/* Masthead */}
      <header className="border-b border-slate-200">
        <div className="mx-auto max-w-3xl px-5 py-4 flex items-baseline justify-between">
          <div
            className={`text-2xl tracking-tight ${brand.headlineFontClass}`}
            style={{ color: brand.accent }}
          >
            <span className="font-semibold">{brand.masthead}</span>
          </div>
          <div className="text-xs uppercase tracking-wider text-slate-500">
            Sponsored Editorial · {dateLabel}
          </div>
        </div>
      </header>

      {/* Ad-disclosure ribbon */}
      <div className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-3xl px-5 py-2 text-xs text-slate-600">
          <strong className="font-semibold text-slate-700">Advertising disclosure:</strong>{' '}
          This is a sponsored editorial. We may earn a commission from links below.
        </div>
      </div>

      {/* Hero */}
      <div className="mx-auto max-w-3xl px-5 pt-8 pb-6">
        <h1
          className={`${brand.headlineFontClass} text-4xl md:text-5xl leading-tight font-bold text-slate-900`}
        >
          {headline}
        </h1>
        {subhead ? (
          <p className="mt-4 text-lg text-slate-600 leading-relaxed">{subhead}</p>
        ) : null}

        {heroImageUrl ? (
          <figure className="mt-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={heroImageUrl}
              alt=""
              className="w-full rounded-md border border-slate-200"
              loading="eager"
            />
          </figure>
        ) : null}
      </div>

      {/* Body */}
      <div className="mx-auto max-w-3xl px-5 pb-16">
        {children}
      </div>

      {/* Footer disclosure block */}
      <footer className="border-t border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-3xl px-5 py-8 text-xs text-slate-600 leading-relaxed space-y-3">
          <div
            className="advertorial-disclosure space-y-2"
            dangerouslySetInnerHTML={{ __html: disclosureHtml }}
          />
          <div className="pt-3 border-t border-slate-200 text-slate-500">
            © {now.getFullYear()} {brand.publisherLegal}. All content is
            informational only and is not financial, insurance, tax, legal, or
            medical advice.
          </div>
        </div>
      </footer>
    </article>
  )
}
