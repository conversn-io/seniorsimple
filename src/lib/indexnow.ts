/**
 * IndexNow Implementation
 * Protocol for instant search engine notifications when content is added, updated, or deleted
 * Documentation: https://www.indexnow.org/documentation
 */

// IndexNow key - should be stored in environment variable
// Generate a secure key: 8-128 hex characters (a-z, A-Z, 0-9, dashes)
// For production, set INDEXNOW_KEY in your environment variables
// You can generate a secure key using: openssl rand -hex 16
const INDEXNOW_KEY = process.env.INDEXNOW_KEY || 'seniorsimple-indexnow-key-2024'

// Supported search engines that support IndexNow
const INDEXNOW_ENDPOINTS = [
  'https://api.indexnow.org/indexnow',
  'https://www.bing.com/indexnow',
  'https://yandex.com/indexnow',
  // Add more as they become available
]

interface IndexNowResponse {
  success: boolean
  engine: string
  status: number
  message?: string
}

/**
 * Submit a single URL to IndexNow
 */
export async function submitUrlToIndexNow(url: string): Promise<IndexNowResponse[]> {
  const results: IndexNowResponse[] = []
  const encodedUrl = encodeURIComponent(url)
  // Key file location - accessible via API route
  const keyLocation = `https://seniorsimple.org/api/indexnow/key`

  for (const endpoint of INDEXNOW_ENDPOINTS) {
    try {
      const response = await fetch(
        `${endpoint}?url=${encodedUrl}&key=${INDEXNOW_KEY}&keyLocation=${encodeURIComponent(keyLocation)}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )

      results.push({
        success: response.ok || response.status === 202,
        engine: endpoint,
        status: response.status,
        message: response.ok
          ? 'URL submitted successfully'
          : response.status === 202
          ? 'URL received, validation pending'
          : `HTTP ${response.status}`,
      })
    } catch (error) {
      results.push({
        success: false,
        engine: endpoint,
        status: 0,
        message: error instanceof Error ? error.message : 'Network error',
      })
    }
  }

  return results
}

/**
 * Submit multiple URLs to IndexNow (bulk submission)
 * Can submit up to 10,000 URLs per request
 */
export async function submitUrlsToIndexNow(
  urls: string[]
): Promise<IndexNowResponse[]> {
  if (urls.length === 0) {
    return []
  }

  // Limit to 10,000 URLs per request as per IndexNow spec
  const urlBatch = urls.slice(0, 10000)
  const results: IndexNowResponse[] = []
  // Key file location - accessible via API route
  const keyLocation = `https://seniorsimple.org/api/indexnow/key`

  const payload = {
    host: 'seniorsimple.org',
    key: INDEXNOW_KEY,
    keyLocation: keyLocation,
    urlList: urlBatch,
  }

  for (const endpoint of INDEXNOW_ENDPOINTS) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
        body: JSON.stringify(payload),
      })

      results.push({
        success: response.ok || response.status === 202,
        engine: endpoint,
        status: response.status,
        message: response.ok
          ? `${urlBatch.length} URLs submitted successfully`
          : response.status === 202
          ? 'URLs received, validation pending'
          : `HTTP ${response.status}`,
      })
    } catch (error) {
      results.push({
        success: false,
        engine: endpoint,
        status: 0,
        message: error instanceof Error ? error.message : 'Network error',
      })
    }
  }

  return results
}

/**
 * Submit a content page URL when it's published or updated
 */
export async function notifyIndexNowForContent(
  slug: string,
  contentType: 'article' | 'content' = 'article'
): Promise<void> {
  const url = `https://seniorsimple.org/${contentType === 'article' ? 'articles' : 'content'}/${slug}`
  
  try {
    const results = await submitUrlToIndexNow(url)
    const successCount = results.filter((r) => r.success).length
    
    console.log(`📢 IndexNow: Submitted ${url} to ${successCount}/${results.length} search engines`)
    
    if (process.env.NODE_ENV === 'development') {
      console.log('IndexNow results:', results)
    }
  } catch (error) {
    console.error('❌ IndexNow submission error:', error)
  }
}

/**
 * Submit homepage and key pages to IndexNow
 */
export async function notifyIndexNowForHomepage(): Promise<void> {
  const keyPages = [
    'https://seniorsimple.org',
    'https://seniorsimple.org/retirement',
    'https://seniorsimple.org/estate',
    'https://seniorsimple.org/tax',
    'https://seniorsimple.org/insurance',
    'https://seniorsimple.org/housing',
  ]

  try {
    const results = await submitUrlsToIndexNow(keyPages)
    const successCount = results.filter((r) => r.success).length
    
    console.log(`📢 IndexNow: Submitted ${keyPages.length} key pages to ${successCount}/${results.length} search engines`)
  } catch (error) {
    console.error('❌ IndexNow bulk submission error:', error)
  }
}

/**
 * Submit article URLs to IndexNow (matches ParentSimple pattern)
 * Submits both /articles/[slug] and /content/[slug] URLs
 */
export async function submitArticleToIndexNow(slug: string): Promise<{ success: boolean; errors: string[] }> {
  const urls = [
    `https://seniorsimple.org/articles/${slug}`,
    `https://seniorsimple.org/content/${slug}`,
  ]
  
  try {
    const results = await submitUrlsToIndexNow(urls)
    const successCount = results.filter((r) => r.success).length
    const errors = results
      .filter((r) => !r.success)
      .map((r) => `${r.engine}: ${r.message || `HTTP ${r.status}`}`)
    
    return {
      success: successCount > 0,
      errors: errors,
    }
  } catch (error) {
    return {
      success: false,
      errors: [error instanceof Error ? error.message : String(error)],
    }
  }
}

/**
 * Get the IndexNow key (for key file generation)
 */
export function getIndexNowKey(): string {
  return INDEXNOW_KEY
}

