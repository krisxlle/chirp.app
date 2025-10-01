#!/usr/bin/env node

/**
 * Create Chirp Images Bucket with Policies
 * This script provides step-by-step instructions to fix the storage issue
 */

console.log('🔧 Fixing chirp-images storage 400 error...');
console.log('');
console.log('The chirp-images bucket does not exist. You need to create it manually in the Supabase Dashboard.');
console.log('');
console.log('📋 STEP-BY-STEP INSTRUCTIONS:');
console.log('');
console.log('1️⃣ Go to your Supabase Dashboard:');
console.log('   https://supabase.com/dashboard/project/qrzbtituxxilnbgocdge');
console.log('');
console.log('2️⃣ Navigate to Storage → Settings');
console.log('');
console.log('3️⃣ Click "New bucket" and create a bucket with these settings:');
console.log('   • Name: chirp-images');
console.log('   • Public bucket: ✅ (checked)');
console.log('   • File size limit: 5242880 (5MB)');
console.log('   • Allowed MIME types: image/jpeg, image/png, image/gif, image/webp');
console.log('');
console.log('4️⃣ After creating the bucket, go to Storage → Policies');
console.log('');
console.log('5️⃣ Copy and paste this SQL into the SQL Editor:');
console.log('');
console.log('-- Create simple, permissive policies for chirp-images');
console.log('CREATE POLICY "chirp_images_upload" ON storage.objects');
console.log('FOR INSERT TO authenticated');
console.log('WITH CHECK (bucket_id = \'chirp-images\');');
console.log('');
console.log('CREATE POLICY "chirp_images_select" ON storage.objects');
console.log('FOR SELECT TO public');
console.log('USING (bucket_id = \'chirp-images\');');
console.log('');
console.log('CREATE POLICY "chirp_images_delete" ON storage.objects');
console.log('FOR DELETE TO authenticated');
console.log('USING (bucket_id = \'chirp-images\');');
console.log('');
console.log('CREATE POLICY "chirp_images_update" ON storage.objects');
console.log('FOR UPDATE TO authenticated');
console.log('USING (bucket_id = \'chirp-images\')');
console.log('WITH CHECK (bucket_id = \'chirp-images\');');
console.log('');
console.log('6️⃣ Click "Run" to execute the SQL');
console.log('');
console.log('7️⃣ Test your image upload functionality');
console.log('');
console.log('🎉 After completing these steps, the 400 error should be resolved!');
console.log('');
console.log('💡 If you still get errors, make sure:');
console.log('   • The bucket is set to "Public"');
console.log('   • The policies were created successfully');
console.log('   • Your app is using the correct Supabase URL and anon key');
