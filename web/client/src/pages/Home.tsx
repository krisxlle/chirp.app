import { useInfiniteQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../components/AuthContext";
import ChirpCard from "../components/ChirpCard";
import ComposeChirp from "../components/ComposeChirp";
import ContactsPrompt from "../components/ContactsPrompt";
import { Skeleton } from "../components/ui/skeleton";
import { useToast } from "../hooks/use-toast";
import { isUnauthorizedError } from "./authUtils.ts";

export default function Home() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [allChirps, setAllChirps] = useState<any[]>([]);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = useInfiniteQuery({
    queryKey: ["/api/chirps", "personalized"],
    queryFn: async ({ pageParam = 0 }) => {
      const response = await fetch(`/api/chirps?personalized=true&limit=10&offset=${pageParam}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch chirps');
      return response.json();
    },
    getNextPageParam: (lastPage, allPages) => {
      console.log('📄 getNextPageParam:', {
        lastPageLength: lastPage.length,
        allPagesLength: allPages.length,
        hasNextPage: lastPage.length >= 10
      });
      // If the last page has fewer than 10 items, we've reached the end
      if (lastPage.length < 10) return undefined;
      // Return the next offset
      return allPages.length * 10;
    },
    enabled: isAuthenticated,
  });

  // Flatten all pages into a single array
  useEffect(() => {
    if (data) {
      const flattened = data.pages.flat();
      setAllChirps(flattened);
    }
  }, [data]);

  // Infinite scroll handler
  const handleScroll = useCallback(() => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.offsetHeight;
    
    // Trigger when user is 200px from bottom
    if (scrollTop + windowHeight >= documentHeight - 200) {
      if (hasNextPage && !isFetchingNextPage) {
        console.log('🔄 Triggering infinite scroll - fetching next page');
        fetchNextPage();
      }
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Add scroll event listener with throttling
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const throttledHandleScroll = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleScroll, 100);
    };
    
    window.addEventListener('scroll', throttledHandleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', throttledHandleScroll);
      clearTimeout(timeoutId);
    };
  }, [handleScroll]);

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
      {/* Main Content */}
      <main className="pb-4 mb-20 overflow-y-auto scrollbar-hide">
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
          ) : allChirps?.length === 0 ? (
            <div className="bg-white border-b border-gray-200 p-8 text-center">
              <div className="text-6xl mb-4">🐦</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No chirps yet</h3>
              <p className="text-gray-500">Follow some users or create your first chirp!</p>
            </div>
          ) : (
            <>
              {allChirps?.map((chirp: any) => (
                <ChirpCard key={chirp.id} chirp={chirp} />
              ))}
              
              {/* Loading more indicator */}
              {isFetchingNextPage && (
                <div className="bg-white border-b border-gray-200 p-4 text-center">
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                    <span className="text-gray-500">Loading more chirps...</span>
                  </div>
                </div>
              )}
              
              {/* End of feed indicator */}
              {!hasNextPage && allChirps.length > 0 && (
                <div className="bg-white border-b border-gray-200 p-4 text-center">
                  <p className="text-gray-500">You've reached the end! 🎉</p>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </>
  );
}
