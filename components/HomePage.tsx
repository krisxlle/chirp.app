import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useResponsive } from '../hooks/useResponsive';
import { getForYouChirps } from '../lib/api/mobile-api';
import { clearChirpCache } from '../lib/database/mobile-db-supabase';
import { useAuth } from './AuthContext';
import ChirpCard from './ChirpCard';
import ComposeChirp from './ComposeChirp';
import ProfileModal from './ProfileModal';
import BirdIcon from './icons/BirdIcon';
import SearchIcon from './icons/SearchIcon';

export default function HomePage() {
  // Get user from AuthContext
  const { user } = useAuth();
  const { padding, spacing } = useResponsive();
  
  // State for feed type
  const [feedType, setFeedType] = useState<'forYou' | 'collection'>('forYou');
  
  // State for chirps with pagination support
  const [forYouChirps, setForYouChirps] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreChirps, setHasMoreChirps] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(0);
  
  // Pagination constants
  const INITIAL_LIMIT = 10; // Load fewer chirps initially for faster startup
  const LOAD_MORE_LIMIT = 10;
  
  // Load initial chirps function - OPTIMIZED FOR STARTUP
  const loadInitialChirps = useCallback(async (forceRefresh = false) => {
    try {
      // Don't reload if we have recent data and not forcing refresh
      const now = Date.now();
      if (!forceRefresh && forYouChirps.length > 0 && (now - lastRefresh) < 60000) { // Increased cache time
        console.log('🔄 HomePage: Using cached chirps (last refresh:', now - lastRefresh, 'ms ago)');
        return;
      }
      
      setIsLoading(true);
      console.log('🔄 HomePage: Loading initial chirps from database...', forceRefresh ? '(force refresh)' : '');
      const startTime = Date.now();
      
      const realChirps = await getForYouChirps(INITIAL_LIMIT, 0);
      const loadTime = Date.now() - startTime;
      
      console.log(`✅ HomePage: Loaded ${realChirps.length} initial chirps from database in ${loadTime}ms`);
      
      setForYouChirps(realChirps);
      setLastRefresh(now);
      setHasMoreChirps(realChirps.length === INITIAL_LIMIT);
    } catch (error) {
      console.error('❌ HomePage: Error loading initial chirps from database:', error);
      console.log('🔄 HomePage: Keeping existing chirps array');
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Load more chirps function for pagination
  const loadMoreChirps = useCallback(async () => {
    if (isLoadingMore || !hasMoreChirps) return;
    
    try {
      setIsLoadingMore(true);
      console.log('🔄 HomePage: Loading more chirps...');
      const startTime = Date.now();
      
      const moreChirps = await getForYouChirps(LOAD_MORE_LIMIT, forYouChirps.length);
      const loadTime = Date.now() - startTime;
      
      console.log(`✅ HomePage: Loaded ${moreChirps.length} more chirps in ${loadTime}ms`);
      
      if (moreChirps.length > 0) {
        setForYouChirps(prevChirps => {
          // Create a map to track existing chirp IDs
          const existingIds = new Set(prevChirps.map(chirp => chirp.id));
          // Filter out any duplicate chirps
          const uniqueNewChirps = moreChirps.filter(chirp => !existingIds.has(chirp.id));
          return [...prevChirps, ...uniqueNewChirps];
        });
        setHasMoreChirps(moreChirps.length === LOAD_MORE_LIMIT);
      } else {
        setHasMoreChirps(false);
      }
    } catch (error) {
      console.error('❌ HomePage: Error loading more chirps:', error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, hasMoreChirps]);
  
  // Load initial chirps on mount
  useEffect(() => {
    // Only load chirps if user is available
    console.log('🔄 HomePage useEffect: user available:', !!user, 'user ID:', user?.id);
    if (user) {
      loadInitialChirps();
    } else {
      console.log('🔄 HomePage useEffect: No user available, skipping chirp load');
    }
  }, [user, loadInitialChirps]);
  
  // Function to refresh chirps
  const refreshChirps = useCallback(async () => {
    console.log('🔄 HomePage: Force refreshing chirps...');
    try {
      setIsLoading(true);
      clearChirpCache(); // Clear cache before refreshing
      
      const startTime = Date.now();
      const realChirps = await getForYouChirps(INITIAL_LIMIT, 0);
      const loadTime = Date.now() - startTime;
      
      console.log(`✅ HomePage: Refreshed ${realChirps.length} chirps from database in ${loadTime}ms`);
      
      setForYouChirps(realChirps);
      setLastRefresh(Date.now());
      setHasMoreChirps(realChirps.length === INITIAL_LIMIT);
    } catch (error) {
      console.error('❌ HomePage: Error refreshing chirps:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Function to update chirp like count
  const handleChirpLikeUpdate = useCallback((chirpId: string, newLikeCount: number) => {
    setForYouChirps(prevChirps => 
      prevChirps.map(chirp => 
        chirp.id === chirpId 
          ? { 
              ...chirp, 
              reactionCount: newLikeCount,
              userHasLiked: newLikeCount > (chirp.reactionCount || 0)
            }
          : chirp
      )
    );
  }, []);

  const handleChirpReplyUpdate = useCallback((chirpId: string) => {
    setForYouChirps(prevChirps => 
      prevChirps.map(chirp => 
        chirp.id === chirpId 
          ? { ...chirp, replyCount: (chirp.replyCount || 0) + 1 }
          : chirp
      )
    );
  }, []);
  
  // Function to add a new chirp to the For You feed
  const handleNewChirp = useCallback(async (content: string, imageData?: {
    imageUrl?: string;
    imageAltText?: string;
    imageWidth?: number;
    imageHeight?: number;
  }) => {
    try {
      console.log('🔄 HomePage: Adding new chirp to feed...');
      console.log('🖼️ HomePage: Image data received:', {
        hasImageData: !!imageData,
        imageUrl: imageData?.imageUrl?.substring(0, 50) + '...',
        imageWidth: imageData?.imageWidth,
        imageHeight: imageData?.imageHeight
      });
      
      // Create a temporary chirp object
      const newChirp = {
        id: `temp_${Date.now()}`,
        content,
        createdAt: new Date().toISOString(),
        replyToId: null,
        isWeeklySummary: false,
        reactionCount: 0,
        replyCount: 0,
        reactions: [],
        replies: [],
        repostOfId: null,
        originalChirp: undefined,
        // Image-related fields - ADDED THESE!
        imageUrl: imageData?.imageUrl || null,
        imageAltText: imageData?.imageAltText || null,
        imageWidth: imageData?.imageWidth || null,
        imageHeight: imageData?.imageHeight || null,
        author: {
          id: user?.id || 'unknown',
          firstName: user?.firstName || 'User',
          lastName: user?.lastName || '',
          email: user?.email || 'user@example.com',
          customHandle: user?.customHandle || user?.handle || 'user',
          handle: user?.handle || 'user',
          profileImageUrl: user?.profileImageUrl,
          avatarUrl: user?.avatarUrl,
          bannerImageUrl: user?.bannerImageUrl,
          bio: user?.bio || ''
        }
      };
      
      // Add to the beginning of the feed
      setForYouChirps(prevChirps => [newChirp, ...prevChirps]);
      
      // Clear cache to force fresh data on next load
      clearChirpCache();
      
      console.log('✅ HomePage: New chirp added to feed');
    } catch (error) {
      console.error('❌ HomePage: Error adding new chirp:', error);
    }
  }, [user]);
  
  // Function to handle chirp deletion
  const handleChirpDelete = useCallback((deletedChirpId?: string) => {
    console.log('🗑️ HomePage: Chirp removed from feed');
    
    // Immediately remove the chirp from local state for instant UI update
    if (deletedChirpId) {
      setForYouChirps(prevChirps => 
        prevChirps.filter(chirp => chirp.id !== deletedChirpId)
      );
    }
    
    // Also refresh to ensure consistency with database
    refreshChirps();
  }, [refreshChirps]);

  // Function to navigate to search page
  const handleSearchPress = () => {
    router.push('/(tabs)/explore');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingHorizontal: padding.screen.horizontal }]}>
        <Text style={styles.headerTitle}>Home</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.searchButton} 
            onPress={handleSearchPress}
          >
            <SearchIcon size={20} color="#657786" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Feed Type Toggle - Updated to match SettingsPage styling */}
      <View style={[styles.tabsContainer, { paddingHorizontal: padding.screen.horizontal }]}>
        <View style={styles.tabsButtonContainer}>
          <TouchableOpacity
            style={styles.tabButton}
            onPress={() => setFeedType('forYou')}
          >
            {feedType === 'forYou' ? (
              <LinearGradient
                colors={['#7c3aed', '#ec4899']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.activeTabButton}
              >
                <Text style={[styles.tabButtonText, styles.activeTabButtonText]}>
                  For You
                </Text>
              </LinearGradient>
            ) : (
              <Text style={styles.tabButtonText}>
                For You
              </Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.tabButton}
            onPress={() => setFeedType('collection')}
          >
            {feedType === 'collection' ? (
              <LinearGradient
                colors={['#7c3aed', '#ec4899']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.activeTabButton}
              >
                <Text style={[styles.tabButtonText, styles.activeTabButtonText]}>
                  Collection
                </Text>
              </LinearGradient>
            ) : (
              <Text style={styles.tabButtonText}>
                Collection
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Chirps Feed with Infinite Scroll */}
      <ScrollView 
        style={styles.feed} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refreshChirps}
            colors={['#7c3aed', '#ec4899']}
            tintColor="#7c3aed"
            title="Pull to refresh"
            titleColor="#657786"
          />
        }
        onScroll={({ nativeEvent }) => {
          // Infinite scroll: load more when near bottom
          const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
          const isNearBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 200;
          
          if (isNearBottom && hasMoreChirps && !isLoadingMore) {
            loadMoreChirps();
          }
        }}
        scrollEventThrottle={400}
      >
        {/* Compose Chirp - Now part of the scrollable feed */}
        <View style={styles.composeContainer}>
          <ComposeChirp onPost={handleNewChirp} />
        </View>

        {feedType === 'forYou' ? (
          // For You Feed
          <View style={[styles.chirpsContainer, { paddingHorizontal: padding.screen.horizontal }]}>
            {forYouChirps.length === 0 && !isLoading ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>💬</Text>
                <Text style={styles.emptyTitle}>No chirps yet</Text>
                <Text style={styles.emptySubtext}>Be the first to chirp!</Text>
              </View>
            ) : (
              <>
                {forYouChirps.map((chirp, index) => (
                  <ChirpCard 
                    key={`${chirp.id}-${index}`} 
                    chirp={chirp} 
                    onLikeUpdate={handleChirpLikeUpdate}
                    onDeleteSuccess={handleChirpDelete}
                    onReplyPosted={handleChirpReplyUpdate}
                    onProfilePress={(userId) => router.push(`/profile/${userId}`)}
                  />
                ))}
                
                {/* Loading more indicator */}
                {isLoadingMore && (
                  <View style={styles.loadingMoreContainer}>
                    <ActivityIndicator size="small" color="#7c3aed" />
                    <Text style={styles.loadingMoreText}>Loading more chirps...</Text>
                  </View>
                )}
                
                {/* End of feed indicator */}
                {!hasMoreChirps && forYouChirps.length > 0 && (
                  <View style={styles.endOfFeedContainer}>
                    <Text style={styles.endOfFeedText}>You've reached the end! 🎉</Text>
                  </View>
                )}
              </>
            )}
          </View>
                 ) : (
           // Collection Feed
           <View style={[styles.chirpsContainer, { paddingHorizontal: padding.screen.horizontal }]}>
             <View style={styles.emptyState}>
               <BirdIcon size={50} color="#7c3aed" />
               <Text style={styles.emptyTitle}>Collection Feed</Text>
               <Text style={styles.emptySubtext}>Chirps from your gacha collection profiles will appear here</Text>
             </View>
           </View>
         )}
      </ScrollView>

      {/* Profile Modal */}
      <ProfileModal visible={false} userId="" onClose={() => {}} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  header: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  searchButton: {
    padding: 8,
  },
  // Updated tabs styling to match SettingsPage
  tabsContainer: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e8ed',
    paddingVertical: 12,
  },
  tabsButtonContainer: {
    flexDirection: 'row',
    backgroundColor: '#f7f9fa',
    borderRadius: 12,
    padding: 3,
  },
  tabButton: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 2,
    flex: 1,
  },
  activeTabButton: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  tabButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#657786',
  },
  activeTabButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  feed: {
    flex: 1,
  },
  composeContainer: {
    paddingTop: 8,
    paddingBottom: 8,
  },
  chirpsContainer: {
    paddingBottom: 80, // Extra padding to clear navigation bar
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyIcon: {
    fontSize: 50,
    marginBottom: 10,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#657786',
  },
  // New styles for infinite scroll
  loadingMoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  loadingMoreText: {
    fontSize: 14,
    color: '#657786',
    fontStyle: 'italic',
  },
  endOfFeedContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  endOfFeedText: {
    fontSize: 14,
    color: '#657786',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});