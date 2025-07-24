import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl, Alert, Image, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, runOnJS } from 'react-native-reanimated';
import { getChirpsFromDB, getForYouChirps, getLatestChirps, getTrendingChirps } from '../mobile-db';
import type { MobileChirp } from '../mobile-types';
import ComposeChirp from './ComposeChirp';
import ChirpCard from './ChirpCard';
import ChirpLogo from './icons/ChirpLogo';

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

export default function HomePage() {
  const [chirps, setChirps] = useState<MobileChirp[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [feedType, setFeedType] = useState<'personalized' | 'chronological' | 'trending'>('personalized');
  
  // Header animation state
  const headerTranslateY = useSharedValue(0);
  const lastScrollY = useRef(0);
  const isHeaderVisible = useRef(true);

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

  const handleScroll = (event: any) => {
    const currentScrollY = event.nativeEvent.contentOffset.y;
    const scrollDifference = currentScrollY - lastScrollY.current;
    
    // Only hide/show if we've scrolled enough and are past initial scroll
    if (Math.abs(scrollDifference) > 5 && currentScrollY > 50) {
      if (scrollDifference > 0 && isHeaderVisible.current) {
        // Scrolling down - hide header
        headerTranslateY.value = withTiming(-100);
        isHeaderVisible.current = false;
      } else if (scrollDifference < 0 && !isHeaderVisible.current) {
        // Scrolling up - show header
        headerTranslateY.value = withTiming(0);
        isHeaderVisible.current = true;
      }
    }
    
    // Always show header when at top
    if (currentScrollY <= 50 && !isHeaderVisible.current) {
      headerTranslateY.value = withTiming(0);
      isHeaderVisible.current = true;
    }
    
    lastScrollY.current = currentScrollY;
  };

  const animatedHeaderStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: headerTranslateY.value }],
    };
  });

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7c3aed" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Animated Header */}
      <Animated.View style={[styles.header, animatedHeaderStyle]}>
        <View style={styles.headerContent}>
          <View style={styles.logoContainer}>
            <Image 
              source={require('../attached_assets/ChatGPT Image Jul 11, 2025, 11_38_45 AM_1753223521868.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
            <Text style={styles.logoText}>Chirp</Text>
          </View>
          
          {/* Feed Type Selector - compact on same line */}
          <View style={styles.feedControls}>
            <TouchableOpacity 
              style={[styles.feedButton, feedType === 'personalized' && styles.activeFeedButtonContainer]}
              onPress={() => setFeedType('personalized')}
            >
              {feedType === 'personalized' ? (
                <LinearGradient
                  colors={['#7c3aed', '#ec4899']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.activeFeedButton}
                >
                  <Text style={styles.activeFeedButtonText}>For You</Text>
                </LinearGradient>
              ) : (
                <Text style={styles.feedButtonText}>For You</Text>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.feedButton, feedType === 'chronological' && styles.activeFeedButtonContainer]}
              onPress={() => setFeedType('chronological')}
            >
              {feedType === 'chronological' ? (
                <LinearGradient
                  colors={['#7c3aed', '#ec4899']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.activeFeedButton}
                >
                  <Text style={styles.activeFeedButtonText}>Latest</Text>
                </LinearGradient>
              ) : (
                <Text style={styles.feedButtonText}>Latest</Text>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.feedButton, feedType === 'trending' && styles.activeFeedButtonContainer]}
              onPress={() => setFeedType('trending')}
            >
              {feedType === 'trending' ? (
                <LinearGradient
                  colors={['#7c3aed', '#ec4899']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.activeFeedButton}
                >
                  <Text style={styles.activeFeedButtonText}>Trending</Text>
                </LinearGradient>
              ) : (
                <Text style={styles.feedButtonText}>Trending</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        onScroll={handleScroll}
        scrollEventThrottle={16}
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
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e8ed',
    paddingTop: 12,
    paddingBottom: 12,
    paddingHorizontal: 16,
    zIndex: 50,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
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
    padding: 3,
  },
  feedButton: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 50,
  },
  activeFeedButtonContainer: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 50,
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  activeFeedButton: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  feedButtonIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  feedButtonText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#657786',
  },
  activeFeedButtonText: {
    color: '#ffffff',
  },
  content: {
    flex: 1,
    backgroundColor: '#fafafa',
    paddingTop: 42, // Reduced for smaller header
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