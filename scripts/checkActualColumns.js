const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://qrzbtituxxilnbgocdge.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFyemJ0aXR1eHhpbG5iZ29jZGdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyNDcxNDMsImV4cCI6MjA2NzgyMzE0M30.P-o5ND8qoiIpA1W-9WkM7RUOaGTjRtkEmPbCXGbrEI8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkActualColumns() {
  try {
    console.log('🔍 Checking actual columns in user_notification_settings...');
    
    // Try to select all columns to see what exists
    const { data, error } = await supabase
      .from('user_notification_settings')
      .select('*')
      .limit(1);
    
    if (error) {
      console.log('❌ Select all error:', error.message);
    } else {
      console.log('✅ Select all successful:', data);
    }
    
    // Try common column names
    const commonColumns = ['id', 'user_id', 'target_user_id', 'notify_on_post', 'enabled', 'is_enabled', 'created_at', 'updated_at'];
    
    console.log('\n🔍 Testing individual columns...');
    for (const column of commonColumns) {
      try {
        const { error: colError } = await supabase
          .from('user_notification_settings')
          .select(column)
          .limit(1);
        
        if (colError) {
          console.log(`❌ Column '${column}' does not exist:`, colError.message);
        } else {
          console.log(`✅ Column '${column}' exists`);
        }
      } catch (err) {
        console.log(`❌ Error testing column '${column}':`, err.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkActualColumns();
