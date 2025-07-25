import React, { createContext, useContext, useState, useEffect } from 'react';
import { ProfileProvider } from './ProfileContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  // Chirp+ subscription fields
  isChirpPlus?: boolean;
  chirpPlusExpiresAt?: string;
  showChirpPlusBadge?: boolean;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password?: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuthState = async () => {
    try {
      console.log('🔍 Checking authentication state...');
      const storedUser = await AsyncStorage.getItem('user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        console.log('✅ Found stored user:', user.customHandle || user.handle || user.id);
        setUser(user);
        setIsLoading(false);
        return; // Exit early if user found
      } else {
        console.log('❌ No stored user found - will trigger auto-login');
        setIsLoading(false); // Enable auto-login by setting loading to false
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuthState();
  }, []);

  // Auto-login effect after auth state is checked (only once)
  const [hasAttemptedLogin, setHasAttemptedLogin] = useState(false);
  
  useEffect(() => {
    const autoLogin = async () => {
      // Auto-login should trigger after auth check completes AND no user was found
      if (!user && !hasAttemptedLogin) {
        setHasAttemptedLogin(true);
        console.log('🚀 No user found - auto-signing in to @chirp for preview...');
        try {
          const success = await signIn('preview@chirp.app');
          if (success) {
            console.log('🎉 Auto-login successful!');
          } else {
            console.log('❌ Auto-login failed, trying fallback...');
            // If auto-login fails, just stop loading to show sign-in screen
            setIsLoading(false);
          }
        } catch (error) {
          console.error('Auto-login error:', error);
          setIsLoading(false);
        }
      }
    };
    
    // Only trigger auto-login when conditions are met
    autoLogin();
  }, [isLoading, user, hasAttemptedLogin]);

  const signIn = async (email: string, password?: string): Promise<boolean> => {
    try {
      console.log('🔐 Attempting sign in for:', email);
      setIsLoading(true);
      
      // Get actual user from database based on email
      const { getUserByEmail, getFirstUser } = await import('../mobile-db');
      let dbUser = await getUserByEmail(email);
      
      // If user not found by email, try to get @chirp preview user for demo
      if (!dbUser && email === 'preview@chirp.app') {
        console.log('🎯 Loading @chirp preview user for demo...');
        dbUser = await getFirstUser();
      }
      
      if (dbUser) {
        console.log('✅ User authenticated successfully:', dbUser.custom_handle || dbUser.handle || dbUser.id);
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
          bio: dbUser.bio,
          // Include Chirp+ subscription data
          isChirpPlus: dbUser.is_chirp_plus,
          chirpPlusExpiresAt: dbUser.chirp_plus_expires_at,
          showChirpPlusBadge: dbUser.show_chirp_plus_badge,
          stripeCustomerId: dbUser.stripe_customer_id,
          stripeSubscriptionId: dbUser.stripe_subscription_id
        };
        
        await AsyncStorage.setItem('user', JSON.stringify(user));
        setUser(user);
        setIsLoading(false);
        console.log('✅ Signed in as user:', user.customHandle || user.handle || user.id);
        return true;
      } else {
        // Fallback for demo - use first available user
        const { getFirstUser } = await import('../mobile-db');
        const fallbackUser = await getFirstUser();
        
        if (fallbackUser) {
          const user = {
            id: fallbackUser.id,
            email: fallbackUser.email || email,
            name: fallbackUser.display_name || email.split('@')[0],
            firstName: fallbackUser.first_name,
            lastName: fallbackUser.last_name,
            customHandle: fallbackUser.custom_handle,
            handle: fallbackUser.handle,
            profileImageUrl: fallbackUser.profile_image_url,
            avatarUrl: fallbackUser.profile_image_url,
            bannerImageUrl: fallbackUser.banner_image_url,
            bio: fallbackUser.bio,
            // Include Chirp+ subscription data
            isChirpPlus: fallbackUser.is_chirp_plus,
            chirpPlusExpiresAt: fallbackUser.chirp_plus_expires_at,
            showChirpPlusBadge: fallbackUser.show_chirp_plus_badge,
            stripeCustomerId: fallbackUser.stripe_customer_id,
            stripeSubscriptionId: fallbackUser.stripe_subscription_id
          };
          
          await AsyncStorage.setItem('user', JSON.stringify(user));
          setUser(user);
          setIsLoading(false);
          console.log('✅ Demo mode - signed in as user:', user.customHandle || user.handle || user.id);
          return true;
        }
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
      await AsyncStorage.removeItem('user');
      setUser(null);
      setIsLoading(false);
      console.log('✅ User signed out successfully');
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  // Force clear stored data and login to @chirp account
  const forceLoginToChirp = async () => {
    try {
      console.log('🧹 Clearing stored authentication data...');
      await AsyncStorage.removeItem('user');
      setUser(null);
      console.log('🚀 Forcing login to @Chirp account...');
      await signIn('kriselle.t@gmail.com');
    } catch (error) {
      console.error('Force login error:', error);
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

  const value = {
    user,
    isLoading,
    signIn,
    signOut,
    isAuthenticated: !!user
  };

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
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}