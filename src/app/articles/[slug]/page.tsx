import { getArticle, getRelatedArticles } from '../../../lib/articles'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
// §8-C directive (2026-07-23): phone CTAs off content routes.
// InterstitialCTABanner (inline phone) and ScrollRevealedCallButton (sticky
// phone) are no longer imported — phone lives exclusively at /get-help/<vertical>.
// The Simple Life Newsletter subscribe (ScrollRevealedEmailButton) and the
// closable Planning-Guide interstitial (InterstitialEmailBanner) remain — the
// only two capture surfaces on content pages besides the archetype-mounted unit.
import InterstitialEmailBanner from '@/components/articles/InterstitialEmailBanner'
import ScrollRevealedEmailButton from '@/components/articles/ScrollRevealedEmailButton'
import MedicareEducationalFacts from '@/components/articles/MedicareEducationalFacts'
import NewsletterCaptureCTA from '@/components/articles/NewsletterCaptureCTA'
import MedicareCostCalculator from '@/components/calculators/MedicareCostCalculator'
import MedicareBucketQuiz from '@/components/quiz/MedicareBucketQuiz'
import { articleCtaFlags } from '@/lib/article-cta-flags'
import { isMoneyInMotionArticle } from '@/lib/article-intent'

// §6b R1 — decision-moment injection helper. Comparison articles need the
// quiz to appear inline at the point the reader is actively weighing options
// (typically a "How to choose", "Which is right for you", or "Best for"
// heading), not appended as a full-width block below the article. Returns
// [beforeHtml, afterHtml] split immediately after the closing tag of the
// first matching h2/h3, or null if no heading matches — caller falls back to
// bottom-of-article mount in that case.
//
// Pattern list is deliberately narrow: matching the article-body headings we
// actually author in the Medicare cluster. Regex + string split (no HTML
// parser) — html_body is server-rendered trusted CMS output; we're not
// executing it, only splitting.
const DECISION_HEADING_PATTERNS: RegExp[] = [
  /how to choose/i,
  /how do (?:i|you) choose/i,
  /which .* (?:is )?right (?:for you|for your)/i,
  /best for you/i,
  /best for your/i,
  /choosing (?:the |a )?right/i,
]
function splitAtChoiceHeading(html: string): [string, string] | null {
  const headingRegex = /<h([234])\b[^>]*>([\s\S]*?)<\/h\1>/gi
  let match: RegExpExecArray | null
  while ((match = headingRegex.exec(html)) !== null) {
    const headingText = match[2].replace(/<[^>]+>/g, '').trim()
    if (DECISION_HEADING_PATTERNS.some((p) => p.test(headingText))) {
      const splitPoint = match.index + match[0].length
      return [html.slice(0, splitPoint), html.slice(splitPoint)]
    }
  }
  return null
}

interface ArticlePageProps {
  params: Promise<{ slug: string }>
}

// Force dynamic rendering - fetch from database on every request
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params
  const { article, error } = await getArticle(slug)

  if (error || !article) {
    console.error('Error fetching article:', error)
    notFound()
  }

  // Debug: Log html_body status
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Article ${slug}] html_body exists:`, !!article.html_body)
    console.log(`[Article ${slug}] html_body length:`, article.html_body?.length || 0)
  }

  // Get related articles
  const { articles: relatedArticles } = await getRelatedArticles(
    article.id, 
    article.category_id, 
    3
  )

  // Resolve phone number (article -> domain -> default)
  const phoneNumber = 
    article.phone_number || 
    article.domain?.phone_number || 
    process.env.NEXT_PUBLIC_DEFAULT_PHONE_NUMBER || 
    null

  // Medicare cluster gate — coarse filter. Archetype (below) chooses which
  // capture unit to mount within the cluster.
  const isMedicareArticle =
    article.title?.toLowerCase().includes('medicare') ||
    article.category_details?.name?.toLowerCase().includes('medicare') ||
    article.tags?.some(tag => tag.toLowerCase().includes('medicare')) ||
    article.slug?.includes('medicare')

  // §6b directive (2026-07-23) — Keenan rulings, binding revision to §8-B.
  //   guide      → BucketQuiz (unchanged from §8-B)
  //   comparison → BucketQuiz (reversed §8-B — quiz belongs on the highest-
  //                comparison-burden pages; injected mid-body at the "decision
  //                moment", i.e. immediately after the first "How to choose /
  //                Best for" heading. Falls back to bottom mount if no heading
  //                matches.)
  //   tool | data → Calculator (bridges to quiz on result; unchanged)
  //   null / other → no archetype-mounted primary; the lead-magnet
  //                  Planning-Guide interstitial covers those.
  //
  // Compliance gate (§6b hold-for-sign-off): even when routing says mount, the
  // quiz stays dark unless NEXT_PUBLIC_MEDICARE_QUIZ_ENABLED === 'true'. Lets
  // us merge to main without shipping regulated content unreviewed. Flip the
  // env var + rebuild once compliance signs off the TPMO copy.
  const archetype = (article as any).archetype as string | null | undefined
  const isQuizArchetype = archetype === 'guide' || archetype === 'comparison'
  const quizEnabled = process.env.NEXT_PUBLIC_MEDICARE_QUIZ_ENABLED === 'true'
  const showBucketQuiz = isMedicareArticle && isQuizArchetype && quizEnabled
  const showCalculator = isMedicareArticle && (archetype === 'tool' || archetype === 'data')

  // §6b R2 — lead-magnet interstitial only where no archetype-mounted primary
  // exists. On quiz/calculator pages the interstitial would collide mid-stream
  // with the primary ask; suppress it there. Non-Medicare articles keep the
  // interstitial (they have no primary to compete with).
  const hasArchetypePrimary = showBucketQuiz || showCalculator
  const showLeadMagnetInterstitial =
    articleCtaFlags.emailCtasEnabled && !(isMedicareArticle && hasArchetypePrimary)

  // §6b R1 — for comparison articles specifically, inject the quiz at the
  // decision-moment heading rather than appending it below the article body.
  // splitAtChoiceHeading returns [before, after] or null (fall back to bottom
  // mount when no heading matches). Guide archetype always uses bottom mount.
  const bodyHtml = article.html_body ?? null
  const comparisonInjection =
    showBucketQuiz && archetype === 'comparison' && bodyHtml
      ? splitAtChoiceHeading(bodyHtml)
      : null

  // Money-in-motion pages (Medicare, Medigap, annuity, final expense, life
  // insurance) keep phone CTAs — a phone call is worth $8.75-$12.50/lead.
  // Editorial pages (Social Security, retirement basics) get email only.
  const isMoneyPage = isMoneyInMotionArticle(article)

  // Generate structured data for SEO/AEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": article.title,
    "description": article.excerpt || article.meta_description,
    "image": article.featured_image_url ? [article.featured_image_url] : [],
    "datePublished": article.created_at,
    "dateModified": article.updated_at,
    "author": {
      "@type": "Organization",
      "name": "SeniorSimple"
    },
    "publisher": {
      "@type": "Organization",
      "name": "SeniorSimple",
      "logo": {
        "@type": "ImageObject",
        "url": "https://seniorsimple.org/logo.png"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://seniorsimple.org/articles/${article.slug}`
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F5F0]">
      {/* Structured Data for SEO/AEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* Breadcrumb */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <nav className="flex text-sm text-gray-600">
            <Link href="/" className="hover:text-[#36596A]">Home</Link>
            <span className="mx-2">/</span>
            <Link href="/articles" className="hover:text-[#36596A]">Articles</Link>
            <span className="mx-2">/</span>
            <span className="text-[#36596A]">{article.title}</span>
          </nav>
        </div>
      </section>

      {/* Article Hero */}
      <section className="bg-white">
        <div className="max-w-4xl mx-auto px-6 py-12">
          {/* Category Badge */}
          {article.category_details && (
            <div className="mb-4">
              <span className="inline-block px-4 py-2 bg-[#E4CDA1] text-[#36596A] text-sm font-medium rounded-full">
                {article.category_details.name}
              </span>
            </div>
          )}

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-serif font-semibold text-[#36596A] mb-6 leading-tight">
            {article.title}
          </h1>

          {/* Excerpt */}
          {article.excerpt && (
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              {article.excerpt}
            </p>
          )}

          {/* Meta Info */}
          <div className="flex items-center text-gray-500 text-sm mb-8 pb-8 border-b border-gray-200">
            <span>
              Published {new Date(article.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
            {article.updated_at !== article.created_at && (
              <>
                <span className="mx-3">•</span>
                <span>
                  Updated {new Date(article.updated_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </>
            )}
          </div>

          {/* Featured Image */}
          {article.featured_image_url && (
            <div className="mb-12">
              <div className="relative h-96 rounded-xl overflow-hidden">
                <Image
                  src={article.featured_image_url}
                  alt={article.featured_image_alt || article.title}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Article Content */}
      <section className="bg-white">
        <div className="max-w-4xl mx-auto px-6 pb-16">
          {article.html_body ? (
            // html_body already includes <div class="prose"> wrapper, so render it directly.
            // §6b R1: on comparison + quiz-enabled paths, split the body at the
            // decision-moment heading and inject the quiz inline. Otherwise
            // render the body whole and (only for archetypes without a
            // primary) show the lead-magnet interstitial mid-flow.
            comparisonInjection ? (
              <>
                <div
                  className="text-gray-800 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: comparisonInjection[0] }}
                  style={{ fontSize: '18px', lineHeight: '1.8' }}
                />
                <div className="my-10">
                  <MedicareBucketQuiz slug={slug} variant="standalone" />
                </div>
                <div
                  className="text-gray-800 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: comparisonInjection[1] }}
                  style={{ fontSize: '18px', lineHeight: '1.8' }}
                />
              </>
            ) : (
              <>
                <div
                  className="text-gray-800 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: article.html_body }}
                  style={{ fontSize: '18px', lineHeight: '1.8' }}
                />
                {/* §6b R2: lead-magnet interstitial only when no archetype-mounted
                    primary is present on this page — never render both. */}
                {showLeadMagnetInterstitial && (
                  <InterstitialEmailBanner
                    slug={slug}
                    category={article.category_details?.name ?? null}
                  />
                )}
              </>
            )
          ) : (
            // Fallback to markdown content with prose wrapper. Comparison
            // injection uses html_body only; markdown-only articles fall back
            // to bottom-mount below.
            <>
              <div className="prose prose-lg max-w-none">
                <div
                  className="text-gray-800 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: article.content }}
                  style={{ fontSize: '18px', lineHeight: '1.8' }}
                />
              </div>
              {showLeadMagnetInterstitial && (
                <InterstitialEmailBanner
                  slug={slug}
                  category={article.category_details?.name ?? null}
                />
              )}
            </>
          )}

          {/* §6b archetype-mounted primary — bottom mount fallback.
              guide      → BucketQuiz below the article body.
              comparison → BucketQuiz below IF the injection helper found no
                           decision-moment heading to split on (fallback path).
                           Otherwise the quiz already rendered inline above.
              tool | data → Calculator.
              Compliance gate: showBucketQuiz is false unless
              NEXT_PUBLIC_MEDICARE_QUIZ_ENABLED === 'true'. */}
          {showBucketQuiz && !comparisonInjection && (
            <div className="mt-12 mb-8">
              <MedicareBucketQuiz slug={slug} variant="standalone" />
            </div>
          )}
          {showCalculator && !showBucketQuiz && (
            <div className="mt-12 mb-8">
              <MedicareCostCalculator />
            </div>
          )}

          {/* §8-E educational body content — enrollment periods + late
              enrollment penalties. Renders on ALL Medicare articles regardless
              of archetype (was previously coupled to the calculator, which
              meant guide articles lost it after §8-B routed them to the quiz). */}
          {isMedicareArticle && <MedicareEducationalFacts />}
        </div>
      </section>

      {/* Sticky scroll CTA — §8-C: bottom-locked phone removed. The only
          bottom-locked surface on content pages is the Simple Life Newsletter
          subscribe (rebranded from the old Medicare-guide CTA). */}
      {articleCtaFlags.emailCtasEnabled && (
        <ScrollRevealedEmailButton
          slug={slug}
          category={article.category_details?.name ?? null}
        />
      )}

      {/* Tags */}
      {article.tags && article.tags.length > 0 && (
        <section className="bg-white border-t border-gray-200">
          <div className="max-w-4xl mx-auto px-6 py-8">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {article.tags.map((tag, index) => (
                <span 
                  key={index}
                  className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full hover:bg-gray-200 transition-colors"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Related Articles */}
      {relatedArticles && relatedArticles.length > 0 && (
        <section className="py-16 px-6 bg-[#F5F5F0]">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-serif font-semibold text-[#36596A] text-center mb-12">
              Related Articles
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {relatedArticles.map((relatedArticle) => (
                <article key={relatedArticle.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                  {/* Featured Image */}
                  {relatedArticle.featured_image_url && (
                    <div className="relative h-48 rounded-t-lg overflow-hidden">
                      <Image
                        src={relatedArticle.featured_image_url}
                        alt={relatedArticle.featured_image_alt || relatedArticle.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </div>
                  )}

                  {/* Content */}
                  <div className="p-6">
                    {/* Title */}
                    <h3 className="text-xl font-semibold mb-3 text-[#36596A] hover:text-[#2a4a5a] transition-colors">
                      <Link href={`/articles/${relatedArticle.slug}`}>
                        {relatedArticle.title}
                      </Link>
                    </h3>

                    {/* Excerpt */}
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {relatedArticle.excerpt}
                    </p>

                    {/* Meta */}
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>
                        {new Date(relatedArticle.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                      <Link 
                        href={`/articles/${relatedArticle.slug}`}
                        className="text-[#36596A] font-medium hover:underline"
                      >
                        Read More →
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      <NewsletterCaptureCTA slug={slug} category={article.category_details?.name ?? null} />
    </div>
  )
}

// Generate metadata for SEO
export async function generateMetadata({ params }: ArticlePageProps) {
  const { slug } = await params
  const { article } = await getArticle(slug)

  if (!article) {
    return {
      title: 'Article Not Found - SeniorSimple',
      description: 'The requested article could not be found.'
    }
  }

  return {
    title: article.meta_title || `${article.title} - SeniorSimple`,
    description: article.meta_description || article.excerpt || 'Expert retirement planning advice from SeniorSimple.',
    openGraph: {
      title: article.title,
      description: article.excerpt || 'Expert retirement planning advice from SeniorSimple.',
      images: article.featured_image_url ? [article.featured_image_url] : [],
      type: 'article',
    },
  }
}


