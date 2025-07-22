import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import UserAvatar from './UserAvatar';

interface User {
  id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  customHandle?: string;
  handle?: string;
  profileImageUrl?: string;
  avatarUrl?: string;
}

interface Chirp {
  id: string;
  content: string;
  createdAt: string;
  author: User;
  replyCount: number;
  reactionCount: number;
  isWeeklySummary?: boolean;
}

interface ChirpCardProps {
  chirp: Chirp;
}

export default function ChirpCard({ chirp }: ChirpCardProps) {
  const [reactions, setReactions] = useState(chirp.reactionCount || 0);
  const [replies, setReplies] = useState(chirp.replyCount || 0);
  const [reposts, setReposts] = useState(0);

  const handleReply = () => {
    Alert.alert('Reply', 'Reply functionality coming soon!');
  };

  const handleRepost = () => {
    setReposts(prev => prev + 1);
  };

  const handleReaction = () => {
    setReactions(prev => prev + 1);
  };

  const handleShare = () => {
    Alert.alert('Share', 'Share functionality coming soon!');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays <= 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const displayName = chirp.author.customHandle || 
                     (chirp.author.firstName && chirp.author.lastName 
                       ? `${chirp.author.firstName} ${chirp.author.lastName}`
                       : chirp.author.email.split('@')[0]);

  return (
    <View style={[styles.container, chirp.isWeeklySummary && styles.weeklySummaryContainer]}>
      <View style={styles.header}>
        <UserAvatar user={chirp.author} size="md" />
        <View style={styles.headerContent}>
          <View style={styles.nameRow}>
            <Text style={styles.username}>{displayName}</Text>
            <Text style={styles.crownIcon}>👑</Text>
            <Text style={styles.timestamp}>{formatDate(chirp.createdAt)}</Text>
          </View>
          
          {chirp.isWeeklySummary && (
            <View style={styles.weeklySummaryRow}>
              <View style={styles.weeklySummaryBadge}>
                <Text style={styles.summaryBadgeText}>✨ Weekly Summary</Text>
              </View>
              <Text style={styles.summaryDate}>3 days ago</Text>
            </View>
          )}
        </View>
        
        <TouchableOpacity style={styles.moreButton}>
          <Text style={styles.moreText}>⋯</Text>
        </TouchableOpacity>
      </View>

      {chirp.isWeeklySummary && (
        <Text style={styles.weeklySummaryTitle}>
          📊 Weekly Summary (2025-07-13 - 2025-07-19)
        </Text>
      )}

      <Text style={styles.content}>{chirp.content}</Text>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton} onPress={handleReply}>
          <Text style={styles.actionIcon}>💬</Text>
          <Text style={styles.actionText}>Reply</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={handleRepost}>
          <Text style={styles.actionIcon}>🔁</Text>
          <Text style={styles.actionText}>Repost</Text>
        </TouchableOpacity>

        <View style={styles.reactionsContainer}>
          <TouchableOpacity style={styles.reactionButton} onPress={handleReaction}>
            <Text style={styles.reactionIcon}>🤔</Text>
            <Text style={styles.reactionCount}>0</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.reactionButton} onPress={handleReaction}>
            <Text style={styles.reactionIcon}>🤯</Text>
            <Text style={styles.reactionCount}>0</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.reactionButton} onPress={handleReaction}>
            <Text style={styles.reactionIcon}>⭐</Text>
            <Text style={styles.reactionCount}>0</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.addReactionButton}>
            <Text style={styles.addReactionText}>+</Text>
            <Text style={styles.reactionCount}>1</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
          <Text style={styles.actionIcon}>📤</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e8ed',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  weeklySummaryContainer: {
    backgroundColor: '#f8f4ff', // Light purple background for weekly summary
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  headerContent: {
    flex: 1,
    marginLeft: 12,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  username: {
    fontSize: 15,
    fontWeight: '600',
    color: '#14171a',
  },
  crownIcon: {
    fontSize: 12,
    marginLeft: 4,
  },
  timestamp: {
    fontSize: 14,
    color: '#657786',
    marginLeft: 8,
  },
  weeklySummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  weeklySummaryBadge: {
    backgroundColor: '#7c3aed',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  summaryBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '500',
  },
  summaryDate: {
    fontSize: 12,
    color: '#657786',
    marginLeft: 8,
  },
  weeklySummaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#14171a',
    marginBottom: 8,
    marginLeft: 52, // Align with content below avatar
  },
  moreButton: {
    padding: 8,
  },
  moreText: {
    fontSize: 16,
    color: '#657786',
    transform: [{ rotate: '90deg' }],
  },
  content: {
    fontSize: 15,
    lineHeight: 20,
    color: '#14171a',
    marginLeft: 52, // Align with avatar
    marginBottom: 12,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 52, // Align with avatar
    paddingTop: 4,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  actionIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  actionText: {
    fontSize: 13,
    color: '#657786',
    fontWeight: '500',
  },
  reactionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  reactionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  reactionIcon: {
    fontSize: 16,
    marginRight: 2,
  },
  reactionCount: {
    fontSize: 13,
    color: '#657786',
    fontWeight: '500',
  },
  addReactionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 4,
  },
  addReactionText: {
    fontSize: 14,
    color: '#7c3aed',
    fontWeight: '600',
    marginRight: 2,
  },
});