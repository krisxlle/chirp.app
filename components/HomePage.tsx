import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Modal, Platform, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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

/** Brand feed shell (style guide) */
const C = {
  deepPurple: '#6A4C92',
  vibrantPurple: '#A240D1',
  magentaPink: '#D94CC2',
  mediumLavender: '#9D8CD9',
  lightBlueGrey: '#BEC6EB',
  paleLavender: '#E2DAFF',
  /** Warm accent (e.g. nested reply strip), not main shell */
  softPeach: '#FDEADF',
} as const;

const BRAND_GRADIENT: [string, string] = [C.mediumLavender, C.magentaPink];

const TYPO = {
  heading: { fontFamily: 'Montserrat_700Bold' as const },
  body: { fontFamily: 'Inter_400Regular' as const },
  bodyMedium: { fontFamily: 'Inter_500Medium' as const },
} as const;

export default function HomePage() {
  // Get user from AuthContext
  const { user } = useAuth();
  const { padding, spacing } = useResponsive();
  
  // State for chirps with pagination support
  const [forYouChirps, setForYouChirps] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreChirps, setHasMoreChirps] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(0);
  
  // State for compose modal
  const [showComposeModal, setShowComposeModal] = useState(false);
  
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
    if (isLoadingMore) return;
    
    if (!hasMoreChirps) return;
    
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
  }, [forYouChirps.length, hasMoreChirps, isLoadingMore]);
  
  // Load initial chirps on mount
  useEffect(() => {
    // Only load chirps if user is available
    console.log('🔄 HomePage useEffect: user available:', !!user, 'user ID:', user?.id);
    if (user) {
      loadInitialChirps();
    } else {
      console.log('🔄 HomePage useEffect: No user available, skipping chirp load');
    }
  }, [user?.id]);

  // Clear chirps when user changes to prevent showing old user's data
  useEffect(() => {
    console.log('🔄 HomePage: User changed, clearing cached chirps');
    setForYouChirps([]);
    setHasMoreChirps(true);
    setLastRefresh(0);
    clearChirpCache(); // Clear database cache as well
  }, [user?.id]);
  
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
      setHasMoreChirps(realChirps.length === INITIAL_LIMIT);
      setLastRefresh(Date.now());
    } catch (error) {
      console.error('❌ HomePage: Error refreshing chirps:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Function to update chirp like count
  const handleChirpLikeUpdate = useCallback((chirpId: string, newLikeCount: number) => {
    const updateChirp = (prevChirps: any[]) => 
      prevChirps.map(chirp => 
        chirp.id === chirpId 
          ? { 
              ...chirp, 
              reactionCount: newLikeCount,
              userHasLiked: newLikeCount > (chirp.reactionCount || 0)
            }
          : chirp
      );
    
    setForYouChirps(updateChirp);
  }, []);

  const handleChirpReplyUpdate = useCallback((chirpId: string) => {
    const updateChirp = (prevChirps: any[]) => 
      prevChirps.map(chirp => 
        chirp.id === chirpId 
          ? { ...chirp, replyCount: (chirp.replyCount || 0) + 1 }
          : chirp
      );
    
    setForYouChirps(updateChirp);
  }, []);
  
  // Function to add a new chirp to the feed
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
            <SearchIcon size={20} color={C.deepPurple} />
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
            colors={[C.vibrantPurple, C.magentaPink]}
            tintColor={C.vibrantPurple}
            title="Pull to refresh"
            titleColor={C.mediumLavender}
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
        {/* Compose Chirp - Now scrolls with feed */}
        <View style={styles.composeContainer}>
          <ComposeChirp onPost={handleNewChirp} />
        </View>

        {/* For You Feed */}
        <View style={[styles.chirpsContainer, { paddingHorizontal: padding.screen.horizontal }]}>
          {forYouChirps.length === 0 && !isLoading ? (
            <View style={styles.emptyState}>
              <BirdIcon size={50} color={C.vibrantPurple} />
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
                  <ActivityIndicator size="small" color={C.vibrantPurple} />
                  <Text style={styles.loadingMoreText}>Loading more chirps...</Text>
                </View>
              )}
              
              {/* End of feed indicator */}
              {!hasMoreChirps && forYouChirps.length > 0 && (
                <View style={styles.endOfFeedContainer}>
                  <Text style={styles.endOfFeedText}>You've reached the end.</Text>
                </View>
              )}
            </>
          )}
        </View>
      </ScrollView>

      {/* Floating Compose Button */}
      <TouchableOpacity
        style={styles.floatingComposeButton}
        onPress={() => setShowComposeModal(true)}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={BRAND_GRADIENT}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.floatingButtonGradient}
        >
          <View style={styles.floatingButtonIconContainer}>
            <Text style={styles.floatingButtonText}>+</Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>

      {/* Compose Modal */}
      <Modal
        visible={showComposeModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowComposeModal(false)}
      >
        <View style={styles.composeModalContainer}>
          <View style={styles.composeModalHeader}>
            <TouchableOpacity
              style={styles.composeModalCloseButton}
              onPress={() => setShowComposeModal(false)}
            >
              <Text style={styles.composeModalCloseText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.composeModalTitle}>Compose Chirp</Text>
            <View style={styles.composeModalSpacer} />
          </View>
          <View style={styles.composeModalBody}>
            <ComposeChirp 
              onPost={async (content, imageData) => {
                await handleNewChirp(content, imageData);
                setShowComposeModal(false);
              }} 
            />
          </View>
        </View>
      </Modal>

      {/* Profile Modal */}
      <ProfileModal visible={false} userId="" onClose={() => {}} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: C.paleLavender,
  },
  container: {
    flex: 1,
    backgroundColor: C.paleLavender,
  },
  header: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: C.lightBlueGrey,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 24,
    ...TYPO.heading,
    color: C.deepPurple,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  searchButton: {
    padding: 8,
  },
  feed: {
    flex: 1,
  },
  composeContainer: {
    paddingTop: 8,
    paddingBottom: 8,
    backgroundColor: C.paleLavender,
  },
  chirpsContainer: {
    paddingBottom: Platform.OS === 'web' ? 200 : 120, // Extra padding to clear navigation bar and show compose button (much more for web)
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 50,
    gap: 10,
  },
  emptyTitle: {
    fontSize: 20,
    ...TYPO.heading,
    color: C.deepPurple,
    marginBottom: 5,
  },
  emptySubtext: {
    fontSize: 16,
    ...TYPO.body,
    color: C.mediumLavender,
    textAlign: 'center',
    paddingHorizontal: 24,
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
    ...TYPO.body,
    color: C.mediumLavender,
    fontStyle: 'italic',
  },
  loadMoreButton: {
    backgroundColor: C.paleLavender,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginVertical: 16,
    borderWidth: 1,
    borderColor: C.lightBlueGrey,
  },
  loadMoreText: {
    fontSize: 14,
    ...TYPO.bodyMedium,
    color: C.vibrantPurple,
  },
  endOfFeedContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  endOfFeedText: {
    fontSize: 14,
    ...TYPO.body,
    color: C.mediumLavender,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  // Floating Compose Button Styles
  floatingComposeButton: {
    position: 'absolute',
    bottom: Platform.OS === 'web' ? 80 : 20, // More space from bottom on web to clear nav bar
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    boxShadow: '0 4px 8px rgba(162, 64, 209, 0.35)',
    elevation: 8,
    zIndex: 1000,
  },
  floatingButtonGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  floatingButtonIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  floatingButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    lineHeight: 24, // Ensure consistent line height
    includeFontPadding: false, // Remove extra padding on Android
    transform: [{ translateY: -1 }], // Shift icon up to center it perfectly
  },
  // Compose Modal Styles
  composeModalContainer: {
    flex: 1,
    backgroundColor: C.paleLavender,
  },
  composeModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: C.lightBlueGrey,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  composeModalCloseButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  composeModalCloseText: {
    fontSize: 16,
    ...TYPO.bodyMedium,
    color: C.vibrantPurple,
  },
  composeModalTitle: {
    fontSize: 18,
    ...TYPO.heading,
    color: C.deepPurple,
  },
  composeModalSpacer: {
    width: 60, // Same width as close button to center the title
  },
  composeModalBody: {
    flex: 1,
    paddingTop: 14,
    backgroundColor: C.paleLavender,
  },
});