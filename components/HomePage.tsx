import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useResponsive } from '../hooks/useResponsive';
import { getForYouChirps } from '../mobile-api';
import { clearChirpCache } from '../mobile-db-supabase';
import { useAuth } from './AuthContext';
import ChirpCard from './ChirpCard';
import ComposeChirp from './ComposeChirp';
import ProfileModal from './ProfileModal';
import SearchIcon from './icons/SearchIcon';

export default function HomePage() {
  // Get user from AuthContext
  const { user } = useAuth();
  const { padding, spacing } = useResponsive();
  
  // State for feed type
  const [feedType, setFeedType] = useState<'forYou' | 'collection'>('forYou');
  
  // State for chirps - start with empty array
  const [forYouChirps, setForYouChirps] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(0);
  
  // Load chirps function
  const loadChirps = useCallback(async (forceRefresh = false) => {
    try {
      // Don't reload if we have recent data and not forcing refresh
      const now = Date.now();
      if (!forceRefresh && forYouChirps.length > 0 && (now - lastRefresh) < 30000) {
        console.log('🔄 HomePage: Using cached chirps (last refresh:', now - lastRefresh, 'ms ago)');
        return;
      }
      
      setIsLoading(true);
      console.log('🔄 HomePage: Loading chirps from database...', forceRefresh ? '(force refresh)' : '');
      const startTime = Date.now();
      
      const realChirps = await getForYouChirps();
      const loadTime = Date.now() - startTime;
      
      console.log(`✅ HomePage: Loaded ${realChirps.length} chirps from database in ${loadTime}ms`);
      
      setForYouChirps(realChirps);
      setLastRefresh(now);
    } catch (error) {
      console.error('❌ HomePage: Error loading chirps from database:', error);
      console.log('🔄 HomePage: Keeping existing chirps array');
    } finally {
      setIsLoading(false);
    }
  }, [lastRefresh]); // Remove forYouChirps.length from dependencies to prevent infinite loops
  
  // Load chirps on mount
  useEffect(() => {
    loadChirps();
  }, []); // Empty dependency array to only run once on mount
  
  // Function to refresh chirps
  const refreshChirps = useCallback(async () => {
    console.log('🔄 HomePage: Force refreshing chirps...');
    try {
      setIsLoading(true);
      clearChirpCache(); // Clear cache before refreshing
      
      const startTime = Date.now();
      const realChirps = await getForYouChirps();
      const loadTime = Date.now() - startTime;
      
      console.log(`✅ HomePage: Refreshed ${realChirps.length} chirps from database in ${loadTime}ms`);
      
      setForYouChirps(realChirps);
      setLastRefresh(Date.now());
    } catch (error) {
      console.error('❌ HomePage: Error refreshing chirps:', error);
    } finally {
      setIsLoading(false);
    }
  }, []); // No dependencies to avoid timing issues
  
  // Function to update chirp like count
  const handleChirpLikeUpdate = useCallback((chirpId: string, newLikeCount: number) => {
    setForYouChirps(prevChirps => 
      prevChirps.map(chirp => 
        chirp.id === chirpId 
          ? { ...chirp, reactionCount: newLikeCount }
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
  const handleNewChirp = useCallback(async (content: string) => {
    try {
      console.log('🔄 HomePage: Adding new chirp to feed...');
      
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
          <TouchableOpacity 
            style={styles.refreshButton} 
            onPress={refreshChirps}
            disabled={isLoading}
          >
            <Text style={styles.refreshButtonText}>
              {isLoading ? '🔄' : '↻'}
            </Text>
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

      {/* Chirps Feed */}
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
              forYouChirps.map((chirp) => (
                <ChirpCard 
                  key={chirp.id} 
                  chirp={chirp} 
                  onLikeUpdate={handleChirpLikeUpdate}
                  onDeleteSuccess={handleChirpDelete}
                  onReplyPosted={handleChirpReplyUpdate}
                  onProfilePress={(userId) => router.push(`/profile/${userId}`)}
                />
              ))
            )}
          </View>
                 ) : (
           // Collection Feed
           <View style={[styles.chirpsContainer, { paddingHorizontal: padding.screen.horizontal }]}>
             <View style={styles.emptyState}>
               <Text style={styles.emptyIcon}>🎮</Text>
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
  refreshButton: {
    padding: 8,
  },
  refreshButtonText: {
    fontSize: 24,
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
});