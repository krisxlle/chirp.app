import { useQuery } from '@tanstack/react-query';
import React from 'react';
import { useLocation } from 'wouter';
import { useSupabaseAuth } from '../components/SupabaseAuthContext';
import { supabase } from '../lib/supabase';
import { CollectionIcon, GachaIcon, HomeIcon, MessageIcon, NotificationIcon, ProfileIcon } from './icons';

interface BottomNavigationProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  unreadCount?: number;
}

export default function BottomNavigation({ activeTab, onTabChange, unreadCount }: BottomNavigationProps) {
  const [location, setLocation] = useLocation();
  const { user } = useSupabaseAuth();

  // Get unread count from Supabase if not provided
  const { data: notificationData } = useQuery({
    queryKey: ["notifications-unread-count", user?.id],
    queryFn: async () => {
      if (!user?.id) return { count: 0 };
      
      try {
        const { count, error } = await supabase
          .from('notifications')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('read', false);

        if (error) {
          return { count: 0 };
        }

        return { count: count || 0 };
      } catch (error) {
        return { count: 0 };
      }
    },
    refetchInterval: 30000,
    enabled: !!user,
  });

  // Get unread DM count
  const { data: dmData } = useQuery({
    queryKey: ["dm-unread-count", user?.id],
    queryFn: async () => {
      if (!user?.id) return { count: 0 };
      try {
        // Get conversations where user is participant
        const { data: convos } = await supabase
          .from('conversations')
          .select('id')
          .or(`participant_1.eq.${user.id},participant_2.eq.${user.id}`);

        if (!convos || convos.length === 0) return { count: 0 };

        const convoIds = convos.map(c => c.id);
        const { count, error } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .in('conversation_id', convoIds)
          .neq('sender_id', user.id)
          .is('read_at', null);

        if (error) return { count: 0 };
        return { count: count || 0 };
      } catch {
        return { count: 0 };
      }
    },
    refetchInterval: 15000,
    enabled: !!user,
  });

  const actualUnreadCount = unreadCount ?? notificationData?.count ?? 0;
  const dmUnreadCount = dmData?.count ?? 0;

  const navItems = [
    {
      key: "home",
      isActive: activeTab === "home" || location === "/",
      component: HomeIcon,
      path: "/",
    },
    {
      key: "messages",
      isActive: activeTab === "messages" || location.startsWith("/messages"),
      badge: dmUnreadCount > 0 ? dmUnreadCount : null,
      component: MessageIcon,
      path: "/messages",
    },
    {
      key: "notifications",
      isActive: activeTab === "notifications" || location === "/notifications",
      badge: actualUnreadCount > 0 ? actualUnreadCount : null,
      component: NotificationIcon,
      path: "/notifications",
    },
    {
      key: "profile",
      isActive: activeTab === "profile" || location.startsWith("/profile"),
      component: ProfileIcon,
      path: `/profile/${user?.id}`,
    },
    {
      key: "gacha",
      isActive: activeTab === "gacha" || location === "/gacha",
      component: GachaIcon,
      path: "/gacha",
    },
  ];

  const handleTabChange = (tab: string, path: string) => {
    console.log(`🔄 Navigation: Switching from ${activeTab || location} to ${tab}`);
    const startTime = Date.now();
    
    if (onTabChange) {
      onTabChange(tab);
    } else {
      setLocation(path);
    }
    
    // Log navigation completion after a short delay
    setTimeout(() => {
      const navTime = Date.now() - startTime;
      console.log(`✅ Navigation: Completed switch to ${tab} in ${navTime}ms`);
    }, 100);
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: '#ffffff',
      borderTop: '1px solid #e5e7eb',
      paddingLeft: '6px',
      paddingRight: '6px',
      paddingTop: '4px',
      paddingBottom: '20px', // Add bottom padding to avoid iPhone home indicator
      zIndex: 50
    }}>
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center'
      }}>
        {navItems.map((item) => (
          <button
            key={item.key}
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              paddingTop: '5px',
              paddingBottom: '5px',
              paddingLeft: '12px',
              paddingRight: '12px',
              borderRadius: '12px',
              minWidth: '56px',
              border: 'none',
              cursor: 'pointer',
              background: item.isActive 
                ? 'linear-gradient(135deg, #7c3aed, #ec4899)' 
                : 'transparent',
              boxShadow: item.isActive 
                ? '0 4px 8px rgba(124, 58, 237, 0.3)' 
                : 'none',
              transition: 'all 0.2s ease'
            }}
            onClick={() => handleTabChange(item.key, item.path)}
          >
            <div style={{
              position: 'relative',
              alignItems: 'center',
              justifyContent: 'center',
              display: 'flex'
            }}>
              <item.component
                size={22}
                color={item.isActive ? '#ffffff' : '#6b7280'}
              />
              
              {/* Notification badge */}
              {item.badge && (
                <div style={{
                  position: 'absolute',
                  top: '-3px',
                  right: '-6px',
                  backgroundColor: '#ffffff',
                  border: '1.5px solid #7c3aed',
                  borderRadius: '8px',
                  minWidth: '16px',
                  height: '14px',
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingLeft: '4px',
                  paddingRight: '4px',
                  display: 'flex'
                }}>
                  <span style={{
                    color: '#7c3aed',
                    fontSize: '9px',
                    fontWeight: '700',
                    textAlign: 'center',
                    lineHeight: '1'
                  }}>
                    {item.badge > 99 ? "99+" : item.badge}
                  </span>
                </div>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}