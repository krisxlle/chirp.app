import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function BottomNavigation({ activeTab, onTabChange }: BottomNavigationProps) {
  const navItems = [
    {
      icon: "🏠",
      label: "Home", 
      key: "home",
    },
    {
      icon: "🔍",
      label: "Search",
      key: "search", 
    },
    {
      icon: "🔔",
      label: "Notifications",
      key: "notifications",
    },
    {
      icon: "👤", 
      label: "Profile",
      key: "profile",
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
              activeTab === item.key && styles.activeNavItem
            ]}
            onPress={() => onTabChange(item.key)}
          >
            <Text style={[
              styles.navIcon,
              activeTab === item.key && styles.activeNavIcon
            ]}>
              {item.icon}
            </Text>
            <Text style={[
              styles.navLabel,
              activeTab === item.key && styles.activeNavLabel
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
    borderTopColor: '#e1e8ed',
  },
  navContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    minWidth: 60,
  },
  activeNavItem: {
    backgroundColor: '#7c3aed',
  },
  navIcon: {
    fontSize: 20,
    marginBottom: 2,
  },
  activeNavIcon: {
    fontSize: 20,
  },
  navLabel: {
    fontSize: 10,
    color: '#657786',
    fontWeight: '500',
  },
  activeNavLabel: {
    color: '#ffffff',
    fontWeight: '600',
  },
});