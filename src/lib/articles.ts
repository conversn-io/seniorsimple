import { supabase } from './supabase'

export interface Article {
  id: string
  title: string
  slug: string
  content: string
  html_body?: string
  excerpt: string
  author_id: string
  status: 'draft' | 'published' | 'pending' | 'private' | 'scheduled'
  created_at: string
  updated_at: string
  meta_title?: string
  meta_description?: string
  featured_image_url?: string
  featured_image_alt?: string
  category?: string
  category_id?: string
  tags?: string[]
  persona?: string
  seo_score?: number
  readability_score?: number
  /** Cluster parent. Set on satellites; null on pillars and standalones. */
  parent_pillar_article_id?: string | null
}

export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  created_at: string
}

export interface ArticleWithCategory extends Article {
  category_details?: Category
  phone_number?: string | null
  domain?: {
    phone_number?: string | null
  }
}

// Get all published articles
export async function getPublishedArticles(limit?: number): Promise<{ articles: ArticleWithCategory[], error: Error | null }> {
  try {
    let query = supabase
      .from('articles')
      .select(`
        *,
        category_details:article_categories!articles_category_id_fkey(name, slug, description)
      `)
      .eq('status', 'published')
      .eq('site_id', 'seniorsimple')
      .order('created_at', { ascending: false })

    if (limit) {
      query = query.limit(limit)
    }

    const { data, error } = await query

    return { 
      articles: data as ArticleWithCategory[], 
      error 
    }
  } catch (error) {
    return { articles: [], error: error instanceof Error ? error : new Error(String(error)) }
  }
}

// Get a single article by slug
export async function getArticle(slug: string): Promise<{ article: ArticleWithCategory | null, error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('articles')
      .select(`
        *,
        category_details:article_categories!articles_category_id_fkey(name, slug, description),
        domain:domains!articles_domain_id_fkey(phone_number)
      `)
      .eq('slug', slug)
      .eq('status', 'published')
      .eq('site_id', 'seniorsimple')
      .single()

    return { 
      article: data as ArticleWithCategory, 
      error 
    }
  } catch (error) {
    return { article: null, error: error instanceof Error ? error : new Error(String(error)) }
  }
}

// Get articles by category
export async function getArticlesByCategory(categorySlug: string, limit?: number): Promise<{ articles: ArticleWithCategory[], error: Error | null }> {
  try {
    let query = supabase
      .from('articles')
      .select(`
        *,
        category_details:article_categories!articles_category_id_fkey(name, slug, description)
      `)
      .eq('status', 'published')
      .eq('site_id', 'seniorsimple')
      .eq('category_details.slug', categorySlug)
      .order('created_at', { ascending: false })

    if (limit) {
      query = query.limit(limit)
    }

    const { data, error } = await query

    return { 
      articles: data as ArticleWithCategory[], 
      error 
    }
  } catch (error) {
    return { articles: [], error: error instanceof Error ? error : new Error(String(error)) }
  }
}

// Get all categories
export async function getCategories(): Promise<{ categories: Category[], error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('article_categories')
      .select('*')
      .order('name', { ascending: true })

    return { 
      categories: data as Category[], 
      error 
    }
  } catch (error) {
    return { categories: [], error: error instanceof Error ? error : new Error(String(error)) }
  }
}

// Get related articles (same category, excluding current article)
export async function getRelatedArticles(currentArticleId: string, categoryId?: string, limit: number = 3): Promise<{ articles: Article[], error: Error | null }> {
  try {
    let query = supabase
      .from('articles')
      .select('*')
      .eq('status', 'published')
      .eq('site_id', 'seniorsimple')
      .neq('id', currentArticleId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (categoryId) {
      query = query.eq('category_id', categoryId)
    }

    const { data, error } = await query

    return { 
      articles: data as Article[], 
      error 
    }
  } catch (error) {
    return { articles: [], error: error instanceof Error ? error : new Error(String(error)) }
  }
}

/**
 * Pillar <-> satellite context for an article, driven by
 * `articles.parent_pillar_article_id`.
 *
 * The CMS has carried this relation for a long time (every annuity satellite
 * points at the "What Is an Annuity?" pillar, for example) but nothing ever
 * rendered it — `getRelatedArticles` matches on category + recency, so a
 * carrier review and an unrelated Medicare post could sit next to each other
 * while the pillar and its 50+ siblings stayed mutually invisible. That is
 * what left the annuity library orphaned (WO-722).
 *
 * Returns the pillar to link up to, and the siblings/satellites to link
 * across. Callers fall back to category-based related posts when a page has
 * no cluster.
 *
 * Children are resolved BEFORE the parent edge, deliberately. The CMS's
 * clustering pass nests pillars under other pillars — on seniorsimple all
 * eight secondary pillars (annuity, tax-free income, independent living,
 * social security, estate planning, reverse mortgage, LTC, senior discounts)
 * currently hang off the Medicare guide, so the whole library is one tree
 * rooted at `how-to-choose-a-medicare-plan`. Following the parent edge first
 * would make the annuity pillar advertise itself as "part of" a Medicare
 * guide and surface Medicare siblings instead of its own 55 annuity
 * satellites — a cross-vertical mislink on the most valuable page in the
 * cluster. A page with children is a pillar, whatever sits above it.
 */
export interface ClusterContext {
  /** The cluster pillar, when the current article is a satellite. */
  pillar: Article | null
  /** Siblings (when a satellite) or children (when a pillar). */
  related: Article[]
  /** True when the current article is itself a cluster pillar. */
  isPillar: boolean
}

export async function getClusterContext(
  article: Pick<Article, 'id' | 'parent_pillar_article_id'>,
  limit: number = 6,
): Promise<{ cluster: ClusterContext; error: Error | null }> {
  const empty: ClusterContext = { pillar: null, related: [], isPillar: false }

  try {
    // 1. Children first — a page with satellites is a pillar (see note above).
    const { data: childData, error: childError } = await supabase
      .from('articles')
      .select('*')
      .eq('parent_pillar_article_id', article.id)
      .eq('status', 'published')
      .eq('site_id', 'seniorsimple')
      .order('published_at', { ascending: false })
      .limit(limit)

    const children = (childData as Article[]) ?? []
    if (children.length > 0) {
      // Pillar: link down to its own satellites, and deliberately do NOT
      // surface whatever pillar the clustering pass parented it to.
      return {
        cluster: { pillar: null, related: children, isPillar: true },
        error: childError,
      }
    }

    // 2. Otherwise a leaf — link up to its pillar and across to its siblings.
    const pillarId = article.parent_pillar_article_id
    if (!pillarId) return { cluster: empty, error: childError }

    const [pillarRes, siblingsRes] = await Promise.all([
      supabase
        .from('articles')
        .select('*')
        .eq('id', pillarId)
        .eq('status', 'published')
        .eq('site_id', 'seniorsimple')
        .maybeSingle(),
      supabase
        .from('articles')
        .select('*')
        .eq('parent_pillar_article_id', pillarId)
        .eq('status', 'published')
        .eq('site_id', 'seniorsimple')
        .neq('id', article.id)
        .order('published_at', { ascending: false })
        .limit(limit),
    ])

    return {
      cluster: {
        pillar: (pillarRes.data as Article) ?? null,
        related: (siblingsRes.data as Article[]) ?? [],
        isPillar: false,
      },
      error: pillarRes.error || siblingsRes.error || null,
    }
  } catch (error) {
    return {
      cluster: empty,
      error: error instanceof Error ? error : new Error(String(error)),
    }
  }
}

// Search articles
export async function searchArticles(searchTerm: string, limit: number = 10): Promise<{ articles: Article[], error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('articles')
      .select(`
        *,
        category_details:article_categories!articles_category_id_fkey(name, slug, description)
      `)
      .eq('status', 'published')
      .eq('site_id', 'seniorsimple')
      .or(`title.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%,excerpt.ilike.%${searchTerm}%`)
      .order('created_at', { ascending: false })
      .limit(limit)

    return { 
      articles: data as Article[], 
      error 
    }
  } catch (error) {
    return { articles: [], error: error instanceof Error ? error : new Error(String(error)) }
  }
}

// Get featured articles (for homepage)
export async function getFeaturedArticles(limit: number = 6): Promise<{ articles: Article[], error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('status', 'published')
      .eq('site_id', 'seniorsimple')
      .order('created_at', { ascending: false })
      .limit(limit)

    return { 
      articles: data as Article[], 
      error 
    }
  } catch (error) {
    return { articles: [], error: error instanceof Error ? error : new Error(String(error)) }
  }
}