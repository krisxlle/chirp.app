import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://qrzbtituxxilnbgocdge.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFyemJ0aXR1eHhpbG5iZ29jZGdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyNDcxNDMsImV4cCI6MjA2NzgyMzE0M30.P-o5ND8qoiIpA1W-9WkM7RUOaGTjRtkEmPbCXGbrEI8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function addImageColumnsToChirps() {
  try {
    console.log('🔍 Checking if image columns exist in chirps table...');
    
    // First, check if the columns exist by trying to select them
    const { data, error } = await supabase
      .from('chirps')
      .select('image_url, image_alt_text, image_width, image_height')
      .limit(1);
    
    if (error) {
      console.log('❌ Image columns do not exist:', error.message);
      console.log('🛠️  Need to add image columns to chirps table');
      
      // Since we can't run DDL commands directly through the client,
      // we'll need to run the SQL migration manually
      console.log('\n📋 Please run the following SQL in your Supabase SQL editor:');
      console.log(`
-- Add image columns to chirps table
ALTER TABLE chirps 
ADD COLUMN IF NOT EXISTS image_url TEXT;

ALTER TABLE chirps 
ADD COLUMN IF NOT EXISTS image_alt_text TEXT;

ALTER TABLE chirps 
ADD COLUMN IF NOT EXISTS image_width INTEGER;

ALTER TABLE chirps 
ADD COLUMN IF NOT EXISTS image_height INTEGER;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_chirps_has_image ON chirps(image_width) WHERE image_width IS NOT NULL;

-- Verify the columns were added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'chirps' 
AND column_name IN ('image_url', 'image_alt_text', 'image_width', 'image_height')
ORDER BY column_name;
      `);
      
    } else {
      console.log('✅ Image columns already exist in chirps table');
      console.log('📊 Sample data:', data);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

addImageColumnsToChirps();
