import { NextRequest, NextResponse } from 'next/server'
import { submitUrlToIndexNow, submitUrlsToIndexNow } from '@/lib/indexnow'

/**
 * IndexNow Submission API Route
 * 
 * POST /api/indexnow/submit
 * 
 * Submit URLs to IndexNow for instant search engine notification
 * 
 * Body (single URL):
 * { "url": "https://seniorsimple.org/articles/my-article" }
 * 
 * Body (multiple URLs):
 * { "urls": ["https://seniorsimple.org/articles/article1", "https://seniorsimple.org/articles/article2"] }
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
      if (typeof url !== 'string' || !url.startsWith('https://seniorsimple.org')) {
        return NextResponse.json(
          { error: 'Invalid URL. Must be a string starting with https://seniorsimple.org' },
          { status: 400 }
        )
      }

      const results = await submitUrlToIndexNow(url)
      const successCount = results.filter((r) => r.success).length

      return NextResponse.json({
        success: successCount > 0,
        url,
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
      const invalidUrls = urls.filter(
        (u: any) => typeof u !== 'string' || !u.startsWith('https://seniorsimple.org')
      )

      if (invalidUrls.length > 0) {
        return NextResponse.json(
          { error: 'All URLs must be strings starting with https://seniorsimple.org', invalidUrls },
          { status: 400 }
        )
      }

      const results = await submitUrlsToIndexNow(urls)
      const successCount = results.filter((r) => r.success).length

      return NextResponse.json({
        success: successCount > 0,
        urlCount: urls.length,
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



