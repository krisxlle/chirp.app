import React, { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { ProfileProvider } from './ProfileContext';

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

interface User {
  id: string;
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  customHandle?: string;
  handle?: string;
  profileImageUrl?: string;
  avatarUrl?: string;
  bannerImageUrl?: string;
  bio?: string;
  linkInBio?: string;
  crystalBalance?: number;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (username: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
  refreshCrystalBalance: () => Promise<void>;
  isAuthenticated: boolean;
  clearSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuthState = async () => {
    try {
      console.log('🔍 Checking authentication state...');
      
      const storedUser = await storage.getItem('user');
      const userSignedOut = await storage.getItem('userSignedOut');
      
      // If user explicitly signed out, don't restore session
      if (userSignedOut === 'true') {
        console.log('🚪 User explicitly signed out - requiring fresh login');
        setUser(null);
        setIsLoading(false);
        return;
      }
      
      if (storedUser) {
        const user = JSON.parse(storedUser);
        console.log('✅ Found stored user session:', user.customHandle || user.handle || user.id);
        setUser(user);
        setIsLoading(false);
        return;
      }
      
      console.log('❌ No stored user session found - showing login screen');
      setIsLoading(false);
    } catch (error) {
      console.error('Error checking auth state:', error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log('🚀 AuthProvider: Starting auth state check...');
    checkAuthState().catch(error => {
      console.error('Error in checkAuthState:', error);
      setIsLoading(false);
    });
  }, []);

  // Removed auto-login functionality - users must explicitly sign in

  const signIn = async (username: string, password?: string): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log('🔐 Attempting sign in for:', username);
      setIsLoading(true);
      
      // Require password for security
      if (!password) {
        console.log('❌ Password is required for authentication');
        setIsLoading(false);
        return { success: false, error: 'Password is required' };
      }
      
      // Clear any old session data to ensure fresh authentication
      await storage.removeItem('user');
      await storage.removeItem('userSignedOut');
      
      // Clear all caches to prevent showing old user's data
      const { clearChirpCache } = await import('../lib/database/mobile-db-supabase');
      clearChirpCache();
      
      // Authenticate user with username and password using Supabase
      console.log('🔐 Using Supabase authentication for username:', username);
      const { authenticateUserByUsername } = await import('../lib/database/mobile-db-supabase');
      const dbUser = await authenticateUserByUsername(username, password);
      
      if (dbUser) {
        console.log('✅ User authenticated successfully:', dbUser.custom_handle || dbUser.handle || dbUser.id);
        console.log('🔍 User ID from server:', dbUser.id, 'Type:', typeof dbUser.id);
        
        // Validate that we got a UUID
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(dbUser.id)) {
          console.error('❌ Server returned non-UUID user ID:', dbUser.id);
          setIsLoading(false);
          return { success: false, error: 'Invalid user ID' };
        }
        
        // Use real user data from database
        const user = {
          id: dbUser.id,
          email: dbUser.email || username,
          name: dbUser.display_name || dbUser.custom_handle || dbUser.handle || username,
          firstName: dbUser.first_name,
          lastName: dbUser.last_name,
          customHandle: dbUser.custom_handle,
          handle: dbUser.handle,
          profileImageUrl: dbUser.profile_image_url,
          avatarUrl: dbUser.profile_image_url,
          bannerImageUrl: dbUser.banner_image_url,
          bio: dbUser.bio,
          crystalBalance: dbUser.crystal_balance || 0
        };
        
        await storage.setItem('user', JSON.stringify(user));
        // Clear sign out flag when user successfully signs in
        await storage.removeItem('userSignedOut');
        setUser(user);
        setIsLoading(false);
        console.log('✅ Signed in as user:', user.customHandle || user.handle || user.id);
        return { success: true };
      }
      
      console.log('❌ No users found in database');
      setIsLoading(false);
      return { success: false, error: 'User not found' };
    } catch (error) {
      console.error('Sign in error:', error);
      
      // Handle email confirmation error specifically
      if (error.message === 'EMAIL_NOT_CONFIRMED') {
        console.log('📧 Email confirmation required');
        setIsLoading(false);
        return { success: false, error: 'EMAIL_NOT_CONFIRMED' };
      }
      
      setIsLoading(false);
      return { success: false, error: 'Authentication failed' };
    }
  };

  const signOut = async () => {
    try {
      console.log('🚪 Signing out user...');
      console.log('🔍 Current user before signOut:', user?.customHandle || user?.handle || user?.id);
      await storage.removeItem('user');
      // Set flag to indicate user explicitly signed out
      await storage.setItem('userSignedOut', 'true');
      console.log('🔒 Set userSignedOut flag');
      setUser(null);
      setIsLoading(false);
      console.log('✅ User signed out successfully - state cleared');
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  const updateUser = async (updates: Partial<User>) => {
    if (!user) return;
    
    try {
      const updatedUser = { ...user, ...updates };
      await storage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      console.log('✅ User updated successfully:', updates);
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  };

  const refreshCrystalBalance = async () => {
    if (!user?.id) return;
    
    try {
      const { getUserCrystalBalance } = await import('../lib/database/mobile-db-supabase');
      const crystalBalance = await getUserCrystalBalance(user.id);
      
      if (user.crystalBalance !== crystalBalance) {
        await updateUser({ crystalBalance });
        console.log('💎 Refreshed crystal balance:', crystalBalance);
      }
    } catch (error) {
      console.error('Error refreshing crystal balance:', error);
    }
  };

  // Check if current user is valid in database and switch to @chirp if not
  useEffect(() => {
    const validateUser = async () => {
      if (user && !isLoading) {
        console.log('🔍 Validating current user:', user.id);
        // Authentication validation complete - no forced loops
        console.log('✅ User validation complete - ID:', user.id);
      }
    };
    
    validateUser();
  }, [user?.id]); // Only depend on user.id to prevent infinite loops

  const clearSession = async () => {
    try {
      console.log('🧹 Clearing all stored session data...');
      await storage.removeItem('user');
      await storage.removeItem('userSignedOut');
      setUser(null);
      setIsLoading(false);
      console.log('✅ Session data cleared successfully');
    } catch (error) {
      console.error('Error clearing session:', error);
      throw error;
    }
  };

  const value = {
    user,
    isLoading,
    signIn,
    signOut,
    updateUser,
    refreshCrystalBalance,
    isAuthenticated: !!user,
    clearSession
  };

  console.log('AuthProvider render:', { 
    userExists: !!user, 
    userId: user?.id, 
    isLoading, 
    isAuthenticated: !!user 
  });

  return (
    <AuthContext.Provider value={value}>
      <ProfileProvider>
        {children}
      </ProfileProvider>
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  
  // Debug logging removed to reduce log spam
  
  if (context === undefined) {
    console.error('useAuth must be used within an AuthProvider');
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}