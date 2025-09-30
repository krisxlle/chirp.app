import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface LikeState {
  [chirpId: string]: {
    likesCount: number;
    userHasLiked: boolean;
  };
}

interface LikeContextType {
  likeState: LikeState;
  updateLike: (chirpId: string, likesCount: number, userHasLiked: boolean) => void;
  getLikeState: (chirpId: string) => { likesCount: number; userHasLiked: boolean } | null;
}

const LikeContext = createContext<LikeContextType | undefined>(undefined);

interface LikeProviderProps {
  children: ReactNode;
}

export function LikeProvider({ children }: LikeProviderProps) {
  const [likeState, setLikeState] = useState<LikeState>({});

  const updateLike = useCallback((chirpId: string, likesCount: number, userHasLiked: boolean) => {
    console.log('🔄 Global like state updated:', { chirpId, likesCount, userHasLiked });
    setLikeState(prev => ({
      ...prev,
      [chirpId]: {
        likesCount,
        userHasLiked
      }
    }));
  }, []);

  const getLikeState = useCallback((chirpId: string) => {
    return likeState[chirpId] || null;
  }, [likeState]);

  const value = {
    likeState,
    updateLike,
    getLikeState
  };

  return (
    <LikeContext.Provider value={value}>
      {children}
    </LikeContext.Provider>
  );
}

export function useLike() {
  const context = useContext(LikeContext);
  if (context === undefined) {
    throw new Error('useLike must be used within a LikeProvider');
  }
  return context;
}
