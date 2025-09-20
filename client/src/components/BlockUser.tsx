import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "./ui/button";
import { Shield, ShieldOff } from "lucide-react";
import { useToast } from "./hooks/use-toast";
import { apiRequest } from "./queryClient";
import { isUnauthorizedError } from "./authUtils.ts";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";

interface BlockUserProps {
  userId: string;
  username: string;
}

export default function BlockUser({ userId, username }: BlockUserProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check if user is blocked
  const { data: blockStatus } = useQuery({
    queryKey: [`/api/users/${userId}/blocked`],
    retry: false,
  });

  const isBlocked = blockStatus?.blocked || false;

  const blockMutation = useMutation({
    mutationFn: async () => {
      if (isBlocked) {
        await apiRequest("DELETE", `/api/users/${userId}/block`);
      } else {
        await apiRequest("POST", `/api/users/${userId}/block`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/blocked`] });
      queryClient.invalidateQueries({ queryKey: ["/api/chirps"] });
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      
      toast({
        title: isBlocked ? "User Unblocked" : "User Blocked",
        description: isBlocked 
          ? `You have unblocked ${username}` 
          : `You have blocked ${username}. They won't be able to see your posts or profile.`,
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
        description: `Failed to ${isBlocked ? 'unblock' : 'block'} user`,
        variant: "destructive",
      });
    },
  });

  if (isBlocked) {
    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="text-red-600 dark:text-red-400 border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20"
            disabled={blockMutation.isPending}
          >
            <ShieldOff className="h-4 w-4 mr-1" />
            Unblock
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unblock {username}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will allow {username} to see your posts and profile again. They will also be able to follow you.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => blockMutation.mutate()}
              disabled={blockMutation.isPending}
            >
              {blockMutation.isPending ? "Unblocking..." : "Unblock"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="text-gray-600 dark:text-gray-400 hover:text-red-600 hover:border-red-200 dark:hover:text-red-400 dark:hover:border-red-800"
          disabled={blockMutation.isPending}
        >
          <Shield className="h-4 w-4 mr-1" />
          Block
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Block {username}?</AlertDialogTitle>
          <AlertDialogDescription>
            This will prevent {username} from seeing your posts and profile. If they follow you, the follow relationship will be removed. This action can be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={() => blockMutation.mutate()}
            disabled={blockMutation.isPending}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {blockMutation.isPending ? "Blocking..." : "Block User"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
