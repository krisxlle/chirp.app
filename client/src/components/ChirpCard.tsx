import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '../components/AuthContext';
import ChirpImage from '../components/ChirpImage';
import ChirpLikesModal from '../components/ChirpLikesModal';
import ImageViewerModal from '../components/ImageViewerModal';
import UserAvatar from '../components/UserAvatar';
import HeartIcon from '../components/icons/HeartIcon';
import ShareIcon from '../components/icons/ShareIcon';
import SpeechBubbleIcon from '../components/icons/SpeechBubbleIcon';
import { apiRequest } from '../components/api';

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
          style={{ padding: '8px' }}
          onClick={(e) => {
            e.stopPropagation();
            console.log('🚀 More button touched!');
            // TODO: Implement more options modal
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
      
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginLeft: '20px', marginRight: '8px', paddingTop: '0', overflow: 'visible' }}>
        <div 
          style={{ display: 'flex', alignItems: 'center', marginRight: '8px', paddingTop: '3px', paddingBottom: '3px', paddingLeft: '3px', paddingRight: '3px', borderRadius: '4px', minWidth: '0', flexShrink: 1 }}
          onClick={(e) => {
            e.stopPropagation();
            // TODO: Implement reply functionality
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
    </div>
  );
}