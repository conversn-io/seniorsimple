import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔍 Checking Regenerative CMS content...');
console.log('URL:', supabaseUrl);
console.log('Key length:', supabaseAnonKey?.length);

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkContent() {
  try {
    // Check all articles
    const { data: allArticles, error: allError } = await supabase
      .from('articles')
      .select('slug, title, content_type, status')
      .order('created_at', { ascending: false });

    if (allError) {
      console.error('❌ Error fetching articles:', allError.message);
      return;
    }

    console.log(`\n📄 Total articles: ${allArticles?.length || 0}`);
    
    if (allArticles) {
      allArticles.forEach((article, index) => {
        console.log(`${index + 1}. ${article.slug} (${article.content_type}) - ${article.status}`);
      });
    }

    // Check published articles specifically
    const { data: publishedArticles, error: publishedError } = await supabase
      .from('articles')
      .select('slug, title, content_type')
      .eq('status', 'published');

    if (publishedError) {
      console.error('❌ Error fetching published articles:', publishedError.message);
      return;
    }

    console.log(`\n✅ Published articles: ${publishedArticles?.length || 0}`);
    
    if (publishedArticles) {
      publishedArticles.forEach((article, index) => {
        console.log(`${index + 1}. ${article.slug} (${article.content_type})`);
      });
    }

  } catch (error) {
    console.error('❌ Script error:', error.message);
  }
}

checkContent();
