import { useQuery } from "@tanstack/react-query";
import { Clock, Sparkles, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import ChirpCard from "../components/ChirpCard";
import ComposeChirp from "../components/ComposeChirp";
import ContactsPrompt from "../components/ContactsPrompt";
import { Button } from "../components/ui/button";
import { Skeleton } from "../components/ui/skeleton";
import { useToast } from "../hooks/use-toast";
import { useAuth } from "../hooks/useAuth";
import { isUnauthorizedError } from "./authUtils";

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
      <div className="metro-feed-container flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-metro-purple"></div>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <header className="metro-header sticky top-0 z-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <img 
              src="/logo.jpg" 
              alt="Chirp" 
              className="w-8 h-8 object-cover object-center rounded-lg"
            />
          </div>
          
          {/* Feed Type Selector */}
          <div className="metro-tabs-button-container">
            <Button
              variant={feedType === 'personalized' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setFeedType('personalized')}
              className={`metro-tab-button ${feedType === 'personalized' ? 'metro-tab-button-active' : ''}`}
            >
              <Sparkles className="h-3 w-3 mr-1" />
              For You
            </Button>
            <Button
              variant={feedType === 'chronological' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setFeedType('chronological')}
              className={`metro-tab-button ${feedType === 'chronological' ? 'metro-tab-button-active' : ''}`}
            >
              <Clock className="h-3 w-3 mr-1" />
              Latest
            </Button>
            <Button
              variant={feedType === 'trending' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setFeedType('trending')}
              className={`metro-tab-button ${feedType === 'trending' ? 'metro-tab-button-active' : ''}`}
            >
              <TrendingUp className="h-3 w-3 mr-1" />
              Trending
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="metro-feed-container pb-4 mb-20">
        <ContactsPrompt />
        <ComposeChirp />
        
        <div className="space-y-0">
          {isLoading ? (
            // Loading skeleton
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="metro-chirp-card">
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
            <div className="metro-chirp-card text-center">
              <p className="text-metro-text-muted">Failed to load chirps. Please try again.</p>
            </div>
          ) : chirps?.length === 0 ? (
            <div className="metro-chirp-card p-8 text-center">
              <div className="text-6xl mb-4">🐦</div>
              <h3 className="text-metro-lg font-semibold text-metro-text mb-2">No chirps yet</h3>
              <p className="text-metro-text-muted">Follow some users or create your first chirp!</p>
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
