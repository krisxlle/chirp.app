// Quick notification debug test
// Copy and paste this into your browser console

async function quickNotificationTest() {
  console.log('🔍 Quick Notification Test Starting...');
  
  try {
    // Step 1: Get current user
    const { data: { user } } = await supabase.auth.getUser();
    console.log('👤 Current user:', user?.id);
    
    if (!user) {
      console.log('❌ No user logged in');
      return;
    }
    
    // Step 2: Test direct query
    console.log('📊 Testing direct database query...');
    const { data: directNotifications, error: directError } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    console.log('📋 Direct query result:', directNotifications?.length || 0, 'notifications');
    console.log('📋 Direct query error:', directError);
    
    if (directNotifications && directNotifications.length > 0) {
      console.log('📋 Sample notification:', directNotifications[0]);
    }
    
    // Step 3: Test notification service
    console.log('🔔 Testing notification service...');
    try {
      const { notificationService } = await import('./services/notificationService');
      const serviceNotifications = await notificationService.getNotifications(user.id);
      console.log('📋 Service result:', serviceNotifications?.length || 0, 'notifications');
      console.log('📋 Service notifications:', serviceNotifications);
    } catch (serviceError) {
      console.error('❌ Service error:', serviceError);
    }
    
    // Step 4: Check field types
    if (directNotifications && directNotifications.length > 0) {
      const sample = directNotifications[0];
      console.log('🔍 Field analysis:');
      console.log('  - id:', sample.id, typeof sample.id);
      console.log('  - user_id:', sample.user_id, typeof sample.user_id);
      console.log('  - from_user_id:', sample.from_user_id, typeof sample.from_user_id);
      console.log('  - type:', sample.type, typeof sample.type);
      console.log('  - chirp_id:', sample.chirp_id, typeof sample.chirp_id);
      console.log('  - read:', sample.read, typeof sample.read);
      console.log('  - created_at:', sample.created_at, typeof sample.created_at);
    }
    
    // Step 5: Test with relationships
    console.log('🔗 Testing query with relationships...');
    const { data: relationshipNotifications, error: relationshipError } = await supabase
      .from('notifications')
      .select(`
        *,
        actor:from_user_id (
          id,
          first_name,
          custom_handle,
          handle,
          profile_image_url,
          avatar_url
        ),
        chirp:chirp_id (
          id,
          content,
          author_id
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    console.log('📋 Relationship query result:', relationshipNotifications?.length || 0, 'notifications');
    console.log('📋 Relationship query error:', relationshipError);
    
    // Summary
    console.log('\n📊 Summary:');
    console.log('==========');
    console.log('✅ Direct query:', directNotifications?.length || 0, 'notifications');
    console.log('✅ Service query:', serviceNotifications?.length || 0, 'notifications');
    console.log('✅ Relationship query:', relationshipNotifications?.length || 0, 'notifications');
    
    if (directNotifications && directNotifications.length > 0) {
      console.log('✅ Notifications exist in database');
      if (serviceNotifications && serviceNotifications.length === 0) {
        console.log('❌ Service is not returning notifications - this is the issue!');
      } else {
        console.log('✅ Service is working');
      }
    } else {
      console.log('❌ No notifications found in database');
    }
    
  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

// Run the test
quickNotificationTest();
