import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qrzbtituxxilnbgocdge.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFyemJ0aXR1eHhpbG5iZ29jZGdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyNDcxNDMsImV4cCI6MjA2NzgyMzE0M30.P-o5ND8qoiIpA1W-9WkM7RUOaGTjRtkEmPbCXGbrEI8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function removeEmojiColumn() {
  try {
    console.log('🔍 Checking reactions table structure...');
    
    // Check if emoji column exists
    const { data: columns, error: columnsError } = await supabase
      .rpc('get_table_columns', { table_name: 'reactions' });
    
    if (columnsError) {
      console.log('❌ Error checking columns:', columnsError);
      // Try alternative approach
      const { data: testData, error: testError } = await supabase
        .from('reactions')
        .select('*')
        .limit(1);
      
      if (testError) {
        console.log('❌ Error testing reactions table:', testError);
        return;
      }
      
      console.log('✅ Reactions table accessible');
    } else {
      console.log('📊 Table columns:', columns);
    }
    
    // Try to remove the emoji column
    console.log('🔧 Attempting to remove emoji column...');
    const { data: alterResult, error: alterError } = await supabase
      .rpc('exec_sql', { 
        sql: 'ALTER TABLE public.reactions DROP COLUMN IF EXISTS emoji;' 
      });
    
    if (alterError) {
      console.log('❌ Error removing emoji column:', alterError);
      console.log('💡 This might be expected if the column was already removed');
    } else {
      console.log('✅ Emoji column removed successfully');
    }
    
    // Test inserting a reaction without emoji
    console.log('🧪 Testing reaction insert without emoji...');
    const { data: testInsert, error: insertError } = await supabase
      .from('reactions')
      .insert({
        user_id: 'test-user-id',
        chirp_id: 999999, // Use a non-existent chirp ID for testing
        created_at: new Date().toISOString()
      })
      .select();
    
    if (insertError) {
      console.log('❌ Error testing insert:', insertError);
    } else {
      console.log('✅ Test insert successful:', testInsert);
      
      // Clean up test data
      await supabase
        .from('reactions')
        .delete()
        .eq('user_id', 'test-user-id')
        .eq('chirp_id', 999999);
      console.log('🧹 Test data cleaned up');
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

removeEmojiColumn();
