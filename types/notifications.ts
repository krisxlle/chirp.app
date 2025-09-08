// types/notifications.ts
export interface Notification {
  id: string;
  user_id: string; // User who receives the notification
  from_user_id?: string; // User who performed the action
  type: 'like' | 'comment' | 'follow' | 'mention';
  chirp_id?: string; // For likes and comments
  read: boolean;
  created_at: string;
  
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
  user_id: string;
  likes_enabled: boolean;
  comments_enabled: boolean;
  follows_enabled: boolean;
  mentions_enabled: boolean;
  push_enabled: boolean;
  email_enabled: boolean;
}

export interface NotificationCounts {
  total: number;
  unread: number;
  likes: number;
  comments: number;
  follows: number;
  mentions: number;
}
