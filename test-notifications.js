// Test notifications in browser console
// Run this in your browser console to debug notifications

async function testNotifications() {
  try {
    console.log('🔍 Testing notifications system...');
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.log('❌ No user logged in');
      return;
    }
    
    console.log('👤 Current user:', user.id);
    
    // Check if notifications table exists
    const { data: notifications, error: notificationsError } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (notificationsError) {
      console.error('❌ Error fetching notifications:', notificationsError);
      return;
    }
    
    console.log('📊 Notifications found:', notifications?.length || 0);
    console.log('📋 Notifications:', notifications);
    
    // Check notification settings
    const { data: settings, error: settingsError } = await supabase
      .from('notification_settings')
      .select('*')
      .eq('user_id', user.id);
    
    if (settingsError) {
      console.error('❌ Error fetching settings:', settingsError);
    } else {
      console.log('⚙️ Notification settings:', settings);
    }
    
    // Check your chirps
    const { data: chirps, error: chirpsError } = await supabase
      .from('chirps')
      .select('id, content, created_at')
      .eq('author_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (chirpsError) {
      console.error('❌ Error fetching chirps:', chirpsError);
    } else {
      console.log('📝 Your chirps:', chirps?.length || 0);
      console.log('📋 Chirps:', chirps);
    }
    
    // Check reactions on your chirps
    const { data: reactions, error: reactionsError } = await supabase
      .from('reactions')
      .select(`
        id,
        user_id,
        chirp_id,
        created_at,
        chirps!inner(
          id,
          content,
          author_id
        )
      `)
      .eq('chirps.author_id', user.id)
      .order('created_at', { ascending: false });
    
    if (reactionsError) {
      console.error('❌ Error fetching reactions:', reactionsError);
    } else {
      console.log('❤️ Reactions on your chirps:', reactions?.length || 0);
      console.log('📋 Reactions:', reactions);
    }
    
    // Create a test notification
    console.log('🧪 Creating test notification...');
    const { data: testNotif, error: testError } = await supabase
      .from('notifications')
      .insert({
        user_id: user.id,
        from_user_id: user.id, // Using same user for test
        type: 'like',
        chirp_id: chirps?.[0]?.id || 1,
        read: false
      })
      .select();
    
    if (testError) {
      console.error('❌ Error creating test notification:', testError);
    } else {
      console.log('✅ Test notification created:', testNotif);
    }
    
    // Test the notification service
    console.log('🔔 Testing notification service...');
    try {
      const { notificationService } = await import('./services/notificationService');
      const fetchedNotifications = await notificationService.getNotifications(user.id);
      console.log('📱 Notifications from service:', fetchedNotifications?.length || 0);
      console.log('📋 Service notifications:', fetchedNotifications);
    } catch (serviceError) {
      console.error('❌ Error testing notification service:', serviceError);
    }
    
  } catch (error) {
    console.error('❌ Error in test:', error);
  }
}

// Run the test
testNotifications();
