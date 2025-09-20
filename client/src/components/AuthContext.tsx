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

  const signIn = async (username: string, password?: string): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log('🔐 Attempting sign in for:', username);
      setIsLoading(true);
      
      // For web build, create a mock user for now
      // In production, this would connect to your Supabase backend
      const mockUser: User = {
        id: '1',
        email: username,
        name: username,
        firstName: username,
        lastName: '',
        customHandle: username.toLowerCase(),
        profileImageUrl: undefined,
        crystalBalance: 100
      };
      
      await storage.setItem('user', JSON.stringify(mockUser));
      await storage.removeItem('userSignedOut');
      setUser(mockUser);
      setIsLoading(false);
      console.log('✅ Signed in as user:', mockUser.customHandle || mockUser.handle || mockUser.id);
      return { success: true };
    } catch (error) {
      console.error('Sign in error:', error);
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
