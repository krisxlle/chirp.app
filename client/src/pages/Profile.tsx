import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import ChirpCard from '../components/ChirpCard';
import UserAvatar from '../components/UserAvatar';
import { apiRequest } from '../components/api';
import { useAuth } from '../hooks/useAuth';
import Settings from './Settings';

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
  const [location, setLocation] = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'chirps' | 'comments' | 'collection'>('chirps');
  const [userChirps, setUserChirps] = useState<any[]>([]);
  const [stats, setStats] = useState<ProfileStats>({
    following: 0,
    followers: 0,
    profilePower: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);

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
      // Try to load from API first
      if (userId) {
        try {
          const [userData, chirpsData, statsData] = await Promise.all([
            apiRequest(`/api/users/${userId}`),
            apiRequest(`/api/users/${userId}/chirps`),
            apiRequest(`/api/users/${userId}/stats`)
          ]);
          
          setUser(userData);
          setUserChirps(chirpsData || []);
          setStats(statsData || { following: 0, followers: 0, profilePower: 0 });
        } catch (error) {
          console.log('API failed, using mock data:', error);
          // Fallback to mock data
          loadMockData();
        }
      } else {
        loadMockData();
      }
    } catch (error) {
      console.error('Failed to load user profile:', error);
      loadMockData();
    } finally {
      setIsLoading(false);
    }
  };

  const loadMockData = () => {
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

    setUser(mockUser);
    setStats(mockStats);
    setUserChirps(mockChirps);
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
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          width: '32px',
          height: '32px',
          border: '2px solid #7c3aed',
          borderTop: '2px solid transparent',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '600',
            color: '#111827',
            marginBottom: '8px',
            margin: 0
          }}>User not found</h2>
          <p style={{
            color: '#6b7280',
            margin: 0
          }}>The user you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const isOwnProfile = authUser?.id === user.id;

  // Show settings page if settings is open
  if (showSettings) {
    return <Settings onClose={() => setShowSettings(false)} />;
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#ffffff',
      paddingBottom: '80px' // Space for bottom navigation
    }}>
      {/* Header */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e5e7eb',
        paddingLeft: '16px',
        paddingRight: '16px',
        paddingTop: '12px',
        paddingBottom: '12px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <UserAvatar user={user} size="sm" />
            <div>
              <h1 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#111827',
                margin: 0
              }}>
                {user.firstName} {user.lastName}
              </h1>
              <p style={{
                fontSize: '14px',
                color: '#6b7280',
                margin: 0
              }}>@{user.handle}</p>
            </div>
          </div>
              {isOwnProfile && (
                <button
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    paddingLeft: '12px',
                    paddingRight: '12px',
                    paddingTop: '6px',
                    paddingBottom: '6px',
                    borderRadius: '6px',
                    border: '1px solid #d1d5db',
                    backgroundColor: '#ffffff',
                    cursor: 'pointer',
                    gap: '8px'
                  }}
                  onClick={() => setShowSettings(true)}
                >
                  <span style={{ fontSize: '16px' }}>⚙️</span>
                  <span style={{
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#374151'
                  }}>Settings</span>
                </button>
              )}
        </div>
      </div>

      {/* Profile Header */}
      <div style={{ position: 'relative' }}>
        {/* Banner */}
        <div 
          style={{
            height: '192px',
            background: user.bannerImageUrl 
              ? `url(${user.bannerImageUrl})` 
              : 'linear-gradient(135deg, #7c3aed, #ec4899)',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
        
        {/* Profile Info */}
        <div style={{
          paddingLeft: '16px',
          paddingRight: '16px',
          paddingBottom: '16px',
          backgroundColor: '#ffffff'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'flex-end',
            gap: '16px',
            marginTop: '-64px'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '40px',
              border: '4px solid #ffffff',
              overflow: 'hidden'
            }}>
              <UserAvatar user={user} size="lg" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '8px'
              }}>
                <h2 style={{
                  fontSize: '20px',
                  fontWeight: 'bold',
                  color: '#111827',
                  margin: 0
                }}>
                  {user.firstName} {user.lastName}
                </h2>
                {user.isChirpPlus && (
                  <span style={{ fontSize: '20px' }}>👑</span>
                )}
              </div>
              <p style={{
                color: '#6b7280',
                marginBottom: '8px',
                margin: 0
              }}>@{user.handle}</p>
              {user.bio && (
                <p style={{
                  color: '#374151',
                  marginBottom: '8px',
                  margin: 0
                }}>{user.bio}</p>
              )}
              {user.linkInBio && (
                <a 
                  href={user.linkInBio} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{
                    color: '#7c3aed',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <span style={{ fontSize: '16px' }}>🔗</span>
                  <span>{user.linkInBio}</span>
                </a>
              )}
            </div>
          </div>

          {/* Stats */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            marginTop: '16px'
          }}>
            <div style={{ 
              flex: 1, 
              textAlign: 'center',
              cursor: 'pointer'
            }}>
              <div style={{
                fontSize: '18px',
                fontWeight: 'bold',
                color: '#14171a'
              }}>{stats.following}</div>
              <div style={{
                fontSize: '13px',
                color: '#657786',
                marginTop: '2px'
              }}>Following</div>
            </div>
            <div style={{ 
              flex: 1, 
              textAlign: 'center',
              cursor: 'pointer'
            }}>
              <div style={{
                fontSize: '18px',
                fontWeight: 'bold',
                color: '#14171a'
              }}>{stats.followers}</div>
              <div style={{
                fontSize: '13px',
                color: '#657786',
                marginTop: '2px'
              }}>Followers</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginTop: '16px'
          }}>
            {!isOwnProfile && (
              <>
                <button
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    paddingTop: '12px',
                    paddingBottom: '12px',
                    borderRadius: '20px',
                    backgroundColor: '#7c3aed',
                    color: '#ffffff',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}
                >
                  <span style={{ fontSize: '16px' }}>➕</span>
                  <span>Follow</span>
                </button>
                <button
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingTop: '12px',
                    paddingBottom: '12px',
                    paddingLeft: '16px',
                    paddingRight: '16px',
                    borderRadius: '20px',
                    border: '1px solid #d1d5db',
                    backgroundColor: '#ffffff',
                    cursor: 'pointer'
                  }}
                >
                  <span style={{ fontSize: '16px' }}>👥</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ paddingLeft: '16px', paddingRight: '16px' }}>
        <div style={{
          display: 'flex',
          backgroundColor: '#f7f9fa',
          borderRadius: '12px',
          padding: '3px',
          marginBottom: '16px'
        }}>
          <button
            style={{
              flex: 1,
              paddingTop: '8px',
              paddingBottom: '8px',
              borderRadius: '9px',
              backgroundColor: activeTab === 'chirps' ? '#ffffff' : 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              color: activeTab === 'chirps' ? '#111827' : '#6b7280'
            }}
            onClick={() => setActiveTab('chirps')}
          >
            Chirps
          </button>
          <button
            style={{
              flex: 1,
              paddingTop: '8px',
              paddingBottom: '8px',
              borderRadius: '9px',
              backgroundColor: activeTab === 'comments' ? '#ffffff' : 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              color: activeTab === 'comments' ? '#111827' : '#6b7280'
            }}
            onClick={() => setActiveTab('comments')}
          >
            Comments
          </button>
          <button
            style={{
              flex: 1,
              paddingTop: '8px',
              paddingBottom: '8px',
              borderRadius: '9px',
              backgroundColor: activeTab === 'collection' ? '#ffffff' : 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              color: activeTab === 'collection' ? '#111827' : '#6b7280'
            }}
            onClick={() => setActiveTab('collection')}
          >
            Collection
          </button>
        </div>
        
        {/* Tab Content */}
        {activeTab === 'chirps' && (
          <div style={{ marginTop: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {userChirps.length > 0 ? (
                userChirps.map((chirp) => (
                  <ChirpCard key={chirp.id} chirp={chirp} />
                ))
              ) : (
                <div style={{ textAlign: 'center', paddingTop: '32px', paddingBottom: '32px' }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>🐦</div>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#111827',
                    marginBottom: '8px',
                    margin: 0
                  }}>No chirps yet</h3>
                  <p style={{
                    color: '#6b7280',
                    margin: 0
                  }}>This user hasn't posted any chirps yet.</p>
                </div>
              )}
            </div>
          </div>
        )}
        
        {activeTab === 'comments' && (
          <div style={{ marginTop: '16px' }}>
            <div style={{ textAlign: 'center', paddingTop: '32px', paddingBottom: '32px' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>💬</div>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#111827',
                marginBottom: '8px',
                margin: 0
              }}>No comments yet</h3>
              <p style={{
                color: '#6b7280',
                margin: 0
              }}>This user hasn't made any comments yet.</p>
            </div>
          </div>
        )}
        
        {activeTab === 'collection' && (
          <div style={{ marginTop: '16px' }}>
            <div style={{ textAlign: 'center', paddingTop: '32px', paddingBottom: '32px' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎴</div>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#111827',
                marginBottom: '8px',
                margin: 0
              }}>No collection yet</h3>
              <p style={{
                color: '#6b7280',
                margin: 0
              }}>This user hasn't collected any cards yet.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}