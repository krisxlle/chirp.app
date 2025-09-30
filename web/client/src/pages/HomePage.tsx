import { Plus, RefreshCw, Search } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import ChirpCard from '../components/ChirpCard';
import ComposeChirp from '../components/ComposeChirp';
import { Button } from '../components/ui/button';
import { useToast } from '../hooks/use-toast';
import { useAuth } from '../hooks/useAuth';
import { apiRequest } from './api';

export default function HomePage() {
  // Get user from AuthContext
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  // State for chirps with pagination support
  const [chirps, setChirps] = useState<any[]>([]);
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
      if (!forceRefresh && chirps.length > 0 && (now - lastRefresh) < 60000) { // Increased cache time
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
      
      setChirps(realChirps);
      setLastRefresh(now);
      setHasMoreChirps(realChirps.length === INITIAL_LIMIT);
    } catch (error) {
      console.error('❌ HomePage: Error loading initial chirps from database:', error);
      console.log('🔄 HomePage: Keeping existing chirps array');
    } finally {
      setIsLoading(false);
    }
  }, [chirps.length, lastRefresh]);

  
  // Load more chirps function for pagination
  const loadMoreChirps = useCallback(async () => {
    if (isLoadingMore) return;
    
    if (!hasMoreChirps) return;
    
    try {
      setIsLoadingMore(true);
      console.log(`🔄 HomePage: Loading more chirps...`);
      const startTime = Date.now();
      
      const params = new URLSearchParams();
      params.append('personalized', 'true');
      
      const response = await apiRequest(`/api/chirps?${params.toString()}`);
      const moreChirps = response.slice(chirps.length, chirps.length + LOAD_MORE_LIMIT);
      
      const loadTime = Date.now() - startTime;
      console.log(`✅ HomePage: Loaded ${moreChirps.length} more chirps in ${loadTime}ms`);
      
      if (moreChirps.length > 0) {
        setChirps(prevChirps => {
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
      console.error(`❌ HomePage: Error loading more chirps:`, error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [user?.id, isLoadingMore, hasMoreChirps, chirps]);
  
  // Load initial chirps on mount
  useEffect(() => {
    // Only load chirps if user is available
    console.log('🔄 HomePage useEffect: user available:', !!user, 'user ID:', user?.id);
    if (user) {
      loadInitialChirps();
    } else {
      console.log('🔄 HomePage useEffect: No user available, skipping chirp load');
    }
  }, [user?.id, loadInitialChirps]);

  // Clear chirps when user changes to prevent showing old user's data
  useEffect(() => {
    console.log('🔄 HomePage: User changed, clearing cached chirps');
    setChirps([]);
    setHasMoreChirps(true);
    setLastRefresh(0);
  }, [user?.id]);
  
  // Function to refresh chirps
  const refreshChirps = useCallback(async () => {
    console.log(`🔄 HomePage: Force refreshing chirps...`);
    try {
      setIsLoading(true);
      
      const startTime = Date.now();
      const params = new URLSearchParams();
      params.append('personalized', 'true');
      const realChirps = await apiRequest(`/api/chirps?${params.toString()}`);
      
      const loadTime = Date.now() - startTime;
      console.log(`✅ HomePage: Refreshed ${realChirps.length} chirps from database in ${loadTime}ms`);
      
      setChirps(realChirps);
      setHasMoreChirps(realChirps.length === INITIAL_LIMIT);
      setLastRefresh(Date.now());
    } catch (error) {
      console.error(`❌ HomePage: Error refreshing chirps:`, error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);
  
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
    
    setChirps(updateChirp);
  }, []);

  const handleChirpReplyUpdate = useCallback((chirpId: string) => {
    const updateChirp = (prevChirps: any[]) => 
      prevChirps.map(chirp => 
        chirp.id === chirpId 
          ? { ...chirp, replies: (chirp.replies || 0) + 1 }
          : chirp
      );
    
    setChirps(updateChirp);
  }, []);
  
  // Function to add a new chirp to the feed
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
      setChirps(prevChirps => [newChirp, ...prevChirps]);
      
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
      setChirps(prevChirps => 
        prevChirps.filter(chirp => chirp.id !== deletedChirpId)
      );
    }
    refreshChirps();
  }, [refreshChirps]);

  // Function to navigate to search page
  const handleSearchPress = () => {
    setLocation('/search');
  };

  // Handle scroll for infinite loading
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollHeight, scrollTop, clientHeight } = e.currentTarget;
    const isNearBottom = scrollTop + clientHeight >= scrollHeight - 200;
    
    if (isNearBottom && hasMoreChirps && !isLoadingMore) {
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


      {/* Chirps Feed with Infinite Scroll */}
      <div 
        className="flex-1 overflow-y-auto"
        onScroll={handleScroll}
      >
        {/* Compose Chirp - Now scrolls with feed */}
        <div className="bg-white border-b border-gray-200 p-4">
          <ComposeChirp onPost={handleNewChirp} />
        </div>

        <div className="px-4">
          {chirps.length === 0 && !isLoading ? (
            <div className="py-8 text-center">
              <div className="text-4xl mb-4">💬</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No chirps yet</h3>
              <p className="text-gray-500">Be the first to chirp!</p>
            </div>
          ) : (
            <>
              {chirps.map((chirp, index) => (
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
              {!hasMoreChirps && chirps.length > 0 && (
                <div className="py-4 text-center">
                  <p className="text-sm text-gray-500">You've reached the end! 🎉</p>
                </div>
              )}
            </>
          )}
        </div>
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