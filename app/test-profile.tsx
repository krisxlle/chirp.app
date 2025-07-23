import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';

export default function TestProfile() {
  console.log('🔥 TEST PROFILE PAGE LOADED SUCCESSFULLY!');
  
  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Test Profile',
          headerShown: true,
        }} 
      />
      <Text style={styles.text}>Test Profile Page is Working!</Text>
      <Text style={styles.subtext}>Navigation is functioning correctly</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#7c3aed',
    marginBottom: 10,
  },
  subtext: {
    fontSize: 16,
    color: '#6b7280',
  },
});