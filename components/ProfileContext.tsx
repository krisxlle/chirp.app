import React, { createContext, useContext, useState, useCallback } from 'react';

interface ProfileContextType {
  viewingUserId: string | null;
  setViewingUserId: (userId: string | null) => void;
  navigateToProfile: (userId: string) => void;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [viewingUserId, setViewingUserId] = useState<string | null>(null);

  const navigateToProfile = useCallback((userId: string) => {
    console.log('🔥 ProfileContext: Setting viewing user ID to:', userId);
    setViewingUserId(userId);
  }, []);

  return (
    <ProfileContext.Provider value={{
      viewingUserId,
      setViewingUserId,
      navigateToProfile
    }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
}