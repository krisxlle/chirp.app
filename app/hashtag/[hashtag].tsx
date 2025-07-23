import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { getChirpsByHashtag } from '../../mobile-db';
import type { MobileChirp } from '../../mobile-types';
import ChirpCard from '../../components/ChirpCard';
import ChirpLogo from '../../components/icons/ChirpLogo';

// Convert mobile chirps to ChirpCard format
const convertToChirpCard = (chirp: MobileChirp) => ({
  id: chirp.id,
  content: chirp.content,
  createdAt: chirp.createdAt,
  isWeeklySummary: chirp.isWeeklySummary || false,
  author: {
    id: chirp.author.id || 'anonymous',
    firstName: chirp.author.firstName || '',
    lastName: chirp.author.lastName || '',
    email: chirp.author.email || 'anonymous@example.com',
    handle: chirp.author.handle || 'anonymous',
    customHandle: chirp.author.customHandle || 'anonymous',
    profileImageUrl: chirp.author.profileImageUrl || undefined,
  },
  replyCount: chirp.replyCount || 0,
  reactionCount: chirp.reactionCount || 0,
  reactionCounts: chirp.reactions?.reduce((acc: any, reaction: any) => {
    acc[reaction.emoji] = reaction.count;
    return acc;
  }, {}) || {},
  replies: [],
});

export default function HashtagPage() {
  const { hashtag } = useLocalSearchParams<{ hashtag: string }>();
  const [chirps, setChirps] = useState<MobileChirp[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchHashtagChirps = async () => {
    if (!hashtag) return;
    
    try {
      console.log(`Loading chirps for hashtag: ${hashtag}`);
      const data = await getChirpsByHashtag(hashtag);
      console.log(`Found ${data.length} chirps for hashtag ${hashtag}`);
      setChirps(data);
    } catch (error) {
      console.error('Failed to fetch hashtag chirps:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHashtagChirps();
  }, [hashtag]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchHashtagChirps();
  };

  const displayHashtag = hashtag?.startsWith('#') ? hashtag : `#${hashtag}`;

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7c3aed" />
        <Text style={styles.loadingText}>Loading {displayHashtag}...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Text style={styles.hashtag}>{displayHashtag}</Text>
            <Text style={styles.subtitle}>{chirps.length} chirp{chirps.length !== 1 ? 's' : ''}</Text>
          </View>
        </View>
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {chirps.length === 0 ? (
          <View style={styles.emptyState}>
            <ChirpLogo size={48} color="#9ca3af" />
            <Text style={styles.emptyTitle}>No chirps found</Text>
            <Text style={styles.emptySubtext}>Be the first to chirp about {displayHashtag}!</Text>
          </View>
        ) : (
          chirps.map((chirp) => (
            <ChirpCard key={chirp.id} chirp={convertToChirpCard(chirp)} />
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  loadingText: {
    fontSize: 16,
    color: '#657786',
    marginTop: 12,
  },
  header: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e8ed',
    paddingTop: 12,
    paddingBottom: 12,
    paddingHorizontal: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 16,
  },
  backButtonText: {
    fontSize: 16,
    color: '#7c3aed',
    fontWeight: '500',
  },
  titleContainer: {
    flex: 1,
  },
  hashtag: {
    fontSize: 20,
    fontWeight: '700',
    color: '#7c3aed',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    color: '#657786',
  },
  content: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  scrollContent: {
    paddingBottom: 100, // Space for bottom nav
  },
  emptyState: {
    padding: 48,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#657786',
    textAlign: 'center',
  },
});