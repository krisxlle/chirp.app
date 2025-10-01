#!/usr/bin/env node

/**
 * Diagnose Storage Issue
 * This script tests different approaches to access the chirp-images bucket
 */

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with anon key
const supabaseUrl = 'https://qrzbtituxxilnbgocdge.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFyemJ0aXR1eHhpbG5iZ29jZGdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyNDcxNDMsImV4cCI6MjA2NzgyMzE0M30.P-o5ND8qoiIpA1W-9WkM7RUOaGTjRtkEmPbCXGbrEI8';
const supabase = createClient(supabaseUrl, supabaseKey);

async function diagnoseStorageIssue() {
  try {
    console.log('🔍 Diagnosing storage issue...');
    console.log('');
    
    // Test 1: Try to list buckets (this might fail due to permissions)
    console.log('1️⃣ Testing bucket listing...');
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.log('❌ Cannot list buckets:', listError.message);
      console.log('💡 This is expected - anon key cannot list buckets');
    } else {
      console.log('✅ Buckets found:', buckets?.map(b => b.name) || []);
    }
    
    console.log('');
    
    // Test 2: Try to access the bucket directly
    console.log('2️⃣ Testing direct bucket access...');
    const { data: files, error: listFilesError } = await supabase.storage
      .from('chirp-images')
      .list();
    
    if (listFilesError) {
      console.log('❌ Cannot access chirp-images bucket:', listFilesError.message);
      console.log('💡 This suggests the bucket doesn\'t exist or has permission issues');
    } else {
      console.log('✅ Can access chirp-images bucket!');
      console.log('📁 Files in bucket:', files?.length || 0);
    }
    
    console.log('');
    
    // Test 3: Try to upload a test file
    console.log('3️⃣ Testing upload to chirp-images bucket...');
    const testBlob = new Blob(['test content'], { type: 'text/plain' });
    const testFileName = `test-${Date.now()}.txt`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('chirp-images')
      .upload(testFileName, testBlob);
    
    if (uploadError) {
      console.log('❌ Upload failed:', uploadError.message);
      console.log('💡 This confirms the bucket access issue');
    } else {
      console.log('✅ Upload successful!');
      console.log('📤 Uploaded file:', uploadData);
      
      // Clean up test file
      await supabase.storage
        .from('chirp-images')
        .remove([testFileName]);
      console.log('🧹 Test file cleaned up');
    }
    
    console.log('');
    
    // Test 4: Try to get public URL
    console.log('4️⃣ Testing public URL generation...');
    const { data: { publicUrl } } = supabase.storage
      .from('chirp-images')
      .getPublicUrl('test-file.jpg');
    
    console.log('🔗 Public URL example:', publicUrl);
    
    console.log('');
    console.log('📋 DIAGNOSIS SUMMARY:');
    console.log('');
    
    if (listFilesError) {
      console.log('❌ The chirp-images bucket is not accessible');
      console.log('💡 Possible causes:');
      console.log('   • Bucket doesn\'t exist');
      console.log('   • Bucket is not public');
      console.log('   • RLS policies are blocking access');
      console.log('   • Wrong bucket name');
    } else if (uploadError) {
      console.log('✅ Bucket exists but uploads are blocked');
      console.log('💡 This is an RLS policy issue');
    } else {
      console.log('✅ Bucket is working correctly!');
      console.log('💡 The issue might be in the app code');
    }
    
  } catch (error) {
    console.error('❌ Error during diagnosis:', error);
  }
}

// Run the diagnosis
diagnoseStorageIssue();
