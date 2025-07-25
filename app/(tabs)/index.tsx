import React from 'react';
import { View } from 'react-native';
import { usePathname } from 'expo-router';
import ChirpApp from '../../components/ChirpApp';

// Log when main index screen loads
console.log('🔥🔥🔥 INDEX SCREEN LOADED - Main entry point');

export default function HomeScreen() {
  console.log('🔥🔥🔥 HOME SCREEN COMPONENT RENDERED');
  
  return (
    <View style={{ flex: 1, backgroundColor: '#ffffff' }}>
      <ChirpApp />
    </View>
  );
}