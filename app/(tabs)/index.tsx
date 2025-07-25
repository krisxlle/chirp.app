import React from 'react';
import { View } from 'react-native';
import { usePathname } from 'expo-router';
import ChirpApp from '../../components/ChirpApp';

// Log when main index screen loads
console.log('🔥🔥🔥 INDEX SCREEN LOADED - Main entry point');

export default function HomeScreen() {
  const pathname = usePathname();
  console.log('🔥🔥🔥 HOME SCREEN COMPONENT RENDERED, pathname:', pathname);
  
  // If we're on a profile route, don't render anything - let Expo Router handle it
  if (pathname?.startsWith('/profile/')) {
    console.log('🚫 PROFILE ROUTE DETECTED IN INDEX - RETURNING NULL');
    return null;
  }
  
  return (
    <View style={{ flex: 1, backgroundColor: '#ffffff' }}>
      <ChirpApp />
    </View>
  );
}