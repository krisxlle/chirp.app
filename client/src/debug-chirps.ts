// Debug script to check chirps and user profile
import { supabase } from './lib/supabase';

export async function debugUserAndChirps() {
  console.log('🔍 Starting debug...');
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    console.error('❌ No authenticated user found');
    return;
  }
  
  console.log('✅ Authenticated user:', user.id, user.email);
  
  // Check if user profile exists
  const { data: userProfile, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();
  
  if (userError) {
    console.error('❌ Error fetching user profile:', userError);
    console.log('🔧 User profile does not exist - this is the problem!');
  } else {
    console.log('✅ User profile exists:', userProfile);
  }
  
  // Check recent chirps for this user
  const { data: chirps, error: chirpsError } = await supabase
    .from('chirps')
    .select('*')
    .eq('author_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5);
  
  if (chirpsError) {
    console.error('❌ Error fetching chirps:', chirpsError);
  } else {
    console.log(`✅ Found ${chirps?.length || 0} chirps for this user:`, chirps);
  }
  
  // Check RLS policies
  const { data: testInsert, error: testError } = await supabase
    .from('chirps')
    .insert({
      content: 'Test chirp - please ignore',
      author_id: user.id
    })
    .select()
    .single();
  
  if (testError) {
    console.error('❌ Cannot insert chirp (RLS policy issue?):', testError);
  } else {
    console.log('✅ Test chirp created successfully:', testInsert);
    
    // Delete the test chirp
    await supabase
      .from('chirps')
      .delete()
      .eq('id', testInsert.id);
    console.log('🗑️ Test chirp deleted');
  }
  
  return { user, userProfile, chirps };
}

// Make it available globally for easy access in console
if (typeof window !== 'undefined') {
  (window as any).debugChirps = debugUserAndChirps;
}
