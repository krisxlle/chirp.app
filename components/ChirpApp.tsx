import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useAuth } from './AuthContext';
import { usePathname } from 'expo-router';
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
  const pathname = usePathname();

  console.log('🔍 ChirpApp render - isLoading:', isLoading, 'isAuthenticated:', isAuthenticated);
  console.log('📍 Current pathname in ChirpApp:', pathname);

  // Check if we're on a profile route and should hide the ChirpApp
  useEffect(() => {
    console.log('📍 Pathname changed to:', pathname);
    if (pathname && pathname.startsWith('/profile/')) {
      console.log('🚫 Profile route detected - ChirpApp should be hidden');
    }
  }, [pathname]);

  // Simple path check without interval monitoring
  const [currentPath, setCurrentPath] = useState('');
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const newPath = window.location?.pathname || '';
      setCurrentPath(newPath);
    }
  }, [pathname]);

  // Check if we're on a profile route
  const isProfileRoute = React.useMemo(() => {
    const checkPath = currentPath || pathname || '';
    const isProfile = checkPath.startsWith('/profile/');
    console.log('🔍 Checking path:', checkPath, 'isProfile:', isProfile);
    return isProfile;
  }, [currentPath, pathname]);

  if (isLoading) {
    console.log('📱 Showing loading screen');
    return <View style={styles.loadingContainer} />;
  }

  if (!isAuthenticated) {
    console.log('🔐 Showing sign in screen');
    return <SignInScreen />;
  }

  // If we're on a profile route, don't render the main app interface
  if (isProfileRoute) {
    console.log('🚫 Profile route detected - returning null to let Expo Router handle it');
    return null;
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