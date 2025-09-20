import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "./api";
import { useAuth } from "./hooks/useAuth";
import { useToast } from "./hooks/use-toast";
import { isUnauthorizedError } from "./authUtils.ts";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import UserAvatar from "./UserAvatar";
import ThreadComposer from "./ThreadComposer";
import { Sparkles, MessageSquare } from "lucide-react";

export default function ComposeChirp() {
  const [content, setContent] = useState("");
  const [isThreadMode, setIsThreadMode] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const maxLength = 280;
  const remainingChars = maxLength - content.length;

  const createChirpMutation = useMutation({
    mutationFn: async (content: string) => {
      return await apiRequest("/api/chirps", {
        method: "POST",
        body: JSON.stringify({ content }),
        headers: { "Content-Type": "application/json" },
      });
    },
    onSuccess: () => {
      setContent("");
      queryClient.invalidateQueries({ queryKey: ["/api/chirps"] });
      toast({
        title: "Chirp posted!",
        description: "Your chirp has been shared with the world.",
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
        description: "Failed to post chirp. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (!content.trim()) {
      toast({
        title: "Empty chirp",
        description: "Please write something before posting.",
        variant: "destructive",
      });
      return;
    }

    if (content.length > maxLength) {
      toast({
        title: "Too long",
        description: `Chirps must be ${maxLength} characters or less.`,
        variant: "destructive",
      });
      return;
    }

    createChirpMutation.mutate(content);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // If in thread mode, show the thread composer
  if (isThreadMode) {
    return (
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-4">
        <ThreadComposer 
          onClose={() => setIsThreadMode(false)} 
          initialContent={content}
        />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-4">
      <div className="flex space-x-3">
        <UserAvatar user={user} size="md" />
        
        <div className="flex-1 min-w-0">
          <Textarea
            placeholder="What's on your mind?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            className="min-h-[80px] resize-none border-none outline-none focus-visible:ring-0 text-lg placeholder:text-gray-500 dark:placeholder:text-gray-400 font-medium p-0 bg-transparent text-gray-900 dark:text-white"
            disabled={createChirpMutation.isPending}
          />
          
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsThreadMode(true)}
                className="text-purple-600 border-purple-300 hover:bg-purple-50 dark:text-purple-400 dark:border-purple-700 dark:hover:bg-purple-900/20"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Thread
              </Button>
              
              <span className={`text-sm ${
                remainingChars < 20 
                  ? "text-red-500" 
                  : remainingChars < 50 
                  ? "text-yellow-500" 
                  : "text-gray-500 dark:text-gray-400"
              }`}>
                {remainingChars < 0 ? `${Math.abs(remainingChars)} over` : `${remainingChars}`}
              </span>
            </div>
            
            <Button
              onClick={handleSubmit}
              disabled={!content.trim() || content.length > maxLength || createChirpMutation.isPending}
              className="gradient-bg hover:opacity-90 transition-opacity font-semibold text-white text-sm px-4 py-2"
            >
              {createChirpMutation.isPending ? "Posting..." : "Chirp"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}


