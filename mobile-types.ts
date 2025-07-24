// Mobile-specific type definitions for React Native/Expo compatibility

export interface MobileChirp {
  id: string;
  content: string;
  createdAt: string;
  replyToId?: string | null;
  author: {
    id: string;
    firstName: string;
    email: string;
    customHandle: string;
    handle: string;
    profileImageUrl?: string | null;
  };
  replyCount: number;
  reactionCount: number;
  repostCount?: number;
  reactions: MobileReaction[];
  isWeeklySummary?: boolean;
  nestedReplies?: MobileChirp[];
  isDirectReply?: boolean;
  isNestedReply?: boolean;
  // Repost-related fields
  isRepost?: boolean;
  repostOfId?: string | null;
  originalChirp?: {
    id: string;
    content: string;
    createdAt: string;
    author: {
      id: string;
      firstName: string;
      customHandle: string;
      handle: string;
      profileImageUrl?: string | null;
    };
    isWeeklySummary?: boolean;
  };
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