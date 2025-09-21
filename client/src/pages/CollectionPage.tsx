import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '../components/AuthContext';
import { apiRequest } from '../components/api';

// Analytics Icon Component
const AnalyticsIcon = ({ size = 20, color = "#ffffff" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path 
      d="M3 3v18h18" 
      stroke={color} 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
    <path 
      d="M18.7 8l-5.1 6.3-3.8-4.3L7 17" 
      stroke={color} 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </svg>
);

interface ProfileCard {
  id: string;
  name: string;
  handle: string;
  rarity: 'mythic' | 'legendary' | 'epic' | 'rare' | 'uncommon' | 'common';
  imageUrl?: string;
  bio: string;
  followers: number;
  profilePower: number;
  quantity: number;
  obtainedAt?: string;
  userId?: string;
}

const rarityColors = {
  mythic: '#ff6b6b',
  legendary: '#f59e0b',
  epic: '#8b5cf6',
  rare: '#3b82f6',
  uncommon: '#10b981',
  common: '#6b7280',
};

const rarityNames = {
  mythic: 'Mythic',
  legendary: 'Legendary',
  epic: 'Epic',
  rare: 'Rare',
  uncommon: 'Uncommon',
  common: 'Common',
};

export default function CollectionPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [collection, setCollection] = useState<ProfileCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Load user's collection from API
  useEffect(() => {
    loadUserCollection();
  }, []);

  const loadUserCollection = async () => {
    try {
      setIsLoading(true);
      if (user?.id) {
        console.log('🎮 Loading collection for user:', user.id);
        const response = await apiRequest(`/api/users/${user.id}/collection`);
        console.log('🎮 Collection data:', response);
        setCollection(response || []);
      } else {
        setCollection([]);
      }
    } catch (error) {
      console.error('❌ Error loading user collection:', error);
      setCollection([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadUserCollection();
    setIsRefreshing(false);
  };

  const handleProfileClick = (profile: ProfileCard) => {
    if (profile.userId) {
      setLocation(`/profile/${profile.userId}`);
    } else {
      setLocation(`/profile/${profile.id}`);
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      backgroundColor: '#ffffff',
      paddingTop: '80px',
      paddingBottom: '40px'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingLeft: '20px',
        paddingRight: '20px',
        paddingTop: '20px',
        paddingBottom: '20px',
        borderBottom: '1px solid #e5e7eb'
      }}>
        <div style={{ flex: 1 }}>
          <h1 style={{
            fontSize: '28px',
            fontWeight: 'bold',
            color: '#1f2937',
            marginBottom: '4px',
            margin: 0
          }}>My Collection</h1>
          <p style={{
            fontSize: '16px',
            color: '#6b7280',
            margin: 0
          }}>Your collected profile cards</p>
        </div>
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: '12px'
        }}>
          <button
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '20px',
              backgroundColor: '#C671FF',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              border: 'none',
              cursor: 'pointer',
              opacity: isRefreshing ? 0.5 : 1
            }}
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <span style={{ fontSize: '18px', color: '#ffffff' }}>🔄</span>
          </button>
          <button
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '22px',
              backgroundColor: '#7c3aed',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              border: 'none',
              cursor: 'pointer'
            }}
            onClick={() => setLocation('/analytics')}
          >
            <AnalyticsIcon size={20} color="#ffffff" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '20px',
        maxWidth: '1600px',
        alignSelf: 'center',
        width: '100%'
      }}>
        <h2 style={{
          fontSize: '20px',
          fontWeight: 'bold',
          color: '#1f2937',
          marginBottom: '16px',
          margin: 0
        }}>Your Collection ({collection.length})</h2>

        {isLoading ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            paddingTop: '40px',
            paddingBottom: '40px'
          }}>
            <p style={{
              fontSize: '18px',
              color: '#6b7280',
              margin: 0
            }}>Loading your collection...</p>
          </div>
        ) : collection.length === 0 ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            paddingTop: '40px',
            paddingBottom: '40px'
          }}>
            <p style={{
              fontSize: '18px',
              color: '#6b7280',
              marginBottom: '8px',
              margin: 0
            }}>No profile cards collected yet</p>
            <p style={{
              fontSize: '14px',
              color: '#9ca3af',
              margin: 0
            }}>Open some capsules to get started!</p>
          </div>
        ) : (
          <div style={{
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            gap: '16px'
          }}>
            {collection.map((profile) => (
              <div
                key={profile.id}
                style={{
                  width: '400px',
                  backgroundColor: '#f3e8ff',
                  borderRadius: '12px',
                  padding: '20px',
                  border: '1px solid #e5e7eb',
                  alignItems: 'center',
                  cursor: 'pointer',
                  position: 'relative'
                }}
                onClick={() => handleProfileClick(profile)}
              >
                {/* Rarity Badge */}
                <div style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  paddingLeft: '8px',
                  paddingRight: '8px',
                  paddingTop: '4px',
                  paddingBottom: '4px',
                  borderRadius: '8px',
                  backgroundColor: rarityColors[profile.rarity],
                  zIndex: 1
                }}>
                  <span style={{
                    color: '#ffffff',
                    fontSize: '10px',
                    fontWeight: 'bold'
                  }}>{rarityNames[profile.rarity]}</span>
                </div>

                {/* Profile Image */}
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '30px',
                  backgroundColor: rarityColors[profile.rarity],
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '8px',
                  overflow: 'hidden'
                }}>
                  {profile.imageUrl ? (
                    <img
                      src={profile.imageUrl}
                      alt={profile.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        borderRadius: '30px',
                        objectFit: 'cover'
                      }}
                    />
                  ) : (
                    <span style={{
                      color: '#ffffff',
                      fontSize: '24px',
                      fontWeight: 'bold'
                    }}>{profile.name.charAt(0)}</span>
                  )}
                </div>

                {/* Profile Info */}
                <h3 style={{
                  fontSize: '14px',
                  fontWeight: 'bold',
                  color: '#1f2937',
                  textAlign: 'center',
                  marginBottom: '2px',
                  margin: 0
                }}>{profile.name}</h3>
                <p style={{
                  fontSize: '12px',
                  color: '#6b7280',
                  textAlign: 'center',
                  marginBottom: '6px',
                  margin: 0
                }}>@{profile.handle}</p>
                <p style={{
                  fontSize: '11px',
                  color: '#374151',
                  textAlign: 'center',
                  marginBottom: '8px',
                  lineHeight: '14px',
                  margin: 0
                }}>{profile.bio}</p>

                {/* Stats */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'space-around',
                  marginBottom: '6px',
                  paddingLeft: '10px',
                  paddingRight: '10px'
                }}>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    flex: 1,
                    minWidth: '60px'
                  }}>
                    <span style={{
                      fontSize: '14px',
                      fontWeight: 'bold',
                      color: '#1f2937'
                    }}>{(profile.followers || 0).toLocaleString()}</span>
                    <span style={{
                      fontSize: '12px',
                      color: '#6b7280'
                    }}>Followers</span>
                  </div>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    flex: 1,
                    minWidth: '60px'
                  }}>
                    <span style={{
                      fontSize: '14px',
                      fontWeight: 'bold',
                      color: '#1f2937'
                    }}>{profile.profilePower || 0}</span>
                    <span style={{
                      fontSize: '12px',
                      color: '#6b7280'
                    }}>Power</span>
                  </div>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    flex: 1,
                    minWidth: '60px'
                  }}>
                    <span style={{
                      fontSize: '14px',
                      fontWeight: 'bold',
                      color: rarityColors[profile.rarity]
                    }}>{profile.quantity || 1}x</span>
                    <span style={{
                      fontSize: '12px',
                      color: '#6b7280'
                    }}>Owned</span>
                  </div>
                </div>

                {/* Obtained Date */}
                {profile.obtainedAt && (
                  <p style={{
                    fontSize: '10px',
                    color: '#9ca3af',
                    textAlign: 'center',
                    margin: 0
                  }}>
                    Opened: {new Date(profile.obtainedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
