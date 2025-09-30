import { useQuery } from '@tanstack/react-query';
import React from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '../hooks/useAuth';
import { apiRequest } from './api';
import { CollectionIcon, GachaIcon, HomeIcon, NotificationIcon, ProfileIcon } from './icons';

interface BottomNavigationProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  unreadCount?: number;
}

export default function BottomNavigation({ activeTab, onTabChange, unreadCount }: BottomNavigationProps) {
  const [location, setLocation] = useLocation();
  const { user } = useAuth();

  // Get unread count from API if not provided
  const { data: notificationData } = useQuery({
    queryKey: ["/api/notifications/unread-count"],
    queryFn: async () => {
      try {
        const response = await apiRequest("/api/notifications/unread-count");
        return response;
      } catch (error) {
        console.error('Error fetching unread count:', error);
        return { count: 0 };
      }
    },
    refetchInterval: 30000, // Check every 30 seconds
  });

  const actualUnreadCount = unreadCount ?? notificationData?.count ?? 0;

  const navItems = [
    {
      key: "home",
      isActive: activeTab === "home" || location === "/",
      component: HomeIcon,
      path: "/",
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
      key: "collection",
      isActive: activeTab === "collection" || location === "/collection",
      component: CollectionIcon,
      path: "/collection",
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
    
    try {
      if (onTabChange) {
        onTabChange(tab);
      } else {
        setLocation(path);
      }
    } catch (error) {
      console.error('Navigation error:', error);
      // Fallback to window.location for profile navigation
      if (tab === 'profile') {
        console.log('🔄 Using fallback navigation for profile');
        window.location.href = path;
        return;
      }
    }
    
    // Log navigation completion after a short delay
    setTimeout(() => {
      const navTime = Date.now() - startTime;
      console.log(`✅ Navigation: Completed switch to ${tab} in ${navTime}ms`);
    }, 100);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 px-1.5 py-1 pb-5 z-50">
      <div className="flex justify-around items-center">
        {navItems.map((item) => (
          <button
            key={item.key}
            className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-xl min-w-14 transition-all duration-200 ${
              item.isActive 
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-600/25' 
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
            onClick={() => handleTabChange(item.key, item.path)}
          >
            <div className="relative">
              <item.component
                size={22}
                color={item.isActive ? '#ffffff' : '#6b7280'}
              />
              
              {/* Notification badge */}
              {item.badge && (
                <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-5 h-5 flex items-center justify-center px-1">
                  {item.badge > 99 ? "99+" : item.badge}
                </div>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}