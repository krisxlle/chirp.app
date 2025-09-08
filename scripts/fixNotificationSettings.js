const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://qrzbtituxxilnbgocdge.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFyemJ0aXR1eHhpbG5iZ29jZGdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyNDcxNDMsImV4cCI6MjA2NzgyMzE0M30.P-o5ND8qoiIpA1W-9WkM7RUOaGTjRtkEmPbCXGbrEI8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixNotificationSettings() {
  try {
    console.log('🔧 Fixing user notification settings table...');
    
    // First, let's check if the table exists
    console.log('🔍 Checking current table structure...');
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .like('table_name', '%notification%');
    
    if (tablesError) {
      console.error('❌ Error checking tables:', tablesError);
      return;
    }
    
    console.log('📋 Existing notification tables:', tables);
    
    // Try to create the table using a simple approach
    console.log('🏗️ Creating user_notification_settings table...');
    
    // Use a function to create the table
    const { data, error } = await supabase.rpc('create_user_notification_settings_table');
    
    if (error) {
      console.log('⚠️ RPC function not found, trying direct approach...');
      
      // Try to insert a test record to see if table exists
      const { error: testError } = await supabase
        .from('user_notification_settings')
        .select('*')
        .limit(1);
      
      if (testError) {
        console.log('❌ Table does not exist:', testError.message);
        console.log('💡 You need to run the SQL script manually in Supabase dashboard');
        console.log('📄 SQL script location: database/snippets/fix-user-notification-settings.sql');
        return;
      } else {
        console.log('✅ Table exists and is accessible');
      }
    } else {
      console.log('✅ Table created successfully:', data);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

fixNotificationSettings();