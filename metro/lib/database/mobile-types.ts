// Mobile-specific type definitions
export interface MobileChirp {
  id: string;
  content: string;
  createdAt: string;
  replyToId?: string;
  isWeeklySummary?: boolean;
  reactionCount: number;
  replyCount: number;
  reactions: any[];
  replies?: any[];
  repostOfId?: string;
  originalChirp?: MobileChirp;
  imageUrl?: string;
  imageAltText?: string;
  imageWidth?: number;
  imageHeight?: number;
  author: MobileUser;
}

export interface MobileUser {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  customHandle?: string;
  handle?: string;
  profileImageUrl?: string;
  avatarUrl?: string;
  bannerImageUrl?: string;
  bio?: string;
  linkInBio?: string;
  joinedAt?: string;
  isChirpPlus?: boolean;
  showChirpPlusBadge?: boolean;
}
