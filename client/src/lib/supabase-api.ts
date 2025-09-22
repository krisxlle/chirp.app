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
