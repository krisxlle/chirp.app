// Fixed notification service method
// Replace the getNotifications method in your notificationService.ts with this

async getNotifications(userId: string, limit: number = 50): Promise<Notification[]> {
  try {
    console.log('🔔 Fetching notifications for user:', userId);

    // Try simple query first (more reliable)
    console.log('🔄 Using simple query without relationships...');
    const { data: simpleData, error: simpleError } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (simpleError) {
      console.error('❌ Error fetching notifications:', simpleError);
      return [];
    }

    console.log('✅ Fetched notifications (simple query):', simpleData?.length || 0);
    
    // Transform the data to match the expected format
    const transformedNotifications = (simpleData || []).map(notification => ({
      id: notification.id.toString(),
      user_id: notification.user_id,
      from_user_id: notification.from_user_id,
      type: notification.type,
      chirp_id: notification.chirp_id?.toString(),
      read: notification.read,
      created_at: notification.created_at,
      // Add empty actor and chirp objects for now
      actor: null,
      chirp: null
    }));

    return transformedNotifications;
  } catch (error) {
    console.error('❌ Error fetching notifications:', error);
    return [];
  }
}
