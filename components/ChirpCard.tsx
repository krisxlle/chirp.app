import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, TextInput, Modal, ScrollView, Dimensions } from 'react-native';
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
  onDeleteSuccess?: () => void;
}

export default function ChirpCard({ chirp, onDeleteSuccess }: ChirpCardProps) {
  // Safety check for author data
  if (!chirp || !chirp.author) {
    return null;
  }

  const { user } = useAuth();
  const [reactions, setReactions] = useState(chirp.reactionCount || 0);
  const [replies, setReplies] = useState(chirp.replyCount || 0);
  const [reposts, setReposts] = useState(chirp.repostCount || 0);
  const [userHasReposted, setUserHasReposted] = useState(false);
  // Removed modal state - using page navigation instead

  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [userReaction, setUserReaction] = useState<string | null>(null);
  const [userReactionCount, setUserReactionCount] = useState<number>(0);
  
  // States for user interaction options
  const [isFollowing, setIsFollowing] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [loadingUserActions, setLoadingUserActions] = useState(false);
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  
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
  
  // Load user's current reaction and repost status on component mount
  useEffect(() => {
    if (user?.id) {
      loadUserReaction();
      loadUserRepostStatus();
    }
  }, [chirp.id, user?.id]);
  
  const loadUserReaction = async () => {
    try {
      const { getUserReactionForChirp, getEmojiReactionCount } = await import('../mobile-db');
      const reaction = await getUserReactionForChirp(chirp.id, user?.id || '');
      setUserReaction(reaction);
      
      // If user has a reaction, get the count for that specific emoji
      if (reaction) {
        const count = await getEmojiReactionCount(chirp.id, reaction);
        setUserReactionCount(count);
      } else {
        setUserReactionCount(0);
      }
    } catch (error) {
      console.error('Error loading user reaction:', error);
    }
  };

  const loadUserRepostStatus = async () => {
    try {
      const { getUserRepostStatus } = await import('../mobile-db');
      const hasReposted = await getUserRepostStatus(chirp.id, user?.id || '');
      setUserHasReposted(hasReposted);
    } catch (error) {
      console.error('Error loading user repost status:', error);
    }
  };

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

  const handleRepost = async () => {
    try {
      if (!user?.id) {
        Alert.alert('Sign in required', 'Please sign in to repost chirps.');
        return;
      }

      const { createRepost } = await import('../mobile-db');
      
      console.log('Creating repost of chirp:', chirp.id, 'by user:', user.id);
      
      const repostAdded = await createRepost(chirp.id, user.id);
      
      if (repostAdded) {
        // User added a new repost
        setReposts(prev => prev + 1);
        setUserHasReposted(true);
        
        // Trigger push notification for repost
        const { triggerRepostNotification } = await import('../mobile-db');
        await triggerRepostNotification(chirp.author.id, user.id, parseInt(chirp.id));
        
        console.log('Repost added successfully');
        Alert.alert('Reposted!', 'This chirp has been shared to your profile.');
      } else {
        // User removed their repost
        setReposts(prev => Math.max(0, prev - 1));
        setUserHasReposted(false);
        console.log('Repost removed');
        Alert.alert('Unreposted', 'This chirp has been removed from your profile.');
      }
    } catch (error) {
      console.error('Error handling repost:', error);
      Alert.alert('Error', 'Failed to repost. Please try again.');
    }
  };

  const handleReactionPress = async (emoji: string) => {
    try {
      if (!user?.id) {
        Alert.alert('Sign in required', 'Please sign in to react to chirps.');
        return;
      }

      const { addReaction, getEmojiReactionCount } = await import('../mobile-db');
      
      console.log('Adding reaction:', emoji, 'to chirp:', chirp.id, 'by user:', user.id);
      
      const result = await addReaction(chirp.id, emoji, user.id);
      
      if (result.added) {
        // User added a new reaction
        if (!userReaction) {
          setReactions(prev => prev + 1);
        }
        setUserReaction(result.emoji);
        
        // Get accurate count for the specific emoji
        const emojiCount = await getEmojiReactionCount(chirp.id, result.emoji);
        setUserReactionCount(emojiCount);
        
        // Trigger push notification for reaction
        const { triggerReactionNotification } = await import('../mobile-db');
        await triggerReactionNotification(chirp.author.id, user.id, parseInt(chirp.id));
        
        console.log('Reaction added successfully');
      } else {
        // User removed their reaction
        setReactions(prev => Math.max(0, prev - 1));
        setUserReaction(null);
        setUserReactionCount(0);
        console.log('Reaction removed');
      }
      
      setShowReactionPicker(false);
    } catch (error) {
      console.error('Error handling reaction:', error);
      Alert.alert('Error', 'Failed to add reaction. Please try again.');
    }
  };

  const handleMoreOptions = async () => {
    console.log('🔥 Triple dot menu pressed!');
    console.log('User ID:', user?.id, 'Type:', typeof user?.id);
    console.log('Chirp author ID:', chirp.author.id, 'Type:', typeof chirp.author.id);
    
    // Ensure both are strings for comparison
    const userId = String(user?.id || '');
    const authorId = String(chirp.author.id || '');
    const isOwnChirp = userId && authorId && userId === authorId;
    console.log('Is own chirp:', isOwnChirp, `(${userId} === ${authorId})`);
    
    // Show custom modal instead of Alert
    console.log('Opening options modal...');
    setShowOptionsModal(true);
  };

  const handleDeleteChirp = async () => {
    console.log('🗑️ Delete chirp button pressed - proceeding immediately...');
    console.log('Chirp details:', { id: chirp.id, authorId: chirp.author.id });
    console.log('User details:', { id: user?.id, type: typeof user?.id });
    
    try {
      console.log('🗑️ Proceeding with deletion...');
      console.log('Deleting chirp:', chirp.id, 'by user:', user?.id);
      
      const { deleteChirp } = await import('../mobile-db');
      console.log('DeleteChirp function imported successfully');
      
      await deleteChirp(chirp.id, String(user?.id));
      console.log('✅ Delete operation completed successfully');
      
      setShowOptionsModal(false);
      
      // Force a refresh of the parent component's data
      if (onDeleteSuccess) {
        console.log('📱 Calling onDeleteSuccess callback to refresh feed');
        onDeleteSuccess();
      } else {
        console.log('📱 No refresh callback available - implementing page reload');
        // Force reload the current screen to show updated data
        if (typeof window !== 'undefined') {
          window.location.reload();
        }
      }
    } catch (error) {
      console.error('❌ Delete error:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack
      });
      alert(`Failed to delete chirp: ${error.message}`);
    }
  };

  const handleFollowToggle = async () => {
    if (loadingUserActions || !user?.id || !chirp.author.id) return;
    
    setLoadingUserActions(true);
    try {
      const { followUser, unfollowUser } = await import('../mobile-db');
      
      if (isFollowing) {
        await unfollowUser(user.id, chirp.author.id);
        setIsFollowing(false);
        Alert.alert('Unfollowed', `You are no longer following ${displayName}`);
      } else {
        await followUser(user.id, chirp.author.id);
        setIsFollowing(true);
        Alert.alert('Followed', `You are now following ${displayName}`);
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
      Alert.alert('Error', 'Failed to update follow status. Please try again.');
    } finally {
      setLoadingUserActions(false);
    }
  };

  const handleCopyUserProfile = async () => {
    const profileUrl = `https://chirp.app/profile/${chirp.author.id}`;
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(profileUrl);
      } else {
        // Fallback for environments without clipboard API
        const textArea = document.createElement('textarea');
        textArea.value = profileUrl;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
    } catch (error) {
      console.error('Error copying profile link:', error);
    }
  };

  const handleBlockToggle = async () => {
    if (loadingUserActions || !user?.id || !chirp.author.id) return;
    
    if (isBlocked) {
      // Unblock user
      Alert.alert(
        'Unblock User', 
        `Are you sure you want to unblock ${displayName}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Unblock', 
            onPress: async () => {
              setLoadingUserActions(true);
              try {
                const { unblockUser } = await import('../mobile-db');
                await unblockUser(user.id, chirp.author.id);
                setIsBlocked(false);
                Alert.alert('Unblocked', `You have unblocked ${displayName}`);
              } catch (error) {
                console.error('Error unblocking user:', error);
                Alert.alert('Error', 'Failed to unblock user. Please try again.');
              } finally {
                setLoadingUserActions(false);
              }
            }
          }
        ]
      );
    } else {
      // Block user
      Alert.alert(
        'Block User', 
        `Are you sure you want to block ${displayName}? You won't see their chirps anymore and they won't be able to follow you.`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Block', 
            style: 'destructive', 
            onPress: async () => {
              setLoadingUserActions(true);
              try {
                const { blockUser } = await import('../mobile-db');
                await blockUser(user.id, chirp.author.id);
                setIsBlocked(true);
                setIsFollowing(false); // Remove follow relationship when blocking
                Alert.alert('Blocked', `You have blocked ${displayName}`);
              } catch (error) {
                console.error('Error blocking user:', error);
                Alert.alert('Error', 'Failed to block user. Please try again.');
              } finally {
                setLoadingUserActions(false);
              }
            }
          }
        ]
      );
    }
  };

  const handleNotificationToggle = async () => {
    if (loadingUserActions || !user?.id || !chirp.author.id) return;
    
    setLoadingUserActions(true);
    try {
      const { toggleUserNotifications } = await import('../mobile-db');
      const newState = await toggleUserNotifications(user.id, chirp.author.id);
      setNotificationsEnabled(newState);
      
      const message = newState 
        ? `You will now receive notifications when ${displayName} posts`
        : `You will no longer receive notifications from ${displayName}`;
      Alert.alert('Notifications Updated', message);
    } catch (error) {
      console.error('Error toggling notifications:', error);
      Alert.alert('Error', 'Failed to update notification settings. Please try again.');
    } finally {
      setLoadingUserActions(false);
    }
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
    console.log('🔥 Avatar pressed! Author data:', chirp.author);
    console.log('🔥 Author ID:', chirp.author?.id);
    
    if (chirp.author?.id) {
      console.log('✅ Navigating to user profile page for user:', chirp.author.id);
      
      const displayName = chirp.author.firstName && chirp.author.lastName 
        ? `${chirp.author.firstName} ${chirp.author.lastName}`
        : (chirp.author.customHandle || chirp.author.handle || 'User');
      
      try {
        const profileRoute = `/profile/${chirp.author.id}`;
        console.log('🎯 Using dynamic profile route:', profileRoute);
        
        // Add a small delay to see if that helps
        setTimeout(() => {
          router.push(profileRoute);
          console.log('✅ Navigation initiated successfully to:', profileRoute);
        }, 100);
        
      } catch (error) {
        console.error('❌ Navigation error:', error);
        Alert.alert('Navigation Error', 'Failed to open user profile. Please try again.');
      }
    } else {
      console.log('❌ No author ID found for chirp:', chirp);
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

  const formatNumber = (num: number) => {
    if (num < 1000) return num.toString();
    if (num < 1000000) {
      const k = num / 1000;
      return k % 1 === 0 ? `${k}k` : `${k.toFixed(1)}k`;
    }
    if (num < 1000000000) {
      const m = num / 1000000;
      return m % 1 === 0 ? `${m}M` : `${m.toFixed(1)}M`;
    }
    const b = num / 1000000000;
    return b % 1 === 0 ? `${b}B` : `${b.toFixed(1)}B`;
  };

  // Priority: customHandle > handle (numerical ID) > first/last name as fallback
  const displayName = chirp.author?.customHandle || 
                     chirp.author?.handle ||
                     (chirp.author?.firstName && chirp.author?.lastName 
                       ? `${chirp.author.firstName} ${chirp.author.lastName}`
                       : 'Anonymous User');

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
      <View style={styles.header} pointerEvents="box-none">
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
          
          {/* Show handle under the display name */}
          <TouchableOpacity onPress={handleAvatarPress} style={styles.handleContainer}>
            <Text style={styles.handle}>
              @{chirp.author?.customHandle || chirp.author?.handle || 'user'}
            </Text>
          </TouchableOpacity>
          
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
        
        <TouchableOpacity 
          style={styles.moreButton} 
          onPress={() => {
            console.log('🚀 More button touched!');
            handleMoreOptions();
          }}
          activeOpacity={0.6}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
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
          <RepostIcon size={18} color={userHasReposted ? "#7c3aed" : "#657786"} />
          <Text style={[styles.actionText, userHasReposted && { color: "#7c3aed" }]}>{reposts}</Text>
        </TouchableOpacity>

        <View style={styles.reactionsContainer}>
          {/* Show user's selected reaction with purple background */}
          {userReaction ? (
            <TouchableOpacity 
              style={[styles.reactionButton, styles.selectedReactionButton]} 
              onPress={() => handleReactionPress(userReaction)}
            >
              <Text style={styles.reactionIcon}>{userReaction}</Text>
              <Text style={styles.reactionCount}>{userReactionCount}</Text>
            </TouchableOpacity>
          ) : (
            /* Show quick access reactions when no reaction is selected */
            quickMoodReactions.map((emoji) => (
              <TouchableOpacity 
                key={emoji}
                style={styles.reactionButton} 
                onPress={() => handleReactionPress(emoji)}
              >
                <Text style={styles.reactionIcon}>{emoji}</Text>
              </TouchableOpacity>
            ))
          )}
          
          {/* Always show plus button to change/add reaction */}
          <TouchableOpacity 
            style={styles.addReactionButton} 
            onPress={() => setShowReactionPicker(!showReactionPicker)}
          >
            <Text style={styles.addReactionText}>+</Text>
          </TouchableOpacity>
          
          {/* Reaction picker for all emojis */}
          {showReactionPicker && (
            <View style={styles.reactionPickerContainer}>
              <ScrollView 
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.reactionPicker}
                contentContainerStyle={styles.reactionPickerContent}
              >
                {reactionEmojis.map((emoji, index) => (
                  <TouchableOpacity 
                    key={index}
                    style={[
                      styles.reactionOption,
                      userReaction === emoji && styles.selectedReactionOption
                    ]}
                    onPress={() => handleReactionPress(emoji)}
                  >
                    <Text style={styles.reactionEmoji}>{emoji}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
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
            <View style={styles.threadContainer}>
              {/* Continuous vertical line for all direct replies */}
              {threadReplies.length > 0 && (
                <View style={styles.continuousConnector} />
              )}
              
              {threadReplies.map((reply, index) => (
                <View key={reply.id}>
                  {/* Direct reply to original chirp - same level with individual connector */}
                  <View style={styles.replyWrapper}>
                    <View style={styles.replyBranch} />
                    <ChirpCard chirp={reply} />
                  </View>
                  
                  {/* Nested replies (replies to this reply) - deeper indent */}
                  {reply.nestedReplies && reply.nestedReplies.length > 0 && (
                    <View style={styles.nestedRepliesContainer}>
                      {/* Continuous line for nested replies */}
                      <View style={styles.nestedContinuousConnector} />
                      {reply.nestedReplies.map((nestedReply, nestedIndex) => (
                        <View key={nestedReply.id} style={styles.nestedReplyWrapper}>
                          <View style={styles.nestedReplyBranch} />
                          <ChirpCard chirp={nestedReply} />
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>
      )}

      {/* Total reaction count display at bottom */}
      {reactions > 0 && (
        <View style={styles.totalReactionsContainer}>
          <Text style={styles.totalReactionsText}>
            {formatNumber(reactions)} mood reactions
          </Text>
        </View>
      )}
      
      {/* Custom Options Modal */}
      <Modal
        visible={showOptionsModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowOptionsModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowOptionsModal(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {String(user?.id || '') === String(chirp.author.id || '') ? 'Chirp Options' : 'User Options'}
            </Text>
            
            {String(user?.id || '') === String(chirp.author.id || '') ? (
              // Own chirp options - only Delete and Cancel
              <>
                <TouchableOpacity style={styles.modalOption} onPress={() => {
                  setShowOptionsModal(false);
                  handleDeleteChirp();
                }}>
                  <LinearGradient
                    colors={['#dc2626', '#ef4444']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.modalOptionGradientBorder}
                  >
                    <View style={styles.modalOptionInner}>
                      <Text style={[styles.modalOptionText, styles.destructiveText]}>Delete Chirp</Text>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              </>
            ) : (
              // Other user options
              <>
                <TouchableOpacity style={styles.modalOption} onPress={() => {
                  setShowOptionsModal(false);
                  handleFollowToggle();
                }}>
                  <LinearGradient
                    colors={['#7c3aed', '#ec4899']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.modalOptionGradientBorder}
                  >
                    <View style={styles.modalOptionInner}>
                      <Text style={styles.modalOptionText}>
                        {isFollowing ? `Unfollow ${displayName}` : `Follow ${displayName}`}
                      </Text>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.modalOption} onPress={() => {
                  setShowOptionsModal(false);
                  handleCopyUserProfile();
                }}>
                  <LinearGradient
                    colors={['#7c3aed', '#ec4899']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.modalOptionGradientBorder}
                  >
                    <View style={styles.modalOptionInner}>
                      <Text style={styles.modalOptionText}>Copy Link to Profile</Text>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.modalOption} onPress={() => {
                  setShowOptionsModal(false);
                  handleBlockToggle();
                }}>
                  <LinearGradient
                    colors={['#dc2626', '#ef4444']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.modalOptionGradientBorder}
                  >
                    <View style={styles.modalOptionInner}>
                      <Text style={[styles.modalOptionText, styles.destructiveText]}>
                        {isBlocked ? `Unblock ${displayName}` : `Block ${displayName}`}
                      </Text>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              </>
            )}
            
            <TouchableOpacity style={[styles.modalOption, styles.cancelOption]} onPress={() => setShowOptionsModal(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
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
  handleContainer: {
    marginTop: 2,
  },
  handle: {
    fontSize: 13,
    fontWeight: '400',
    color: '#a78bfa',
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
    marginRight: 8, // Further reduced spacing between action buttons
    paddingVertical: 3,
    paddingHorizontal: 3, // Further reduced horizontal padding
    borderRadius: 4,
    minWidth: 0,
    flexShrink: 1,
  },
  actionIcon: {
    fontSize: 15, // Slightly smaller icons
    marginRight: 3,
  },
  actionText: {
    fontSize: 12, // Smaller text
    color: '#657786',
    fontWeight: '500',
    marginLeft: 4,
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
    marginRight: 3, // Reduced margin for tighter spacing
    minWidth: 0,
    flexShrink: 1,
    paddingHorizontal: 2, // Added small padding to prevent touching
  },
  reactionIcon: {
    fontSize: 13, // Slightly smaller icon
    marginRight: 1,
  },
  reactionCount: {
    fontSize: 10, // Smaller count text
    color: '#657786',
    fontWeight: '500',
    minWidth: 0,
  },
  addReactionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 1,
    minWidth: 0,
    flexShrink: 1,
    paddingHorizontal: 2,
  },
  addReactionText: {
    fontSize: 11, // Smaller plus button text
    color: '#7c3aed',
    fontWeight: '600',
    marginRight: 1,
  },
  reactionPickerContainer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: -16, // Extend to edge of card
    zIndex: 10,
  },
  reactionPicker: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    maxHeight: 60,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  reactionPickerContent: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  reactionOption: {
    marginHorizontal: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  selectedReactionOption: {
    backgroundColor: '#f3e8ff',
  },
  selectedReactionButton: {
    backgroundColor: '#f3e8ff',
    borderRadius: 12,
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
  },
  threadContainer: {
    position: 'relative',
  },
  continuousConnector: {
    position: 'absolute',
    left: -2,
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: '#7c3aed',
    zIndex: 1,
  },
  replyWrapper: {
    position: 'relative',
    marginBottom: 8,
    zIndex: 2,
  },
  replyBranch: {
    position: 'absolute',
    left: -2,
    top: 20,
    width: 12,
    height: 2,
    backgroundColor: '#7c3aed',
    zIndex: 2,
  },
  nestedRepliesContainer: {
    marginLeft: 20,
    paddingLeft: 12,
    position: 'relative',
  },
  nestedContinuousConnector: {
    position: 'absolute',
    left: -2,
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: '#7c3aed',
    zIndex: 1,
  },
  nestedReplyWrapper: {
    position: 'relative',
    marginBottom: 8,
    zIndex: 2,
  },
  nestedReplyBranch: {
    position: 'absolute',
    left: -2,
    top: 20,
    width: 12,
    height: 2,
    backgroundColor: '#7c3aed',
    zIndex: 2,
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
  totalReactionsContainer: {
    paddingTop: 8,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    marginTop: 8,
  },
  totalReactionsText: {
    fontSize: 12,
    color: '#657786',
    textAlign: 'center',
    fontWeight: '500',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    minWidth: 280,
    maxWidth: 320,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#14171a',
    textAlign: 'center',
    marginBottom: 16,
  },
  modalOption: {
    marginVertical: 6,
  },
  modalOptionGradientBorder: {
    borderRadius: 12,
    padding: 2,
  },
  modalOptionInner: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  modalOptionText: {
    fontSize: 16,
    color: '#14171a',
    textAlign: 'center',
    fontWeight: '600',
  },
  destructiveText: {
    color: '#dc2626',
  },
  cancelOption: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e1e8ed',
    paddingTop: 16,
  },
  cancelText: {
    fontSize: 16,
    color: '#657786',
    textAlign: 'center',
    fontWeight: '500',
  },
});