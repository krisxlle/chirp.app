import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Settings, Users, UserPlus, Calendar, Link, Crown } from 'lucide-react';
import UserAvatar from '../components/UserAvatar';
import ChirpCard from '../components/ChirpCard';
import ProfileFrame from '../components/ProfileFrame';

interface User {
  id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  customHandle?: string;
  handle?: string;
  profileImageUrl?: string;
  avatarUrl?: string;
  bannerImageUrl?: string;
  bio?: string;
  linkInBio?: string;
  joinedAt?: string;
  isChirpPlus?: boolean;
  showChirpPlusBadge?: boolean;
}

interface ProfileStats {
  following: number;
  followers: number;
  profilePower: number;
}

export default function Profile() {
  const { user: authUser } = useAuth();
  const [location] = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'chirps' | 'comments' | 'collection'>('chirps');
  const [userChirps, setUserChirps] = useState<any[]>([]);
  const [userReplies, setUserReplies] = useState<any[]>([]);
  const [stats, setStats] = useState<ProfileStats>({
    following: 0,
    followers: 0,
    profilePower: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  // Extract userId from URL or use current user
  const userId = location.includes('/profile/') 
    ? location.split('/profile/')[1] 
    : authUser?.id;

  useEffect(() => {
    if (userId) {
      loadUserProfile();
    }
  }, [userId]);

  const loadUserProfile = async () => {
    setIsLoading(true);
    try {
      // Mock user data
      const mockUser: User = {
        id: userId || '1',
        firstName: 'Kriselle',
        lastName: 'Tan',
        email: 'kriselle.t@gmail.com',
        handle: 'kriselle',
        customHandle: 'kriselle',
        profileImageUrl: null,
        bannerImageUrl: null,
        bio: 'Building amazing things with Chirp! 🚀',
        linkInBio: 'https://github.com/kriselle',
        joinedAt: '2024-01-15T00:00:00Z',
        isChirpPlus: false,
        showChirpPlusBadge: false
      };

      const mockStats: ProfileStats = {
        following: 150,
        followers: 320,
        profilePower: 1250
      };

      const mockChirps = [
        {
          id: '1',
          content: 'Just shipped a new feature to Chirp! ✨',
          author: mockUser,
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          likes: 42,
          replies: 8,
          reposts: 12,
          isLiked: true,
          isReposted: false,
            reactionCounts: { '👍': 20, '❤️': 15, '😂': 7 },
            userReaction: '❤️',
            repostOf: null,
          isAiGenerated: false,
          isWeeklySummary: false,
          threadId: null,
          threadOrder: null,
          isThreadStarter: true
        }
      ];

      const mockReplies = [
        {
          id: 'reply1',
          content: 'Great work on this feature! Really excited to try it out.',
          author: mockUser,
          createdAt: new Date(Date.now() - 1800000).toISOString(),
          likes: 5,
          replies: 0,
          reposts: 0,
          isLiked: false,
          isReposted: false,
          reactionCounts: { '👍': 3, '❤️': 2 },
          userReaction: null,
          repostOf: null,
          isAiGenerated: false,
          isWeeklySummary: false,
          threadId: null,
          threadOrder: null,
          isThreadStarter: false,
          replyToId: 'parent-chirp-id'
        },
        {
          id: 'reply2',
          content: 'This looks amazing! When will it be available?',
          author: mockUser,
          createdAt: new Date(Date.now() - 2700000).toISOString(),
          likes: 8,
          replies: 1,
          reposts: 0,
          isLiked: true,
          isReposted: false,
          reactionCounts: { '👍': 5, '❤️': 3 },
          userReaction: '❤️',
          repostOf: null,
          isAiGenerated: false,
          isWeeklySummary: false,
          threadId: null,
          threadOrder: null,
          isThreadStarter: false,
          replyToId: 'parent-chirp-id-2'
        }
      ];

      setUser(mockUser);
      setStats(mockStats);
      setUserChirps(mockChirps);
      setUserReplies(mockReplies);
    } catch (error) {
      console.error('Failed to load user profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatJoinDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long' 
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">User not found</h2>
          <p className="text-gray-500">The user you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const isOwnProfile = authUser?.id === user.id;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <UserAvatar user={user} size="sm" />
            <div>
              <h1 className="text-lg font-semibold text-gray-900">
                {user.firstName} {user.lastName}
              </h1>
              <p className="text-sm text-gray-500">@{user.handle}</p>
            </div>
          </div>
          {isOwnProfile && (
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          )}
        </div>
      </div>

      {/* Profile Header */}
      <div className="relative">
        {/* Banner */}
        <div 
          className="h-48 bg-gradient-to-r from-purple-500 to-pink-500"
          style={{
            backgroundImage: user.bannerImageUrl ? `url(${user.bannerImageUrl})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
        
        {/* Profile Info */}
        <div className="px-4 pb-4 bg-white">
          <div className="flex items-end space-x-4 -mt-16">
            <ProfileFrame rarity="epic" size={60}>
              <UserAvatar user={user} size="fill" />
            </ProfileFrame>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <h2 className="text-xl font-bold text-gray-900">
                  {user.firstName} {user.lastName}
                </h2>
                {user.isChirpPlus && (
                  <Crown className="h-5 w-5 text-yellow-500" />
                )}
              </div>
              <p className="text-gray-500 mb-2">@{user.handle}</p>
              {user.bio && (
                <p className="text-gray-700 mb-2">{user.bio}</p>
              )}
              {user.linkInBio && (
                <a 
                  href={user.linkInBio} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-purple-600 hover:text-purple-800 flex items-center space-x-1"
                >
                  <Link className="h-4 w-4" />
                  <span>{user.linkInBio}</span>
                </a>
              )}
              <div className="flex items-center space-x-1 mt-2 text-sm text-gray-500">
                <Calendar className="h-4 w-4" />
                <span>Joined {formatJoinDate(user.joinedAt || '')}</span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center space-x-6 mt-4">
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900">{stats.following}</div>
              <div className="text-sm text-gray-500">Following</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900">{stats.followers}</div>
              <div className="text-sm text-gray-500">Followers</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900">{stats.profilePower}</div>
              <div className="text-sm text-gray-500">Profile Power</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3 mt-4">
            {!isOwnProfile && (
              <>
                <Button className="flex-1">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Follow
                </Button>
                <Button variant="outline">
                  <Users className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="chirps">Chirps</TabsTrigger>
            <TabsTrigger value="comments">Comments</TabsTrigger>
            <TabsTrigger value="collection">Collection</TabsTrigger>
          </TabsList>
          
          <TabsContent value="chirps" className="mt-4">
            <div className="space-y-4">
              {userChirps.length > 0 ? (
                userChirps.map((chirp) => (
                  <ChirpCard key={chirp.id} chirp={chirp} />
                ))
              ) : (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">🐦</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No chirps yet</h3>
                  <p className="text-gray-500">This user hasn't posted any chirps yet.</p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="comments" className="mt-4">
            <div className="space-y-4">
              {userReplies.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">💬</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No comments yet</h3>
                  <p className="text-gray-500">This user hasn't made any comments yet.</p>
                </div>
              ) : (
                userReplies.map((reply) => (
                  <ChirpCard key={reply.id} chirp={reply} />
                ))
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="collection" className="mt-4">
            <div className="text-center py-8">
              <div className="text-6xl mb-4">🎴</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No collection yet</h3>
              <p className="text-gray-500">This user hasn't collected any cards yet.</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}