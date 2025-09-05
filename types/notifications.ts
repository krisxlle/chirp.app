// types/notifications.ts
export interface Notification {
  id: string;
  userId: string; // User who receives the notification
  actorId: string; // User who performed the action
  type: 'like' | 'comment' | 'follow' | 'mention';
  chirpId?: string; // For likes and comments
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
  
  // Populated data
  actor?: {
    id: string;
    firstName?: string;
    customHandle?: string;
    handle?: string;
    profileImageUrl?: string;
    avatarUrl?: string;
  };
  chirp?: {
    id: string;
    content: string;
    authorId: string;
  };
}

export interface NotificationAction {
  type: 'like' | 'comment' | 'follow' | 'mention';
  actorId: string;
  targetUserId: string;
  chirpId?: string;
  commentId?: string;
}

export interface NotificationSettings {
  userId: string;
  likesEnabled: boolean;
  commentsEnabled: boolean;
  followsEnabled: boolean;
  mentionsEnabled: boolean;
  pushEnabled: boolean;
  emailEnabled: boolean;
}

export interface NotificationCounts {
  total: number;
  unread: number;
  likes: number;
  comments: number;
  follows: number;
  mentions: number;
}
