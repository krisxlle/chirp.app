import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "./api.ts";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "./authUtils.ts";
import UserAvatar from "@/components/UserAvatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Heart, UserPlus, MessageCircle, Smile, AtSign } from "lucide-react";
import { useLocation } from "wouter";
import { formatDistanceToNow } from "date-fns";

export default function Notifications() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading, error } = useQuery({
    queryKey: ["/api/notifications"],
    enabled: isAuthenticated,
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: number) => {
      await apiRequest(`/api/notifications/${notificationId}/read`, {
        method: "PATCH",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications/unread-count"] });
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
        description: "Failed to mark notification as read",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
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
  }, [isAuthenticated, authLoading, toast]);

  useEffect(() => {
    if (error && isUnauthorizedError(error as Error)) {
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
  }, [error, toast]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "follow":
        return <UserPlus className="h-4 w-4 text-blue-500" />;
      case "reaction":
        return <Heart className="h-4 w-4 text-red-500" />;
      case "mention":
        return <AtSign className="h-4 w-4 text-purple-500" />;
      case "mention_bio":
        return <AtSign className="h-4 w-4 text-purple-500" />;
      case "reply":
        return <MessageCircle className="h-4 w-4 text-green-500" />;
      default:
        return <MessageCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getNotificationText = (notification: any) => {
    let fromUserName = "Someone";
    
    if (notification.fromUser) {
      // Try to get a meaningful name
      const firstName = notification.fromUser.firstName?.trim();
      const lastName = notification.fromUser.lastName?.trim();
      const fullName = [firstName, lastName].filter(Boolean).join(' ');
      
      if (fullName) {
        fromUserName = fullName;
      } else if (notification.fromUser.customHandle) {
        fromUserName = notification.fromUser.customHandle;
      } else if (notification.fromUser.handle) {
        fromUserName = notification.fromUser.handle;
      } else {
        fromUserName = `User ${notification.fromUser.id}`;
      }
    }

    switch (notification.type) {
      case "follow":
        return `${fromUserName} started following you`;
      case "reaction":
        return `${fromUserName} reacted to your chirp`;
      case "mention":
        return `${fromUserName} mentioned you in a chirp`;
      case "mention_bio":
        return `${fromUserName} mentioned you in their bio`;
      case "reply":
        return `${fromUserName} replied to your chirp`;
      default:
        return "You have a new notification";
    }
  };

  const handleNotificationClick = (notification: any) => {
    if (!notification.read) {
      markAsReadMutation.mutate(notification.id);
    }

    // Navigate based on notification type
    switch (notification.type) {
      case "follow":
        if (notification.fromUser) {
          setLocation(`/profile/${notification.fromUser.id}`);
        }
        break;
      case "mention_bio":
        // Navigate to the user's profile who mentioned you in their bio
        if (notification.fromUser) {
          setLocation(`/profile/${notification.fromUser.id}`);
        }
        break;
      case "mention":
      case "reaction":
      case "reply":
        // Navigate to the specific chirp if available
        if (notification.chirp) {
          setLocation(`/chirp/${notification.chirp.id}`);
        }
        break;
      default:
        // Default to home
        setLocation("/");
        break;
    }
  };

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation("/")}
            className="p-2 flex-shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Notifications</h1>
        </div>
      </header>

      {/* Content */}
      <main className="pb-20">
        {isLoading ? (
          // Loading skeleton
          <div className="divide-y divide-gray-200">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="p-4 flex space-x-3">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <div className="text-4xl mb-4">⚠️</div>
            <p className="text-gray-500">Failed to load notifications. Please try again.</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-6xl mb-4">🔔</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No notifications yet</h3>
            <p className="text-gray-500">When someone follows you or reacts to your chirps, you'll see it here!</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {notifications.map((notification: any) => (
              <button
                key={notification.id}
                className={`w-full p-4 flex space-x-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left ${
                  !notification.read ? "bg-blue-50 dark:bg-blue-900/20" : ""
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex-shrink-0">
                  {notification.fromUser ? (
                    <UserAvatar user={notification.fromUser} size="sm" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      {getNotificationIcon(notification.type)}
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start space-x-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 dark:text-white break-words">
                        {getNotificationText(notification)}
                      </p>
                      
                      {notification.chirp && (
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2 break-words">
                          "{notification.chirp.content}"
                        </p>
                      )}
                      
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                    
                    <div className="flex-shrink-0 flex items-center space-x-2">
                      {getNotificationIcon(notification.type)}
                      {!notification.read && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
