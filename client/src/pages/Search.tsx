import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import ChirpCard from "../components/ChirpCard";
import UserAvatar from "../components/UserAvatar";
import { ArrowLeft, Search as SearchIcon } from "lucide-react";
import { useLocation } from "wouter";

export default function Search() {
  const [, setLocation] = useLocation();
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState("chirps");

  // Handle URL parameters for hashtag queries
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const queryParam = urlParams.get('q');
    if (queryParam) {
      setQuery(decodeURIComponent(queryParam));
      // If it's a hashtag, set the tab to chirps
      if (queryParam.startsWith('#')) {
        setActiveTab('chirps');
      }
    }
  }, []);

  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ["/api/search/users", query],
    enabled: !!query.trim() && activeTab === "users",
  });

  // Check if query is a hashtag to use appropriate API
  const isHashtagQuery = query.startsWith('#');
  
  const { data: chirps = [], isLoading: chirpsLoading } = useQuery({
    queryKey: isHashtagQuery 
      ? [`/api/hashtags/${query.substring(1)}/chirps`] 
      : ["/api/search/chirps", query],
    enabled: !!query.trim() && activeTab === "chirps",
  });

  const { data: trendingHashtags = [], isLoading: trendingLoading } = useQuery({
    queryKey: ["/api/trending/hashtags"],
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Format trending topics for display
  const trendingTopics = Array.isArray(trendingHashtags) ? trendingHashtags.map((item: any) => ({
    hashtag: item.hashtag,
    count: `${item.count} chirp${item.count !== 1 ? 's' : ''}`,
  })) : [];

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
          <div className="flex-1 relative min-w-0">
            <Input
              type="text"
              placeholder="Search..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10 bg-gray-100 dark:bg-gray-800 border-0 rounded-full focus-visible:ring-2 focus-visible:ring-primary text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
            />
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 h-4 w-4" />
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="pb-20">
        {!query ? (
          // Trending section when no search query
          <div className="p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Trending</h3>
            {trendingLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="p-3 rounded-lg">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-2/3"></div>
                  </div>
                ))}
              </div>
            ) : trendingTopics.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">📈</div>
                <p className="text-gray-500 dark:text-gray-400">No trending hashtags yet</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                  Start chirping with hashtags to see trends!
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {trendingTopics.map((topic: any, index: number) => (
                  <button
                    key={index}
                    className="w-full text-left p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    onClick={() => {
                      setQuery(topic.hashtag);
                      setActiveTab("chirps");
                      // Update URL to include query parameter
                      window.history.pushState({}, '', `/search?q=${encodeURIComponent(topic.hashtag)}`);
                    }}
                  >
                    <div className="font-medium text-gray-900 dark:text-white">{topic.hashtag}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{topic.count}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          // Search results
          <div className="p-4">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="chirps">Chirps</TabsTrigger>
                <TabsTrigger value="users">People</TabsTrigger>
              </TabsList>
              
              <TabsContent value="users" className="mt-4">
                {usersLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="flex items-center space-x-3 p-3">
                        <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : !Array.isArray(users) || users.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-4">👤</div>
                    <p className="text-gray-500">No users found for "{query}"</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {Array.isArray(users) && users.map((user: any) => (
                      <button
                        key={user.id}
                        className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        onClick={() => setLocation(`/profile/${user.id}`)}
                      >
                        <UserAvatar user={user} size="md" />
                        <div className="flex-1 text-left min-w-0">
                          <div className="font-semibold text-gray-900 dark:text-white truncate">
                            {user.customHandle || user.handle || `User ${user.id}`}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 truncate">@{user.customHandle || user.handle || user.id}</div>
                          {user.bio && (
                            <div className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2 break-words">
                              {user.bio}
                            </div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="chirps" className="mt-4">
                {chirpsLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex space-x-3">
                          <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
                            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                            <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : !Array.isArray(chirps) || chirps.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-4">🐦</div>
                    <p className="text-gray-500">No chirps found for "{query}"</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {Array.isArray(chirps) && chirps.map((chirp: any) => (
                      <div key={chirp.id} className="border border-gray-200 rounded-lg overflow-hidden">
                        <ChirpCard chirp={chirp} />
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        )}
      </main>
    </>
  );
}
