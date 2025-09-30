import { formatDistanceToNow } from 'date-fns';
import {
    BellOff,
    Bot,
    Heart,
    Link as LinkIcon,
    MessageCircle,
    MoreHorizontal,
    Repeat2,
    Sparkles,
    Trash2,
    UserMinus,
    UserX
} from 'lucide-react';
import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '../components/AuthContext';
import { useToast } from '../hooks/use-toast';
import { apiRequest } from './api';
import ChirpImage from './ChirpImage';
import ChirpLikesModal from './ChirpLikesModal';
import ChirpPlusBadge from './ChirpPlusBadge';
import ImageViewerModal from './ImageViewerModal';
import MentionText from './MentionText';
import MoodReactions from './MoodReactions';
import { Button } from './ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Textarea } from './ui/textarea';
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
      <div className={`border-b border-gray-200 dark:border-gray-700 p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
        isHighlighted ? 'bg-yellow-50 dark:bg-yellow-900/20' : ''
      }`}>
        {/* Repost indicator */}
        {chirp.repostOf && (
          <div className="flex items-center space-x-2 mb-2 text-sm text-gray-500 dark:text-gray-400">
            <Repeat2 className="h-4 w-4" />
            <span>
              {chirp.author.firstName || chirp.author.customHandle || chirp.author.handle} reposted
            </span>
          </div>
        )}

        {/* Main chirp content */}
        <div className="flex space-x-3">
          {/* Avatar */}
          <div className="flex-shrink-0">
            {console.log('🔍 ChirpCard author data:', {
              id: chirp.author.id,
              firstName: chirp.author.firstName,
              lastName: chirp.author.lastName,
              profileImageUrl: chirp.author.profileImageUrl,
              avatarUrl: chirp.author.avatarUrl,
              hasImage: !!(chirp.author.profileImageUrl || chirp.author.avatarUrl)
            })}
            <UserAvatar 
              user={chirp.author} 
              size="md" 
              onPress={handleProfilePress}
            />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-center space-x-1 mb-1">
              <button
                onClick={handleProfilePress}
                className="font-semibold text-gray-900 dark:text-white hover:underline"
              >
                {chirp.author.firstName && chirp.author.lastName 
                  ? `${chirp.author.firstName} ${chirp.author.lastName}`
                  : chirp.author.customHandle || chirp.author.handle || chirp.author.email.split('@')[0]
                }
              </button>
              
              {chirp.author.isChirpPlus && chirp.author.showChirpPlusBadge && (
                <ChirpPlusBadge size={16} />
              )}
              
              <span className="text-gray-500 dark:text-gray-400">
                @{chirp.author.customHandle || chirp.author.handle || chirp.author.email.split('@')[0]}
              </span>
              
              <span className="text-gray-500 dark:text-gray-400">·</span>
              <span className="text-gray-500 dark:text-gray-400">
                {console.log('🕒 Timestamp data:', {
                  createdAt: chirp.createdAt,
                  type: typeof chirp.createdAt,
                  isValid: chirp.createdAt ? !isNaN(new Date(chirp.createdAt).getTime()) : false
                })}
                {chirp.createdAt ? formatDistanceToNow(new Date(chirp.createdAt), { addSuffix: true }) : 'now'}
              </span>

              {/* AI Generated indicator */}
              {chirp.isAiGenerated && (
                <div className="flex items-center space-x-1">
                  <Bot className="h-4 w-4 text-purple-600" />
                  <span className="text-xs text-purple-600 font-medium">AI</span>
                </div>
              )}

              {/* Weekly Summary indicator */}
              {chirp.isWeeklySummary && (
                <div className="flex items-center space-x-1">
                  <Sparkles className="h-4 w-4 text-blue-600" />
                  <span className="text-xs text-blue-600 font-medium">Weekly Summary</span>
                </div>
              )}

              {/* Thread indicator */}
              {chirp.threadId && (
                <div className="flex items-center space-x-1">
                  <LinkIcon className="h-4 w-4 text-gray-500" />
                  <span className="text-xs text-gray-500">Thread</span>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="mb-3">
              <MentionText 
                text={chirp.content} 
                onMentionPress={handleMentionPress}
              />
            </div>

            {/* Image */}
            {console.log('🖼️ ChirpCard image data:', {
              chirpId: chirp.id,
              imageUrl: chirp.imageUrl,
              imageAltText: chirp.imageAltText,
              imageWidth: chirp.imageWidth,
              imageHeight: chirp.imageHeight,
              hasImage: !!chirp.imageUrl
            })}
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
            <div className="flex items-center justify-between mt-3 max-w-md">
              {/* Reply */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowReplyModal(true)}
                className="text-gray-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20"
              >
                <MessageCircle className="h-4 w-4 mr-1" />
                <span className="text-sm">{chirp.replies}</span>
              </Button>

              {/* Repost */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRepost}
                disabled={isReposting}
                className={`text-gray-500 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 ${
                  chirp.isReposted ? 'text-green-500' : ''
                }`}
              >
                <Repeat2 className="h-4 w-4 mr-1" />
                <span className="text-sm">{chirp.reposts}</span>
              </Button>

              {/* Like */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLike}
                disabled={isLiking}
                className={`text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 ${
                  chirp.isLiked ? 'text-red-500' : ''
                }`}
              >
                <Heart className={`h-4 w-4 mr-1 ${chirp.isLiked ? 'fill-current' : ''}`} />
                <span className="text-sm">{chirp.likes}</span>
              </Button>

              {/* Share */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShare}
                className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Repeat2 className="h-4 w-4 -scale-x-100" />
              </Button>

              {/* More options */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {isOwnChirp ? (
                    <DropdownMenuItem
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="text-red-600 focus:text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  ) : (
                    <>
                      <DropdownMenuItem>
                        <UserMinus className="h-4 w-4 mr-2" />
                        Unfollow
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <BellOff className="h-4 w-4 mr-2" />
                        Mute
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600 focus:text-red-600">
                        <UserX className="h-4 w-4 mr-2" />
                        Block
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      {/* Reply Modal */}
      {showReplyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50">
          <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-t-lg">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <Button
                variant="ghost"
                onClick={() => setShowReplyModal(false)}
                className="text-purple-600"
              >
                Cancel
              </Button>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Reply</h2>
              <Button
                onClick={handleReply}
                disabled={!replyContent.trim() || isPostingReply}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                {isPostingReply ? 'Posting...' : 'Reply'}
              </Button>
            </div>
            <div className="p-4">
              <Textarea
                placeholder="Write your reply..."
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                className="min-h-[100px] resize-none"
                maxLength={280}
              />
              <div className="flex justify-between items-center mt-2">
                <span className="text-sm text-gray-500">
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