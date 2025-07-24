import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import UserAvatar from './UserAvatar';
import ReplyIcon from './icons/ReplyIcon';
import RepostIcon from './icons/RepostIcon';
import ShareIcon from './icons/ShareIcon';
import SpeechBubbleIcon from './icons/SpeechBubbleIcon';
// Removed UserProfileModal import - using page navigation instead
import { useAuth } from './AuthContext';

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

  const { user } = useAuth();
  const [reactions, setReactions] = useState(chirp.reactionCount || 0);
  const [replies, setReplies] = useState(chirp.replyCount || 0);
  const [reposts, setReposts] = useState(0);
  // Removed modal state - using page navigation instead

  const [showReactionPicker, setShowReactionPicker] = useState(false);
  
  // Track individual reaction counts for quick access buttons
  const [reactionCounts, setReactionCounts] = useState<{[key: string]: number}>({
    '🫶🏼': 0,
    '😭': 0,
    '💀': 0
  });
  
  // Comprehensive mood reactions for Chirp
  const reactionEmojis = [
    '😀', '😍', '🤔', '😢', '😡', '👏', '🔥', '❤️', '💯', '✨',
    '😂', '🥰', '😭', '💀', '🤩', '😱', '🤯', '😴', '🤤', '🫶🏼',
    '👀', '💪', '🤡', '👻', '🦋', '🌸', '💎', '🌟', '☕', '🎉',
    '🌙', '⭐', '💫', '🔮', '🍃', '🌺', '🫧', '🤍', '💜', '🌈',
    '🦄', '🧚‍♀️', '🌻', '🍯', '🧸', '🎨', '📚', '🎭', '🎪', '🎵',
    '🎬', '📸', '💌', '✨', '🌙', '🔆', '💝', '🎀', '🧩', '🪩'
  ];

  // Quick access mood buttons - most popular reactions
  const quickMoodReactions = ['🫶🏼', '😭', '💀'];

  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState('');

  const handleReply = () => {
    setShowReplyInput(true);
  };

  const submitReply = async () => {
    if (!replyText.trim()) return;
    
    if (!user?.id) {
      Alert.alert('Sign in required', 'Please sign in to reply to chirps.');
      return;
    }

    try {
      const { createReply } = await import('../mobile-db');
      
      console.log('Creating reply to chirp:', chirp.id, 'by user:', user.id);
      
      const newReply = await createReply(replyText.trim(), chirp.id, user.id);
      
      // Trigger push notification for reply
      const { triggerReplyNotification } = await import('../mobile-db');
      await triggerReplyNotification(chirp.author.id, user.id, parseInt(chirp.id));
      
      // Update local state
      setReplies(prev => prev + 1);
      setReplyText('');
      setShowReplyInput(false);
      
      // If thread is currently shown, refresh replies
      if (showReplies) {
        const { getChirpReplies } = await import('../mobile-db');
        const updatedReplies = await getChirpReplies(chirp.id);
        setThreadReplies(updatedReplies);
      }
      
      console.log('Reply posted successfully');
    } catch (error) {
      console.error('Error posting reply:', error);
      Alert.alert('Error', 'Failed to post reply. Please try again.');
    }
  };

  const handleRepost = () => {
    Alert.alert('Repost', 'Share this chirp?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Repost', onPress: () => setReposts(prev => prev + 1) }
    ]);
  };

  const handleReactionPress = async (emoji: string) => {
    try {
      if (!user?.id) {
        Alert.alert('Sign in required', 'Please sign in to react to chirps.');
        return;
      }

      const { addReaction } = await import('../mobile-db');
      
      console.log('Adding reaction:', emoji, 'to chirp:', chirp.id, 'by user:', user.id);
      
      const reactionAdded = await addReaction(chirp.id, emoji, user.id);
      
      if (reactionAdded) {
        setReactions(prev => prev + 1);
        // Update specific emoji count
        if (quickMoodReactions.includes(emoji)) {
          setReactionCounts(prev => ({
            ...prev,
            [emoji]: prev[emoji] + 1
          }));
        }
        
        // Trigger push notification for reaction
        const { triggerReactionNotification } = await import('../mobile-db');
        await triggerReactionNotification(chirp.author.id, user.id, parseInt(chirp.id));
        
        console.log('Reaction added successfully');
      } else {
        setReactions(prev => Math.max(0, prev - 1));
        // Update specific emoji count
        if (quickMoodReactions.includes(emoji)) {
          setReactionCounts(prev => ({
            ...prev,
            [emoji]: Math.max(0, prev[emoji] - 1)
          }));
        }
        console.log('Reaction removed');
      }
      
      setShowReactionPicker(false);
    } catch (error) {
      console.error('Error handling reaction:', error);
      Alert.alert('Error', 'Failed to add reaction. Please try again.');
    }
  };

  const handleMoreOptions = () => {
    const isOwnChirp = user?.id && chirp.author.id === user.id;
    
    if (isOwnChirp) {
      Alert.alert('Chirp Options', 'Choose an action', [
        { text: 'Delete Chirp', style: 'destructive', onPress: () => handleDeleteChirp() },
        { text: 'Edit Chirp', onPress: () => Alert.alert('Edit', 'Edit functionality coming soon') },
        { text: 'Cancel', style: 'cancel' }
      ]);
    } else {
      Alert.alert('User Options', 'Choose an action', [
        { text: `Follow ${displayName}`, onPress: () => handleFollowUser() },
        { text: 'Copy Link to Profile', onPress: () => handleCopyUserProfile() },
        { text: 'Block User', style: 'destructive', onPress: () => handleBlockUser() },
        { text: 'Report Chirp', style: 'destructive', onPress: () => handleReportChirp() },
        { text: 'Cancel', style: 'cancel' }
      ]);
    }
  };

  const handleDeleteChirp = async () => {
    Alert.alert('Delete Chirp', 'Are you sure you want to delete this chirp?', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Delete', 
        style: 'destructive', 
        onPress: async () => {
          try {
            // TODO: Implement actual delete functionality
            // const { deleteChirp } = await import('../mobile-db');
            // await deleteChirp(chirp.id);
            Alert.alert('Deleted', 'Chirp has been deleted');
          } catch (error) {
            Alert.alert('Error', 'Failed to delete chirp');
          }
        }
      }
    ]);
  };

  const handleFollowUser = async () => {
    try {
      // TODO: Implement follow functionality
      Alert.alert('Followed', `You are now following ${displayName}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to follow user');
    }
  };

  const handleCopyUserProfile = async () => {
    const profileUrl = `https://chirp.app/profile/${chirp.author.id}`;
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(profileUrl);
        Alert.alert('Link Copied!', `Profile link for ${displayName} has been copied to your clipboard.`);
      } else {
        Alert.alert('Profile Link', `Copy this link: ${profileUrl}`);
      }
    } catch (error) {
      Alert.alert('Profile Link', `Copy this link: ${profileUrl}`);
    }
  };

  const handleBlockUser = () => {
    Alert.alert(
      'Block User', 
      `Are you sure you want to block ${displayName}? You won't see their chirps anymore.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Block', 
          style: 'destructive', 
          onPress: () => {
            // TODO: Implement block functionality
            Alert.alert('Blocked', `You have blocked ${displayName}`);
          }
        }
      ]
    );
  };

  const handleReportChirp = () => {
    Alert.alert(
      'Report Chirp',
      'Why are you reporting this chirp?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Spam', onPress: () => submitReport('spam') },
        { text: 'Inappropriate Content', onPress: () => submitReport('inappropriate') },
        { text: 'Harassment', onPress: () => submitReport('harassment') },
        { text: 'Other', onPress: () => submitReport('other') }
      ]
    );
  };

  const submitReport = (reason: string) => {
    // TODO: Implement actual reporting functionality
    Alert.alert('Report Submitted', 'Thank you for reporting this content. We will review it shortly.');
  };

  const handleShare = async () => {
    const chirpUrl = `https://chirp.app/chirp/${chirp.id}`;
    
    // Use native share API if available
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `Chirp from ${displayName}`,
          url: chirpUrl
        });
        return;
      } catch (error) {
        // Fall back to clipboard if share is cancelled or fails
      }
    }
    
    // Copy to clipboard
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(chirpUrl);
        Alert.alert('Link Copied!', 'The chirp link has been copied to your clipboard.');
      } else {
        // Fallback for environments without clipboard API
        Alert.alert('Share Link', chirpUrl, [
          { text: 'OK', style: 'default' }
        ]);
      }
    } catch (error) {
      Alert.alert('Share Link', `Copy this link: ${chirpUrl}`, [
        { text: 'OK', style: 'default' }
      ]);
    }
  };

  const handleAvatarPress = () => {
    if (chirp.author?.id) {
      console.log('Navigating to user profile page for user:', chirp.author.id);
      
      const displayName = chirp.author.firstName && chirp.author.lastName 
        ? `${chirp.author.firstName} ${chirp.author.lastName}`
        : (chirp.author.customHandle || chirp.author.handle || 'User');
      
      try {
        // Try different navigation approaches
        console.log('Attempting navigation to:', `/user-profile/${chirp.author.id}`);
        
        // Try view-profile route with fallbacks
        console.log('🎯 Using dynamic profile route');
        router.push(`/profile/${chirp.author.id}`);
        console.log('✅ Navigation initiated successfully');
      } catch (error) {
        console.error('Navigation error:', error);
        Alert.alert('Navigation Error', 'Failed to open user profile. Please try again.');
      }
    } else {
      console.log('No author ID found for chirp:', chirp);
      Alert.alert('Error', 'Unable to open profile - no user ID found');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffMinutes < 1) return 'now';
    if (diffMinutes < 60) return `${diffMinutes}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays === 1) return '1d';
    if (diffDays < 7) return `${diffDays}d`;
    if (diffDays < 365) {
      const month = date.toLocaleDateString('en-US', { month: 'short' });
      const day = date.getDate();
      return `${month} ${day}`;
    }
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const displayName = chirp.author?.customHandle || 
                     chirp.author?.handle ||
                     (chirp.author?.firstName && chirp.author?.lastName 
                       ? `${chirp.author.firstName} ${chirp.author.lastName}`
                       : chirp.author?.email?.split('@')[0] || 'Anonymous User');

  const [showReplies, setShowReplies] = useState(false);
  const [threadReplies, setThreadReplies] = useState<any[]>([]);
  const [loadingReplies, setLoadingReplies] = useState(false);

  const handleChirpPress = async () => {
    if (replies === 0) {
      // No replies to show
      return;
    }
    
    if (showReplies) {
      // Hide replies
      setShowReplies(false);
    } else {
      // Show replies - fetch from database
      setLoadingReplies(true);
      try {
        const { getChirpReplies } = await import('../mobile-db');
        const repliesData = await getChirpReplies(chirp.id);
        setThreadReplies(repliesData);
        setShowReplies(true);
        console.log(`Loaded ${repliesData.length} replies for chirp ${chirp.id}`);
      } catch (error) {
        console.error('Error loading replies:', error);
        Alert.alert('Error', 'Failed to load replies. Please try again.');
      } finally {
        setLoadingReplies(false);
      }
    }
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
              {(chirp.author as any)?.isChirpPlus && (chirp.author as any)?.showChirpPlusBadge && (
                <Text style={styles.crownBadge}>👑</Text>
              )}
            </TouchableOpacity>
            <Text style={styles.timestamp}>{formatDate(chirp.createdAt)}</Text>
          </View>
          
          {chirp.isWeeklySummary && (
            <View style={styles.weeklySummaryRow}>
              <LinearGradient
                colors={['#7c3aed', '#ec4899']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.weeklySummaryBadge}
              >
                <Text style={styles.summaryBadgeText}>Weekly Summary</Text>
              </LinearGradient>
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
        {chirp.content.split(/(@\w+|#\w+|\*\*[^*]+\*\*)/).map((part, index) => {
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
          } else if (part.startsWith('#')) {
            return (
              <TouchableOpacity 
                key={index}
                onPress={() => {
                  const cleanHashtag = part.replace('#', '');
                  router.push(`/hashtag/${cleanHashtag}`);
                }}
              >
                <Text style={styles.hashtagText}>{part}</Text>
              </TouchableOpacity>
            );
          } else if (part.startsWith('**') && part.endsWith('**')) {
            // Bold text formatting
            const boldText = part.slice(2, -2);
            return <Text key={index} style={styles.boldText}>{boldText}</Text>;
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
          <TouchableOpacity style={styles.reactionButton} onPress={() => handleReactionPress('🫶🏼')}>
            <Text style={styles.reactionIcon}>🫶🏼</Text>
            <Text style={styles.reactionCount}>{reactionCounts['🫶🏼']}</Text>
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
          
          <TouchableOpacity style={styles.reactionButton} onPress={() => handleReactionPress('😭')}>
            <Text style={styles.reactionIcon}>😭</Text>
            <Text style={styles.reactionCount}>{reactionCounts['😭']}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.reactionButton} onPress={() => handleReactionPress('💀')}>
            <Text style={styles.reactionIcon}>💀</Text>
            <Text style={styles.reactionCount}>{reactionCounts['💀']}</Text>
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
              style={[styles.submitButtonContainer, !replyText.trim() && styles.submitButtonDisabled]}
              onPress={submitReply}
              disabled={!replyText.trim()}
            >
              <LinearGradient
                colors={['#7c3aed', '#ec4899']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.submitButton}
              >
                <Text style={styles.submitButtonText}>Reply</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Thread Replies */}
      {showReplies && (
        <View style={styles.repliesContainer}>
          {loadingReplies ? (
            <Text style={styles.loadingText}>Loading replies...</Text>
          ) : threadReplies.length === 0 ? (
            <Text style={styles.noRepliesText}>No replies yet</Text>
          ) : (
            threadReplies.map((reply, index) => (
              <View key={reply.id} style={styles.replyWrapper}>
                <View style={styles.replyConnector} />
                <ChirpCard chirp={reply} />
              </View>
            ))
          )}
        </View>
      )}

      {/* Profile navigation now uses page routing */}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginVertical: 3,
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
    justifyContent: 'space-between',
    marginLeft: 52, // Align with avatar
    marginRight: 8, // Reduced right margin
    paddingTop: 4,
    overflow: 'visible', // Allow buttons to be visible
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12, // Reduced spacing between action buttons
    paddingVertical: 4,
    paddingHorizontal: 4, // Reduced horizontal padding
    borderRadius: 4,
    minWidth: 0,
    flexShrink: 1,
  },
  actionIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  actionText: {
    fontSize: 13,
    color: '#657786',
    fontWeight: '500',
    marginLeft: 6,
  },
  reactionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
    overflow: 'visible',
  },
  reactionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 4,
    minWidth: 0,
    flexShrink: 1,
  },
  reactionIcon: {
    fontSize: 14,
    marginRight: 1,
  },
  reactionCount: {
    fontSize: 11,
    color: '#657786',
    fontWeight: '500',
    minWidth: 0,
  },
  addReactionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 2,
    minWidth: 0,
    flexShrink: 1,
  },
  addReactionText: {
    fontSize: 12,
    color: '#7c3aed',
    fontWeight: '600',
    marginRight: 1,
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
  submitButtonContainer: {
    borderRadius: 20,
  },
  submitButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
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
    flexShrink: 0,
  },
  shareButton: {
    marginLeft: 0,
  },
  mentionText: {
    color: '#7c3aed',
    fontSize: 15,
  },
  hashtagText: {
    color: '#7c3aed',
    fontSize: 15,
    fontWeight: '500',
  },
  boldText: {
    fontWeight: '700',
    color: '#14171a',
  },
  repliesContainer: {
    marginTop: 12,
    paddingLeft: 16,
    borderLeftWidth: 2,
    borderLeftColor: '#e1e8ed',
  },
  replyWrapper: {
    marginBottom: 8,
  },
  replyConnector: {
    position: 'absolute',
    left: -2,
    top: 0,
    width: 2,
    height: '100%',
    backgroundColor: '#7c3aed',
  },
  loadingText: {
    fontSize: 14,
    color: '#657786',
    textAlign: 'center',
    padding: 16,
  },
  noRepliesText: {
    fontSize: 14,
    color: '#657786',
    textAlign: 'center',
    fontStyle: 'italic',
    padding: 16,
  },
});