const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkExisting() {
  try {
    console.log('Checking existing article structure...');
    
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .limit(1);
    
    if (error) {
      console.log('Error:', error);
    } else {
      console.log('Existing article fields:');
      if (data && data.length > 0) {
        console.log(Object.keys(data[0]));
        console.log('Sample data:', data[0]);
      }
    }
  } catch (error) {
    console.log('Error:', error);
  }
}

checkExisting();
