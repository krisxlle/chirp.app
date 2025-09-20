import { useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  customHandle?: string;
  profileImageUrl?: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate checking for existing session
    const checkAuth = async () => {
      try {
        // Try to get user from localStorage or API
        const savedUser = localStorage.getItem('chirp-user');
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }
      } catch (error) {
        console.log('No existing session');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      // For now, create a mock user for testing
      const mockUser: User = {
        id: '1',
        email: email,
        firstName: 'Test',
        lastName: 'User',
        customHandle: 'testuser',
        profileImageUrl: undefined
      };
      
      setUser(mockUser);
      localStorage.setItem('chirp-user', JSON.stringify(mockUser));
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Sign in failed' };
    }
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem('chirp-user');
  };

  const signUp = async (email: string, password: string, firstName: string) => {
    try {
      // For now, create a mock user for testing
      const mockUser: User = {
        id: '1',
        email: email,
        firstName: firstName,
        lastName: '',
        customHandle: firstName.toLowerCase(),
        profileImageUrl: undefined
      };
      
      setUser(mockUser);
      localStorage.setItem('chirp-user', JSON.stringify(mockUser));
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Sign up failed' };
    }
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    signIn,
    signOut,
    signUp
  };
}