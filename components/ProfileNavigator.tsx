import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ProfileNavigatorContextType {
  navigateToProfile: (userId: string) => void;
  currentProfileId?: string;
}

const ProfileNavigatorContext = createContext<ProfileNavigatorContextType | undefined>(undefined);

export const useProfileNavigator = () => {
  const context = useContext(ProfileNavigatorContext);
  if (!context) {
    throw new Error('useProfileNavigator must be used within a ProfileNavigatorProvider');
  }
  return context;
};

interface ProfileNavigatorProviderProps {
  children: ReactNode;
  onNavigateToProfile: (userId: string) => void;
}

export const ProfileNavigatorProvider: React.FC<ProfileNavigatorProviderProps> = ({
  children,
  onNavigateToProfile,
}) => {
  const [currentProfileId, setCurrentProfileId] = useState<string>();

  const navigateToProfile = (userId: string) => {
    setCurrentProfileId(userId);
    onNavigateToProfile(userId);
  };

  return (
    <ProfileNavigatorContext.Provider value={{ navigateToProfile, currentProfileId }}>
      {children}
    </ProfileNavigatorContext.Provider>
  );
};