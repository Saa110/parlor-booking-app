const { supabase } = require('./config/supabase');

async function testSupabase() {
  console.log('🔍 Testing Supabase connection...');
  
  try {
    // Test basic connection
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .limit(1);
    
    if (error) {
      console.log('❌ Supabase error:', error);
      return false;
    }
    
    console.log('✅ Supabase connection successful!');
    console.log('📊 Data:', data);
    return true;
  } catch (error) {
    console.log('❌ Connection failed:', error.message);
    return false;
  }
}

testSupabase(); 