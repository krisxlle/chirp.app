import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import BottomNavigation from './BottomNavigation';
import HomePage from './HomePage';
import SearchPage from './SearchPage';
import NotificationsPage from './NotificationsPage';
import ProfilePage from './ProfilePage';



export default function ChirpApp() {
  const [activeTab, setActiveTab] = useState('home');

  const renderCurrentPage = () => {
    switch (activeTab) {
      case 'home':
        return <HomePage />;
      case 'search':
        return <SearchPage />;
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
      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
});