import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Bell, BellOff } from "lucide-react";

interface NotificationToggleProps {
  userId: string;
}

export default function NotificationToggle({ userId }: NotificationToggleProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: notificationSetting, isLoading } = useQuery({
    queryKey: [`/api/notifications/settings/${userId}`],
  });

  const toggleMutation = useMutation({
    mutationFn: async (enabled: boolean) => {
      return await apiRequest(`/api/notifications/settings/${userId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notifyOnPost: enabled }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: [`/api/notifications/settings/${userId}`] 
      });
      toast({
        title: notificationSetting?.notifyOnPost ? "Notifications disabled" : "Notifications enabled",
        description: notificationSetting?.notifyOnPost 
          ? "You won't be notified when this user posts"
          : "You'll be notified when this user posts",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update notification settings",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <Button variant="outline" size="sm" disabled>
        <Bell className="h-4 w-4 mr-2" />
        Loading...
      </Button>
    );
  }

  const isEnabled = notificationSetting?.notifyOnPost || false;

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => toggleMutation.mutate(!isEnabled)}
      disabled={toggleMutation.isPending}
      className="flex items-center gap-2"
    >
      {isEnabled ? (
        <BellOff className="h-4 w-4" />
      ) : (
        <Bell className="h-4 w-4" />
      )}
      {isEnabled ? "Turn off notifications" : "Get notified when they post"}
    </Button>
  );
}