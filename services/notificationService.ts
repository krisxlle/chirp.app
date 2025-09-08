// services/notificationService.ts
import { supabase } from '../lib/database/mobile-db-supabase';
import type {
    Notification,
    NotificationAction,
    NotificationCounts,
    NotificationSettings
} from '../types/notifications';

class NotificationService {
  private realtimeSubscription: any = null;
  private currentUserId: string | null = null;
  
  // Performance optimization: Cache for notifications
  private notificationsCache = new Map<string, { data: Notification[], timestamp: number, ttl: number }>();
  private countsCache = new Map<string, { data: NotificationCounts, timestamp: number, ttl: number }>();
  private readonly NOTIFICATIONS_CACHE_TTL = 30000; // 30 seconds
  private readonly COUNTS_CACHE_TTL = 60000; // 60 seconds

  // Cache invalidation methods
  clearNotificationsCache(userId: string): void {
    const keysToDelete = Array.from(this.notificationsCache.keys()).filter(key => key.startsWith(`notifications_${userId}_`));
    keysToDelete.forEach(key => this.notificationsCache.delete(key));
    console.log('🗑️ Cleared notifications cache for user:', userId);
  }

  clearCountsCache(userId: string): void {
    this.countsCache.delete(`counts_${userId}`);
    console.log('🗑️ Cleared counts cache for user:', userId);
  }

  // Clear all caches for a user
  clearUserCaches(userId: string): void {
    this.clearNotificationsCache(userId);
    this.clearCountsCache(userId);
  }

  // Clear all cached data when user changes
  clearUserData(): void {
    console.log('🧹 Clearing notification service user data');
    this.currentUserId = null;
    this.notificationsCache.clear();
    this.countsCache.clear();
    this.unsubscribeFromNotifications();
  }

  // Set current user and clear previous data if different
  setCurrentUser(userId: string): void {
    if (this.currentUserId !== userId) {
      console.log('🔄 User changed in notification service:', this.currentUserId, '->', userId);
      this.clearUserData();
      this.currentUserId = userId;
    }
  }

  async createNotification(action: NotificationAction): Promise<boolean> {
    try {
      console.log('🔔 Creating notification:', action);

      // Check if user has notifications enabled for this type
      const settings = await this.getNotificationSettings(action.targetUserId);
      if (!this.isNotificationTypeEnabled(action.type, settings)) {
        console.log('🔔 Notifications disabled for type:', action.type);
        return false;
      }

      // Don't create notification if user is acting on their own content
      if (action.actorId === action.targetUserId) {
        console.log('🔔 Skipping self-notification');
        return false;
      }

      // Check if notification already exists (prevent duplicates)
      const existingNotification = await this.checkExistingNotification(action);
      if (existingNotification) {
        console.log('🔔 Notification already exists, updating timestamp');
        await this.updateNotificationTimestamp(existingNotification.id);
        return true;
      }

      // Create new notification with fallback for missing columns
      const notificationData: any = {
        user_id: action.targetUserId,
        read: false,
        created_at: new Date().toISOString(),
      };

      // Add optional columns if they exist
      if (action.actorId) {
        notificationData.from_user_id = action.actorId;
      }
      if (action.type) {
        notificationData.type = action.type;
      }
      if (action.chirpId) {
        notificationData.chirp_id = action.chirpId;
      }
      if (action.commentId) {
        notificationData.comment_id = action.commentId;
      }

      const { data, error } = await supabase
        .from('notifications')
        .insert(notificationData)
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating notification:', error);
        return false;
      }

      console.log('✅ Notification created:', data.id);
      return true;
    } catch (error) {
      console.error('❌ Error creating notification:', error);
      return false;
    }
  }

  async getNotifications(userId: string, limit: number = 20, offset: number = 0): Promise<Notification[]> {
    try {
      console.log('🔔 Fetching notifications for user:', userId, 'limit:', limit, 'offset:', offset);
      
      // Set current user and clear previous data if different
      this.setCurrentUser(userId);

      // Check cache first
      const cacheKey = `notifications_${userId}_${limit}_${offset}`;
      const cached = this.notificationsCache.get(cacheKey);
      if (cached && (Date.now() - cached.timestamp) < cached.ttl) {
        console.log('✅ Returning cached notifications');
        return cached.data;
      }

      // Add timeout wrapper to prevent hanging queries
      const queryPromise = this.fetchNotificationsWithTimeout(userId, limit, offset);
      const timeoutPromise = new Promise<Notification[]>((_, reject) => 
        setTimeout(() => reject(new Error('Query timeout')), 10000) // 10 second timeout
      );

      const transformedNotifications = await Promise.race([queryPromise, timeoutPromise]);

      // Cache the result
      this.notificationsCache.set(cacheKey, { 
        data: transformedNotifications, 
        timestamp: Date.now(), 
        ttl: this.NOTIFICATIONS_CACHE_TTL 
      });

      return transformedNotifications;
    } catch (error) {
      console.error('❌ Error fetching notifications:', error);
      return [];
    }
  }

  private async fetchNotificationsWithTimeout(userId: string, limit: number, offset: number): Promise<Notification[]> {
    // Use simplified query without complex joins to avoid timeout
    console.log('🔄 Using simplified query to avoid timeout...');
    const { data: notificationsData, error } = await supabase
      .from('notifications')
      .select(`
        id,
        user_id,
        from_user_id,
        type,
        chirp_id,
        read,
        created_at
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)
      .limit(limit); // Add explicit limit as backup

    if (error) {
      console.error('❌ Error fetching notifications:', error);
      return [];
    }

    console.log('✅ Fetched notifications (simplified query):', notificationsData?.length || 0);
    
    // Get user IDs for batch fetching
    const fromUserIds = [...new Set((notificationsData || [])
      .map(n => n.from_user_id)
      .filter(id => id))];
    
    // Batch fetch user data separately to avoid complex joins
    let usersMap = new Map();
    if (fromUserIds.length > 0) {
      console.log('🔄 Batch fetching user data for:', fromUserIds.length, 'users');
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select(`
          id,
          first_name,
          last_name,
          custom_handle,
          handle,
          profile_image_url
        `)
        .in('id', fromUserIds);
        
      if (!usersError && usersData) {
        usersMap = new Map(usersData.map(user => [user.id, user]));
      }
    }
    
    // Transform the data efficiently
    const transformedNotifications: Notification[] = (notificationsData || []).map((notification: any) => {
      const userData = usersMap.get(notification.from_user_id);
      const actor = userData ? {
        id: userData.id,
        firstName: userData.first_name || 'User',
        lastName: userData.last_name || '',
        customHandle: userData.custom_handle || userData.handle,
        handle: userData.handle,
        profileImageUrl: userData.profile_image_url,
        avatarUrl: userData.profile_image_url
      } : null;

      return {
        id: notification.id.toString(),
        user_id: notification.user_id,
        from_user_id: notification.from_user_id,
        type: notification.type,
        chirp_id: notification.chirp_id?.toString(),
        read: notification.read,
        created_at: notification.created_at,
        actor: actor,
        chirp: null
      };
    });

    return transformedNotifications;
  }

  async markAsRead(notificationId: string): Promise<boolean> {
    try {
      // Validate notificationId is a string
      if (typeof notificationId !== 'string') {
        console.error('❌ Invalid notificationId type:', typeof notificationId, notificationId);
        return false;
      }

      const { error } = await supabase
        .from('notifications')
        .update({ 
          read: true
        })
        .eq('id', notificationId);

      if (error) {
        console.error('❌ Error marking notification as read:', error);
        
        // Handle specific error cases
        if (error.code === '22P02') {
          console.log('🔄 Invalid notification ID format, skipping');
          return false;
        }
        
        return false;
      }

      console.log('✅ Notification marked as read:', notificationId);
      
      // Invalidate cache for current user
      if (this.currentUserId) {
        this.clearUserCaches(this.currentUserId);
      }
      
      return true;
    } catch (error) {
      console.error('❌ Error marking notification as read:', error);
      return false;
    }
  }

  async markAllAsRead(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ 
          read: true
        })
        .eq('user_id', userId)
        .eq('read', false);

      if (error) {
        console.error('❌ Error marking all notifications as read:', error);
        return false;
      }

      console.log('✅ All notifications marked as read for user:', userId);
      
      // Invalidate cache for user
      this.clearUserCaches(userId);
      
      return true;
    } catch (error) {
      console.error('❌ Error marking all notifications as read:', error);
      return false;
    }
  }

  async getNotificationCounts(userId: string): Promise<NotificationCounts> {
    try {
      // Check cache first
      const cacheKey = `counts_${userId}`;
      const cached = this.countsCache.get(cacheKey);
      if (cached && (Date.now() - cached.timestamp) < cached.ttl) {
        console.log('✅ Returning cached notification counts');
        return cached.data;
      }

      const { data, error } = await supabase
        .from('notifications')
        .select('type, read')
        .eq('user_id', userId);

      if (error) {
        console.error('❌ Error fetching notification counts:', error);
        return {
          total: 0,
          unread: 0,
          likes: 0,
          comments: 0,
          follows: 0,
          mentions: 0,
        };
      }

      const counts: NotificationCounts = {
        total: data.length,
        unread: data.filter(n => !n.read).length,
        likes: data.filter(n => n.type === 'like').length,
        comments: data.filter(n => n.type === 'comment').length,
        follows: data.filter(n => n.type === 'follow').length,
        mentions: data.filter(n => n.type === 'mention').length,
      };

      // Cache the result
      this.countsCache.set(cacheKey, { 
        data: counts, 
        timestamp: Date.now(), 
        ttl: this.COUNTS_CACHE_TTL 
      });

      return counts;
    } catch (error) {
      console.error('❌ Error fetching notification counts:', error);
      return {
        total: 0,
        unread: 0,
        likes: 0,
        comments: 0,
        follows: 0,
        mentions: 0,
      };
    }
  }

  async getNotificationSettings(userId: string): Promise<NotificationSettings | null> {
    try {
      const { data, error } = await supabase
        .from('notification_settings')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.log('⚠️ No notification settings found, using defaults');
        return {
          user_id: userId,
          likes_enabled: true,
          comments_enabled: true,
          follows_enabled: true,
          mentions_enabled: true,
          push_enabled: true,
          email_enabled: false,
        };
      }

      return data;
    } catch (error) {
      console.error('❌ Error fetching notification settings:', error);
      return null;
    }
  }

  async updateNotificationSettings(settings: Partial<NotificationSettings>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notification_settings')
        .upsert({
          ...settings
        });

      if (error) {
        console.error('❌ Error updating notification settings:', error);
        return false;
      }

      console.log('✅ Notification settings updated');
      return true;
    } catch (error) {
      console.error('❌ Error updating notification settings:', error);
      return false;
    }
  }

  private async checkExistingNotification(action: NotificationAction): Promise<Notification | null> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', action.targetUserId)
        .eq('from_user_id', action.actorId)
        .eq('type', action.type)
        .eq('chirp_id', action.chirpId || null)
        .eq('read', false)
        .single();

      if (error) {
        return null;
      }

      return data;
    } catch (error) {
      return null;
    }
  }

  private async updateNotificationTimestamp(notificationId: string): Promise<void> {
    try {
      // Note: updated_at column doesn't exist in notifications table
      // Just update the created_at timestamp instead
      await supabase
        .from('notifications')
        .update({ created_at: new Date().toISOString() })
        .eq('id', notificationId);
    } catch (error) {
      console.error('❌ Error updating notification timestamp:', error);
    }
  }

  private isNotificationTypeEnabled(type: string, settings: NotificationSettings | null): boolean {
    if (!settings) return true;

    switch (type) {
      case 'like':
        return settings.likes_enabled;
      case 'comment':
        return settings.comments_enabled;
      case 'follow':
        return settings.follows_enabled;
      case 'mention':
        return settings.mentions_enabled;
      default:
        return true;
    }
  }

  // Real-time subscription for live notifications
  subscribeToNotifications(userId: string, callback: (notification: Notification) => void): void {
    try {
      this.realtimeSubscription = supabase
        .channel('notifications')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${userId}`,
          },
          (payload) => {
            console.log('🔔 Real-time notification received:', payload);
            callback(payload.new as Notification);
          }
        )
        .subscribe();

      console.log('✅ Subscribed to real-time notifications');
    } catch (error) {
      console.error('❌ Error subscribing to notifications:', error);
    }
  }

  unsubscribeFromNotifications(): void {
    if (this.realtimeSubscription) {
      supabase.removeChannel(this.realtimeSubscription);
      this.realtimeSubscription = null;
      console.log('✅ Unsubscribed from real-time notifications');
    }
  }

  // Helper methods for creating specific notification types
  async createLikeNotification(actorId: string, chirpId: string): Promise<boolean> {
    try {
      // Get chirp author
      const { data: chirp, error } = await supabase
        .from('chirps')
        .select('author_id')
        .eq('id', chirpId)
        .single();

      if (error || !chirp) {
        console.error('❌ Error fetching chirp for like notification:', error);
        return false;
      }

      return this.createNotification({
        type: 'like',
        actorId,
        targetUserId: chirp.author_id,
        chirpId,
      });
    } catch (error) {
      console.error('❌ Error creating like notification:', error);
      return false;
    }
  }

  async createCommentNotification(actorId: string, chirpId: string): Promise<boolean> {
    try {
      // Get chirp author
      const { data: chirp, error } = await supabase
        .from('chirps')
        .select('author_id')
        .eq('id', chirpId)
        .single();

      if (error || !chirp) {
        console.error('❌ Error fetching chirp for comment notification:', error);
        return false;
      }

      return this.createNotification({
        type: 'comment',
        actorId,
        targetUserId: chirp.author_id,
        chirpId,
      });
    } catch (error) {
      console.error('❌ Error creating comment notification:', error);
      return false;
    }
  }

  async createFollowNotification(actorId: string, targetUserId: string): Promise<boolean> {
    return this.createNotification({
      type: 'follow',
      actorId,
      targetUserId,
    });
  }
}

export const notificationService = new NotificationService();
export default notificationService;
