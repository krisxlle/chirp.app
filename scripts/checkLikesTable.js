const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://qrzbtituxxilnbgocdge.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFyemJ0aXR1eHhpbG5iZ29jZGdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyNDcxNDMsImV4cCI6MjA2NzgyMzE0M30.P-o5ND8qoiIpA1W-9WkM7RUOaGTjRtkEmPbCXGbrEI8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkLikesTable() {
  try {
    console.log('🔍 Checking likes table structure...');
    
    // Try different possible table names
    const possibleTables = ['likes', 'reactions', 'chirp_likes', 'user_likes'];
    
    for (const tableName of possibleTables) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);
        
        if (error) {
          console.log(`❌ Table '${tableName}' does not exist:`, error.message);
        } else {
          console.log(`✅ Table '${tableName}' exists and is accessible`);
          console.log(`📋 Sample data:`, data);
        }
      } catch (err) {
        console.log(`❌ Error testing table '${tableName}':`, err.message);
      }
    }
    
    // Also check what tables exist with 'like' in the name
    console.log('\n🔍 Checking for tables with "like" in the name...');
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .like('table_name', '%like%');
    
    if (tablesError) {
      console.log('❌ Error checking table names:', tablesError.message);
    } else {
      console.log('📋 Tables with "like" in name:', tables);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkLikesTable();
