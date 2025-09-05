import React, { useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useAuth } from './AuthContext';

import BottomNavigation from './BottomNavigation';
import CollectionPage from './CollectionPage';
import GachaPage from './GachaPage';
import HomePage from './HomePage';
import NotificationsPage from './NotificationsPage';
import ProfilePage from './ProfilePage';
import SignInScreen from './SignInScreen';

export default function ChirpApp() {
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('home');
  const profilePageRef = useRef<any>(null);

  // Check if user is authenticated
  const isAuthenticated = !!user;

  console.log('ChirpApp render:', { 
    isLoading, 
    isAuthenticated, 
    userId: user?.id,
    userExists: !!user 
  });

  // Show loading state while auth is being checked
  if (isLoading) {
    console.log('ChirpApp: Auth is loading, showing loading state');
    return (
      <View style={styles.loadingContainer}>
        <Text style={{ fontSize: 16, color: '#657786' }}>Loading...</Text>
      </View>
    );
  }

  // Show sign-in screen if user is not authenticated
  if (!isAuthenticated) {
    console.log('ChirpApp: User not authenticated, showing sign-in screen');
    return <SignInScreen />;
  }

  console.log('ChirpApp: User authenticated, rendering main app - user ID:', user?.id);

  // Handle tab changes
  const handleTabChange = (tab: string) => {
    console.log(`🔄 ChirpApp: Tab change requested from ${activeTab} to ${tab}`);
    const startTime = Date.now();
    
    // If we're already on profile and trying to go to profile, do nothing
    if (activeTab === 'profile' && tab === 'profile') {
      console.log('🔄 ChirpApp: Already on profile tab, ignoring request');
      return;
    }
    
    // If we're going to profile and the profile page has settings open, close settings
    if (tab === 'profile' && activeTab === 'profile' && profilePageRef.current?.closeSettings) {
      console.log('🔄 ChirpApp: Closing settings and staying on profile');
      profilePageRef.current.closeSettings();
      return;
    }
    
    setActiveTab(tab);
    
    // Log tab change completion
    setTimeout(() => {
      const changeTime = Date.now() - startTime;
      console.log(`✅ ChirpApp: Tab change to ${tab} completed in ${changeTime}ms`);
    }, 50);
  };

  // Render the appropriate page based on active tab
  const renderCurrentPage = () => {
    switch (activeTab) {
      case 'home':
        return <HomePage />;
      case 'notifications':
        return <NotificationsPage />;
      case 'profile':
        return <ProfilePage ref={profilePageRef} />;
      case 'collection':
        return <CollectionPage />;
      case 'gacha':
        return <GachaPage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <View style={styles.container}>
      <View style={{ flex: 1 }}>
        {renderCurrentPage()}
      </View>
      <BottomNavigation 
        activeTab={activeTab} 
        onTabChange={handleTabChange}
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
});