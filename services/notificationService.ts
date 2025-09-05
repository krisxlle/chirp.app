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
        is_read: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Add optional columns if they exist
      if (action.actorId) {
        notificationData.actor_id = action.actorId;
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

      // First try the full query with relationships
      const { data, error } = await supabase
        .from('notifications')
        .select(`
          *,
          actor:actor_id (
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
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('❌ Error fetching notifications with relationships:', error);
        
        // If the relationship query fails, try a simple query without relationships
        console.log('🔄 Trying simple query without relationships...');
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
        return simpleData || [];
      }

      console.log('✅ Fetched notifications:', data?.length || 0);
      return data || [];
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
          is_read: true,
          updated_at: new Date().toISOString()
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
          is_read: true,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('is_read', false);

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
        .select('type, is_read')
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
        unread: data.filter(n => !n.is_read).length,
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
        .eq('actor_id', action.actorId)
        .eq('type', action.type)
        .eq('chirp_id', action.chirpId || null)
        .eq('is_read', false)
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
        return settings.likesEnabled;
      case 'comment':
        return settings.commentsEnabled;
      case 'follow':
        return settings.followsEnabled;
      case 'mention':
        return settings.mentionsEnabled;
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
