// components/NotificationsPage.tsx
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../mobile-db-supabase';
import { notificationService } from '../services/notificationService';
import type { Notification } from '../types/notifications';
import { useAuth } from './AuthContext';
import UserAvatar from './UserAvatar';

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadNotifications = useCallback(async () => {
    try {
      console.log('=== NOTIFICATION DEBUG START ===');
      console.log('User exists:', !!user);
      console.log('User ID:', user?.id);
      
      if (!user?.id) {
        console.log('No user ID, returning early');
        return;
      }

      console.log('Starting notification load...');
      setIsLoading(true);
      
      // Test direct query first
      console.log('Testing direct Supabase query...');
      const { data: directNotifications, error: directError } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      console.log('Direct query completed');
      console.log('Direct notifications count:', directNotifications?.length || 0);
      console.log('Direct query error:', directError);
      
      if (directNotifications && directNotifications.length > 0) {
        const sample = directNotifications[0];
        console.log('Sample notification:', {
          id: sample.id,
          type: sample.type,
          chirp_id: sample.chirp_id,
          from_user_id: sample.from_user_id,
          read: sample.read
        });
      }
      
      // Test notification service
      console.log('Testing notification service...');
      const fetchedNotifications = await notificationService.getNotifications(user.id);
      console.log('Service completed');
      console.log('Service notifications count:', fetchedNotifications?.length || 0);
      
      if (fetchedNotifications && fetchedNotifications.length > 0) {
        const sample = fetchedNotifications[0];
        console.log('Sample service notification:', {
          id: sample.id,
          type: sample.type,
          chirp_id: sample.chirp_id,
          from_user_id: sample.from_user_id,
          read: sample.read,
          actor: sample.actor ? {
            id: sample.actor.id,
            customHandle: sample.actor.customHandle,
            handle: sample.actor.handle
          } : null
        });
      }
      
      setNotifications(fetchedNotifications);
      
      // Count unread notifications
      const unread = fetchedNotifications.filter(n => !n.read).length;
      setUnreadCount(unread);
      
      console.log('Final state:');
      console.log('- Notifications set:', fetchedNotifications?.length || 0);
      console.log('- Unread count:', unread);
      console.log('=== NOTIFICATION DEBUG END ===');
      
    } catch (error) {
      console.error('Error in loadNotifications:', error);
      Alert.alert('Error', 'Failed to load notifications');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  const refreshNotifications = useCallback(async () => {
    try {
      setIsRefreshing(true);
      await loadNotifications();
    } finally {
      setIsRefreshing(false);
    }
  }, [loadNotifications]);

  const markAsRead = useCallback(async (notification: Notification) => {
    try {
      if (notification.read) {
        console.log('📖 Notification already read, skipping');
        return;
      }

      console.log('📖 Marking notification as read:', notification.id);
      await notificationService.markAsRead(notification.id);
      
      // Update local state
      setNotifications(prev => 
        prev.map(n => 
          n.id === notification.id 
            ? { ...n, read: true }
            : n
        )
      );
      
      // Update unread count
      setUnreadCount(prev => {
        const newCount = Math.max(0, prev - 1);
        console.log('📊 Updated unread count:', prev, '->', newCount);
        return newCount;
      });
      
    } catch (error) {
      console.error('❌ Error marking notification as read:', error);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      if (!user?.id) return;

      await notificationService.markAllAsRead(user.id);
      
      // Update local state
      setNotifications(prev => 
        prev.map(n => ({ ...n, read: true }))
      );
      
      setUnreadCount(0);
    } catch (error) {
      console.error('❌ Error marking all notifications as read:', error);
      Alert.alert('Error', 'Failed to mark all notifications as read');
    }
  }, [user?.id]);

  const handleNotificationPress = useCallback(async (notification: Notification) => {
    try {
      console.log('🔔 Notification pressed:', notification.type);
      console.log('🔔 Notification data (truncated):', {
        id: notification.id,
        type: notification.type,
        chirp_id: notification.chirp_id,
        from_user_id: notification.from_user_id,
        read: notification.read,
        actor: notification.actor ? {
          id: notification.actor.id,
          customHandle: notification.actor.customHandle,
          handle: notification.actor.handle
        } : null
      });
      
      // Mark as read
      await markAsRead(notification);

      // Navigate based on notification type
      switch (notification.type) {
        case 'like':
        case 'comment':
          if (notification.chirp_id) {
            console.log('📍 Navigating to chirp:', notification.chirp_id, 'Type:', typeof notification.chirp_id);
            router.push(`/chirp/${notification.chirp_id}`);
          } else {
            console.log('⚠️ No chirp_id for like/comment notification');
            console.log('⚠️ Available fields:', Object.keys(notification));
            // Fallback: navigate to actor's profile if no chirp_id
            if (notification.from_user_id) {
              console.log('📍 Fallback: Navigating to actor profile:', notification.from_user_id);
              router.push(`/profile/${notification.from_user_id}`);
            } else {
              console.log('❌ No fallback navigation available');
            }
          }
          break;
        case 'follow':
          if (notification.from_user_id) {
            console.log('📍 Navigating to profile:', notification.from_user_id);
            router.push(`/profile/${notification.from_user_id}`);
          } else {
            console.log('⚠️ No from_user_id for follow notification');
          }
          break;
        case 'mention':
          if (notification.chirp_id) {
            console.log('📍 Navigating to mentioned chirp:', notification.chirp_id);
            router.push(`/chirp/${notification.chirp_id}`);
          } else {
            console.log('⚠️ No chirp_id for mention notification');
          }
          break;
        default:
          console.log('❓ Unknown notification type:', notification.type);
      }
    } catch (error) {
      console.error('❌ Error handling notification press:', error);
    }
  }, [markAsRead]);

  const getNotificationText = useCallback((notification: Notification): string => {
    const actorName = notification.actor?.customHandle || notification.actor?.handle || 'Someone';
    
    switch (notification.type) {
      case 'like':
        return `${actorName} liked your chirp`;
      case 'comment':
        return `${actorName} commented on your chirp`;
      case 'follow':
        return `${actorName} started following you`;
      case 'mention':
        return `${actorName} mentioned you`;
      default:
        return 'New notification';
    }
  }, []);

  const getNotificationIcon = useCallback((type: string): string => {
    switch (type) {
      case 'like':
        return '❤️';
      case 'comment':
        return '💬';
      case 'follow':
        return '👤';
      case 'mention':
        return '@';
      default:
        return '🔔';
    }
  }, []);

  const formatTimeAgo = useCallback((dateString: string): string => {
    if (!dateString) {
      return 'now';
    }
    
    const now = new Date();
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'now';
    }
    
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes}m`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours}h`;
    } else if (diffInSeconds < 2592000) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days}d`;
    } else {
      const months = Math.floor(diffInSeconds / 2592000);
      return `${months}mo`;
    }
  }, []);

  const renderNotification = useCallback(({ item: notification }: { item: Notification }) => (
    <TouchableOpacity
      style={[
        styles.notificationItem,
        !notification.read && styles.unreadNotification,
      ]}
      onPress={() => handleNotificationPress(notification)}
      activeOpacity={0.7}
    >
      <View style={styles.notificationContent}>
        <View style={styles.notificationHeader}>
          <UserAvatar
            user={notification.actor}
            size={40}
            style={styles.avatar}
          />
          <View style={styles.notificationText}>
            <Text style={styles.notificationMessage}>
              {getNotificationText(notification)}
            </Text>
            <Text style={styles.notificationTime}>
              {formatTimeAgo(notification.createdAt)}
            </Text>
          </View>
          <View style={styles.notificationIcon}>
            <Text style={styles.iconText}>
              {getNotificationIcon(notification.type)}
            </Text>
            {!notification.read && <View style={styles.unreadDot} />}
          </View>
        </View>
        
        {notification.chirp && (
          <View style={styles.chirpPreview}>
            <Text style={styles.chirpText} numberOfLines={2}>
              {notification.chirp.content}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  ), [handleNotificationPress, getNotificationText, getNotificationIcon, formatTimeAgo]);

  const renderEmptyState = useCallback(() => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>🔔</Text>
      <Text style={styles.emptyTitle}>No notifications yet</Text>
      <Text style={styles.emptySubtext}>
        You'll see notifications when someone likes, comments, or follows you
      </Text>
    </View>
  ), []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  useEffect(() => {
    if (!user?.id) {
      // Clear notifications when no user
      setNotifications([]);
      setUnreadCount(0);
      notificationService.clearUserData();
      return;
    }

    console.log('🔄 User changed, reloading notifications for:', user.id);
    
    // Clear previous notifications immediately when user changes
    setNotifications([]);
    setUnreadCount(0);
    
    // Clear notification service data for previous user
    notificationService.clearUserData();
    
    // Load notifications for new user
    loadNotifications();

    // Subscribe to real-time notifications
    notificationService.subscribeToNotifications(user.id, (newNotification) => {
      setNotifications(prev => [newNotification, ...prev]);
      setUnreadCount(prev => prev + 1);
    });

    return () => {
      notificationService.unsubscribeFromNotifications();
    };
  }, [user?.id, loadNotifications]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7c3aed" />
          <Text style={styles.loadingText}>Loading notifications...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notifications</Text>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={markAllAsRead} style={styles.markAllButton}>
            <Text style={styles.markAllText}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refreshNotifications}
            colors={['#7c3aed', '#ec4899']}
            tintColor="#7c3aed"
          />
        }
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#657786',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E1E8ED',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#14171A',
  },
  markAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#7c3aed',
    borderRadius: 16,
  },
  markAllText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  listContainer: {
    flexGrow: 1,
  },
  notificationItem: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F7F9FA',
  },
  unreadNotification: {
    backgroundColor: '#F0F4FF',
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatar: {
    marginRight: 12,
  },
  notificationText: {
    flex: 1,
    marginRight: 12,
  },
  notificationMessage: {
    fontSize: 16,
    color: '#14171A',
    lineHeight: 22,
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 14,
    color: '#657786',
  },
  notificationIcon: {
    alignItems: 'center',
    position: 'relative',
  },
  iconText: {
    fontSize: 20,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#7c3aed',
    marginTop: 4,
  },
  chirpPreview: {
    marginTop: 12,
    marginLeft: 52,
    padding: 12,
    backgroundColor: '#F7F9FA',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#7c3aed',
  },
  chirpText: {
    fontSize: 14,
    color: '#657786',
    lineHeight: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#14171A',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 16,
    color: '#657786',
    textAlign: 'center',
    lineHeight: 24,
  },
});