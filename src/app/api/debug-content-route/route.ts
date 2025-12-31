import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

/**
 * Diagnostic endpoint to test content route database connectivity
 * Use this to debug why /content routes fail in preview
 * 
 * Test: GET /api/debug-content-route?slug=tax-free-retirement-income-complete-guide
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const slug = searchParams.get('slug') || 'tax-free-retirement-income-complete-guide'

  const diagnostics = {
    timestamp: new Date().toISOString(),
    environment: {
      nodeEnv: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || 'NOT SET',
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      anonKeyLength: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length || 0,
    },
    query: {
      slug,
      siteId: 'seniorsimple',
    },
    results: {} as any,
    errors: [] as string[],
  }

  try {
    // Test 1: Query without site_id filter (current implementation)
    const { data: dataWithoutSiteId, error: errorWithoutSiteId } = await supabase
      .from('articles')
      .select('id, slug, title, status, site_id')
      .eq('slug', slug)
      .eq('status', 'published')
      .single()

    diagnostics.results.withoutSiteIdFilter = {
      found: !!dataWithoutSiteId,
      data: dataWithoutSiteId,
      error: errorWithoutSiteId?.message,
      code: errorWithoutSiteId?.code,
    }

    if (errorWithoutSiteId) {
      diagnostics.errors.push(`Without site_id filter: ${errorWithoutSiteId.message}`)
    }

    // Test 2: Query with site_id filter
    const { data: dataWithSiteId, error: errorWithSiteId } = await supabase
      .from('articles')
      .select('id, slug, title, status, site_id')
      .eq('slug', slug)
      .eq('status', 'published')
      .eq('site_id', 'seniorsimple')
      .single()

    diagnostics.results.withSiteIdFilter = {
      found: !!dataWithSiteId,
      data: dataWithSiteId,
      error: errorWithSiteId?.message,
      code: errorWithSiteId?.code,
    }

    if (errorWithSiteId) {
      diagnostics.errors.push(`With site_id filter: ${errorWithSiteId.message}`)
    }

    // Test 3: Check if any articles exist for this site
    const { data: anyArticle, error: anyError } = await supabase
      .from('articles')
      .select('id, slug, title, status, site_id')
      .eq('site_id', 'seniorsimple')
      .eq('status', 'published')
      .limit(5)

    diagnostics.results.anyArticlesForSite = {
      count: anyArticle?.length || 0,
      articles: anyArticle,
      error: anyError?.message,
    }

    // Test 4: Check database connection
    const { data: connectionTest, error: connectionError } = await supabase
      .from('articles')
      .select('count')
      .limit(1)

    diagnostics.results.connectionTest = {
      success: !connectionError,
      error: connectionError?.message,
    }

    if (connectionError) {
      diagnostics.errors.push(`Connection test failed: ${connectionError.message}`)
    }

  } catch (error: any) {
    diagnostics.errors.push(`Unexpected error: ${error.message}`)
  }

  return NextResponse.json(diagnostics, {
    status: diagnostics.errors.length > 0 ? 500 : 200,
  })
}




