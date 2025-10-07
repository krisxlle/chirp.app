// components/NotificationsPage.tsx
import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNotifications } from '../hooks/useNotifications';
import type { Notification } from '../types/notifications';
import { useAuth } from './AuthContext';
import UserAvatar from './UserAvatar';
import ChirpCard from './ChirpCard';
import FollowIcon from './icons/FollowIcon';
import HeartIcon from './icons/HeartIcon';
import MentionIcon from './icons/MentionIcon';
import NotificationIcon from './icons/NotificationIcon';
import ReplyIcon from './icons/ReplyIcon';

export default function NotificationsPage() {
  const { user } = useAuth();
  const {
    notifications,
    counts,
    isLoading,
    isLoadingMore,
    hasMoreNotifications,
    error,
    loadInitialNotifications,
    loadMoreNotifications,
    markAsRead,
    markAllAsRead,
    refreshNotifications,
  } = useNotifications(user?.id);
  
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    if (isRefreshing) return;

    try {
      setIsRefreshing(true);
      await refreshNotifications();
    } catch (error) {
      console.error('❌ Error refreshing notifications:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing, refreshNotifications]);

  




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
          firstName: notification.actor.firstName,
          customHandle: notification.actor.customHandle,
          handle: notification.actor.handle,
          email: notification.actor.email || 'unknown@example.com',
          profileImageUrl: notification.actor.profileImageUrl,
          avatarUrl: notification.actor.avatarUrl
        } : null
      });
      
      // Mark as read (only if not already read)
      if (!notification.read) {
        await markAsRead(notification.id);
      }

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

  const getNotificationIcon = useCallback((type: string) => {
    const iconProps = { size: 20, color: '#657786' };
    
    switch (type) {
      case 'like':
        return <HeartIcon {...iconProps} filled={true} color="#e91e63" />;
      case 'comment':
        return <ReplyIcon {...iconProps} />;
      case 'follow':
        return <FollowIcon {...iconProps} />;
      case 'mention':
        return <MentionIcon {...iconProps} />;
      default:
        return <NotificationIcon {...iconProps} />;
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

  const renderNotification = useCallback(({ item: notification }: { item: Notification }) => {
    return (
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
              size="md"
              style={styles.avatar}
            />
            <View style={styles.notificationText}>
              <Text style={styles.notificationMessage}>
                {getNotificationText(notification)}
              </Text>
              <Text style={styles.notificationTime}>
                {formatTimeAgo(notification.created_at)}
              </Text>
            </View>
            <View style={styles.notificationIcon}>
              {getNotificationIcon(notification.type)}
              {!notification.read && <View style={styles.unreadDot} />}
            </View>
          </View>
          
          {notification.chirp && (
            <View style={styles.chirpPreview}>
              <ChirpCard 
                chirp={notification.chirp}
                onProfilePress={(userId) => router.push(`/profile/${userId}`)}
              />
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  }, [handleNotificationPress, getNotificationText, getNotificationIcon, formatTimeAgo]);

  const renderEmptyState = useCallback(() => (
    <View style={styles.emptyState}>
      <NotificationIcon size={64} color="#657786" />
      <Text style={styles.emptyTitle}>No notifications yet</Text>
      <Text style={styles.emptySubtext}>
        You'll see notifications when someone likes, comments, or follows you
      </Text>
    </View>
  ), []);



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
        {counts.unread > 0 && (
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
            onRefresh={handleRefresh}
            colors={['#7c3aed', '#ec4899']}
            tintColor="#7c3aed"
          />
        }
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        onEndReached={loadMoreNotifications}
        onEndReachedThreshold={0.1}
        ListFooterComponent={() => {
          if (isLoadingMore) {
            return (
              <View style={styles.loadingMoreContainer}>
                <ActivityIndicator size="small" color="#7c3aed" />
                <Text style={styles.loadingMoreText}>Loading more notifications...</Text>
              </View>
            );
          }
          return null;
        }}
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
  // New styles for infinite scroll
  loadingMoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  loadingMoreText: {
    fontSize: 14,
    color: '#657786',
    fontStyle: 'italic',
  },
});