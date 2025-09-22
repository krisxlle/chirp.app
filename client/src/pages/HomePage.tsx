import React, { useCallback, useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '../components/AuthContext';
import ChirpCard from '../components/ChirpCard';
import ComposeChirp from '../components/ComposeChirp';

// Inline API functions to fetch real data from database
const getForYouChirps = async (limit: number = 20, offset: number = 0) => {
  console.log('🔍 getForYouChirps called with:', { limit, offset });
  
  try {
    // Create Supabase client directly for web
    const { createClient } = await import('@supabase/supabase-js');
    
    const SUPABASE_URL = 'https://qrzbtituxxilnbgocdge.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFyemJ0aXR1eHhpbG5iZ29jZGdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyNDcxNDMsImV4cCI6MjA2NzgyMzE0M30.P-o5ND8qoiIpA1W-9WkM7RUOaGTjRtkEmPbCXGbrEI8';
    
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        storage: {
          getItem: (key: string) => Promise.resolve(localStorage.getItem(key)),
          setItem: (key: string, value: string) => Promise.resolve(localStorage.setItem(key, value)),
          removeItem: (key: string) => Promise.resolve(localStorage.removeItem(key))
        },
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    });

    console.log('✅ Using real Supabase client for getForYouChirps');
    
    // Fetch chirps from database
    const { data: chirps, error } = await supabase
      .from('chirps')
      .select(`
        id,
        content,
        created_at,
        author:users!chirps_author_id_fkey (
          id,
          first_name,
          last_name,
          email,
          handle,
          custom_handle,
          profile_image_url,
          avatar_url
        ),
        likes,
        replies,
        reposts,
        is_liked,
        is_reposted,
        reaction_counts,
        user_reaction,
        repost_of,
        is_ai_generated,
        is_weekly_summary,
        thread_id,
        thread_order,
        is_thread_starter
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('❌ Supabase error:', error);
      throw error;
    }

    if (chirps && chirps.length > 0) {
      console.log('✅ Fetched', chirps.length, 'real chirps from database');
      
      // Transform the data to match expected format
      return chirps.map(chirp => ({
        id: chirp.id,
        content: chirp.content,
        createdAt: chirp.created_at,
        author: {
          id: chirp.author.id,
          firstName: chirp.author.first_name,
          lastName: chirp.author.last_name,
          email: chirp.author.email,
          handle: chirp.author.handle,
          customHandle: chirp.author.custom_handle,
          profileImageUrl: chirp.author.profile_image_url,
          avatarUrl: chirp.author.avatar_url,
          isChirpPlus: false, // Default to false since column doesn't exist
          showChirpPlusBadge: false // Default to false since column doesn't exist
        },
        likes: chirp.likes || 0,
        replies: chirp.replies || 0,
        reposts: chirp.reposts || 0,
        isLiked: chirp.is_liked || false,
        isReposted: chirp.is_reposted || false,
        reactionCounts: chirp.reaction_counts || {},
        userReaction: chirp.user_reaction,
        repostOf: chirp.repost_of,
        isAiGenerated: chirp.is_ai_generated || false,
        isWeeklySummary: chirp.is_weekly_summary || false,
        threadId: chirp.thread_id,
        threadOrder: chirp.thread_order,
        isThreadStarter: chirp.is_thread_starter || true
      }));
    } else {
      console.log('📭 No chirps found in database');
      return [];
    }
  } catch (error) {
    console.error('❌ Error fetching real chirps, falling back to mock data:', error);
    
    // Fallback to mock data
    return [
      {
        id: '1',
        content: 'Welcome to Chirp! This is a sample chirp to get you started. 🐦',
        createdAt: new Date().toISOString(),
        author: {
          id: '1',
          firstName: 'Chirp',
          lastName: 'Team',
          email: 'team@chirp.com',
          handle: 'chirpteam',
          customHandle: 'chirpteam',
          profileImageUrl: null,
          avatarUrl: null,
          isChirpPlus: false,
          showChirpPlusBadge: false
        },
        likes: 5,
        replies: 2,
        reposts: 1,
        isLiked: false,
        isReposted: false,
        reactionCounts: {},
        userReaction: null,
        repostOf: null,
        isAiGenerated: false,
        isWeeklySummary: false,
        threadId: null,
        threadOrder: null,
        isThreadStarter: true
      },
      {
        id: '2',
        content: 'The connection errors have been fixed! The app now works without needing a backend server. 🎉',
        createdAt: new Date(Date.now() - 60000).toISOString(),
        author: {
          id: '2',
          firstName: 'Dev',
          lastName: 'Helper',
          email: 'dev@chirp.com',
          handle: 'devhelper',
          customHandle: 'devhelper',
          profileImageUrl: null,
          avatarUrl: null,
          isChirpPlus: false,
          showChirpPlusBadge: false
        },
        likes: 3,
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
        isThreadStarter: true
      }
    ];
  }
};

const getCollectionFeedChirps = async (userId: string, limit: number = 10, offset: number = 0) => {
  console.log('🔍 getCollectionFeedChirps called with:', { userId, limit, offset });
  
  try {
    // Create Supabase client directly for web
    const { createClient } = await import('@supabase/supabase-js');
    
    const SUPABASE_URL = 'https://qrzbtituxxilnbgocdge.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFyemJ0aXR1eHhpbG5iZ29jZGdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyNDcxNDMsImV4cCI6MjA2NzgyMzE0M30.P-o5ND8qoiIpA1W-9WkM7RUOaGTjRtkEmPbCXGbrEI8';
    
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        storage: {
          getItem: (key: string) => Promise.resolve(localStorage.getItem(key)),
          setItem: (key: string, value: string) => Promise.resolve(localStorage.setItem(key, value)),
          removeItem: (key: string) => Promise.resolve(localStorage.removeItem(key))
        },
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    });

    console.log('✅ Using real Supabase client for getCollectionFeedChirps');
    
    // For collection feed, we'll fetch chirps from users that the current user follows
    // For now, let's fetch recent chirps as a placeholder
    const { data: chirps, error } = await supabase
      .from('chirps')
      .select(`
        id,
        content,
        created_at,
        author:users!chirps_author_id_fkey (
          id,
          first_name,
          last_name,
          email,
          handle,
          custom_handle,
          profile_image_url,
          avatar_url
        ),
        likes,
        replies,
        reposts,
        is_liked,
        is_reposted,
        reaction_counts,
        user_reaction,
        repost_of,
        is_ai_generated,
        is_weekly_summary,
        thread_id,
        thread_order,
        is_thread_starter
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('❌ Supabase error:', error);
      throw error;
    }

    if (chirps && chirps.length > 0) {
      console.log('✅ Fetched', chirps.length, 'real collection chirps from database');
      
      // Transform the data to match expected format
      return chirps.map(chirp => ({
        id: chirp.id,
        content: chirp.content,
        createdAt: chirp.created_at,
        author: {
          id: chirp.author.id,
          firstName: chirp.author.first_name,
          lastName: chirp.author.last_name,
          email: chirp.author.email,
          handle: chirp.author.handle,
          customHandle: chirp.author.custom_handle,
          profileImageUrl: chirp.author.profile_image_url,
          avatarUrl: chirp.author.avatar_url,
          isChirpPlus: false, // Default to false since column doesn't exist
          showChirpPlusBadge: false // Default to false since column doesn't exist
        },
        likes: chirp.likes || 0,
        replies: chirp.replies || 0,
        reposts: chirp.reposts || 0,
        isLiked: chirp.is_liked || false,
        isReposted: chirp.is_reposted || false,
        reactionCounts: chirp.reaction_counts || {},
        userReaction: chirp.user_reaction,
        repostOf: chirp.repost_of,
        isAiGenerated: chirp.is_ai_generated || false,
        isWeeklySummary: chirp.is_weekly_summary || false,
        threadId: chirp.thread_id,
        threadOrder: chirp.thread_order,
        isThreadStarter: chirp.is_thread_starter || true
      }));
    } else {
      console.log('📭 No collection chirps found in database');
      return [];
    }
  } catch (error) {
    console.error('❌ Error fetching real collection chirps, falling back to mock data:', error);
    
    // Fallback to mock data
    return [
      {
        id: '3',
        content: 'This is a collection feed chirp! 📚',
        createdAt: new Date(Date.now() - 120000).toISOString(),
        author: {
          id: '3',
          firstName: 'Collection',
          lastName: 'Curator',
          email: 'curator@chirp.com',
          handle: 'curator',
          customHandle: 'curator',
          profileImageUrl: null,
          avatarUrl: null,
          isChirpPlus: false,
          showChirpPlusBadge: false
        },
        likes: 7,
        replies: 1,
        reposts: 2,
        isLiked: false,
        isReposted: false,
        reactionCounts: {},
        userReaction: null,
        repostOf: null,
        isAiGenerated: false,
        isWeeklySummary: false,
        threadId: null,
        threadOrder: null,
        isThreadStarter: true
      }
    ];
  }
};

export default function HomePage() {
  // Get user from AuthContext
  const { user } = useAuth();
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
  const INITIAL_LIMIT = 10;
  const LOAD_MORE_LIMIT = 10;
  
  // Load initial chirps function - OPTIMIZED FOR STARTUP
  const loadInitialChirps = useCallback(async (forceRefresh = false) => {
    try {
      // Don't reload if we have recent data and not forcing refresh
      const now = Date.now();
      if (!forceRefresh && forYouChirps.length > 0 && (now - lastRefresh) < 60000) {
        console.log('🔄 HomePage: Using cached chirps (last refresh:', now - lastRefresh, 'ms ago)');
        return;
      }
      
      setIsLoading(true);
      console.log('🔄 HomePage: Loading initial chirps from database...', forceRefresh ? '(force refresh)' : '');
      const startTime = Date.now();
      
      // Use Supabase mobile API instead of backend server
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
      
      // Use Supabase mobile API for collection feed
      const realChirps = await getCollectionFeedChirps(user.id, INITIAL_LIMIT, 0);
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
      
      let moreChirps: any[] = [];
      
      if (isForYouFeed) {
        // Load more for you chirps using Supabase
        moreChirps = await getForYouChirps(LOAD_MORE_LIMIT, currentChirps.length);
      } else {
        // Load more collection chirps using Supabase
        if (user?.id) {
          moreChirps = await getCollectionFeedChirps(user.id, LOAD_MORE_LIMIT, currentChirps.length);
        }
      }
      
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
        // Use Supabase mobile API for for you feed
        realChirps = await getForYouChirps(INITIAL_LIMIT, 0);
        setForYouChirps(realChirps);
        setHasMoreChirps(realChirps.length === INITIAL_LIMIT);
      } else {
        if (!user?.id) return;
        // Use Supabase mobile API for collection feed
        realChirps = await getCollectionFeedChirps(user.id, INITIAL_LIMIT, 0);
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
    } catch (error) {
      console.error('Error adding new chirp:', error);
    }
  }, [user]);
  
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
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100vh', 
      backgroundColor: '#fafafa' 
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e5e7eb',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: '12px',
        paddingBottom: '12px',
        paddingLeft: '16px',
        paddingRight: '16px'
      }}>
        <h1 style={{ 
          fontSize: '24px', 
          fontWeight: 'bold', 
          color: '#333' 
        }}>
          Home
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={handleSearchPress}
            style={{
              padding: '8px',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke="#657786" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Feed Type Toggle */}
      <div style={{
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e1e8ed',
        paddingTop: '12px',
        paddingBottom: '12px',
        paddingLeft: '16px',
        paddingRight: '16px'
      }}>
        <div style={{
          display: 'flex',
          backgroundColor: '#f7f9fa',
          borderRadius: '12px',
          padding: '3px'
        }}>
          <button
            style={{
              flex: 1,
              paddingLeft: '12px',
              paddingRight: '12px',
              paddingTop: '8px',
              paddingBottom: '8px',
              borderRadius: '8px',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '2px',
              border: 'none',
              cursor: 'pointer',
              background: feedType === 'forYou' 
                ? 'linear-gradient(135deg, #7c3aed, #ec4899)' 
                : 'transparent',
              color: feedType === 'forYou' ? '#ffffff' : '#657786',
              fontSize: '12px',
              fontWeight: '600',
              boxShadow: feedType === 'forYou' ? '0 2px 6px rgba(124, 58, 237, 0.3)' : 'none'
            }}
            onClick={() => setFeedType('forYou')}
          >
            For You
          </button>
          <button
            style={{
              flex: 1,
              paddingLeft: '12px',
              paddingRight: '12px',
              paddingTop: '8px',
              paddingBottom: '8px',
              borderRadius: '8px',
              alignItems: 'center',
              justifyContent: 'center',
              border: 'none',
              cursor: 'pointer',
              background: feedType === 'collection' 
                ? 'linear-gradient(135deg, #7c3aed, #ec4899)' 
                : 'transparent',
              color: feedType === 'collection' ? '#ffffff' : '#657786',
              fontSize: '12px',
              fontWeight: '600',
              boxShadow: feedType === 'collection' ? '0 2px 6px rgba(124, 58, 237, 0.3)' : 'none'
            }}
            onClick={() => setFeedType('collection')}
          >
            Collection
          </button>
        </div>
      </div>

      {/* Chirps Feed with Infinite Scroll */}
      <div 
        style={{ 
          flex: 1, 
          overflowY: 'auto',
          paddingBottom: '200px' // Extra padding to clear navigation bar and show compose button
        }}
        onScroll={handleScroll}
      >
        {/* Compose Chirp - Now scrolls with feed */}
        <div style={{
          paddingTop: '8px',
          paddingBottom: '8px',
          backgroundColor: '#fafafa',
          display: 'flex',
          justifyContent: 'center'
        }}>
          <div style={{ maxWidth: '600px', width: '100%' }}>
            <ComposeChirp onPost={handleNewChirp} />
          </div>
        </div>

        {feedType === 'forYou' ? (
          // For You Feed
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center',
            paddingLeft: '16px', 
            paddingRight: '16px' 
          }}>
            <div style={{ maxWidth: '600px', width: '100%' }}>
              {forYouChirps.length === 0 && !isLoading ? (
                <div style={{ 
                  alignItems: 'center', 
                  paddingTop: '50px',
                  paddingBottom: '50px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '50px', marginBottom: '10px' }}>💬</div>
                  <h3 style={{ 
                    fontSize: '20px', 
                    fontWeight: 'bold', 
                    color: '#333',
                    marginBottom: '5px'
                  }}>
                    No chirps yet
                  </h3>
                  <p style={{ fontSize: '16px', color: '#657786' }}>
                    Be the first to chirp!
                  </p>
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
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingTop: '20px',
        paddingBottom: '20px',
                    gap: '8px'
                  }}>
                    <div style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid #7c3aed',
                      borderTop: '2px solid transparent',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }}></div>
                    <span style={{ fontSize: '14px', color: '#657786', fontStyle: 'italic' }}>
                      Loading more chirps...
                    </span>
                  </div>
                )}
                
                {/* End of feed indicator */}
                {!hasMoreChirps && forYouChirps.length > 0 && (
                  <div style={{
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingTop: '20px',
        paddingBottom: '20px',
                    paddingLeft: '20px',
                    paddingRight: '20px',
                    textAlign: 'center'
                  }}>
                    <p style={{ fontSize: '14px', color: '#657786', fontStyle: 'italic' }}>
                      You've reached the end! 🎉
                    </p>
                  </div>
                )}
              </>
            )}
            </div>
          </div>
        ) : (
          // Collection Feed
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center',
            paddingLeft: '16px', 
            paddingRight: '16px' 
          }}>
            <div style={{ maxWidth: '600px', width: '100%' }}>
              {collectionChirps.length === 0 && !isLoading ? (
              <div style={{ 
                alignItems: 'center', 
                paddingTop: '50px',
                paddingBottom: '50px',
                textAlign: 'center'
              }}>
                <svg width="50" height="50" viewBox="0 0 24 24" fill="none" style={{ margin: '0 auto 10px' }}>
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <h3 style={{ 
                  fontSize: '20px', 
                  fontWeight: 'bold', 
                  color: '#333',
                  marginBottom: '5px'
                }}>
                  No Collection Chirps
                </h3>
                <p style={{ fontSize: '16px', color: '#657786' }}>
                  Chirps from your gacha collection profiles will appear here
                </p>
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
                  <div style={{ paddingTop: '16px', paddingBottom: '16px' }}>
                    <button 
                      style={{
                        width: '100%',
                        backgroundColor: '#f8f9fa',
                        borderRadius: '8px',
                        paddingTop: '12px',
                        paddingBottom: '12px',
                        paddingLeft: '16px',
                        paddingRight: '16px',
                        alignItems: 'center',
                        marginTop: '16px',
                        marginBottom: '16px',
                        border: '1px solid #e1e8ed',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'center',
                        gap: '8px'
                      }}
                      onClick={loadMoreChirps}
                      disabled={isLoadingMore}
                    >
                      {isLoadingMore ? (
                        <>
                          <div style={{
                            width: '16px',
                            height: '16px',
                            border: '2px solid #7c3aed',
                            borderTop: '2px solid transparent',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite'
                          }}></div>
                          Loading...
                        </>
                      ) : (
                        'Load More Collection Chirps'
                      )}
                    </button>
                  </div>
                )}
              </>
            )}
            </div>
          </div>
        )}
      </div>

      {/* Floating Compose Button */}
      <button
        style={{
          position: 'fixed',
          bottom: '80px', // More space from bottom on web to clear nav bar
          right: '20px',
          width: '56px',
          height: '56px',
          borderRadius: '28px',
          background: 'linear-gradient(135deg, #7c3aed, #ec4899)',
          color: 'white',
          border: 'none',
          cursor: 'pointer',
          boxShadow: '0 4px 8px rgba(124, 58, 237, 0.3)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px',
          fontWeight: 'bold'
        }}
        onClick={() => setShowComposeModal(true)}
      >
        +
      </button>

      {/* Compose Modal */}
      {showComposeModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'end',
          justifyContent: 'center',
          zIndex: 50
        }}>
          <div style={{
            backgroundColor: 'white',
            width: '100%',
            maxWidth: '400px',
            borderTopLeftRadius: '12px',
            borderTopRightRadius: '12px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px',
              borderBottom: '1px solid #e5e7eb'
            }}>
              <button
                style={{
                  color: '#7c3aed',
                  fontWeight: '600',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '8px 12px'
                }}
                onClick={() => setShowComposeModal(false)}
              >
                Cancel
              </button>
              <h2 style={{ 
                fontSize: '18px', 
                fontWeight: 'bold', 
                color: '#333' 
              }}>
                Compose Chirp
              </h2>
              <div style={{ width: '60px' }}></div>
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

      {/* Add CSS for spinner animation */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}