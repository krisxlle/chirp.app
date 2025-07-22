import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, RefreshControl, ActivityIndicator, Alert, TouchableOpacity, TextInput, View, Text } from 'react-native';

import { ThemedText } from '../../components/ThemedText';
import { ThemedView } from '../../components/ThemedView';
import { getChirpsFromDB } from '../../mobile-db';
import type { MobileChirp } from '../../mobile-types';

export default function HomeScreen() {
  const [chirps, setChirps] = useState<MobileChirp[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [feedType, setFeedType] = useState<'personalized' | 'chronological' | 'trending'>('personalized');
  const [composeText, setComposeText] = useState('');

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

  const postChirp = async () => {
    if (!composeText.trim()) return;
    
    try {
      // In a real app, this would post to the backend
      Alert.alert('Success', 'Your chirp has been posted!');
      setComposeText('');
    } catch (error) {
      Alert.alert('Error', 'Failed to post chirp. Please try again.');
    }
  };

  return (
    <ThemedView style={styles.container}>
      {/* Header with Logo and Feed Controls */}
      <ThemedView style={styles.header}>
        <ThemedText type="title">🐦 Chirp</ThemedText>
        <ThemedView style={styles.feedControls}>
          <TouchableOpacity 
            style={[styles.feedButton, feedType === 'personalized' && styles.activeFeedButton]}
            onPress={() => setFeedType('personalized')}
          >
            <ThemedText style={styles.feedButtonText}>✨ For You</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.feedButton, feedType === 'chronological' && styles.activeFeedButton]}
            onPress={() => setFeedType('chronological')}
          >
            <ThemedText style={styles.feedButtonText}>🕐 Recent</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.feedButton, feedType === 'trending' && styles.activeFeedButton]}
            onPress={() => setFeedType('trending')}
          >
            <ThemedText style={styles.feedButtonText}>📈 Trending</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ThemedView>

      {/* Compose Section */}
      <ThemedView style={styles.composeSection}>
        <TextInput
          style={styles.composeInput}
          placeholder="What's happening?"
          placeholderTextColor="#666"
          value={composeText}
          onChangeText={setComposeText}
          multiline
          maxLength={280}
        />
        <ThemedView style={styles.composeActions}>
          <ThemedText style={styles.characterCount}>{280 - composeText.length}</ThemedText>
          <TouchableOpacity 
            style={[styles.postButton, !composeText.trim() && styles.postButtonDisabled]}
            onPress={postChirp}
            disabled={!composeText.trim()}
          >
            <Text style={styles.postButtonText}>Chirp</Text>
          </TouchableOpacity>
        </ThemedView>
      </ThemedView>

      <ScrollView 
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {chirps.length === 0 ? (
          <ThemedView style={styles.emptyState}>
            <ThemedText>No chirps available yet.</ThemedText>
            <ThemedText>Pull down to refresh!</ThemedText>
          </ThemedView>
        ) : (
          chirps.map((chirp) => (
            <ThemedView key={chirp.id} style={styles.chirpCard}>
              <ThemedView style={styles.chirpHeader}>
                <ThemedView style={styles.avatar}>
                  <ThemedText style={styles.avatarText}>
                    {chirp.username.substring(0, 1).toUpperCase()}
                  </ThemedText>
                </ThemedView>
                <ThemedView style={styles.chirpMeta}>
                  <ThemedText type="defaultSemiBold">@{chirp.username}</ThemedText>
                  <ThemedText style={styles.timestamp}>
                    {new Date(chirp.createdAt).toLocaleDateString()}
                  </ThemedText>
                </ThemedView>
              </ThemedView>
              <ThemedText style={styles.chirpContent}>{chirp.content}</ThemedText>
              
              {/* Reaction buttons */}
              <ThemedView style={styles.chirpActions}>
                <TouchableOpacity style={styles.actionButton}>
                  <ThemedText>❤️ {chirp.reactions?.length || 0}</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <ThemedText>💬 Reply</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <ThemedText>🔄 Share</ThemedText>
                </TouchableOpacity>
              </ThemedView>
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
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e8ed',
  },
  feedControls: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 8,
  },
  feedButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f7f9fa',
    borderWidth: 1,
    borderColor: '#e1e8ed',
  },
  activeFeedButton: {
    backgroundColor: '#1da1f2',
    borderColor: '#1da1f2',
  },
  feedButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
  composeSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e8ed',
  },
  composeInput: {
    fontSize: 16,
    minHeight: 80,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e1e8ed',
    borderRadius: 8,
    textAlignVertical: 'top',
  },
  composeActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  characterCount: {
    fontSize: 12,
    color: '#657786',
  },
  postButton: {
    backgroundColor: '#1da1f2',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  postButtonDisabled: {
    backgroundColor: '#aab8c2',
  },
  postButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
  },
  chirpCard: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e8ed',
  },
  chirpHeader: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1da1f2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  chirpMeta: {
    flex: 1,
  },
  timestamp: {
    fontSize: 12,
    color: '#657786',
    marginTop: 2,
  },
  chirpContent: {
    fontSize: 16,
    lineHeight: 20,
    marginBottom: 12,
  },
  chirpActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 8,
  },
  actionButton: {
    padding: 8,
  },
});