import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Share } from 'react-native';
import UserAvatar from './UserAvatar';

interface ChirpCardProps {
  chirp: {
    id: number;
    content: string;
    createdAt: string;
    isAiGenerated?: boolean;
    isWeeklySummary?: boolean;
    threadId?: number;
    threadOrder?: number;
    isThreadStarter?: boolean;
    author: {
      id: string;
      firstName?: string;
      lastName?: string;
      email: string;
      handle?: string;
      customHandle?: string;
      profileImageUrl?: string;
      isChirpPlus?: boolean;
      showChirpPlusBadge?: boolean;
    };
    reactionCounts: Record<string, number>;
    userReaction?: string;
    replies?: Array<any>;
    repostOf?: any;
    parentChirp?: any;
  };
  onNavigateToProfile?: (userId: string) => void;
  onNavigateToChirp?: (chirpId: number) => void;
}

export default function ChirpCard({ chirp, onNavigateToProfile, onNavigateToChirp }: ChirpCardProps) {
  const [reactionCounts, setReactionCounts] = useState(chirp.reactionCounts || {});
  const [userReaction, setUserReaction] = useState(chirp.userReaction);
  const [isReplyMode, setIsReplyMode] = useState(false);
  const [replyContent, setReplyContent] = useState('');

  const formatDistanceToNow = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 30) return `${diffDays}d`;
    return date.toLocaleDateString();
  };

  const getDisplayName = (author: any) => {
    if (author.customHandle) return author.customHandle;
    if (author.handle) return author.handle;
    if (author.firstName && author.lastName) return `${author.firstName} ${author.lastName}`;
    return author.email.split('@')[0];
  };

  const handleReaction = (emoji: string) => {
    const isCurrentReaction = userReaction === emoji;
    const newCounts = { ...reactionCounts };
    
    if (isCurrentReaction) {
      // Remove reaction
      newCounts[emoji] = Math.max(0, (newCounts[emoji] || 0) - 1);
      if (newCounts[emoji] === 0) delete newCounts[emoji];
      setUserReaction(undefined);
    } else {
      // Add reaction
      if (userReaction) {
        // Remove old reaction
        newCounts[userReaction] = Math.max(0, (newCounts[userReaction] || 0) - 1);
        if (newCounts[userReaction] === 0) delete newCounts[userReaction];
      }
      newCounts[emoji] = (newCounts[emoji] || 0) + 1;
      setUserReaction(emoji);
    }
    
    setReactionCounts(newCounts);
  };

  const handleShare = async () => {
    try {
      const result = await Share.share({
        message: `Check out this chirp: "${chirp.content}" - @${getDisplayName(chirp.author)}`,
        title: 'Share Chirp',
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share chirp');
    }
  };

  const handleRepost = () => {
    Alert.alert('Repost', 'Repost functionality would be implemented here');
  };

  const topReactions = Object.entries(reactionCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3);

  const totalReactions = Object.values(reactionCounts).reduce((sum, count) => sum + count, 0);

  return (
    <View style={[
      styles.chirpCard,
      chirp.isWeeklySummary && styles.weeklySummaryCard
    ]}>
      {/* Parent chirp preview */}
      {chirp.parentChirp && (
        <TouchableOpacity 
          style={styles.parentChirp}
          onPress={() => onNavigateToChirp?.(chirp.parentChirp.id)}
        >
          <View style={styles.parentHeader}>
            <UserAvatar user={chirp.parentChirp.author} size="sm" />
            <Text style={styles.parentAuthor}>@{getDisplayName(chirp.parentChirp.author)}</Text>
          </View>
          <Text style={styles.parentContent} numberOfLines={2}>
            {chirp.parentChirp.content}
          </Text>
        </TouchableOpacity>
      )}

      {/* Main chirp header */}
      <View style={styles.chirpHeader}>
        <TouchableOpacity onPress={() => onNavigateToProfile?.(chirp.author.id)}>
          <UserAvatar user={chirp.author} size="md" />
        </TouchableOpacity>
        
        <View style={styles.chirpMeta}>
          <View style={styles.nameRow}>
            <TouchableOpacity onPress={() => onNavigateToProfile?.(chirp.author.id)}>
              <Text style={styles.displayName}>{getDisplayName(chirp.author)}</Text>
            </TouchableOpacity>
            {chirp.author.isChirpPlus && chirp.author.showChirpPlusBadge && (
              <View style={styles.chirpPlusBadge}>
                <Text style={styles.chirpPlusBadgeText}>+</Text>
              </View>
            )}
            <Text style={styles.timestamp}>• {formatDistanceToNow(chirp.createdAt)}</Text>
          </View>
          
          {chirp.isWeeklySummary && (
            <View style={styles.summaryBadge}>
              <Text style={styles.summaryBadgeText}>✨ Weekly Summary</Text>
            </View>
          )}
          
          {chirp.isAiGenerated && !chirp.isWeeklySummary && (
            <View style={styles.aiBadge}>
              <Text style={styles.aiBadgeText}>🤖 AI Generated</Text>
            </View>
          )}
        </View>
      </View>

      {/* Chirp content */}
      <TouchableOpacity onPress={() => onNavigateToChirp?.(chirp.id)}>
        <Text style={styles.chirpContent}>{chirp.content}</Text>
      </TouchableOpacity>

      {/* Repost content */}
      {chirp.repostOf && (
        <View style={styles.repostContainer}>
          <View style={styles.repostHeader}>
            <UserAvatar user={chirp.repostOf.author} size="sm" />
            <Text style={styles.repostAuthor}>@{getDisplayName(chirp.repostOf.author)}</Text>
            <Text style={styles.repostTimestamp}>• {formatDistanceToNow(chirp.repostOf.createdAt)}</Text>
          </View>
          <Text style={styles.repostContent}>{chirp.repostOf.content}</Text>
        </View>
      )}

      {/* Reactions display */}
      {totalReactions > 0 && (
        <View style={styles.reactionSummary}>
          {topReactions.map(([emoji, count]) => (
            <TouchableOpacity 
              key={emoji}
              style={[
                styles.reactionItem,
                userReaction === emoji && styles.userReactionItem
              ]}
              onPress={() => handleReaction(emoji)}
            >
              <Text style={styles.reactionEmoji}>{emoji}</Text>
              <Text style={styles.reactionCount}>{count}</Text>
            </TouchableOpacity>
          ))}
          {Object.keys(reactionCounts).length > 3 && (
            <Text style={styles.moreReactions}>+{Object.keys(reactionCounts).length - 3} more</Text>
          )}
        </View>
      )}

      {/* Action buttons */}
      <View style={styles.actionRow}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => setIsReplyMode(!isReplyMode)}
        >
          <Text style={styles.actionIcon}>💬</Text>
          <Text style={styles.actionText}>{chirp.replies?.length || 0}</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton}
          onPress={handleRepost}
        >
          <Text style={styles.actionIcon}>🔄</Text>
          <Text style={styles.actionText}>Repost</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleReaction('❤️')}
        >
          <Text style={[
            styles.actionIcon,
            userReaction === '❤️' && styles.activeReaction
          ]}>❤️</Text>
          <Text style={styles.actionText}>{reactionCounts['❤️'] || 0}</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton}
          onPress={handleShare}
        >
          <Text style={styles.actionIcon}>📤</Text>
          <Text style={styles.actionText}>Share</Text>
        </TouchableOpacity>
      </View>

      {/* Quick reaction bar */}
      <View style={styles.quickReactions}>
        {['❤️', '😂', '😮', '😢', '😡', '👍', '👎', '🔥'].map((emoji) => (
          <TouchableOpacity
            key={emoji}
            style={[
              styles.quickReactionButton,
              userReaction === emoji && styles.activeQuickReaction
            ]}
            onPress={() => handleReaction(emoji)}
          >
            <Text style={styles.quickReactionEmoji}>{emoji}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  chirpCard: {
    backgroundColor: '#ffffff',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e8ed',
  },
  weeklySummaryCard: {
    backgroundColor: '#faf5ff',
    borderLeftWidth: 4,
    borderLeftColor: '#7c3aed',
  },
  parentChirp: {
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 2,
    borderLeftColor: '#e2e8f0',
  },
  parentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  parentAuthor: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
    marginLeft: 8,
  },
  parentContent: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
  },
  chirpHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  chirpMeta: {
    flex: 1,
    marginLeft: 12,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  displayName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  chirpPlusBadge: {
    backgroundColor: '#7c3aed',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 6,
    minWidth: 20,
    alignItems: 'center',
  },
  chirpPlusBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  timestamp: {
    fontSize: 15,
    color: '#657786',
    marginLeft: 6,
  },
  summaryBadge: {
    backgroundColor: '#7c3aed',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  summaryBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  aiBadge: {
    backgroundColor: '#10b981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  aiBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  chirpContent: {
    fontSize: 16,
    lineHeight: 24,
    color: '#1a1a1a',
    marginBottom: 16,
  },
  repostContainer: {
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  repostHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  repostAuthor: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
    marginLeft: 8,
  },
  repostTimestamp: {
    fontSize: 14,
    color: '#64748b',
    marginLeft: 4,
  },
  repostContent: {
    fontSize: 15,
    color: '#1a1a1a',
    lineHeight: 22,
  },
  reactionSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  reactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  userReactionItem: {
    backgroundColor: '#e0e7ff',
    borderWidth: 1,
    borderColor: '#7c3aed',
  },
  reactionEmoji: {
    fontSize: 16,
    marginRight: 4,
  },
  reactionCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
  moreReactions: {
    fontSize: 14,
    color: '#64748b',
    fontStyle: 'italic',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    flex: 1,
    justifyContent: 'center',
  },
  actionIcon: {
    fontSize: 18,
    marginRight: 4,
  },
  activeReaction: {
    transform: [{ scale: 1.2 }],
  },
  actionText: {
    fontSize: 14,
    color: '#657786',
    fontWeight: '500',
  },
  quickReactions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  quickReactionButton: {
    padding: 8,
    borderRadius: 8,
  },
  activeQuickReaction: {
    backgroundColor: '#e0e7ff',
    transform: [{ scale: 1.1 }],
  },
  quickReactionEmoji: {
    fontSize: 20,
  },
});