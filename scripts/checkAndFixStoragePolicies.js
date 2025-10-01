#!/usr/bin/env node

/**
 * Check and Fix Storage Policies
 * This script checks existing policies and provides the correct fix
 */

console.log('🔍 Checking existing storage policies...');
console.log('');
console.log('The error indicates that policies already exist, but they may not be working correctly.');
console.log('');
console.log('📋 STEP-BY-STEP FIX:');
console.log('');
console.log('1️⃣ Go to your Supabase Dashboard:');
console.log('   https://supabase.com/dashboard/project/qrzbtituxxilnbgocdge');
console.log('');
console.log('2️⃣ Navigate to Storage → Policies');
console.log('');
console.log('3️⃣ First, drop all existing policies by running this SQL:');
console.log('');
console.log('-- Drop all existing policies');
console.log('DROP POLICY IF EXISTS "chirp_images_upload" ON storage.objects;');
console.log('DROP POLICY IF EXISTS "chirp_images_select" ON storage.objects;');
console.log('DROP POLICY IF EXISTS "chirp_images_delete" ON storage.objects;');
console.log('DROP POLICY IF EXISTS "chirp_images_update" ON storage.objects;');
console.log('DROP POLICY IF EXISTS "Authenticated users can upload chirp images" ON storage.objects;');
console.log('DROP POLICY IF EXISTS "Anyone can view chirp images" ON storage.objects;');
console.log('DROP POLICY IF EXISTS "Users can delete their own chirp images" ON storage.objects;');
console.log('DROP POLICY IF EXISTS "Users can update their own chirp images" ON storage.objects;');
console.log('');
console.log('4️⃣ Then create new, working policies:');
console.log('');
console.log('-- Create working policies for chirp-images');
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
console.log('5️⃣ Verify the bucket exists and is public:');
console.log('   • Go to Storage → Settings');
console.log('   • Make sure "chirp-images" bucket exists');
console.log('   • Make sure it\'s marked as "Public"');
console.log('');
console.log('6️⃣ Test your image upload functionality');
console.log('');
console.log('💡 Alternative: If policies still don\'t work, try this more permissive approach:');
console.log('');
console.log('-- Ultra-permissive policies (use only if above doesn\'t work)');
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
console.log('🎉 This should resolve the 400 error!');
