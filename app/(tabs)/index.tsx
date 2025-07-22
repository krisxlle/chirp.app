import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, RefreshControl, ActivityIndicator, Alert } from 'react-native';

import { ThemedText } from '../../components/ThemedText';
import { ThemedView } from '../../components/ThemedView';

interface Chirp {
  id: number;
  content: string;
  username: string;
  createdAt: string;
  reactions?: { emoji: string; count: number }[];
}

export default function HomeScreen() {
  const [chirps, setChirps] = useState<Chirp[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchChirps = async () => {
    try {
      // Try backend API on port 3000 first
      let response;
      try {
        response = await fetch('http://localhost:3000/api/chirps', {
          credentials: 'include'
        });
      } catch (backendError) {
        // Fallback to the same port as the app
        response = await fetch('/api/chirps', {
          credentials: 'include'
        });
      }
      
      if (!response.ok) {
        throw new Error('Failed to fetch chirps');
      }
      const data = await response.json();
      console.log('Successfully fetched chirps from backend:', data.length);
      setChirps(data);
    } catch (error) {
      console.error('Failed to fetch chirps, using sample data:', error);
      // Show sample data if backend isn't available
      const sampleData = [
        {
          id: 1,
          content: 'Welcome to your Chirp feed! This is sample data while we connect to the backend.',
          username: 'chirpuser',
          createdAt: new Date().toISOString(),
          reactions: [{ emoji: '👍', count: 5 }]
        },
        {
          id: 2,
          content: 'Your actual posts and profile data will appear once the backend connection is established.',
          username: 'systemuser',
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          reactions: [{ emoji: '💜', count: 12 }]
        }
      ];
      setChirps(sampleData);
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
        <ThemedView style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
          <ThemedText style={styles.loadingText}>Loading chirps...</ThemedText>
        </ThemedView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title" style={styles.headerTitle}>Chirp</ThemedText>
        <ThemedText style={styles.headerSubtitle}>Your social feed</ThemedText>
      </ThemedView>
      
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {chirps.length === 0 ? (
          <ThemedView style={styles.emptyContainer}>
            <ThemedText type="subtitle" style={styles.emptyText}>No chirps yet</ThemedText>
            <ThemedText style={styles.emptySubtext}>Pull down to refresh or start following users to see their chirps!</ThemedText>
          </ThemedView>
        ) : (
          chirps.map((chirp) => (
            <ThemedView key={chirp.id} style={styles.chirpCard}>
              <ThemedView style={styles.chirpHeader}>
                <ThemedText type="defaultSemiBold" style={styles.username}>@{chirp.username}</ThemedText>
                <ThemedText style={styles.timestamp}>
                  {new Date(chirp.createdAt).toLocaleDateString()}
                </ThemedText>
              </ThemedView>
              <ThemedText style={styles.chirpContent}>{chirp.content}</ThemedText>
              {chirp.reactions && chirp.reactions.length > 0 && (
                <ThemedView style={styles.reactions}>
                  {chirp.reactions.map((reaction, index) => (
                    <ThemedView key={index} style={styles.reaction}>
                      <ThemedText style={styles.reactionEmoji}>{reaction.emoji}</ThemedText>
                      <ThemedText style={styles.reactionCount}>{reaction.count}</ThemedText>
                    </ThemedView>
                  ))}
                </ThemedView>
              )}
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
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
  },
  header: {
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    marginTop: 4,
    opacity: 0.7,
  },
  scrollView: {
    flex: 1,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    marginBottom: 8,
  },
  emptySubtext: {
    textAlign: 'center',
    opacity: 0.7,
  },
  chirpCard: {
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  chirpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  username: {
    color: '#1da1f2',
  },
  timestamp: {
    fontSize: 12,
    opacity: 0.6,
  },
  chirpContent: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 12,
  },
  reactions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  reaction: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 4,
  },
  reactionEmoji: {
    fontSize: 16,
    marginRight: 4,
  },
  reactionCount: {
    fontSize: 12,
    opacity: 0.7,
  },
});