import BrandIcon from "./BrandIcon";
import ChirpPlusBadge from "./ChirpPlusBadge";
import MentionText from "./MentionText";
import MoodReactions from "./MoodReactions";
import { Button } from "./ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Textarea } from "./ui/textarea";
import UserAvatar from "./UserAvatar";
import { useToast } from "./hooks/use-toast";
import { useAuth } from "./hooks/useAuth";
import { apiRequest } from "./api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import html2canvas from 'html2canvas';
import { Bell, BellOff, Bot, Image, Link, MessageCircle, MoreHorizontal, Repeat2, Share, Sparkles, Trash2, UserMinus, UserPlus, UserX } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";

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
    repostOf?: {
      id: number;
      content: string;
      createdAt: string;
      isAiGenerated?: boolean;
      isWeeklySummary?: boolean;
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
    };
    parentChirp?: {
      id: number;
      content: string;
      createdAt: string;
      isAiGenerated?: boolean;
      isWeeklySummary?: boolean;
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
    };
  };
}

export default function ChirpCard({ chirp }: ChirpCardProps) {
  // Debug: Log if web client ChirpCard is being used in mobile app
  console.log(`🔍 WEB ChirpCard render - ID: ${chirp.id}, author: ${chirp.author.customHandle || chirp.author.handle}`);
  
  const [, setLocation] = useLocation();
  const [showReplies, setShowReplies] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [showReplyBox, setShowReplyBox] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Determine if this is a repost and what content to display
  const isRepost = !!chirp.repostOf;
  const displayChirp = isRepost ? chirp.repostOf! : chirp;
  const repostUser = isRepost ? chirp.author : null;
  const originalAuthor = displayChirp.author;

  // Create display name, prioritize firstName/lastName, then customHandle, then handle (never email)
  const displayName = `${originalAuthor.firstName || ''} ${originalAuthor.lastName || ''}`.trim() 
    || originalAuthor.customHandle || originalAuthor.handle || `User ${originalAuthor.id}`;

  const totalReactions = Object.values(chirp.reactionCounts).reduce((sum, count) => sum + count, 0);



  // Fetch replies when showReplies is true
  const { data: replies = [], isLoading: repliesLoading } = useQuery({
    queryKey: [`/api/chirps/${chirp.id}/replies`],
    enabled: showReplies,
  });

  // Check if user has reposted this chirp
  const { data: repostStatus } = useQuery({
    queryKey: [`/api/chirps/${chirp.repostOf?.id || chirp.id}/reposted`],
    enabled: !!user,
  });

  // Create reply mutation
  const createReplyMutation = useMutation({
    mutationFn: async (content: string) => {
      return await apiRequest("/api/chirps", {
        method: "POST",
        body: JSON.stringify({
          content,
          replyToId: chirp.id,
        }),
        headers: { "Content-Type": "application/json" },
      });
    },
    onSuccess: () => {
      toast({
        title: "Reply posted!",
        description: "Your reply has been posted successfully.",
      });
      setReplyContent("");
      setShowReplyBox(false);
      // Invalidate the replies query to refresh
      queryClient.invalidateQueries({ queryKey: [`/api/chirps/${chirp.id}/replies`] });
      // Also invalidate chirps to update reply counts
      queryClient.invalidateQueries({ queryKey: ["/api/chirps"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "Failed to post reply",
        variant: "destructive",
      });
    },
  });

  const handleUserClick = () => {
    setLocation(`/profile/${chirp.author.id}`);
  };

  const handleChirpClick = () => {
    setShowReplies(!showReplies);
  };

  const handleReply = (chirpId: number) => {
    setShowReplyBox(!showReplyBox);
  };

  const handleSubmitReply = () => {
    if (replyContent.trim() && replyContent.length <= 280) {
      createReplyMutation.mutate(replyContent.trim());
    }
  };

  // Create repost mutation
  const repostMutation = useMutation({
    mutationFn: async () => {
      const targetId = chirp.repostOf?.id || chirp.id;
      if (repostStatus?.reposted) {
        return await apiRequest(`/api/chirps/${targetId}/repost`, {
          method: "DELETE",
        });
      } else {
        return await apiRequest(`/api/chirps/${targetId}/repost`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });
      }
    },
    onSuccess: () => {
      toast({
        title: repostStatus?.reposted ? "Unreposted" : "Reposted!",
        description: repostStatus?.reposted 
          ? "Removed from your timeline" 
          : "Added to your timeline",
      });
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/chirps"] });
      queryClient.invalidateQueries({ queryKey: [`/api/chirps/${chirp.repostOf?.id || chirp.id}/reposted`] });
      queryClient.invalidateQueries({ queryKey: [`/api/users/${user?.id}/chirps`] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Failed to ${repostStatus?.reposted ? 'undo' : 'create'} repost`,
        variant: "destructive",
      });
    },
  });

  const deleteChirpMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest(`/api/chirps/${chirp.id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      toast({
        title: "Deleted",
        description: "Chirp deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/chirps"] });
      queryClient.invalidateQueries({ queryKey: [`/api/users/${user?.id}/chirps`] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete chirp",
        variant: "destructive",
      });
    },
  });

  const handleRepost = (chirpId: number) => {
    createRepostMutation.mutate();
  };

  // Share functionality
  const handleShare = async () => {
    const shareText = `Check out this chirp by ${displayName}: "${displayChirp.content}"`;
    const shareUrl = `${window.location.origin}/chirp/${displayChirp.id}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Chirp Share',
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        // User cancelled or error occurred, fallback to clipboard
        handleCopyToClipboard(shareUrl);
      }
    } else {
      // Fallback to clipboard
      handleCopyToClipboard(shareUrl);
    }
  };

  const handleSaveAsImage = async () => {
    try {
      // Find the chirp card element
      const chirpElement = document.querySelector(`[data-chirp-id="${chirp.id}"]`) as HTMLElement;
      if (!chirpElement) {
        toast({
          title: "Error",
          description: "Could not find chirp to save",
          variant: "destructive",
        });
        return;
      }

      // Wait a moment for any pending renders
      await new Promise(resolve => setTimeout(resolve, 100));

      // Clone the element to avoid modifying the original
      const clonedElement = chirpElement.cloneNode(true) as HTMLElement;
      
      // Add some styling to ensure proper rendering
      clonedElement.style.position = 'absolute';
      clonedElement.style.left = '-9999px';
      clonedElement.style.top = '0';
      clonedElement.style.width = '400px'; // Fixed width for consistency
      clonedElement.style.minHeight = 'auto';
      clonedElement.style.background = 'white';
      clonedElement.style.padding = '20px';
      clonedElement.style.borderRadius = '12px';
      clonedElement.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
      clonedElement.style.overflow = 'visible';
      
      // Fix layout issues for image capture
      const avatars = clonedElement.querySelectorAll('img');
      avatars.forEach(avatar => {
        if (avatar.classList.contains('rounded-full')) {
          avatar.style.width = '48px';
          avatar.style.height = '48px';
          avatar.style.objectFit = 'cover';
        }
      });
      
      // Fix button alignment
      const buttonContainers = clonedElement.querySelectorAll('.chirp-actions');
      buttonContainers.forEach(container => {
        (container as HTMLElement).style.display = 'flex';
        (container as HTMLElement).style.alignItems = 'center';
        (container as HTMLElement).style.gap = '16px';
        (container as HTMLElement).style.marginTop = '12px';
      });
      
      // Ensure name and badge are visible
      const nameContainers = clonedElement.querySelectorAll('.flex.items-center.space-x-1');
      nameContainers.forEach(container => {
        (container as HTMLElement).style.minWidth = '0';
        (container as HTMLElement).style.overflow = 'visible';
      });
      
      // Fix mood reactions positioning
      const moodContainers = clonedElement.querySelectorAll('[class*="mood"]');
      moodContainers.forEach(container => {
        (container as HTMLElement).style.marginBottom = '8px';
        (container as HTMLElement).style.overflow = 'visible';
      });
      
      // Temporarily add to document
      document.body.appendChild(clonedElement);

      // Create canvas with better settings
      const canvas = await html2canvas(clonedElement, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        allowTaint: false,
        logging: false,
        removeContainer: false,
        imageTimeout: 15000,
        width: 440, // Fixed width including padding
        height: null, // Auto height
        onclone: (clonedDoc) => {
          // Ensure all fonts are loaded and fix styling
          const style = clonedDoc.createElement('style');
          style.textContent = `
            * { 
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
              color: inherit !important;
              box-sizing: border-box;
            }
            .chirp-actions {
              display: flex !important;
              align-items: center !important;
              justify-content: space-between !important;
              gap: 16px !important;
              margin-top: 12px !important;
              flex-wrap: nowrap !important;
            }
            img.rounded-full {
              width: 48px !important;
              height: 48px !important;
              object-fit: cover !important;
              border-radius: 50% !important;
            }
            .flex.items-center.space-x-1 {
              overflow: visible !important;
              min-width: 0 !important;
            }
          `;
          clonedDoc.head.appendChild(style);
        }
      });

      // Clean up the cloned element
      document.body.removeChild(clonedElement);

      // Convert canvas to blob
      canvas.toBlob(async (blob) => {
        if (blob) {
          const fileName = `chirp-${chirp.id}.png`;
          
          // Try to use Web Share API for mobile devices (saves to Photos)
          if (navigator.share && navigator.canShare) {
            try {
              const filesArray = [new File([blob], fileName, { type: 'image/png' })];
              
              if (navigator.canShare({ files: filesArray })) {
                await navigator.share({
                  title: `Chirp by ${displayName}`,
                  text: `Check out this chirp: "${displayChirp.content}"`,
                  files: filesArray,
                });
                
                toast({
                  title: "Image shared!",
                  description: "Chirp image ready to save to Photos",
                });
                return;
              }
            } catch (shareError) {
              console.log('Share API failed, falling back to download');
              // Fall through to download method
            }
          }
          
          // Fallback: Create download link for desktop/unsupported devices
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.download = fileName;
          link.href = url;
          link.click();
          
          // Clean up
          URL.revokeObjectURL(url);
          
          toast({
            title: "Image saved!",
            description: "Chirp saved as image (check your downloads or try the share menu to save to Photos)",
          });
        } else {
          toast({
            title: "Error",
            description: "Failed to save image",
            variant: "destructive",
          });
        }
      }, 'image/png');
    } catch (error) {
      console.error('Error saving chirp as image:', error);
      toast({
        title: "Error",
        description: "Failed to save image",
        variant: "destructive",
      });
    }
  };

  const handleCopyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: "Link copied!",
        description: "Chirp link copied to clipboard",
      });
    } catch (err) {
      toast({
        title: "Share",
        description: "Unable to copy link",
        variant: "destructive",
      });
    }
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this chirp?")) {
      deleteChirpMutation.mutate();
    }
  };

  // Check if current user can delete this chirp
  const canDelete = user?.id === originalAuthor.id;
  const isOtherUserChirp = user?.id !== originalAuthor.id;

  // Query to check if user is following the chirp author
  const { data: followStatus } = useQuery({
    queryKey: [`/api/users/${originalAuthor.id}/following`],
    enabled: isOtherUserChirp && !!user?.id,
  });

  // Query to check notification settings for this user
  const { data: notificationSetting } = useQuery({
    queryKey: [`/api/users/${originalAuthor.id}/notification-setting`],
    enabled: isOtherUserChirp && !!user?.id && followStatus?.following,
  });

  // Follow/unfollow mutation
  const followMutation = useMutation({
    mutationFn: async () => {
      const method = followStatus?.following ? "DELETE" : "POST";
      return await apiRequest(`/api/users/${originalAuthor.id}/follow`, { method });
    },
    onSuccess: () => {
      toast({
        title: followStatus?.following ? "Unfollowed" : "Following!",
        description: followStatus?.following 
          ? `You unfollowed ${displayName}` 
          : `You are now following ${displayName}`,
      });
      queryClient.invalidateQueries({ queryKey: [`/api/users/${originalAuthor.id}/following`] });
      queryClient.invalidateQueries({ queryKey: [`/api/users/${user?.id}/follow-counts`] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: `Failed to ${followStatus?.following ? 'unfollow' : 'follow'} user`,
        variant: "destructive",
      });
    },
  });

  // Block user mutation
  const blockMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest(`/api/users/${originalAuthor.id}/block`, { method: "POST" });
    },
    onSuccess: () => {
      toast({
        title: "User blocked",
        description: `You have blocked ${displayName}`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/chirps"] });
      queryClient.invalidateQueries({ queryKey: [`/api/users/${originalAuthor.id}/following`] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to block user",
        variant: "destructive",
      });
    },
  });

  // Notification setting mutation
  const notificationMutation = useMutation({
    mutationFn: async (notifyOnPost: boolean) => {
      return await apiRequest(`/api/users/${originalAuthor.id}/notification-setting`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notifyOnPost }),
      });
    },
    onSuccess: () => {
      const newSetting = !notificationSetting?.notifyOnPost;
      toast({
        title: newSetting ? "Notifications enabled" : "Notifications disabled",
        description: newSetting 
          ? `You'll get notified when ${displayName} posts` 
          : `You won't get notified when ${displayName} posts`,
      });
      queryClient.invalidateQueries({ queryKey: [`/api/users/${originalAuthor.id}/notification-setting`] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update notification setting",
        variant: "destructive",
      });
    },
  });

  // Special styling for weekly summary chirps
  const cardClassName = displayChirp.isWeeklySummary 
    ? "bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border-b border-purple-200 dark:border-purple-700 p-3 chirp-card ring-1 ring-purple-200 dark:ring-purple-700"
    : "bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-3 chirp-card";

  return (
    <article className={cardClassName} data-chirp-id={chirp.id}>
      {/* Repost indicator */}
      {isRepost && (
        <div className="flex items-center space-x-2 mb-3 text-gray-500 dark:text-gray-400">
          <Repeat2 className="h-4 w-4" />
          <span className="text-sm">
            <button 
              onClick={() => setLocation(`/profile/${repostUser!.id}`)}
              className="font-medium hover:underline flex items-center space-x-1 inline-flex"
            >
              <span>{`${repostUser!.firstName || ''} ${repostUser!.lastName || ''}`.trim() || repostUser!.customHandle || repostUser!.handle || `User ${repostUser!.id}`}</span>
              <ChirpPlusBadge 
                show={repostUser!.isChirpPlus && repostUser!.showChirpPlusBadge} 
                size="sm"
              />
            </button>
            {" "}reposted
          </span>
        </div>
      )}
      
      {/* Parent chirp preview for replies */}
      {chirp.parentChirp && (
        <div 
          className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg mb-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          onClick={() => setLocation(`/chirp/${chirp.parentChirp!.id}`)}
        >
          <div className="p-3">
            <div className="flex items-center space-x-2 mb-2">
              <UserAvatar user={chirp.parentChirp.author} size="sm" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {`${chirp.parentChirp.author.firstName || ''} ${chirp.parentChirp.author.lastName || ''}`.trim() || chirp.parentChirp.author.customHandle || chirp.parentChirp.author.handle || `User ${chirp.parentChirp.author.id}`}
              </span>
              <span className="text-xs text-gray-500">
                {formatDistanceToNow(new Date(chirp.parentChirp.createdAt), { addSuffix: true })}
              </span>
            </div>
            <MentionText 
              text={chirp.parentChirp.content}
              className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Tap to view thread</p>
          </div>
        </div>
      )}
      
      <div className="flex space-x-3">
        <button onClick={() => setLocation(`/profile/${originalAuthor.id}`)} className="flex-shrink-0">
          <UserAvatar user={originalAuthor} size="lg" />
        </button>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div className="flex flex-col min-w-0 flex-1 mr-2">
              <button 
                onClick={() => setLocation(`/profile/${originalAuthor.id}`)}
                className="font-semibold text-gray-900 dark:text-white hover:underline text-left truncate flex items-center space-x-1"
              >
                <span>{`${originalAuthor.firstName || ''} ${originalAuthor.lastName || ''}`.trim() || originalAuthor.customHandle || originalAuthor.handle || `User ${originalAuthor.id}`}</span>
                <ChirpPlusBadge 
                  show={originalAuthor.isChirpPlus && originalAuthor.showChirpPlusBadge} 
                  size="sm"
                />
              </button>
              
              <div className="flex items-center space-x-2 mt-1">
                {displayChirp.threadId && (
                  <div className="flex items-center space-x-1">
                    <Sparkles className="h-3 w-3 text-purple-500" />
                    <span className="bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 text-xs px-2 py-0.5 rounded-full font-medium">
                      {displayChirp.isThreadStarter ? 'Thread' : `${displayChirp.threadOrder! + 1}`}
                    </span>
                  </div>
                )}
                
                {displayChirp.isWeeklySummary && (
                  <div className="flex items-center space-x-1">
                    <Sparkles className="h-3 w-3 text-purple-500" />
                    <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                      Weekly Summary
                    </span>
                  </div>
                )}
                
                {displayChirp.isAiGenerated && !displayChirp.isWeeklySummary && (
                  <div className="flex items-center space-x-1">
                    <BrandIcon icon={Bot} variant="primary" size="sm" />
                    <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                      AI
                    </span>
                  </div>
                )}
                
                <span className="text-gray-500 dark:text-gray-400 text-xs">
                  {formatDistanceToNow(new Date(displayChirp.createdAt), { addSuffix: true })}
                </span>
              </div>
            </div>
            
            {/* Triple dot menu - only show if there are options to display */}
            {(canDelete || isOtherUserChirp) && (
              <div className="flex-shrink-0">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {/* Options for user's own chirps */}
                  {canDelete && (
                    <DropdownMenuItem
                      onClick={handleDelete}
                      className="text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
                      disabled={deleteChirpMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete chirp
                    </DropdownMenuItem>
                  )}
                  
                  {/* Options for other users' chirps */}
                  {isOtherUserChirp && (
                    <>
                      <DropdownMenuItem
                        onClick={() => followMutation.mutate()}
                        disabled={followMutation.isPending}
                      >
                        {followStatus?.following ? (
                          <>
                            <UserMinus className="h-4 w-4 mr-2" />
                            Unfollow {displayName}
                          </>
                        ) : (
                          <>
                            <UserPlus className="h-4 w-4 mr-2" />
                            Follow {displayName}
                          </>
                        )}
                      </DropdownMenuItem>
                      
                      {followStatus?.following && (
                        <DropdownMenuItem
                          onClick={() => notificationMutation.mutate(!notificationSetting?.notifyOnPost)}
                          disabled={notificationMutation.isPending}
                        >
                          {notificationSetting?.notifyOnPost ? (
                            <>
                              <BellOff className="h-4 w-4 mr-2" />
                              Turn off post notifications
                            </>
                          ) : (
                            <>
                              <Bell className="h-4 w-4 mr-2" />
                              Turn on post notifications
                            </>
                          )}
                        </DropdownMenuItem>
                      )}
                      
                      <DropdownMenuItem
                        onClick={() => blockMutation.mutate()}
                        className="text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
                        disabled={blockMutation.isPending}
                      >
                        <UserX className="h-4 w-4 mr-2" />
                        Block {displayName}
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
          
          <div 
            className="cursor-pointer -mx-2 px-2 py-1 rounded"
            onClick={handleChirpClick}
          >
            <MentionText 
              text={displayChirp.content}
              className="text-gray-900 dark:text-gray-100 leading-relaxed mb-2 whitespace-pre-wrap break-words block"
            />
          </div>
          
          <div className="flex items-center justify-between min-h-[32px] w-full chirp-actions">
            <div className="flex items-center space-x-0.5 flex-1 min-w-0 overflow-hidden">
              <Button variant="ghost" size="sm" className="flex items-center space-x-1 text-gray-500 dark:text-gray-400 hover:text-purple-600 px-1.5 py-1 h-8 text-xs flex-shrink-0" onClick={() => handleReply(chirp.id)}>
                <MessageCircle className="h-3 w-3" />
                <span className="hidden sm:inline text-xs">Reply</span>
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm" 
                className={`flex items-center space-x-1 hover:text-green-600 px-1.5 py-1 h-8 text-xs flex-shrink-0 ${
                  repostStatus?.reposted 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-gray-500 dark:text-gray-400'
                }`}
                onClick={() => repostMutation.mutate()}
                disabled={repostMutation.isPending}
              >
                <Repeat2 className="h-3 w-3" />
                <span className="hidden sm:inline text-xs">
                  {repostStatus?.reposted ? 'Unrepost' : 'Repost'}
                </span>
              </Button>
              
              <div className="flex items-center h-8 flex-1 min-w-0 overflow-hidden">
                <MoodReactions 
                  chirpId={chirp.id}
                  reactionCounts={chirp.reactionCounts}
                  userReaction={chirp.userReaction}
                />
              </div>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 px-1.5 py-1 h-8 flex-shrink-0 ml-1"
                >
                  <Share className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleShare} className="flex items-center space-x-2">
                  <Link className="h-4 w-4" />
                  <span>Share link</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSaveAsImage} className="flex items-center space-x-2">
                  <Image className="h-4 w-4" />
                  <span>Save to Photos</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
      
      {/* Reply box */}
      {showReplyBox && (
        <div className="ml-8 mt-4 border-l-2 border-gray-200 dark:border-gray-700 pl-4">
          <div className="space-y-3">
            <Textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder={`Reply to ${displayName}...`}
              className="resize-none"
              rows={3}
            />
            <div className="flex items-center justify-between">
              <span className={`text-sm ${replyContent.length > 280 ? 'text-red-500' : 'text-gray-500'}`}>
                {replyContent.length}/280
              </span>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowReplyBox(false);
                    setReplyContent("");
                  }}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSubmitReply}
                  disabled={!replyContent.trim() || replyContent.length > 280 || createReplyMutation.isPending}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  {createReplyMutation.isPending ? "Posting..." : "Reply"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Show dynamically fetched replies */}
      {showReplies && (
        <div className="border-l-2 border-gray-200 dark:border-gray-700 ml-8 pl-4 mt-4">
          {repliesLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="flex space-x-3">
                  <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-32"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-full"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : replies.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-sm">No replies yet</p>
          ) : (
            replies.map((reply: any) => (
              <div key={reply.id} className="mb-4 last:mb-0">
                <ChirpCard chirp={reply} />
                {/* Nested replies */}
                {reply.replies && reply.replies.length > 0 && (
                  <div className="ml-4 mt-2 border-l border-gray-200 dark:border-gray-600 pl-4">
                    {reply.replies.map((nestedReply: any) => (
                      <div key={nestedReply.id} className="mb-2 last:mb-0">
                        <ChirpCard chirp={nestedReply} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </article>
  );
}


