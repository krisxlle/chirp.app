// Mobile-specific type definitions for React Native/Expo compatibility

export interface MobileChirp {
  id: string;
  content: string;
  username: string;
  createdAt: string;
  reactions: MobileReaction[];
  isWeeklySummary?: boolean;
}

export interface MobileReaction {
  emoji: string;
  count: number;
}

export interface MobileUser {
  id: string;
  username: string;
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
  bannerUrl?: string;
  linkInBio?: string;
}