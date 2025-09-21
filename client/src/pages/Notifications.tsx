import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import UserAvatar from '../components/UserAvatar';
import { apiRequest } from '../components/api';

// Bell Icon Component
const BellIcon = ({ size = 20, color = "#7c3aed" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path 
      d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" 
      stroke={color} 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
    <path 
      d="M13.73 21a2 2 0 0 1-3.46 0" 
      stroke={color} 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </svg>
);

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
      // Try to load from API first
      try {
        const response = await apiRequest(`/api/test/notifications`);
        const dbNotifications = response.notifications || [];
        
        // Transform database format to component format
        const transformedNotifications = dbNotifications.map((notification: any) => ({
          id: notification.id.toString(),
          type: notification.type,
          message: getNotificationMessage(notification.type),
          user: notification.users ? {
            id: notification.users.id,
            firstName: notification.users.first_name || '',
            lastName: notification.users.last_name || '',
            handle: notification.users.handle,
            profileImageUrl: null
          } : undefined,
          chirp: notification.chirp_id ? {
            id: notification.chirp_id.toString(),
            content: 'Chirp content...' // We'd need to fetch this separately
          } : undefined,
          timestamp: notification.created_at,
          isRead: notification.read
        }));
        
        setNotifications(transformedNotifications);
      } catch (error) {
        console.log('API failed, using mock data:', error);
        loadMockData();
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
      loadMockData();
    } finally {
      setIsLoading(false);
    }
  };

  const getNotificationMessage = (type: string) => {
    switch (type) {
      case 'like':
        return 'liked your chirp';
      case 'follow':
        return 'started following you';
      case 'reply':
        return 'replied to your chirp';
      case 'mention':
        return 'mentioned you';
      case 'repost':
        return 'reposted your chirp';
      case 'system':
        return 'system notification';
      default:
        return 'interacted with your content';
    }
  };

  const loadMockData = () => {
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
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <span style={{ fontSize: '16px', color: '#ef4444' }}>❤️</span>;
      case 'reply':
        return <span style={{ fontSize: '16px', color: '#3b82f6' }}>💬</span>;
      case 'repost':
        return <span style={{ fontSize: '16px', color: '#10b981' }}>🔄</span>;
      case 'follow':
        return <span style={{ fontSize: '16px', color: '#7c3aed' }}>➕</span>;
      case 'mention':
        return <span style={{ fontSize: '16px', color: '#f59e0b' }}>💬</span>;
      case 'system':
        return <span style={{ fontSize: '16px', color: '#eab308' }}>✨</span>;
      default:
        return <span style={{ fontSize: '16px', color: '#6b7280' }}>🔔</span>;
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
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          width: '32px',
          height: '32px',
          border: '2px solid #7c3aed',
          borderTop: '2px solid transparent',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#ffffff',
      paddingBottom: '80px' // Space for bottom navigation
    }}>
      {/* Header */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e5e7eb',
        paddingLeft: '16px',
        paddingRight: '16px',
        paddingTop: '12px',
        paddingBottom: '12px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <BellIcon size={24} color="#7c3aed" />
            <h1 style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#14171A',
              margin: 0
            }}>Notifications</h1>
            {unreadCount > 0 && (
              <div style={{
                backgroundColor: '#ef4444',
                color: '#ffffff',
                fontSize: '12px',
                fontWeight: '600',
                paddingLeft: '6px',
                paddingRight: '6px',
                paddingTop: '2px',
                paddingBottom: '2px',
                borderRadius: '10px',
                minWidth: '18px',
                textAlign: 'center'
              }}>
                {unreadCount}
              </div>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              style={{
                paddingLeft: '12px',
                paddingRight: '12px',
                paddingTop: '6px',
                paddingBottom: '6px',
                borderRadius: '6px',
                border: '1px solid #d1d5db',
                backgroundColor: '#ffffff',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151'
              }}
              onClick={markAllAsRead}
            >
              Mark all as read
            </button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div style={{ padding: '16px' }}>
        {notifications.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {notifications.map((notification) => (
              <div
                key={notification.id}
                style={{
                  backgroundColor: !notification.isRead ? '#F0F4FF' : '#ffffff',
                  borderBottom: '1px solid #F7F9FA',
                  paddingLeft: '20px',
                  paddingRight: '20px',
                  paddingTop: '16px',
                  paddingBottom: '16px',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onClick={() => markAsRead(notification.id)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f9fafb';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = !notification.isRead ? '#F0F4FF' : '#ffffff';
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start'
                }}>
                  <div style={{ marginRight: '12px' }}>
                    {notification.user ? (
                      <UserAvatar user={notification.user} size="sm" />
                    ) : (
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '20px',
                        backgroundColor: '#f3e8ff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {getNotificationIcon(notification.type)}
                      </div>
                    )}
                  </div>
                  
                  <div style={{ flex: 1, marginRight: '12px' }}>
                    {notification.user ? (
                      <div style={{
                        fontSize: '16px',
                        color: '#14171A',
                        lineHeight: '22px',
                        marginBottom: '4px'
                      }}>
                        <span style={{
                          fontWeight: '600',
                          color: '#14171A'
                        }}>
                          {notification.user.firstName} {notification.user.lastName}
                        </span>
                        <span style={{
                          color: '#657786'
                        }}> @{notification.user.handle}</span>
                        <span style={{
                          color: '#14171A'
                        }}> {notification.message}</span>
                      </div>
                    ) : (
                      <p style={{
                        fontSize: '16px',
                        color: '#14171A',
                        lineHeight: '22px',
                        marginBottom: '4px',
                        margin: 0
                      }}>{notification.message}</p>
                    )}
                    
                    <div style={{
                      fontSize: '14px',
                      color: '#657786'
                    }}>
                      {formatTimestamp(notification.timestamp)}
                    </div>
                    
                    {notification.chirp && (
                      <div style={{
                        marginTop: '12px',
                        marginLeft: '52px',
                        padding: '12px',
                        backgroundColor: '#F7F9FA',
                        borderRadius: '8px',
                        borderLeft: '3px solid #7c3aed'
                      }}>
                        <p style={{
                          fontSize: '14px',
                          color: '#657786',
                          lineHeight: '20px',
                          margin: 0
                        }}>{notification.chirp.content}</p>
                      </div>
                    )}
                  </div>
                  
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    position: 'relative'
                  }}>
                    {!notification.isRead && (
                      <div style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '4px',
                        backgroundColor: '#7c3aed',
                        marginTop: '4px'
                      }}></div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{
            textAlign: 'center',
            paddingTop: '48px',
            paddingBottom: '48px'
          }}>
            <BellIcon size={64} color="#9ca3af" />
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#14171A',
              marginBottom: '8px',
              margin: 0,
              marginTop: '16px'
            }}>No notifications yet</h3>
            <p style={{
              color: '#657786',
              margin: 0
            }}>
              When people interact with your chirps or follow you, you'll see it here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}