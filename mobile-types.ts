// Mobile-specific type definitions for React Native/Expo compatibility

export interface MobileChirp {
  id: string;
  content: string;
  createdAt: string;
  replyToId?: string | null;
  author: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    customHandle: string;
    handle: string;
    profileImageUrl?: string | null;
  };
  replyCount: number;
  reactionCount: number;
  reactions: MobileReaction[];
  isWeeklySummary?: boolean;
  nestedReplies?: MobileChirp[];
  isDirectReply?: boolean;
  isNestedReply?: boolean;
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