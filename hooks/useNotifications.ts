// hooks/useNotifications.ts
import { useCallback, useEffect, useState } from 'react';
import { notificationService } from '../services/notificationService';
import type { Notification, NotificationCounts } from '../types/notifications';

export const useNotifications = (userId?: string) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [counts, setCounts] = useState<NotificationCounts>({
    total: 0,
    unread: 0,
    likes: 0,
    comments: 0,
    follows: 0,
    mentions: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadNotifications = useCallback(async () => {
    if (!userId) return;

    try {
      setIsLoading(true);
      setError(null);

      const [fetchedNotifications, fetchedCounts] = await Promise.all([
        notificationService.getNotifications(userId),
        notificationService.getNotificationCounts(userId),
      ]);

      setNotifications(fetchedNotifications);
      setCounts(fetchedCounts);
    } catch (err) {
      console.error('❌ Error loading notifications:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId 
            ? { ...n, is_read: true }
            : n
        )
      );
      
      setCounts(prev => ({
        ...prev,
        unread: Math.max(0, prev.unread - 1),
      }));
    } catch (err) {
      console.error('❌ Error marking notification as read:', err);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    if (!userId) return;

    try {
      await notificationService.markAllAsRead(userId);
      
      setNotifications(prev => 
        prev.map(n => ({ ...n, is_read: true }))
      );
      
      setCounts(prev => ({
        ...prev,
        unread: 0,
      }));
    } catch (err) {
      console.error('❌ Error marking all notifications as read:', err);
    }
  }, [userId]);

  const addNotification = useCallback((notification: Notification) => {
    setNotifications(prev => [notification, ...prev]);
    setCounts(prev => ({
      ...prev,
      total: prev.total + 1,
      unread: prev.unread + 1,
      [notification.type]: prev[notification.type] + 1,
    }));
  }, []);

  const refreshNotifications = useCallback(async () => {
    await loadNotifications();
  }, [loadNotifications]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  useEffect(() => {
    if (!userId) return;

    // Subscribe to real-time notifications
    notificationService.subscribeToNotifications(userId, addNotification);

    return () => {
      notificationService.unsubscribeFromNotifications();
    };
  }, [userId, addNotification]);

  return {
    notifications,
    counts,
    isLoading,
    error,
    loadNotifications,
    markAsRead,
    markAllAsRead,
    refreshNotifications,
    addNotification,
  };
};
