import React from 'react';
import { View } from 'react-native';
import ChirpApp from '../../components/ChirpApp';

export default function HomeScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: '#ffffff' }}>
      <ChirpApp />
    </View>
  );
}