import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useAuth } from './AuthContext';
import SignInScreenNew from './SignInScreenNew';
import HomePage from './HomePage';
import ProfilePage from './ProfilePage';
import SettingsPage from './SettingsPage';
import NotificationsPage from './NotificationsPage';
import BottomNavigation from './BottomNavigation';

export default function ChirpApp() {
  const { isAuthenticated, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('home');

  if (isLoading) {
    return <View style={styles.loadingContainer} />;
  }

  if (!isAuthenticated) {
    return <SignInScreenNew />;
  }

  const renderCurrentPage = () => {
    switch (activeTab) {
      case 'home':
        return <HomePage />;
      case 'search':
        return (
          <View style={styles.placeholderContainer}>
            <SettingsPage />
          </View>
        );
      case 'notifications':
        return <NotificationsPage />;
      case 'profile':
        return <ProfilePage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <View style={styles.container}>
      {renderCurrentPage()}
      <BottomNavigation 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        unreadCount={0}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  placeholderContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
});