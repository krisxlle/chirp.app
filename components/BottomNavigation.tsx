import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import HomeIcon from './icons/HomeIcon';
import SearchIcon from './icons/SearchIcon';
import NotificationIcon from './icons/NotificationIcon';
import ProfileIcon from './icons/ProfileIcon';

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  unreadCount?: number;
}

export default function BottomNavigation({ activeTab, onTabChange, unreadCount }: BottomNavigationProps) {
  const navItems = [
    {
      key: "home",
      isActive: activeTab === "home",
      component: HomeIcon,
    },
    {
      key: "search",
      isActive: activeTab === "search",
      component: SearchIcon,
    },
    {
      key: "notifications",
      isActive: activeTab === "notifications",
      badge: unreadCount && unreadCount > 0 ? unreadCount : null,
      component: NotificationIcon,
    },
    {
      key: "profile",
      isActive: activeTab === "profile",
      component: ProfileIcon,
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.navContainer}>
        {navItems.map((item) => (
          <TouchableOpacity
            key={item.key}
            style={styles.navItem}
            onPress={() => onTabChange(item.key)}
            activeOpacity={0.7}
          >
            {item.isActive ? (
              <LinearGradient
                colors={['#7c3aed', '#ec4899']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.activeNavItem}
              >
                <View style={styles.iconContainer}>
                  <item.component
                    size={18}
                    color='#ffffff'
                  />
                  
                  {/* Notification badge */}
                  {item.badge && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>
                        {item.badge > 99 ? "99+" : item.badge}
                      </Text>
                    </View>
                  )}
                </View>
              </LinearGradient>
            ) : (
              <View style={styles.iconContainer}>
                <item.component
                  size={18}
                  color='#6b7280'
                />
                
                {/* Notification badge */}
                {item.badge && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                      {item.badge > 99 ? "99+" : item.badge}
                    </Text>
                  </View>
                )}
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingHorizontal: 1.5,
    paddingVertical: 1.5,
  },
  navContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 7.5,
    borderRadius: 9,
    minWidth: 45,
  },
  activeNavItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 7.5,
    borderRadius: 9,
    minWidth: 45,
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  iconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  activeNavIcon: {
    fontSize: 20,
  },
  navLabel: {
    fontSize: 10,
    color: '#6b7280',
    fontWeight: '500',
    textAlign: 'center',
  },
  activeNavLabel: {
    color: '#ffffff',
    fontWeight: '600',
  },
  badge: {
    position: 'absolute',
    top: -3,
    right: -6,
    backgroundColor: '#ef4444',
    borderRadius: 7,
    minWidth: 14,
    height: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 8,
    fontWeight: '600',
    textAlign: 'center',
  },
});