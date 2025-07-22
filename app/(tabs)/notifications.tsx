import React, { useState } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { ThemedText } from '../../components/ThemedText';
import { ThemedView } from '../../components/ThemedView';

interface Notification {
  id: string;
  type: 'like' | 'reply' | 'follow' | 'mention';
  message: string;
  timestamp: string;
  read: boolean;
}

export default function NotificationsScreen() {
  const [notifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'like',
      message: '@user123 liked your chirp about privacy in social media',
      timestamp: '2 hours ago',
      read: false,
    },
    {
      id: '2',
      type: 'reply',
      message: '@alice replied to your chirp',
      timestamp: '4 hours ago',
      read: false,
    },
    {
      id: '3',
      type: 'follow',
      message: '@bob started following you',
      timestamp: '1 day ago',
      read: true,
    },
    {
      id: '4',
      type: 'mention',
      message: '@charlie mentioned you in a chirp',
      timestamp: '2 days ago',
      read: true,
    },
  ]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like': return '❤️';
      case 'reply': return '💬';
      case 'follow': return '👥';
      case 'mention': return '📢';
      default: return '🔔';
    }
  };

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <ThemedView style={styles.header}>
        <ThemedText type="title">🔔 Notifications</ThemedText>
      </ThemedView>

      <ScrollView style={styles.content}>
        {notifications.length === 0 ? (
          <ThemedView style={styles.emptyState}>
            <ThemedText>No notifications yet</ThemedText>
            <ThemedText style={styles.emptySubtext}>
              When people interact with your chirps, you'll see it here
            </ThemedText>
          </ThemedView>
        ) : (
          notifications.map((notification) => (
            <TouchableOpacity 
              key={notification.id} 
              style={[
                styles.notificationItem,
                !notification.read && styles.unreadNotification
              ]}
            >
              <ThemedView style={styles.notificationIcon}>
                <ThemedText style={styles.iconText}>
                  {getNotificationIcon(notification.type)}
                </ThemedText>
              </ThemedView>
              <ThemedView style={styles.notificationContent}>
                <ThemedText style={styles.notificationMessage}>
                  {notification.message}
                </ThemedText>
                <ThemedText style={styles.notificationTime}>
                  {notification.timestamp}
                </ThemedText>
              </ThemedView>
              {!notification.read && (
                <ThemedView style={styles.unreadDot} />
              )}
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e8ed',
  },
  content: {
    flex: 1,
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
  },
  emptySubtext: {
    color: '#657786',
    marginTop: 8,
    textAlign: 'center',
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e8ed',
    alignItems: 'flex-start',
  },
  unreadNotification: {
    backgroundColor: '#f0f8ff',
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f7f9fa',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconText: {
    fontSize: 18,
  },
  notificationContent: {
    flex: 1,
  },
  notificationMessage: {
    fontSize: 14,
    lineHeight: 18,
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
    color: '#657786',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#1da1f2',
    marginTop: 8,
  },
});