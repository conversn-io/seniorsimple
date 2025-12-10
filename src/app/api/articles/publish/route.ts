import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { submitArticleToIndexNow } from '@/lib/indexnow'

/**
 * Article Publish Webhook
 * 
 * This endpoint handles article publishing and submits to IndexNow for instant indexing.
 * Called automatically by Publishare CMS database trigger when articles are published.
 * 
 * Note: Revalidation is not needed because articles/[slug]/page.tsx uses
 * `export const dynamic = 'force-dynamic'` which ensures fresh data on every request.
 * 
 * Usage:
 * POST /api/articles/publish
 * {
 *   "article_id": "uuid",
 *   "slug": "article-slug",
 *   "secret": "your-secret"
 * }
 */

// Lazy initialization of Supabase client to avoid build-time errors
function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase credentials')
  }

  return createClient(supabaseUrl, supabaseKey)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { article_id, slug, secret } = body

    // Verify secret
    if (secret !== process.env.REVALIDATION_SECRET) {
      return NextResponse.json(
        { error: 'Invalid secret' },
        { status: 401 }
      )
    }

    // If article_id provided, fetch slug from database
    let articleSlug = slug
    if (article_id && !slug) {
      const supabase = getSupabaseClient()
      const { data: article, error } = await supabase
        .from('articles')
        .select('slug')
        .eq('id', article_id)
        .single()

      if (error || !article) {
        return NextResponse.json(
          { error: 'Article not found' },
          { status: 404 }
        )
      }

      articleSlug = article.slug
    }

    if (!articleSlug) {
      return NextResponse.json(
        { error: 'Slug or article_id required' },
        { status: 400 }
      )
    }

    // Submit to IndexNow for instant search engine indexing
    // Note: Revalidation is not needed because articles/[slug]/page.tsx uses
    // `export const dynamic = 'force-dynamic'` which ensures fresh data on every request
    let indexNowResult = { success: false, errors: [] as string[] }
    try {
      indexNowResult = await submitArticleToIndexNow(articleSlug)
      if (indexNowResult.success) {
        console.log(`IndexNow: Successfully submitted article ${articleSlug}`)
      } else {
        console.warn(`IndexNow: Failed to submit article ${articleSlug}:`, indexNowResult.errors)
      }
    } catch (error) {
      console.error('IndexNow submission error:', error)
      // Don't fail the webhook if IndexNow fails
    }

    return NextResponse.json({
      success: true,
      indexNow: indexNowResult.success,
      path: `/articles/${articleSlug}`,
      message: 'Article published and submitted to IndexNow',
    })
  } catch (error) {
    console.error('Publish webhook error:', error)
    return NextResponse.json(
      { error: 'Error processing publish webhook' },
      { status: 500 }
    )
  }
}

