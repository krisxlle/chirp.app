import { formatDistanceToNow } from 'date-fns';
import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '../components/AuthContext';
import ChirpImage from '../components/ChirpImage';
import ChirpLikesModal from '../components/ChirpLikesModal';
import ChirpPlusBadge from '../components/ChirpPlusBadge';
import ImageViewerModal from '../components/ImageViewerModal';
import MentionText from '../components/MentionText';
import MoodReactions from '../components/MoodReactions';
import UserAvatar from '../components/UserAvatar';
import { apiRequest } from '../components/api';
import { useToast } from '../hooks/use-toast';

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
  author: User;
  likes: number;
  replies: number;
  reposts: number;
  isLiked: boolean;
  isReposted: boolean;
  reactionCounts: Record<string, number>;
  userReaction?: string | null;
  repostOf?: {
    id: string;
    content: string;
    author: User;
    createdAt: string;
  } | null;
  isAiGenerated?: boolean;
  isWeeklySummary?: boolean;
  threadId?: string | null;
  threadOrder?: number | null;
  isThreadStarter?: boolean;
  imageUrl?: string | null;
  imageAltText?: string | null;
  imageWidth?: number | null;
  imageHeight?: number | null;
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
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  const [showLikesModal, setShowLikesModal] = useState(false);
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [isPostingReply, setIsPostingReply] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [isReposting, setIsReposting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  console.log('🔍 WEB ChirpCard render - ID:', chirp.id, 'author:', chirp.author.customHandle || chirp.author.handle);

  const handleLike = async () => {
    if (isLiking) return;
    
    setIsLiking(true);
    try {
      const response = await apiRequest(`/api/chirps/${chirp.id}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      onLikeUpdate?.(chirp.id, response.likeCount);
      
      toast({
        title: chirp.isLiked ? "Unliked" : "Liked",
        description: chirp.isLiked ? "Removed like from chirp" : "Added like to chirp",
      });
    } catch (error) {
      console.error('Error liking chirp:', error);
      toast({
        title: "Error",
        description: "Failed to like chirp",
        variant: "destructive",
      });
    } finally {
      setIsLiking(false);
    }
  };

  const handleRepost = async () => {
    if (isReposting) return;
    
    setIsReposting(true);
    try {
      await apiRequest(`/api/chirps/${chirp.id}/repost`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      toast({
        title: "Reposted",
        description: "Chirp has been reposted",
      });
    } catch (error) {
      console.error('Error reposting chirp:', error);
      toast({
        title: "Error",
        description: "Failed to repost chirp",
        variant: "destructive",
      });
    } finally {
      setIsReposting(false);
    }
  };

  const handleDelete = async () => {
    if (isDeleting) return;
    
    setIsDeleting(true);
    try {
      await apiRequest(`/api/chirps/${chirp.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });
      
      onDeleteSuccess?.(chirp.id);
      
      toast({
        title: "Deleted",
        description: "Chirp has been deleted",
      });
    } catch (error) {
      console.error('Error deleting chirp:', error);
      toast({
        title: "Error",
        description: "Failed to delete chirp",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleReply = async () => {
    if (!replyContent.trim() || isPostingReply) return;
    
    setIsPostingReply(true);
    try {
      await apiRequest('/api/chirps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: replyContent.trim(),
          replyToId: chirp.id
        })
      });
      
      setReplyContent('');
      setShowReplyModal(false);
      onReplyPosted?.(chirp.id);
      
      toast({
        title: "Replied",
        description: "Your reply has been posted",
      });
    } catch (error) {
      console.error('Error posting reply:', error);
      toast({
        title: "Error",
        description: "Failed to post reply",
        variant: "destructive",
      });
    } finally {
      setIsPostingReply(false);
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Chirp',
          text: chirp.content,
          url: window.location.origin + `/chirp/${chirp.id}`
        });
      } else {
        await navigator.clipboard.writeText(window.location.origin + `/chirp/${chirp.id}`);
        toast({
          title: "Copied",
          description: "Link copied to clipboard",
        });
      }
    } catch (error) {
      console.error('Error sharing chirp:', error);
    }
  };

  const handleProfilePress = () => {
    if (onProfilePress) {
      onProfilePress(chirp.author.id);
    } else {
      setLocation(`/profile/${chirp.author.id}`);
    }
  };

  const handleMentionPress = (handle: string) => {
    setLocation(`/profile/${handle}`);
  };

  const isOwnChirp = currentUser?.id === chirp.author.id;

  return (
    <>
      <div style={{
        borderBottom: '1px solid #e5e7eb',
        padding: '16px',
        backgroundColor: isHighlighted ? '#fef3c7' : 'transparent',
        transition: 'background-color 0.2s'
      }}>
        {/* Repost indicator */}
        {chirp.repostOf && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '8px',
            fontSize: '14px',
            color: '#6b7280'
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>
              {chirp.author.firstName || chirp.author.customHandle || chirp.author.handle} reposted
            </span>
          </div>
        )}

        {/* Main chirp content */}
        <div style={{ display: 'flex', gap: '12px' }}>
          {/* Avatar */}
          <div style={{ flexShrink: 0 }}>
            <UserAvatar 
              user={chirp.author} 
              size="md" 
              onPress={handleProfilePress}
            />
          </div>

          {/* Content */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '4px',
              flexWrap: 'wrap'
            }}>
              <button
                onClick={handleProfilePress}
                style={{
                  fontWeight: '600',
                  color: '#111827',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  textDecoration: 'none'
                }}
                onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
              >
                {chirp.author.firstName && chirp.author.lastName 
                  ? `${chirp.author.firstName} ${chirp.author.lastName}`
                  : chirp.author.customHandle || chirp.author.handle || chirp.author.email.split('@')[0]
                }
              </button>
              
              {chirp.author.isChirpPlus && chirp.author.showChirpPlusBadge && (
                <ChirpPlusBadge size={16} />
              )}
              
              <span style={{ color: '#6b7280' }}>
                @{chirp.author.customHandle || chirp.author.handle || chirp.author.email.split('@')[0]}
              </span>
              
              <span style={{ color: '#6b7280' }}>·</span>
              <span style={{ color: '#6b7280' }}>
                {formatDistanceToNow(new Date(chirp.createdAt), { addSuffix: true })}
              </span>

              {/* AI Generated indicator */}
              {chirp.isAiGenerated && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7v1a7 7 0 0 1-7 7H10a7 7 0 0 1-7-7v-1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M8 12h.01M16 12h.01" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M9 16s1 1 3 1 3-1 3-1" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span style={{ fontSize: '12px', color: '#7c3aed', fontWeight: '500' }}>AI</span>
                </div>
              )}

              {/* Weekly Summary indicator */}
              {chirp.isWeeklySummary && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .962 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.582a.5.5 0 0 1 0 .962L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.962 0z" fill="#3b82f6"/>
                    <path d="M20 3v4M22 5h-4M6 16v2M7 17H5" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  <span style={{ fontSize: '12px', color: '#3b82f6', fontWeight: '500' }}>Weekly Summary</span>
                </div>
              )}

              {/* Thread indicator */}
              {chirp.threadId && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span style={{ fontSize: '12px', color: '#6b7280' }}>Thread</span>
                </div>
              )}
            </div>

            {/* Content */}
            <div style={{ marginBottom: '12px' }}>
              <MentionText 
                text={chirp.content} 
                onMentionPress={handleMentionPress}
              />
            </div>

            {/* Image */}
            {chirp.imageUrl && (
              <ChirpImage
                imageUrl={chirp.imageUrl}
                imageAltText={chirp.imageAltText}
                imageWidth={chirp.imageWidth}
                imageHeight={chirp.imageHeight}
                onImagePress={() => setShowImageViewer(true)}
              />
            )}

            {/* Mood Reactions */}
            <MoodReactions
              chirpId={chirp.id}
              reactionCounts={chirp.reactionCounts}
              userReaction={chirp.userReaction}
            />

            {/* Actions */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: '12px',
              maxWidth: '400px'
            }}>
              {/* Reply */}
              <button
                onClick={() => setShowReplyModal(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '8px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  borderRadius: '8px',
                  color: '#6b7280',
                  fontSize: '14px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#dbeafe';
                  e.currentTarget.style.color = '#3b82f6';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#6b7280';
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>{chirp.replies}</span>
              </button>

              {/* Repost */}
              <button
                onClick={handleRepost}
                disabled={isReposting}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '8px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: isReposting ? 'not-allowed' : 'pointer',
                  borderRadius: '8px',
                  color: chirp.isReposted ? '#10b981' : '#6b7280',
                  fontSize: '14px',
                  opacity: isReposting ? 0.5 : 1
                }}
                onMouseEnter={(e) => {
                  if (!isReposting) {
                    e.currentTarget.style.backgroundColor = '#d1fae5';
                    e.currentTarget.style.color = '#10b981';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isReposting) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = chirp.isReposted ? '#10b981' : '#6b7280';
                  }
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>{chirp.reposts}</span>
              </button>

              {/* Like */}
              <button
                onClick={handleLike}
                disabled={isLiking}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '8px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: isLiking ? 'not-allowed' : 'pointer',
                  borderRadius: '8px',
                  color: chirp.isLiked ? '#ef4444' : '#6b7280',
                  fontSize: '14px',
                  opacity: isLiking ? 0.5 : 1
                }}
                onMouseEnter={(e) => {
                  if (!isLiking) {
                    e.currentTarget.style.backgroundColor = '#fee2e2';
                    e.currentTarget.style.color = '#ef4444';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isLiking) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = chirp.isLiked ? '#ef4444' : '#6b7280';
                  }
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill={chirp.isLiked ? 'currentColor' : 'none'}>
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>{chirp.likes}</span>
              </button>

              {/* Share */}
              <button
                onClick={handleShare}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '8px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  borderRadius: '8px',
                  color: '#6b7280',
                  fontSize: '14px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f3f4f6';
                  e.currentTarget.style.color = '#374151';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#6b7280';
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <polyline points="16,6 12,2 8,6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="12" y1="2" x2="12" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>

              {/* More options */}
              <div style={{ position: 'relative' }}>
                <button
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '8px',
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    borderRadius: '8px',
                    color: '#6b7280',
                    fontSize: '14px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f3f4f6';
                    e.currentTarget.style.color = '#374151';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#6b7280';
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="1" fill="currentColor"/>
                    <circle cx="19" cy="12" r="1" fill="currentColor"/>
                    <circle cx="5" cy="12" r="1" fill="currentColor"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reply Modal */}
      {showReplyModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'end',
          justifyContent: 'center',
          zIndex: 50
        }}>
          <div style={{
            backgroundColor: 'white',
            width: '100%',
            maxWidth: '400px',
            borderTopLeftRadius: '12px',
            borderTopRightRadius: '12px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px',
              borderBottom: '1px solid #e5e7eb'
            }}>
              <button
                style={{
                  color: '#7c3aed',
                  fontWeight: '600',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '8px 12px'
                }}
                onClick={() => setShowReplyModal(false)}
              >
                Cancel
              </button>
              <h2 style={{ 
                fontSize: '18px', 
                fontWeight: 'bold', 
                color: '#111827' 
              }}>
                Reply
              </h2>
              <button
                onClick={handleReply}
                disabled={!replyContent.trim() || isPostingReply}
                style={{
                  backgroundColor: (!replyContent.trim() || isPostingReply) ? '#9ca3af' : '#7c3aed',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  cursor: (!replyContent.trim() || isPostingReply) ? 'not-allowed' : 'pointer',
                  fontWeight: '600'
                }}
              >
                {isPostingReply ? 'Posting...' : 'Reply'}
              </button>
            </div>
            <div style={{ padding: '16px' }}>
              <textarea
                placeholder="Write your reply..."
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                style={{
                  width: '100%',
                  minHeight: '100px',
                  resize: 'none',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  padding: '12px',
                  fontSize: '16px',
                  outline: 'none',
                  fontFamily: 'inherit'
                }}
                maxLength={280}
              />
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: '8px'
              }}>
                <span style={{ fontSize: '14px', color: '#6b7280' }}>
                  {280 - replyContent.length} characters remaining
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Likes Modal */}
      <ChirpLikesModal
        visible={showLikesModal}
        chirpId={chirp.id}
        likes={[]} // TODO: Fetch actual likes
        onClose={() => setShowLikesModal(false)}
      />

      {/* Image Viewer Modal */}
      <ImageViewerModal
        visible={showImageViewer}
        imageUrl={chirp.imageUrl || ''}
        imageAltText={chirp.imageAltText}
        onClose={() => setShowImageViewer(false)}
      />
    </>
  );
}