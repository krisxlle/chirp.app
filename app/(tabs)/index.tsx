import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, RefreshControl, ActivityIndicator, Alert } from 'react-native';

import { ThemedText } from '../../components/ThemedText';
import { ThemedView } from '../../components/ThemedView';
import { getChirpsFromDB } from '../../mobile-db';
import type { MobileChirp } from '../../mobile-types';

export default function HomeScreen() {
  const [chirps, setChirps] = useState<MobileChirp[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchChirps = async () => {
    try {
      console.log('Fetching authentic user chirps from database...');
      const data = await getChirpsFromDB();
      console.log('Successfully loaded authentic chirps:', data.length);
      setChirps(data);
    } catch (error) {
      console.error('Database connection failed:', error);
      Alert.alert('Connection Error', 'Unable to load your chirps. Please check your internet connection.');
      setChirps([{
        id: '0',
        content: 'Unable to connect to your account. Please check your internet connection and try refreshing.',
        username: 'system',
        createdAt: new Date().toISOString(),
        reactions: []
      }]);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchChirps();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchChirps();
  };

  if (isLoading) {
    return (
      <ThemedView style={styles.container}>
        <ActivityIndicator size="large" />
        <ThemedText>Loading chirps...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView 
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <ThemedText type="title">Welcome to Chirp!</ThemedText>
        <ThemedText>Your authentic social media experience</ThemedText>
        
        {chirps.length === 0 ? (
          <ThemedText>No chirps available. Pull down to refresh!</ThemedText>
        ) : (
          chirps.map((chirp) => (
            <ThemedView key={chirp.id} style={styles.chirp}>
              <ThemedText type="defaultSemiBold">@{chirp.username}</ThemedText>
              <ThemedText>{chirp.content}</ThemedText>
              <ThemedText type="default">{new Date(chirp.createdAt).toLocaleDateString()}</ThemedText>
            </ThemedView>
          ))
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  chirp: {
    marginVertical: 10,
    padding: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
  },
});