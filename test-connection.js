// Test Supabase Connection
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://qrzbtituxxilnbgocdge.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFyemJ0aXR1eHhpbG5iZ29jZGdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyNDcxNDMsImV4cCI6MjA2NzgyMzE0M30.P-o5ND8qoiIpA1W-9WkM7RUOaGTjRtkEmPbCXGbrEI8';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testConnection() {
  console.log('🔍 Testing Supabase connection...');
  
  try {
    // Test 1: Basic connection
    console.log('📡 Testing basic connection...');
    const { data, error } = await supabase.from('users').select('count').limit(1);
    
    if (error) {
      console.error('❌ Connection failed:', error);
      return false;
    }
    
    console.log('✅ Basic connection successful');
    console.log('📊 Response:', data);
    
    // Test 2: Check if tables exist
    console.log('\n📋 Checking database tables...');
    
    const tables = ['users', 'chirps', 'follows'];
    for (const table of tables) {
      const { error: tableError } = await supabase.from(table).select('*').limit(1);
      if (tableError) {
        console.log(`❌ Table '${table}' not found or not accessible`);
      } else {
        console.log(`✅ Table '${table}' exists and accessible`);
      }
    }
    
    return true;
  } catch (error) {
    console.error('❌ Test failed:', error);
    return false;
  }
}

testConnection().then(success => {
  if (success) {
    console.log('\n🎉 Supabase connection test completed successfully!');
  } else {
    console.log('\n💡 Please check your database setup and try again.');
  }
});
