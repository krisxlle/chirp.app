import { Session, User } from '@supabase/supabase-js';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface TransformedUser {
  id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  customHandle?: string;
  handle?: string;
  name?: string;
  profileImageUrl?: string;
  bio?: string;
  crystalBalance?: number;
  createdAt?: string;
}

interface SupabaseAuthContextType {
  user: TransformedUser | null;
  session: Session | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, name: string, customHandle?: string) => Promise<{ success: boolean; error?: string; message?: string }>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
  isEmailVerified: boolean;
  resendVerificationEmail: () => Promise<{ success: boolean; error?: string }>;
}

const SupabaseAuthContext = createContext<SupabaseAuthContextType | undefined>(undefined);

// Transform Supabase User to expected format
const transformSupabaseUser = (supabaseUser: User | null): TransformedUser | null => {
  if (!supabaseUser) return null;
  
  const metadata = supabaseUser.user_metadata || {};
  const email = supabaseUser.email || '';
  
  return {
    id: supabaseUser.id,
    firstName: metadata.first_name || metadata.name?.split(' ')[0] || '',
    lastName: metadata.last_name || metadata.name?.split(' ').slice(1).join(' ') || '',
    email,
    customHandle: metadata.custom_handle || '',
    handle: metadata.handle || '',
    name: metadata.name || `${metadata.first_name || ''} ${metadata.last_name || ''}`.trim(),
    profileImageUrl: metadata.profile_image_url || metadata.avatar_url || '',
    bio: metadata.bio || '',
    crystalBalance: metadata.crystal_balance || 100,
    createdAt: supabaseUser.created_at
  };
};

export function SupabaseAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<TransformedUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEmailVerified, setIsEmailVerified] = useState(false);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(transformSupabaseUser(session?.user ?? null));
      setIsEmailVerified(!!session?.user?.email_confirmed_at);
      setIsLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(transformSupabaseUser(session?.user ?? null));
      setIsEmailVerified(!!session?.user?.email_confirmed_at);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      console.log('🔐 Attempting Supabase sign in for:', email);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('❌ Supabase sign in error:', error.message);
        return { success: false, error: error.message };
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
          // Don't fail sign in if profile doesn't exist yet
        } else {
          console.log('✅ User profile fetched successfully');
          
          // Update the user's metadata with profile data
          const { error: updateError } = await supabase.auth.updateUser({
            data: {
              first_name: userProfile.first_name || userProfile.display_name?.split(' ')[0],
              last_name: userProfile.last_name || userProfile.display_name?.split(' ').slice(1).join(' '),
              custom_handle: userProfile.custom_handle,
              handle: userProfile.handle,
              profile_image_url: userProfile.profile_image_url,
              bio: userProfile.bio,
              crystal_balance: userProfile.crystal_balance
            }
          });
          
          if (updateError) {
            console.error('❌ Error updating user metadata:', updateError);
          } else {
            console.log('✅ User metadata updated with profile data');
          }
        }

        return { success: true };
      }

      return { success: false, error: 'No user data returned' };
    } catch (error) {
      console.error('❌ Error in sign in:', error);
      return { success: false, error: 'An unexpected error occurred' };
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (
    email: string, 
    password: string, 
    name: string, 
    customHandle?: string
  ): Promise<{ success: boolean; error?: string; message?: string }> => {
    try {
      setIsLoading(true);
      console.log('📝 Creating user account with Supabase auth');

      // Validate handle availability if custom handle is provided
      if (customHandle) {
        const { data: existingUser } = await supabase
          .from('users')
          .select('id')
          .eq('custom_handle', customHandle)
          .single();

        if (existingUser) {
          return { success: false, error: `Handle "${customHandle}" is already taken. Please choose a different handle.` };
        }
      }

      // Sign up with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            custom_handle: customHandle,
          },
        },
      });

      if (error) {
        console.error('❌ Supabase sign up error:', error.message);
        return { success: false, error: error.message };
      }

      if (data.user) {
        console.log('✅ User created successfully:', data.user.id);
        
        // Check if email confirmation is required
        if (!data.user.email_confirmed_at) {
          console.log('📧 Email confirmation required for:', data.user.email);
          return { 
            success: true, 
            error: 'EMAIL_CONFIRMATION_REQUIRED',
            message: 'Please check your email and click the confirmation link to complete your registration.'
          };
        }
        
        // Create user profile in users table
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            email: email,
            first_name: name.split(' ')[0] || name,
            last_name: name.split(' ').slice(1).join(' ') || '',
            custom_handle: customHandle,
            handle: customHandle || `user_${data.user.id.substring(0, 8)}`,
            display_name: name,
            bio: '',
            profile_image_url: null,
            banner_image_url: null,
            crystal_balance: 100,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (profileError) {
          console.error('❌ Error creating user profile:', profileError);
          return { success: false, error: 'Account created but profile setup failed' };
        }

        console.log('✅ User profile created successfully');
        return { success: true };
      }

      return { success: false, error: 'No user data returned' };
    } catch (error) {
      console.error('❌ Error in sign up:', error);
      return { success: false, error: 'An unexpected error occurred' };
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('❌ Error signing out:', error);
        throw error;
      }
      console.log('✅ User signed out successfully');
    } catch (error) {
      console.error('❌ Error in sign out:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const resendVerificationEmail = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!user?.email) {
        return { success: false, error: 'No user email found' };
      }

      console.log('📧 Resending verification email to:', user.email);
      
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email,
      });

      if (error) {
        console.error('❌ Resend verification error:', error.message);
        return { success: false, error: error.message };
      }

      console.log('✅ Verification email sent successfully');
      return { success: true };
    } catch (error) {
      console.error('❌ Error resending verification email:', error);
      return { success: false, error: 'Failed to resend verification email' };
    }
  };

  const value: SupabaseAuthContextType = {
    user,
    session,
    isLoading,
    signIn,
    signUp,
    signOut,
    isAuthenticated: !!user,
    isEmailVerified,
    resendVerificationEmail,
  };

  return (
    <SupabaseAuthContext.Provider value={value}>
      {children}
    </SupabaseAuthContext.Provider>
  );
}

export function useSupabaseAuth() {
  const context = useContext(SupabaseAuthContext);
  if (context === undefined) {
    throw new Error('useSupabaseAuth must be used within a SupabaseAuthProvider');
  }
  return context;
}
