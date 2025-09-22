import React, { createContext, useContext, useEffect, useState } from 'react';

// Web-compatible storage
const storage = {
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

// User interface with ChirpPlus properties
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
  linkInBio?: string; // Added for Profile page compatibility
  joinedAt?: string; // Added for Profile page compatibility
  crystalBalance?: number;
  isChirpPlus?: boolean;
  showChirpPlusBadge?: boolean;
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
  forceRefreshAuth: () => Promise<void>;
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
        
        // Check if user ID is a valid UUID, if not, clear cache and require fresh login
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(user.id)) {
          console.log('⚠️ Invalid user ID format detected, clearing cache and requiring fresh login');
          await storage.removeItem('user');
          setUser(null);
          setIsLoading(false);
          return;
        }
        
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
      
      // Authenticate user with username and password using API
      console.log('🔐 Using API authentication for username:', username);
      const response = await fetch('http://localhost:5002/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.log('❌ Authentication failed:', errorData.error);
        setIsLoading(false);
        return { success: false, error: errorData.error || 'Authentication failed' };
      }

      const dbUser = await response.json();
      
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
          linkInBio: dbUser.link_in_bio, // Map from database
          joinedAt: dbUser.created_at, // Map from database
          crystalBalance: dbUser.crystal_balance || 0,
          isChirpPlus: dbUser.is_chirp_plus || false,
          showChirpPlusBadge: dbUser.show_chirp_plus_badge || false
        };
        
        console.log('🔍 User profile image data:', {
          profileImageUrl: user.profileImageUrl,
          avatarUrl: user.avatarUrl,
          hasProfileImage: !!(user.profileImageUrl || user.avatarUrl)
        });
        
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
      await storage.removeItem('user');
      await storage.setItem('userSignedOut', 'true');
      setUser(null);
      setIsLoading(false);
      console.log('✅ User signed out successfully');
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
      // Mock crystal balance refresh for web
      const newBalance = Math.floor(Math.random() * 1000) + 100;
      await updateUser({ crystalBalance: newBalance });
      console.log('💎 Refreshed crystal balance:', newBalance);
    } catch (error) {
      console.error('Error refreshing crystal balance:', error);
    }
  };

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

  const forceRefreshAuth = async () => {
    try {
      console.log('🔄 Forcing authentication refresh...');
      await clearSession();
      await checkAuthState();
    } catch (error) {
      console.error('Error refreshing auth:', error);
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
    clearSession,
    forceRefreshAuth
  };

  console.log('AuthProvider render:', { 
    userExists: !!user, 
    userId: user?.id, 
    isLoading, 
    isAuthenticated: !!user 
  });

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    console.error('useAuth must be used within an AuthProvider');
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}
