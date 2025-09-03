// Enhanced Supabase Connection Debugger
const { createClient } = require('@supabase/supabase-js');

// Configuration - UPDATE THESE WITH YOUR ACTUAL VALUES
const SUPABASE_URL = 'https://qrzbtituxxilnbgocdge.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFyemJ0aXR1eHhpbG5iZ29jZGdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyNDcxNDMsImV4cCI6MjA2NzgyMzE0M30.P-o5ND8qoiIpA1W-9WkM7RUOaGTjRtkEmPbCXGbrEI8';

console.log('🔍 Supabase Connection Debugger');
console.log('📍 URL:', SUPABASE_URL);
console.log('🔑 Key (first 20 chars):', SUPABASE_ANON_KEY.substring(0, 20) + '...');
console.log('🔑 Key length:', SUPABASE_ANON_KEY.length);

// Validate key format
if (!SUPABASE_ANON_KEY.startsWith('eyJ')) {
  console.error('❌ Invalid key format - should start with "eyJ"');
  process.exit(1);
}

// Key validation passed - continuing with tests

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function debugConnection() {
  console.log('\n🔍 Starting connection tests...');
  
  try {
    // Test 1: Basic REST API test
    console.log('\n📡 Test 1: Basic REST API test...');
    const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('📊 Response status:', response.status);
    console.log('📊 Response ok:', response.ok);
    
    if (!response.ok) {
      console.error('❌ REST API test failed');
      const errorText = await response.text();
      console.error('📄 Error details:', errorText);
      return false;
    }
    
    console.log('✅ REST API test passed');
    
    // Test 2: Supabase client test
    console.log('\n🗄️ Test 2: Supabase client test...');
    const { data, error } = await supabase.from('users').select('count').limit(1);
    
    if (error) {
      console.error('❌ Supabase client test failed:', error);
      console.error('🔍 Error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      return false;
    }
    
    console.log('✅ Supabase client test passed');
    console.log('📊 Response data:', data);
    
    // Test 3: Table existence test
    console.log('\n📋 Test 3: Checking table existence...');
    const tables = ['users', 'chirps', 'follows'];
    
    for (const table of tables) {
      console.log(`\n🔍 Checking table: ${table}`);
      const { error: tableError } = await supabase.from(table).select('*').limit(1);
      
      if (tableError) {
        console.log(`❌ Table '${table}' error:`, tableError.message);
        if (tableError.code === 'PGRST116') {
          console.log(`💡 Table '${table}' doesn't exist - you need to run the setup SQL script`);
        }
      } else {
        console.log(`✅ Table '${table}' exists and accessible`);
      }
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Debug test failed:', error);
    console.error('🔍 Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    return false;
  }
}

debugConnection().then(success => {
  if (success) {
    console.log('\n🎉 All tests passed! Your Supabase connection is working.');
    console.log('💡 Next step: Run the setup SQL script in your Supabase dashboard');
  } else {
    console.log('\n💡 Troubleshooting tips:');
    console.log('1. Make sure you copied the correct anon key (not service_role)');
    console.log('2. Check that your Supabase project is not paused');
    console.log('3. Verify your internet connection');
    console.log('4. Try running the setup SQL script first');
  }
});
