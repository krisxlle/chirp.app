import { Hash, MessageSquare, Search, TrendingUp, Users } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '../components/AuthContext';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import UserAvatar from '../components/UserAvatar';

export default function Search() {
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<'trending' | 'chirps' | 'users'>('trending');
  const [trendingTopics, setTrendingTopics] = useState<any[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  // Mock trending hashtags
  useEffect(() => {
    setTrendingTopics([
      { hashtag: 'chirp', count: 1250, trending: true },
      { hashtag: 'socialmedia', count: 890, trending: true },
      { hashtag: 'tech', count: 650, trending: false },
      { hashtag: 'webdev', count: 420, trending: true },
      { hashtag: 'react', count: 380, trending: false },
      { hashtag: 'javascript', count: 320, trending: false },
    ]);
  }, []);

  const performSearch = async () => {
    if (!query.trim()) return;
    
    setIsLoading(true);
    try {
      // Mock search results
      if (activeTab === 'chirps') {
        setSearchResults([
          {
            id: '1',
            content: `Found chirp about ${query}`,
            author: {
              id: '1',
              firstName: 'Search',
              lastName: 'Result',
              email: 'search@example.com',
              handle: 'searchresult',
              customHandle: 'searchresult',
              profileImageUrl: null
            },
            createdAt: new Date().toISOString(),
            likes: 5,
            replies: 2,
            reposts: 1,
            isLiked: false,
            isReposted: false,
            reactionCounts: { '👍': 3, '❤️': 2 },
            userReaction: null,
            repostOf: null,
            isAiGenerated: false,
            isWeeklySummary: false,
            threadId: null,
            threadOrder: null,
            isThreadStarter: true
          }
        ]);
      } else if (activeTab === 'users') {
        setSearchResults([
          {
            id: '1',
            firstName: 'Search',
            lastName: 'User',
            email: 'searchuser@example.com',
            handle: 'searchuser',
            customHandle: 'searchuser',
            profileImageUrl: null,
            bio: `User related to ${query}`,
            followers: 150,
            following: 200
          }
        ]);
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (query.trim()) {
      performSearch();
    } else {
      setSearchResults([]);
    }
  }, [query, activeTab]);

  const handleHashtagClick = (hashtag: string) => {
    setQuery(`#${hashtag}`);
    setActiveTab('chirps');
  };

  const handleUserClick = (userId: string) => {
    setLocation(`/profile/${userId}`);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center space-x-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search chirps, users, or hashtags..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        {/* Tabs */}
        <div className="flex items-center space-x-1 mt-3 bg-gray-100 rounded-lg p-1">
          <Button
            variant={activeTab === 'trending' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('trending')}
            className={`h-8 px-3 ${activeTab === 'trending' ? 'bg-purple-600 text-white' : 'text-gray-600'}`}
          >
            <TrendingUp className="h-3 w-3 mr-1" />
            Trending
          </Button>
          <Button
            variant={activeTab === 'chirps' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('chirps')}
            className={`h-8 px-3 ${activeTab === 'chirps' ? 'bg-purple-600 text-white' : 'text-gray-600'}`}
          >
            <MessageSquare className="h-3 w-3 mr-1" />
            Chirps
          </Button>
          <Button
            variant={activeTab === 'users' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('users')}
            className={`h-8 px-3 ${activeTab === 'users' ? 'bg-purple-600 text-white' : 'text-gray-600'}`}
          >
            <Users className="h-3 w-3 mr-1" />
            Users
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {activeTab === 'trending' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900">Trending Topics</h2>
            <div className="grid grid-cols-1 gap-3">
              {trendingTopics.map((topic, index) => (
                <Card key={index} className="cursor-pointer hover:bg-gray-50" onClick={() => handleHashtagClick(topic.hashtag)}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Hash className="h-5 w-5 text-purple-600" />
                        <div>
                          <p className="font-semibold text-gray-900">#{topic.hashtag}</p>
                          <p className="text-sm text-gray-500">{topic.count} chirps</p>
                        </div>
                      </div>
                      {topic.trending && (
                        <Badge variant="secondary" className="bg-red-100 text-red-800">
                          Trending
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'chirps' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900">
              {query ? `Search Results for "${query}"` : 'Search Chirps'}
            </h2>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                <p className="text-gray-500 mt-2">Searching...</p>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="space-y-4">
                {searchResults.map((chirp) => (
                  <Card key={chirp.id}>
                    <CardContent className="p-4">
                      <div className="flex space-x-3">
                        <UserAvatar user={chirp.author} size="sm" />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold text-gray-900">
                              {chirp.author.firstName} {chirp.author.lastName}
                            </span>
                            <span className="text-gray-500">@{chirp.author.handle}</span>
                          </div>
                          <p className="text-gray-900 mt-1">{chirp.content}</p>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                            <span>{chirp.likes} likes</span>
                            <span>{chirp.replies} replies</span>
                            <span>{chirp.reposts} reposts</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : query ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No chirps found for "{query}"</p>
              </div>
            ) : (
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Search for chirps using the search bar above</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900">
              {query ? `Users matching "${query}"` : 'Search Users'}
            </h2>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                <p className="text-gray-500 mt-2">Searching...</p>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="space-y-4">
                {searchResults.map((user) => (
                  <Card key={user.id} className="cursor-pointer hover:bg-gray-50" onClick={() => handleUserClick(user.id)}>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <UserAvatar user={user} size="md" />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold text-gray-900">
                              {user.firstName} {user.lastName}
                            </span>
                            <span className="text-gray-500">@{user.handle}</span>
                          </div>
                          {user.bio && (
                            <p className="text-gray-600 text-sm mt-1">{user.bio}</p>
                          )}
                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                            <span>{user.followers} followers</span>
                            <span>{user.following} following</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : query ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No users found for "{query}"</p>
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Search for users using the search bar above</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}