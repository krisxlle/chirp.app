import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Bell, Heart, MessageCircle, Repeat2, UserPlus, Sparkles } from 'lucide-react';
import UserAvatar from '../components/UserAvatar';

interface Notification {
  id: string;
  type: 'like' | 'reply' | 'repost' | 'follow' | 'mention' | 'system';
  message: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    handle: string;
    profileImageUrl?: string;
  };
  chirp?: {
    id: string;
    content: string;
  };
  timestamp: string;
  isRead: boolean;
}

export default function Notifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    setIsLoading(true);
    try {
      // Mock notifications data
      const mockNotifications: Notification[] = [
        {
          id: '1',
          type: 'like',
          message: 'liked your chirp',
          user: {
            id: '1',
            firstName: 'Chirp',
            lastName: 'Team',
            handle: 'chirpteam',
            profileImageUrl: null
          },
          chirp: {
            id: '1',
            content: 'Welcome to Chirp! This is your first chirp. 🐦'
          },
          timestamp: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
          isRead: false
        },
        {
          id: '2',
          type: 'follow',
          message: 'started following you',
          user: {
            id: '2',
            firstName: 'Alex',
            lastName: 'Johnson',
            handle: 'alexj',
            profileImageUrl: null
          },
          timestamp: new Date(Date.now() - 900000).toISOString(), // 15 minutes ago
          isRead: false
        },
        {
          id: '3',
          type: 'reply',
          message: 'replied to your chirp',
          user: {
            id: '3',
            firstName: 'Sarah',
            lastName: 'Wilson',
            handle: 'sarahw',
            profileImageUrl: null
          },
          chirp: {
            id: '2',
            content: 'Chirp is now live! Share your thoughts with the world. ✨'
          },
          timestamp: new Date(Date.now() - 1800000).toISOString(), // 30 minutes ago
          isRead: true
        },
        {
          id: '4',
          type: 'system',
          message: 'Welcome to Chirp! Complete your profile to get started.',
          timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
          isRead: true
        }
      ];

      setNotifications(mockNotifications);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <Heart className="h-4 w-4 text-red-500" />;
      case 'reply':
        return <MessageCircle className="h-4 w-4 text-blue-500" />;
      case 'repost':
        return <Repeat2 className="h-4 w-4 text-green-500" />;
      case 'follow':
        return <UserPlus className="h-4 w-4 text-purple-500" />;
      case 'mention':
        return <MessageCircle className="h-4 w-4 text-orange-500" />;
      case 'system':
        return <Sparkles className="h-4 w-4 text-yellow-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, isRead: true }))
    );
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bell className="h-5 w-5 text-purple-600" />
            <h1 className="text-lg font-semibold text-gray-900">Notifications</h1>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount}
              </Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllAsRead}>
              Mark all as read
            </Button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="p-4">
        {notifications.length > 0 ? (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <Card 
                key={notification.id} 
                className={`cursor-pointer transition-colors ${
                  !notification.isRead ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                }`}
                onClick={() => markAsRead(notification.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      {notification.user ? (
                        <UserAvatar user={notification.user} size="sm" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                          {getNotificationIcon(notification.type)}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          {notification.user ? (
                            <div className="flex items-center space-x-2">
                              <span className="font-semibold text-gray-900">
                                {notification.user.firstName} {notification.user.lastName}
                              </span>
                              <span className="text-gray-500">@{notification.user.handle}</span>
                              <span className="text-gray-600">{notification.message}</span>
                            </div>
                          ) : (
                            <p className="text-gray-900">{notification.message}</p>
                          )}
                          
                          {notification.chirp && (
                            <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                              <p className="text-gray-700 text-sm">{notification.chirp.content}</p>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-4">
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                          <span className="text-sm text-gray-500">
                            {formatTimestamp(notification.timestamp)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Bell className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No notifications yet</h3>
            <p className="text-gray-500">
              When people interact with your chirps or follow you, you'll see it here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}