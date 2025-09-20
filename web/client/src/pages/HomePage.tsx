import { Bird, Plus, RefreshCw, Search } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '../components/AuthContext';
import ChirpCard from '../components/ChirpCard';
import ComposeChirp from '../components/ComposeChirp';
import { Button } from '../components/ui/button';
import { useToast } from '../hooks/use-toast';
import { apiRequest } from './api';

export default function HomePage() {
  // Get user from AuthContext
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  // State for feed type
  const [feedType, setFeedType] = useState<'forYou' | 'collection'>('forYou');
  
  // State for chirps with pagination support
  const [forYouChirps, setForYouChirps] = useState<any[]>([]);
  const [collectionChirps, setCollectionChirps] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreChirps, setHasMoreChirps] = useState(true);
  const [hasMoreCollectionChirps, setHasMoreCollectionChirps] = useState(true);
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
      
      const params = new URLSearchParams();
      params.append('personalized', 'true');
      const realChirps = await apiRequest(`/api/chirps?${params.toString()}`);
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
  }, [forYouChirps.length, lastRefresh]);

  // Load initial collection chirps function
  const loadInitialCollectionChirps = useCallback(async (forceRefresh = false) => {
    if (!user?.id) return;
    
    try {
      // Don't reload if we have recent data and not forcing refresh
      const now = Date.now();
      if (!forceRefresh && collectionChirps.length > 0 && (now - lastRefresh) < 60000) {
        console.log('🔄 HomePage: Using cached collection chirps (last refresh:', now - lastRefresh, 'ms ago)');
        return;
      }
      
      setIsLoading(true);
      console.log('🔄 HomePage: Loading initial collection chirps from database...', forceRefresh ? '(force refresh)' : '');
      const startTime = Date.now();
      
      const params = new URLSearchParams();
      params.append('trending', 'true');
      const realChirps = await apiRequest(`/api/chirps?${params.toString()}`);
      const loadTime = Date.now() - startTime;
      
      console.log(`✅ HomePage: Loaded ${realChirps.length} initial collection chirps from database in ${loadTime}ms`);
      
      setCollectionChirps(realChirps);
      setLastRefresh(now);
      setHasMoreCollectionChirps(realChirps.length === INITIAL_LIMIT);
    } catch (error) {
      console.error('❌ HomePage: Error loading initial collection chirps from database:', error);
      console.log('🔄 HomePage: Keeping existing collection chirps array');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, collectionChirps.length, lastRefresh]);
  
  // Load more chirps function for pagination
  const loadMoreChirps = useCallback(async () => {
    if (isLoadingMore) return;
    
    // Check which feed type we're loading more for
    const isForYouFeed = feedType === 'forYou';
    const hasMore = isForYouFeed ? hasMoreChirps : hasMoreCollectionChirps;
    const currentChirps = isForYouFeed ? forYouChirps : collectionChirps;
    
    if (!hasMore) return;
    
    try {
      setIsLoadingMore(true);
      console.log(`🔄 HomePage: Loading more ${feedType} chirps...`);
      const startTime = Date.now();
      
      const params = new URLSearchParams();
      if (isForYouFeed) {
        params.append('personalized', 'true');
      } else {
        params.append('trending', 'true');
      }
      
      const response = await apiRequest(`/api/chirps?${params.toString()}`);
      const moreChirps = response.slice(currentChirps.length, currentChirps.length + LOAD_MORE_LIMIT);
      
      const loadTime = Date.now() - startTime;
      console.log(`✅ HomePage: Loaded ${moreChirps.length} more ${feedType} chirps in ${loadTime}ms`);
      
      if (moreChirps.length > 0) {
        if (isForYouFeed) {
          setForYouChirps(prevChirps => {
            // Create a map to track existing chirp IDs
            const existingIds = new Set(prevChirps.map(chirp => chirp.id));
            // Filter out any duplicate chirps
            const uniqueNewChirps = moreChirps.filter(chirp => !existingIds.has(chirp.id));
            return [...prevChirps, ...uniqueNewChirps];
          });
          setHasMoreChirps(moreChirps.length === LOAD_MORE_LIMIT);
        } else {
          setCollectionChirps(prevChirps => {
            // Create a map to track existing chirp IDs
            const existingIds = new Set(prevChirps.map(chirp => chirp.id));
            // Filter out any duplicate chirps
            const uniqueNewChirps = moreChirps.filter(chirp => !existingIds.has(chirp.id));
            return [...prevChirps, ...uniqueNewChirps];
          });
          setHasMoreCollectionChirps(moreChirps.length === LOAD_MORE_LIMIT);
        }
      } else {
        if (isForYouFeed) {
          setHasMoreChirps(false);
        } else {
          setHasMoreCollectionChirps(false);
        }
      }
    } catch (error) {
      console.error(`❌ HomePage: Error loading more ${feedType} chirps:`, error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [feedType, user?.id, isLoadingMore, hasMoreChirps, hasMoreCollectionChirps, forYouChirps, collectionChirps]);
  
  // Load initial chirps on mount
  useEffect(() => {
    // Only load chirps if user is available
    console.log('🔄 HomePage useEffect: user available:', !!user, 'user ID:', user?.id, 'feedType:', feedType);
    if (user) {
      if (feedType === 'forYou') {
        loadInitialChirps();
      } else {
        loadInitialCollectionChirps();
      }
    } else {
      console.log('🔄 HomePage useEffect: No user available, skipping chirp load');
    }
  }, [user?.id, feedType, loadInitialChirps, loadInitialCollectionChirps]);

  // Clear chirps when user changes to prevent showing old user's data
  useEffect(() => {
    console.log('🔄 HomePage: User changed, clearing cached chirps');
    setForYouChirps([]);
    setCollectionChirps([]);
    setHasMoreChirps(true);
    setHasMoreCollectionChirps(true);
    setLastRefresh(0);
  }, [user?.id]);
  
  // Function to refresh chirps
  const refreshChirps = useCallback(async () => {
    console.log(`🔄 HomePage: Force refreshing ${feedType} chirps...`);
    try {
      setIsLoading(true);
      
      const startTime = Date.now();
      let realChirps;
      
      if (feedType === 'forYou') {
        const params = new URLSearchParams();
        params.append('personalized', 'true');
        realChirps = await apiRequest(`/api/chirps?${params.toString()}`);
        setForYouChirps(realChirps);
        setHasMoreChirps(realChirps.length === INITIAL_LIMIT);
      } else {
        if (!user?.id) return;
        const params = new URLSearchParams();
        params.append('trending', 'true');
        realChirps = await apiRequest(`/api/chirps?${params.toString()}`);
        setCollectionChirps(realChirps);
        setHasMoreCollectionChirps(realChirps.length === INITIAL_LIMIT);
      }
      
      const loadTime = Date.now() - startTime;
      console.log(`✅ HomePage: Refreshed ${realChirps.length} ${feedType} chirps from database in ${loadTime}ms`);
      
      setLastRefresh(Date.now());
    } catch (error) {
      console.error(`❌ HomePage: Error refreshing ${feedType} chirps:`, error);
    } finally {
      setIsLoading(false);
    }
  }, [feedType, user?.id]);
  
  // Function to update chirp like count
  const handleChirpLikeUpdate = useCallback((chirpId: string, newLikeCount: number) => {
    const updateChirp = (prevChirps: any[]) => 
      prevChirps.map(chirp => 
        chirp.id === chirpId 
          ? { 
              ...chirp, 
              likes: newLikeCount,
              isLiked: newLikeCount > (chirp.likes || 0)
            }
          : chirp
      );
    
    if (feedType === 'forYou') {
      setForYouChirps(updateChirp);
    } else {
      setCollectionChirps(updateChirp);
    }
  }, [feedType]);

  const handleChirpReplyUpdate = useCallback((chirpId: string) => {
    const updateChirp = (prevChirps: any[]) => 
      prevChirps.map(chirp => 
        chirp.id === chirpId 
          ? { ...chirp, replies: (chirp.replies || 0) + 1 }
          : chirp
      );
    
    if (feedType === 'forYou') {
      setForYouChirps(updateChirp);
    } else {
      setCollectionChirps(updateChirp);
    }
  }, [feedType]);
  
  // Function to add a new chirp to the For You feed
  const handleNewChirp = useCallback(async (content: string, imageData?: {
    imageUrl?: string;
    imageAltText?: string;
    imageWidth?: number;
    imageHeight?: number;
  }) => {
    try {
      // Create a temporary chirp object
      const newChirp = {
        id: `temp_${Date.now()}`,
        content,
        createdAt: new Date().toISOString(),
        likes: 0,
        replies: 0,
        reposts: 0,
        isLiked: false,
        isReposted: false,
        reactionCounts: {},
        userReaction: null,
        repostOf: null,
        isAiGenerated: false,
        isWeeklySummary: false,
        threadId: null,
        threadOrder: null,
        isThreadStarter: true,
        // Image-related fields
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
          bio: user?.bio || '',
          isChirpPlus: user?.isChirpPlus || false,
          showChirpPlusBadge: user?.showChirpPlusBadge || false
        }
      };
      
      // Add to the beginning of the feed
      setForYouChirps(prevChirps => [newChirp, ...prevChirps]);
      
      toast({
        title: "Chirp Posted!",
        description: "Your chirp has been added to the feed.",
      });
    } catch (error) {
      console.error('Error adding new chirp:', error);
      toast({
        title: "Error",
        description: "Failed to post chirp. Please try again.",
        variant: "destructive",
      });
    }
  }, [user, toast]);
  
  // Function to handle chirp deletion
  const handleChirpDelete = useCallback((deletedChirpId?: string) => {
    if (deletedChirpId) {
      setForYouChirps(prevChirps => 
        prevChirps.filter(chirp => chirp.id !== deletedChirpId)
      );
    }
    refreshChirps();
  }, [refreshChirps]);

  // Function to navigate to search page
  const handleSearchPress = () => {
    setLocation('/search');
  };

  // Handle scroll for infinite loading (For You feed only)
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollHeight, scrollTop, clientHeight } = e.currentTarget;
    const isNearBottom = scrollTop + clientHeight >= scrollHeight - 200;
    
    if (isNearBottom && feedType === 'forYou' && hasMoreChirps && !isLoadingMore) {
      loadMoreChirps();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 flex justify-between items-center py-3 px-4">
        <h1 className="text-2xl font-bold text-gray-900">Home</h1>
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="icon" onClick={handleSearchPress}>
            <Search className="h-5 w-5 text-gray-600" />
          </Button>
        </div>
      </header>

      {/* Feed Type Toggle */}
      <div className="bg-white border-b border-gray-200 py-3 px-4">
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              feedType === 'forYou'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            onClick={() => setFeedType('forYou')}
          >
            For You
          </button>
          <button
            className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              feedType === 'collection'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            onClick={() => setFeedType('collection')}
          >
            Collection
          </button>
        </div>
      </div>

      {/* Chirps Feed with Infinite Scroll */}
      <div 
        className="flex-1 overflow-y-auto"
        onScroll={handleScroll}
      >
        {/* Compose Chirp - Now scrolls with feed */}
        <div className="bg-white border-b border-gray-200 p-4">
          <ComposeChirp onPost={handleNewChirp} />
        </div>

        {feedType === 'forYou' ? (
          // For You Feed
          <div className="px-4">
            {forYouChirps.length === 0 && !isLoading ? (
              <div className="py-8 text-center">
                <div className="text-4xl mb-4">💬</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No chirps yet</h3>
                <p className="text-gray-500">Be the first to chirp!</p>
              </div>
            ) : (
              <>
                {forYouChirps.map((chirp, index) => (
                  <ChirpCard 
                    key={`${chirp.id}-${index}`} 
                    chirp={chirp} 
                    onLikeUpdate={handleChirpLikeUpdate}
                    onDeleteSuccess={handleChirpDelete}
                    onReplyPosted={handleChirpReplyUpdate}
                    onProfilePress={(userId) => setLocation(`/profile/${userId}`)}
                  />
                ))}
                
                {/* Loading more indicator */}
                {isLoadingMore && (
                  <div className="flex items-center justify-center py-4">
                    <RefreshCw className="h-4 w-4 animate-spin text-purple-600 mr-2" />
                    <span className="text-sm text-gray-500">Loading more chirps...</span>
                  </div>
                )}
                
                {/* End of feed indicator */}
                {!hasMoreChirps && forYouChirps.length > 0 && (
                  <div className="py-4 text-center">
                    <p className="text-sm text-gray-500">You've reached the end! 🎉</p>
                  </div>
                )}
              </>
            )}
          </div>
        ) : (
          // Collection Feed
          <div className="px-4">
            {collectionChirps.length === 0 && !isLoading ? (
              <div className="py-8 text-center">
                <Bird className="h-12 w-12 mx-auto mb-4 text-purple-600" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Collection Chirps</h3>
                <p className="text-gray-500">Chirps from your gacha collection profiles will appear here</p>
              </div>
            ) : (
              <>
                {collectionChirps.map((chirp, index) => (
                  <ChirpCard 
                    key={`${chirp.id}-${index}`} 
                    chirp={chirp} 
                    onLikeUpdate={handleChirpLikeUpdate}
                    onReplyPosted={handleChirpReplyUpdate}
                    onProfilePress={(userId) => setLocation(`/profile/${userId}`)}
                  />
                ))}
                
                {/* Load More Button */}
                {hasMoreCollectionChirps && (
                  <div className="py-4">
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={loadMoreChirps}
                      disabled={isLoadingMore}
                    >
                      {isLoadingMore ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                          Loading...
                        </>
                      ) : (
                        'Load More Collection Chirps'
                      )}
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Floating Compose Button */}
      <button
        className="fixed bottom-20 right-4 w-14 h-14 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center z-50"
        onClick={() => setShowComposeModal(true)}
      >
        <Plus className="h-6 w-6" />
      </button>

      {/* Compose Modal */}
      {showComposeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50">
          <div className="bg-white w-full max-w-md rounded-t-lg">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <button
                className="text-purple-600 font-semibold"
                onClick={() => setShowComposeModal(false)}
              >
                Cancel
              </button>
              <h2 className="text-lg font-bold text-gray-900">Compose Chirp</h2>
              <div className="w-16"></div>
            </div>
            <ComposeChirp 
              onPost={async (content, imageData) => {
                await handleNewChirp(content, imageData);
                setShowComposeModal(false);
              }} 
            />
          </div>
        </div>
      )}
    </div>
  );
}