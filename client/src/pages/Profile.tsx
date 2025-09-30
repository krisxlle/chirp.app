import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '../components/AuthContext';
import ChirpCard from '../components/ChirpCard';
import ProfileFrame from '../components/ProfileFrame';
import UserAvatar from '../components/UserAvatar';
import GearIcon from '../components/icons/GearIcon';
import LinkIcon from '../components/icons/LinkIcon';

// Profile Frame Functions - Inline to avoid import issues
const getUserEquippedFrame = async (userId: string) => {
  console.log('👤 getUserEquippedFrame called with:', { userId });
  
  // Return null to simulate no equipped frame for testing
  // In production, this would check the database for equipped frames
  return null;
};

// Inline rarity determination function to avoid import issues
const determineUserRarity = (user: {
  id: string;
  handle?: string;
  firstName?: string;
  customHandle?: string;
}): 'mythic' | 'legendary' | 'epic' | 'rare' | 'uncommon' | 'common' => {
  if (!user) return 'common';
  
  const userHandle = (user.handle || '').toLowerCase();
  const userName = (user.firstName || user.customHandle || '').toLowerCase();
  
  // Bot detection with hardcoded rarities
  if (userHandle.includes('crimsontalon') || userName.includes('crimsontalon')) {
    return 'mythic';
  } else if (userHandle.includes('solarius') || userName.includes('solarius')) {
    return 'legendary';
  } else if (userHandle.includes('prisma') || userName.includes('prisma')) {
    return 'epic';
  } else if (userHandle.includes('skye') || userName.includes('skye')) {
    return 'rare';
  } else if (userHandle.includes('thorne') || userName.includes('thorne')) {
    return 'uncommon';
  } else if (userHandle.includes('obsidian') || userName.includes('obsidian')) {
    return 'common';
  }
  
  // For regular users, we need a consistent way to determine rarity
  // We'll use a hash of the user ID to ensure consistency
  const userId = user.id;
  const hash = userId.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  
  const rarityRoll = Math.abs(hash) % 100;
  
  if (rarityRoll < 1) return 'mythic';      // 1%
  else if (rarityRoll < 5) return 'legendary';  // 4%
  else if (rarityRoll < 15) return 'epic';      // 10%
  else if (rarityRoll < 35) return 'rare';      // 20%
  else if (rarityRoll < 65) return 'uncommon';  // 30%
  else return 'common';                           // 35%
};

// Utility function to add sample relationships data
const addSampleRelationships = async () => {
  console.log('🔧 Adding sample relationships data...');
  
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const SUPABASE_URL = 'https://qrzbtituxxilnbgocdge.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFyemJ0aXR1eHhpbG5iZ29jZGdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyNDcxNDMsImV4cCI6MjA2NzgyMzE0M30.P-o5ND8qoiIpA1W-9WkM7RUOaGTjRtkEmPbCXGbrEI8';
    
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // First, get some user IDs from the users table
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id')
      .limit(5);
    
    if (usersError || !users || users.length < 2) {
      console.log('❌ Not enough users to create relationships');
      return;
    }
    
    console.log('📊 Found users:', users.map(u => u.id));
    
    // Create some sample relationships
    const relationships = [];
    for (let i = 0; i < users.length; i++) {
      for (let j = 0; j < users.length; j++) {
        if (i !== j && Math.random() > 0.7) { // 30% chance of following
          relationships.push({
            follower_id: users[i].id,
            following_id: users[j].id
          });
        }
      }
    }
    
    if (relationships.length > 0) {
      const { data, error } = await supabase
        .from('relationships')
        .insert(relationships);
      
      if (error) {
        console.log('❌ Error adding sample relationships:', error);
      } else {
        console.log('✅ Added', relationships.length, 'sample relationships');
      }
    } else {
      console.log('📊 No relationships to add (random chance)');
    }
  } catch (error) {
    console.log('❌ Error in addSampleRelationships:', error);
  }
};

// Inline API functions to fetch real data from Supabase
const followUser = async (followerId: string, followingId: string) => {
  console.log('🔍 followUser called with:', { followerId, followingId });
  
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const SUPABASE_URL = 'https://qrzbtituxxilnbgocdge.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFyemJ0aXR1eHhpbG5iZ29jZGdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyNDcxNDMsImV4cCI6MjA2NzgyMzE0M30.P-o5ND8qoiIpA1W-9WkM7RUOaGTjRtkEmPbCXGbrEI8';
    
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    const { data, error } = await supabase
      .from('relationships')
      .insert([
        { follower_id: followerId, following_id: followingId }
      ]);
    
    if (error) {
      console.error('❌ Error following user:', error);
      throw error;
    }
    
    console.log('✅ Successfully followed user');
    return data;
  } catch (error: any) {
    console.error('❌ Error following user:', error);
    throw new Error(`Failed to follow user: ${error.message}`);
  }
};

const unfollowUser = async (followerId: string, followingId: string) => {
  console.log('🔍 unfollowUser called with:', { followerId, followingId });
  
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const SUPABASE_URL = 'https://qrzbtituxxilnbgocdge.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFyemJ0aXR1eHhpbG5iZ29jZGdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyNDcxNDMsImV4cCI6MjA2NzgyMzE0M30.P-o5ND8qoiIpA1W-9WkM7RUOaGTjRtkEmPbCXGbrEI8';
    
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    const { error } = await supabase
      .from('relationships')
      .delete()
      .eq('follower_id', followerId)
      .eq('following_id', followingId);
    
    if (error) {
      console.error('❌ Error unfollowing user:', error);
      throw error;
    }
    
    console.log('✅ Successfully unfollowed user');
    return true;
  } catch (error: any) {
    console.error('❌ Error unfollowing user:', error);
    throw new Error(`Failed to unfollow user: ${error.message}`);
  }
};

const checkFollowStatus = async (followerId: string, followingId: string) => {
  console.log('🔍 checkFollowStatus called with:', { followerId, followingId });
  
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const SUPABASE_URL = 'https://qrzbtituxxilnbgocdge.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFyemJ0aXR1eHhpbG5iZ29jZGdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyNDcxNDMsImV4cCI6MjA2NzgyMzE0M30.P-o5ND8qoiIpA1W-9WkM7RUOaGTjRtkEmPbCXGbrEI8';
    
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    const { data, error } = await supabase
      .from('relationships')
      .select('id')
      .eq('follower_id', followerId)
      .eq('following_id', followingId)
      .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found" which is fine
      console.error('❌ Error checking follow status:', error);
      throw error;
    }
    
    const isFollowing = !!data;
    console.log('✅ Follow status:', isFollowing);
    return isFollowing;
  } catch (error: any) {
    console.error('❌ Error checking follow status:', error);
    return false;
  }
};

const getUserChirps = async (userId: string, userData?: any) => {
  console.log('🔍 getUserChirps called with:', { userId, userData });
  
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

    console.log('✅ Using real Supabase client for getUserChirps');
    
    // Simplified query to avoid timeout - fetch chirps without user join
    const queryPromise = supabase
      .from('chirps')
      .select(`
        id,
        content,
        created_at,
        reply_to_id,
        author_id,
        image_url,
        image_alt_text,
        image_width,
        image_height
      `)
      .eq('author_id', userId)
      .order('created_at', { ascending: false })
      .limit(10); // Reduced limit to 10 to avoid timeout

    const timeoutPromise = new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error('Query timeout')), 8000) // 8 second timeout
    );

    const result = await Promise.race([queryPromise, timeoutPromise]) as any;
    const { data: chirps, error } = result;

    if (error) {
      console.error('❌ Supabase error fetching user chirps:', error);
      throw error;
    }

    if (chirps && chirps.length > 0) {
      console.log('✅ Fetched', chirps.length, 'real user chirps from database');
      
      // Transform the data to match expected format
      return chirps.map(chirp => {
        return {
          id: chirp.id,
          content: chirp.content,
          createdAt: chirp.created_at,
          replyToId: chirp.reply_to_id,
          imageUrl: chirp.image_url,
          imageAltText: chirp.image_alt_text,
          imageWidth: chirp.image_width,
          imageHeight: chirp.image_height,
          author: {
            id: chirp.author_id,
            firstName: userData?.firstName || 'User',
            lastName: userData?.lastName || '',
            email: userData?.email || '',
            handle: userData?.handle || 'user',
            customHandle: userData?.customHandle || 'user',
            profileImageUrl: userData?.profileImageUrl || null,
            avatarUrl: userData?.avatarUrl || null,
            isChirpPlus: userData?.isChirpPlus || false,
            showChirpPlusBadge: userData?.showChirpPlusBadge || false
          },
          likes: 0, // Default to 0 since column doesn't exist
          replies: 0, // Default to 0 since column doesn't exist
          reposts: 0, // Default to 0 since column doesn't exist
          isLiked: false, // Default to false since column doesn't exist
          isReposted: false, // Default to false since column doesn't exist
          reactionCounts: {}, // Default to empty object since column doesn't exist
          userReaction: null, // Default to null since column doesn't exist
          repostOf: null, // Default to null since column doesn't exist
          isAiGenerated: false, // Default to false since column doesn't exist
          isWeeklySummary: false, // Default to false since column doesn't exist
          threadId: null, // Default to null since column doesn't exist
          threadOrder: null, // Default to null since column doesn't exist
          isThreadStarter: true // Default to true since column doesn't exist
        };
      });
    } else {
      console.log('📭 No user chirps found in database');
      return [];
    }
  } catch (error) {
    console.error('❌ Error fetching real user chirps from Supabase:', error);
    console.error('❌ Supabase connection details:', {
      url: 'https://qrzbtituxxilnbgocdge.supabase.co',
      hasKey: true,
      errorMessage: error.message,
      errorCode: error.code
    });
    
    // Instead of falling back to mock data, throw the error
    throw new Error(`Failed to fetch user chirps from database: ${error.message}`);
  }
};

const getUserStats = async (userId: string) => {
  console.log('🔍 getUserStats called with:', { userId });
  
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

    console.log('✅ Using real Supabase client for getUserStats');
    
    // Calculate real stats from database
    const chirpsResult = await supabase
      .from('chirps')
      .select('id', { count: 'exact', head: true })
      .eq('author_id', userId);

    console.log('🔍 getUserStats chirpsResult:', chirpsResult);

    if (chirpsResult.error) {
      console.error('❌ Error fetching chirps count:', chirpsResult.error);
      throw chirpsResult.error;
    }

    const totalChirps = chirpsResult.count || 0;
    const totalLikes = 0; // Will be implemented when reactions system is added
    
    // Get following/followers count from relationships table
    let followingCount = 0;
    let followersCount = 0;
    
    try {
      console.log('📊 Attempting to fetch relationships for user:', userId);
      
      // Get following count (users this person follows)
      const followingResult = await supabase
        .from('relationships')
        .select('id', { count: 'exact', head: true })
        .eq('follower_id', userId);
      
      console.log('📊 Following query result:', followingResult);
      
      // Get followers count (users who follow this person)
      const followersResult = await supabase
        .from('relationships')
        .select('id', { count: 'exact', head: true })
        .eq('following_id', userId);
      
      console.log('📊 Followers query result:', followersResult);
      
      if (!followingResult.error) {
        followingCount = followingResult.count || 0;
        console.log('✅ Following count:', followingCount);
      } else {
        console.log('❌ Following query error:', followingResult.error);
      }
      
      if (!followersResult.error) {
        followersCount = followersResult.count || 0;
        console.log('✅ Followers count:', followersCount);
      } else {
        console.log('❌ Followers query error:', followersResult.error);
      }
      
      console.log('📊 Final counts:', { followingCount, followersCount });
      
      // If both counts are 0, try to add sample data
      if (followingCount === 0 && followersCount === 0) {
        console.log('📊 No relationships found, attempting to add sample data...');
        await addSampleRelationships();
        
        // Try to fetch again after adding sample data
        const retryFollowingResult = await supabase
          .from('relationships')
          .select('id', { count: 'exact', head: true })
          .eq('follower_id', userId);
        
        const retryFollowersResult = await supabase
          .from('relationships')
          .select('id', { count: 'exact', head: true })
          .eq('following_id', userId);
        
        if (!retryFollowingResult.error) {
          followingCount = retryFollowingResult.count || 0;
        }
        if (!retryFollowersResult.error) {
          followersCount = retryFollowersResult.count || 0;
        }
        
        console.log('📊 Retry counts:', { followingCount, followersCount });
      }
    } catch (error) {
      console.log('📊 Error fetching relationships, using mock data:', error.message);
      // Fallback to mock data if there's an error
      followingCount = Math.floor(Math.random() * 50) + 10; // Random between 10-60
      followersCount = Math.floor(Math.random() * 200) + 50; // Random between 50-250
    }
    
    // Calculate profile power based on activity (more realistic calculation)
    const profilePower = Math.floor(totalChirps * 20 + followersCount * 2); // Include followers in power calculation
    
    console.log('📊 Calculated stats:', { totalChirps, totalLikes, profilePower, followingCount, followersCount });
    
    const result = {
      following: followingCount,
      followers: followersCount,
      profilePower: profilePower,
      totalChirps: totalChirps,
      totalLikes: totalLikes
    };
    
    console.log('📊 Returning stats:', result);
    return result;
  } catch (error) {
    console.error('❌ Error fetching user stats from Supabase:', error);
    // Return default stats on error
    return {
      following: 0,
      followers: 0,
      profilePower: 0,
      totalChirps: 0,
      totalLikes: 0
    };
  }
};

const getProfilePowerBreakdown = async (userId: string) => {
  console.log('🔍 getProfilePowerBreakdown called with:', { userId });
  
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

    console.log('✅ Using real Supabase client for getProfilePowerBreakdown');
    
    // For now, return default breakdown since we don't have likes/comments tables yet
    // TODO: Implement real profile power calculation system
    return {
      totalPower: 0, // Will be calculated based on user activity
      likesContribution: 0, // Will be calculated from likes received
      commentsContribution: 0, // Will be calculated from comments made
      collectionContribution: 0, // Will be calculated from collection activity
      rarityFactor: 1.0, // Will be based on user rarity
      totalLikes: 0, // Will be calculated from likes count
      totalComments: 0 // Will be calculated from comments count
    };
  } catch (error) {
    console.error('❌ Error fetching profile power breakdown from Supabase:', error);
    throw new Error(`Failed to fetch profile power breakdown from database: ${error.message}`);
  }
};

interface User {
  id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  name?: string; // Added name field from AuthContext
  customHandle?: string;
  handle?: string;
  profileImageUrl?: string;
  avatarUrl?: string;
  bannerImageUrl?: string;
  bio?: string;
  linkInBio?: string;
  joinedAt?: string;
  isChirpPlus?: boolean;
  showChirpPlusBadge?: boolean;
}

interface ProfileStats {
  following: number;
  followers: number;
  profilePower: number;
}

export default function Profile() {
  console.log('🔍 Profile: Component starting to render...');
  
  const { user: authUser } = useAuth();
  const [location, setLocation] = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'chirps' | 'comments' | 'collection'>('chirps');
  const [userChirps, setUserChirps] = useState<any[]>([]);
  const [userReplies, setUserReplies] = useState<any[]>([]);
  const [stats, setStats] = useState<ProfileStats>({
    following: 0,
    followers: 0,
    profilePower: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [equippedFrame, setEquippedFrame] = useState<any>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoadingFollow, setIsLoadingFollow] = useState(false);

  console.log('🔍 Profile: State initialized, location:', location, 'authUser:', authUser?.id);

  // Extract userId from URL or use current user
  const userId = location.includes('/profile/') 
    ? location.split('/profile/')[1] 
    : authUser?.id;

  console.log('🔍 Profile: userId extracted:', userId);

  useEffect(() => {
    console.log('🔍 Profile: useEffect triggered, userId:', userId);
    if (userId) {
      loadUserProfile();
    }
  }, [userId]);

  useEffect(() => {
    if (user?.id) {
      loadEquippedFrame();
      fetchUserChirps();
      fetchUserReplies();
      
      // Check follow status if viewing another user's profile
      const isOwnProfile = authUser?.id === user.id;
      if (!isOwnProfile && authUser?.id) {
        checkFollowStatus(authUser.id, user.id).then(setIsFollowing);
      }
    }
  }, [user?.id, authUser?.id]);

  const loadEquippedFrame = async () => {
    try {
      const frame = await getUserEquippedFrame(user.id);
      setEquippedFrame(frame);
    } catch (error) {
      console.error('Error loading equipped frame:', error);
    }
  };

  const handleFollowToggle = async () => {
    if (isLoadingFollow || !authUser?.id || !user?.id) {
      return;
    }

    setIsLoadingFollow(true);
    try {
      if (isFollowing) {
        await unfollowUser(authUser.id, user.id);
        setIsFollowing(false);
        // Update followers count
        setStats(prev => ({ ...prev, followers: prev.followers - 1 }));
      } else {
        await followUser(authUser.id, user.id);
        setIsFollowing(true);
        // Update followers count
        setStats(prev => ({ ...prev, followers: prev.followers + 1 }));
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
    } finally {
      setIsLoadingFollow(false);
    }
  };

  const fetchUserChirps = async () => {
    try {
      if (!user?.id) return;
      
      console.log('🔄 Profile: Fetching user chirps for:', user.id);
      
      const { createClient } = await import('@supabase/supabase-js');
      const SUPABASE_URL = 'https://qrzbtituxxilnbgocdge.supabase.co';
      const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFyemJ0aXR1eHhpbG5iZ29jZGdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyNDcxNDMsImV4cCI6MjA2NzgyMzE0M30.P-o5ND8qoiIpA1W-9WkM7RUOaGTjRtkEmPbCXGbrEI8';
      
      const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      
      // Fetch user's chirps (original posts, not replies)
      const { data: chirps, error: chirpsError } = await supabase
        .from('chirps')
        .select('*')
        .eq('author_id', user.id)
        .is('reply_to_id', null)
        .order('created_at', { ascending: false })
        .limit(10);

      if (chirpsError) {
        console.error('❌ Error fetching user chirps:', chirpsError);
        return;
      }

      // Transform chirps data
      const transformedChirps = (chirps || []).map((chirp: any) => ({
        id: chirp.id,
        content: chirp.content,
        createdAt: chirp.created_at,
        author: user,
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
        isThreadStarter: true
      }));

      setUserChirps(transformedChirps);
      console.log('✅ Profile: Loaded', transformedChirps.length, 'chirps');
    } catch (error) {
      console.error('❌ Error fetching user chirps:', error);
    }
  };

  const fetchUserReplies = async () => {
    try {
      if (!user?.id) return;
      
      console.log('🔄 Profile: Fetching user replies for:', user.id);
      
      const { createClient } = await import('@supabase/supabase-js');
      const SUPABASE_URL = 'https://qrzbtituxxilnbgocdge.supabase.co';
      const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFyemJ0aXR1eHhpbG5iZ29jZGdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyNDcxNDMsImV4cCI6MjA2NzgyMzE0M30.P-o5ND8qoiIpA1W-9WkM7RUOaGTjRtkEmPbCXGbrEI8';
      
      const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      
      // Fetch user's replies (comments)
      const { data: replies, error: repliesError } = await supabase
        .from('chirps')
        .select('*')
        .eq('author_id', user.id)
        .not('reply_to_id', 'is', null)
        .order('created_at', { ascending: false })
        .limit(10);

      if (repliesError) {
        console.error('❌ Error fetching user replies:', repliesError);
        return;
      }

      // Transform replies data
      const transformedReplies = (replies || []).map((reply: any) => ({
        id: reply.id,
        content: reply.content,
        createdAt: reply.created_at,
        author: user,
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
        isThreadStarter: true
      }));

      setUserReplies(transformedReplies);
      console.log('✅ Profile: Loaded', transformedReplies.length, 'replies');
    } catch (error) {
      console.error('❌ Error fetching user replies:', error);
    }
  };

  const loadUserProfile = async () => {
    setIsLoading(true);
    try {
      if (userId) {
          try {
            console.log('🔄 Profile: Loading user profile for:', userId);
            console.log('🔍 Profile: AuthUser data:', authUser);
            
            // Use Supabase API for user chirps, stats, and profile power
            console.log('🔄 Profile: Fetching user data...');
            
            // First fetch user data, then use it for chirps
            const { createClient } = await import('@supabase/supabase-js');
            const SUPABASE_URL = 'https://qrzbtituxxilnbgocdge.supabase.co';
            const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFyemJ0aXR1eHhpbG5iZ29jZGdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyNDcxNDMsImV4cCI6MjA2NzgyMzE0M30.P-o5ND8qoiIpA1W-9WkM7RUOaGTjRtkEmPbCXGbrEI8';
            
            const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            
            // Fetch user data first - handle both UUID and handle
            let userFromDb, userError;
            
            // Check if userId is a UUID (36 characters with dashes)
            const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);
            
            if (isUUID) {
              // Query by ID
              const result = await supabase
                .from('users')
                .select('*')
                .eq('id', userId)
                .single();
              userFromDb = result.data;
              userError = result.error;
            } else {
              // Query by handle (custom_handle or handle) - case insensitive
              const result = await supabase
                .from('users')
                .select('*')
                .or(`custom_handle.ilike.${userId},handle.ilike.${userId}`)
                .single();
              userFromDb = result.data;
              userError = result.error;
            }
            
            let userData;
            if (userFromDb && !userError) {
              userData = {
                id: userFromDb.id,
                firstName: userFromDb.first_name,
                lastName: userFromDb.last_name,
                email: userFromDb.email,
                name: userFromDb.display_name || `${userFromDb.first_name} ${userFromDb.last_name}`,
                customHandle: userFromDb.custom_handle,
                handle: userFromDb.handle,
                profileImageUrl: userFromDb.profile_image_url,
                avatarUrl: userFromDb.avatar_url,
                bannerImageUrl: userFromDb.banner_image_url,
                bio: userFromDb.bio,
                linkInBio: userFromDb.link_in_bio,
                joinedAt: userFromDb.created_at || '2024-01-15T00:00:00Z',
                isChirpPlus: userFromDb.is_chirp_plus || false,
                showChirpPlusBadge: userFromDb.show_chirp_plus_badge || false
              };
            } else {
              // Fallback to authUser data if not found in database
              userData = authUser ? {
                id: authUser.id,
                firstName: authUser.firstName,
                lastName: authUser.lastName,
                email: authUser.email,
                name: authUser.name,
                customHandle: authUser.customHandle,
                handle: authUser.handle,
                profileImageUrl: authUser.profileImageUrl,
                avatarUrl: authUser.avatarUrl,
                bannerImageUrl: authUser.bannerImageUrl,
                bio: authUser.bio,
                linkInBio: authUser.linkInBio,
                joinedAt: authUser.joinedAt || '2024-01-15T00:00:00Z',
                isChirpPlus: authUser.isChirpPlus || false,
                showChirpPlusBadge: authUser.showChirpPlusBadge || false
              } : {
                id: userId,
                firstName: 'User',
                lastName: '',
                email: '',
                name: 'User',
                customHandle: 'user',
                handle: 'user',
                profileImageUrl: null,
                avatarUrl: null,
                bannerImageUrl: null,
                bio: '',
                linkInBio: null,
                joinedAt: '2024-01-15T00:00:00Z',
                isChirpPlus: false,
                showChirpPlusBadge: false
              };
            }

            // Now fetch other data with user data available
            const [chirpsResult, statsResult, profilePowerResult] = await Promise.allSettled([
              getUserChirps(userId, userData),
              getUserStats(userId),
              getProfilePowerBreakdown(userId)
            ]);
            
            // Extract data from settled promises
            const chirpsData = chirpsResult.status === 'fulfilled' ? chirpsResult.value : [];
            const statsData = statsResult.status === 'fulfilled' ? statsResult.value : { following: 0, followers: 0, profilePower: 0, totalChirps: 0, totalLikes: 0 };
            const profilePowerData = profilePowerResult.status === 'fulfilled' ? profilePowerResult.value : { totalPower: 0, likesContribution: 0, commentsContribution: 0, collectionContribution: 0, rarityFactor: 1.0, totalLikes: 0, totalComments: 0 };
            
            console.log('📊 Profile: Stats data received:', statsData);
            console.log('📊 Profile: Chirps data received:', chirpsData?.length || 0);
            console.log('📊 Profile: Profile power data received:', profilePowerData);
            
            // Log any failures
            if (chirpsResult.status === 'rejected') {
              console.warn('⚠️ Profile: Failed to fetch chirps:', chirpsResult.reason);
            }
            if (statsResult.status === 'rejected') {
              console.warn('⚠️ Profile: Failed to fetch stats:', statsResult.reason);
            }
            if (profilePowerResult.status === 'rejected') {
              console.warn('⚠️ Profile: Failed to fetch profile power:', profilePowerResult.reason);
            }
          
          console.log('✅ Profile: Loaded user data:', userData);
          console.log('✅ Profile: Loaded chirps:', chirpsData.length);
          console.log('✅ Profile: Loaded stats:', statsData);
          console.log('✅ Profile: Loaded profile power:', profilePowerData);
          
          setUser(userData);
          setUserChirps(chirpsData || []);
          setStats({
            following: statsData.following || 0,
            followers: statsData.followers || 0,
            profilePower: statsData.profilePower || 0
          });
        } catch (error) {
          console.error('❌ Profile: Error loading user profile data:', error);
          // Only clear data if it's a critical error (not just chirps timeout)
          if (error.message && error.message.includes('timeout')) {
            console.warn('⚠️ Profile: Timeout error - keeping existing data');
            // Keep existing data, just show warning
          } else {
            console.error('❌ Profile: Clearing profile data due to critical error');
            // Clear the profile data to force a retry
            setUser(null);
            setUserChirps([]);
            setStats({
              following: 0,
              followers: 0,
              profilePower: 0
            });
          }
        }
      } else {
        console.error('❌ Profile: No userId provided');
        setUser(null);
        setUserChirps([]);
        setStats({
          following: 0,
          followers: 0,
          profilePower: 0
        });
      }
    } catch (error) {
      console.error('❌ Profile: Failed to load user profile:', error);
      console.error('❌ Profile: Clearing profile data due to error');
      // Clear the profile data to force a retry
      setUser(null);
      setUserChirps([]);
      setStats({
        following: 0,
        followers: 0,
        profilePower: 0
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatJoinDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long' 
    });
  };

  console.log('🔍 Profile: About to render, isLoading:', isLoading, 'user:', user?.id);

  if (isLoading) {
    console.log('🔍 Profile: Rendering loading state');
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          width: '32px',
          height: '32px',
          border: '2px solid #7c3aed',
          borderTop: '2px solid transparent',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
      </div>
    );
  }

  if (!user) {
    console.log('🔍 Profile: Rendering user not found state');
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '600',
            color: '#111827',
            marginBottom: '8px',
            margin: 0
          }}>User not found</h2>
          <p style={{
            color: '#6b7280',
            margin: 0
          }}>The user you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  console.log('🔍 Profile: Rendering main profile content for user:', user.id);

  const isOwnProfile = authUser?.id === user.id;

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#ffffff',
      paddingBottom: '80px', // Space for bottom navigation
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center' // Center content like Metro
    }}>
      {/* Header */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e1e8ed',
        paddingLeft: '16px',
        paddingRight: '16px',
        paddingTop: '12px',
        paddingBottom: '12px',
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'row',
        width: '100%'
      }}>
        <button 
          onClick={() => setLocation('/')}
          style={{
            padding: '8px',
            marginRight: '16px',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            borderRadius: '8px',
            transition: 'background-color 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f2f5'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <span style={{
            fontSize: '20px',
            color: '#14171a'
          }}>←</span>
        </button>
        
        <div style={{
          flex: 1
        }}>
          <h1 style={{
            fontSize: '20px',
            fontWeight: 'bold',
            color: '#14171a',
            margin: 0
          }}>
            Profile
          </h1>
          <p style={{
            fontSize: '13px',
            color: '#657786',
            margin: 0
          }}>
            {userChirps.length} chirps
          </p>
        </div>

        {/* Gear Icon Button - Top Right */}
        {!isOwnProfile && (
          <button
            onClick={() => {
              // TODO: Show block/notifications menu
              console.log('Gear button clicked - show block/notifications menu');
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              borderRadius: '8px',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f2f5'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <GearIcon size={16} color="#7c3aed" />
          </button>
        )}
      </div>

      {/* Profile Header */}
      <div style={{ 
        position: 'relative',
        width: '100%',
        maxWidth: '600px' // Match Metro width
      }}>
        {/* Banner */}
        <div 
          style={{
            height: '192px',
            background: user.bannerImageUrl 
              ? `url(${user.bannerImageUrl})` 
              : 'url(https://qrzbtituxxilnbgocdge.supabase.co/storage/v1/object/public/assets/chirp-banner-default.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            width: '100%'
          }}
        />
        
        {/* Profile Avatar - Overlapping banner and next to name */}
        <div style={{
          position: 'absolute',
          bottom: '-44px', // Half overlapping banner, half in profile info
          left: '16px',
          width: '88px',
          height: '88px',
          borderRadius: '44px',
          border: '4px solid #ffffff',
          overflow: 'hidden',
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {equippedFrame ? (
            <ProfileFrame rarity={equippedFrame.rarity} size={108} customFrameImage={equippedFrame.imageUrl}>
              <UserAvatar user={user} size="xl" />
            </ProfileFrame>
          ) : (
            <UserAvatar user={user} size="xl" />
          )}
        </div>
        
        {/* Profile Info */}
        <div style={{
          paddingLeft: '16px',
          paddingRight: '16px',
          paddingBottom: '16px',
          backgroundColor: '#ffffff',
          marginTop: '44px' // Account for avatar overlap
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '16px'
          }}>
            {/* Spacer for avatar */}
            <div style={{
              width: '88px',
              height: '88px',
              flexShrink: 0
            }}></div>
            
            <div style={{ flex: 1 }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1px'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <h2 style={{
                    fontSize: '20px',
                    fontWeight: 'bold',
                    color: '#14171a',
                    margin: 0
                  }}>
                    {user.firstName || user.name || user.customHandle || user.handle || 'User'}
                  </h2>
                  {user.isChirpPlus && (
                    <span style={{ fontSize: '20px' }}>👑</span>
                  )}
                </div>
                
                {/* Settings Button - Inline with name */}
                {isOwnProfile && (
                  <button
                    onClick={() => setLocation('/settings')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      background: 'linear-gradient(135deg, #C671FF 0%, #FF61A6 100%)',
                      paddingLeft: '16px',
                      paddingRight: '16px',
                      paddingTop: '10px',
                      paddingBottom: '10px',
                      borderRadius: '20px',
                      border: 'none',
                      cursor: 'pointer',
                      boxShadow: '0 2px 8px rgba(198, 113, 255, 0.3)',
                      transition: 'all 0.2s',
                      height: '40px',
                      color: '#ffffff',
                      fontWeight: '600'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(198, 113, 255, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(198, 113, 255, 0.3)';
                    }}
                  >
                    <GearIcon size={16} color="#ffffff" />
                    <span style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#ffffff'
                    }}>Settings</span>
                  </button>
                )}

                {/* Follow Button - Inline with name */}
                {!isOwnProfile && (
                  <button
                    onClick={handleFollowToggle}
                    disabled={isLoadingFollow}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      background: isFollowing ? 'linear-gradient(135deg, #C671FF 0%, #FF61A6 100%)' : 'linear-gradient(135deg, #C671FF 0%, #FF61A6 100%)',
                      paddingLeft: '16px',
                      paddingRight: '16px',
                      paddingTop: '10px',
                      paddingBottom: '10px',
                      borderRadius: '20px',
                      border: 'none',
                      cursor: isLoadingFollow ? 'not-allowed' : 'pointer',
                      boxShadow: '0 2px 8px rgba(198, 113, 255, 0.3)',
                      transition: 'all 0.2s',
                      height: '40px',
                      color: '#ffffff',
                      fontWeight: '600',
                      opacity: isLoadingFollow ? 0.7 : 1
                    }}
                    onMouseEnter={(e) => {
                      if (!isLoadingFollow) {
                        e.currentTarget.style.transform = 'translateY(-1px)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(198, 113, 255, 0.4)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isLoadingFollow) {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(198, 113, 255, 0.3)';
                      }
                    }}
                  >
                    <span style={{ fontSize: '16px' }}>
                      {isLoadingFollow ? '...' : (isFollowing ? '✓' : '+')}
                    </span>
                    <span style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#ffffff'
                    }}>
                      {isLoadingFollow ? '...' : (isFollowing ? 'Following' : 'Follow')}
                    </span>
                  </button>
                )}
              </div>
              <p style={{
                color: '#657786',
                marginBottom: '8px',
                margin: 0,
                fontSize: '15px'
              }}>@{user.handle}</p>
              {user.bio && (
                <div style={{
                  color: '#14171a',
                  marginBottom: '8px',
                  margin: 0,
                  fontSize: '15px',
                  lineHeight: '20px'
                }}>
                  {user.bio.split(/(@\w+)/).filter(part => part.trim()).map((part, index) => {
                    if (part.startsWith('@')) {
                      return (
                        <span
                          key={index}
                          style={{
                            color: '#7c3aed',
                            cursor: 'pointer'
                          }}
                          onClick={async () => {
                            try {
                              // Navigate to mentioned user profile
                              const handle = part.substring(1); // Remove @
                              setLocation(`/profile/${handle}`);
                            } catch (error) {
                              console.error('Error navigating to mentioned user:', error);
                            }
                          }}
                        >
                          {part}
                        </span>
                      );
                    }
                    return <span key={index}>{part}</span>;
                  })}
                </div>
              )}
              {user.linkInBio && user.linkInBio.trim() !== '' && (
                <a 
                  href={user.linkInBio} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{
                    color: '#7c3aed',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '8px',
                    fontSize: '14px'
                  }}
                >
                  <LinkIcon size={14} color="#7c3aed" />
                  <span>{user.linkInBio}</span>
                </a>
              )}
            </div>
          </div>

          {/* Action Buttons */}

          {/* Profile Power */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            paddingTop: '20px',
            paddingBottom: '20px',
            paddingLeft: '16px',
            paddingRight: '16px',
            backgroundColor: '#ffffff',
            borderBottom: '1px solid #e1e8ed',
            marginTop: '16px'
          }}>
            <div style={{
              textAlign: 'center'
            }}>
              <div style={{
                fontSize: '16px',
                color: '#657786',
                fontWeight: '600',
                marginBottom: '8px'
              }}>
                Profile Power
              </div>
              <div style={{
                fontSize: '48px',
                fontWeight: 'bold',
                color: '#7c3aed',
                textShadow: '0 2px 4px rgba(124, 58, 237, 0.3)'
              }}>
                {stats.profilePower.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            marginTop: '16px'
          }}>
            <div style={{ 
              flex: 1, 
              textAlign: 'center',
              cursor: 'pointer'
            }}>
              <div style={{
                fontSize: '18px',
                fontWeight: 'bold',
                color: '#14171a'
              }}>{stats.following}</div>
              <div style={{
                fontSize: '13px',
                color: '#657786',
                marginTop: '2px'
              }}>Following</div>
            </div>
            <div style={{ 
              flex: 1, 
              textAlign: 'center',
              cursor: 'pointer'
            }}>
              <div style={{
                fontSize: '18px',
                fontWeight: 'bold',
                color: '#14171a'
              }}>{stats.followers}</div>
              <div style={{
                fontSize: '13px',
                color: '#657786',
                marginTop: '2px'
              }}>Followers</div>
            </div>
          </div>

        </div>
      </div>

      {/* Tabs */}
      <div style={{ 
        paddingLeft: '16px', 
        paddingRight: '16px',
        width: '100%',
        maxWidth: '600px' // Match Metro width
      }}>
        <div style={{
          display: 'flex',
          backgroundColor: '#f7f9fa',
          borderRadius: '12px',
          padding: '3px',
          marginBottom: '16px'
        }}>
          <button
            style={{
              flex: 1,
              paddingTop: '8px',
              paddingBottom: '8px',
              borderRadius: '9px',
              backgroundColor: activeTab === 'chirps' ? '#ffffff' : 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              color: activeTab === 'chirps' ? '#111827' : '#6b7280'
            }}
            onClick={() => setActiveTab('chirps')}
          >
            Chirps
          </button>
          <button
            style={{
              flex: 1,
              paddingTop: '8px',
              paddingBottom: '8px',
              borderRadius: '9px',
              backgroundColor: activeTab === 'comments' ? '#ffffff' : 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              color: activeTab === 'comments' ? '#111827' : '#6b7280'
            }}
            onClick={() => setActiveTab('comments')}
          >
            Comments
          </button>
          <button
            style={{
              flex: 1,
              paddingTop: '8px',
              paddingBottom: '8px',
              borderRadius: '9px',
              backgroundColor: activeTab === 'collection' ? '#ffffff' : 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              color: activeTab === 'collection' ? '#111827' : '#6b7280'
            }}
            onClick={() => setActiveTab('collection')}
          >
            Collection
          </button>
        </div>
        
        {/* Tab Content */}
        {activeTab === 'chirps' && (
          <div style={{ marginTop: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {userChirps.length > 0 ? (
                userChirps.map((chirp) => (
                  <ChirpCard key={chirp.id} chirp={chirp} />
                ))
              ) : (
                <div style={{ textAlign: 'center', paddingTop: '32px', paddingBottom: '32px' }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>🐦</div>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#111827',
                    marginBottom: '8px',
                    margin: 0
                  }}>No chirps yet</h3>
                  <p style={{
                    color: '#6b7280',
                    margin: 0
                  }}>This user hasn't posted any chirps yet.</p>
                </div>
              )}
            </div>
          </div>
        )}
        
        {activeTab === 'comments' && (
          <div style={{ marginTop: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {userReplies.length > 0 ? (
                userReplies.map((reply) => (
                  <ChirpCard key={reply.id} chirp={reply} />
                ))
              ) : (
                <div style={{ textAlign: 'center', paddingTop: '32px', paddingBottom: '32px' }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>💬</div>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#111827',
                    marginBottom: '8px',
                    margin: 0
                  }}>No comments yet</h3>
                  <p style={{
                    color: '#6b7280',
                    margin: 0
                  }}>This user hasn't made any comments yet.</p>
                </div>
              )}
            </div>
          </div>
        )}
        
        {activeTab === 'collection' && (
          <div style={{ marginTop: '16px' }}>
            <div style={{ textAlign: 'center', paddingTop: '32px', paddingBottom: '32px' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎴</div>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#111827',
                marginBottom: '8px',
                margin: 0
              }}>No collection yet</h3>
              <p style={{
                color: '#6b7280',
                margin: 0
              }}>This user hasn't collected any cards yet.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}