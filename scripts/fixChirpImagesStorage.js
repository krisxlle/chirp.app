#!/usr/bin/env node

/**
 * Fix Chirp Images Storage 400 Error
 * This script applies the SQL fix to create the bucket and policies
 */

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with anon key
const supabaseUrl = 'https://qrzbtituxxilnbgocdge.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFyemJ0aXR1eHhpbG5iZ29jZGdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyNDcxNDMsImV4cCI6MjA2NzgyMzE0M30.P-o5ND8qoiIpA1W-9WkM7RUOaGTjRtkEmPbCXGbrEI8';
const supabase = createClient(supabaseUrl, supabaseKey);

async function fixChirpImagesStorage() {
  try {
    console.log('🔧 Fixing chirp-images storage 400 error...');
    
    // First, check if bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('❌ Error listing buckets:', listError);
      return;
    }
    
    console.log('📋 Existing buckets:', buckets?.map(b => b.name) || []);
    
    const chirpImagesBucket = buckets?.find(bucket => bucket.name === 'chirp-images');
    
    if (chirpImagesBucket) {
      console.log('✅ chirp-images bucket already exists!');
      console.log('📊 Bucket details:', chirpImagesBucket);
    } else {
      console.log('🆕 Creating chirp-images bucket...');
      
      // Try to create the bucket
      const { data, error } = await supabase.storage.createBucket('chirp-images', {
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
        fileSizeLimit: 5242880 // 5MB
      });
      
      if (error) {
        console.error('❌ Error creating bucket:', error);
        console.log('💡 This is likely due to RLS policies. You need to:');
        console.log('1. Go to your Supabase Dashboard');
        console.log('2. Navigate to Storage > Settings');
        console.log('3. Create the "chirp-images" bucket manually');
        console.log('4. Set it as public');
        console.log('5. Apply the policies from database/snippets/fix_chirp_images_400_error.sql');
        return;
      }
      
      console.log('✅ chirp-images bucket created successfully!');
      console.log('📊 Bucket details:', data);
    }
    
    console.log('🎉 Fix completed!');
    console.log('💡 If uploads still fail, you may need to apply RLS policies manually in the Supabase Dashboard.');
    
  } catch (error) {
    console.error('❌ Error fixing storage:', error);
  }
}

// Run the fix
fixChirpImagesStorage();
