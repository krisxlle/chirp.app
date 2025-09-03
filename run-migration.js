// Run this script to add crystal_balance column to users table
const { createClient } = require('@supabase/supabase-js');

// You'll need to replace these with your actual Supabase credentials
const supabaseUrl = 'https://qrzbtituxxilnbgocdge.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFyemJ0aXR1eHhpbG5iZ29jZGdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyNDcxNDMsImV4cCI6MjA2NzgyMzE0M30.P-o5ND8qoiIpA1W-9WkM7RUOaGTjRtkEmPbCXGbrEI8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function addCrystalBalanceColumn() {
  try {
    // Add crystal_balance column
    const { error: alterError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE users ADD COLUMN IF NOT EXISTS crystal_balance INTEGER DEFAULT 500000;'
    });

    if (alterError) {
      console.error('Error adding column:', alterError);
      return;
    }

    // Update existing users
    const { error: updateError } = await supabase.rpc('exec_sql', {
      sql: 'UPDATE users SET crystal_balance = 500000 WHERE crystal_balance IS NULL;'
    });

    if (updateError) {
      console.error('Error updating users:', updateError);
      return;
    }

    console.log('✅ Crystal balance column added successfully!');
  } catch (error) {
    console.error('Error:', error);
  }
}

addCrystalBalanceColumn();
