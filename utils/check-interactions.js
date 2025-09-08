// check-interactions.js
// Run this with: node check-interactions.js

const { createClient } = require('@supabase/supabase-js');

// Replace these with your actual Supabase credentials
const supabaseUrl = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'your-anon-key';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkInteractions() {
  console.log('🔍 Checking chirp interactions...');
  console.log('Note: Replace YOUR_USER_ID with your actual user ID');
  console.log('');
  
  // Replace with your actual user ID
  const userId = 'YOUR_USER_ID';
  
  if (userId === 'YOUR_USER_ID') {
    console.log('❌ Please replace YOUR_USER_ID with your actual user ID');
    console.log('You can find your user ID by:');
    console.log('1. Opening your app and checking the console logs');
    console.log('2. Looking at the AuthContext logs when you log in');
    console.log('3. Checking the user object in your browser dev tools');
    return;
  }
  
  try {
    console.log(`🔍 Checking interactions for user: ${userId}`);
    
    // Get chirps count
    const { data: chirps, error: chirpsError } = await supabase
      .from('chirps')
      .select('id, content, created_at')
      .eq('author_id', userId);
    
    if (chirpsError) {
      console.error('❌ Error fetching chirps:', chirpsError.message);
      return;
    }
    
    console.log(`📝 Your Chirps: ${chirps?.length || 0}`);
    chirps?.forEach(chirp => {
      const content = chirp.content.length > 50 ? chirp.content.substring(0, 50) + '...' : chirp.content;
      console.log(`  - Chirp #${chirp.id}: ${content}`);
    });
    
    // Get likes count
    const { data: likes, error: likesError } = await supabase
      .from('reactions')
      .select(`
        chirp_id, 
        created_at, 
        users!inner(first_name, custom_handle, handle),
        chirps!inner(content)
      `)
      .eq('chirps.author_id', userId);
    
    if (likesError) {
      console.error('❌ Error fetching likes:', likesError.message);
    } else {
      console.log(`❤️ Likes received: ${likes?.length || 0}`);
      likes?.forEach(like => {
        const handle = like.users.custom_handle || like.users.handle;
        const content = like.chirps.content.length > 30 ? like.chirps.content.substring(0, 30) + '...' : like.chirps.content;
        console.log(`  - ${handle} liked: "${content}"`);
      });
    }
    
    // Get replies count
    const { data: replies, error: repliesError } = await supabase
      .from('chirps')
      .select(`
        id, 
        content, 
        created_at, 
        reply_to_id,
        users!inner(first_name, custom_handle, handle),
        original_chirp:chirps!reply_to_id(content)
      `)
      .eq('original_chirp.author_id', userId);
    
    if (repliesError) {
      console.error('❌ Error fetching replies:', repliesError.message);
    } else {
      console.log(`💬 Replies received: ${replies?.length || 0}`);
      replies?.forEach(reply => {
        const handle = reply.users.custom_handle || reply.users.handle;
        const replyContent = reply.content.length > 30 ? reply.content.substring(0, 30) + '...' : reply.content;
        const originalContent = reply.original_chirp.content.length > 30 ? reply.original_chirp.content.substring(0, 30) + '...' : reply.original_chirp.content;
        console.log(`  - ${handle} replied: "${replyContent}" to: "${originalContent}"`);
      });
    }
    
    // Get notifications count
    const { data: notifications, error: notificationsError } = await supabase
      .from('notifications')
      .select(`
        id, 
        type, 
        created_at, 
        read,
        chirp_id,
        chirps!inner(content),
        actor:from_user_id(first_name, custom_handle, handle)
      `)
      .eq('chirps.author_id', userId);
    
    if (notificationsError) {
      console.error('❌ Error fetching notifications:', notificationsError.message);
    } else {
      console.log(`🔔 Notifications: ${notifications?.length || 0}`);
      console.log(`🔔 Unread notifications: ${notifications?.filter(n => !n.read).length || 0}`);
      notifications?.forEach(notif => {
        const actorHandle = notif.actor?.custom_handle || notif.actor?.handle || 'Unknown';
        const chirpContent = notif.chirps.content.length > 30 ? notif.chirps.content.substring(0, 30) + '...' : notif.chirps.content;
        const readStatus = notif.read ? '✅' : '❌';
        console.log(`  - ${notif.type} from ${actorHandle} on: "${chirpContent}" ${readStatus}`);
      });
    }
    
    console.log('\n✅ Interaction check complete!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkInteractions();
