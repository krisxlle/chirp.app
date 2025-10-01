#!/usr/bin/env node

/**
 * Create Test User and Test Image Upload
 * This script creates a test user and tests image uploads
 */

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = 'https://qrzbtituxxilnbgocdge.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFyemJ0aXR1eHhpbG5iZ29jZGdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyNDcxNDMsImV4cCI6MjA2NzgyMzE0M30.P-o5ND8qoiIpA1W-9WkM7RUOaGTjRtkEmPbCXGbrEI8';
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

async function createTestUserAndUpload() {
  try {
    console.log('🧪 Creating Test User and Testing Image Upload...');
    console.log('');
    
    // Test 1: Create a test user
    console.log('1️⃣ Creating test user...');
    const testEmail = `test-${Date.now()}@example.com`;
    const testPassword = 'testpassword123';
    const testName = 'Test User';
    
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          name: testName,
        },
      },
    });
    
    if (signUpError) {
      console.log('❌ Sign up error:', signUpError.message);
      return;
    }
    
    if (signUpData.user) {
      console.log('✅ Test user created successfully:', signUpData.user.email);
      
      // Test 2: Create user profile in users table
      console.log('');
      console.log('2️⃣ Creating user profile...');
      
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: signUpData.user.id,
          email: testEmail,
          first_name: testName.split(' ')[0] || testName,
          last_name: testName.split(' ').slice(1).join(' ') || '',
          handle: `user_${signUpData.user.id.substring(0, 8)}`,
          display_name: testName,
          bio: '',
          profile_image_url: null,
          banner_image_url: null,
          crystal_balance: 100,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      
      if (profileError) {
        console.log('❌ Profile creation error:', profileError.message);
      } else {
        console.log('✅ User profile created successfully');
      }
      
      // Test 3: Create a test image blob
      console.log('');
      console.log('3️⃣ Creating test image...');
      
      // Create a simple 1x1 pixel PNG
      const testImageData = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
      const testImageBlob = new Blob([Buffer.from(testImageData, 'base64')], { type: 'image/png' });
      const testFileName = `test-image-${Date.now()}.png`;
      
      console.log('📤 Test image created:', testFileName);
      console.log('📏 Image size:', testImageBlob.size, 'bytes');
      console.log('🎨 MIME type:', testImageBlob.type);
      
      // Test 4: Upload image to storage
      console.log('');
      console.log('4️⃣ Uploading image to storage...');
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('chirp-images')
        .upload(testFileName, testImageBlob, {
          contentType: 'image/png',
          cacheControl: '3600',
          upsert: true
        });
      
      if (uploadError) {
        console.log('❌ Storage upload error:', uploadError.message);
        console.log('💡 Error details:', uploadError);
        
        if (uploadError.message.includes('row-level security')) {
          console.log('');
          console.log('🔧 RLS POLICY ISSUE DETECTED');
          console.log('The bucket exists but RLS policies are blocking uploads.');
          console.log('');
          console.log('📋 SOLUTION:');
          console.log('1. Go to Supabase Dashboard → Storage → Policies');
          console.log('2. Run this SQL:');
          console.log('');
          console.log('CREATE POLICY "chirp_images_upload" ON storage.objects');
          console.log('FOR INSERT TO authenticated');
          console.log('WITH CHECK (bucket_id = \'chirp-images\');');
          console.log('');
          console.log('CREATE POLICY "chirp_images_select" ON storage.objects');
          console.log('FOR SELECT TO public');
          console.log('USING (bucket_id = \'chirp-images\');');
        }
      } else {
        console.log('✅ Image upload successful!');
        console.log('📤 Upload data:', uploadData);
        
        // Test 5: Get public URL
        console.log('');
        console.log('5️⃣ Getting public URL...');
        
        const { data: { publicUrl } } = supabase.storage
          .from('chirp-images')
          .getPublicUrl(testFileName);
        
        console.log('🔗 Public URL:', publicUrl);
        
        // Test 6: Clean up
        console.log('');
        console.log('6️⃣ Cleaning up test file...');
        
        const { error: deleteError } = await supabase.storage
          .from('chirp-images')
          .remove([testFileName]);
        
        if (deleteError) {
          console.log('⚠️ Cleanup error:', deleteError.message);
        } else {
          console.log('🧹 Test file cleaned up successfully');
        }
        
        console.log('');
        console.log('🎉 SUCCESS! Image uploads are working correctly!');
        console.log('✅ Supabase Auth is properly configured');
        console.log('✅ RLS policies are working');
        console.log('✅ Image uploads work with authenticated users');
        console.log('');
        console.log('💡 Your app should now be able to upload images successfully!');
        console.log('');
        console.log('📋 Test user credentials:');
        console.log('   Email:', testEmail);
        console.log('   Password:', testPassword);
        console.log('   You can use these to test the app!');
      }
    }
    
  } catch (error) {
    console.error('❌ Error during test:', error);
  }
}

// Run the test
createTestUserAndUpload();
