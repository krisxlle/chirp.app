// services/notificationService.ts
import { supabase } from '../mobile-db-supabase';
import type {
    Notification,
    NotificationAction,
    NotificationCounts,
    NotificationSettings
} from '../types/notifications';

class NotificationService {
  private realtimeSubscription: any = null;
  private currentUserId: string | null = null;

  // Clear all cached data when user changes
  clearUserData(): void {
    console.log('🧹 Clearing notification service user data');
    this.currentUserId = null;
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

  async getNotifications(userId: string, limit: number = 50): Promise<Notification[]> {
    try {
      console.log('🔔 Fetching notifications for user:', userId);
      
      // Set current user and clear previous data if different
      this.setCurrentUser(userId);

      // Use simple query first (more reliable)
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
      const transformedNotifications = await Promise.all((simpleData || []).map(async (notification) => {
        // Fetch actor user data if from_user_id exists
        let actor = null;
        if (notification.from_user_id) {
          try {
            const { data: actorData, error: actorError } = await supabase
              .from('users')
              .select('id, first_name, last_name, custom_handle, handle, profile_image_url')
              .eq('id', notification.from_user_id)
              .single();
            
            if (!actorError && actorData) {
              actor = {
                id: actorData.id,
                firstName: actorData.first_name || 'User',
                lastName: actorData.last_name || '',
                customHandle: actorData.custom_handle || actorData.handle,
                handle: actorData.handle,
                profileImageUrl: actorData.profile_image_url,
                avatarUrl: actorData.profile_image_url
              };
            }
          } catch (error) {
            console.error('Error fetching actor data:', error);
          }
        }

        return {
          id: notification.id.toString(),
          user_id: notification.user_id,
          from_user_id: notification.from_user_id,
          type: notification.type,
          chirp_id: notification.chirp_id?.toString(),
          read: notification.read,
          createdAt: notification.created_at,
          actor: actor,
          chirp: null
        };
      }));

      return transformedNotifications;
    } catch (error) {
      console.error('❌ Error fetching notifications:', error);
      return [];
    }
  }

  async markAsRead(notificationId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ 
          read: true
        })
        .eq('id', notificationId);

      if (error) {
        console.error('❌ Error marking notification as read:', error);
        return false;
      }

      console.log('✅ Notification marked as read:', notificationId);
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
          read: true,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('read', false);

      if (error) {
        console.error('❌ Error marking all notifications as read:', error);
        return false;
      }

      console.log('✅ All notifications marked as read for user:', userId);
      return true;
    } catch (error) {
      console.error('❌ Error marking all notifications as read:', error);
      return false;
    }
  }

  async getNotificationCounts(userId: string): Promise<NotificationCounts> {
    try {
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
          userId,
          likesEnabled: true,
          commentsEnabled: true,
          followsEnabled: true,
          mentionsEnabled: true,
          pushEnabled: true,
          emailEnabled: false,
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
          ...settings,
          updated_at: new Date().toISOString(),
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
      await supabase
        .from('notifications')
        .update({ updated_at: new Date().toISOString() })
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
