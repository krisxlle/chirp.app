import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Plus } from "lucide-react";
import { useState } from "react";

interface MoodReactionsProps {
  chirpId: number;
  reactionCounts: Record<string, number>;
  userReaction?: string;
  size?: "sm" | "md";
}

const allAvailableReactions = [
  "😊", "😂", "😭", "😍", "🥰", "😘", "😉", "😎", "🤔", "😴", 
  "😋", "😜", "🤪", "😇", "🙃", "😢", "😰", "😨", "😡", "🤬",
  "❤️", "💕", "💖", "💗", "💙", "💚", "💛", "🧡", "💜", "🖤",
  "🔥", "💯", "⭐", "✨", "💎", "👑", "🚀", "💪", "🎉", "🎊",
  "👍", "👎", "👏", "🙌", "🤝", "✊", "👊", "🤞", "🤟", "👌",
  "🤯", "🤩", "🥳", "🤗", "🤡", "👻", "💀", "☠️", "👽", "🤖"
];

export default function MoodReactions({ chirpId, reactionCounts, userReaction, size = "md" }: MoodReactionsProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);

  const reactionMutation = useMutation({
    mutationFn: async (emoji: string) => {
      if (userReaction === emoji) {
        // Remove reaction
        await apiRequest(`/api/reactions/${chirpId}`, {
          method: "DELETE",
        });
      } else {
        // Add/change reaction
        await apiRequest("/api/reactions", {
          method: "POST",
          body: JSON.stringify({ chirpId, emoji }),
          headers: { "Content-Type": "application/json" },
        });
      }
    },
    onSuccess: () => {
      // Invalidate all chirp-related queries
      queryClient.invalidateQueries({ queryKey: ["/api/chirps"] });
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
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
        description: "Failed to update reaction",
        variant: "destructive",
      });
    },
  });

  const totalReactions = Object.values(reactionCounts).reduce((sum, count) => sum + count, 0);

  // Get the top 3 most used reactions for this chirp, or default reactions if none
  const topReactions = Object.entries(reactionCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([emoji]) => emoji);

  // Default mood reactions: 🫶🏼, 😭, 💀
  const defaultReactions = ["🫶🏼", "😭", "💀"];
  
  // Show only top 3 reactions if there are any, otherwise show default reactions
  const hasReactions = Object.keys(reactionCounts).length > 0;
  const displayReactions = hasReactions 
    ? topReactions.slice(0, 3) // Show top 3 if reactions exist
    : defaultReactions; // Show default reactions

  const buttonSize = size === "sm" ? "h-6 px-1 text-xs" : "h-8 px-2 text-sm";
  const textSize = size === "sm" ? "text-xs" : "text-xs";

  return (
    <div className="flex items-center space-x-0.5 overflow-hidden min-w-0 flex-nowrap">
      {displayReactions.map((emoji) => (
        <Button
          key={emoji}
          variant="ghost"
          size="sm"
          className={`h-7 px-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex-shrink-0 whitespace-nowrap text-xs ${
            userReaction === emoji 
              ? "bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300" 
              : "text-gray-600 dark:text-gray-400"
          }`}
          onClick={() => reactionMutation.mutate(emoji)}
          disabled={reactionMutation.isPending}
        >
          <span className="mr-0.5 text-sm">{emoji}</span>
          <span className="text-xs">{reactionCounts[emoji] || 0}</span>
        </Button>
      ))}
      
      {/* More Reactions Button */}
      <Popover open={emojiPickerOpen} onOpenChange={setEmojiPickerOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500 dark:text-gray-400 flex-shrink-0"
          >
            <Plus className="h-3 w-3" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-3" align="start">
          <div className="grid grid-cols-8 gap-1">
            {allAvailableReactions.map((emoji) => (
              <Button
                key={emoji}
                variant="ghost"
                size="sm"
                className={`h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
                  userReaction === emoji 
                    ? "bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300" 
                    : ""
                }`}
                onClick={() => {
                  reactionMutation.mutate(emoji);
                  setEmojiPickerOpen(false);
                }}
                disabled={reactionMutation.isPending}
              >
                {emoji}
              </Button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
      
      {totalReactions > 0 && (
        <span className="text-xs text-gray-500 dark:text-gray-400 ml-1 flex-shrink-0 whitespace-nowrap">
          {totalReactions > 999 ? '999+' : totalReactions}
        </span>
      )}
    </div>
  );
}
