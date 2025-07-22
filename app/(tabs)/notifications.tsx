import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface Notification {
  id: number;
  type: 'like' | 'follow' | 'mention' | 'reply';
  message: string;
  time: string;
  read: boolean;
}

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      console.log('Fetching notifications...');
      // Simulate API call with sample data for now
      const sampleNotifications: Notification[] = [
        { id: 1, type: 'like', message: 'Someone liked your chirp', time: '2 min ago', read: false },
        { id: 2, type: 'follow', message: 'Alex started following you', time: '1 hour ago', read: false },
        { id: 3, type: 'mention', message: 'You were mentioned in a chirp', time: '3 hours ago', read: true },
        { id: 4, type: 'reply', message: 'New reply to your chirp', time: '1 day ago', read: true },
      ];
      setNotifications(sampleNotifications);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchNotifications();
    setRefreshing(false);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like': return 'favorite';
      case 'follow': return 'person-add';
      case 'mention': return 'alternate-email';
      case 'reply': return 'reply';
      default: return 'notifications';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading notifications...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Notifications</Text>
      </View>
      
      {notifications.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialIcons name="notifications-none" size={64} color="#ccc" />
          <Text style={styles.emptyText}>No notifications yet</Text>
        </View>
      ) : (
        <View style={styles.notificationsList}>
          {notifications.map((notification) => (
            <TouchableOpacity key={notification.id} style={styles.notificationItem}>
              <View style={styles.notificationContent}>
                <MaterialIcons 
                  name={getNotificationIcon(notification.type)} 
                  size={24} 
                  color={notification.read ? '#999' : '#9333ea'} 
                />
                <View style={styles.notificationText}>
                  <Text style={[
                    styles.notificationMessage,
                    !notification.read && styles.unreadMessage
                  ]}>
                    {notification.message}
                  </Text>
                  <Text style={styles.notificationTime}>{notification.time}</Text>
                </View>
                {!notification.read && <View style={styles.unreadIndicator} />}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  header: {
    padding: 20,
    paddingBottom: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#9ca3af',
    marginTop: 16,
  },
  notificationsList: {
    paddingVertical: 10,
  },
  notificationItem: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationText: {
    flex: 1,
    marginLeft: 12,
  },
  notificationMessage: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 20,
  },
  unreadMessage: {
    fontWeight: '600',
    color: '#111827',
  },
  notificationTime: {
    fontSize: 13,
    color: '#9ca3af',
    marginTop: 2,
  },
  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#9333ea',
    marginLeft: 8,
  },
});