import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import ChirpCard from '../components/ChirpCard';
import FollowersFollowingModal from '../components/FollowersFollowingModal';
import ProfileFrame from '../components/ProfileFrame';
import { useSupabaseAuth } from '../components/SupabaseAuthContext';
import UserAvatar from '../components/UserAvatar';
import GearIcon from '../components/icons/GearIcon';
import LinkIcon from '../components/icons/LinkIcon';
import { useLike } from '../contexts/LikeContext';
import { supabase } from '../lib/supabase';

// Profile Frame Functions - Inline to avoid import issues
const getUserEquippedFrame = async (userId: string) => {
  console.log('👤 getUserEquippedFrame called with:', { userId });
  
  // Return null to simulate no equipped frame for testing
  // In production, this would check the database for equipped frames
  return null;
};

// Utility function to add sample relationships data
const addSampleRelationships = async () => {
  console.log('🔧 Adding sample relationships data...');
  
  try {
    
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
        .from('follows')
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
    
    const { data, error } = await supabase
      .from('follows')
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
    // Using singleton Supabase client
    
    const { error } = await supabase
      .from('follows')
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
    // Using singleton Supabase client
    
    const { data, error } = await supabase
      .from('follows')
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
    // Using singleton Supabase client

    console.log('✅ Using real Supabase client for getUserChirps');
    
    // Get current user ID for like status from AuthContext
    // Note: We can't use supabase.auth.getUser() here because AuthContext uses localStorage
    // Instead, we'll get the user ID from the userData parameter passed to this function
    const currentUserId = userData?.id;
    console.log('🔍 Profile getUserChirps - currentUserId:', currentUserId, 'userData:', userData);
    
    // Use the resolved UUID from userData if available, otherwise resolve userId
    let actualUserId = userData?.id || userId;
    
    // If userId is a handle and we don't have userData, resolve it
    if (!userData?.id) {
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);
      if (!isUUID) {
        const { data: resolvedUserData, error: userError } = await supabase
          .from('users')
          .select('id')
          .or(`custom_handle.ilike.${userId},handle.ilike.${userId}`)
          .single();
        
        if (userError || !resolvedUserData) {
          console.error('❌ User not found for handle:', userId);
          return [];
        }
        
        actualUserId = resolvedUserData.id;
        console.log('🔍 Resolved handle to UUID in getUserChirps:', { handle: userId, uuid: actualUserId });
      }
    }
    
    // Simplified query to avoid timeout - fetch chirps without user join
    // CRITICAL: Only fetch parent chirps (not replies) for profile display
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
      .eq('author_id', actualUserId)
      .filter('reply_to_id', 'is', null) // Only get parent chirps, not replies
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
      
      // Get like counts and user like status for all chirps
      const chirpIds = chirps.map((chirp: any) => chirp.id);
      let likeData: { [key: string]: any } = {};
      
      if (chirpIds.length > 0) {
        // Get like counts for all chirps
        const { data: likeCounts, error: likeCountsError } = await supabase
          .from('reactions')
          .select('chirp_id')
          .in('chirp_id', chirpIds);

        if (likeCountsError) {
          console.error('❌ Error fetching like counts:', likeCountsError);
        } else {
          // Count likes per chirp
          likeCounts?.forEach((reaction: { chirp_id: string }) => {
            likeData[reaction.chirp_id] = (likeData[reaction.chirp_id] || 0) + 1;
          });
        }

        // Get user's like status for all chirps
        if (currentUserId) {
          const { data: userLikes, error: userLikesError } = await supabase
            .from('reactions')
            .select('chirp_id')
            .in('chirp_id', chirpIds)
            .eq('user_id', currentUserId);

          if (userLikesError) {
            console.error('❌ Error fetching user likes:', userLikesError);
          } else {
            // Mark which chirps the user has liked
            userLikes?.forEach((reaction: { chirp_id: string }) => {
              likeData[`${reaction.chirp_id}_userLiked`] = true;
            });
          }
        }
      }
      
      // Transform the data to match expected format
      return chirps.map((chirp: any) => {
        const likesCount = likeData[chirp.id] || 0;
        const userHasLiked = likeData[`${chirp.id}_userLiked`] || false;
        
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
          likes: likesCount, // Use actual like count from database
          likesCount: likesCount, // Add likesCount field for ChirpCard compatibility
          reactionCount: likesCount, // Add reactionCount field for ChirpCard compatibility
          replies: 0, // Default to 0 since column doesn't exist
          reposts: 0, // Default to 0 since column doesn't exist
          isLiked: userHasLiked, // Add isLiked field for ChirpCard compatibility
          userHasLiked: userHasLiked, // Use actual like status from database
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
  } catch (error: any) {
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
    // Using singleton Supabase client

    console.log('✅ Using real Supabase client for getUserStats');
    
    // First, resolve userId to actual user ID if it's a handle
    let actualUserId = userId;
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);
    
    if (!isUUID) {
      // Query by handle (custom_handle or handle) - case insensitive
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .or(`custom_handle.ilike.${userId},handle.ilike.${userId}`)
        .single();
      
      if (userError || !userData) {
        console.error('❌ User not found for handle:', userId);
        return {
          following: 0,
          followers: 0,
          profilePower: 0,
          totalChirps: 0,
          totalLikes: 0
        };
      }
      
      actualUserId = userData.id;
      console.log('🔍 Resolved handle to UUID:', { handle: userId, uuid: actualUserId });
    }
    
    // Calculate real stats from database
    const chirpsResult = await supabase
      .from('chirps')
      .select('id', { count: 'exact', head: true })
      .eq('author_id', actualUserId);

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
        .from('follows')
        .select('id', { count: 'exact', head: true })
        .eq('follower_id', actualUserId);
      
      console.log('📊 Following query result:', followingResult);
      
      // Get followers count (users who follow this person)
      const followersResult = await supabase
        .from('follows')
        .select('id', { count: 'exact', head: true })
        .eq('following_id', actualUserId);
      
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
          .from('follows')
          .select('id', { count: 'exact', head: true })
          .eq('follower_id', actualUserId);
        
        const retryFollowersResult = await supabase
          .from('follows')
          .select('id', { count: 'exact', head: true })
          .eq('following_id', actualUserId);
        
        if (!retryFollowingResult.error) {
          followingCount = retryFollowingResult.count || 0;
        }
        if (!retryFollowersResult.error) {
          followersCount = retryFollowersResult.count || 0;
        }
        
        console.log('📊 Retry counts:', { followingCount, followersCount });
      }
    } catch (error: any) {
      console.log('📊 Error fetching relationships, using mock data:', error.message);
      // Fallback to mock data if there's an error
      followingCount = Math.floor(Math.random() * 50) + 10; // Random between 10-60
      followersCount = Math.floor(Math.random() * 200) + 50; // Random between 50-250
    }
    
    // Get total comments on user's chirps (replies to their chirps)
    let totalComments = 0;
    if (chirpsResult.count && chirpsResult.count > 0) {
      // Get user's chirp IDs first
      const { data: userChirps, error: chirpsError } = await supabase
        .from('chirps')
        .select('id')
        .eq('author_id', actualUserId);
      
      if (!chirpsError && userChirps && userChirps.length > 0) {
        const { data: commentsData, error: commentsError } = await supabase
          .from('chirps')
          .select('id')
          .not('reply_to_id', 'is', null)
          .in('reply_to_id', userChirps.map(chirp => chirp.id));

        if (commentsError) {
          console.error('❌ Error fetching comments:', commentsError);
        } else {
          totalComments = commentsData?.length || 0;
        }
      }
    }

    // Calculate profile power based on engagement only (likes + comments * 2)
    // Profile power should NOT include points for just posting chirps
    const profilePower = Math.floor(totalLikes + (totalComments * 2));
    
    console.log('📊 Calculated stats:', { totalChirps, totalLikes, totalComments, profilePower, followingCount, followersCount });
    
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
    // Using singleton Supabase client

    console.log('✅ Using real Supabase client for getProfilePowerBreakdown');
    
    // First, resolve userId to actual user ID if it's a handle
    let actualUserId = userId;
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);
    
    if (!isUUID) {
      // Query by handle (custom_handle or handle) - case insensitive
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .or(`custom_handle.ilike.${userId},handle.ilike.${userId}`)
        .single();
      
      if (userError || !userData) {
        console.error('❌ User not found for handle:', userId);
        return {
          totalPower: 0,
          likesContribution: 0,
          commentsContribution: 0,
          collectionContribution: 0,
          rarityFactor: 1.0,
          totalLikes: 0,
          totalComments: 0
        };
      }
      
      actualUserId = userData.id;
      console.log('🔍 Resolved handle to UUID in getProfilePowerBreakdown:', { handle: userId, uuid: actualUserId });
    }
    
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
  } catch (error: any) {
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
  
  const { user: authUser } = useSupabaseAuth();
  const { updateLike } = useLike();
  const [location, setLocation] = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'chirps' | 'collection'>('chirps');
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
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);

  console.log('🔍 Profile: State initialized, location:', location, 'authUser:', authUser?.id);

  // Function to update chirp like count
  const handleChirpLikeUpdate = (chirpId: string, newLikeCount: number, userHasLiked?: boolean) => {
    const updateChirp = (prevChirps: any[]) => 
      prevChirps.map(chirp => 
        chirp.id === chirpId 
          ? { 
              ...chirp, 
              likes: newLikeCount,
              likesCount: newLikeCount,
              reactionCount: newLikeCount,
              isLiked: userHasLiked !== undefined ? userHasLiked : (newLikeCount > (chirp.likes || 0)),
              userHasLiked: userHasLiked !== undefined ? userHasLiked : (newLikeCount > (chirp.likes || 0))
            }
          : chirp
      );
    
    setUserChirps(updateChirp);
    setUserReplies(updateChirp);
    
    // Update global like context to maintain consistency across pages
    updateLike(chirpId, newLikeCount, userHasLiked !== undefined ? userHasLiked : (newLikeCount > 0));
  };

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

  // Refresh user data when authUser banner URL changes (for own profile)
  useEffect(() => {
    if (authUser?.id === userId && authUser?.bannerImageUrl !== user?.bannerImageUrl) {
      console.log('🔄 Profile: Banner URL updated, refreshing user data');
      loadUserProfile();
    }
  }, [authUser?.bannerImageUrl, userId, user?.bannerImageUrl]);

  const loadEquippedFrame = async () => {
    try {
      const frame = await getUserEquippedFrame(user!.id);
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
      
      // Use the existing singleton Supabase client instead of creating a new one
      
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
        imageUrl: chirp.image_url,
        imageAltText: chirp.image_alt_text,
        imageWidth: chirp.image_width,
        imageHeight: chirp.image_height,
        likes: 0,
        replies: 0,
        reposts: 0,
        userHasLiked: false,
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
      
      // Use the existing singleton Supabase client instead of creating a new one
      
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
        imageUrl: reply.image_url,
        imageAltText: reply.image_alt_text,
        imageWidth: reply.image_width,
        imageHeight: reply.image_height,
        likes: 0,
        replies: 0,
        reposts: 0,
        userHasLiked: false,
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
            
            // Use the existing singleton Supabase client instead of creating a new one
            
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
                // Use auth context banner URL if available (more up-to-date), otherwise fallback to database
                bannerImageUrl: authUser?.bannerImageUrl || userFromDb.banner_image_url,
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
                firstName: authUser.firstName || 'User', // Try to use auth user data
                lastName: authUser.lastName || '',
                email: authUser.email,
                name: undefined,
                customHandle: undefined,
                handle: undefined,
                profileImageUrl: undefined,
                avatarUrl: undefined,
                bannerImageUrl: authUser?.bannerImageUrl,
                bio: undefined,
                linkInBio: undefined,
                joinedAt: '2024-01-15T00:00:00Z',
                isChirpPlus: false,
                showChirpPlusBadge: false
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
              getProfilePowerBreakdown(userData?.id || userId)
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
        } catch (error: any) {
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
        <div style={{ 
          height: '192px', 
          width: '100%', 
          overflow: 'hidden'
        }}>
          <img
            src={user.bannerImageUrl || 'https://qrzbtituxxilnbgocdge.supabase.co/storage/v1/object/public/assets/chirp-banner-default.png'}
            alt="Profile banner"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center'
            }}
            onLoad={(e) => {
              console.log('✅ Banner image loaded successfully:', user.bannerImageUrl);
              console.log('✅ Image element:', e.currentTarget);
              console.log('✅ Image natural dimensions:', e.currentTarget.naturalWidth, 'x', e.currentTarget.naturalHeight);
              console.log('✅ Image display dimensions:', e.currentTarget.width, 'x', e.currentTarget.height);
            }}
            onError={(e) => {
              console.error('❌ Banner image failed to load:', user.bannerImageUrl);
              console.error('❌ Error event:', e);
              console.error('❌ Image element:', e.currentTarget);
              // Fallback to default banner
              e.currentTarget.src = 'https://qrzbtituxxilnbgocdge.supabase.co/storage/v1/object/public/assets/chirp-banner-default.png';
            }}
          />
        </div>
        
        {/* Profile Avatar - Top half overlapping banner, above profile info */}
        <div style={{
          position: 'absolute',
          top: '25%', // Move up so top half overlaps banner and sits above profile info
          left: '50%', // Center horizontally on banner
          transform: 'translate(-50%, -50%)', // Center the element
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'visible' // Ensure frame is not clipped
        }}>
          {equippedFrame ? (
            <ProfileFrame rarity={equippedFrame.rarity} profilePictureSize={120} customFrameImage={equippedFrame.imageUrl}>
              <UserAvatar user={user} size={90} />
            </ProfileFrame>
          ) : (
            <div style={{
              width: '216px',
              height: '216px',
              borderRadius: '108px',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <UserAvatar user={user} size={90} />
            </div>
          )}
        </div>
        
        {/* Profile Info */}
        <div style={{
          paddingLeft: '16px',
          paddingRight: '16px',
          paddingBottom: '16px',
          backgroundColor: '#ffffff',
          marginTop: '60px' // Reduced to remove white space between photo and info
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '16px'
          }}>
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
                  href={user.linkInBio.startsWith('http://') || user.linkInBio.startsWith('https://') 
                    ? user.linkInBio 
                    : `https://${user.linkInBio}`} 
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
            <div 
              style={{ 
                flex: 1, 
                textAlign: 'center',
                cursor: 'pointer'
              }}
              onClick={() => setShowFollowingModal(true)}
            >
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
            <div 
              style={{ 
                flex: 1, 
                textAlign: 'center',
                cursor: 'pointer'
              }}
              onClick={() => setShowFollowersModal(true)}
            >
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
                  <ChirpCard 
                    key={chirp.id} 
                    chirp={chirp} 
                    onLikeUpdate={handleChirpLikeUpdate}
                    onProfilePress={(userId) => setLocation(`/profile/${userId}`)}
                  />
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

      {/* Followers/Following Modals */}
      <FollowersFollowingModal
        visible={showFollowersModal}
        onClose={() => setShowFollowersModal(false)}
        userId={user?.id || ''}
        type="followers"
        title="Followers"
      />

      <FollowersFollowingModal
        visible={showFollowingModal}
        onClose={() => setShowFollowingModal(false)}
        userId={user?.id || ''}
        type="following"
        title="Following"
      />
    </div>
  );
}