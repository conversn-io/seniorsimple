const { createClient } = require('@supabase/supabase-js');

// CallReady Quiz Database Configuration
const CALLREADY_QUIZ_URL = process.env.SUPABASE_QUIZ_URL || "https://jqjftrlnyysqcwbbigpw.supabase.co"
const CALLREADY_QUIZ_SERVICE_KEY = process.env.SUPABASE_QUIZ_SERVICE_ROLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxamZ0cmxueXlzcWN3YmJpZ3B3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImiYXQiOjE3NTEyOTQ2MzksImV4cCI6MjA2Njg3MDYzOX0.-PkMYXKDjL-7sINBFJt6GoF7TOzq_Py-VWX03rFYRjI"

const callreadyQuizDb = createClient(CALLREADY_QUIZ_URL, CALLREADY_QUIZ_SERVICE_KEY)

async function testDatabase() {
  console.log('🔍 Testing database connection...');
  
  try {
    // Test basic connection
    const { data, error } = await callreadyQuizDb
      .from('verified_leads')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Database error:', error);
      return;
    }
    
    console.log('✅ Database connection successful');
    console.log('📊 Sample data:', data);
    
    // Test table structure
    const { data: structure, error: structureError } = await callreadyQuizDb
      .from('information_schema.columns')
      .select('column_name, data_type')
      .eq('table_name', 'verified_leads');
    
    if (structureError) {
      console.log('⚠️ Could not get table structure:', structureError.message);
    } else {
      console.log('📋 Table structure:', structure);
    }
    
  } catch (error) {
    console.error('💥 Test failed:', error);
  }
}

testDatabase();