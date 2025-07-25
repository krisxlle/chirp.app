import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';

export default function TestNavigation() {
  console.log('🔥🔥🔥 TEST NAVIGATION COMPONENT MOUNTED!');
  
  const handleNavigateToProfile = () => {
    console.log('🚀 Testing direct navigation to profile...');
    router.push('/profile/45185401');
  };

  const handleBack = () => {
    console.log('⬅️ Navigating back...');
    router.back();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Navigation Test Page</Text>
      <Text style={styles.subtitle}>Testing if Expo Router navigation works at all</Text>
      
      <TouchableOpacity 
        style={styles.button} 
        onPress={handleNavigateToProfile}
      >
        <Text style={styles.buttonText}>Go to Profile Page</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={handleBack}
      >
        <Text style={styles.buttonText}>Go Back</Text>
      </TouchableOpacity>
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
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#7c3aed',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  backButton: {
    backgroundColor: '#6b7280',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 10,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});