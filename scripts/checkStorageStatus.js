#!/usr/bin/env node

/**
 * Check Storage Status
 * This script checks the current state of Supabase storage buckets and policies
 */

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with anon key
const supabaseUrl = 'https://qrzbtituxxilnbgocdge.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFyemJ0aXR1eHhpbG5iZ29jZGdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyNDcxNDMsImV4cCI6MjA2NzgyMzE0M30.P-o5ND8qoiIpA1W-9WkM7RUOaGTjRtkEmPbCXGbrEI8';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkStorageStatus() {
  try {
    console.log('🔍 Checking Supabase storage status...');
    
    // Check existing buckets
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('❌ Error listing buckets:', listError);
      return;
    }
    
    console.log('📋 Existing buckets:', buckets?.map(b => b.name) || []);
    
    const chirpImagesBucket = buckets?.find(bucket => bucket.name === 'chirp-images');
    
    if (chirpImagesBucket) {
      console.log('✅ chirp-images bucket exists!');
      console.log('📊 Bucket details:', chirpImagesBucket);
      
      // Try to list files in the bucket
      const { data: files, error: listFilesError } = await supabase.storage
        .from('chirp-images')
        .list();
      
      if (listFilesError) {
        console.log('❌ Error listing files:', listFilesError);
      } else {
        console.log('📁 Files in bucket:', files?.length || 0);
      }
      
      // Try a simple upload test
      console.log('🧪 Testing upload permissions...');
      const testBlob = new Blob(['test'], { type: 'text/plain' });
      const testFileName = `test-${Date.now()}.txt`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('chirp-images')
        .upload(testFileName, testBlob);
      
      if (uploadError) {
        console.log('❌ Upload test failed:', uploadError);
        console.log('💡 This confirms RLS policies are blocking uploads');
      } else {
        console.log('✅ Upload test successful:', uploadData);
        
        // Clean up test file
        await supabase.storage
          .from('chirp-images')
          .remove([testFileName]);
      }
      
    } else {
      console.log('❌ chirp-images bucket does not exist');
      console.log('💡 You need to create it manually in the Supabase Dashboard');
    }
    
  } catch (error) {
    console.error('❌ Error checking storage:', error);
  }
}

// Run the check
checkStorageStatus();
