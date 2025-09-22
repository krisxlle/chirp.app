import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '../components/AuthContext';
import ChirpImage from '../components/ChirpImage';
import ChirpLikesModal from '../components/ChirpLikesModal';
import ImageViewerModal from '../components/ImageViewerModal';
import UserAvatar from '../components/UserAvatar';
import { apiRequest } from '../components/api';
import HeartIcon from '../components/icons/HeartIcon';
import ShareIcon from '../components/icons/ShareIcon';
import SpeechBubbleIcon from '../components/icons/SpeechBubbleIcon';

interface User {
  id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  customHandle?: string;
  handle?: string;
  profileImageUrl?: string;
  avatarUrl?: string;
  isChirpPlus?: boolean;
  showChirpPlusBadge?: boolean;
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
  // Replies list for Metro-style display
  repliesList?: Chirp[];
}

interface ChirpCardProps {
  chirp: Chirp;
  onDeleteSuccess?: (deletedChirpId?: string) => void;
  onProfilePress?: (userId: string) => void;
  onLikeUpdate?: (chirpId: string, newLikeCount: number) => void;
  onReplyPosted?: (chirpId: string) => void;
  isHighlighted?: boolean;
}

export default function ChirpCard({ 
  chirp, 
  onDeleteSuccess, 
  onProfilePress, 
  onLikeUpdate,
  onReplyPosted,
  isHighlighted = false 
}: ChirpCardProps) {
  // Safety check for author data
  if (!chirp || !chirp.author) {
    return null;
  }

  const { user } = useAuth();
  const [, setLocation] = useLocation();
  
  // Safety check for user - if user is not available, show a loading state
  if (!user) {
    console.log('ChirpCard: User not available, showing loading state');
    return (
      <div style={{
        marginTop: '3px',
        marginBottom: '3px',
        borderRadius: '16px',
        paddingLeft: '16px',
        paddingRight: '16px',
        paddingTop: '10px',
        paddingBottom: '10px',
        boxShadow: '0 2px 8px rgba(124, 58, 237, 0.08)',
        maxWidth: '600px',
        alignSelf: 'center',
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
        padding: '20px'
      }}>
        <span style={{ fontSize: '14px', color: '#657786' }}>Loading...</span>
      </div>
    );
  }
  
  // User available, rendering chirp
  const [likes, setLikes] = useState(chirp.reactionCount || 0);
  const [replies, setReplies] = useState(chirp.replyCount || 0);
  const [userHasLiked, setUserHasLiked] = useState(chirp.userHasLiked || false);
  const [showLikesModal, setShowLikesModal] = useState(false);
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  
  // Update local state when chirp data changes
  useEffect(() => {
    setLikes(chirp.reactionCount || 0);
    setReplies(chirp.replyCount || 0);
    setUserHasLiked(chirp.userHasLiked || false);
  }, [chirp.reactionCount, chirp.replyCount, chirp.userHasLiked]);

  // Calculate display name for the chirp author
  const displayName = chirp.author.firstName 
    ? chirp.author.firstName
    : (chirp.author.customHandle || chirp.author.handle || 'User');

  const handleLike = async () => {
    try {
      if (!user?.id) {
        alert('Sign in required', 'Please sign in to like chirps.');
        return;
      }

      // Check if chirp has a temporary ID (starts with 'temp_')
      if (String(chirp.id).startsWith('temp_')) {
        console.log('⚠️ Cannot like chirp with temporary ID:', chirp.id);
        alert('Please wait', 'This chirp is still being processed. Please wait a moment and try again.');
        return;
      }

      console.log('🔴 Like button pressed!');
      console.log('Chirp ID:', chirp.id, 'Type:', typeof chirp.id);
      console.log('User ID:', user.id, 'Type:', typeof user.id);
      console.log('Current likes:', likes);
      console.log('User has liked:', userHasLiked);

      // Ensure proper string conversion for database constraints
      const chirpIdStr = String(chirp.id);
      const userIdStr = String(user.id);
      
      if (userHasLiked) {
        // Unlike: Remove the reaction
        console.log('🔴 Unliking chirp...');
        
        const response = await apiRequest(`/api/chirps/${chirpIdStr}/unlike`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: userIdStr })
        });

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
        
        const response = await apiRequest(`/api/chirps/${chirpIdStr}/like`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: userIdStr })
        });

        // Update local state
        setLikes(prev => prev + 1);
        setUserHasLiked(true);
        
        // Notify parent component of the change
        if (onLikeUpdate) {
          onLikeUpdate(chirp.id, likes + 1);
        }
        
        console.log('✅ Like added successfully');
      }
    } catch (error) {
      console.error('❌ Error handling like:', error);
      alert('Error', 'Failed to like chirp. Please try again.');
    }
  };

  const handleLikesPress = () => {
    if (likes > 0) {
      setShowLikesModal(true);
    }
  };

  const handleReply = () => {
    setShowReplyInput(true);
  };

  const submitReply = async () => {
    if (!replyText.trim()) return;
    
    if (!user?.id) {
      alert('Sign in required', 'Please sign in to reply to chirps.');
      return;
    }

    try {
      const chirpIdStr = String(chirp.id);
      const userIdStr = String(user.id);
      
      console.log('Creating reply to chirp:', chirpIdStr, 'by user:', userIdStr);
      
      // Create reply via API
      const response = await apiRequest('/api/chirps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: replyText.trim(),
          author_id: userIdStr,
          reply_to_id: chirpIdStr
        })
      });

      if (response.success) {
        // Update local state
        setReplies(prev => prev + 1);
        setReplyText('');
        setShowReplyInput(false);
        
        // Notify parent component to refresh replies
        if (onReplyPosted) {
          onReplyPosted(chirpIdStr);
        }
        
        console.log('Reply posted successfully');
      } else {
        throw new Error(response.error || 'Failed to post reply');
      }
    } catch (error) {
      console.error('Error posting reply:', error);
      alert('Error', 'Failed to post reply. Please try again.');
    }
  };

  const handleShare = async () => {
    const chirpUrl = `https://joinchirp.org/chirp/${chirp.id}`;
    
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
        alert('Link Copied!', 'The chirp link has been copied to your clipboard.');
      } else {
        // Fallback for environments without clipboard API
        alert('Share Link', chirpUrl, [
          { text: 'OK', style: 'default' }
        ]);
      }
    } catch (error) {
      alert('Share Link', `Copy this link: ${chirpUrl}`, [
        { text: 'OK', style: 'default' }
      ]);
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
    if (!user?.id) {
      alert('Error', 'You must be signed in to delete chirps.');
      return;
    }

    try {
      const chirpIdStr = String(chirp.id);
      const userIdStr = String(user.id);
      
      console.log('🗑️ Deleting chirp:', chirpIdStr, 'by user:', userIdStr);
      
      const response = await apiRequest(`/api/chirps/${chirpIdStr}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userIdStr })
      });

      if (response.success) {
        console.log('✅ Chirp deleted successfully');
        
        // Notify parent component
        if (onDeleteSuccess) {
          onDeleteSuccess(chirpIdStr);
        }
      } else {
        throw new Error(response.error || 'Failed to delete chirp');
      }
    } catch (error) {
      console.error('Error deleting chirp:', error);
      alert('Error', 'Failed to delete chirp. Please try again.');
    }
  };

  const handleFollowToggle = async () => {
    if (!user?.id) {
      alert('Error', 'You must be signed in to follow users.');
      return;
    }

    try {
      const userIdStr = String(user.id);
      const targetUserId = String(chirp.author.id);
      
      console.log('👥 Toggling follow for user:', targetUserId, 'by user:', userIdStr);
      
      const endpoint = isFollowing ? 'unfollow' : 'follow';
      const response = await apiRequest(`/api/users/${targetUserId}/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userIdStr })
      });

      if (response.success) {
        setIsFollowing(!isFollowing);
        console.log(`✅ ${isFollowing ? 'Unfollowed' : 'Followed'} user successfully`);
      } else {
        throw new Error(response.error || `Failed to ${isFollowing ? 'unfollow' : 'follow'} user`);
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
      alert('Error', `Failed to ${isFollowing ? 'unfollow' : 'follow'} user. Please try again.`);
    }
  };

  const handleBlockToggle = async () => {
    if (!user?.id) {
      alert('Error', 'You must be signed in to block users.');
      return;
    }

    try {
      const userIdStr = String(user.id);
      const targetUserId = String(chirp.author.id);
      
      console.log('🚫 Toggling block for user:', targetUserId, 'by user:', userIdStr);
      
      const endpoint = isBlocked ? 'unblock' : 'block';
      const response = await apiRequest(`/api/users/${targetUserId}/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userIdStr })
      });

      if (response.success) {
        setIsBlocked(!isBlocked);
        console.log(`✅ ${isBlocked ? 'Unblocked' : 'Blocked'} user successfully`);
      } else {
        throw new Error(response.error || `Failed to ${isBlocked ? 'unblock' : 'block'} user`);
      }
    } catch (error) {
      console.error('Error toggling block:', error);
      alert('Error', `Failed to ${isBlocked ? 'unblock' : 'block'} user. Please try again.`);
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

  const handleChirpPress = async () => {
    console.log('🔍 ChirpCard: Chirp tapped, navigating to ChirpScreen for ID:', chirp.id);
    // Navigate to thread view
    setLocation(`/chirp/${chirp.id}`);
  };

  return (
    <div 
      style={{
        backgroundColor: '#ffffff',
        marginTop: '3px',
        marginBottom: '3px',
        borderRadius: '16px',
        paddingLeft: '16px',
        paddingRight: '16px',
        paddingTop: '10px',
        paddingBottom: '10px',
        boxShadow: '0 2px 8px rgba(124, 58, 237, 0.08)',
        maxWidth: '600px',
        alignSelf: 'center',
        width: '100%',
        cursor: 'pointer',
        transition: 'background-color 0.2s'
      }}
      onClick={handleChirpPress}
    >
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2px' }}>
        <div onClick={(e) => { e.stopPropagation(); handleAvatarPress(); }} style={{ marginLeft: '0' }}>
          <UserAvatar user={chirp.author} size="md" showFrame={true} />
        </div>
        <div style={{ flex: 1, marginLeft: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div onClick={(e) => { e.stopPropagation(); handleAvatarPress(); }} style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ fontSize: '15px', fontWeight: '600', color: '#14171a', lineHeight: '20px' }}>{displayName}</span>
            </div>
            <span style={{ fontSize: '14px', color: '#657786', marginLeft: '8px' }}>{formatDate(chirp.createdAt)}</span>
          </div>
          
          {/* Show handle under the display name */}
          <div onClick={(e) => { e.stopPropagation(); handleAvatarPress(); }} style={{ marginTop: '2px' }}>
            <span style={{ fontSize: '13px', fontWeight: '400', color: '#a78bfa', lineHeight: '18px' }}>
              @{chirp.author?.customHandle || chirp.author?.handle || 'user'}
            </span>
          </div>
        </div>
        
        <div 
          style={{ padding: '8px', cursor: 'pointer' }}
          onClick={(e) => {
            e.stopPropagation();
            console.log('🚀 More button touched!');
            handleMoreOptions();
          }}
        >
          <span style={{ fontSize: '16px', color: '#657786', transform: 'rotate(90deg)', display: 'inline-block' }}>⋯</span>
        </div>
      </div>

      {chirp.content.trim() && (
        <div style={{ fontSize: '15px', lineHeight: '22px', color: '#14171a', marginLeft: '20px', marginBottom: '8px' }}>
          {chirp.content.split(/(@\w+|#\w+|\*\*[^*]+\*\*)/).filter(part => part.trim()).map((part, index) => {
            if (part.startsWith('@')) {
              return (
                <span 
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    alert('Mention Navigation', `Navigate to ${part}'s profile`);
                    // TODO: Implement notification to mentioned user
                  }}
                  style={{ color: '#7c3aed', fontSize: '15px', cursor: 'pointer' }}
                >
                  {part}
                </span>
              );
            } else if (part.startsWith('#')) {
              return (
                <span 
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    const cleanHashtag = part.replace('#', '');
                    setLocation(`/hashtag/${cleanHashtag}`);
                  }}
                  style={{ color: '#7c3aed', cursor: 'pointer' }}
                >
                  {part}
                </span>
              );
            } else if (part.startsWith('**') && part.endsWith('**')) {
              // Bold text formatting
              const boldText = part.slice(2, -2);
              return <span key={index} style={{ fontWeight: '700', color: '#14171a' }}>{boldText}</span>;
            }
            return <span key={index}>{part}</span>;
          })}
        </div>
      )}

      {/* Debug logging for chirp image data */}
      {console.log('🖼️ ChirpCard image data:', {
        chirpId: chirp.id,
        hasImageUrl: !!chirp.imageUrl,
        imageUrl: chirp.imageUrl?.substring(0, 50) + '...',
        imageAltText: chirp.imageAltText,
        imageWidth: chirp.imageWidth,
        imageHeight: chirp.imageHeight
      })}

      {/* Display chirp image if available */}
      {chirp.imageUrl && (
        <div style={{
          marginTop: '4px',
          marginBottom: '12px',
          marginLeft: '20px',
          marginRight: '20px',
          borderRadius: '12px',
          overflow: 'hidden',
          backgroundColor: '#ffffff',
          alignItems: 'center',
          justifyContent: 'center',
          width: '90%'
        }}>
          <ChirpImage
            imageUrl={chirp.imageUrl}
            imageAltText={chirp.imageAltText || chirp.content || 'Chirp image'}
            imageWidth={chirp.imageWidth}
            imageHeight={chirp.imageHeight}
            maxWidth={400}
            maxHeight={300}
            onImagePress={() => {
              console.log('Image pressed:', chirp.imageUrl?.substring(0, 50) + '...');
              setShowImageViewer(true);
            }}
          />
        </div>
      )}

      {/* Reply Input */}
      {showReplyInput && (
        <div style={{
          marginTop: '12px',
          marginLeft: '20px',
          marginRight: '8px',
          padding: '12px',
          backgroundColor: '#f8f9fa',
          borderRadius: '12px',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
            <UserAvatar 
              userId={user.id}
              profileImageUrl={user.profileImageUrl}
              avatarUrl={user.avatarUrl}
              size={32}
            />
            <div style={{ flex: 1 }}>
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write a reply..."
                style={{
                  width: '100%',
                  minHeight: '60px',
                  padding: '8px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                  outline: 'none'
                }}
                autoFocus
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
                <button
                  onClick={() => {
                    setShowReplyInput(false);
                    setReplyText('');
                  }}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: 'transparent',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    color: '#657786',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={submitReply}
                  disabled={!replyText.trim()}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: replyText.trim() ? '#7c3aed' : '#d1d5db',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    color: replyText.trim() ? '#ffffff' : '#9ca3af',
                    cursor: replyText.trim() ? 'pointer' : 'not-allowed'
                  }}
                >
                  Reply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginLeft: '20px', marginRight: '8px', paddingTop: '0', overflow: 'visible' }}>
        <div 
          style={{ display: 'flex', alignItems: 'center', marginRight: '8px', paddingTop: '3px', paddingBottom: '3px', paddingLeft: '3px', paddingRight: '3px', borderRadius: '4px', minWidth: '0', flexShrink: 1, cursor: 'pointer' }}
          onClick={(e) => {
            e.stopPropagation();
            handleReply();
          }}
        >
          <SpeechBubbleIcon size={18} color="#657786" />
          <span style={{ fontSize: '14px', color: '#657786', fontWeight: '500', marginLeft: '8px' }}>{replies}</span>
        </div>

        <div 
          style={{ display: 'flex', alignItems: 'center', marginRight: '8px', paddingLeft: '8px', paddingRight: '8px', paddingTop: '4px', paddingBottom: '4px', borderRadius: '12px' }}
          onClick={(e) => {
            e.stopPropagation();
            handleLike();
          }}
        >
          <HeartIcon 
            size={18} 
            color={userHasLiked ? "#7c3aed" : "#657786"}
            filled={userHasLiked}
          />
          <div 
            onClick={(e) => {
              e.stopPropagation();
              handleLikesPress();
            }}
            style={{ marginLeft: '8px', paddingLeft: '4px', paddingRight: '4px', paddingTop: '2px', paddingBottom: '2px', minWidth: '24px' }}
          >
            <span style={{ fontSize: '14px', color: userHasLiked ? "#7c3aed" : '#657786', fontWeight: '500' }}>
              {likes}
            </span>
          </div>
        </div>

        <div style={{ flexShrink: 0 }}>
          <div 
            style={{ display: 'flex', alignItems: 'center', marginLeft: '0' }}
            onClick={(e) => {
              e.stopPropagation();
              handleShare();
            }}
          >
            <ShareIcon size={18} color="#657786" />
          </div>
        </div>
      </div>

      {/* Display replies in Metro-style nested format */}
      {chirp.repliesList && chirp.repliesList.length > 0 && (
        <div style={{
          marginTop: '8px',
          marginLeft: '20px',
          borderLeft: '2px solid #e5e7eb',
          paddingLeft: '12px'
        }}>
          {chirp.repliesList.map((reply, index) => (
            <div key={reply.id} style={{
              marginBottom: index < chirp.repliesList.length - 1 ? '8px' : '0',
              paddingBottom: index < chirp.repliesList.length - 1 ? '8px' : '0',
              borderBottom: index < chirp.repliesList.length - 1 ? '1px solid #f3f4f6' : 'none'
            }}>
              <ChirpCard 
                chirp={reply} 
                onProfilePress={onProfilePress}
                onLikeUpdate={onLikeUpdate}
                onReplyPosted={onReplyPosted}
              />
            </div>
          ))}
        </div>
      )}
      
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

      {/* Options Modal */}
      {showOptionsModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}
        onClick={() => setShowOptionsModal(false)}
        >
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '20px',
            minWidth: '280px',
            maxWidth: '320px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)'
          }}
          onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#14171a',
              marginBottom: '16px',
              textAlign: 'center'
            }}>
              {String(user?.id || '') === String(chirp.author.id || '') ? 'Chirp Options' : 'User Options'}
            </h3>
            
            {String(user?.id || '') === String(chirp.author.id || '') ? (
              // Own chirp options - only Delete and Cancel
              <>
                <button
                  onClick={() => {
                    console.log('🗑️ Delete button pressed in modal');
                    setShowOptionsModal(false);
                    handleDeleteChirp();
                  }}
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: '#dc2626',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    marginBottom: '12px'
                  }}
                >
                  Delete Chirp
                </button>
              </>
            ) : (
              // Other user options
              <>
                <button
                  onClick={() => {
                    setShowOptionsModal(false);
                    handleFollowToggle();
                  }}
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: '#7c3aed',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    marginBottom: '12px'
                  }}
                >
                  {isFollowing ? `Unfollow ${displayName}` : `Follow ${displayName}`}
                </button>
                
                <button
                  onClick={() => {
                    setShowOptionsModal(false);
                    handleBlockToggle();
                  }}
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: '#dc2626',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    marginBottom: '12px'
                  }}
                >
                  {isBlocked ? `Unblock ${displayName}` : `Block ${displayName}`}
                </button>
              </>
            )}
            
            <button
              onClick={() => setShowOptionsModal(false)}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: 'transparent',
                color: '#657786',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}