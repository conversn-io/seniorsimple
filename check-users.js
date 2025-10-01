require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkUsers() {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, email')
      .limit(5);
    
    if (error) {
      console.error('Error:', error);
    } else {
      console.log('Users:', data);
    }
  } catch (err) {
    console.error('Error:', err);
  }
}

checkUsers();

