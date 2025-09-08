// Debug notification fetching in your app
// Run this in your browser console to test why notifications aren't showing

async function debugNotificationFetching() {
  try {
    console.log('🔍 Debugging notification fetching...');
    
    // Step 1: Check current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.log('❌ No user logged in');
      return;
    }
    
    console.log('👤 Current user:', user.id);
    console.log('👤 User email:', user.email);
    
    // Step 2: Test direct database query
    console.log('\n📊 Testing direct database query...');
    const { data: directNotifications, error: directError } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (directError) {
      console.error('❌ Direct query error:', directError);
    } else {
      console.log('✅ Direct query success:', directNotifications?.length || 0, 'notifications');
      console.log('📋 Direct notifications:', directNotifications);
    }
    
    // Step 3: Test with relationships
    console.log('\n🔗 Testing query with relationships...');
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
    
    if (relationshipError) {
      console.error('❌ Relationship query error:', relationshipError);
    } else {
      console.log('✅ Relationship query success:', relationshipNotifications?.length || 0, 'notifications');
      console.log('📋 Relationship notifications:', relationshipNotifications);
    }
    
    // Step 4: Test notification service
    console.log('\n🔔 Testing notification service...');
    try {
      // Import the notification service
      const { notificationService } = await import('./services/notificationService');
      
      const serviceNotifications = await notificationService.getNotifications(user.id);
      console.log('✅ Service query success:', serviceNotifications?.length || 0, 'notifications');
      console.log('📋 Service notifications:', serviceNotifications);
      
      // Test notification counts
      const counts = await notificationService.getNotificationCounts(user.id);
      console.log('📊 Notification counts:', counts);
      
    } catch (serviceError) {
      console.error('❌ Service error:', serviceError);
    }
    
    // Step 5: Check field mappings
    console.log('\n🔍 Checking field mappings...');
    if (directNotifications && directNotifications.length > 0) {
      const sampleNotification = directNotifications[0];
      console.log('📋 Sample notification fields:', Object.keys(sampleNotification));
      console.log('📋 Sample notification data:', sampleNotification);
      
      // Check if fields match what the app expects
      const expectedFields = ['id', 'user_id', 'from_user_id', 'type', 'chirp_id', 'read', 'created_at'];
      const actualFields = Object.keys(sampleNotification);
      
      console.log('🔍 Field comparison:');
      expectedFields.forEach(field => {
        const exists = actualFields.includes(field);
        console.log(`${exists ? '✅' : '❌'} ${field}: ${exists ? 'exists' : 'missing'}`);
      });
    }
    
    // Step 6: Test RLS policies
    console.log('\n🔒 Testing RLS policies...');
    const { data: rlsTest, error: rlsError } = await supabase
      .from('notifications')
      .select('id, user_id, type, read')
      .eq('user_id', user.id)
      .limit(1);
    
    if (rlsError) {
      console.error('❌ RLS test error:', rlsError);
    } else {
      console.log('✅ RLS test success:', rlsTest?.length || 0, 'notifications accessible');
    }
    
    // Step 7: Test notification settings
    console.log('\n⚙️ Testing notification settings...');
    const { data: settings, error: settingsError } = await supabase
      .from('notification_settings')
      .select('*')
      .eq('user_id', user.id);
    
    if (settingsError) {
      console.error('❌ Settings error:', settingsError);
    } else {
      console.log('✅ Settings query success:', settings?.length || 0, 'settings found');
      console.log('📋 Settings:', settings);
    }
    
    // Step 8: Test real-time subscription
    console.log('\n📡 Testing real-time subscription...');
    try {
      const subscription = supabase
        .channel('notifications')
        .on('postgres_changes', 
          { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'notifications',
            filter: `user_id=eq.${user.id}`
          }, 
          (payload) => {
            console.log('📡 Real-time notification received:', payload);
          }
        )
        .subscribe();
      
      console.log('✅ Real-time subscription started');
      
      // Clean up after 5 seconds
      setTimeout(() => {
        subscription.unsubscribe();
        console.log('📡 Real-time subscription stopped');
      }, 5000);
      
    } catch (realtimeError) {
      console.error('❌ Real-time error:', realtimeError);
    }
    
    // Step 9: Summary and recommendations
    console.log('\n📊 Summary and Recommendations:');
    console.log('================================');
    
    if (directNotifications && directNotifications.length > 0) {
      console.log('✅ Notifications exist in database');
      console.log('✅ Direct query works');
      
      if (relationshipError) {
        console.log('❌ Relationship query fails - this might be the issue');
        console.log('💡 Try using the simple query without relationships');
      }
      
      if (serviceError) {
        console.log('❌ Notification service fails');
        console.log('💡 Check the notification service implementation');
      }
      
    } else {
      console.log('❌ No notifications found for this user');
      console.log('💡 Check if notifications were created for the correct user ID');
    }
    
  } catch (error) {
    console.error('❌ Debug error:', error);
  }
}

// Run the debug function
debugNotificationFetching();
