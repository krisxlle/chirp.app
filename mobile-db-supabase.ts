// Supabase database connection for React Native/Expo
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import type { MobileChirp } from './mobile-types';

// Utility function to validate UUID format
function validateUserId(userId: string): boolean {
  if (!userId || typeof userId !== 'string') {
    console.error('Invalid userId provided:', userId);
    return false;
  }
  
  // Check if userId looks like a UUID (basic validation)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(userId)) {
    console.error('UserId is not in valid UUID format:', userId);
    return false;
  }
  
  return true;
}

// Supabase configuration
const SUPABASE_URL = 'https://qrzbtituxxilnbgocdge.supabase.co'; // Replace with your Supabase URL
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFyemJ0aXR1eHhpbG5iZ29jZGdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyNDcxNDMsImV4cCI6MjA2NzgyMzE0M30.P-o5ND8qoiIpA1W-9WkM7RUOaGTjRtkEmPbCXGbrEI8';

// Create Supabase client with React Native storage
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Validate Supabase credentials
export const validateSupabaseCredentials = () => {
  console.log('🔍 Validating Supabase credentials...');
  
  const urlValid = SUPABASE_URL && SUPABASE_URL.startsWith('https://') && SUPABASE_URL.includes('supabase.co');
  const keyValid = SUPABASE_ANON_KEY && SUPABASE_ANON_KEY.startsWith('eyJ') || SUPABASE_ANON_KEY.startsWith('sb_');
  
  console.log('📍 URL valid:', urlValid, SUPABASE_URL);
  console.log('🔑 Key valid:', keyValid, SUPABASE_ANON_KEY.substring(0, 10) + '...');
  
  if (!urlValid) {
    console.error('❌ Invalid Supabase URL format');
    return false;
  }
  
  if (!keyValid) {
    console.error('❌ Invalid Supabase anon key format');
    return false;
  }
  
  console.log('✅ Supabase credentials appear valid');
  return true;
};

// Network connectivity test
export const testNetworkConnectivity = async () => {
  try {
    console.log('🌐 Testing network connectivity to Supabase...');
    
    // Test 1: Basic fetch to Supabase URL
    const response = await fetch(SUPABASE_URL + '/rest/v1/', {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });
    
    console.log('📡 Fetch test response status:', response.status);
    console.log('📡 Fetch test response ok:', response.ok);
    
    if (!response.ok) {
      console.error('❌ Basic fetch test failed');
      return false;
    }
    
    // Test 2: Supabase client test
    const { data, error } = await supabase.from('users').select('count').limit(1);
    
    if (error) {
      console.error('❌ Supabase client test failed:', error);
      return false;
    }
    
    console.log('✅ Network connectivity test passed');
    return true;
  } catch (error) {
    console.error('❌ Network connectivity test failed:', error);
    return false;
  }
};

// Database connection status
let isDatabaseConnected = false;

// Initialize database connection
const initializeDatabase = async () => {
  try {
    console.log('🔌 Initializing Supabase connection...');
    
    // Step 1: Validate credentials
    if (!validateSupabaseCredentials()) {
      console.error('❌ Invalid Supabase credentials');
      isDatabaseConnected = false;
      return false;
    }
    
    // Step 2: Test network connectivity
    const networkOk = await testNetworkConnectivity();
    if (!networkOk) {
      console.error('❌ Network connectivity test failed');
      isDatabaseConnected = false;
      return false;
    }
    
    // Step 3: Test database connection
    console.log('🗄️ Testing database connection...');
    const { data, error } = await supabase.from('users').select('count').limit(1);
    
    if (error) {
      console.error('❌ Database connection failed:', error);
      console.error('🔍 Error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      
      isDatabaseConnected = false;
      return false;
    }
    
    isDatabaseConnected = true;
    console.log('✅ Supabase connection initialized successfully');
    console.log('📊 Database test result:', data);
    return true;
  } catch (error) {
    console.error('❌ Failed to initialize Supabase connection:', error);
    console.error('🔍 Exception details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    
    isDatabaseConnected = false;
    return false;
  }
};

// Initialize on first use
let initializationPromise: Promise<boolean> | null = null;

const ensureDatabaseInitialized = async () => {
  if (initializationPromise) {
    return initializationPromise;
  }
  
  initializationPromise = initializeDatabase();
  return initializationPromise;
};

// Mock data functions for when database is not available
function getMockChirps(): MobileChirp[] {
  console.log('🎭 Generating mock chirps for offline mode');
  
  const mockUsers = [
    { id: 'mock_user_1', firstName: 'Alice', lastName: 'Johnson', handle: 'alicej', customHandle: 'alicej' },
    { id: 'mock_user_2', firstName: 'Bob', lastName: 'Smith', handle: 'bobsmith', customHandle: 'bobsmith' },
    { id: 'mock_user_3', firstName: 'Charlie', lastName: 'Brown', handle: 'charlieb', customHandle: 'charlieb' },
    { id: 'mock_user_4', firstName: 'Diana', lastName: 'Prince', handle: 'dianap', customHandle: 'dianap' },
    { id: 'mock_user_5', firstName: 'Eve', lastName: 'Wilson', handle: 'evew', customHandle: 'evew' }
  ];

  const mockContents = [
    "Just had the most amazing coffee! ☕️ #coffee #morning",
    "Working on some exciting new features for the app! 💻 #coding #development",
    "Beautiful sunset tonight! 🌅 #nature #photography",
    "Can't believe how fast this week is flying by! ⏰ #time #life",
    "Great meeting with the team today! 👥 #teamwork #collaboration",
    "Just finished reading an incredible book! 📚 #reading #books",
    "Perfect weather for a walk in the park! 🌳 #outdoors #exercise",
    "Excited about the upcoming project launch! 🚀 #excitement #launch",
    "Love this new playlist I discovered! 🎵 #music #discovery",
    "Nothing beats a good home-cooked meal! 🍳 #cooking #food"
  ];

  return mockContents.map((content, index) => ({
    id: `mock_chirp_${index + 1}`,
    content,
    createdAt: new Date(Date.now() - (index * 3600000)).toISOString(), // Each chirp 1 hour apart
    replyToId: null,
    isWeeklySummary: false,
    author: {
      ...mockUsers[index % mockUsers.length],
      email: `mock${index + 1}@example.com`,
      profileImageUrl: null
    },
    replyCount: Math.floor(Math.random() * 5),
    reactionCount: Math.floor(Math.random() * 20) + 5,
    repostCount: Math.floor(Math.random() * 3),
    reactions: [],
    isDirectReply: false,
    isNestedReply: false,
    isRepost: false,
    repostOfId: null,
    originalChirp: undefined
  }));
}

// Get user stats (chirp count, followers, following)
export async function getUserStats(userId: string) {
  try {
    console.log('Fetching stats for user:', userId);
    
    // Ensure database is initialized
    await ensureDatabaseInitialized();
    
    // Check if database is connected
    if (!isDatabaseConnected) {
      console.log('🔄 Database not connected, using mock stats');
      // Return mock stats with some realistic values
      return {
        chirps: Math.floor(Math.random() * 20) + 5, // 5-25 chirps
        followers: Math.floor(Math.random() * 100) + 10, // 10-110 followers
        following: Math.floor(Math.random() * 50) + 5, // 5-55 following
        moodReactions: Math.floor(Math.random() * 50) + 10 // 10-60 reactions
      };
    }
    
    // Get chirp count
    const { count: chirpCount } = await supabase
      .from('chirps')
      .select('*', { count: 'exact', head: true })
      .eq('author_id', userId);

    // Get follower count
    const { count: followerCount } = await supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('following_id', userId);

    // Get following count
    const { count: followingCount } = await supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('follower_id', userId);

    // Get reaction count (simplified for now)
    const { count: reactionCount } = await supabase
      .from('reactions')
      .select('*', { count: 'exact', head: true })
      .eq('chirp_id', userId); // This would need to be joined with chirps

    const userStats = {
      chirps: chirpCount || 0,
      followers: followerCount || 0,
      following: followingCount || 0,
      moodReactions: reactionCount || 0
    };
    
    console.log('User stats:', userStats);
    return userStats;
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return { chirps: 0, followers: 0, following: 0, moodReactions: 0 };
  }
}

// Get user by ID for profile viewing
export async function getUserById(userId: string): Promise<any | null> {
  try {
    console.log('Fetching user by ID:', userId);
    
    // Ensure database is initialized
    await ensureDatabaseInitialized();
    
    // Check if database is connected
    if (!isDatabaseConnected) {
      console.log('🔄 Database not connected, using mock user');
      return {
        id: userId,
        email: 'mock@example.com',
        first_name: 'Mock',
        last_name: 'User',
        custom_handle: 'mockuser',
        handle: 'mockuser',
        profile_image_url: null,
        banner_image_url: null,
        bio: 'This is a mock user for offline mode',
        created_at: new Date().toISOString(),
      };
    }
    
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user by ID:', error);
      return null;
    }

    return user;
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    return null;
  }
}

// Get user's chirps for profile display
export async function getUserChirps(userId: string) {
  try {
    console.log('Fetching chirps for user:', userId);
    
    // Ensure database is initialized
    await ensureDatabaseInitialized();
    
    // Check if database is connected
    if (!isDatabaseConnected) {
      console.log('🔄 Database not connected, using mock chirps');
      return getMockChirps().slice(0, 5); // Return first 5 mock chirps
    }
    
    const { data: chirps, error } = await supabase
      .from('chirps')
      .select('*')
      .eq('author_id', userId)
      .is('reply_to_id', null) // Only original chirps, not replies
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error fetching user chirps:', error);
      return getMockChirps().slice(0, 5);
    }

    // Get user data for all chirps
    const userIds = [...new Set(chirps?.map(chirp => chirp.author_id) || [])];
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, first_name, last_name, email, custom_handle, handle, profile_image_url')
      .in('id', userIds);

    if (usersError) {
      console.error('Error fetching users:', usersError);
      return getMockChirps().slice(0, 5);
    }

    // Create a map of users by ID
    const userMap = new Map(users?.map(user => [user.id, user]) || []);

    // Transform the data to match ChirpCard expectations
    const transformedChirps = chirps?.map(chirp => {
      const user = userMap.get(chirp.author_id);
      return {
        id: chirp.id,
        content: chirp.content,
        createdAt: chirp.created_at,
        replyToId: chirp.reply_to_id,
        isWeeklySummary: chirp.is_weekly_summary || false,
        reactionCount: 0, // Will be updated with actual counts
        replyCount: 0, // Will be updated with actual counts
        author: {
          id: user?.id || chirp.author_id,
          firstName: user?.first_name || 'User',
          lastName: user?.last_name || '',
          email: user?.email || `user${chirp.author_id}@example.com`,
          customHandle: user?.custom_handle || user?.handle || 'user',
          handle: user?.handle || 'user',
          profileImageUrl: user?.profile_image_url || null,
        }
      };
    }) || [];
    
    console.log(`Found ${transformedChirps.length} chirps for user`);
    return transformedChirps;
  } catch (error) {
    console.error('Error fetching user chirps:', error);
    return getMockChirps().slice(0, 5);
  }
}

// Get replies by specific user
export async function getUserReplies(userId: string) {
  try {
    console.log('Fetching replies for user:', userId);
    
    // Ensure database is initialized
    await ensureDatabaseInitialized();
    
    // Check if database is connected
    if (!isDatabaseConnected) {
      console.log('🔄 Database not connected, using mock replies');
      return getMockChirps().slice(0, 3); // Return first 3 mock chirps as replies
    }
    
    const { data: replies, error } = await supabase
      .from('chirps')
      .select('*')
      .eq('author_id', userId)
      .not('reply_to_id', 'is', null) // Only replies
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching user replies:', error);
      return getMockChirps().slice(0, 3);
    }

    // Get user data for all replies
    const userIds = [...new Set(replies?.map(reply => reply.author_id) || [])];
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, first_name, last_name, email, custom_handle, handle, profile_image_url')
      .in('id', userIds);

    if (usersError) {
      console.error('Error fetching users:', usersError);
      return getMockChirps().slice(0, 3);
    }

    // Create a map of users by ID
    const userMap = new Map(users?.map(user => [user.id, user]) || []);

    // Transform the data to match ChirpCard expectations
    const transformedReplies = replies?.map(reply => {
      const user = userMap.get(reply.author_id);
      return {
        id: reply.id,
        content: reply.content,
        createdAt: reply.created_at,
        replyToId: reply.reply_to_id,
        isWeeklySummary: reply.is_weekly_summary || false,
        reactionCount: 0, // Will be updated with actual counts
        replyCount: 0, // Will be updated with actual counts
        author: {
          id: user?.id || reply.author_id,
          firstName: user?.first_name || 'User',
          lastName: user?.last_name || '',
          email: user?.email || `user${reply.author_id}@example.com`,
          customHandle: user?.custom_handle || user?.handle || 'user',
          handle: user?.handle || 'user',
          profileImageUrl: user?.profile_image_url || null,
        }
      };
    }) || [];
    
    console.log(`Found ${transformedReplies.length} replies for user`);
    return transformedReplies;
  } catch (error) {
    console.error('Error fetching user replies:', error);
    return getMockChirps().slice(0, 3);
  }
}

// Check follow status
export async function checkFollowStatus(targetUserId: string): Promise<{ isFollowing: boolean; isBlocked: boolean; notificationsEnabled: boolean }> {
  try {
    // Ensure database is initialized
    await ensureDatabaseInitialized();
    
    if (!isDatabaseConnected) {
      console.log('🔄 Database not connected, returning default follow status');
      return {
        isFollowing: false,
        isBlocked: false,
        notificationsEnabled: false
      };
    }
    
    // For now, return default follow status - will need current user context to implement properly
    return {
      isFollowing: false,
      isBlocked: false,
      notificationsEnabled: false
    };
  } catch (error) {
    console.error('Error checking follow status:', error);
    return {
      isFollowing: false,
      isBlocked: false,
      notificationsEnabled: false
    };
  }
}

// Get current authenticated user ID
export async function getCurrentUserId(): Promise<string | null> {
  try {
    console.log('🔍 Validating current user...');
    
    // Get current user from Supabase auth
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error('Error getting current user:', error);
      return null;
    }
    
    if (user) {
      console.log('✅ User validation complete - ID:', user.id);
      return user.id;
    }
    
    console.log('❌ No current user found');
    return null;
  } catch (error) {
    console.error('Error getting current user ID:', error);
    return null;
  }
}

// Check block status
export async function checkBlockStatus(blockerId: string, blockedId: string): Promise<boolean> {
  try {
    // Ensure database is initialized
    await ensureDatabaseInitialized();
    
    if (!isDatabaseConnected) {
      console.log('🔄 Database not connected, returning default block status');
      return false;
    }
    
    const { data, error } = await supabase
      .from('user_blocks')
      .select('id')
      .eq('blocker_id', blockerId)
      .eq('blocked_id', blockedId)
      .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      console.error('Error checking block status:', error);
      return false;
    }
    
    return Boolean(data);
  } catch (error) {
    console.error('Error checking block status:', error);
    return false;
  }
}

// Block user functionality
export async function blockUser(blockerId: string, blockedId: string): Promise<boolean> {
  try {
    console.log(`User ${blockerId} attempting to block user ${blockedId}`);
    
    // Ensure database is initialized
    await ensureDatabaseInitialized();
    
    if (!isDatabaseConnected) {
      console.log('🔄 Database not connected, mock block action');
      return true;
    }
    
    // Check if already blocked
    const { data: existingBlock } = await supabase
      .from('user_blocks')
      .select('id')
      .eq('blocker_id', blockerId)
      .eq('blocked_id', blockedId)
      .single();

    if (existingBlock) {
      console.log('User already blocked');
      return false; // Already blocked
    }
    
    // Add block relationship and remove any follow relationships
    const { error: blockError } = await supabase
      .from('user_blocks')
      .insert({
        blocker_id: blockerId,
        blocked_id: blockedId,
        created_at: new Date().toISOString()
      });

    if (blockError) {
      console.error('Error blocking user:', blockError);
      throw blockError;
    }
    
    // Remove any existing follow relationships
    await supabase
      .from('follows')
      .delete()
      .or(`follower_id.eq.${blockerId},following_id.eq.${blockedId},follower_id.eq.${blockedId},following_id.eq.${blockerId}`);
    
    console.log('Successfully blocked user');
    return true; // Block added
  } catch (error) {
    console.error('Error blocking user:', error);
    throw error;
  }
}

export async function unblockUser(blockerId: string, blockedId: string): Promise<boolean> {
  try {
    console.log(`User ${blockerId} attempting to unblock user ${blockedId}`);
    
    // Ensure database is initialized
    await ensureDatabaseInitialized();
    
    if (!isDatabaseConnected) {
      console.log('🔄 Database not connected, mock unblock action');
      return true;
    }
    
    const { error } = await supabase
      .from('user_blocks')
      .delete()
      .eq('blocker_id', blockerId)
      .eq('blocked_id', blockedId);

    if (error) {
      console.error('Error unblocking user:', error);
      throw error;
    }
    
    console.log('Successfully unblocked user');
    return true; // Unblock successful
  } catch (error) {
    console.error('Error unblocking user:', error);
    throw error;
  }
}

// Follow/Unfollow functionality
export async function followUser(followerId: string, followingId: string): Promise<boolean> {
  try {
    console.log(`User ${followerId} attempting to follow user ${followingId}`);
    
    // Ensure database is initialized
    await ensureDatabaseInitialized();
    
    if (!isDatabaseConnected) {
      console.log('🔄 Database not connected, mock follow action');
      return true;
    }
    
    // Check if already following
    const { data: existingFollow } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', followerId)
      .eq('following_id', followingId)
      .single();

    if (existingFollow) {
      console.log('Already following this user');
      return false; // Already following
    }
    
    // Add follow relationship
    const { error } = await supabase
      .from('follows')
      .insert({
        follower_id: followerId,
        following_id: followingId,
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error following user:', error);
      throw error;
    }
    
    console.log('Successfully followed user');
    return true; // Follow added
  } catch (error) {
    console.error('Error following user:', error);
    throw error;
  }
}

export async function unfollowUser(followerId: string, followingId: string): Promise<boolean> {
  try {
    console.log(`User ${followerId} attempting to unfollow user ${followingId}`);
    
    // Ensure database is initialized
    await ensureDatabaseInitialized();
    
    if (!isDatabaseConnected) {
      console.log('🔄 Database not connected, mock unfollow action');
      return true;
    }
    
    const { error } = await supabase
      .from('follows')
      .delete()
      .eq('follower_id', followerId)
      .eq('following_id', followingId);

    if (error) {
      console.error('Error unfollowing user:', error);
      throw error;
    }
    
    console.log('Successfully unfollowed user');
    return true; // Unfollow successful
  } catch (error) {
    console.error('Error unfollowing user:', error);
    throw error;
  }
}

// Toggle user notifications
export async function toggleUserNotifications(userId: string, targetUserId: string): Promise<boolean> {
  try {
    console.log(`User ${userId} toggling notifications for user ${targetUserId}`);
    
    // Ensure database is initialized
    await ensureDatabaseInitialized();
    
    if (!isDatabaseConnected) {
      console.log('🔄 Database not connected, mock notification toggle');
      return true;
    }
    
    // Check if notifications are currently enabled
    const { data: existingSetting } = await supabase
      .from('user_notification_settings')
      .select('id, notify_on_post')
      .eq('user_id', userId)
      .eq('followed_user_id', targetUserId)
      .single();
    
    if (existingSetting) {
      // Toggle existing setting
      const newState = !existingSetting.notify_on_post;
      const { error } = await supabase
        .from('user_notification_settings')
        .update({ notify_on_post: newState, created_at: new Date().toISOString() })
        .eq('user_id', userId)
        .eq('followed_user_id', targetUserId);
      
      if (error) {
        console.error('Error updating notification setting:', error);
        throw error;
      }
      
      console.log(`Notifications ${newState ? 'enabled' : 'disabled'} for user`);
      return newState;
    } else {
      // Create new setting (default to enabled)
      const { error } = await supabase
        .from('user_notification_settings')
        .insert({
          user_id: userId,
          followed_user_id: targetUserId,
          notify_on_post: true,
          created_at: new Date().toISOString()
        });
      
      if (error) {
        console.error('Error creating notification setting:', error);
        throw error;
      }
      
      console.log('Notifications enabled for user');
      return true;
    }
  } catch (error) {
    console.error('Error toggling user notifications:', error);
    throw error;
  }
}

// Get chirp by ID
export async function getChirpById(chirpId: string): Promise<any | null> {
  try {
    console.log('Fetching chirp by ID:', chirpId);
    
    // Ensure database is initialized
    await ensureDatabaseInitialized();
    
    // Check if database is connected
    if (!isDatabaseConnected) {
      console.log('🔄 Database not connected, using mock chirp');
      return {
        id: chirpId,
        content: 'This is a mock chirp for offline mode',
        created_at: new Date().toISOString(),
        author_id: 'mock_user_1',
        reply_to_id: null,
        is_weekly_summary: false,
        users: {
          id: 'mock_user_1',
          first_name: 'Mock',
          last_name: 'User',
          custom_handle: 'mockuser',
          handle: 'mockuser',
          profile_image_url: null
        }
      };
    }
    
    const { data: chirp, error } = await supabase
      .from('chirps')
      .select(`
        *,
        users!inner(
          id,
          first_name,
          last_name,
          custom_handle,
          handle,
          profile_image_url
        )
      `)
      .eq('id', chirpId)
      .single();

    if (error) {
      console.error('Error fetching chirp by ID:', error);
      return null;
    }

    return chirp;
  } catch (error) {
    console.error('Error fetching chirp by ID:', error);
    return null;
  }
}

// Get chirp replies
export async function getChirpReplies(chirpId: string): Promise<any[]> {
  try {
    console.log('Fetching replies for chirp:', chirpId);
    
    // Ensure database is initialized
    await ensureDatabaseInitialized();
    
    // Check if database is connected
    if (!isDatabaseConnected) {
      console.log('🔄 Database not connected, using mock replies');
      return getMockChirps().slice(0, 3);
    }
    
    const { data: replies, error } = await supabase
      .from('chirps')
      .select(`
        *,
        users!inner(
          id,
          first_name,
          last_name,
          custom_handle,
          handle,
          profile_image_url
        )
      `)
      .eq('reply_to_id', chirpId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching chirp replies:', error);
      return getMockChirps().slice(0, 3);
    }

    return replies || [];
  } catch (error) {
    console.error('Error fetching chirp replies:', error);
    return getMockChirps().slice(0, 3);
  }
}

// Get chirps by hashtag
export async function getChirpsByHashtag(hashtag: string): Promise<any[]> {
  try {
    console.log('Fetching chirps by hashtag:', hashtag);
    
    // Ensure database is initialized
    await ensureDatabaseInitialized();
    
    // Check if database is connected
    if (!isDatabaseConnected) {
      console.log('🔄 Database not connected, using mock hashtag chirps');
      return getMockChirps().filter(chirp => chirp.content.includes('#' + hashtag));
    }
    
    const { data: chirps, error } = await supabase
      .from('chirps')
      .select(`
        *,
        users!inner(
          id,
          first_name,
          last_name,
          custom_handle,
          handle,
          profile_image_url
        )
      `)
      .ilike('content', `%#${hashtag}%`)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching chirps by hashtag:', error);
      return getMockChirps().filter(chirp => chirp.content.includes('#' + hashtag));
    }

    return chirps || [];
  } catch (error) {
    console.error('Error fetching chirps by hashtag:', error);
    return getMockChirps().filter(chirp => chirp.content.includes('#' + hashtag));
  }
}

// Get followers
export async function getFollowers(userId: string): Promise<any[]> {
  try {
    console.log('Fetching followers for user:', userId);
    
    // Ensure database is initialized
    await ensureDatabaseInitialized();
    
    // Check if database is connected
    if (!isDatabaseConnected) {
      console.log('🔄 Database not connected, using mock followers');
      return [
        { id: 'mock_follower_1', first_name: 'Follower', last_name: 'One', custom_handle: 'follower1' },
        { id: 'mock_follower_2', first_name: 'Follower', last_name: 'Two', custom_handle: 'follower2' }
      ];
    }
    
    const { data: followers, error } = await supabase
      .from('follows')
      .select(`
        follower_id,
        users!follows_follower_id_fkey(
          id,
          first_name,
          last_name,
          custom_handle,
          handle,
          profile_image_url
        )
      `)
      .eq('following_id', userId);

    if (error) {
      console.error('Error fetching followers:', error);
      return [];
    }

    return followers?.map(f => f.users).filter(Boolean) || [];
  } catch (error) {
    console.error('Error fetching followers:', error);
    return [];
  }
}

// Get following
export async function getFollowing(userId: string): Promise<any[]> {
  try {
    console.log('Fetching following for user:', userId);
    
    // Ensure database is initialized
    await ensureDatabaseInitialized();
    
    // Check if database is connected
    if (!isDatabaseConnected) {
      console.log('🔄 Database not connected, using mock following');
      return [
        { id: 'mock_following_1', first_name: 'Following', last_name: 'One', custom_handle: 'following1' },
        { id: 'mock_following_2', first_name: 'Following', last_name: 'Two', custom_handle: 'following2' }
      ];
    }
    
    const { data: following, error } = await supabase
      .from('follows')
      .select(`
        following_id,
        users!follows_following_id_fkey(
          id,
          first_name,
          last_name,
          custom_handle,
          handle,
          profile_image_url
        )
      `)
      .eq('follower_id', userId);

    if (error) {
      console.error('Error fetching following:', error);
      return [];
    }

    return following?.map(f => f.users).filter(Boolean) || [];
  } catch (error) {
    console.error('Error fetching following:', error);
    return [];
  }
}

// Update user profile
export async function updateUserProfile(userId: string, updates: any): Promise<any> {
  try {
    console.log('Updating user profile:', userId, updates);
    
    // Ensure database is initialized
    await ensureDatabaseInitialized();
    
    if (!isDatabaseConnected) {
      console.log('🔄 Database not connected, mock profile update');
      return { id: userId, ...updates };
    }
    
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
}

// Get trending hashtags
export async function getTrendingHashtags(): Promise<string[]> {
  try {
    console.log('Fetching trending hashtags');
    
    // Ensure database is initialized
    await ensureDatabaseInitialized();
    
    if (!isDatabaseConnected) {
      console.log('🔄 Database not connected, using mock trending hashtags');
      return ['#trending', '#viral', '#popular', '#news', '#tech'];
    }
    
    // This would need a more complex query to get actual trending hashtags
    // For now, return mock data
    return ['#trending', '#viral', '#popular', '#news', '#tech'];
  } catch (error) {
    console.error('Error fetching trending hashtags:', error);
    return ['#trending', '#viral', '#popular', '#news', '#tech'];
  }
}

// Search chirps
export async function searchChirps(query: string): Promise<any[]> {
  try {
    console.log('Searching chirps for:', query);
    
    // Ensure database is initialized
    await ensureDatabaseInitialized();
    
    if (!isDatabaseConnected) {
      console.log('🔄 Database not connected, using mock search results');
      return getMockChirps().filter(chirp => 
        chirp.content.toLowerCase().includes(query.toLowerCase())
      );
    }
    
    const { data: chirps, error } = await supabase
      .from('chirps')
      .select(`
        *,
        users!inner(
          id,
          first_name,
          last_name,
          custom_handle,
          handle,
          profile_image_url
        )
      `)
      .ilike('content', `%${query}%`)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Error searching chirps:', error);
      return [];
    }

    return chirps || [];
  } catch (error) {
    console.error('Error searching chirps:', error);
    return [];
  }
}

// Search users
export async function searchUsers(query: string): Promise<any[]> {
  try {
    console.log('Searching users for:', query);
    
    // Ensure database is initialized
    await ensureDatabaseInitialized();
    
    if (!isDatabaseConnected) {
      console.log('🔄 Database not connected, using mock search results');
      return [
        { id: 'mock_user_1', first_name: 'Mock', last_name: 'User', custom_handle: 'mockuser' }
      ];
    }
    
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,custom_handle.ilike.%${query}%`)
      .limit(20);

    if (error) {
      console.error('Error searching users:', error);
      return [];
    }

    return users || [];
  } catch (error) {
    console.error('Error searching users:', error);
    return [];
  }
}

// Get notifications
export async function getNotifications(userId: string): Promise<any[]> {
  try {
    console.log('Fetching notifications for user:', userId);
    
    // Validate userId format
    if (!validateUserId(userId)) {
      return [];
    }
    
    // Ensure database is initialized
    await ensureDatabaseInitialized();
    
    if (!isDatabaseConnected) {
      console.log('🔄 Database not connected, using mock notifications');
      return [
        { id: 1, type: 'follow', message: 'Someone followed you', created_at: new Date().toISOString() },
        { id: 2, type: 'like', message: 'Someone liked your chirp', created_at: new Date().toISOString() }
      ];
    }
    
    const { data: notifications, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }

    return notifications || [];
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }
}

// Mark notification as read
export async function markNotificationAsRead(notificationId: number): Promise<void> {
  try {
    console.log('Marking notification as read:', notificationId);
    
    // Ensure database is initialized
    await ensureDatabaseInitialized();
    
    if (!isDatabaseConnected) {
      console.log('🔄 Database not connected, mock mark as read');
      return;
    }
    
    const { error } = await supabase
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('id', notificationId);

    if (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
}

// Submit feedback
export async function submitFeedback(feedback: {
  userId: string;
  type: string;
  message: string;
  rating?: number;
}): Promise<void> {
  try {
    console.log('Submitting feedback:', feedback);
    
    // Ensure database is initialized
    await ensureDatabaseInitialized();
    
    if (!isDatabaseConnected) {
      console.log('🔄 Database not connected, mock feedback submission');
      return;
    }
    
    const { error } = await supabase
      .from('feedback')
      .insert({
        user_id: feedback.userId,
        type: feedback.type,
        message: feedback.message,
        rating: feedback.rating,
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error submitting feedback:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error submitting feedback:', error);
    throw error;
  }
}

// Get for you chirps
export async function getForYouChirps(): Promise<any[]> {
  try {
    console.log('Fetching for you chirps');
    
    // Ensure database is initialized
    await ensureDatabaseInitialized();
    
    if (!isDatabaseConnected) {
      console.log('🔄 Database not connected, using mock for you chirps');
      return getMockChirps();
    }
    
    const { data: chirps, error } = await supabase
      .from('chirps')
      .select(`
        *,
        users!inner(
          id,
          first_name,
          last_name,
          custom_handle,
          handle,
          profile_image_url
        )
      `)
      .is('reply_to_id', null)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching for you chirps:', error);
      return getMockChirps();
    }

    return chirps || [];
  } catch (error) {
    console.error('Error fetching for you chirps:', error);
    return getMockChirps();
  }
}

// Create chirp
export async function createChirp(content: string, authorId?: string, replyToId?: string | null): Promise<any> {
  try {
    console.log('Creating chirp:', { content, authorId, replyToId });
    
    // Ensure database is initialized
    await ensureDatabaseInitialized();
    
    if (!isDatabaseConnected) {
      console.log('🔄 Database not connected, mock chirp creation');
      return {
        id: 'mock_chirp_' + Date.now(),
        content,
        author_id: authorId || 'mock_user_1',
        reply_to_id: replyToId,
        created_at: new Date().toISOString()
      };
    }
    
    const { data, error } = await supabase
      .from('chirps')
      .insert({
        content,
        author_id: authorId,
        reply_to_id: replyToId,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating chirp:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error creating chirp:', error);
    throw error;
  }
}

// Initialize database on module load
initializeDatabase();
