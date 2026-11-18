import { NextRequest, NextResponse } from 'next/server'
import { canonicalizeUrl, submitUrlToIndexNow, submitUrlsToIndexNow } from '@/lib/indexnow'

/**
 * IndexNow Submission API Route
 * 
 * POST /api/indexnow/submit
 * 
 * Submit URLs to IndexNow for instant search engine notification
 * 
 * Body (single URL):
 * { "url": "https://www.seniorsimple.org/articles/my-article" }
 * 
 * Body (multiple URLs):
 * { "urls": ["https://www.seniorsimple.org/articles/article1", "https://www.seniorsimple.org/articles/article2"] }
 *
 * URLs may use seniorsimple.org or www.seniorsimple.org; both are submitted as the canonical
 * www URL. Anything else is rejected.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { url, urls } = body

    // Validate input
    if (!url && !urls) {
      return NextResponse.json(
        { error: 'Either "url" or "urls" must be provided' },
        { status: 400 }
      )
    }

    if (url && urls) {
      return NextResponse.json(
        { error: 'Provide either "url" (single) or "urls" (array), not both' },
        { status: 400 }
      )
    }

    // Submit single URL
    if (url) {
      const canonical = canonicalizeUrl(url)
      if (!canonical) {
        return NextResponse.json(
          { error: 'Invalid URL. Must be an https://www.seniorsimple.org (or https://seniorsimple.org) URL' },
          { status: 400 }
        )
      }

      const results = await submitUrlToIndexNow(canonical)
      const successCount = results.filter((r) => r.success).length

      return NextResponse.json({
        success: successCount > 0,
        url: canonical,
        results,
        submittedTo: `${successCount}/${results.length} search engines`,
      })
    }

    // Submit multiple URLs
    if (urls) {
      if (!Array.isArray(urls) || urls.length === 0) {
        return NextResponse.json(
          { error: '"urls" must be a non-empty array' },
          { status: 400 }
        )
      }

      if (urls.length > 10000) {
        return NextResponse.json(
          { error: 'Maximum 10,000 URLs per request' },
          { status: 400 }
        )
      }

      // Validate all URLs
      const invalidUrls = urls.filter((u: unknown) => canonicalizeUrl(u) === null)

      if (invalidUrls.length > 0) {
        return NextResponse.json(
          { error: 'All URLs must be https://www.seniorsimple.org (or https://seniorsimple.org) URLs', invalidUrls },
          { status: 400 }
        )
      }

      const canonicalUrls = Array.from(new Set(urls.map((u: unknown) => canonicalizeUrl(u) as string)))
      const results = await submitUrlsToIndexNow(canonicalUrls)
      const successCount = results.filter((r) => r.success).length

      return NextResponse.json({
        success: successCount > 0,
        urlCount: canonicalUrls.length,
        results,
        submittedTo: `${successCount}/${results.length} search engines`,
      })
    }

    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  } catch (error) {
    console.error('IndexNow API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}





