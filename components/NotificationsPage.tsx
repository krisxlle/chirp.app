import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import UserAvatar from './UserAvatar';
import HeartIcon from './icons/HeartIcon';
import MentionIcon from './icons/MentionIcon';
import FollowIcon from './icons/FollowIcon';
import { useAuth } from './AuthContext';
import { getNotifications, markNotificationAsRead } from '../mobile-db';

interface Notification {
  id: string;
  type: 'reaction' | 'mention' | 'follow' | 'reply' | 'mention_bio' | 'repost' | 'weekly_summary';
  user: {
    id: string;
    name: string;
    handle: string;
    email: string;
    profileImageUrl?: string;
  };
  content?: string;
  timestamp: string;
  isRead: boolean;
  chirpId?: number;
  fromUserId?: string;
}

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, [user]);

  const fetchNotifications = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const dbNotifications = await getNotifications(user.id);
      
      // Convert database notifications to component format
      const formattedNotifications: Notification[] = dbNotifications.map((notif: any) => ({
        id: notif.id.toString(),
        type: notif.type,
        user: {
          id: notif.fromUser?.id || '',
          name: notif.fromUser ? `${notif.fromUser.first_name || ''} ${notif.fromUser.last_name || ''}`.trim() || notif.fromUser.custom_handle || notif.fromUser.handle : 'Unknown User',
          handle: notif.fromUser?.custom_handle || notif.fromUser?.handle || '',
          email: notif.fromUser?.email || '',
          profileImageUrl: notif.fromUser?.profile_image_url || undefined,
        },
        content: notif.chirp?.content,
        timestamp: formatTimeAgo(notif.createdAt),
        isRead: notif.read,
        chirpId: notif.chirpId,
        fromUserId: notif.fromUserId,
      }));
      
      setNotifications(formattedNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      Alert.alert('Error', 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handleNotificationPress = async (notification: Notification) => {
    console.log('🔔🔔🔔 HANDLER CALLED:', notification.type);
    try {
      console.log('🔔 Notification pressed:', {
        type: notification.type,
        fromUserId: notification.fromUserId,
        chirpId: notification.chirpId,
        routerAvailable: !!router
      });

      // Mark notification as read
      if (!notification.isRead) {
        await markNotificationAsRead(Number(notification.id));
        // Update local state
        setNotifications(prev => 
          prev.map(n => n.id === notification.id ? { ...n, isRead: true } : n)
        );
      }

      // Navigate based on notification type
      switch (notification.type) {
        case 'follow':
          // Navigate to the follower's profile
          if (notification.fromUserId) {
            console.log('🔄 Trying to navigate to profile:', notification.fromUserId);
            console.log('🔄 Router object:', router);
            console.log('🔄 Router push function:', typeof router.push);
            
            // Test if basic navigation works first
            console.log('🔄 Testing basic home navigation...');
            router.push('/');
            
            // Then try profile navigation after a small delay
            setTimeout(() => {
              console.log('🔄 Now trying profile navigation...');
              try {
                router.push(`/profile/${notification.fromUserId}`);
                console.log('✅ Profile navigation call completed');
              } catch (navError) {
                console.error('❌ Profile navigation error:', navError);
              }
            }, 100);
          } else {
            console.log('⚠️ No fromUserId, navigating to home');
            router.push('/');
          }
          break;
          
        case 'reaction':
        case 'reply':
        case 'mention':
          // For chirp-related notifications, navigate to specific chirp or user profile
          console.log(`🔄 Processing ${notification.type} notification:`, {
            chirpId: notification.chirpId,
            fromUserId: notification.fromUserId
          });
          
          if (notification.chirpId) {
            // If we have a chirp ID, go to home feed (chirp highlighting can be added later)
            console.log(`🔄 Navigating to home for chirp ${notification.chirpId}`);
            router.push('/');
          } else if (notification.fromUserId) {
            // If no chirp ID but we have a user ID, go to their profile
            console.log(`🔄 Navigating to user profile: ${notification.fromUserId}`);
            router.push(`/profile/${notification.fromUserId}`);
          } else {
            // Fallback to home
            console.log(`🔄 Fallback navigation to home`);
            router.push('/');
          }
          break;
          
        case 'mention_bio':
          // Navigate to the user's profile who mentioned them in their bio
          if (notification.fromUserId) {
            console.log('🔄 Navigating to profile that mentioned in bio:', notification.fromUserId);
            try {
              router.push(`/profile/${notification.fromUserId}`);
              console.log('✅ Profile navigation attempted');
            } catch (navError) {
              console.error('❌ Profile navigation failed:', navError);
              router.push('/');
            }
          } else {
            console.log('⚠️ No fromUserId, navigating to home');
            router.push('/');
          }
          break;
          
        case 'repost':
          // Navigate to home feed to see the repost
          console.log('Navigating to home for repost notification');
          router.push('/');
          break;
          
        case 'weekly_summary':
          // Navigate to home feed to see weekly summary
          console.log('Navigating to home for weekly summary');
          router.push('/');
          break;
          
        default:
          // Default to home feed
          console.log('Default navigation to home feed');
          router.push('/');
          break;
      }
    } catch (error) {
      console.error('❌ Error handling notification press:', error);
      console.error('Navigation error details:', {
        notificationType: notification.type,
        fromUserId: notification.fromUserId,
        chirpId: notification.chirpId,
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      });
      Alert.alert('Navigation Error', `Failed to navigate: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const getNotificationText = (notification: Notification) => {
    switch (notification.type) {
      case 'reaction':
        return 'reacted to your chirp';
      case 'mention':
        return 'mentioned you in a chirp';
      case 'mention_bio':
        return 'mentioned you in their bio';
      case 'follow':
        return 'started following you';
      case 'reply':
        return 'replied to your chirp';
      case 'repost':
        return 'reposted your chirp';
      case 'weekly_summary':
        return 'your weekly summary is ready';
      default:
        return 'sent you a notification';
    }
  };

  const getNotificationIcon = (type: string, color: string) => {
    switch (type) {
      case 'reaction':
        return <HeartIcon size={16} color={color} />;
      case 'mention':
        return <MentionIcon size={16} color={color} />;
      case 'follow':
        return <FollowIcon size={16} color={color} />;
      default:
        return null;
    }
  };

  const getNotificationIconColor = (type: string) => {
    switch (type) {
      case 'reaction':
        return '#ef4444'; // red
      case 'mention':
        return '#7c3aed'; // purple
      case 'follow':
        return '#3b82f6'; // blue
      default:
        return '#657786';
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
      </View>

      {/* TEST BUTTON - REMOVE AFTER DEBUGGING */}
      <TouchableOpacity 
        style={{ 
          backgroundColor: 'blue', 
          padding: 20, 
          margin: 10, 
          borderRadius: 10 
        }}
        onPress={() => {
          console.log('🔵 TEST BUTTON CLICKED');
          alert('Test button works!');
          router.push('/profile/45185401');
        }}
      >
        <Text style={{ color: 'white', textAlign: 'center' }}>TEST NAVIGATION</Text>
      </TouchableOpacity>

      {/* Notifications List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7c3aed" />
          <Text style={styles.loadingText}>Loading notifications...</Text>
        </View>
      ) : notifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No notifications yet</Text>
          <Text style={styles.emptySubtext}>When someone interacts with your chirps, you'll see it here</Text>
        </View>
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {notifications.map((notification, index) => (
            <View key={notification.id} style={{ marginHorizontal: 12, marginVertical: 4 }}>
              {/* Simple test for this specific notification */}
              <TouchableOpacity 
                style={{ 
                  backgroundColor: 'green', 
                  padding: 10, 
                  marginBottom: 5,
                  borderRadius: 5
                }}
                onPress={() => {
                  console.log('🟢 SIMPLE TEST CLICKED FOR:', notification.type);
                  alert(`Simple test: ${notification.type}`);
                }}
              >
                <Text style={{ color: 'white' }}>SIMPLE TEST - {notification.type}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.notificationItem, 
                  { 
                    borderWidth: 3, 
                    borderColor: 'red',
                    backgroundColor: 'rgba(255,0,0,0.1)', // Debug background
                    minHeight: 80 // Ensure touchable area
                  }
                ]} 
                onPress={() => {
                  console.log('🚨🚨🚨 NOTIFICATION CLICKED:', notification.type, notification.fromUserId);
                  console.log('🚨🚨🚨 CLICK EVENT FIRED FOR:', notification.id);
                  alert(`Clicked notification: ${notification.type}`); // Visual confirmation
                  handleNotificationPress(notification);
                }}
                activeOpacity={0.5}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
              <View style={styles.notificationContent}>
                {/* User Avatar */}
                <View style={styles.avatarContainer}>
                  <UserAvatar user={notification.user} size="md" />
                </View>

                {/* Notification Text */}
                <View style={styles.textContainer}>
                  <View style={styles.notificationTextRow}>
                    <Text style={styles.notificationText}>
                      <Text style={styles.userName}>{notification.user.name}</Text>
                      <Text style={styles.actionText}> {getNotificationText(notification)}</Text>
                    </Text>
                  </View>

                  {/* Content preview for reactions */}
                  {notification.content && (
                    <Text style={styles.contentPreview}>{notification.content}</Text>
                  )}

                  {/* Timestamp */}
                  <Text style={styles.timestamp}>{notification.timestamp}</Text>
                </View>

                {/* Action Icon */}
                <View style={styles.actionIconContainer}>
                  {getNotificationIcon(notification.type, getNotificationIconColor(notification.type))}
                </View>
              </View>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}
      
      {/* Feedback Button */}
      <TouchableOpacity 
        style={styles.feedbackButtonContainer}
        onPress={() => router.push('/feedback')}
      >
        <LinearGradient
          colors={['#7c3aed', '#ec4899']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.feedbackButton}
        >
          <Text style={styles.feedbackButtonText}>Feedback</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 20, // Reduced top padding to fix spacing issue
    borderBottomWidth: 1,
    borderBottomColor: '#e1e8ed',
    backgroundColor: '#ffffff',
  },
  backButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  backIcon: {
    fontSize: 20,
    color: '#14171a',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#14171a',
  },
  content: {
    flex: 1,
  },
  notificationItem: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    flex: 1,
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatarContainer: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    marginRight: 12,
  },
  notificationTextRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  notificationText: {
    fontSize: 15,
    lineHeight: 20,
    flex: 1,
  },
  userName: {
    fontWeight: '600',
    color: '#14171a',
  },
  actionText: {
    fontWeight: '400',
    color: '#14171a',
  },
  contentPreview: {
    fontSize: 15,
    color: '#657786',
    marginBottom: 4,
    fontStyle: 'italic',
  },
  timestamp: {
    fontSize: 13,
    color: '#657786',
  },
  actionIconContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionIcon: {
    fontSize: 16,
    fontWeight: '600',
  },
  feedbackButtonContainer: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  feedbackButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  feedbackButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#657786',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#14171a',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 16,
    color: '#657786',
    textAlign: 'center',
    lineHeight: 22,
  },
});