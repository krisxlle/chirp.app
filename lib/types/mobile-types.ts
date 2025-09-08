// Mobile-specific type definitions for React Native/Expo compatibility

export interface MobileChirp {
  id: string;
  content: string;
  createdAt: string;
  replyToId?: string | null;
  threadId?: string | null;
  threadOrder?: number;
  isThreadStarter?: boolean;
  author: {
    id: string;
    firstName: string;
    lastName?: string;
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
  isThreadedChirp?: boolean;
  userHasLiked?: boolean;
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
      lastName?: string;
      customHandle: string;
      handle: string;
      profileImageUrl?: string | null;
    };
    isWeeklySummary?: boolean;
  };
}

export interface MobileReaction {
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
  crystalBalance?: number;
}