import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import ComposeChirp from "@/components/ComposeChirp";
import ChirpCard from "@/components/ChirpCard";
import ContactsPrompt from "@/components/ContactsPrompt";
import { useQuery } from "@tanstack/react-query";
import { isUnauthorizedError } from "./authUtils.ts";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Sparkles, Clock, TrendingUp } from "lucide-react";

export default function Home() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [feedType, setFeedType] = useState<'personalized' | 'chronological' | 'trending'>('personalized');

  const { data: chirps, isLoading, error } = useQuery({
    queryKey: ["/api/chirps", feedType],
    queryFn: async () => {
      const response = await fetch(`/api/chirps?personalized=${feedType === 'personalized'}&trending=${feedType === 'trending'}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch chirps');
      return response.json();
    },
    enabled: isAuthenticated,
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
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <img 
              src="/logo.jpg" 
              alt="Chirp" 
              className="w-8 h-8 object-cover object-center rounded-lg"
            />

          </div>
          
          {/* Feed Type Selector */}
          <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <Button
              variant={feedType === 'personalized' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setFeedType('personalized')}
              className={`h-8 px-3 ${feedType === 'personalized' ? 'bg-purple-600 text-white' : 'text-gray-600 dark:text-gray-400'}`}
            >
              <Sparkles className="h-3 w-3 mr-1" />
              For You
            </Button>
            <Button
              variant={feedType === 'chronological' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setFeedType('chronological')}
              className={`h-8 px-3 ${feedType === 'chronological' ? 'bg-purple-600 text-white' : 'text-gray-600 dark:text-gray-400'}`}
            >
              <Clock className="h-3 w-3 mr-1" />
              Latest
            </Button>
            <Button
              variant={feedType === 'trending' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setFeedType('trending')}
              className={`h-8 px-3 ${feedType === 'trending' ? 'bg-purple-600 text-white' : 'text-gray-600 dark:text-gray-400'}`}
            >
              <TrendingUp className="h-3 w-3 mr-1" />
              Trending
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pb-4 mb-20">
        <ContactsPrompt />
        <ComposeChirp />
        
        <div className="space-y-0">
          {isLoading ? (
            // Loading skeleton
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white border-b border-gray-200 p-4">
                <div className="flex space-x-3">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <div className="flex space-x-4 mt-3">
                      <Skeleton className="h-6 w-16" />
                      <Skeleton className="h-6 w-16" />
                      <Skeleton className="h-6 w-24" />
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : error ? (
            <div className="bg-white border-b border-gray-200 p-4 text-center">
              <p className="text-gray-500">Failed to load chirps. Please try again.</p>
            </div>
          ) : chirps?.length === 0 ? (
            <div className="bg-white border-b border-gray-200 p-8 text-center">
              <div className="text-6xl mb-4">🐦</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No chirps yet</h3>
              <p className="text-gray-500">Follow some users or create your first chirp!</p>
            </div>
          ) : (
            chirps?.map((chirp: any) => (
              <ChirpCard key={chirp.id} chirp={chirp} />
            ))
          )}
        </div>
      </main>
    </>
  );
}
