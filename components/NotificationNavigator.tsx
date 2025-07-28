import React, { createContext, useContext, useState, ReactNode } from 'react';

interface NotificationContextData {
  targetChirpId: string | null;
  setTargetChirpId: (chirpId: string | null) => void;
  highlightChirp: (chirpId: string) => void;
  clearHighlight: () => void;
}

const NotificationContext = createContext<NotificationContextData | undefined>(undefined);

interface NotificationNavigatorProps {
  children: ReactNode;
}

export function NotificationNavigator({ children }: NotificationNavigatorProps) {
  const [targetChirpId, setTargetChirpId] = useState<string | null>(null);

  const highlightChirp = (chirpId: string) => {
    setTargetChirpId(chirpId);
    // Auto-clear highlight after 3 seconds
    setTimeout(() => {
      setTargetChirpId(null);
    }, 3000);
  };

  const clearHighlight = () => {
    setTargetChirpId(null);
  };

  return (
    <NotificationContext.Provider
      value={{
        targetChirpId,
        setTargetChirpId,
        highlightChirp,
        clearHighlight,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotificationNavigator() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotificationNavigator must be used within a NotificationNavigator');
  }
  return context;
}