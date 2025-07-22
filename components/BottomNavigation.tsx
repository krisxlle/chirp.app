import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  unreadCount?: number;
}

export default function BottomNavigation({ activeTab, onTabChange, unreadCount }: BottomNavigationProps) {
  const navItems = [
    {
      icon: "🏠",
      label: "Home", 
      key: "home",
      isActive: activeTab === "home",
    },
    {
      icon: "🔍",
      label: "Search",
      key: "search",
      isActive: activeTab === "search", 
    },
    {
      icon: "🔔",
      label: "Notifications",
      key: "notifications",
      isActive: activeTab === "notifications",
      badge: unreadCount && unreadCount > 0 ? unreadCount : null,
    },
    {
      icon: "👤", 
      label: "Profile",
      key: "profile",
      isActive: activeTab === "profile",
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.navContainer}>
        {navItems.map((item) => (
          <TouchableOpacity
            key={item.key}
            style={[
              styles.navItem,
              item.isActive && styles.activeNavItem
            ]}
            onPress={() => onTabChange(item.key)}
            activeOpacity={0.7}
          >
            <View style={styles.iconContainer}>
              <Text style={[
                styles.navIcon,
                item.isActive && styles.activeNavIcon
              ]}>
                {item.icon}
              </Text>
              
              {/* Notification badge */}
              {item.badge && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {item.badge > 99 ? "99+" : item.badge}
                  </Text>
                </View>
              )}
            </View>
            
            <Text style={[
              styles.navLabel,
              item.isActive && styles.activeNavLabel
            ]}>
              {item.label}
            </Text>
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
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingHorizontal: 4,
    paddingVertical: 4,
    // backdropFilter: 'blur(10px)', // Not supported in React Native
  },
  navContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    minWidth: 70,
    transition: 'all 0.2s ease',
  },
  activeNavItem: {
    backgroundColor: '#7c3aed',
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
    top: -4,
    right: -8,
    backgroundColor: '#ef4444',
    borderRadius: 9,
    minWidth: 18,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
});