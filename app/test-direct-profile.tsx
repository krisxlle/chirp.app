import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';

export default function TestDirectProfile() {
  const handleTestNavigation = () => {
    console.log('🧪 Testing direct navigation to profile/45185401');
    try {
      router.push('/profile/45185401');
      console.log('✅ Direct navigation successful');
    } catch (error) {
      console.error('❌ Direct navigation failed:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile Navigation Test</Text>
      <TouchableOpacity style={styles.button} onPress={handleTestNavigation}>
        <Text style={styles.buttonText}>Test Profile Navigation</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => router.push('/')}>
        <Text style={styles.buttonText}>Back to Home</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 40,
    color: '#1f2937',
  },
  button: {
    backgroundColor: '#7c3aed',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 10,
    marginVertical: 10,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});