const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testInsert() {
  try {
    console.log('Testing article insert...');
    
    const testArticle = {
      title: 'Test Article',
      slug: 'test-article-' + Date.now(),
      content: 'This is a test article',
      excerpt: 'Test excerpt',
      content_type: 'guide',
      category: 'test',
      status: 'published'
    };
    
    const { data, error } = await supabase
      .from('articles')
      .insert([testArticle])
      .select();
    
    if (error) {
      console.log('Error:', error);
    } else {
      console.log('Success! Inserted article:', data[0]);
    }
  } catch (error) {
    console.log('Error:', error);
  }
}

testInsert();
