/**
 * Migration Script: Convert all articles from markdown to HTML using edge function
 * 
 * This script:
 * 1. Fetches all published articles
 * 2. Calls the markdown-to-html edge function for each article
 * 3. Saves the HTML to the html_body field in the database
 * 
 * Usage:
 *   node scripts/migrate-articles-to-html.js
 * 
 * Or for specific articles:
 *   node scripts/migrate-articles-to-html.js --slug gift-tax-limits-how-much-can-you-gift-in-2025
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vpysqshhafthuxvokwqj.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const EDGE_FUNCTION_URL = `${SUPABASE_URL}/functions/v1/markdown-to-html`;

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Error: SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY not found in .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function convertArticleToHTML(article) {
  try {
    console.log(`\n📝 Converting: ${article.slug}`);
    console.log(`   Content length: ${article.content?.length || 0} characters`);
    
    // Check if already converted
    if (article.html_body && article.html_body.length > 0) {
      console.log(`   ⏭️  Already has html_body (${article.html_body.length} chars), skipping...`);
      return { success: true, skipped: true };
    }

    // Call edge function
    const response = await fetch(EDGE_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({
        markdown: article.content,
        article_id: article.id,
        conversionType: 'enhanced',
        styling: 'modern',
        includeCss: false, // Don't include CSS in stored HTML (handled by frontend)
        preserveFormatting: true
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Conversion failed');
    }

    // Verify HTML was saved (edge function should have saved it)
    const { data: updatedArticle, error: fetchError } = await supabase
      .from('articles')
      .select('html_body')
      .eq('id', article.id)
      .single();

    if (fetchError) {
      console.log(`   ⚠️  Warning: Could not verify HTML save: ${fetchError.message}`);
    } else if (updatedArticle.html_body) {
      console.log(`   ✅ HTML saved successfully (${updatedArticle.html_body.length} chars)`);
    } else {
      // Edge function didn't save, let's save it manually
      console.log(`   ⚠️  Edge function didn't save HTML, saving manually...`);
      const { error: updateError } = await supabase
        .from('articles')
        .update({ html_body: data.html_body || data.html })
        .eq('id', article.id);

      if (updateError) {
        throw new Error(`Failed to save HTML: ${updateError.message}`);
      }
      console.log(`   ✅ HTML saved manually`);
    }

    return { success: true, htmlLength: data.html_body?.length || data.html?.length || 0 };
  } catch (error) {
    console.error(`   ❌ Error converting ${article.slug}:`, error.message);
    return { success: false, error: error.message };
  }
}

async function migrateArticles(specificSlug = null) {
  try {
    console.log('🚀 Starting article migration to HTML...\n');
    console.log(`📡 Edge Function URL: ${EDGE_FUNCTION_URL}`);

    // Fetch articles
    let query = supabase
      .from('articles')
      .select('id, slug, title, content, html_body')
      .eq('status', 'published');

    if (specificSlug) {
      query = query.eq('slug', specificSlug);
      console.log(`\n🎯 Migrating specific article: ${specificSlug}\n`);
    } else {
      console.log(`\n📚 Migrating all published articles...\n`);
    }

    const { data: articles, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch articles: ${error.message}`);
    }

    if (!articles || articles.length === 0) {
      console.log('ℹ️  No articles found to migrate.');
      return;
    }

    console.log(`Found ${articles.length} article(s) to process\n`);
    console.log('═'.repeat(60));

    const results = {
      total: articles.length,
      successful: 0,
      skipped: 0,
      failed: 0,
      errors: []
    };

    // Process each article
    for (let i = 0; i < articles.length; i++) {
      const article = articles[i];
      console.log(`\n[${i + 1}/${articles.length}] Processing: ${article.title}`);
      
      const result = await convertArticleToHTML(article);
      
      if (result.skipped) {
        results.skipped++;
      } else if (result.success) {
        results.successful++;
      } else {
        results.failed++;
        results.errors.push({ slug: article.slug, error: result.error });
      }

      // Small delay to avoid rate limiting
      if (i < articles.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    // Summary
    console.log('\n' + '═'.repeat(60));
    console.log('\n📊 Migration Summary:');
    console.log(`   Total articles: ${results.total}`);
    console.log(`   ✅ Successful: ${results.successful}`);
    console.log(`   ⏭️  Skipped (already converted): ${results.skipped}`);
    console.log(`   ❌ Failed: ${results.failed}`);

    if (results.errors.length > 0) {
      console.log('\n❌ Errors:');
      results.errors.forEach(({ slug, error }) => {
        console.log(`   - ${slug}: ${error}`);
      });
    }

    console.log('\n✅ Migration complete!\n');
  } catch (error) {
    console.error('\n❌ Fatal error:', error.message);
    process.exit(1);
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const slugArg = args.find(arg => arg.startsWith('--slug='));
const specificSlug = slugArg ? slugArg.split('=')[1] : null;

// Run migration
migrateArticles(specificSlug).catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});


