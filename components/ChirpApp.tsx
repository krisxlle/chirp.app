import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useAuth } from './AuthContext';
import SignInScreen from './SignInScreen';
import HomePage from './HomePage';
import SearchPage from './SearchPage';
import ProfilePage from './ProfilePage';
import SettingsPage from './SettingsPage';
import NotificationsPage from './NotificationsPage';
import BottomNavigation from './BottomNavigation';

export default function ChirpApp() {
  const { isAuthenticated, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('home');

  console.log('🔍 ChirpApp render - isLoading:', isLoading, 'isAuthenticated:', isAuthenticated);

  if (isLoading) {
    console.log('📱 Showing loading screen');
    return <View style={styles.loadingContainer} />;
  }

  if (!isAuthenticated) {
    console.log('🔐 Showing sign in screen');
    return <SignInScreen />;
  }

  console.log('✅ Showing main app with activeTab:', activeTab);

  const renderCurrentPage = () => {
    console.log('🎯 Rendering page for activeTab:', activeTab);
    switch (activeTab) {
      case 'home':
        console.log('📱 Rendering HomePage');
        return <HomePage />;
      case 'search':
        console.log('🔍 Rendering SearchPage');
        return <SearchPage />;
      case 'notifications':
        console.log('🔔 Rendering NotificationsPage');
        return <NotificationsPage />;
      case 'profile':
        console.log('👤 Rendering ProfilePage');
        return <ProfilePage />;
      default:
        console.log('🏠 Rendering default HomePage');
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