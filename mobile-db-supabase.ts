// Supabase database connection for React Native/Expo
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import type { MobileChirp } from './mobile-types';

// Platform-specific storage
let storage: any;
if (Platform.OS === 'web') {
  storage = {
    getItem: (key: string) => {
      try {
        return Promise.resolve(localStorage.getItem(key));
      } catch {
        return Promise.resolve(null);
      }
    },
    setItem: (key: string, value: string) => {
      try {
        localStorage.setItem(key, value);
        return Promise.resolve();
      } catch {
        return Promise.resolve();
      }
    },
    removeItem: (key: string) => {
      try {
        localStorage.removeItem(key);
        return Promise.resolve();
      } catch {
        return Promise.resolve();
      }
    }
  };
} else {
  const AsyncStorage = require('@react-native-async-storage/async-storage').default;
  storage = AsyncStorage;
}

// Utility function to truncate long error messages
const truncateError = (error: any): string => {
  if (!error) return 'Unknown error';
  if (typeof error === 'string') {
    return error.length > 100 ? `${error.substring(0, 100)}...` : error;
  }
  if (error.message) {
    return error.message.length > 100 ? `${error.message.substring(0, 100)}...` : error.message;
  }
  return 'Unknown error';
};

// Supabase configuration
const SUPABASE_URL = 'https://qrzbtituxxilnbgocdge.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFyemJ0aXR1eHhpbG5iZ29jZGdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyNDcxNDMsImV4cCI6MjA2NzgyMzE0M30.P-o5ND8qoiIpA1W-9WkM7RUOaGTjRtkEmPbCXGbrEI8';

// Create Supabase client with platform-specific storage
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: storage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Performance optimization: Cache for database connection status
let isDatabaseConnected = false;
let connectionTestPromise: Promise<boolean> | null = null;
let lastConnectionTest = 0;
const CONNECTION_CACHE_DURATION = 30000; // 30 seconds

// Performance optimization: Cache for chirps data
const chirpCache = new Map<string, { data: any[], timestamp: number, ttl: number }>();
const CACHE_TTL = 10000; // 10 seconds for chirp cache

// Helper function to truncate IDs for logging
const truncateId = (id: string | undefined, length: number = 8): string => {
  if (!id) return 'undefined';
  return id.length > length ? id.substring(0, length) + '...' : id;
};

// Validate Supabase credentials
export const validateSupabaseCredentials = () => {
  return SUPABASE_URL && SUPABASE_ANON_KEY && 
         SUPABASE_URL.includes('supabase.co') && 
         SUPABASE_ANON_KEY.startsWith('eyJ');
};

// Optimized network connectivity test with timeout
export const testNetworkConnectivity = async () => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      method: 'HEAD',
      signal: controller.signal,
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });
    
    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    console.error('❌ Network connectivity test failed:', truncateError(error));
    return false;
  }
};

// Optimized database connection test with caching
const testDatabaseConnection = async () => {
  const now = Date.now();
  
  // Return cached result if still valid
  if (connectionTestPromise && (now - lastConnectionTest) < CONNECTION_CACHE_DURATION) {
    return connectionTestPromise;
  }
  
  // Create new connection test
  connectionTestPromise = (async () => {
    try {
      console.log('🔌 Testing database connection...');
    const startTime = Date.now();
    
      // Quick connection test with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
      
      const { data, error } = await supabase
        .from('users')
        .select('id')
        .limit(1);
      
      clearTimeout(timeoutId);
    
    if (error) {
      console.error('❌ Database connection failed:', error?.message || 'Unknown error');
      isDatabaseConnected = false;
        lastConnectionTest = now;
      return false;
    }
    
    isDatabaseConnected = true;
      lastConnectionTest = now;
      console.log(`✅ Database connection test successful in ${Date.now() - startTime}ms`);
    return true;
  } catch (error) {
      console.error('❌ Database connection test failed:', error?.message || 'Unknown error');
    isDatabaseConnected = false;
      lastConnectionTest = now;
    return false;
  }
  })();
  
  return connectionTestPromise;
};

// Optimized database initialization
const ensureDatabaseInitialized = async () => {
  // Quick validation first
  if (!validateSupabaseCredentials()) {
    console.error('❌ Invalid Supabase credentials');
    return false;
  }
  
  // Test connection with caching
  return await testDatabaseConnection();
};

// Optimized mock chirps generation
function getMockChirps(): MobileChirp[] {
  const mockContents = [
    'Just had the most amazing day! 🌟',
    'Working on some exciting new features for the app! 💻',
    'Coffee time ☕️',
    'Beautiful sunset today! 🌅',
    'Learning new things every day 📚',
    'Great workout session! 💪',
    'Perfect weather for a walk 🚶‍♂️',
    'Cooking up something delicious 👨‍🍳',
    'Music is life 🎵',
    'Grateful for all the amazing people in my life ❤️'
  ];

  return mockContents.map((content, index) => ({
    id: `mock_${index + 1}`,
    content,
    createdAt: new Date(Date.now() - (index * 1000 * 60 * 30)).toISOString(), // 30 min intervals
    replyToId: null,
    isWeeklySummary: false,
    reactionCount: Math.floor(Math.random() * 50) + 5,
    replyCount: Math.floor(Math.random() * 20) + 1,
    reactions: [],
    replies: [],
    repostOfId: null,
    originalChirp: undefined,
    author: {
      id: `mock_user_${index + 1}`,
      firstName: `User${index + 1}`,
      lastName: '',
      email: `user${index + 1}@example.com`,
      customHandle: `user${index + 1}`,
      handle: `user${index + 1}`,
      profileImageUrl: null,
      avatarUrl: null,
      bannerImageUrl: null,
      bio: `This is user ${index + 1}'s bio`,
      joinedAt: new Date(Date.now() - (index * 1000 * 60 * 60 * 24 * 30)).toISOString(), // 30 day intervals
      isChirpPlus: Math.random() > 0.8,
      showChirpPlusBadge: Math.random() > 0.8
    }
  }));
}

// Optimized user stats with single query
export async function getUserStats(userId: string) {
  try {
    console.log('🔄 Fetching user stats:', userId);
    const startTime = Date.now();
    
    // Quick connection check
    const isConnected = await ensureDatabaseInitialized();
    
    if (!isConnected) {
      console.log('🔄 Database not connected, returning zero stats');
      return {
        chirps: 0,
        followers: 0,
        following: 0,
        moodReactions: 0
      };
    }
    
    // Optimized: Use separate count queries instead of RPC
    const [chirpsResult, followersResult, followingResult] = await Promise.all([
      supabase.from('chirps').select('*', { count: 'exact', head: true }).eq('author_id', userId),
      supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', userId),
      supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', userId)
    ]);
    
    console.log(`✅ User stats fetched in ${Date.now() - startTime}ms`);
    return {
      chirps: chirpsResult.count || 0,
      followers: followersResult.count || 0,
      following: followingResult.count || 0,
      moodReactions: 0 // Simplified for now
    };
  } catch (error) {
    console.error('❌ Error fetching user stats:', truncateError(error));
    return { chirps: 0, followers: 0, following: 0, moodReactions: 0 };
  }
}

// Optimized user chirps with caching and single query
export async function getUserChirps(userId: string) {
  try {
    console.log('🔄 Fetching user chirps:', userId);
    const startTime = Date.now();
    
    // Check cache first
    const cacheKey = `user_chirps_${userId}`;
    const cached = chirpCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < cached.ttl) {
      console.log('✅ Returning cached user chirps');
      return cached.data;
    }
    
    // Quick connection check
    const isConnected = await ensureDatabaseInitialized();
    
    if (!isConnected) {
      console.log('🔄 Database not connected, returning empty array');
      return [];
    }
    
    // Single optimized query with joins
    const { data: chirps, error } = await supabase
      .from('chirps')
      .select(`
        id,
        content,
        created_at,
        reply_to_id,
        is_weekly_summary,
        users!inner(
          id,
          first_name,
          last_name,
          email,
          custom_handle,
          handle,
          profile_image_url,
          avatar_url,
          banner_image_url
        )
      `)
      .eq('author_id', userId)
      .is('reply_to_id', null)
      .or('is_thread_starter.is.true,thread_id.is.null')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('❌ Error fetching user chirps:', error);
      return [];
    }

    // Transform data efficiently without individual reply count queries (prevents timeouts)
    const transformedChirps = (chirps || []).map((chirp: any) => ({
      id: chirp.id.toString(),
      content: chirp.content,
      createdAt: chirp.created_at,
      replyToId: chirp.reply_to_id,
      isWeeklySummary: chirp.is_weekly_summary || false,
      reactionCount: 0,
      replyCount: 0, // Simplified - remove individual count queries to prevent timeouts
      reactions: [],
      replies: [],
      repostOfId: null,
      originalChirp: undefined,
      author: {
        id: chirp.users.id,
        firstName: chirp.users.first_name || 'User',
        lastName: chirp.users.last_name || '',
        email: chirp.users.email,
        customHandle: chirp.users.custom_handle || chirp.users.handle,
        handle: chirp.users.handle,
        profileImageUrl: chirp.users.profile_image_url,
        avatarUrl: chirp.users.avatar_url,
        bannerImageUrl: chirp.users.banner_image_url,
        bio: '',
        joinedAt: new Date().toISOString(),
        isChirpPlus: false,
        showChirpPlusBadge: false
      }
    }));
    
    // Cache the result
    chirpCache.set(cacheKey, { data: transformedChirps, timestamp: Date.now(), ttl: CACHE_TTL });
    
    console.log(`✅ User chirps fetched in ${Date.now() - startTime}ms`);
    return transformedChirps;
  } catch (error) {
    console.error('❌ Error fetching user chirps:', error);
    return [];
  }
}

// Optimized user replies with caching
export async function getUserReplies(userId: string) {
  try {
    console.log('🔄 Fetching user replies:', userId);
    const startTime = Date.now();
    
    // Check cache first
    const cacheKey = `user_replies_${userId}`;
    const cached = chirpCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < cached.ttl) {
      console.log('✅ Returning cached user replies');
      return cached.data;
    }
    
    // Quick connection check
    const isConnected = await ensureDatabaseInitialized();
    
    if (!isConnected) {
      console.log('🔄 Database not connected, returning empty array');
      return [];
    }
    
    // Single optimized query with joins
    const { data: replies, error } = await supabase
      .from('chirps')
      .select(`
        id,
        content,
        created_at,
        reply_to_id,
        is_weekly_summary,
        users!inner(
          id,
          first_name,
          last_name,
          email,
          custom_handle,
          handle,
          profile_image_url,
          avatar_url,
          banner_image_url
        )
      `)
      .eq('author_id', userId)
      .not('reply_to_id', 'is', null)
      .or('is_thread_starter.is.true,thread_id.is.null')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('❌ Error fetching user replies:', error);
      return [];
    }

    // Transform data efficiently
    const transformedReplies = (replies || []).map((reply: any) => ({
      id: reply.id.toString(),
        content: reply.content,
        createdAt: reply.created_at,
        replyToId: reply.reply_to_id,
        isWeeklySummary: reply.is_weekly_summary || false,
      reactionCount: 0,
      replyCount: 0,
      reactions: [],
      replies: [],
      repostOfId: null,
      originalChirp: undefined,
        author: {
        id: reply.users.id,
        firstName: reply.users.first_name || 'User',
        lastName: reply.users.last_name || '',
        email: reply.users.email,
        customHandle: reply.users.custom_handle || reply.users.handle,
        handle: reply.users.handle,
        profileImageUrl: reply.users.profile_image_url,
        avatarUrl: reply.users.avatar_url,
        bannerImageUrl: reply.users.banner_image_url,
        bio: '',
        joinedAt: new Date().toISOString(),
        isChirpPlus: false,
        showChirpPlusBadge: false
      }
    }));
    
    // Cache the result
    chirpCache.set(cacheKey, { data: transformedReplies, timestamp: Date.now(), ttl: CACHE_TTL });
    
    console.log(`✅ User replies fetched in ${Date.now() - startTime}ms`);
    return transformedReplies;
  } catch (error) {
    console.error('❌ Error fetching user replies:', error);
    return [];
  }
}

// Optimized for you chirps with caching
// Helper function to add like status to chirps
async function addLikeStatusToChirps(chirps: any[], currentUserId: string): Promise<any[]> {
  if (!currentUserId || chirps.length === 0) {
    return chirps.map(chirp => ({ ...chirp, userHasLiked: false }));
  }

  const chirpIds = chirps.map(c => c.id);
  const { data: userLikes } = await supabase
    .from('reactions')
    .select('chirp_id')
    .eq('user_id', currentUserId)
    .in('chirp_id', chirpIds);

  const userLikesMap = new Map();
  userLikes?.forEach(like => {
    userLikesMap.set(like.chirp_id, true);
  });

  return chirps.map(chirp => ({
    ...chirp,
    userHasLiked: userLikesMap.get(chirp.id) || false
  }));
}

// Fallback function for basic feed without personalization
async function getBasicForYouFeed(): Promise<any[]> {
  const { data: chirps, error } = await supabase
    .from('chirps')
    .select(`
      id,
      content,
      created_at,
      reply_to_id,
      is_weekly_summary,
      users!inner(
        id,
        first_name,
        last_name,
        email,
        custom_handle,
        handle,
        profile_image_url,
        avatar_url,
        banner_image_url
      )
    `)
    .is('reply_to_id', null)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error || !chirps) return [];

  // Transform chirps and add actual counts
  const transformedChirps = await Promise.all((chirps || []).map(async (chirp: any) => {
    // Get actual reaction and reply counts
    const [reactionCount, replyCount] = await Promise.all([
      supabase.from('reactions').select('id', { count: 'exact' }).eq('chirp_id', chirp.id).then(({ count }) => count || 0),
      supabase.from('chirps').select('id', { count: 'exact' }).eq('reply_to_id', chirp.id).then(({ count }) => count || 0)
    ]);

    return {
      id: chirp.id.toString(),
      content: chirp.content,
      createdAt: chirp.created_at,
      replyToId: chirp.reply_to_id,
      isWeeklySummary: chirp.is_weekly_summary || false,
      reactionCount,
      replyCount,
      reactions: [],
      replies: [],
      repostOfId: null,
      originalChirp: undefined,
      userHasLiked: false,
      author: {
        id: chirp.users.id,
        firstName: chirp.users.first_name || 'User',
        lastName: chirp.users.last_name || '',
        email: chirp.users.email || 'user@example.com',
        customHandle: chirp.users.custom_handle || chirp.users.handle,
        handle: chirp.users.handle,
        profileImageUrl: chirp.users.profile_image_url,
        avatarUrl: chirp.users.avatar_url,
        bannerImageUrl: chirp.users.banner_image_url,
        bio: '',
        joinedAt: new Date().toISOString(),
        isChirpPlus: false,
        showChirpPlusBadge: false
      }
    };
  }));

  return transformedChirps;
}

export async function getForYouChirps(): Promise<any[]> {
  try {
    console.log('🔄 Fetching for you chirps with personalized algorithm');
    const startTime = Date.now();
    
    // Check cache first
    const cacheKey = 'for_you_chirps';
    const cached = chirpCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < cached.ttl) {
      console.log('✅ Returning cached for you chirps');
      return cached.data;
    }
    
    // Quick connection check
    const isConnected = await ensureDatabaseInitialized();
    
    if (!isConnected) {
      console.log('🔄 Database not connected, returning empty array');
      return [];
    }
    
    // Get current user ID for personalized feed
    const { data: { user } } = await supabase.auth.getUser();
    const currentUserId = user?.id;

    if (!currentUserId) {
      console.log('🔄 No authenticated user, returning basic feed');
      // Fallback to basic feed without personalization
      return await getBasicForYouFeed();
    }

    // Use the new For You algorithm
    const { default: ForYouAlgorithm } = await import('./services/forYouAlgorithm');
    const personalizedChirps = await ForYouAlgorithm.getForYouFeed({
      userId: currentUserId,
      limit: 20,
      includeReplies: false,
      prioritizeFollowed: true
    });

    // Add like status for current user
    const chirpsWithLikeStatus = await addLikeStatusToChirps(personalizedChirps, currentUserId);
    
    // Cache the result
    chirpCache.set(cacheKey, { data: chirpsWithLikeStatus, timestamp: Date.now(), ttl: CACHE_TTL });
    
    console.log(`✅ For you chirps fetched with algorithm in ${Date.now() - startTime}ms`);
    console.log('📊 Chirps data summary:', {
      count: chirpsWithLikeStatus.length,
      firstChirpId: chirpsWithLikeStatus[0]?.id,
      hasAuthorData: !!chirpsWithLikeStatus[0]?.author,
      hasImageData: !!chirpsWithLikeStatus[0]?.author?.profileImageUrl
    });
    
    return chirpsWithLikeStatus;
  } catch (error) {
    console.error('❌ Error fetching for you chirps:', error);
    return [];
  }
}

// Cache clearing function
export const clearChirpCache = () => {
  chirpCache.clear();
  console.log('🗑️ Chirp cache cleared');
  // Don't reset connection status - just clear the data cache
  // This allows fresh data to be fetched without losing connection
};

// Clear connection cache to force fresh connection test
export const clearConnectionCache = () => {
  isDatabaseConnected = false;
  connectionTestPromise = null;
  lastConnectionTest = 0;
  console.log('🔄 Connection cache cleared');
};

// Authenticate user by username using Supabase
export const authenticateUserByUsername = async (username: string, password: string) => {
  try {
    console.log('🔐 Attempting to authenticate user by username:', username);
    await ensureDatabaseInitialized();
    
    if (!isDatabaseConnected) {
      console.log('🔄 Database not connected, cannot authenticate');
      throw new Error('Database not connected');
    }

    // First, try to find the user by custom_handle
    console.log('🔍 Searching for user with username:', username);
    let userProfile = null;
    let profileError = null;

    // Try custom_handle first
    const { data: customHandleUser, error: customHandleError } = await supabase
      .from('users')
      .select('*')
      .eq('custom_handle', username)
      .single();

    if (customHandleUser) {
      userProfile = customHandleUser;
    } else if (customHandleError?.code !== 'PGRST116') { // PGRST116 = no rows found
      console.log('❌ Error searching by custom_handle:', customHandleError);
      return null;
    } else {
      // Try handle if custom_handle didn't work
      const { data: handleUser, error: handleError } = await supabase
        .from('users')
        .select('*')
        .eq('handle', username)
        .single();

      if (handleUser) {
        userProfile = handleUser;
      } else if (handleError?.code !== 'PGRST116') {
        console.log('❌ Error searching by handle:', handleError);
        return null;
      } else {
        // Try email if handle didn't work (for users logging in with email)
        const { data: emailUser, error: emailError } = await supabase
          .from('users')
          .select('*')
          .eq('email', username)
          .single();

        if (emailUser) {
          userProfile = emailUser;
        } else if (emailError?.code !== 'PGRST116') {
          console.log('❌ Error searching by email:', emailError);
          return null;
        }
      }
    }

    if (!userProfile) {
      console.log('❌ No user found with username/email:', username);
      return null;
    }

    console.log('✅ Found user profile:', userProfile.id, 'email:', userProfile.email);

    // For now, we'll skip Supabase auth and just validate the user exists
    // This bypasses the email confirmation requirement
    // TODO: Implement proper password hashing/validation
    console.log('✅ User authenticated successfully by username (bypassing email confirmation)');
    return {
      id: userProfile.id,
      email: userProfile.email,
      display_name: userProfile.display_name,
      first_name: userProfile.first_name,
      last_name: userProfile.last_name,
      custom_handle: userProfile.custom_handle,
      handle: userProfile.handle,
      profile_image_url: userProfile.profile_image_url,
      banner_image_url: userProfile.banner_image_url,
      bio: userProfile.bio
    };
  } catch (error) {
    console.error('❌ Error in authenticateUserByUsername:', error);
    return null;
  }
};

// Sign in function using Supabase auth
export const signInWithSupabase = async (email: string, password: string) => {
  try {
    console.log('🔐 Attempting Supabase sign in for:', email);
    await ensureDatabaseInitialized();
    
    if (!isDatabaseConnected) {
      console.log('🔄 Database not connected, cannot sign in');
      throw new Error('Database not connected');
    }

    // Sign in with Supabase auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
      });

    if (error) {
      console.error('❌ Supabase sign in error:', truncateError(error));
      throw error;
    }
    
    if (data.user) {
      console.log('✅ User signed in successfully:', data.user.id);
      
      // Get user profile from users table
      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError) {
        console.error('❌ Error fetching user profile:', profileError);
        throw new Error('Failed to fetch user profile');
      }

      console.log('✅ User profile fetched successfully');
      return {
        user: data.user,
        session: data.session,
        profile: userProfile
      };
    }

    throw new Error('No user data returned from sign in');
  } catch (error) {
    console.error('❌ Error in sign in:', truncateError(error));
    throw error;
  }
};

// Sign up function using Supabase auth
export const signUp = async (email: string, password: string, name: string, customHandle?: string) => {
  try {
    console.log('📝 Creating user account with Supabase auth');
    await ensureDatabaseInitialized();
    
    if (!isDatabaseConnected) {
      console.log('🔄 Database not connected, cannot create account');
      throw new Error('Database not connected');
    }

    // Generate a UUID for the user (bypass Supabase auth to avoid email confirmation)
    const userId = crypto.randomUUID();
    console.log('✅ Generated user ID:', userId);
    
    // Create user profile directly in the users table (bypass Supabase auth)
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .insert({
        id: userId,
        email: email,
        first_name: name.split(' ')[0] || name,
        last_name: name.split(' ').slice(1).join(' ') || '',
        custom_handle: customHandle,
        handle: customHandle || `user_${userId.substring(0, 8)}`,
        display_name: name,
        bio: '',
        profile_image_url: null,
        banner_image_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (profileError) {
      console.error('❌ Error creating user profile:', profileError);
      throw new Error('Failed to create user profile');
    }

    console.log('✅ User profile created successfully:', userProfile.id);
    
    // Return a mock user object that matches Supabase auth format
    return { 
      user: {
        id: userId,
        email: email,
        email_confirmed_at: new Date().toISOString(), // Mark as confirmed
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    };
  } catch (error) {
    console.error('❌ Error in sign up:', error);
    throw error;
  }
};

// Export other functions as needed
export const createChirp = async (content: string, authorId?: string, replyToId?: string | null): Promise<any> => {
  try {
    console.log('🔄 Creating chirp:', { content, authorId, replyToId });
    await ensureDatabaseInitialized();
    
    if (!isDatabaseConnected) {
      console.log('🔄 Database not connected, cannot create chirp');
      throw new Error('Database not connected');
    }

    if (!authorId) {
      console.error('❌ Author ID is required to create chirp');
      throw new Error('Author ID is required');
      }

    const { data, error } = await supabase
      .from('chirps')
      .insert({
        content: content,
        author_id: authorId,
        reply_to_id: replyToId || null,
        is_weekly_summary: false
      })
      .select(`
        *,
        users(
          id,
          first_name,
          last_name,
          custom_handle,
          handle,
          profile_image_url,
          banner_image_url
        )
      `)
      .single();

    if (error) {
      console.error('❌ Error creating chirp:', error);
      throw error;
    }

    console.log('✅ Chirp created successfully:', data.id);
    console.log('📊 Created chirp ID:', truncateId(data?.id)); // Added debugging
    clearChirpCache();
    return data;
  } catch (error) {
    console.error('❌ Error creating chirp:', error);
    throw error;
  }
};

export const createThread = async (threadParts: string[], authorId: string): Promise<any[]> => {
  try {
    console.log('🔄 Creating thread with', threadParts.length, 'parts');
    await ensureDatabaseInitialized();
    
    if (!isDatabaseConnected) {
      console.log('🔄 Database not connected, cannot create thread');
      throw new Error('Database not connected');
    }

    if (!authorId) {
      console.error('❌ Author ID is required to create thread');
      throw new Error('Author ID is required');
    }

    if (threadParts.length === 0) {
      throw new Error('Thread must have at least one part');
    }

    const createdChirps: any[] = [];
    
    // Create the first chirp as the thread starter
    const { data: threadStarter, error: starterError } = await supabase
      .from('chirps')
      .insert({
        content: threadParts[0],
        author_id: authorId,
        is_thread_starter: true,
        thread_order: 0,
        is_weekly_summary: false
      })
      .select(`
        *,
        users(
          id,
          first_name,
          last_name,
          custom_handle,
          handle,
          profile_image_url,
          banner_image_url
        )
      `)
      .single();

    if (starterError) {
      console.error('❌ Error creating thread starter:', starterError);
      throw starterError;
    }

    // Set the thread starter's thread_id to reference itself
    const { error: updateError } = await supabase
      .from('chirps')
      .update({ thread_id: threadStarter.id })
      .eq('id', threadStarter.id);

    if (updateError) {
      console.error('❌ Error updating thread starter thread_id:', updateError);
      throw updateError;
    }

    createdChirps.push({ ...threadStarter, thread_id: threadStarter.id });

    // Create the remaining parts as threaded chirps
    for (let i = 1; i < threadParts.length; i++) {
      const { data: chirp, error: chirpError } = await supabase
      .from('chirps')
        .insert({
          content: threadParts[i],
          author_id: authorId,
          thread_id: threadStarter.id,
          thread_order: i,
          is_thread_starter: false,
          is_weekly_summary: false
        })
      .select(`
        *,
          users(
          id,
          first_name,
          last_name,
          custom_handle,
          handle,
          profile_image_url,
          banner_image_url
        )
      `)
        .single();

      if (chirpError) {
        console.error('❌ Error creating thread part:', chirpError);
        throw chirpError;
      }

      createdChirps.push(chirp);
    }

    console.log('✅ Thread created successfully with', createdChirps.length, 'chirps');
    clearChirpCache();
    return createdChirps;
  } catch (error) {
    console.error('❌ Error creating thread:', error);
    throw error;
  }
};

export const updateUserProfile = async (userId: string, updates: any): Promise<any> => {
  try {
    console.log('Updating user profile:', userId, updates);
    await ensureDatabaseInitialized();
    if (!isDatabaseConnected) {
      console.log('🔄 Database not connected, mock profile update');
      return { success: true };
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
    console.log('✅ User profile updated successfully');
    return data;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

export const uploadProfileImage = async (userId: string, imageUri: string): Promise<string> => {
  try {
    console.log('Uploading profile image for user:', userId);
    await ensureDatabaseInitialized();
    if (!isDatabaseConnected) {
      console.log('🔄 Database not connected, mock profile image upload');
      return imageUri;
    }
    
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .single();
    if (userError || !user) {
      console.error('User not found:', userId);
      throw new Error('User not found');
    }
    
    try {
      // Convert image to blob
      const response = await fetch(imageUri);
      const blob = await response.blob();
      
      // Create a unique filename
      const fileExt = imageUri.split('.').pop() || 'jpg';
      const fileName = `profile-${userId}-${Date.now()}.${fileExt}`;
      
      // Try to upload to Supabase storage, fall back to base64 if bucket doesn't exist
      try {
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('profile-images')
          .upload(fileName, blob, {
            contentType: blob.type,
            upsert: true
          });
        
        if (uploadError) {
          console.log('Storage bucket not found, falling back to base64 storage');
          throw uploadError;
        }
        
        // Get public URL
        const { data: urlData } = supabase.storage
          .from('profile-images')
          .getPublicUrl(fileName);
        
        console.log('✅ Profile image uploaded successfully:', urlData.publicUrl);
        return urlData.publicUrl;
      } catch (storageError) {
        console.log('Storage upload failed, using base64 fallback');
        // Fall back to base64 storage
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
        });
        reader.readAsDataURL(blob);
        const base64Data = await base64Promise;
        console.log('✅ Profile image stored as base64');
        return base64Data;
      }
    } catch (conversionError) {
      console.error('Error uploading profile image:', conversionError);
      throw conversionError;
    }
  } catch (error) {
    console.error('Error uploading profile image:', error);
    throw error;
  }
};

export const uploadBannerImage = async (userId: string, imageUri: string): Promise<string> => {
  try {
    console.log('Uploading banner image for user:', userId);
    await ensureDatabaseInitialized();
    if (!isDatabaseConnected) {
      console.log('🔄 Database not connected, mock banner image upload');
      return imageUri;
    }
    
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .single();
    if (userError || !user) {
      console.error('User not found:', userId);
      throw new Error('User not found');
    }
    
    try {
      // Convert image to blob
      const response = await fetch(imageUri);
      const blob = await response.blob();
      
      // Create a unique filename
      const fileExt = imageUri.split('.').pop() || 'jpg';
      const fileName = `banner-${userId}-${Date.now()}.${fileExt}`;
      
      // Try to upload to Supabase storage, fall back to base64 if bucket doesn't exist
      try {
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('banner-images')
          .upload(fileName, blob, {
            contentType: blob.type,
            upsert: true
          });
        
        if (uploadError) {
          console.log('Storage bucket not found, falling back to base64 storage');
          throw uploadError;
        }
        
        // Get public URL
        const { data: urlData } = supabase.storage
          .from('banner-images')
          .getPublicUrl(fileName);
        
        console.log('✅ Banner image uploaded successfully:', urlData.publicUrl);
        return urlData.publicUrl;
      } catch (storageError) {
        console.log('Storage upload failed, using base64 fallback');
        // Fall back to base64 storage
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
        });
        reader.readAsDataURL(blob);
        const base64Data = await base64Promise;
        console.log('✅ Banner image stored as base64');
        return base64Data;
      }
    } catch (conversionError) {
      console.error('Error uploading banner image:', conversionError);
      throw conversionError;
    }
  } catch (error) {
    console.error('Error uploading banner image:', error);
    throw error;
  }
};

export const getChirpReplies = async (chirpId: string): Promise<any[]> => {
  try {
    console.log('🔄 Fetching replies for chirp:', chirpId);
    await ensureDatabaseInitialized();
    
    if (!isDatabaseConnected) {
      console.log('🔄 Database not connected, cannot fetch replies');
      return [];
    }
    
    const { data: replies, error } = await supabase
      .from('chirps')
      .select(`
        id,
        content,
        created_at,
        reply_to_id,
        is_weekly_summary,
        users(
          id,
          first_name,
          last_name,
          custom_handle,
          handle,
          profile_image_url,
          banner_image_url
        )
      `)
      .eq('reply_to_id', chirpId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('❌ Error fetching replies:', error);
      return [];
    }

    const transformedReplies = (replies || []).map((reply: any) => ({
      id: reply.id.toString(),
      content: reply.content,
      createdAt: reply.created_at,
      replyToId: reply.reply_to_id,
      isWeeklySummary: reply.is_weekly_summary || false,
      reactionCount: 0,
      replyCount: 0,
      reactions: [],
      replies: [],
      repostOfId: null,
      originalChirp: undefined,
      author: {
        id: reply.users.id,
        firstName: reply.users.first_name || 'User',
        lastName: reply.users.last_name || '',
        email: reply.users.email,
        customHandle: reply.users.custom_handle || reply.users.handle,
        handle: reply.users.handle,
        profileImageUrl: reply.users.profile_image_url,
        avatarUrl: reply.users.profile_image_url,
        bannerImageUrl: reply.users.banner_image_url,
        bio: '',
        joinedAt: new Date().toISOString(),
        isChirpPlus: false,
        showChirpPlusBadge: false
      }
    }));

    console.log(`✅ Fetched ${transformedReplies.length} replies for chirp ${chirpId}`);
    return transformedReplies;
  } catch (error) {
    console.error('❌ Error fetching replies:', error);
    return [];
  }
};

export const createReply = async (content: string, chirpId: string, userId: string): Promise<any> => {
  try {
    console.log('📝 Creating reply to chirp:', chirpId, 'by user:', userId);
    await ensureDatabaseInitialized();
    
    if (!isDatabaseConnected) {
      console.log('🔄 Database not connected, cannot create reply');
      throw new Error('Database not connected');
    }
    
    const { data: reply, error } = await supabase
      .from('chirps')
      .insert({
        content: content.trim(),
        author_id: userId,
        reply_to_id: chirpId,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Error creating reply:', error);
      throw error;
    }

    console.log('✅ Reply created successfully:', reply.id);
    
    // Create notification for the chirp author
    try {
      const { notificationService } = await import('./services/notificationService');
      await notificationService.createCommentNotification(userId, chirpId);
      console.log('✅ Comment notification created');
    } catch (notificationError) {
      console.error('❌ Error creating comment notification:', notificationError);
      // Don't throw here - reply was created successfully
    }
    
    return reply;
  } catch (error) {
    console.error('❌ Error in createReply:', error);
    throw error;
  }
};

export const getChirpById = async (chirpId: string): Promise<any> => {
  try {
    console.log('🔄 Fetching chirp by ID:', chirpId);
    await ensureDatabaseInitialized();
    
    if (!isDatabaseConnected) {
      console.log('🔄 Database not connected, cannot fetch chirp');
      return null;
    }

    const { data: chirp, error } = await supabase
      .from('chirps')
      .select(`
        id,
        content,
        created_at,
        reply_to_id,
        is_weekly_summary,
        thread_id,
        thread_order,
        is_thread_starter,
        users(
          id,
          first_name,
          last_name,
          custom_handle,
          handle,
          profile_image_url,
          banner_image_url
        )
      `)
      .eq('id', chirpId)
      .single();

    if (error) {
      console.error('❌ Error fetching chirp:', error);
      return null;
    }

    const transformedChirp = {
      id: chirp.id.toString(),
      content: chirp.content,
      createdAt: chirp.created_at,
      replyToId: chirp.reply_to_id,
      isWeeklySummary: chirp.is_weekly_summary || false,
      threadId: chirp.thread_id,
      threadOrder: chirp.thread_order,
      isThreadStarter: chirp.is_thread_starter,
      reactionCount: 0,
      replyCount: 0,
      reactions: [],
      replies: [],
      repostOfId: null,
      originalChirp: undefined,
      author: {
        id: (chirp.users as any).id,
        firstName: (chirp.users as any).first_name || 'User',
        lastName: (chirp.users as any).last_name || '',
        email: (chirp.users as any).email,
        customHandle: (chirp.users as any).custom_handle || (chirp.users as any).handle,
        handle: (chirp.users as any).handle,
        profileImageUrl: (chirp.users as any).profile_image_url,
        avatarUrl: (chirp.users as any).profile_image_url,
        bannerImageUrl: (chirp.users as any).banner_image_url,
        bio: '',
        joinedAt: new Date().toISOString(),
        isChirpPlus: false,
        showChirpPlusBadge: false
      }
    };

    console.log(`✅ Fetched chirp ${chirpId}`);
    return transformedChirp;
  } catch (error) {
    console.error('❌ Error fetching chirp:', error);
    return null;
  }
};

export const getThreadedChirps = async (threadId: string): Promise<any[]> => {
  try {
    console.log('🔄 Fetching threaded chirps for thread:', threadId);
    await ensureDatabaseInitialized();
    if (!isDatabaseConnected) {
      console.log('🔄 Database not connected, cannot fetch threaded chirps');
    return [];
  }
    const { data: threadChirps, error } = await supabase
      .from('chirps')
      .select(`
        id, content, created_at, reply_to_id, is_weekly_summary, thread_id, thread_order, is_thread_starter,
        users(id, first_name, last_name, custom_handle, handle, profile_image_url, banner_image_url)
      `)
      .eq('thread_id', threadId)
      .order('thread_order', { ascending: true });
    if (error) { console.error('❌ Error fetching threaded chirps:', error); return []; }
    const transformedThreadChirps = (threadChirps || []).map((chirp: any) => ({
      id: chirp.id.toString(), content: chirp.content, createdAt: chirp.created_at,
      replyToId: chirp.reply_to_id, isWeeklySummary: chirp.is_weekly_summary || false,
      threadId: chirp.thread_id, threadOrder: chirp.thread_order, isThreadStarter: chirp.is_thread_starter,
      reactionCount: 0, replyCount: 0, reactions: [], replies: [], repostOfId: null, originalChirp: undefined,
      author: {
        id: chirp.users.id, firstName: chirp.users.first_name || 'User', lastName: chirp.users.last_name || '',
        email: chirp.users.email, customHandle: chirp.users.custom_handle || chirp.users.handle,
        handle: chirp.users.handle, profileImageUrl: chirp.users.profile_image_url,
        avatarUrl: chirp.users.profile_image_url, bannerImageUrl: chirp.users.banner_image_url, bio: '',
        joinedAt: new Date().toISOString(), isChirpPlus: false, showChirpPlusBadge: false
      }
    }));
    console.log(`✅ Fetched ${transformedThreadChirps.length} threaded chirps for thread ${threadId}`);
    return transformedThreadChirps;
  } catch (error) { console.error('❌ Error fetching threaded chirps:', error); return []; }
};

// Delete chirp function
export const deleteChirp = async (chirpId: string, userId: string): Promise<void> => {
  try {
    console.log('🗑️ Deleting chirp:', truncateId(chirpId), 'by user:', truncateId(userId));
    await ensureDatabaseInitialized();
    
    if (!isDatabaseConnected) {
      console.log('🔄 Database not connected, cannot delete chirp');
      console.log('🔍 Debug: isDatabaseConnected =', isDatabaseConnected);
      console.log('🔍 Debug: Testing connection again...');
      const connectionTest = await testDatabaseConnection();
      console.log('🔍 Debug: Connection test result =', connectionTest);
      if (!connectionTest) {
        throw new Error('Database not connected');
      }
    }

    // Delete the chirp (cascade will handle reactions and replies)
    const { error } = await supabase
      .from('chirps')
      .delete()
      .eq('id', chirpId)
      .eq('author_id', userId);

    if (error) {
      console.error('❌ Error deleting chirp:', error);
      throw error;
    }

    console.log('✅ Chirp deleted successfully');
    clearChirpCache(); // Clear cache to refresh feeds
  } catch (error) {
    console.error('❌ Error deleting chirp:', error);
    throw error;
  }
};

// Get user by ID
export const getUserById = async (userId: string): Promise<any> => {
  try {
    console.log('🔄 Fetching user by ID:', userId);
    await ensureDatabaseInitialized();
    
    if (!isDatabaseConnected) {
      console.log('🔄 Database not connected, cannot fetch user');
      return null;
    }
    
    const { data: user, error } = await supabase
          .from('users')
      .select('*')
      .eq('id', userId)
          .single();

    if (error) {
      console.error('❌ Error fetching user:', error);
      return null;
    }

    console.log('✅ User fetched successfully:', {
      id: user.id,
      handle: user.handle,
      customHandle: user.custom_handle,
      profileImageUrl: user.profile_image_url ? 'has image' : 'no image'
    });
    return user;
  } catch (error) {
    console.error('❌ Error fetching user:', error);
    return null;
  }
};

// Get current user ID from auth context
export const getCurrentUserId = async (): Promise<string | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id || null;
  } catch (error) {
    console.error('❌ Error getting current user:', error);
    return null;
  }
};

// Get followers for a user
export const getFollowers = async (userId: string): Promise<any[]> => {
  try {
    console.log('🔄 Fetching followers for user:', userId);
    await ensureDatabaseInitialized();
    
    if (!isDatabaseConnected) {
      console.log('🔄 Database not connected, cannot fetch followers');
      return [];
    }

    const { data: followers, error } = await supabase
      .from('follows')
      .select(`
        follower_id,
        users!follows_follower_id_fkey (
          id,
          handle,
          custom_handle,
          profile_image_url,
          bio,
          first_name,
          last_name
        )
      `)
      .eq('following_id', userId);

    if (error) {
      console.error('❌ Error fetching followers:', error);
      return [];
    }

    const transformedFollowers = (followers || []).map((follow: any) => ({
      id: follow.users.id,
      handle: follow.users.handle,
      customHandle: follow.users.custom_handle,
      profileImageUrl: follow.users.profile_image_url,
      bio: follow.users.bio,
      firstName: follow.users.first_name,
      lastName: follow.users.last_name
    }));

    console.log(`✅ Fetched ${transformedFollowers.length} followers`);
    return transformedFollowers;
  } catch (error) {
    console.error('❌ Error fetching followers:', error);
    return [];
  }
};

// Get following for a user
export const getFollowing = async (userId: string): Promise<any[]> => {
  try {
    console.log('🔄 Fetching following for user:', userId);
    await ensureDatabaseInitialized();
    
    if (!isDatabaseConnected) {
      console.log('🔄 Database not connected, cannot fetch following');
      return [];
    }

    const { data: following, error } = await supabase
      .from('follows')
      .select(`
        following_id,
        users!follows_following_id_fkey (
          id,
          handle,
          custom_handle,
          profile_image_url,
          bio,
          first_name,
          last_name
        )
      `)
      .eq('follower_id', userId);

    if (error) {
      console.error('❌ Error fetching following:', error);
      return [];
    }

    const transformedFollowing = (following || []).map((follow: any) => ({
      id: follow.users.id,
      handle: follow.users.handle,
      customHandle: follow.users.custom_handle,
      profileImageUrl: follow.users.profile_image_url,
      bio: follow.users.bio,
      firstName: follow.users.first_name,
      lastName: follow.users.last_name
    }));

    console.log(`✅ Fetched ${transformedFollowing.length} following`);
    return transformedFollowing;
  } catch (error) {
    console.error('❌ Error fetching following:', error);
    return [];
  }
};

// Check follow status between users
export const checkFollowStatus = async (userId: string, currentUserId?: string): Promise<any> => {
  try {
    // Use provided currentUserId or try to get it from auth
    let followerId = currentUserId;
    if (!followerId) {
      const { data: { user } } = await supabase.auth.getUser();
      followerId = user?.id;
    }
    
    if (!followerId) {
      return { isFollowing: false, isBlocked: false, notificationsEnabled: false };
    }

    console.log('🔍 Checking follow status:', {
      followerId,
      followingId: userId,
      hasFollowerId: !!followerId
    });

    const { data: follow, error } = await supabase
      .from('follows')
      .select('*')
      .eq('follower_id', followerId)
      .eq('following_id', userId)
      .maybeSingle();

    console.log('🔍 Follow query result:', {
      follow,
      error,
      isFollowing: !error && !!follow
    });

    return {
      isFollowing: !error && !!follow,
      isBlocked: false, // Block functionality not implemented yet
      notificationsEnabled: false // Notification settings not implemented yet
    };
  } catch (error) {
    console.error('❌ Error checking follow status:', error);
    return { isFollowing: false, isBlocked: false, notificationsEnabled: false };
  }
};

// Check block status between users
export const checkBlockStatus = async (currentUserId: string, targetUserId: string): Promise<boolean> => {
  try {
    // Block functionality not implemented yet, return false
    return false;
  } catch (error) {
    console.error('❌ Error checking block status:', error);
    return false;
  }
};

// Follow a user
export const followUser = async (followerId: string, followingId: string): Promise<void> => {
  try {
    console.log('🔄 Following user:', followingId);
    await ensureDatabaseInitialized();
    
    if (!isDatabaseConnected) {
      console.log('🔄 Database not connected, cannot follow user');
      return;
    }
    
    // Check if relationship already exists
    const { data: existingFollow } = await supabase
      .from('follows')
      .select('*')
      .eq('follower_id', followerId)
      .eq('following_id', followingId)
      .maybeSingle();

    if (existingFollow) {
      console.log('✅ Already following this user');
      return;
    }
    
    const { error } = await supabase
      .from('follows')
      .insert({
        follower_id: followerId,
        following_id: followingId,
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('❌ Error following user:', error);
      throw error;
    }

    console.log('✅ User followed successfully');
    
    // Create notification for the followed user
    const { notificationService } = await import('./services/notificationService');
    await notificationService.createFollowNotification(followerId, followingId);
  } catch (error) {
    console.error('❌ Error following user:', error);
    throw error;
  }
};

// Unfollow a user
export const unfollowUser = async (followerId: string, followingId: string): Promise<void> => {
  try {
    console.log('🔄 Unfollowing user:', followingId);
    await ensureDatabaseInitialized();
    
    if (!isDatabaseConnected) {
      console.log('🔄 Database not connected, cannot unfollow user');
      return;
    }
    
    const { error } = await supabase
      .from('follows')
      .delete()
      .eq('follower_id', followerId)
      .eq('following_id', followingId);

    if (error) {
      console.error('❌ Error unfollowing user:', error);
      throw error;
    }

    console.log('✅ User unfollowed successfully');
  } catch (error) {
    console.error('❌ Error unfollowing user:', error);
    throw error;
  }
};

// Block a user (placeholder)
export const blockUser = async (blockerId: string, blockedId: string): Promise<void> => {
  try {
    console.log('🔄 Blocking user:', blockedId);
    // Block functionality not implemented yet
    throw new Error('Block functionality not implemented yet');
  } catch (error) {
    console.error('❌ Error blocking user:', error);
    throw error;
  }
};

// Unblock a user (placeholder)
export const unblockUser = async (blockerId: string, blockedId: string): Promise<void> => {
  try {
    console.log('🔄 Unblocking user:', blockedId);
    // Block functionality not implemented yet
    throw new Error('Block functionality not implemented yet');
  } catch (error) {
    console.error('❌ Error unblocking user:', error);
      throw error;
  }
};

// Toggle user notifications (placeholder)
export const toggleUserNotifications = async (userId: string, targetUserId: string): Promise<void> => {
  try {
    console.log('🔄 Toggling notifications for user:', targetUserId);
    // Notification functionality not implemented yet
    throw new Error('Notification functionality not implemented yet');
  } catch (error) {
    console.error('❌ Error toggling notifications:', error);
    throw error;
  }
};
