import { MetadataRoute } from 'next'

// Static routes that should always be in the sitemap
const staticRoutes = [
  {
    url: 'https://seniorsimple.org',
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 1.0,
  },
  {
    url: 'https://seniorsimple.org/retirement',
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  },
  {
    url: 'https://seniorsimple.org/estate',
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  },
  {
    url: 'https://seniorsimple.org/tax',
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  },
  {
    url: 'https://seniorsimple.org/insurance',
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  },
  {
    url: 'https://seniorsimple.org/housing',
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  },
  {
    url: 'https://seniorsimple.org/resources',
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  },
  {
    url: 'https://seniorsimple.org/guides',
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  },
  {
    url: 'https://seniorsimple.org/tools',
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  },
  {
    url: 'https://seniorsimple.org/faq',
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  },
  {
    url: 'https://seniorsimple.org/contact',
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  },
  {
    url: 'https://seniorsimple.org/privacy-policy',
    lastModified: new Date(),
    changeFrequency: 'yearly' as const,
    priority: 0.3,
  },
  {
    url: 'https://seniorsimple.org/terms-of-service',
    lastModified: new Date(),
    changeFrequency: 'yearly' as const,
    priority: 0.3,
  },
  {
    url: 'https://seniorsimple.org/disclaimers',
    lastModified: new Date(),
    changeFrequency: 'yearly' as const,
    priority: 0.3,
  },
]

// Calculator routes
const calculatorRoutes = [
  {
    url: 'https://seniorsimple.org/calculators',
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  },
  {
    url: 'https://seniorsimple.org/calculators/retirement-savings',
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  },
  {
    url: 'https://seniorsimple.org/calculators/social-security',
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  },
  {
    url: 'https://seniorsimple.org/calculators/medicare-costs',
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  },
  {
    url: 'https://seniorsimple.org/calculators/reverse-mortgage',
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  },
  {
    url: 'https://seniorsimple.org/calculators/life-insurance',
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  },
  {
    url: 'https://seniorsimple.org/calculators/investment-growth',
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  },
  {
    url: 'https://seniorsimple.org/calculators/downsizing',
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  },
]

// Quiz routes (lower priority but still indexable)
const quizRoutes = [
  {
    url: 'https://seniorsimple.org/quiz',
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  },
  {
    url: 'https://seniorsimple.org/quiz-a',
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  },
  {
    url: 'https://seniorsimple.org/quiz-b',
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  },
  {
    url: 'https://seniorsimple.org/life-insurance-quiz',
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  },
]

// Article and content pages (will be fetched dynamically)
async function getDynamicRoutes() {
  try {
    // Use the existing Supabase client from lib
    const supabaseModule = await import('../lib/supabase')
    const supabase = supabaseModule.supabase
    
    // Fetch published articles
    const { data: articles, error: articlesError } = await supabase
      .from('articles')
      .select('slug, updated_at, created_at')
      .eq('status', 'published')
      .order('updated_at', { ascending: false })
    
    if (articlesError) {
      console.warn('⚠️ Error fetching articles:', articlesError)
      return []
    }
    
    // Fetch published content (using same articles table)
    // Note: Content is stored in the articles table with different content_type
    const { data: content, error: contentError } = await supabase
      .from('articles')
      .select('slug, updated_at, created_at')
      .eq('status', 'published')
      .neq('content_type', 'article') // Get non-article content
      .order('updated_at', { ascending: false })
    
    if (contentError) {
      console.warn('⚠️ Error fetching content:', contentError)
    }
    
    const articleRoutes = (articles || []).map((article) => ({
      url: `https://seniorsimple.org/articles/${article.slug}`,
      lastModified: new Date(article.updated_at || article.created_at),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))
    
    const contentRoutes = (content || []).map((item) => ({
      url: `https://seniorsimple.org/content/${item.slug}`,
      lastModified: new Date(item.updated_at || item.created_at),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))
    
    return [...articleRoutes, ...contentRoutes]
  } catch (error) {
    console.warn('⚠️ Error generating dynamic routes:', error)
    return []
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const dynamicRoutes = await getDynamicRoutes()
  
  return [
    ...staticRoutes,
    ...calculatorRoutes,
    ...quizRoutes,
    ...dynamicRoutes,
  ]
}

