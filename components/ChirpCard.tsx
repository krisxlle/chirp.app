import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Clipboard, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import ChirpImage from './ChirpImage';
import ChirpLikesModal from './ChirpLikesModal';
import HeartIcon from './icons/HeartIcon';
import ShareIcon from './icons/ShareIcon';
import SpeechBubbleIcon from './icons/SpeechBubbleIcon';
import ImageViewerModal from './ImageViewerModal';
import UserAvatar from './UserAvatar';
// Removed UserProfileModal import - using page navigation instead
import { useAuth } from './AuthContext';

// Import real Supabase functions
import { deleteChirp } from '../lib/database/mobile-db-supabase';
import { notificationService } from '../services/notificationService';

// Temporary inline createReply function to bypass import issues
const createReply = async (content: string, chirpId: string, userId: string): Promise<any> => {
  try {
    console.log('📝 Creating reply to chirp:', chirpId, 'by user:', userId);
    
    // Check if chirp has a temporary ID
    if (String(chirpId).startsWith('temp_')) {
      throw new Error('Cannot reply to chirp with temporary ID. Please wait for the chirp to be processed.');
    }
    
    // Import supabase client directly
    const { supabase } = await import('../lib/database/mobile-db-supabase');
    
    const { data: reply, error } = await supabase
      .from('chirps')
      .insert({
        content: content.trim(),
        author_id: userId,
        reply_to_id: chirpId,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Error creating reply:', error);
      throw error;
    }

    console.log('✅ Reply created successfully:', reply.id);
    
    // Create notification for the chirp author
    await notificationService.createCommentNotification(userId, chirpId);
    
    return reply;
  } catch (error) {
    console.error('❌ Error in createReply:', error);
    throw error;
  }
};

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
  replyToId?: string | null;
  author: User;
  replyCount: number;
  reactionCount: number;
  isWeeklySummary?: boolean;
  userHasLiked?: boolean;
  // Image-related fields
  imageUrl?: string | null;
  imageAltText?: string | null;
  imageWidth?: number | null;
  imageHeight?: number | null;
  // Reply identification fields
  isDirectReply?: boolean;
  isNestedReply?: boolean;
  // Thread identification field
  isThreadedChirp?: boolean;
}

interface ChirpCardProps {
  chirp: Chirp;
  onDeleteSuccess?: (deletedChirpId?: string) => void;
  onProfilePress?: (userId: string) => void;
  onLikeUpdate?: (chirpId: string, newLikeCount: number) => void;
  onReplyPosted?: (chirpId: string) => void;
  isHighlighted?: boolean;
}

export default function ChirpCard({ chirp, onDeleteSuccess, onProfilePress, onLikeUpdate, onReplyPosted, isHighlighted = false }: ChirpCardProps) {
  // Safety check for author data
  if (!chirp || !chirp.author) {
    return null;
  }

  // Debug logging removed to reduce log spam

  const { user } = useAuth();
  
  // Safety check for user - if user is not available, show a loading state
  if (!user) {
    console.log('ChirpCard: User not available, showing loading state');
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    );
  }
  
  // User available, rendering chirp
  const [likes, setLikes] = useState(chirp.reactionCount || 0);
  const [replies, setReplies] = useState(chirp.replyCount || 0);
  const [userHasLiked, setUserHasLiked] = useState(chirp.userHasLiked || false);
  const [showLikesModal, setShowLikesModal] = useState(false);
  const [showImageViewer, setShowImageViewer] = useState(false);
  
  // Verify like status on component mount to ensure accuracy
  useEffect(() => {
    const verifyLikeStatus = async () => {
      if (!user?.id || !chirp.id) return;
      
      // Skip verification for temporary IDs
      if (String(chirp.id).startsWith('temp_')) {
        console.log('⚠️ Skipping like verification for temporary chirp ID:', chirp.id);
        return;
      }
      
      try {
        const { supabase } = await import('../lib/database/mobile-db-supabase');
        const { data: existingLike } = await supabase
          .from('reactions')
          .select('id')
          .eq('chirp_id', String(chirp.id))
          .eq('user_id', String(user.id))
          .maybeSingle();
        
        // Update state if it doesn't match database
        if (existingLike && !userHasLiked) {
          setUserHasLiked(true);
        } else if (!existingLike && userHasLiked) {
          setUserHasLiked(false);
        }
      } catch (error) {
        console.log('🔍 Error verifying like status:', error);
      }
    };
    
    verifyLikeStatus();
  }, [user?.id, chirp.id]); // Only run when user or chirp changes
  
  // Real-time timestamp updates
  const [currentTime, setCurrentTime] = useState(Date.now());
  
  // Update timestamp every 5 seconds for more responsive timestamps
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 5000); // Update every 5 seconds
    
    return () => clearInterval(interval);
  }, []); // Remove currentTime dependency to prevent infinite loops
  
  // States for user interaction options
  const [isFollowing, setIsFollowing] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [loadingUserActions, setLoadingUserActions] = useState(false);
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  
  // Update local state when chirp data changes
  useEffect(() => {
    setLikes(chirp.reactionCount || 0);
    setReplies(chirp.replyCount || 0);
    setUserHasLiked(chirp.userHasLiked || false);
  }, [chirp.reactionCount, chirp.replyCount, chirp.userHasLiked]);

  // Debug logging for image data
  useEffect(() => {
    console.log('🔍 ChirpCard image data:', {
      chirpId: chirp.id,
      hasImageUrl: !!chirp.imageUrl,
      imageUrl: chirp.imageUrl?.substring(0, 50) + '...',
      imageWidth: chirp.imageWidth,
      imageHeight: chirp.imageHeight,
      imageAltText: chirp.imageAltText
    });
  }, [chirp.id, chirp.imageUrl, chirp.imageWidth, chirp.imageHeight, chirp.imageAltText]);

  // Check follow status when component mounts or user changes
  useEffect(() => {
    const checkFollowStatus = async () => {
      if (!user?.id || !chirp.author.id || user.id === chirp.author.id) {
        return; // Don't check for own chirps
      }

      try {
        const { checkFollowStatus: checkFollow } = await import('../lib/database/mobile-db-supabase');
        const followData = await checkFollow(chirp.author.id, user.id);
        setIsFollowing(followData.isFollowing || false);
        setIsBlocked(followData.isBlocked || false);
        setNotificationsEnabled(followData.notificationsEnabled || false);
      } catch (error) {
        console.error('Error checking follow status:', error);
        // Keep default values on error
      }
    };

    checkFollowStatus();
  }, [user?.id, chirp.author.id]);
  
  // Calculate display name for the chirp author (remove lastName functionality)
  const displayName = chirp.author.firstName 
    ? chirp.author.firstName
    : (chirp.author.customHandle || chirp.author.handle || 'User');

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
      const chirpIdStr = String(chirp.id);
      const userIdStr = String(user.id);
      
      console.log('Creating reply to chirp:', chirpIdStr, 'by user:', userIdStr);
      
      const newReply = await createReply(replyText.trim(), chirpIdStr, userIdStr);
      
      // Update local state
      setReplies(prev => prev + 1);
      setReplyText('');
      setShowReplyInput(false);
      
      // Notify parent component to refresh replies
      if (onReplyPosted) {
        onReplyPosted(chirpIdStr);
      }
      
      console.log('Reply posted successfully');
    } catch (error) {
      console.error('Error posting reply:', error);
      Alert.alert('Error', 'Failed to post reply. Please try again.');
    }
  };

  const handleLike = async () => {
    try {
      if (!user?.id) {
        Alert.alert('Sign in required', 'Please sign in to like chirps.');
        return;
      }

      // Check if chirp has a temporary ID (starts with 'temp_')
      if (String(chirp.id).startsWith('temp_')) {
        console.log('⚠️ Cannot like chirp with temporary ID:', chirp.id);
        Alert.alert('Please wait', 'This chirp is still being processed. Please wait a moment and try again.');
        return;
      }

      console.log('🔴 Like button pressed!');
      console.log('Chirp ID:', chirp.id, 'Type:', typeof chirp.id);
      console.log('User ID:', user.id, 'Type:', typeof user.id);
      console.log('Current likes:', likes);
      console.log('User has liked:', userHasLiked);

      // Import supabase client directly
      const { supabase } = await import('../lib/database/mobile-db-supabase');
      
      // Ensure proper string conversion for database constraints
      const chirpIdStr = String(chirp.id);
      const userIdStr = String(user.id);
      
      if (userHasLiked) {
        // Unlike: Remove the reaction
        console.log('🔴 Unliking chirp...');
        
        const { error } = await supabase
          .from('reactions')
          .delete()
          .eq('chirp_id', chirpIdStr)
          .eq('user_id', userIdStr);

        if (error) {
          console.error('❌ Error removing like:', error);
          Alert.alert('Error', 'Failed to remove like. Please try again.');
          return;
        }

        // Update local state
        setLikes(prev => Math.max(0, prev - 1));
        setUserHasLiked(false);
        
        // Notify parent component of the change
        if (onLikeUpdate) {
          onLikeUpdate(chirp.id, likes - 1);
        }
        
        console.log('✅ Like removed successfully');
      } else {
        // Like: Add the reaction
        console.log('🔴 Liking chirp...');
        
        // First check if user has already liked this chirp to prevent duplicate constraint error
        const { data: existingLike, error: checkError } = await supabase
          .from('reactions')
          .select('id')
          .eq('chirp_id', chirpIdStr)
          .eq('user_id', userIdStr)
          .maybeSingle();

        if (checkError) {
          console.error('❌ Error checking existing like:', checkError);
          Alert.alert('Error', 'Failed to check like status. Please try again.');
          return;
        }

        // If user has already liked, don't try to insert again
        if (existingLike) {
          console.log('⚠️ User has already liked this chirp, skipping insert');
          // Update local state to reflect the actual state
          setUserHasLiked(true);
          return;
        }
        
        // User hasn't liked yet, so add the like
        const { error } = await supabase
          .from('reactions')
          .insert({
            chirp_id: chirpIdStr,
            user_id: userIdStr,
            created_at: new Date().toISOString()
          });

        if (error) {
          console.error('❌ Error adding like:', error);
          // If it's a duplicate key error, just update the UI state
          if (error.code === '23505') {
            console.log('⚠️ Duplicate like detected, updating UI state');
            setUserHasLiked(true);
            setLikes(prev => prev + 1);
            return;
          }
          Alert.alert('Error', 'Failed to like chirp. Please try again.');
          return;
        }

        // Update local state
        setLikes(prev => prev + 1);
        setUserHasLiked(true);
        
        // Notify parent component of the change
        if (onLikeUpdate) {
          onLikeUpdate(chirp.id, likes + 1);
        }
        
        // Create notification for the chirp author
        await notificationService.createLikeNotification(userIdStr, chirpIdStr);
        
        console.log('✅ Like added successfully');
      }
    } catch (error) {
      console.error('❌ Error handling like:', error);
      Alert.alert('Error', 'Failed to like chirp. Please try again.');
    }
  };

  const handleLikesPress = () => {
    if (likes > 0) {
      setShowLikesModal(true);
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
    console.log('🗑️ Delete chirp button pressed');
    console.log('Chirp ID:', chirp.id?.substring(0, 8) + '...', 'Author:', chirp.author.id?.substring(0, 8) + '...');
    console.log('User ID:', user?.id?.substring(0, 8) + '...', 'Type:', typeof user?.id);
    
    try {
      console.log('🗑️ Proceeding with deletion...');
      console.log('Deleting chirp:', chirp.id?.substring(0, 8) + '...', 'by user:', user?.id?.substring(0, 8) + '...');
      
      await deleteChirp(chirp.id, String(user?.id));
      console.log('✅ Delete operation completed successfully');
      
      setShowOptionsModal(false);
      
      // Force a refresh of the parent component's data
      if (onDeleteSuccess) {
        console.log('📱 Calling onDeleteSuccess callback to refresh feed');
        onDeleteSuccess(chirp.id);
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
      Alert.alert('Error', `Failed to delete chirp: ${error.message}`);
    }
  };

  const handleFollowToggle = async () => {
    if (loadingUserActions || !user?.id || !chirp.author.id) {
      console.log('ChirpCard: Cannot toggle follow - missing user or author ID');
      return;
    }
    
    setLoadingUserActions(true);
    try {
      const { followUser, unfollowUser } = await import('../lib/database/mobile-db-supabase');
      
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
      await Clipboard.setString(profileUrl);
      Alert.alert('Link Copied!', 'The profile link has been copied to your clipboard.');
    } catch (error) {
      console.error('Error copying profile link:', error);
      Alert.alert('Error', 'Failed to copy profile link. Please try again.');
    }
  };

  const handleBlockToggle = async () => {
    if (loadingUserActions || !user?.id || !chirp.author.id) {
      console.log('ChirpCard: Cannot toggle block - missing user or author ID');
      return;
    }
    
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
                const { unblockUser } = await import('../lib/database/mobile-db-supabase');
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
                const { blockUser } = await import('../lib/database/mobile-db-supabase');
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
    if (loadingUserActions || !user?.id || !chirp.author.id) {
      console.log('ChirpCard: Cannot toggle notifications - missing user or author ID');
      return;
    }
    
    setLoadingUserActions(true);
    try {
      const { toggleUserNotifications } = await import('../lib/database/mobile-db-supabase');
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
    if (!chirp.author?.id) {
      console.error('Avatar press failed: No author ID found');
      return;
    }
    
    console.log('🔥 Avatar pressed - opening profile modal for:', chirp.author.id);
    console.log('🔍 Debug - onProfilePress prop:', typeof onProfilePress, onProfilePress);
    console.log('🔍 Debug - chirp ID:', chirp.id, 'author:', chirp.author.customHandle || chirp.author.handle);
    
    // Use the onProfilePress callback to open profile modal
    if (onProfilePress) {
      onProfilePress(chirp.author.id);
    } else {
      console.warn('No profile press handler available for chirp:', chirp.id, 'author:', chirp.author.customHandle || chirp.author.handle);
    }
  };

    const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      
      // Check if the date is valid
      if (isNaN(date.getTime())) {
        console.warn('Invalid date string:', dateString);
        return 'now';
      }
      
      // Server sends UTC timestamps, so we need to compare with UTC time
      const now = new Date();
      const nowUTC = now.getTime();
      const dateUTC = date.getTime();
      
      const diffTime = Math.abs(nowUTC - dateUTC);
      
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
    } catch (error) {
      console.error('Error formatting date:', error, 'dateString:', dateString);
      return 'now';
    }
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

  const handleChirpPress = async () => {
    console.log('🔍 ChirpCard: Chirp tapped, navigating to ChirpScreen for ID:', chirp.id);
    // Navigate to thread view
    router.push(`/chirp/${chirp.id}`);
  };

  // Debug logging for user data (removed to prevent infinite loops)

  return (
    <TouchableOpacity 
      style={[
        styles.container, 
        chirp.isWeeklySummary && styles.weeklySummaryContainer,
        chirp.isDirectReply && styles.replyContainer,
        chirp.isThreadedChirp && styles.threadedChirpContainer,
        isHighlighted && styles.highlightedContainer
      ]}
      onPress={handleChirpPress}
      activeOpacity={0.95}
    >
      <View style={[styles.header, { pointerEvents: 'box-none' }]}>
        <TouchableOpacity onPress={handleAvatarPress} style={{ marginLeft: 0 }}>
          <UserAvatar user={chirp.author} size="md" showFrame={true} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <View style={styles.nameRow}>
            <TouchableOpacity onPress={(e) => {
              e.stopPropagation();
              handleAvatarPress();
            }} style={styles.nameContainer}>
              <Text style={styles.username}>{displayName}</Text>
            </TouchableOpacity>
            <Text style={styles.timestamp}>{formatDate(chirp.createdAt)}</Text>
          </View>
          
          {/* Show handle under the display name */}
          <TouchableOpacity onPress={(e) => {
            e.stopPropagation();
            handleAvatarPress();
          }} style={styles.handleContainer}>
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
          onPress={(e) => {
            e.stopPropagation();
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

      {chirp.content.trim() && (
        <Text style={styles.content}>
          {chirp.content.split(/(@\w+|#\w+|\*\*[^*]+\*\*)/).map((part, index) => {
            if (part.startsWith('@')) {
              return (
                <TouchableOpacity 
                  key={index}
                  onPress={(e) => {
                    e.stopPropagation();
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
                  onPress={(e) => {
                    e.stopPropagation();
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
      )}

      {/* Display chirp image if available */}
      {chirp.imageUrl && (
        <View style={styles.imageContainer}>
          <ChirpImage
            imageUrl={chirp.imageUrl}
            imageAltText={chirp.imageAltText || chirp.content || 'Chirp image'}
            imageWidth={chirp.imageWidth}
            imageHeight={chirp.imageHeight}
            maxWidth={400} // Increased from 330 to 400 (much wider)
            maxHeight={300} // Increased from 180 to 300 to allow wider images
            onImagePress={() => {
              console.log('Image pressed:', chirp.imageUrl?.substring(0, 50) + '...');
              setShowImageViewer(true);
            }}
          />
        </View>
      )}
      
      {/* Debug logging for image data - moved to useEffect to avoid JSX issues */}

      <View style={[styles.actions, { pointerEvents: 'box-none' }]}>
        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={(e) => {
            e.stopPropagation();
            handleReply();
          }}
        >
          <SpeechBubbleIcon size={18} color="#657786" />
          <Text style={styles.actionText}>{replies}</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[
            styles.likeButton, 
            userHasLiked && styles.likedButton,
            String(chirp.id).startsWith('temp_') && styles.disabledButton
          ]} 
          onPress={(e) => {
            e.stopPropagation();
            handleLike();
          }}
          disabled={String(chirp.id).startsWith('temp_')}
        >
          <HeartIcon 
            size={18} 
            color={
              String(chirp.id).startsWith('temp_') 
                ? "#ccc" 
                : userHasLiked ? "#7c3aed" : "#657786"
            } 
            filled={userHasLiked}
          />
          <TouchableOpacity 
            onPress={(e) => {
              e.stopPropagation();
              handleLikesPress();
            }}
            style={styles.likeCountButton}
            disabled={String(chirp.id).startsWith('temp_')}
          >
            <Text style={[
              styles.actionText, 
              userHasLiked && { color: "#7c3aed" },
              String(chirp.id).startsWith('temp_') && { color: "#ccc" }
            ]}>
              {likes}
            </Text>
          </TouchableOpacity>
        </TouchableOpacity>

        <View style={styles.shareButtonContainer}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.shareButton]} 
            onPress={(e) => {
              e.stopPropagation();
              handleShare();
            }}
          >
            <ShareIcon size={18} color="#657786" />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Reply Input */}
      {showReplyInput && (
        <View style={[styles.replyContainer, { pointerEvents: 'box-none' }]}>
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
              onPress={(e) => {
                e.stopPropagation();
                setShowReplyInput(false);
              }}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.submitButtonContainer, !replyText.trim() && styles.submitButtonDisabled]}
              onPress={(e) => {
                e.stopPropagation();
                submitReply();
              }}
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

      {/* Custom Options Modal */}
      <Modal
        visible={showOptionsModal}
        transparent={true}
        animationType="none"
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
                  console.log('🗑️ Delete button pressed in modal');
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

      <ChirpLikesModal
        visible={showLikesModal}
        chirpId={chirp.id}
        onClose={() => setShowLikesModal(false)}
      />

      <ImageViewerModal
        visible={showImageViewer}
        imageUrl={chirp.imageUrl || ''}
        imageAltText={chirp.imageAltText || chirp.content || 'Chirp image'}
        onClose={() => setShowImageViewer(false)}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    marginVertical: 3,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    boxShadow: '0 2px 8px rgba(124, 58, 237, 0.08)',
    elevation: 3,
    maxWidth: 600, // Max width for web responsiveness
    alignSelf: 'center', // Center the card horizontally
    width: '100%', // Full width up to max width
  },
  imageContainer: {
    marginTop: 4,           // Added padding between content and image
    marginBottom: 12,       // Added padding under the image
    marginLeft: 20,         // Align with chirp text content left edge
    marginRight: 20,        // Add right margin to prevent overflow
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#ffffff', // Match ChirpCard background
    alignItems: 'center',      // Center the image horizontally
    justifyContent: 'center',   // Center the image vertically
    width: '90%',              // Use 90% width to prevent overflow
  },
  weeklySummaryContainer: {
    backgroundColor: '#f8f4ff',
    borderRadius: 16,
    boxShadow: '0 4px 12px rgba(217, 70, 239, 0.15)',
    elevation: 6,
  },
  highlightedContainer: {
    backgroundColor: '#fef3e8',
    borderColor: '#f59e0b',
    borderWidth: 2,
    boxShadow: '0 4px 12px rgba(245, 158, 11, 0.25)',
    elevation: 8,
  },
  replyContainer: {
    marginLeft: 32,
    borderLeftWidth: 2,
    borderLeftColor: '#7c3aed',
    paddingLeft: 20,
    backgroundColor: '#fafafa',
  },
  threadedChirpContainer: {
    backgroundColor: '#f0f9ff',
    borderLeftWidth: 3,
    borderLeftColor: '#7c3aed',
    marginLeft: 8,
    borderRadius: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center', // Changed from 'flex-start' to 'center' for vertical centering
    marginBottom: 2,
  },
  headerContent: {
    flex: 1,
    marginLeft: 12, // Increased padding to move content further left
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  username: {
    fontSize: 15,
    fontWeight: '600',
    color: '#14171a',
    lineHeight: 20, // Added line height for better spacing
  },
  handleContainer: {
    marginTop: 2,
  },
  handle: {
    fontSize: 13,
    fontWeight: '400',
    color: '#a78bfa',
    lineHeight: 18, // Added line height for better spacing
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
    lineHeight: 22,
    color: '#14171a',
    marginLeft: 20, // Moved further left (reduced from 40)
    marginBottom: 8, // Added padding between content and image
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginLeft: 20, // Moved further left (reduced from 40)
    marginRight: 8, // Reduced right margin
    paddingTop: 0, // Reduced from 4 to 0
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
    fontSize: 14, // Increased from 12
    color: '#657786',
    fontWeight: '500',
    marginLeft: 8, // Increased from 4
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  likedButton: {
    // Removed purple background - just keep the heart icon color change
  },
  disabledButton: {
    opacity: 0.5,
  },
  likeCountButton: {
    marginLeft: 8,
    paddingHorizontal: 4,
    paddingVertical: 2,
    minWidth: 24,
  },
  addReactionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
    width: 24,
    height: 24,
    flexShrink: 0,
    borderRadius: 6, // Smaller rounded square
    backgroundColor: '#f8f9ff',
    borderWidth: 1,
    borderColor: '#e1e8ff',
  },
  addReactionText: {
    fontSize: 14, // Slightly smaller and thinner
    color: '#7c3aed',
    fontWeight: '300', // Much thinner weight
    textAlign: 'center',
    lineHeight: 14, // Match fontSize for perfect centering
    includeFontPadding: false, // Remove extra padding on Android
    textAlignVertical: 'center', // Ensure vertical centering on Android
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
  },
  reactionCountText: {
    fontSize: 13,
    color: '#657786',
    marginLeft: 8,
    alignSelf: 'center',
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
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 16,
    padding: 20,
  },
});