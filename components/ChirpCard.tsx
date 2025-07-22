import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, TextInput } from 'react-native';
import UserAvatar from './UserAvatar';
import ReplyIcon from './icons/ReplyIcon';
import RepostIcon from './icons/RepostIcon';
import ShareIcon from './icons/ShareIcon';
import SpeechBubbleIcon from './icons/SpeechBubbleIcon';

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
  // Safety check for author data
  if (!chirp || !chirp.author) {
    return null;
  }

  const [reactions, setReactions] = useState(chirp.reactionCount || 0);
  const [replies, setReplies] = useState(chirp.replyCount || 0);
  const [reposts, setReposts] = useState(0);

  const [showReactionPicker, setShowReactionPicker] = useState(false);
  
  const reactionEmojis = ['😀', '😍', '🤔', '😢', '😡', '👏', '🔥', '❤️', '💯', '✨'];

  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState('');

  const handleReply = () => {
    setShowReplyInput(true);
  };

  const submitReply = () => {
    if (replyText.trim()) {
      setReplies(prev => prev + 1);
      setReplyText('');
      setShowReplyInput(false);
      Alert.alert('Reply Posted', 'Your reply has been posted!');
    }
  };

  const handleRepost = () => {
    Alert.alert('Repost', 'Share this chirp?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Repost', onPress: () => setReposts(prev => prev + 1) }
    ]);
  };

  const handleReactionPress = (emoji: string) => {
    setReactions(prev => prev + 1);
    setShowReactionPicker(false);
    // TODO: Add reaction to database
    Alert.alert('Reaction Added', `You reacted with ${emoji}`);
  };

  const handleMoreOptions = () => {
    const isOwnChirp = chirp.author.id === 'current_user_id'; // TODO: Get actual current user ID
    
    if (isOwnChirp) {
      Alert.alert('Chirp Options', 'Choose an action', [
        { text: 'Delete Chirp', style: 'destructive', onPress: () => handleDeleteChirp() },
        { text: 'Cancel', style: 'cancel' }
      ]);
    } else {
      Alert.alert('User Options', 'Choose an action', [
        { text: 'Unfollow', onPress: () => Alert.alert('Unfollowed', `You unfollowed ${displayName}`) },
        { text: 'Block User', style: 'destructive', onPress: () => Alert.alert('Blocked', `You blocked ${displayName}`) },
        { text: 'Turn on Notifications', onPress: () => Alert.alert('Notifications', `Turned on notifications for ${displayName}`) },
        { text: 'Cancel', style: 'cancel' }
      ]);
    }
  };

  const handleDeleteChirp = () => {
    Alert.alert('Delete Chirp', 'Are you sure you want to delete this chirp?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => Alert.alert('Deleted', 'Chirp has been deleted') }
    ]);
  };

  const handleShare = () => {
    // Use native share API
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({
        title: `Chirp from ${displayName}`,
        text: chirp.content,
        url: `https://chirp.app/chirp/${chirp.id}`
      });
    } else {
      Alert.alert('Share', 'Copy link to chirp?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Copy Link', onPress: () => Alert.alert('Copied!') }
      ]);
    }
  };

  const handleAvatarPress = () => {
    if (chirp.author?.id) {
      Alert.alert('Profile Navigation', `Navigate to profile for ${displayName} (ID: ${chirp.author.id})`);
      // TODO: Implement actual profile navigation to ProfilePage with user ID
    }
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

  const displayName = chirp.author?.customHandle || 
                     chirp.author?.handle ||
                     (chirp.author?.firstName && chirp.author?.lastName 
                       ? `${chirp.author.firstName} ${chirp.author.lastName}`
                       : chirp.author?.email?.split('@')[0] || 'Anonymous User');

  const handleChirpPress = () => {
    Alert.alert('View Replies', `Show ${replies} replies for this chirp`);
  };

  return (
    <TouchableOpacity 
      style={[styles.container, chirp.isWeeklySummary && styles.weeklySummaryContainer]}
      onPress={handleChirpPress}
      activeOpacity={0.95}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={handleAvatarPress}>
          <UserAvatar user={chirp.author} size="md" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <View style={styles.nameRow}>
            <TouchableOpacity onPress={handleAvatarPress} style={styles.nameContainer}>
              <Text style={styles.username}>{displayName}</Text>
              {(chirp.author as any)?.isChirpPlus && (
                <Text style={styles.crownBadge}>👑</Text>
              )}
            </TouchableOpacity>
            <Text style={styles.timestamp}>{formatDate(chirp.createdAt)}</Text>
          </View>
          
          {chirp.isWeeklySummary && (
            <View style={styles.weeklySummaryRow}>
              <View style={styles.weeklySummaryBadge}>
                <Text style={styles.summaryBadgeText}>Weekly Summary</Text>
              </View>
              <Text style={styles.summaryDate}>3 days ago</Text>
            </View>
          )}
        </View>
        
        <TouchableOpacity style={styles.moreButton} onPress={() => handleMoreOptions()}>
          <Text style={styles.moreText}>⋯</Text>
        </TouchableOpacity>
      </View>

      {chirp.isWeeklySummary && (
        <Text style={styles.weeklySummaryTitle}>
          Weekly Summary (2025-07-13 - 2025-07-19)
        </Text>
      )}

      <Text style={styles.content}>
        {chirp.content.split(/(@\w+)/).map((part, index) => {
          if (part.startsWith('@')) {
            return (
              <TouchableOpacity 
                key={index}
                onPress={() => {
                  Alert.alert('Mention Navigation', `Navigate to ${part}'s profile`);
                  // TODO: Implement notification to mentioned user
                }}
              >
                <Text style={styles.mentionText}>{part}</Text>
              </TouchableOpacity>
            );
          }
          return <Text key={index}>{part}</Text>;
        })}
      </Text>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton} onPress={handleReply}>
          <SpeechBubbleIcon size={18} color="#657786" />
          <Text style={styles.actionText}>{replies}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={handleRepost}>
          <RepostIcon size={18} color="#657786" />
          <Text style={styles.actionText}>{reposts}</Text>
        </TouchableOpacity>

        <View style={styles.reactionsContainer}>
          <TouchableOpacity style={styles.reactionButton} onPress={() => setShowReactionPicker(!showReactionPicker)}>
            <Text style={styles.reactionIcon}>😀</Text>
            <Text style={styles.reactionCount}>{reactions}</Text>
          </TouchableOpacity>
          
          {showReactionPicker && (
            <View style={styles.reactionPicker}>
              {reactionEmojis.map((emoji, index) => (
                <TouchableOpacity 
                  key={index}
                  style={styles.reactionOption}
                  onPress={() => handleReactionPress(emoji)}
                >
                  <Text style={styles.reactionEmoji}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
          
          <TouchableOpacity style={styles.reactionButton} onPress={() => setShowReactionPicker(!showReactionPicker)}>
            <Text style={styles.reactionIcon}>🤯</Text>
            <Text style={styles.reactionCount}>0</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.reactionButton} onPress={() => setShowReactionPicker(!showReactionPicker)}>
            <Text style={styles.reactionIcon}>⭐</Text>
            <Text style={styles.reactionCount}>0</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.addReactionButton} onPress={() => setShowReactionPicker(!showReactionPicker)}>
            <Text style={styles.addReactionText}>+</Text>
            <Text style={styles.reactionCount}>1</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.shareButtonContainer}>
          <TouchableOpacity style={[styles.actionButton, styles.shareButton]} onPress={handleShare}>
            <ShareIcon size={18} color="#657786" />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Reply Input */}
      {showReplyInput && (
        <View style={styles.replyContainer}>
          <TextInput
            style={styles.replyInput}
            placeholder={`Reply to ${displayName}...`}
            value={replyText}
            onChangeText={setReplyText}
            multiline
            maxLength={280}
          />
          <View style={styles.replyButtons}>
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={() => setShowReplyInput(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.submitButton, !replyText.trim() && styles.submitButtonDisabled]}
              onPress={submitReply}
              disabled={!replyText.trim()}
            >
              <Text style={styles.submitButtonText}>Reply</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    marginHorizontal: 12,
    marginVertical: 6,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  weeklySummaryContainer: {
    backgroundColor: '#f8f4ff',
    borderRadius: 16,
    shadowColor: '#d946ef',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
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
    lineHeight: 24,
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
  reactionPicker: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 10,
  },
  reactionOption: {
    marginHorizontal: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  reactionEmoji: {
    fontSize: 20,
  },
  replyContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#e1e8ed',
    backgroundColor: '#f8f9fa',
  },
  replyInput: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: '#14171a',
    minHeight: 60,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#e1e8ed',
  },
  replyButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
    gap: 8,
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e1e8ed',
  },
  cancelButtonText: {
    color: '#657786',
    fontWeight: '600',
  },
  submitButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#7c3aed',
  },
  submitButtonDisabled: {
    backgroundColor: '#e1e8ed',
  },
  submitButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  crownBadge: {
    fontSize: 16,
    marginLeft: 4,
    color: '#7c3aed',
  },
  speechBubble: {
    fontSize: 16,
    marginRight: 4,
  },
  shareButtonContainer: {
    marginLeft: 'auto',
  },
  shareButton: {
    marginLeft: 0,
  },
  mentionText: {
    color: '#7c3aed',
    fontSize: 15,
  },
});