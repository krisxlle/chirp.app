import React, { useCallback, useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { useToast } from '../hooks/use-toast';
import { apiRequest } from './api';
import { isUnauthorizedError } from './authUtils';
import { useAuth } from '../components/AuthContext';
import ChirpCard from '../components/ChirpCard';
import ComposeChirp from '../components/ComposeChirp';
import { Button } from '../components/ui/button';
import { Skeleton } from '../components/ui/skeleton';
import { Search, Plus, RefreshCw } from 'lucide-react';

export default function HomePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  // State for feed type
  const [feedType, setFeedType] = useState<'forYou' | 'collection'>('forYou');
  
  // State for chirps with pagination support
  const [forYouChirps, setForYouChirps] = useState<any[]>([]);
  const [collectionChirps, setCollectionChirps] = useState<any[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreChirps, setHasMoreChirps] = useState(true);
  const [hasMoreCollectionChirps, setHasMoreCollectionChirps] = useState(true);
  const [showComposeModal, setShowComposeModal] = useState(false);
  
  // Pagination constants
  const INITIAL_LIMIT = 10;
  const LOAD_MORE_LIMIT = 10;

  // Fetch chirps using React Query
  const { data: chirpsData, isLoading, error, refetch } = useQuery({
    queryKey: ["chirps", feedType],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (feedType === 'forYou') {
        params.append('personalized', 'true');
      }
      if (feedType === 'collection') {
        params.append('trending', 'true');
      }
      
      const response = await apiRequest(`/api/chirps?${params.toString()}`);
      return response;
    },
    enabled: !!user,
    staleTime: 30000, // 30 seconds
  });

  useEffect(() => {
    if (error && isUnauthorizedError(error as Error)) {
      toast({
        title: "Unauthorized",
        description: "Your session has expired. Please sign in again.",
        variant: "destructive",
      });
      setLocation('/auth');
    }
  }, [error, toast, setLocation]);

  // Update chirps when data changes
  useEffect(() => {
    if (chirpsData) {
      if (feedType === 'forYou') {
        setForYouChirps(chirpsData);
      } else {
        setCollectionChirps(chirpsData);
      }
    }
  }, [chirpsData, feedType]);

  // Load more chirps function for pagination
  const loadMoreChirps = useCallback(async () => {
    if (isLoadingMore) return;
    
    const isForYouFeed = feedType === 'forYou';
    const hasMore = isForYouFeed ? hasMoreChirps : hasMoreCollectionChirps;
    const currentChirps = isForYouFeed ? forYouChirps : collectionChirps;
    
    if (!hasMore) return;
    
    try {
      setIsLoadingMore(true);
      
      const params = new URLSearchParams();
      if (isForYouFeed) {
        params.append('personalized', 'true');
      } else {
        params.append('trending', 'true');
      }
      
      const response = await apiRequest(`/api/chirps?${params.toString()}`);
      const moreChirps = response.slice(currentChirps.length, currentChirps.length + LOAD_MORE_LIMIT);
      
      if (moreChirps.length > 0) {
        if (isForYouFeed) {
          setForYouChirps(prevChirps => [...prevChirps, ...moreChirps]);
          setHasMoreChirps(moreChirps.length === LOAD_MORE_LIMIT);
        } else {
          setCollectionChirps(prevChirps => [...prevChirps, ...moreChirps]);
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
      console.error(`Error loading more ${feedType} chirps:`, error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [feedType, isLoadingMore, hasMoreChirps, hasMoreCollectionChirps, forYouChirps, collectionChirps]);

  // Function to refresh chirps
  const refreshChirps = useCallback(async () => {
    await refetch();
  }, [refetch]);
  
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

  const currentChirps = feedType === 'forYou' ? forYouChirps : collectionChirps;
  const hasMore = feedType === 'forYou' ? hasMoreChirps : hasMoreCollectionChirps;

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Home</h1>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" onClick={handleSearchPress}>
            <Search className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </Button>
        </div>
      </header>

      {/* Feed Type Toggle */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          <button
            className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              feedType === 'forYou'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
            onClick={() => setFeedType('forYou')}
          >
            For You
          </button>
          <button
            className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              feedType === 'collection'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
            onClick={() => setFeedType('collection')}
          >
            Collection
          </button>
        </div>
      </div>

      {/* Chirps Feed */}
      <div className="flex-1 overflow-y-auto">
        {/* Compose Chirp */}
        <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-4">
          <ComposeChirp onPost={handleNewChirp} />
        </div>

        {/* Chirps List */}
        <div className="space-y-0">
          {isLoading ? (
            <div className="p-4 space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-32 w-full rounded-lg" />
              ))}
            </div>
          ) : error ? (
            <div className="p-4 text-center text-red-500">Error loading chirps.</div>
          ) : currentChirps.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-4xl mb-4">💬</div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {feedType === 'forYou' ? 'No chirps yet' : 'No Collection Chirps'}
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                {feedType === 'forYou' 
                  ? 'Be the first to chirp!' 
                  : 'Chirps from your gacha collection profiles will appear here'
                }
              </p>
            </div>
          ) : (
            <>
              {currentChirps.map((chirp, index) => (
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
                  <span className="text-sm text-gray-500 dark:text-gray-400">Loading more chirps...</span>
                </div>
              )}
              
              {/* Load More Button */}
              {hasMore && !isLoadingMore && (
                <div className="p-4">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={loadMoreChirps}
                  >
                    Load More {feedType === 'forYou' ? 'For You' : 'Collection'} Chirps
                  </Button>
                </div>
              )}
              
              {/* End of feed indicator */}
              {!hasMore && currentChirps.length > 0 && (
                <div className="p-4 text-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400">You've reached the end! 🎉</p>
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
          <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-t-lg">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <button
                className="text-purple-600 font-semibold"
                onClick={() => setShowComposeModal(false)}
              >
                Cancel
              </button>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Compose Chirp</h2>
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
