import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import CollectionIcon from './icons/CollectionIcon';
import GachaIcon from './icons/GachaIcon';
import HomeIcon from './icons/HomeIcon';
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
    {
      key: "collection",
      isActive: activeTab === "collection",
      component: CollectionIcon,
    },
    {
      key: "gacha",
      isActive: activeTab === "gacha",
      component: GachaIcon,
    },
  ];

  const handleTabChange = (tab: string) => {
    console.log(`🔄 Navigation: Switching from ${activeTab} to ${tab}`);
    const startTime = Date.now();
    
    onTabChange(tab);
    
    // Log navigation completion after a short delay
    setTimeout(() => {
      const navTime = Date.now() - startTime;
      console.log(`✅ Navigation: Completed switch to ${tab} in ${navTime}ms`);
    }, 100);
  };

  return (
    <View style={styles.container}>
      <View style={styles.navContainer}>
        {navItems.map((item) => (
          <TouchableOpacity
            key={item.key}
            style={styles.navItem}
            onPress={() => handleTabChange(item.key)}
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
                    size={22} // Increased from 18 to 22 for larger icons to match taller nav bar
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
                  size={22} // Increased from 18 to 22 for larger icons to match taller nav bar
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
    paddingVertical: 4, // Reduced from 8 to 4 (50% reduction in white space)
    paddingBottom: 20, // Add bottom padding to avoid iPhone home indicator
  },
  navContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 5, // Reduced from 10 to 5 (50% reduction in button vertical padding)
    paddingHorizontal: 12, // Keep horizontal padding the same
    borderRadius: 12, // Keep border radius the same
    minWidth: 56, // Keep minimum width the same
  },
  activeNavItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 5, // Reduced from 10 to 5 (50% reduction in button vertical padding)
    paddingHorizontal: 12, // Keep horizontal padding the same
    borderRadius: 12, // Keep border radius the same
    minWidth: 56, // Keep minimum width the same
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
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#7c3aed',
    borderRadius: 8,
    minWidth: 16,
    height: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#7c3aed',
    fontSize: 9,
    fontWeight: '700',
    textAlign: 'center',
  },
});