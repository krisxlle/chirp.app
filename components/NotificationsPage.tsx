import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import UserAvatar from './UserAvatar';
import HeartIcon from './icons/HeartIcon';
import MentionIcon from './icons/MentionIcon';
import FollowIcon from './icons/FollowIcon';

interface Notification {
  id: string;
  type: 'reaction' | 'mention' | 'follow';
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
}

export default function NotificationsPage() {
  // Mock notifications data matching the screenshot
  const notifications: Notification[] = [
    {
      id: '1',
      type: 'reaction',
      user: { id: '1', name: 'Kriselle', handle: 'kr', email: 'kr@example.com', profileImageUrl: undefined },
      content: '"@kriselle please fix me im so buggy"',
      timestamp: '1 day ago',
      isRead: false
    },
    {
      id: '2',
      type: 'reaction',
      user: { id: '1', name: 'Kriselle', handle: 'kr', email: 'kr@example.com', profileImageUrl: undefined },
      content: '"@kriselle please fix me im so buggy"',
      timestamp: '1 day ago',
      isRead: false
    },
    {
      id: '3',
      type: 'reaction',
      user: { id: '1', name: 'Kriselle', handle: 'kr', email: 'kr@example.com', profileImageUrl: undefined },
      content: '"@kriselle please fix me im so buggy"',
      timestamp: '1 day ago',
      isRead: false
    },
    {
      id: '4',
      type: 'reaction',
      user: { id: '1', name: 'Kriselle', handle: 'kr', email: 'kr@example.com', profileImageUrl: undefined },
      content: '"@kriselle please fix me im so buggy"',
      timestamp: '1 day ago',
      isRead: false
    },
    {
      id: '5',
      type: 'mention',
      user: { id: '1', name: 'Kriselle', handle: 'kr', email: 'kr@example.com', profileImageUrl: undefined },
      timestamp: '1 day ago',
      isRead: false
    },
    {
      id: '6',
      type: 'follow',
      user: { id: '1', name: 'Kriselle', handle: 'kr', email: 'kr@example.com', profileImageUrl: undefined },
      timestamp: '2 days ago',
      isRead: false
    },
    {
      id: '7',
      type: 'follow',
      user: { id: '1', name: 'Kriselle', handle: 'kr', email: 'kr@example.com', profileImageUrl: undefined },
      timestamp: '3 days ago',
      isRead: false
    },
    {
      id: '8',
      type: 'mention',
      user: { id: '1', name: 'Kriselle', handle: 'kr', email: 'kr@example.com', profileImageUrl: undefined },
      timestamp: '3 days ago',
      isRead: false
    },
  ];

  const getNotificationText = (notification: Notification) => {
    switch (notification.type) {
      case 'reaction':
        return 'reacted to your chirp';
      case 'mention':
        return 'mentioned you in their bio';
      case 'follow':
        return 'started following you';
      default:
        return '';
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

  const handleNotificationPress = (notification: any) => {
    if (notification.type === 'mention' || notification.type === 'reply') {
      Alert.alert('Navigate to Chirp', `Go to chirp: "${notification.content}"`);
    } else {
      Alert.alert('Navigate to Profile', `Go to ${notification.user.name}'s profile`);
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

      {/* Notifications List */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {notifications.map((notification) => (
          <TouchableOpacity 
            key={notification.id} 
            style={styles.notificationItem}
            onPress={() => handleNotificationPress(notification)}
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
        ))}
      </ScrollView>
      
      {/* Feedback Button */}
      <TouchableOpacity style={styles.feedbackButton}>
        <Text style={styles.feedbackButtonText}>Feedback</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 60, // Account for status bar
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
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f1f1',
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
  feedbackButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#7c3aed',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  feedbackButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },
});