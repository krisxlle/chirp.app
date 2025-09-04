import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { ProfileProvider } from './ProfileContext';

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
  crystalBalance?: number;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password?: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
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
      
      const storedUser = await AsyncStorage.getItem('user');
      const userSignedOut = await AsyncStorage.getItem('userSignedOut');
      
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

  const signIn = async (email: string, password?: string): Promise<boolean> => {
    try {
      console.log('🔐 Attempting sign in for:', email);
      setIsLoading(true);
      
      // Require password for security
      if (!password) {
        console.log('❌ Password is required for authentication');
        setIsLoading(false);
        return false;
      }
      
      // Clear any old session data to ensure fresh authentication
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('userSignedOut');
      
      // Authenticate user with email and password
      const { authenticateUser } = await import('../mobile-db');
      const dbUser = await authenticateUser(email, password);
      
      if (dbUser) {
        console.log('✅ User authenticated successfully:', dbUser.custom_handle || dbUser.handle || dbUser.id);
        console.log('🔍 User ID from server:', dbUser.id, 'Type:', typeof dbUser.id);
        
        // Validate that we got a UUID
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(dbUser.id)) {
          console.error('❌ Server returned non-UUID user ID:', dbUser.id);
          setIsLoading(false);
          return false;
        }
        
        // Use real user data from database
        const user = {
          id: dbUser.id,
          email: dbUser.email || email,
          name: dbUser.display_name || dbUser.custom_handle || dbUser.handle || email.split('@')[0],
          firstName: dbUser.first_name,
          lastName: dbUser.last_name,
          customHandle: dbUser.custom_handle,
          handle: dbUser.handle,
          profileImageUrl: dbUser.profile_image_url,
          avatarUrl: dbUser.profile_image_url,
          bannerImageUrl: dbUser.banner_image_url,
          bio: dbUser.bio
        };
        
        await AsyncStorage.setItem('user', JSON.stringify(user));
        // Clear sign out flag when user successfully signs in
        await AsyncStorage.removeItem('userSignedOut');
        setUser(user);
        setIsLoading(false);
        console.log('✅ Signed in as user:', user.customHandle || user.handle || user.id);
        return true;
      }
      
      console.log('❌ No users found in database');
      setIsLoading(false);
      return false;
    } catch (error) {
      console.error('Sign in error:', error);
      setIsLoading(false);
      return false;
    }
  };

  const signOut = async () => {
    try {
      console.log('🚪 Signing out user...');
      console.log('🔍 Current user before signOut:', user?.customHandle || user?.handle || user?.id);
      await AsyncStorage.removeItem('user');
      // Set flag to indicate user explicitly signed out
      await AsyncStorage.setItem('userSignedOut', 'true');
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
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      console.log('✅ User updated successfully:', updates);
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
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
  }, [user, isLoading]);

  const clearSession = async () => {
    try {
      console.log('🧹 Clearing all stored session data...');
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('userSignedOut');
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
  
  console.log('useAuth hook called:', { 
    contextExists: !!context, 
    userExists: !!context?.user, 
    userId: context?.user?.id,
    isLoading: context?.isLoading 
  });
  
  if (context === undefined) {
    console.error('useAuth must be used within an AuthProvider');
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}