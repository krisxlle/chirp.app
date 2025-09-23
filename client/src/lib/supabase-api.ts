// Supabase API functions for web client
// Mock implementations for web compatibility

// Note: Real database functions are not imported to avoid React Native dependencies in web build

export const getForYouChirps = async (limit: number = 20, offset: number = 0) => {
  console.log('🔍 getForYouChirps called with:', { limit, offset });
  
  // Return mock data for now to avoid connection errors
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
};

export const getCollectionFeedChirps = async (userId: string, limit: number = 10, offset: number = 0) => {
  console.log('🔍 getCollectionFeedChirps called with:', { userId, limit, offset });
  
  // Return mock data for collection feed
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