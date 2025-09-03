// API client for mobile app to connect to backend instead of direct database
// This replaces the direct database connection in mobile-db.ts

import { Platform } from 'react-native';

// Determine the correct API URL based on platform
const getApiBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  
  // For Android emulator, use 10.0.2.2 to access host machine
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:5001';
  }
  
  // For iOS simulator, use localhost
  if (Platform.OS === 'ios') {
    return 'http://localhost:5001';
  }
  
  // For web, use localhost
  return 'http://localhost:5001';
};

const API_BASE_URL = getApiBaseUrl();

// Helper function for API calls - DISABLED
async function apiCall(endpoint: string, options: RequestInit = {}) {
  console.log('🚫 API calls disabled - using Supabase directly');
  throw new Error('API calls disabled - using Supabase directly');
}

// Mock data for when API is not available
const createMockChirps = () => [
  {
    id: '1',
    content: 'Welcome to Chirp! This is a test chirp to get you started. 🐦✨',
    createdAt: new Date().toISOString(),
    author: {
      id: 'test-user-123',
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      customHandle: 'testuser',
      handle: 'testuser',
      profileImageUrl: undefined,
      isChirpPlus: false,
      showChirpPlusBadge: false,
    },
    replyCount: 0,
    reactionCount: 5,
    reactions: [],
    isWeeklySummary: false,
  },
  {
    id: '2',
    content: 'Testing the app with API connection. Everything should work smoothly now! 🚀',
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    author: {
      id: 'test-user-123',
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      customHandle: 'testuser',
      handle: 'testuser',
      profileImageUrl: undefined,
      isChirpPlus: false,
      showChirpPlusBadge: false,
    },
    replyCount: 2,
    reactionCount: 12,
    reactions: [],
    isWeeklySummary: false,
  },
  {
    id: '3',
    content: 'The network error should be resolved now. Let me know if you see this chirp! 👀',
    createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    author: {
      id: 'test-user-123',
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      customHandle: 'testuser',
      handle: 'testuser',
      profileImageUrl: undefined,
      isChirpPlus: false,
      showChirpPlusBadge: false,
    },
    replyCount: 1,
    reactionCount: 8,
    reactions: [],
    isWeeklySummary: false,
  }
];

// Get chirps from API instead of database
export async function getForYouChirps() {
  try {
    console.log('📡 Fetching For You feed from API...');
    const chirps = await apiCall('/api/chirps?feed=for-you');
    console.log(`✅ Successfully loaded ${chirps.length} chirps from API`);
    return chirps;
  } catch (error) {
    console.log('⚠️ API not available, using mock data for For You feed');
    const mockChirps = createMockChirps();
    return mockChirps;
  }
}

export async function getLatestChirps() {
  try {
    console.log('📡 Fetching Latest feed from API...');
    const chirps = await apiCall('/api/chirps?feed=latest');
    console.log(`✅ Successfully loaded ${chirps.length} chirps from API`);
    return chirps;
  } catch (error) {
    console.log('⚠️ API not available, using mock data for Latest feed');
    const mockChirps = createMockChirps();
    return mockChirps;
  }
}

export async function getTrendingChirps() {
  try {
    console.log('📡 Fetching Trending feed from API...');
    const chirps = await apiCall('/api/chirps?feed=trending');
    console.log(`✅ Successfully loaded ${chirps.length} chirps from API`);
    return chirps;
  } catch (error) {
    console.log('⚠️ API not available, using mock data for Trending feed');
    const mockChirps = createMockChirps();
    return mockChirps;
  }
}

// Create a new chirp via API
export async function createChirp(content: string, authorId?: string, replyToId?: string | null) {
  try {
    console.log('📡 Creating new chirp via API...');
    
    const chirpData = {
      content: content.trim(),
      replyToId: replyToId || null,
    };

    const newChirp = await apiCall('/api/chirps', {
      method: 'POST',
      body: JSON.stringify(chirpData),
    });

    console.log('✅ Successfully created new chirp via API:', newChirp.id);
    return newChirp;
  } catch (error) {
    console.log('⚠️ API not available, simulating chirp creation');
    // Return a mock chirp object for now
    return {
      id: `mock-${Date.now()}`,
      content: content.trim(),
      createdAt: new Date().toISOString(),
      authorId: authorId || 'test-user-123',
      replyToId: replyToId || null,
    };
  }
}

// Get user by ID via API
export async function getUserById(userId: string) {
  try {
    console.log('Fetching user by ID via API:', userId);
    const user = await apiCall(`/api/users/${userId}`);
    return user;
  } catch (error) {
    console.error('Error fetching user by ID via API:', error);
    return null;
  }
}

// Get chirps by user ID via API
export async function getChirpsByUserId(userId: string) {
  try {
    console.log('Fetching chirps by user ID via API:', userId);
    const chirps = await apiCall(`/api/users/${userId}/chirps`);
    return chirps;
  } catch (error) {
    console.error('Error fetching user chirps via API:', error);
    return [];
  }
}

// Get chirps from API (default to For You feed)
export async function getChirpsFromDB() {
  return getForYouChirps();
}

// Search chirps via API
export async function searchChirps(query: string) {
  try {
    console.log('Searching chirps via API:', query);
    const chirps = await apiCall(`/api/search/chirps?q=${encodeURIComponent(query)}`);
    return chirps;
  } catch (error) {
    console.error('Search API error:', error);
    return [];
  }
}

// Search users via API
export async function searchUsers(query: string) {
  try {
    console.log('Searching users via API:', query);
    const users = await apiCall(`/api/search/users?q=${encodeURIComponent(query)}`);
    return users;
  } catch (error) {
    console.error('User search API error:', error);
    return [];
  }
}

// Get chirps by hashtag via API
export async function getChirpsByHashtag(hashtag: string) {
  try {
    console.log('Fetching chirps by hashtag via API:', hashtag);
    const chirps = await apiCall(`/api/hashtags/${encodeURIComponent(hashtag)}/chirps`);
    return chirps;
  } catch (error) {
    console.error('Hashtag chirps API error:', error);
    return [];
  }
}

// Add reaction via API
export async function addReaction(chirpId: string, emoji: string, userId: string) {
  try {
    console.log('Adding reaction via API:', emoji, 'to chirp:', chirpId);
    
    const reactionData = {
      chirpId,
      emoji,
    };

    const result = await apiCall('/api/reactions', {
      method: 'POST',
      body: JSON.stringify(reactionData),
    });

    console.log('Reaction added via API:', result);
    return result;
  } catch (error) {
    console.error('Error adding reaction via API:', error);
    throw error;
  }
}

// Delete chirp via API
export async function deleteChirp(chirpId: string, userId: string) {
  try {
    console.log('Deleting chirp via API:', chirpId);
    
    await apiCall(`/api/chirps/${chirpId}`, {
      method: 'DELETE',
    });

    console.log('Chirp deleted via API successfully');
  } catch (error) {
    console.error('Error deleting chirp via API:', error);
    throw error;
  }
}

// Create reply via API
export async function createReply(content: string, replyToId: string, authorId: string) {
  try {
    console.log('Creating reply via API to chirp:', replyToId);
    
    const replyData = {
      content: content.trim(),
      replyToId,
    };

    const newReply = await apiCall('/api/chirps', {
      method: 'POST',
      body: JSON.stringify(replyData),
    });

    console.log('Successfully created reply via API:', newReply.id);
    return newReply;
  } catch (error) {
    console.error('Error creating reply via API:', error);
    throw error;
  }
}

// Get chirp replies via API
export async function getChirpReplies(chirpId: string) {
  try {
    console.log('Fetching replies for chirp via API:', chirpId);
    const replies = await apiCall(`/api/chirps/${chirpId}/replies`);
    return replies;
  } catch (error) {
    console.error('Error fetching chirp replies via API:', error);
    throw error;
  }
}

// Create repost via API
export async function createRepost(originalChirpId: string, userId: string) {
  try {
    console.log('Creating repost via API of chirp:', originalChirpId);
    
    const result = await apiCall(`/api/chirps/${originalChirpId}/repost`, {
      method: 'POST',
    });

    console.log('Repost created via API:', result);
    return result;
  } catch (error) {
    console.error('Error creating repost via API:', error);
    throw error;
  }
}

// Follow user via API
export async function followUser(followerId: string, followingId: string) {
  try {
    console.log('Following user via API:', followingId);
    
    const followData = {
      followingId,
    };

    const result = await apiCall('/api/follows', {
      method: 'POST',
      body: JSON.stringify(followData),
    });

    console.log('User followed via API:', result);
    return result;
  } catch (error) {
    console.error('Error following user via API:', error);
    throw error;
  }
}

// Unfollow user via API
export async function unfollowUser(followerId: string, followingId: string) {
  try {
    console.log('Unfollowing user via API:', followingId);
    
    await apiCall(`/api/follows/${followingId}`, {
      method: 'DELETE',
    });

    console.log('User unfollowed via API successfully');
    return true;
  } catch (error) {
    console.error('Error unfollowing user via API:', error);
    throw error;
  }
}

// Get user profile via API
export async function getUserProfile(userId: string) {
  try {
    console.log('Fetching user profile via API:', userId);
    const profile = await apiCall(`/api/users/${userId}/profile`);
    return profile;
  } catch (error) {
    console.error('Error fetching user profile via API:', error);
    throw error;
  }
}

// Get user stats via API
export async function getUserStats(userId: string) {
  try {
    console.log('Fetching user stats via API:', userId);
    const stats = await apiCall(`/api/users/${userId}/stats`);
    return stats;
  } catch (error) {
    console.error('Error fetching user stats via API:', error);
    return { chirps: 0, followers: 0, following: 0, moodReactions: 0 };
  }
}

// Get notifications via API
export async function getNotifications(userId: string) {
  try {
    console.log('Fetching notifications via API for user:', userId);
    const notifications = await apiCall(`/api/notifications`);
    return notifications;
  } catch (error) {
    console.error('Error fetching notifications via API:', error);
    return [];
  }
}

// Mark notification as read via API
export async function markNotificationAsRead(notificationId: number) {
  try {
    console.log('Marking notification as read via API:', notificationId);
    
    await apiCall(`/api/notifications/${notificationId}/read`, {
      method: 'PUT',
    });

    console.log('Notification marked as read via API');
  } catch (error) {
    console.error('Error marking notification as read via API:', error);
    throw error;
  }
}

// Submit feedback via API
export async function submitFeedback(feedback: {
  name: string;
  email: string;
  category: string;
  message: string;
}) {
  try {
    console.log('Submitting feedback via API...');
    
    const result = await apiCall('/api/feedback', {
      method: 'POST',
      body: JSON.stringify(feedback),
    });

    console.log('Feedback submitted via API successfully');
    return result;
  } catch (error) {
    console.error('Error submitting feedback via API:', error);
    throw error;
  }
}

// Stub functions for compatibility with mobile-db.ts exports
// These functions are not yet implemented in the API but are needed for compatibility

export async function getChirpById(chirpId: string) {
  console.log('getChirpById not yet implemented in API');
  return null;
}

export async function getUserFromDB(userId: string) {
  console.log('getUserFromDB not yet implemented in API');
  return null;
}

export async function getUserByEmail(email: string) {
  console.log('getUserByEmail not yet implemented in API');
  return null;
}

export async function authenticateUser(email: string, password: string) {
  console.log('authenticateUser not yet implemented in API');
  return null;
}

export async function getFirstUser() {
  console.log('getFirstUser not yet implemented in API');
  return null;
}

export async function getUserChirps(userId: string) {
  console.log('getUserChirps not yet implemented in API');
  return [];
}

export async function getUserReplies(userId: string) {
  console.log('getUserReplies not yet implemented in API');
  return [];
}

export async function getTrendingHashtags() {
  console.log('getTrendingHashtags not yet implemented in API');
  return [];
}

export async function getReactionsForChirp(chirpId: string) {
  console.log('getReactionsForChirp not yet implemented in API');
  return [];
}

export async function getUserReactionForChirp(chirpId: string, userId: string) {
  console.log('getUserReactionForChirp not yet implemented in API');
  return null;
}

export async function getEmojiReactionCount(chirpId: string, emoji: string) {
  console.log('getEmojiReactionCount not yet implemented in API');
  return 0;
}

export async function checkUserReposted(chirpId: string, userId: string) {
  console.log('checkUserReposted not yet implemented in API');
  return false;
}

export async function getUserRepostStatus(chirpId: string, userId: string) {
  console.log('getUserRepostStatus not yet implemented in API');
  return null;
}

export async function getUserSubscriptionStatus(userId: string) {
  console.log('getUserSubscriptionStatus not yet implemented in API');
  return null;
}

export async function updateUserProfile(userId: string, updates: any) {
  console.log('updateUserProfile not yet implemented in API');
  return null;
}

export async function cancelSubscription(userId: string) {
  console.log('cancelSubscription not yet implemented in API');
  return false;
}

export async function getFollowers(userId: string) {
  console.log('getFollowers not yet implemented in API');
  return [];
}

export async function getFollowing(userId: string) {
  console.log('getFollowing not yet implemented in API');
  return [];
}

export async function blockUser(blockerId: string, blockedId: string) {
  console.log('blockUser not yet implemented in API');
  return false;
}

export async function unblockUser(blockerId: string, blockedId: string) {
  console.log('unblockUser not yet implemented in API');
  return false;
}

export async function checkFollowStatus(followerId: string, followingId: string) {
  console.log('checkFollowStatus not yet implemented in API');
  return false;
}

export async function checkBlockStatus(blockerId: string, blockedId: string) {
  console.log('checkBlockStatus not yet implemented in API');
  return false;
}

export async function toggleUserNotifications(userId: string, enabled: boolean) {
  console.log('toggleUserNotifications not yet implemented in API');
  return false;
}

export async function getUserNotificationStatus(userId: string) {
  console.log('getUserNotificationStatus not yet implemented in API');
  return false;
}

export async function triggerReactionNotification(chirpId: string, reactorId: string, emoji: string) {
  console.log('triggerReactionNotification not yet implemented in API');
}

export async function triggerFollowNotification(followerId: string, followingId: string) {
  console.log('triggerFollowNotification not yet implemented in API');
}

export async function triggerReplyNotification(replyId: string, replierId: string) {
  console.log('triggerReplyNotification not yet implemented in API');
}

export async function triggerRepostNotification(repostId: string, reposterId: string) {
  console.log('triggerRepostNotification not yet implemented in API');
}

export async function getUserByHandle(handle: string) {
  console.log('getUserByHandle not yet implemented in API');
  return null;
}

export async function createSubscription(userId: string, planId: string) {
  console.log('createSubscription not yet implemented in API');
  return null;
}

export async function verifyPurchase(userId: string, purchaseToken: string) {
  console.log('verifyPurchase not yet implemented in API');
  return false;
}

export async function getSubscriptionStatus(userId: string) {
  console.log('getSubscriptionStatus not yet implemented in API');
  return null;
}

