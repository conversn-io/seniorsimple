/**
 * SMN publisher chassis — article directory data (WO-1507).
 *
 * The old /articles query did `select *` over every published article, which
 * pulled every full `content` + `html_body` body and hit the CMS statement
 * timeout (57014). Live, the page showed "Unable to load articles". This
 * selects only the card fields.
 */
import { supabase } from '../supabase'
import { SITE, topicFor } from './site-config'

export interface DirectoryArticle {
  slug: string
  title: string
  excerpt: string | null
  featured_image_url: string | null
  featured_image_alt: string | null
  category: string | null
  published_at: string | null
  created_at: string
  topic: { key: string; name: string }
}

export async function getDirectoryArticles(): Promise<{ articles: DirectoryArticle[]; error: string | null }> {
  const { data, error } = await supabase
    .from('articles')
    .select('slug,title,excerpt,featured_image_url,featured_image_alt,category,published_at,created_at')
    .eq('status', 'published')
    .eq('site_id', SITE.key)
    .eq('page_type', 'article')
    .order('created_at', { ascending: false })

  if (error) return { articles: [], error: error.message }
  return {
    articles: (data ?? []).map((a) => ({ ...a, topic: topicFor(a.category) })) as DirectoryArticle[],
    error: null,
  }
}

export function groupByTopic(articles: DirectoryArticle[]) {
  const groups = new Map<string, { key: string; name: string; articles: DirectoryArticle[] }>()
  for (const a of articles) {
    const g = groups.get(a.topic.key) ?? { ...a.topic, articles: [] }
    g.articles.push(a)
    groups.set(a.topic.key, g)
  }
  return [...groups.values()].sort((a, b) => b.articles.length - a.articles.length)
}
