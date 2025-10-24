#!/usr/bin/env node

/**
 * Fix roll_profile_frame function to resolve ambiguous column reference
 * This script runs the SQL fix in Supabase
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Supabase configuration
const SUPABASE_URL = 'https://qrzbtituxxilnbgocdge.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFyemJ0aXR1eHhpbG5iZ29jZGdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyNDcxNDMsImV4cCI6MjA2NzgyMzE0M30.P-o5ND8qoiIpA1W-9WkM7RUOaGTjRtkEmPbCXGbrEI8';

// Create Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function fixRollProfileFrameFunction() {
  try {
    console.log('🔧 Fixing roll_profile_frame function...');
    
    // Read the SQL file
    const sqlPath = path.join(process.cwd(), 'database', 'snippets', 'fix-roll-profile-frame-final.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('📄 SQL content loaded, executing...');
    
    // Execute the SQL
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: sqlContent
    });
    
    if (error) {
      console.error('❌ Error executing SQL:', error);
      
      // Try alternative approach - execute directly
      console.log('🔄 Trying direct SQL execution...');
      
      // Split SQL into individual statements
      const statements = sqlContent.split(';').filter(stmt => stmt.trim());
      
      for (const statement of statements) {
        if (statement.trim()) {
          console.log('📝 Executing statement:', statement.substring(0, 50) + '...');
          
          try {
            const { error: stmtError } = await supabase.rpc('exec_sql', {
              sql: statement.trim()
            });
            
            if (stmtError) {
              console.error('❌ Statement error:', stmtError);
            } else {
              console.log('✅ Statement executed successfully');
            }
          } catch (stmtErr) {
            console.error('❌ Statement execution failed:', stmtErr);
          }
        }
      }
    } else {
      console.log('✅ SQL executed successfully:', data);
    }
    
    // Test the function
    console.log('🧪 Testing the fixed function...');
    
    const { data: testData, error: testError } = await supabase.rpc('roll_profile_frame', {
      user_uuid: 'cd73fb98-bad1-4c4c-a5f2-5c3d6e9811d8'
    });
    
    if (testError) {
      console.error('❌ Function test failed:', testError);
    } else {
      console.log('✅ Function test successful:', testData);
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the script
fixRollProfileFrameFunction()
  .then(() => {
    console.log('🎉 Script completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  });
