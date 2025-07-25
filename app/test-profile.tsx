import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function TestProfile() {
  console.log('🔥🔥🔥 TEST PROFILE COMPONENT MOUNTED!');
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Test Profile Page</Text>
      <Text style={styles.subtitle}>If you see this, navigation is working!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#7c3aed',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
  },
});