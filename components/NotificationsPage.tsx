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
      if (!user?.id) return;

      setIsLoading(true);
      const fetchedNotifications = await notificationService.getNotifications(user.id);
      setNotifications(fetchedNotifications);
      
      // Count unread notifications
      const unread = fetchedNotifications.filter(n => !n.is_read).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('❌ Error loading notifications:', error);
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
      if (notification.is_read) return;

      await notificationService.markAsRead(notification.id);
      
      // Update local state
      setNotifications(prev => 
        prev.map(n => 
          n.id === notification.id 
            ? { ...n, is_read: true }
            : n
        )
      );
      
      setUnreadCount(prev => Math.max(0, prev - 1));
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
        prev.map(n => ({ ...n, is_read: true }))
      );
      
      setUnreadCount(0);
    } catch (error) {
      console.error('❌ Error marking all notifications as read:', error);
      Alert.alert('Error', 'Failed to mark all notifications as read');
    }
  }, [user?.id]);

  const handleNotificationPress = useCallback(async (notification: Notification) => {
    try {
      // Mark as read
      await markAsRead(notification);

      // Navigate based on notification type
      switch (notification.type) {
        case 'like':
        case 'comment':
          if (notification.chirpId) {
            router.push(`/chirp/${notification.chirpId}`);
          }
          break;
        case 'follow':
          if (notification.actorId) {
            router.push(`/profile/${notification.actorId}`);
          }
          break;
        case 'mention':
          if (notification.chirpId) {
            router.push(`/chirp/${notification.chirpId}`);
          }
          break;
        default:
          console.log('Unknown notification type:', notification.type);
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
    const now = new Date();
    const date = new Date(dateString);
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
        !notification.is_read && styles.unreadNotification,
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
            {!notification.is_read && <View style={styles.unreadDot} />}
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
    if (!user?.id) return;

    // Subscribe to real-time notifications
    notificationService.subscribeToNotifications(user.id, (newNotification) => {
      setNotifications(prev => [newNotification, ...prev]);
      setUnreadCount(prev => prev + 1);
    });

    return () => {
      notificationService.unsubscribeFromNotifications();
    };
  }, [user?.id]);

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