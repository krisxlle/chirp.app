import MentionText from "@/components/MentionText";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "./api.ts";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useParams } from "wouter";

import ChirpCard from "@/components/ChirpCard";
import ChirpPlusBadge from "@/components/ChirpPlusBadge";
import UserAvatar from "@/components/UserAvatar";
import WeeklySummary from "@/components/WeeklySummary";
import { DEFAULT_BANNER_URL } from "@/constants/DefaultBanner";
import { formatDistanceToNow } from "date-fns";
import { ArrowLeft, Bell, BellOff, Calendar, Link as LinkIcon, MoreHorizontal, Settings, UserX, Wand2 } from "lucide-react";

// Tab Components
function RepliesTab({ userId }: { userId: string }) {
  const [, setLocation] = useLocation();
  const { data: replies, isLoading } = useQuery({
    queryKey: ['/api/users', userId, 'replies'],
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="border border-gray-200 rounded-lg p-4">
            <div className="flex space-x-3">
              <Skeleton className="w-10 h-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!replies || (replies as any).length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-4xl mb-4">💬</div>
        <p className="text-gray-500">No replies yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {(replies as any).map((chirp: any) => (
        <div key={chirp.id} className="border border-gray-200 rounded-lg overflow-hidden">
          {/* ChirpCard already handles parent chirp display for replies */}
          <ChirpCard chirp={chirp} />
        </div>
      ))}
    </div>
  );
}

function MoodReactedTab({ userId }: { userId: string }) {
  const { data: reactedChirps, isLoading } = useQuery({
    queryKey: ['/api/users', userId, 'reacted'],
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="border border-gray-200 rounded-lg p-4">
            <div className="flex space-x-3">
              <Skeleton className="w-10 h-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!reactedChirps || (reactedChirps as any).length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-4xl mb-4">🎭</div>
        <p className="text-gray-500">No mood reactions yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-0 border border-gray-200 rounded-lg overflow-hidden">
      {(reactedChirps as any).map((chirp: any, index: number) => (
        <div key={chirp.id} className={index > 0 ? "border-t border-gray-200" : ""}>
          <ChirpCard chirp={chirp} />
        </div>
      ))}
    </div>
  );
}

export default function Profile() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const { user: currentUser, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const userIdOrHandle = params.userId || currentUser?.id;

  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);
  const [showAIPrompt, setShowAIPrompt] = useState(false);
  const [customPrompt, setCustomPrompt] = useState("");

  // Add CSS-in-JS styles directly to the component
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      main.pb-20 {
        max-width: 600px !important;
        margin: 0 auto !important;
        width: 100% !important;
        padding-left: 24px !important;
        padding-right: 24px !important;
      }
      div[style*="maxWidth: '600px'"] {
        max-width: 600px !important;
        margin: 0 auto !important;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, []);

  // Determine if this is own profile
  const isOwnProfile = !userIdOrHandle || userIdOrHandle === currentUser?.id;
  
  // First, resolve the handle/ID to get the actual user data
  const { data: resolvedUser, isLoading: resolveLoading } = useQuery({
    queryKey: ['/api/users', userIdOrHandle],
    enabled: !!userIdOrHandle && isAuthenticated && !isOwnProfile,
  });

  // Determine the actual userId 
  const userId = isOwnProfile ? currentUser?.id : ((resolvedUser as any)?.id || userIdOrHandle);

  // Get profile data - use current user for own profile, resolved user for others
  const actualProfileUser = isOwnProfile ? currentUser : resolvedUser;

  const { data: chirps = [], isLoading: chirpsLoading } = useQuery({
    queryKey: ['/api/users', userId, 'chirps'],
    enabled: !!userId && isAuthenticated && (isOwnProfile || !resolveLoading),
  });

  const { data: followCounts } = useQuery({
    queryKey: ['/api/users', userId, 'follow-counts'],
    enabled: !!userId && isAuthenticated && (isOwnProfile || !resolveLoading),
  });

  const { data: reactionCounts } = useQuery({
    queryKey: ['/api/users', userId, 'reaction-counts'],
    enabled: !!userId && isAuthenticated && (isOwnProfile || !resolveLoading),
  });

  const { data: followStatus } = useQuery({
    queryKey: ['/api/users', userId, 'is-following'],
    enabled: !!userId && isAuthenticated && !isOwnProfile && !resolveLoading,
  });

  const { data: chirpCount } = useQuery({
    queryKey: ['/api/users', userId, 'chirp-count'],
    enabled: !!userId && isAuthenticated && (isOwnProfile || !resolveLoading),
  });

  const { data: blockStatus } = useQuery({
    queryKey: ['/api/users', userId, 'blocked'],
    enabled: !!userId && isAuthenticated && !isOwnProfile && !resolveLoading,
  });

  const { data: blockedByStatus } = useQuery({
    queryKey: ['/api/users', userId, 'blocked-by'],
    enabled: !!userId && isAuthenticated && !isOwnProfile && !resolveLoading,
  });

  const { data: notificationStatus } = useQuery({
    queryKey: ['/api/users', userId, 'notification-setting'],
    enabled: !!userId && isAuthenticated && !isOwnProfile && (followStatus as any)?.following && !resolveLoading,
  });

  const { data: followers } = useQuery({
    queryKey: ['/api/users', userId, 'followers'],
    enabled: !!userId && isAuthenticated && showFollowersModal && (isOwnProfile || !resolveLoading),
  });

  const { data: following } = useQuery({
    queryKey: ['/api/users', userId, 'following'],
    enabled: !!userId && isAuthenticated && showFollowingModal && (isOwnProfile || !resolveLoading),
  });

  const followMutation = useMutation({
    mutationFn: async () => {
      if ((followStatus as any)?.isFollowing) {
        await apiRequest(`/api/follows/${userId}`, {
          method: "DELETE",
        });
      } else {
        await apiRequest("/api/follows", {
          method: "POST",
          body: JSON.stringify({ followingId: userId }),
          headers: { "Content-Type": "application/json" },
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users', userId, 'is-following'] });
      queryClient.invalidateQueries({ queryKey: ['/api/users', userId, 'follow-counts'] });
      toast({
        title: (followStatus as any)?.isFollowing ? "Unfollowed" : "Following",
        description: (followStatus as any)?.isFollowing 
          ? "You unfollowed this user" 
          : "You are now following this user",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error as Error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update follow status",
        variant: "destructive",
      });
    },
  });

  const blockMutation = useMutation({
    mutationFn: async () => {
      if ((blockStatus as any)?.blocked) {
        await apiRequest(`/api/users/${userId}/block`, {
          method: "DELETE",
        });
      } else {
        await apiRequest(`/api/users/${userId}/block`, {
          method: "POST",
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users', userId, 'blocked'] });
      queryClient.invalidateQueries({ queryKey: ['/api/users', userId, 'blocked-by'] });
      queryClient.invalidateQueries({ queryKey: ['/api/users', userId, 'is-following'] });
      toast({
        title: (blockStatus as any)?.blocked ? "Unblocked" : "Blocked",
        description: (blockStatus as any)?.blocked 
          ? "You unblocked this user" 
          : "You blocked this user",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update block status",
        variant: "destructive",
      });
    },
  });

  const notificationMutation = useMutation({
    mutationFn: async () => {
      await apiRequest(`/api/users/${userId}/notifications`, {
        method: "POST",
        body: JSON.stringify({ enabled: !(notificationStatus as any)?.enabled }),
        headers: { "Content-Type": "application/json" },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users', userId, 'notifications'] });
      toast({
        title: (notificationStatus as any)?.enabled ? "Notifications off" : "Notifications on",
        description: (notificationStatus as any)?.enabled 
          ? "You won't get notifications from this user" 
          : "You'll get notifications from this user",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update notification settings",
        variant: "destructive",
      });
    },
  });

  const generatePersonalizedProfileMutation = useMutation({
    mutationFn: async ({ personality, traits, interests, style, customPrompts }: {
      personality?: string;
      traits?: string[];
      interests?: string[];
      style?: string;
      customPrompts?: string;
    }) => {
      console.log("AI Profile generation mutation called with:", { 
        personality, 
        traits, 
        interests, 
        style, 
        customPrompts 
      });
      
      const response = await apiRequest("/api/ai/generate-personalized-profile", {
        method: "POST",
        body: JSON.stringify({ personality, traits, interests, style, customPrompts }),
        headers: { "Content-Type": "application/json" },
      });
      
      console.log("API response:", response);
      return response;
    },
    onSuccess: (data) => {
      console.log("AI Profile generation success:", data);
      toast({
        title: "Profile Generated!",
        description: "Your AI profile has been created!",
      });

      setShowAIPrompt(false);
      setCustomPrompt("");
      // Invalidate and refetch both auth user and profile user data
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      queryClient.invalidateQueries({ queryKey: ['/api/users', userId] });
      
      // Also invalidate all user-related queries
      queryClient.invalidateQueries({ queryKey: ['/api/users', userId, 'chirps'] });
      queryClient.invalidateQueries({ queryKey: ['/api/users', userId, 'follow-counts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/users', userId, 'reaction-counts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/users', userId, 'chirp-count'] });
      
      // Force immediate refetch to update images and profile data
      setTimeout(() => {
        queryClient.refetchQueries({ queryKey: ['/api/auth/user'] });
        queryClient.refetchQueries({ queryKey: ['/api/users', userId] });
        
        // Clear image caches by adding timestamp parameter
        const timestamp = Date.now();
        const avatarImages = document.querySelectorAll('img[src*="oaidalleapiprodscus"], img[src*="profileImageUrl"]');
        const bannerImages = document.querySelectorAll('div[style*="background-image"], img[src*="bannerImageUrl"]');
        
        avatarImages.forEach((img: any) => {
          if (img.src) {
            const url = new URL(img.src);
            url.searchParams.set('t', timestamp.toString());
            img.src = url.toString();
          }
        });
        
        bannerImages.forEach((element: any) => {
          if (element.style?.backgroundImage) {
            const match = element.style.backgroundImage.match(/url\("([^"]+)"\)/);
            if (match) {
              const url = new URL(match[1]);
              url.searchParams.set('t', timestamp.toString());
              element.style.backgroundImage = `url("${url.toString()}")`;
            }
          }
        });
      }, 1000);
    },
    onError: (error: any) => {
      console.error("AI generation error:", error);
      
      let errorMessage = "Failed to generate personalized profile";
      
      // Handle specific error types
      if (error?.message?.includes("429")) {
        errorMessage = "Daily AI generation limit reached. Upgrade to Chirp+ for unlimited generations!";
      } else if (error?.message?.includes("401")) {
        errorMessage = "Please log in again to continue";
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 2000);
      } else if (error?.message?.includes("limit reached")) {
        errorMessage = error.message;
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      toast({
        title: "Generation Failed",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });





  const handleCustomPromptGenerate = () => {
    console.log("Custom prompt generate clicked with:", customPrompt);
    if (!customPrompt.trim()) {
      toast({
        title: "Prompt Required",
        description: "Please enter a description of what you want your profile to be like.",
        variant: "destructive",
      });
      return;
    }
    
    generatePersonalizedProfileMutation.mutate({
      customPrompts: customPrompt.trim()
    });
  };

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      console.log("User not authenticated, redirecting to login");
      window.location.href = "/api/login";
      return;
    }
  }, [isAuthenticated, authLoading]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    setLocation("/");
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  const user = isOwnProfile ? currentUser : actualProfileUser;
  const displayName = user ? `${(user as any).firstName || ''} ${(user as any).lastName || ''}`.trim() || (user as any).customHandle || (user as any).handle || `User ${(user as any).id}` : "Unknown User";

  // Debug logging
  console.log('Profile debug:', {
    userIdOrHandle,
    userId,
    isOwnProfile,
    currentUser: !!currentUser,
    resolvedUser: !!resolvedUser,
    actualProfileUser: !!actualProfileUser,
    user: !!user,
    resolveLoading,
    blockStatus: (blockStatus as any)?.blocked,
    blockedByStatus: (blockedByStatus as any)?.blockedBy
  });

  return (
    <>
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 min-w-0 flex-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation("/")}
              className="p-2 flex-shrink-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="min-w-0 flex-1">
              <h1 className="text-lg font-bold text-gray-900 dark:text-white truncate">Profile</h1>
              {(chirps as any).length > 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400">{(chirpCount as any)?.count || (chirps as any)?.length || 0} chirps</p>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="pb-20" style={{ maxWidth: '600px', margin: '0 auto', width: '100%', paddingLeft: '24px', paddingRight: '24px' }}>
        {resolveLoading || (!user && !isOwnProfile) ? (
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <div className="p-4">
              <div className="h-32 bg-gray-200 animate-pulse rounded-t-2xl relative">
                <div className="absolute bottom-0 left-4 transform translate-y-1/2">
                  <Skeleton className="w-20 h-20 rounded-full" />
                </div>
              </div>
              <div className="mt-12 space-y-4">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-full" />
                <div className="flex space-x-6">
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-8 w-16" />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Profile Header */}
            <div className="bg-white">
              {/* Banner */}
              <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                <div className="h-40 gradient-bg relative overflow-hidden"> {/* 160px height for better 3:1 ratio on desktop */}
                  <img
                    src={(user as any)?.bannerImageUrl || DEFAULT_BANNER_URL}
                    alt="Profile banner"
                    className="absolute inset-0 w-full h-full object-cover"
                    onError={(e) => {
                      console.log('Banner image failed to load, using default');
                      e.currentTarget.src = DEFAULT_BANNER_URL;
                    }}
                  />
                </div>
              </div>

              <div style={{ maxWidth: '600px', margin: '0 auto', paddingLeft: '24px', paddingRight: '24px' }} className="pb-4">
                {/* Avatar and Follow Button */}
                <div className="flex items-end justify-between -mt-10 mb-4">
                  <div className="relative z-10">
                    <div className="rounded-full border-4 border-white dark:border-gray-900">
                      <UserAvatar user={user as any} size="xl" />
                    </div>
                  </div>
                  {!isOwnProfile && !(blockedByStatus as any)?.blockedBy ? (
                    <div className="flex space-x-2 relative z-10">
                      <Button
                        className={`font-semibold text-sm ${
                          (followStatus as any)?.isFollowing
                            ? "bg-gray-200 text-gray-900 hover:bg-gray-300"
                            : "gradient-bg text-white hover:opacity-90"
                        }`}
                        onClick={() => followMutation.mutate()}
                        disabled={followMutation.isPending}
                      >
                        {followMutation.isPending
                          ? "..."
                          : (followStatus as any)?.isFollowing
                          ? "Following"
                          : "Follow"
                        }
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="px-3"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem 
                            onClick={() => notificationMutation.mutate()}
                            disabled={notificationMutation.isPending}
                            className="flex items-center"
                          >
                            {(notificationStatus as any)?.enabled ? (
                              <>
                                <BellOff className="h-4 w-4 mr-2" />
                                Turn off notifications
                              </>
                            ) : (
                              <>
                                <Bell className="h-4 w-4 mr-2" />
                                Turn on notifications
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => blockMutation.mutate()}
                            disabled={blockMutation.isPending}
                            className="text-red-600 focus:text-red-600"
                          >
                            <UserX className="h-4 w-4 mr-2" />
                            {(blockStatus as any)?.blocked ? "Unblock" : "Block"} user
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ) : (
                    <div className="flex space-x-2 relative z-10">
                      <Button
                        onClick={() => {
                          console.log("AI Profile button clicked!");
                          setShowAIPrompt(true);
                        }}
                        disabled={generatePersonalizedProfileMutation.isPending}
                        size="sm"
                        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-none shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-1"
                      >
                        <Wand2 className="h-4 w-4" />
                        <span>{generatePersonalizedProfileMutation.isPending ? "Generating..." : "AI Profile"}</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setLocation("/settings")}
                        className="flex items-center space-x-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600"
                      >
                        <Settings className="h-4 w-4" />
                        <span>Settings</span>
                      </Button>
                    </div>
                  )}
                </div>

                {/* User Info */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white break-words">{displayName}</h2>
                    {(user as any)?.isChirpPlus && (user as any)?.showChirpPlusBadge && (
                      <ChirpPlusBadge />
                    )}
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 break-words">
                    @{(user as any)?.hasCustomHandle && (user as any)?.customHandle ? (user as any).customHandle : (user as any)?.handle}
                    {!(user as any)?.hasCustomHandle && (
                      <span className="text-xs text-gray-400 ml-1">(random)</span>
                    )}
                  </p>
                  {(user as any)?.bio && (
                    <div className="mt-2">
                      <MentionText 
                        text={(user as any).bio} 
                        className="text-gray-700 dark:text-gray-300 break-words" 
                      />
                    </div>
                  )}

                  {/* Link in Bio */}
                  {(user as any)?.linkInBio && (
                    <div className="mt-3">
                      <a
                        href={(user as any).linkInBio.startsWith('http') ? (user as any).linkInBio : `https://${(user as any).linkInBio}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-2 px-3 py-2 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors text-sm font-medium"
                      >
                        <LinkIcon className="h-4 w-4" />
                        <span className="truncate max-w-[200px]">{(user as any).linkInBio}</span>
                      </a>
                    </div>
                  )}
                  

                  
                  {/* Handle Status */}
                  {!(user as any)?.hasCustomHandle && (
                    <div className="mt-2 text-sm">
                      {(user as any)?.vipCodeUsed || ((user as any)?.invitesSent && (user as any).invitesSent >= 3) ? (
                        <p className="text-green-600 dark:text-green-400">
                          ✓ Eligible to claim custom handle
                        </p>
                      ) : (
                        <p className="text-amber-600 dark:text-amber-400">
                          Invite {3 - ((user as any)?.invitesSent || 0)} more contacts to claim a custom handle
                        </p>
                      )}
                    </div>
                  )}
                  
                  {/* Join date */}
                  {(user as any)?.createdAt && (
                    <div className="flex items-center space-x-2 mt-2 text-gray-500 dark:text-gray-400">
                      <Calendar className="h-4 w-4 flex-shrink-0" />
                      <span className="text-sm">
                        Joined {formatDistanceToNow(new Date((user as any).createdAt), { addSuffix: true })}
                      </span>
                    </div>
                  )}
                </div>

                {/* Follow Stats */}
                <div className="flex space-x-6 mb-4">
                  <button 
                    className="text-center hover:underline min-w-0 transition-colors hover:text-purple-600"
                    onClick={() => setShowFollowingModal(true)}
                  >
                    <div className="font-bold text-lg text-gray-900 dark:text-white">{(followCounts as any)?.following || 0}</div>
                    <div className="text-gray-500 dark:text-gray-400 text-sm">Following</div>
                  </button>
                  <button 
                    className="text-center hover:underline min-w-0 transition-colors hover:text-purple-600"
                    onClick={() => setShowFollowersModal(true)}
                  >
                    <div className="font-bold text-lg text-gray-900 dark:text-white">{(followCounts as any)?.followers || 0}</div>
                    <div className="text-gray-500 dark:text-gray-400 text-sm">Followers</div>
                  </button>
                  <div className="text-center min-w-0">
                    <div className="font-bold text-lg text-gray-900 dark:text-white">{(chirpCount as any)?.count || (chirps as any)?.length || 0}</div>
                    <div className="text-gray-500 dark:text-gray-400 text-sm">Chirps</div>
                  </div>
                  <div className="text-center min-w-0">
                    <div className="font-bold text-lg text-gray-900 dark:text-white">{(reactionCounts as any)?.totalReactions || 0}</div>
                    <div className="text-gray-500 dark:text-gray-400 text-sm">Reactions</div>
                  </div>
                </div>

                {/* Weekly Summary for own profile */}
                {isOwnProfile && (
                  <div className="mb-6">
                    <WeeklySummary userId={userId} />
                  </div>
                )}

                {/* Profile Tabs - Show blocked message if current user blocked this user OR if current user is blocked by this user */}
                {!isOwnProfile && ((blockStatus as any)?.blocked || (blockedByStatus as any)?.blockedBy) ? (
                  <div className="w-full">
                    <div className="text-center py-12">
                      <UserX className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        {(blockStatus as any)?.blocked ? "User has been blocked" : "You cannot view this profile"}
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400">
                        {(blockStatus as any)?.blocked 
                          ? "You have blocked this user. You can unblock them from the menu above."
                          : "This user has restricted access to their profile."
                        }
                      </p>
                    </div>
                  </div>
                ) : (
                  <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                    <Tabs defaultValue="chirps" className="w-full">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="chirps">Chirps</TabsTrigger>
                        <TabsTrigger value="replies">Replies</TabsTrigger>
                        <TabsTrigger value="moods">Mood Reacted</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="chirps" className="mt-0">
                      {chirpsLoading ? (
                        <div className="space-y-4 mt-4">
                          {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="border border-gray-200 rounded-lg p-4">
                              <div className="flex space-x-3">
                                <Skeleton className="w-10 h-10 rounded-full" />
                                <div className="flex-1 space-y-2">
                                  <Skeleton className="h-4 w-32" />
                                  <Skeleton className="h-4 w-full" />
                                  <Skeleton className="h-4 w-3/4" />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (chirps as any).length === 0 ? (
                        <div className="text-center py-8">
                          <div className="text-4xl mb-4">🐦</div>
                          <p className="text-gray-500">
                            {isOwnProfile ? "You haven't chirped yet!" : "No chirps yet"}
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-0 mt-4 border border-gray-200 rounded-lg overflow-hidden">
                          {(chirps as any).map((chirp: any, index: number) => (
                            <div key={chirp.id} className={index > 0 ? "border-t border-gray-200" : ""}>
                              <ChirpCard chirp={chirp} />
                            </div>
                          ))}
                        </div>
                      )}
                    </TabsContent>
                    
                      <TabsContent value="replies" className="mt-4">
                        <RepliesTab userId={userId} />
                      </TabsContent>
                      
                      <TabsContent value="moods" className="mt-4">
                        <MoodReactedTab userId={userId} />
                      </TabsContent>
                    </Tabs>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </main>
      


      {/* Followers Modal */}
      <Dialog open={showFollowersModal} onOpenChange={setShowFollowersModal}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <DialogTitle className="text-lg font-semibold mb-4">Followers</DialogTitle>
          <div className="space-y-3">
            {followers && (followers as any).length > 0 ? (
              (followers as any).map((follower: any) => (
                <div 
                  key={follower.id} 
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                  onClick={() => {
                    setShowFollowersModal(false);
                    setLocation(`/profile/${follower.id}`);
                  }}
                >
                  <UserAvatar user={follower} size="md" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white truncate">
                      {`${follower.firstName || ''} ${follower.lastName || ''}`.trim() || follower.customHandle || follower.handle || `User ${follower.id}`}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      @{follower.hasCustomHandle && follower.customHandle ? follower.customHandle : follower.handle}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                No followers yet
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Following Modal */}
      <Dialog open={showFollowingModal} onOpenChange={setShowFollowingModal}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <DialogTitle className="text-lg font-semibold mb-4">Following</DialogTitle>
          <div className="space-y-3">
            {following && (following as any).length > 0 ? (
              (following as any).map((followedUser: any) => (
                <div 
                  key={followedUser.id} 
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                  onClick={() => {
                    setShowFollowingModal(false);
                    setLocation(`/profile/${followedUser.id}`);
                  }}
                >
                  <UserAvatar user={followedUser} size="md" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white truncate">
                      {`${followedUser.firstName || ''} ${followedUser.lastName || ''}`.trim() || followedUser.customHandle || followedUser.handle || `User ${followedUser.id}`}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      @{followedUser.hasCustomHandle && followedUser.customHandle ? followedUser.customHandle : followedUser.handle}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                Not following anyone yet
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* AI Prompt Dialog */}
      <Dialog open={showAIPrompt} onOpenChange={(open) => {
        console.log("AI Prompt dialog state changed:", open);
        setShowAIPrompt(open);
      }}>
        <DialogContent className="max-w-md fixed top-4 left-1/2 transform -translate-x-1/2 z-[9999] max-h-[80vh] overflow-y-auto">
          <DialogTitle className="text-lg font-semibold mb-4">Generate AI Profile</DialogTitle>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Describe what you want your profile to be like:
              </label>
              <textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="e.g., Make me look like a creative artist who loves nature and photography..."
                className="w-full h-24 p-3 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                disabled={generatePersonalizedProfileMutation.isPending}
              />
            </div>
            <div className="flex space-x-3">
              <Button
                onClick={() => {
                  console.log("Generate button clicked! Custom prompt:", customPrompt);
                  handleCustomPromptGenerate();
                }}
                disabled={generatePersonalizedProfileMutation.isPending}
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                {generatePersonalizedProfileMutation.isPending ? "Generating..." : "Generate"}
              </Button>
              <Button
                onClick={() => setShowAIPrompt(false)}
                variant="outline"
                disabled={generatePersonalizedProfileMutation.isPending}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
