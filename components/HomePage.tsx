import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl, Alert, Image } from 'react-native';
import { getChirpsFromDB, getForYouChirps, getLatestChirps, getTrendingChirps } from '../mobile-db';
import type { MobileChirp } from '../mobile-types';
import ComposeChirp from './ComposeChirp';
import ChirpCard from './ChirpCard';
import ChirpLogo from './icons/ChirpLogo';

// Convert mobile chirps to ChirpCard format
const convertToChirpCard = (chirp: MobileChirp) => ({
  id: parseInt(chirp.id),
  content: chirp.content,
  createdAt: chirp.createdAt,
  isWeeklySummary: chirp.isWeeklySummary || false,
  author: {
    id: chirp.username || 'anonymous',
    firstName: '',
    lastName: '',
    email: `${chirp.username}@example.com`,
    handle: chirp.username,
    customHandle: chirp.username,
    profileImageUrl: undefined,
  },
  reactionCounts: chirp.reactions?.reduce((acc: any, reaction: any) => {
    acc[reaction.emoji] = reaction.count;
    return acc;
  }, {}) || {},
  replies: [],
});

export default function HomePage() {
  const [chirps, setChirps] = useState<MobileChirp[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [feedType, setFeedType] = useState<'personalized' | 'chronological' | 'trending'>('personalized');

  const fetchChirps = async () => {
    try {
      console.log(`Fetching ${feedType} chirps from database...`);
      let data;
      switch (feedType) {
        case 'chronological':
          data = await getLatestChirps();
          break;
        case 'trending':
          data = await getTrendingChirps();
          break;
        case 'personalized':
        default:
          data = await getForYouChirps();
          break;
      }
      console.log('Successfully loaded authentic chirps:', data.length);
      setChirps(data);
    } catch (error) {
      console.error('Database connection failed:', error);
      Alert.alert('Connection Error', 'Unable to load your chirps. Please check your internet connection.');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchChirps();
  }, [feedType]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchChirps();
  };

  const getFeedIcon = (type: string) => {
    switch (type) {
      case 'personalized': return '✨';
      case 'chronological': return '🕐';
      case 'trending': return '📈';
      default: return '✨';
    }
  };

  const getFeedTitle = (type: string) => {
    switch (type) {
      case 'personalized': return 'For You';
      case 'chronological': return 'Latest';
      case 'trending': return 'Trending';
      default: return 'For You';
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading your authentic chirps...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header - exactly like original */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.logoContainer}>
            <ChirpLogo size={32} color="#7c3aed" />
            <Text style={styles.logoText}>Chirp</Text>
          </View>
          
          {/* Feed Type Selector - exactly like original */}
          <View style={styles.feedControls}>
            <TouchableOpacity 
              style={[styles.feedButton, feedType === 'personalized' && styles.activeFeedButton]}
              onPress={() => setFeedType('personalized')}
            >
              <Text style={[styles.feedButtonText, feedType === 'personalized' && styles.activeFeedButtonText]}>
                For You
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.feedButton, feedType === 'chronological' && styles.activeFeedButton]}
              onPress={() => setFeedType('chronological')}
            >
              <Text style={[styles.feedButtonText, feedType === 'chronological' && styles.activeFeedButtonText]}>
                Latest
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.feedButton, feedType === 'trending' && styles.activeFeedButton]}
              onPress={() => setFeedType('trending')}
            >
              <Text style={[styles.feedButtonText, feedType === 'trending' && styles.activeFeedButtonText]}>
                Trending
              </Text>
            </TouchableOpacity>
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
        <ComposeChirp onPost={fetchChirps} />
        
        {chirps.length === 0 ? (
          <View style={styles.emptyState}>
            <ChirpLogo size={48} color="#9ca3af" />
            <Text style={styles.emptyTitle}>No chirps yet</Text>
            <Text style={styles.emptySubtext}>Start by posting your first chirp above!</Text>
          </View>
        ) : (
          chirps.map((chirp) => (
            <ChirpCard key={chirp.id} chirp={chirp} />
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
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
  },
  header: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e8ed',
    paddingTop: 12,
    paddingBottom: 12,
    paddingHorizontal: 16,
    zIndex: 50,
  },
  headerContent: {
    flexDirection: 'column',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  logoImage: {
    width: 32,
    height: 32,
    borderRadius: 8,
    marginRight: 8,
  },
  logoText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  feedControls: {
    flexDirection: 'row',
    backgroundColor: '#f7f9fa',
    borderRadius: 12,
    padding: 4,
  },
  feedButton: {
    flex: 1,
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeFeedButton: {
    backgroundColor: '#d946ef',
  },
  feedButtonIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  feedButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#657786',
  },
  activeFeedButtonText: {
    color: '#ffffff',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100, // Space for bottom nav
  },
  emptyState: {
    padding: 48,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#657786',
    textAlign: 'center',
  },
});