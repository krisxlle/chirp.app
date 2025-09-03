import React from 'react';
import { Text, View } from 'react-native';
import ChirpApp from '../../components/ChirpApp';

// Log when main index screen loads
console.log('🔥🔥🔥 INDEX SCREEN LOADED - Main entry point');

export default function HomeScreen() {
  console.log('🔥🔥🔥 HOME SCREEN COMPONENT RENDERED');
  
  try {
    return (
      <View style={{ flex: 1, backgroundColor: '#ffffff' }}>
        <ChirpApp />
      </View>
    );
  } catch (error) {
    console.log('🔥🔥🔥 ERROR IN HOMESCREEN RENDER:', error);
    return (
      <View style={{ flex: 1, backgroundColor: '#ffffff', justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: '#000', fontSize: 16 }}>Error in HomeScreen: {error instanceof Error ? error.message : 'Unknown error'}</Text>
      </View>
    );
  }
}