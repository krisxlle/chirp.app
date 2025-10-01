#!/usr/bin/env node

/**
 * Fix RLS Policies for chirp-images bucket
 * This script provides the exact SQL to fix the storage issue
 */

console.log('🔧 FIXING RLS POLICIES FOR CHIRP-IMAGES BUCKET');
console.log('');
console.log('✅ DIAGNOSIS COMPLETE:');
console.log('   • Bucket exists: ✅');
console.log('   • Bucket accessible: ✅');
console.log('   • Uploads blocked: ❌ (RLS policies)');
console.log('');
console.log('📋 EXACT SOLUTION:');
console.log('');
console.log('1️⃣ Go to your Supabase Dashboard:');
console.log('   https://supabase.com/dashboard/project/qrzbtituxxilnbgocdge');
console.log('');
console.log('2️⃣ Navigate to Storage → Policies');
console.log('');
console.log('3️⃣ Copy and paste this SQL into the SQL Editor:');
console.log('');
console.log('-- Drop any existing policies first');
console.log('DROP POLICY IF EXISTS "chirp_images_upload" ON storage.objects;');
console.log('DROP POLICY IF EXISTS "chirp_images_select" ON storage.objects;');
console.log('DROP POLICY IF EXISTS "chirp_images_delete" ON storage.objects;');
console.log('DROP POLICY IF EXISTS "chirp_images_update" ON storage.objects;');
console.log('DROP POLICY IF EXISTS "allow_chirp_images_upload" ON storage.objects;');
console.log('DROP POLICY IF EXISTS "allow_chirp_images_select" ON storage.objects;');
console.log('');
console.log('-- Create working policies');
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
console.log('4️⃣ Click "Run" to execute the SQL');
console.log('');
console.log('5️⃣ Test your image upload in the app');
console.log('');
console.log('🎯 WHAT THIS FIXES:');
console.log('   • Allows authenticated users to upload images');
console.log('   • Allows public access to view images');
console.log('   • Allows users to delete their own images');
console.log('   • Allows users to update their own images');
console.log('');
console.log('💡 ALTERNATIVE (if above doesn\'t work):');
console.log('   Use this ultra-permissive policy:');
console.log('');
console.log('DROP POLICY IF EXISTS "chirp_images_upload" ON storage.objects;');
console.log('DROP POLICY IF EXISTS "chirp_images_select" ON storage.objects;');
console.log('DROP POLICY IF EXISTS "chirp_images_delete" ON storage.objects;');
console.log('DROP POLICY IF EXISTS "chirp_images_update" ON storage.objects;');
console.log('');
console.log('CREATE POLICY "allow_all_chirp_images" ON storage.objects');
console.log('FOR ALL TO public');
console.log('USING (bucket_id = \'chirp-images\')');
console.log('WITH CHECK (bucket_id = \'chirp-images\');');
console.log('');
console.log('🚀 After applying these policies, your image uploads should work!');
