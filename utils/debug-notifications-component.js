// Simple notification test for your app
// Add this to your NotificationsPage component temporarily to debug

// Add this function to your NotificationsPage component
const debugNotifications = async () => {
  try {
    console.log('🔍 Debug: Starting notification debug...');
    console.log('🔍 Debug: User ID:', user?.id);
    
    if (!user?.id) {
      console.log('❌ Debug: No user ID');
      return;
    }
    
    // Test 1: Direct Supabase query
    console.log('🔍 Debug: Testing direct Supabase query...');
    const { data: directData, error: directError } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    console.log('🔍 Debug: Direct query result:', directData?.length || 0, 'notifications');
    console.log('🔍 Debug: Direct query error:', directError);
    console.log('🔍 Debug: Direct data:', directData);
    
    // Test 2: Notification service
    console.log('🔍 Debug: Testing notification service...');
    const serviceData = await notificationService.getNotifications(user.id);
    console.log('🔍 Debug: Service result:', serviceData?.length || 0, 'notifications');
    console.log('🔍 Debug: Service data summary:', {
      count: serviceData?.length || 0,
      firstId: serviceData?.[0]?.id,
      hasActor: !!serviceData?.[0]?.actor
    });
    
    // Test 3: Check field mappings
    if (directData && directData.length > 0) {
      console.log('🔍 Debug: Sample notification fields:', Object.keys(directData[0]));
      console.log('🔍 Debug: Sample notification data (truncated):', {
        id: directData[0].id,
        type: directData[0].type,
        chirp_id: directData[0].chirp_id,
        from_user_id: directData[0].from_user_id,
        read: directData[0].read,
        created_at: directData[0].created_at
      });
      
      // Check if the notification has the expected structure
      const sample = directData[0];
      console.log('🔍 Debug: Field checks:');
      console.log('  - id:', sample.id, typeof sample.id);
      console.log('  - user_id:', sample.user_id, typeof sample.user_id);
      console.log('  - from_user_id:', sample.from_user_id, typeof sample.from_user_id);
      console.log('  - type:', sample.type, typeof sample.type);
      console.log('  - read:', sample.read, typeof sample.read);
      console.log('  - created_at:', sample.created_at, typeof sample.created_at);
    }
    
    // Test 4: Check if notifications match current user
    console.log('🔍 Debug: Checking user ID match...');
    const userNotifications = directData?.filter(n => n.user_id === user.id) || [];
    console.log('🔍 Debug: Notifications for current user:', userNotifications.length);
    
    // Test 5: Check notification types
    if (directData && directData.length > 0) {
      const types = directData.map(n => n.type);
      console.log('🔍 Debug: Notification types found:', [...new Set(types)]);
    }
    
  } catch (error) {
    console.error('❌ Debug error:', error);
  }
};

// Call this function in your NotificationsPage component
// You can add a debug button or call it in useEffect
