// Supabase API functions for web client
import { createClient } from '@supabase/supabase-js';

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

export const getForYouChirps = async (limit: number = 20, offset: number = 0, user?: any) => {
  console.log('🔍 getForYouChirps called with:', { limit, offset });
  
  try {
    // Fetch main chirps (non-replies only) with author data
    const { data: chirps, error } = await supabase
      .from('chirps')
      .select(`
        *,
        author:users!chirps_author_id_fkey (
          id,
          first_name,
          last_name,
          email,
          handle,
          custom_handle,
          profile_image_url,
          avatar_url
        )
      `)
      .is('reply_to_id', null)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('❌ Error fetching chirps:', error);
      return [];
    }

    // For each chirp, fetch its replies
    const chirpsWithReplies = await Promise.all(
      (chirps || []).map(async (chirp: any) => {
        // Fetch replies for this chirp
        const { data: replies, error: repliesError } = await supabase
          .from('chirps')
          .select(`
            *,
            author:users!chirps_author_id_fkey (
              id,
              first_name,
              last_name,
              email,
              handle,
              custom_handle,
              profile_image_url,
              avatar_url
            )
          `)
          .eq('reply_to_id', chirp.id)
          .order('created_at', { ascending: true });

        // Get reaction count
        const { count: reactionCount } = await supabase
          .from('reactions')
          .select('*', { count: 'exact', head: true })
          .eq('chirp_id', chirp.id);

        // Check if user has liked
        let userHasLiked = false;
        if (user?.id) {
          const { data: userReaction } = await supabase
            .from('reactions')
            .select('id')
            .eq('chirp_id', chirp.id)
            .eq('user_id', user.id)
            .maybeSingle();
          userHasLiked = !!userReaction;
        }

        // Transform replies
        const transformedReplies = (replies || []).map((reply: any) => ({
          id: String(reply.id),
          content: reply.content,
          createdAt: reply.created_at,
          replyToId: String(reply.reply_to_id),
          author: {
            id: reply.author.id,
            firstName: reply.author.first_name,
            lastName: reply.author.last_name,
            email: reply.author.email,
            handle: reply.author.handle,
            customHandle: reply.author.custom_handle,
            profileImageUrl: reply.author.profile_image_url,
            avatarUrl: reply.author.avatar_url,
            isChirpPlus: false,
            showChirpPlusBadge: false
          },
          replyCount: 0,
          reactionCount: 0,
          userHasLiked: false,
          isWeeklySummary: false,
          imageUrl: reply.image_url,
          imageAltText: reply.image_alt_text,
          imageWidth: reply.image_width,
          imageHeight: reply.image_height,
          isDirectReply: true,
          isNestedReply: false,
          isThreadedChirp: false
        }));

        return {
          id: String(chirp.id),
          content: chirp.content,
          createdAt: chirp.created_at,
          replyToId: chirp.reply_to_id,
          author: {
            id: chirp.author.id,
            firstName: chirp.author.first_name,
            lastName: chirp.author.last_name,
            email: chirp.author.email,
            handle: chirp.author.handle,
            customHandle: chirp.author.custom_handle,
            profileImageUrl: chirp.author.profile_image_url,
            avatarUrl: chirp.author.avatar_url,
            isChirpPlus: false,
            showChirpPlusBadge: false
          },
          replyCount: transformedReplies.length,
          reactionCount: reactionCount || 0,
          userHasLiked,
          isWeeklySummary: false,
          imageUrl: chirp.image_url,
          imageAltText: chirp.image_alt_text,
          imageWidth: chirp.image_width,
          imageHeight: chirp.image_height,
          repliesList: transformedReplies, // Add replies list for threading
          isThreadedChirp: transformedReplies.length > 0
        };
      })
    );

    console.log(`✅ Fetched ${chirpsWithReplies.length} chirps with replies`);
    return chirpsWithReplies;
  } catch (error) {
    console.error('❌ Error in getForYouChirps:', error);
    return [];
  }
};

export const getCollectionFeedChirps = async (userId: string, limit: number = 10, offset: number = 0) => {
  console.log('🔍 getCollectionFeedChirps called with:', { userId, limit, offset });
  
  try {
    // Get users that this user follows
    const { data: following, error: followingError } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', userId);

    if (followingError) {
      console.error('❌ Error fetching following list:', followingError);
      return [];
    }

    const followingIds = (following || []).map(f => f.following_id);
    
    // If not following anyone, return empty array
    if (followingIds.length === 0) {
      console.log('ℹ️ User is not following anyone');
      return [];
    }

    // Fetch chirps from followed users (non-replies only) with author data
    const { data: chirps, error } = await supabase
      .from('chirps')
      .select(`
        *,
        author:users!chirps_author_id_fkey (
          id,
          first_name,
          last_name,
          email,
          handle,
          custom_handle,
          profile_image_url,
          avatar_url
        )
      `)
      .in('author_id', followingIds)
      .is('reply_to_id', null)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('❌ Error fetching collection feed chirps:', error);
      return [];
    }

    // For each chirp, fetch its replies
    const chirpsWithReplies = await Promise.all(
      (chirps || []).map(async (chirp: any) => {
        // Fetch replies for this chirp
        const { data: replies, error: repliesError } = await supabase
          .from('chirps')
          .select(`
            *,
            author:users!chirps_author_id_fkey (
              id,
              first_name,
              last_name,
              email,
              handle,
              custom_handle,
              profile_image_url,
              avatar_url
            )
          `)
          .eq('reply_to_id', chirp.id)
          .order('created_at', { ascending: true });

        // Get reaction count
        const { count: reactionCount } = await supabase
          .from('reactions')
          .select('*', { count: 'exact', head: true })
          .eq('chirp_id', chirp.id);

        // Check if user has liked
        const { data: userReaction } = await supabase
          .from('reactions')
          .select('id')
          .eq('chirp_id', chirp.id)
          .eq('user_id', userId)
          .maybeSingle();

        // Transform replies
        const transformedReplies = (replies || []).map((reply: any) => ({
          id: String(reply.id),
          content: reply.content,
          createdAt: reply.created_at,
          replyToId: String(reply.reply_to_id),
          author: {
            id: reply.author.id,
            firstName: reply.author.first_name,
            lastName: reply.author.last_name,
            email: reply.author.email,
            handle: reply.author.handle,
            customHandle: reply.author.custom_handle,
            profileImageUrl: reply.author.profile_image_url,
            avatarUrl: reply.author.avatar_url,
            isChirpPlus: false,
            showChirpPlusBadge: false
          },
          replyCount: 0,
          reactionCount: 0,
          userHasLiked: false,
          isWeeklySummary: false,
          imageUrl: reply.image_url,
          imageAltText: reply.image_alt_text,
          imageWidth: reply.image_width,
          imageHeight: reply.image_height,
          isDirectReply: true,
          isNestedReply: false,
          isThreadedChirp: false
        }));

        return {
          id: String(chirp.id),
          content: chirp.content,
          createdAt: chirp.created_at,
          replyToId: chirp.reply_to_id,
          author: {
            id: chirp.author.id,
            firstName: chirp.author.first_name,
            lastName: chirp.author.last_name,
            email: chirp.author.email,
            handle: chirp.author.handle,
            customHandle: chirp.author.custom_handle,
            profileImageUrl: chirp.author.profile_image_url,
            avatarUrl: chirp.author.avatar_url,
            isChirpPlus: false,
            showChirpPlusBadge: false
          },
          replyCount: transformedReplies.length,
          reactionCount: reactionCount || 0,
          userHasLiked: !!userReaction,
          isWeeklySummary: false,
          imageUrl: chirp.image_url,
          imageAltText: chirp.image_alt_text,
          imageWidth: chirp.image_width,
          imageHeight: chirp.image_height,
          repliesList: transformedReplies, // Add replies list for threading
          isThreadedChirp: transformedReplies.length > 0
        };
      })
    );

    console.log(`✅ Fetched ${chirpsWithReplies.length} collection feed chirps with replies`);
    return chirpsWithReplies;
  } catch (error) {
    console.error('❌ Error in getCollectionFeedChirps:', error);
    return [];
  }
};

export const getUserChirps = async (userId: string) => {
  console.log('🔍 getUserChirps called with:', { userId });
  
  // For now, return mock user chirps
  // TODO: Replace with real Supabase API call
  return [
    {
      id: 'user-1',
      content: 'This is a chirp from the user profile! 👤',
      createdAt: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
      author: {
        id: userId,
        firstName: 'User',
        lastName: 'Profile',
        email: 'user@chirp.com',
        handle: 'userprofile',
        customHandle: 'userprofile',
        profileImageUrl: null,
        avatarUrl: null,
        isChirpPlus: false,
        showChirpPlusBadge: false
      },
      likes: 12,
      replies: 3,
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
      id: 'user-2',
      content: 'Another chirp from this user! 🎉',
      createdAt: new Date(Date.now() - 600000).toISOString(), // 10 minutes ago
      author: {
        id: userId,
        firstName: 'User',
        lastName: 'Profile',
        email: 'user@chirp.com',
        handle: 'userprofile',
        customHandle: 'userprofile',
        profileImageUrl: null,
        avatarUrl: null,
        isChirpPlus: false,
        showChirpPlusBadge: false
      },
      likes: 8,
      replies: 2,
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
};

export const getUserStats = async (userId: string) => {
  console.log('🔍 getUserStats called with:', { userId });
  
  // Return mock data for web compatibility
  return {
    following: 150,
    followers: 320,
    profilePower: 1250,
    totalChirps: 42,
    totalLikes: 1250
  };
};

export const getProfilePowerBreakdown = async (userId: string) => {
  console.log('🔍 getProfilePowerBreakdown called with:', { userId });
  
  // Return mock data for web compatibility
  return {
    totalPower: 1250,
    likesContribution: 800,
    commentsContribution: 300,
    collectionContribution: 150,
    rarityFactor: 1.0,
    totalLikes: 1250,
    totalComments: 89
  };
};

export const createChirp = async (content: string, authorId: string, replyToId?: string | null, imageData?: {
  imageUrl?: string;
  imageAltText?: string;
  imageWidth?: number;
  imageHeight?: number;
}) => {
  console.log('🔍 createChirp called with:', { 
    content: content.substring(0, 50) + '...', 
    authorId, 
    replyToId, 
    hasImageData: !!imageData 
  });
  
  // Return mock success response
  return {
    id: Date.now().toString(),
    content,
    authorId,
    replyToId,
    createdAt: new Date().toISOString(),
    success: true
  };
};

// Profile Frame Gacha System Functions
export const rollProfileFrame = async (userId: string) => {
  console.log('🎲 rollProfileFrame called with:', { userId });
  
  // Return mock frame data for web compatibility
  const mockFrames = [
    {
      id: 1,
      name: 'Golden Aura',
      rarity: 'legendary' as const,
      imageUrl: '/assets/Legendary Frame.png',
      isNew: true
    },
    {
      id: 2,
      name: 'Crystal Shard',
      rarity: 'epic' as const,
      imageUrl: '/assets/Epic Frame.png',
      isNew: false
    },
    {
      id: 3,
      name: 'Silver Lining',
      rarity: 'rare' as const,
      imageUrl: '/assets/Rare Frame.png',
      isNew: true
    }
  ];
  
  // Return a random frame
  const randomFrame = mockFrames[Math.floor(Math.random() * mockFrames.length)];
  return randomFrame;
};

export const getUserFrameCollection = async (userId: string) => {
  console.log('🎮 getUserFrameCollection called with:', { userId });
  
  // Return mock collection data for web compatibility
  return [
    {
      id: 1,
      frameId: 1,
      name: 'Golden Aura',
      description: 'A legendary frame with golden energy',
      rarity: 'legendary' as const,
      imageUrl: '/assets/Legendary Frame.png',
      quantity: 1,
      obtainedAt: new Date().toISOString(),
      seasonName: 'Season 1',
      isEquipped: true
    },
    {
      id: 2,
      frameId: 2,
      name: 'Crystal Shard',
      description: 'An epic frame with crystal effects',
      rarity: 'epic' as const,
      imageUrl: '/assets/Epic Frame.png',
      quantity: 2,
      obtainedAt: new Date(Date.now() - 86400000).toISOString(),
      seasonName: 'Season 1',
      isEquipped: false
    }
  ];
};

export const equipProfileFrame = async (userId: string, frameId: number) => {
  console.log('⚡ equipProfileFrame called with:', { userId, frameId });
  
  // Return mock success response
  return true;
};

export const getUserEquippedFrame = async (userId: string) => {
  console.log('👤 getUserEquippedFrame called with:', { userId });
  
  // Return mock equipped frame data
  return {
    id: 1,
    name: 'Golden Aura',
    rarity: 'legendary' as const,
    imageUrl: '/assets/Legendary Frame.png'
  };
};

export const getAvailableFrames = async () => {
  console.log('🎯 getAvailableFrames called');
  
  // Return mock available frames for current season
  return [
    {
      id: 1,
      name: 'Golden Aura',
      description: 'A legendary frame with golden energy',
      rarity: 'legendary' as const,
      imageUrl: '/assets/Legendary Frame.png',
      previewUrl: '/assets/Legendary Frame Preview.png',
      seasonId: 1,
      seasonName: 'Season 1',
      dropRate: 0.01,
      isNew: false,
      quantity: 0,
      obtainedAt: null,
      isEquipped: false
    },
    {
      id: 2,
      name: 'Crystal Shard',
      description: 'An epic frame with crystal effects',
      rarity: 'epic' as const,
      imageUrl: '/assets/Epic Frame.png',
      previewUrl: '/assets/Epic Frame Preview.png',
      seasonId: 1,
      seasonName: 'Season 1',
      dropRate: 0.05,
      isNew: false,
      quantity: 0,
      obtainedAt: null,
      isEquipped: false
    },
    {
      id: 3,
      name: 'Silver Lining',
      description: 'A rare frame with silver accents',
      rarity: 'rare' as const,
      imageUrl: '/assets/Rare Frame.png',
      previewUrl: '/assets/Rare Frame Preview.png',
      seasonId: 1,
      seasonName: 'Season 1',
      dropRate: 0.15,
      isNew: false,
      quantity: 0,
      obtainedAt: null,
      isEquipped: false
    }
  ];
};