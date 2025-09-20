import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Sparkles, TrendingUp, Heart, MessageSquare, BarChart3, Clock, Share } from "lucide-react";
import { apiRequest } from "./queryClient";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "./hooks/use-toast";

interface WeeklySummary {
  id: number;
  userId: string;
  weekStartDate: string;
  weekEndDate: string;
  chirpCount: number;
  tone: string;
  topChirp: string | null;
  topReactions: Array<{ emoji: string; count: number }>;
  commonWords: string[];
  weeklyVibes: string;
  summaryText: string;
  chirpId?: number;
  createdAt: string;
}

interface WeeklySummaryProps {
  userId: string;
}

export default function WeeklySummary({ userId }: WeeklySummaryProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [timeUntilNext, setTimeUntilNext] = useState<string>("");

  // Query for latest weekly summary
  const { data: weeklySummary, refetch } = useQuery<WeeklySummary>({
    queryKey: [`/api/weekly-summary/${userId}`],
    enabled: !!userId,
    retry: false,
  });

  // Calculate time until next Saturday noon
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const nextSaturday = new Date();
      
      // Find next Saturday
      const daysUntilSaturday = (6 - now.getDay()) % 7;
      nextSaturday.setDate(now.getDate() + (daysUntilSaturday === 0 ? 7 : daysUntilSaturday));
      nextSaturday.setHours(12, 0, 0, 0); // Set to noon
      
      // If it's Saturday and before noon, use today
      if (now.getDay() === 6 && now.getHours() < 12) {
        nextSaturday.setDate(now.getDate());
      }
      
      const diff = nextSaturday.getTime() - now.getTime();
      
      if (diff <= 0) {
        setTimeUntilNext("Refresh in progress...");
        return;
      }
      
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      if (days > 0) {
        setTimeUntilNext(`${days}d ${hours}h ${minutes}m`);
      } else if (hours > 0) {
        setTimeUntilNext(`${hours}h ${minutes}m`);
      } else {
        setTimeUntilNext(`${minutes}m`);
      }
    };
    
    updateCountdown();
    const interval = setInterval(updateCountdown, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, []);

  // Mutation for posting weekly summary as chirp
  const postSummaryMutation = useMutation({
    mutationFn: async () => {
      if (!weeklySummary) throw new Error("No summary to post");
      return await apiRequest(`/api/weekly-summary/${weeklySummary.id}/post`, { method: 'POST' });
    },
    onSuccess: () => {
      toast({
        title: "Weekly Summary Posted",
        description: "Your weekly summary has been shared as a chirp!",
      });
      refetch();
      queryClient.invalidateQueries({ queryKey: ['/api/chirps'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to post weekly summary. Please try again.",
        variant: "destructive",
      });
      console.error("Error posting weekly summary:", error);
    },
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const getToneIcon = (tone: string) => {
    switch (tone.toLowerCase()) {
      case 'energetic':
        return <TrendingUp className="w-4 h-4 text-orange-500" />;
      case 'positive':
        return <Heart className="w-4 h-4 text-pink-500" />;
      case 'social':
        return <MessageSquare className="w-4 h-4 text-blue-500" />;
      case 'contemplative':
        return <BarChart3 className="w-4 h-4 text-purple-500" />;
      default:
        return <Sparkles className="w-4 h-4 text-green-500" />;
    }
  };

  if (!weeklySummary) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            Weekly Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                Next automatic refresh: {timeUntilNext}
              </p>
            </div>
            <p className="text-muted-foreground mb-4">
              Weekly summaries are automatically generated every Saturday at noon. 
              You'll be able to post yours when it's ready!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            Weekly Summary
            <span className="text-sm font-normal text-muted-foreground">
              {formatDate(weeklySummary.weekStartDate)} - {formatDate(weeklySummary.weekEndDate)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Next: {timeUntilNext}
            </span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main Summary */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 p-4 rounded-lg">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {weeklySummary.summaryText}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <MessageSquare className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium">Chirps Posted</span>
            </div>
            <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
              {weeklySummary.chirpCount}
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              {getToneIcon(weeklySummary.tone)}
              <span className="text-sm font-medium">Weekly Vibe</span>
            </div>
            <p className="text-sm font-semibold capitalize">
              {weeklySummary.weeklyVibes}
            </p>
          </div>
        </div>

        {/* Top Chirp */}
        {weeklySummary.topChirp && (
          <div>
            <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-orange-500" />
              Top Chirp
            </h4>
            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                "{weeklySummary.topChirp}"
              </p>
            </div>
          </div>
        )}

        {/* Top Reactions */}
        {weeklySummary.topReactions.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
              <Heart className="w-4 h-4 text-pink-500" />
              Top Reactions
            </h4>
            <div className="flex flex-wrap gap-2">
              {weeklySummary.topReactions.slice(0, 5).map((reaction, index) => (
                <div
                  key={index}
                  className="bg-gray-50 dark:bg-gray-800 px-3 py-1 rounded-full text-sm"
                >
                  <span className="mr-1">{reaction.emoji}</span>
                  <span className="font-medium">{reaction.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Common Words */}
        {weeklySummary.commonWords.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-purple-500" />
              Common Words
            </h4>
            <div className="flex flex-wrap gap-1">
              {weeklySummary.commonWords.slice(0, 8).map((word, index) => (
                <span
                  key={index}
                  className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2 py-1 rounded text-xs"
                >
                  {word}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Post Summary Button */}
        <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
          {weeklySummary.chirpId ? (
            <div className="text-center py-2">
              <p className="text-sm text-muted-foreground">
                ✓ Weekly summary has been posted to your feed
              </p>
            </div>
          ) : (
            <Button
              onClick={() => postSummaryMutation.mutate()}
              disabled={postSummaryMutation.isPending}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              {postSummaryMutation.isPending ? (
                <>
                  <Share className="w-4 h-4 mr-2 animate-pulse" />
                  Posting...
                </>
              ) : (
                <>
                  <Share className="w-4 h-4 mr-2" />
                  Post Weekly Summary
                </>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
