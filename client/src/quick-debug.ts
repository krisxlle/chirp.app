// Quick debug for posting issues
import { supabase } from './lib/supabase';

export async function quickDebugPosting() {
  console.log('🔍 Quick Debug - Checking posting setup...');
  
  // 1. Check authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    console.error('❌ Not authenticated:', authError);
    return { error: 'Not authenticated' };
  }
  
  console.log('✅ Authenticated:', user.id, user.email);
  
  // 2. Check if user profile exists
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();
  
  if (profileError) {
    console.error('❌ Profile error:', profileError);
    return { error: 'Profile not found', details: profileError };
  }
  
  console.log('✅ Profile exists:', profile);
  
  // 3. Try to create a test chirp
  console.log('🧪 Attempting test chirp...');
  const { data: testChirp, error: chirpError } = await supabase
    .from('chirps')
    .insert({
      content: 'Test chirp at ' + new Date().toISOString(),
      author_id: user.id
    })
    .select()
    .single();
  
  if (chirpError) {
    console.error('❌ Chirp creation failed:', chirpError);
    return { error: 'Cannot create chirp', details: chirpError };
  }
  
  console.log('✅ Test chirp created:', testChirp);
  
  // 4. Delete the test chirp
  await supabase.from('chirps').delete().eq('id', testChirp.id);
  console.log('🗑️ Test chirp deleted');
  
  return { success: true, user, profile };
}

// Make it globally available
if (typeof window !== 'undefined') {
  (window as any).quickDebug = quickDebugPosting;
}
