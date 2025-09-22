import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import ChirpCard from '../components/ChirpCard';
import UserAvatar from '../components/UserAvatar';
import { useAuth } from '../hooks/useAuth';
import { getProfilePowerBreakdown, getUserChirps, getUserStats } from '@/lib/supabase-api.ts';

interface User {
  id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  name?: string; // Added name field from AuthContext
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
      if (userId) {
          try {
            console.log('🔄 Profile: Loading user profile for:', userId);
            console.log('🔍 Profile: AuthUser data:', authUser);
            
            // Use Supabase API for user chirps, stats, and profile power
            const [chirpsData, statsData, profilePowerData] = await Promise.all([
              getUserChirps(userId),
              getUserStats(userId),
              getProfilePowerBreakdown(userId)
            ]);
          
          // For user data, use the authenticated user data with proper mapping
          const userData = authUser ? {
            id: authUser.id,
            firstName: authUser.firstName,
            lastName: authUser.lastName,
            email: authUser.email,
            name: authUser.name,
            customHandle: authUser.customHandle,
            handle: authUser.handle,
            profileImageUrl: authUser.profileImageUrl,
            avatarUrl: authUser.avatarUrl,
            bannerImageUrl: authUser.bannerImageUrl,
            bio: authUser.bio,
            linkInBio: authUser.linkInBio || 'https://github.com/user', // Default if not set
            joinedAt: authUser.joinedAt || '2024-01-15T00:00:00Z', // Default if not set
            isChirpPlus: authUser.isChirpPlus || false,
            showChirpPlusBadge: authUser.showChirpPlusBadge || false
          } : {
            id: userId,
            firstName: 'User',
            lastName: 'Profile',
            email: 'user@chirp.com',
            name: 'User Profile',
            handle: 'userprofile',
            customHandle: 'userprofile',
            profileImageUrl: null,
            avatarUrl: null,
            bannerImageUrl: null,
            bio: 'Building amazing things with Chirp! 🚀',
            linkInBio: 'https://github.com/user',
            joinedAt: '2024-01-15T00:00:00Z',
            isChirpPlus: false,
            showChirpPlusBadge: false
          };
          
          console.log('✅ Profile: Loaded user data:', userData);
          console.log('✅ Profile: Loaded chirps:', chirpsData.length);
          console.log('✅ Profile: Loaded stats:', statsData);
          console.log('✅ Profile: Loaded profile power:', profilePowerData);
          
          setUser(userData);
          setUserChirps(chirpsData || []);
          setStats({
            following: statsData.following || 0,
            followers: statsData.followers || 0,
            profilePower: profilePowerData.totalPower || 0
          });
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
        borderBottom: '1px solid #e1e8ed',
        paddingLeft: '16px',
        paddingRight: '16px',
        paddingTop: '12px',
        paddingBottom: '12px',
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'row'
      }}>
        <button 
          onClick={() => setLocation('/')}
          style={{
            padding: '8px',
            marginRight: '16px',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            borderRadius: '8px',
            transition: 'background-color 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f2f5'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <span style={{
            fontSize: '20px',
            color: '#14171a'
          }}>←</span>
        </button>
        
        <div style={{
          flex: 1
        }}>
          <h1 style={{
            fontSize: '20px',
            fontWeight: 'bold',
            color: '#14171a',
            margin: 0
          }}>
            Profile
          </h1>
          <p style={{
            fontSize: '13px',
            color: '#657786',
            margin: 0
          }}>
            {userChirps.length} chirps
          </p>
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
              : 'url(https://qrzbtituxxilnbgocdge.supabase.co/storage/v1/object/public/assets/chirp-banner-default.png)',
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
              <UserAvatar user={user} size="lg" showFrame={true} />
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
                  {user.firstName && user.lastName 
                    ? `${user.firstName} ${user.lastName}` 
                    : user.name || user.customHandle || user.handle || 'User'}
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

          {/* Action Buttons */}
          {isOwnProfile && (
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              marginTop: '16px',
              marginBottom: '16px'
            }}>
              <button
                onClick={() => setLocation('/settings')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: '#ffffff',
                  paddingLeft: '16px',
                  paddingRight: '16px',
                  paddingTop: '10px',
                  paddingBottom: '10px',
                  borderRadius: '20px',
                  border: '1px solid #e1e8ed',
                  cursor: 'pointer',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  transition: 'all 0.2s',
                  height: '40px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f8fafc';
                  e.currentTarget.style.borderColor = '#7c3aed';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#ffffff';
                  e.currentTarget.style.borderColor = '#e1e8ed';
                }}
              >
                <span style={{
                  fontSize: '16px',
                  color: '#7c3aed'
                }}>⚙️</span>
                <span style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#14171a'
                }}>Settings</span>
              </button>
            </div>
          )}

          {/* Profile Power */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            paddingTop: '20px',
            paddingBottom: '20px',
            paddingLeft: '16px',
            paddingRight: '16px',
            backgroundColor: '#ffffff',
            borderBottom: '1px solid #e1e8ed',
            marginTop: '16px'
          }}>
            <div style={{
              textAlign: 'center'
            }}>
              <div style={{
                fontSize: '16px',
                color: '#657786',
                fontWeight: '600',
                marginBottom: '8px'
              }}>
                Profile Power
              </div>
              <div style={{
                fontSize: '48px',
                fontWeight: 'bold',
                color: '#7c3aed',
                textShadow: '0 2px 4px rgba(124, 58, 237, 0.3)'
              }}>
                {stats.profilePower.toLocaleString()}
              </div>
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