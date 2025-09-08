// Check all interactions on your chirps (all time)
// Run this in your browser console or add to your app

async function checkChirpInteractions(userId) {
  try {
    console.log('🔍 Checking all interactions on your chirps...');
    
    // Get all your chirps with interaction counts
    const { data: chirpsWithStats, error: chirpsError } = await supabase
      .from('chirps')
      .select(`
        id,
        content,
        created_at,
        reactions:reactions(count),
        replies:chirps!reply_to_id(count),
        reposts:reposts(count)
      `)
      .eq('author_id', userId)
      .order('created_at', { ascending: false });

    if (chirpsError) {
      console.error('❌ Error fetching chirps:', chirpsError);
      return;
    }

    console.log('📊 Your Chirps Summary:');
    console.table(chirpsWithStats.map(chirp => ({
      'Chirp ID': chirp.id,
      'Content': chirp.content.substring(0, 50) + '...',
      'Created': new Date(chirp.created_at).toLocaleDateString(),
      'Likes': chirp.reactions?.[0]?.count || 0,
      'Replies': chirp.replies?.[0]?.count || 0,
      'Reposts': chirp.reposts?.[0]?.count || 0
    })));

    // Get all likes on your chirps
    const { data: likes, error: likesError } = await supabase
      .from('reactions')
      .select(`
        chirp_id,
        created_at,
        users!inner(
          first_name,
          last_name,
          custom_handle,
          handle,
          email
        ),
        chirps!inner(
          content
        )
      `)
      .eq('chirps.author_id', userId)
      .order('created_at', { ascending: false });

    if (!likesError && likes) {
      console.log('❤️ All Likes on Your Chirps:');
      console.table(likes.map(like => ({
        'Chirp ID': like.chirp_id,
        'Chirp Content': like.chirps.content.substring(0, 30) + '...',
        'Liked By': like.users.custom_handle || like.users.handle,
        'Name': `${like.users.first_name} ${like.users.last_name}`,
        'Email': like.users.email,
        'Liked At': new Date(like.created_at).toLocaleString()
      })));
    }

    // Get all replies to your chirps
    const { data: replies, error: repliesError } = await supabase
      .from('chirps')
      .select(`
        id,
        content,
        created_at,
        reply_to_id,
        users!inner(
          first_name,
          last_name,
          custom_handle,
          handle,
          email
        ),
        original_chirp:chirps!reply_to_id(
          content
        )
      `)
      .eq('original_chirp.author_id', userId)
      .order('created_at', { ascending: false });

    if (!repliesError && replies) {
      console.log('💬 All Replies to Your Chirps:');
      console.table(replies.map(reply => ({
        'Reply ID': reply.id,
        'Reply Content': reply.content.substring(0, 30) + '...',
        'Original Chirp ID': reply.reply_to_id,
        'Original Content': reply.original_chirp.content.substring(0, 30) + '...',
        'Replied By': reply.users.custom_handle || reply.users.handle,
        'Name': `${reply.users.first_name} ${reply.users.last_name}`,
        'Email': reply.users.email,
        'Replied At': new Date(reply.created_at).toLocaleString()
      })));
    }

    // Get all notifications related to your chirps
    const { data: notifications, error: notificationsError } = await supabase
      .from('notifications')
      .select(`
        id,
        type,
        created_at,
        read,
        chirp_id,
        chirps!inner(
          content
        ),
        actor:from_user_id(
          first_name,
          last_name,
          custom_handle,
          handle
        )
      `)
      .eq('chirps.author_id', userId)
      .order('created_at', { ascending: false });

    if (!notificationsError && notifications) {
      console.log('🔔 All Notifications for Your Chirps:');
      console.table(notifications.map(notif => ({
        'Notification ID': notif.id,
        'Type': notif.type,
        'Chirp ID': notif.chirp_id,
        'Chirp Content': notif.chirps.content.substring(0, 30) + '...',
        'Actor': notif.actor?.custom_handle || notif.actor?.handle || 'Unknown',
        'Actor Name': notif.actor ? `${notif.actor.first_name} ${notif.actor.last_name}` : 'Unknown',
        'Read': notif.read ? '✅' : '❌',
        'Created At': new Date(notif.created_at).toLocaleString()
      })));
    }

    // Summary statistics
    const totalChirps = chirpsWithStats?.length || 0;
    const totalLikes = likes?.length || 0;
    const totalReplies = replies?.length || 0;
    const totalNotifications = notifications?.length || 0;
    const unreadNotifications = notifications?.filter(n => !n.read).length || 0;

    console.log('📈 Summary Statistics:');
    console.log(`Total Chirps: ${totalChirps}`);
    console.log(`Total Likes Received: ${totalLikes}`);
    console.log(`Total Replies Received: ${totalReplies}`);
    console.log(`Total Notifications: ${totalNotifications}`);
    console.log(`Unread Notifications: ${unreadNotifications}`);

  } catch (error) {
    console.error('❌ Error checking chirp interactions:', error);
  }
}

// Usage: Replace 'YOUR_USER_ID' with your actual user ID
// checkChirpInteractions('YOUR_USER_ID');
