const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://qrzbtituxxilnbgocdge.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFyemJ0aXR1eHhpbG5iZ29jZGdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyNDcxNDMsImV4cCI6MjA2NzgyMzE0M30.P-o5ND8qoiIpA1W-9WkM7RUOaGTjRtkEmPbCXGbrEI8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkColumns() {
  try {
    console.log('🔍 Checking columns in user_notification_settings...');
    
    // Try to insert a test record to see what columns are expected
    const { data, error } = await supabase
      .from('user_notification_settings')
      .insert({
        user_id: '00000000-0000-0000-0000-000000000000',
        target_user_id: '00000000-0000-0000-0000-000000000001',
        notifications_enabled: true
      })
      .select();
    
    if (error) {
      console.log('❌ Insert error (shows column structure):', error.message);
      console.log('📋 Error details:', error);
    } else {
      console.log('✅ Insert successful:', data);
    }
    
    // Try to select with the expected columns
    console.log('\n🔍 Testing select with expected columns...');
    const { data: selectData, error: selectError } = await supabase
      .from('user_notification_settings')
      .select('id, notifications_enabled')
      .limit(1);
    
    if (selectError) {
      console.log('❌ Select error:', selectError.message);
    } else {
      console.log('✅ Select successful:', selectData);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkColumns();
