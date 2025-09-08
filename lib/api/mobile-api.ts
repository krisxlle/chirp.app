// Mobile API client using Supabase directly
import { createChirp as createChirpSupabase, getForYouChirps as getForYouChirpsSupabase, getUserChirps as getUserChirpsSupabase, getUserReplies as getUserRepliesSupabase, getUserStats as getUserStatsSupabase } from '../database/mobile-db-supabase';

// API base URL - using Supabase directly
const API_BASE_URL = 'https://qrzbtituxxilnbgocdge.supabase.co';

// Helper function for API calls (fallback for any non-Supabase endpoints)
const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, defaultOptions);
    
    if (!response.ok) {
      throw new Error(`API call failed: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API call error:', error);
    throw error;
  }
};

// Chirp functions using Supabase
export const createChirp = async (content: string, authorId: string, replyToId?: string | null) => {
  console.log('Creating chirp via Supabase:', { content, authorId, replyToId });
  return await createChirpSupabase(content, authorId, replyToId);
};

export const getForYouChirps = async (limit: number = 20, offset: number = 0) => {
  console.log('Fetching for you chirps via Supabase with pagination');
  return await getForYouChirpsSupabase(limit, offset);
};

export const getUserChirps = async (userId: string) => {
  console.log('Fetching user chirps via Supabase:', userId);
  return await getUserChirpsSupabase(userId);
};

export const getUserReplies = async (userId: string) => {
  console.log('Fetching user replies via Supabase:', userId);
  return await getUserRepliesSupabase(userId);
};

export const getUserStats = async (userId: string) => {
  console.log('Fetching user stats via Supabase:', userId);
  return await getUserStatsSupabase(userId);
};

// Push notification functions (temporarily disabled since backend server is removed)
export const registerPushToken = async (token: string, userId: string) => {
  console.log('Registering push token for user:', userId);
  
  try {
    // TODO: Implement push notifications with Supabase Edge Functions or a separate service
    // For now, we'll just log the token since the backend server is no longer available
    console.log('📱 Push token registration temporarily disabled');
    console.log('📱 Token received');
    console.log('📱 User ID:', userId);
    
    // Return a mock success response
    return { success: true, message: 'Push token logged (backend server removed)' };
    
    /*
    // Original implementation (commented out since backend server is removed)
    const response = await fetch('http://localhost:4000/api/push-tokens', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token, userId }),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to register push token: ${response.status}`);
    }
    
    return await response.json();
    */
  } catch (error) {
    console.error('Error registering push token:', error);
    // Don't throw error since this is expected behavior
    return { success: false, message: 'Push notifications temporarily disabled' };
  }
};

