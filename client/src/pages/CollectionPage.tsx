import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '../components/AuthContext';

// Profile Frame Collection Functions - Real database integration
const getUserFrameCollection = async (userId: string) => {
  console.log('🎮 getUserFrameCollection called with:', { userId });
  
  try {
    // Create Supabase client directly for web
    const { createClient } = await import('@supabase/supabase-js');
    
    const SUPABASE_URL = 'https://qrzbtituxxilnbgocdge.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFyemJ0aXR1eHhpbG5iZ29jZGdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyNDcxNDMsImV4cCI6MjA2NzgyMzE0M30.P-o5ND8qoiIpA1W-9WkM7RUOaGTjRtkEmPbCXGbrEI8';
    
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        storage: {
          getItem: (key: string) => Promise.resolve(localStorage.getItem(key)),
          setItem: (key: string, value: string) => Promise.resolve(localStorage.setItem(key, value)),
          removeItem: (key: string) => Promise.resolve(localStorage.removeItem(key))
        },
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    });

    console.log('✅ Using real Supabase client for getUserFrameCollection');
    
    // Use the database function to get user's frame collection
    const { data, error } = await supabase.rpc('get_user_frame_collection', {
      user_uuid: userId
    });
    
    if (error) {
      console.error('❌ Error fetching user frame collection:', error);
      return [];
    }
    
    const transformedCollection = (data || []).map((item: any) => ({
      id: item.collection_id,
      frameId: item.frame_id,
      name: item.frame_name,
      description: item.frame_description,
      rarity: item.frame_rarity,
      imageUrl: item.frame_image_url,
      previewUrl: item.frame_preview_url,
      quantity: item.quantity,
      obtainedAt: item.obtained_at,
      seasonName: item.season_name,
      isEquipped: item.is_equipped || false
    }));
    
    console.log('🎮 User frame collection loaded:', transformedCollection.length, 'frames');
    return transformedCollection;
  } catch (error) {
    console.error('❌ Error in getUserFrameCollection:', error);
    return [];
  }
};

const equipProfileFrame = async (userId: string, frameId: number) => {
  console.log('⚡ equipProfileFrame called with:', { userId, frameId });
  
  try {
    // Create Supabase client directly for web
    const { createClient } = await import('@supabase/supabase-js');
    
    const SUPABASE_URL = 'https://qrzbtituxxilnbgocdge.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFyemJ0aXR1eHhpbG5iZ29jZGdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyNDcxNDMsImV4cCI6MjA2NzgyMzE0M30.P-o5ND8qoiIpA1W-9WkM7RUOaGTjRtkEmPbCXGbrEI8';
    
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        storage: {
          getItem: (key: string) => Promise.resolve(localStorage.getItem(key)),
          setItem: (key: string, value: string) => Promise.resolve(localStorage.setItem(key, value)),
          removeItem: (key: string) => Promise.resolve(localStorage.removeItem(key))
        },
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    });

    console.log('✅ Using real Supabase client for equipProfileFrame');
    
    // Use the database function to equip the frame
    const { data, error } = await supabase.rpc('equip_profile_frame', {
      user_uuid: userId,
      frame_id: frameId
    });
    
    if (error) {
      console.error('❌ Error equipping profile frame:', error);
      return false;
    }
    
    console.log('🎯 Frame equipped successfully:', data);
    return data === true;
  } catch (error) {
    console.error('❌ Error in equipProfileFrame:', error);
    return false;
  }
};

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

interface ProfileFrame {
  id: number;
  frameId: number;
  name: string;
  description?: string;
  rarity: 'mythic' | 'legendary' | 'epic' | 'rare' | 'uncommon' | 'common';
  imageUrl: string;
  previewUrl?: string;
  quantity: number;
  obtainedAt: string;
  seasonName: string;
  isEquipped: boolean;
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
  const [collection, setCollection] = useState<ProfileFrame[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedSeason, setSelectedSeason] = useState<string>('All');

  // Load user's frame collection from database
  useEffect(() => {
    loadUserCollection();
  }, []);

  const loadUserCollection = async () => {
    try {
      setIsLoading(true);
      if (user?.id) {
        console.log('🎮 Loading frame collection for user:', user.id);
        const userCollection = await getUserFrameCollection(user.id);
        console.log('🎮 Frame collection data:', userCollection);
        setCollection(userCollection || []);
      } else {
        setCollection([]);
      }
    } catch (error) {
      console.error('❌ Error loading user frame collection:', error);
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

  const handleEquipFrame = async (frameId: number) => {
    if (!user?.id) return;
    
    try {
      const success = await equipProfileFrame(user.id, frameId);
      if (success) {
        // Refresh collection to update equipped status
        await loadUserCollection();
      }
    } catch (error) {
      console.error('❌ Error equipping frame:', error);
    }
  };

  // Group frames by season
  const framesBySeason = collection.reduce((acc, frame) => {
    const season = frame.seasonName;
    if (!acc[season]) {
      acc[season] = [];
    }
    acc[season].push(frame);
    return acc;
  }, {} as Record<string, ProfileFrame[]>);

  const seasons = Object.keys(framesBySeason);
  const filteredCollection = selectedSeason === 'All' 
    ? collection 
    : framesBySeason[selectedSeason] || [];

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
          }}>My Frame Collection</h1>
          <p style={{
            fontSize: '16px',
            color: '#6b7280',
            margin: 0
          }}>Your collected profile frames</p>
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
        }}>Your Frame Collection ({filteredCollection.length})</h2>

        {/* Season Filter */}
        <div style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '24px',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={() => setSelectedSeason('All')}
            style={{
              backgroundColor: selectedSeason === 'All' ? '#C671FF' : '#f3f4f6',
              color: selectedSeason === 'All' ? 'white' : '#374151',
              border: 'none',
              borderRadius: '20px',
              padding: '8px 16px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            All ({collection.length})
          </button>
          {seasons.map(season => (
            <button
              key={season}
              onClick={() => setSelectedSeason(season)}
              style={{
                backgroundColor: selectedSeason === season ? '#C671FF' : '#f3f4f6',
                color: selectedSeason === season ? 'white' : '#374151',
                border: 'none',
                borderRadius: '20px',
                padding: '8px 16px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              {season} ({framesBySeason[season]?.length || 0})
            </button>
          ))}
        </div>

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
            }}>No profile frames collected yet</p>
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
            {filteredCollection.map((frame) => (
              <div
                key={frame.id}
                style={{
                  width: '300px',
                  backgroundColor: '#f3e8ff',
                  borderRadius: '12px',
                  padding: '20px',
                  border: '1px solid #e5e7eb',
                  alignItems: 'center',
                  position: 'relative'
                }}
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
                  backgroundColor: rarityColors[frame.rarity],
                  zIndex: 1
                }}>
                  <span style={{
                    color: '#ffffff',
                    fontSize: '10px',
                    fontWeight: 'bold'
                  }}>{rarityNames[frame.rarity]}</span>
                </div>

                {/* Frame Image */}
                <div style={{
                  width: '120px',
                  height: '120px',
                  margin: '0 auto 16px auto',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <img
                    src={frame.imageUrl}
                    alt={frame.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain'
                    }}
                  />
                </div>

                {/* Frame Info */}
                <div style={{ textAlign: 'center' }}>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: 'bold',
                    color: '#1f2937',
                    marginBottom: '8px',
                    margin: 0
                  }}>{frame.name}</h3>
                  <p style={{
                    fontSize: '14px',
                    color: '#6b7280',
                    marginBottom: '8px',
                    margin: 0
                  }}>{frame.description}</p>
                  <p style={{
                    fontSize: '12px',
                    color: '#9ca3af',
                    marginBottom: '16px',
                    margin: 0
                  }}>Season: {frame.seasonName}</p>
                  
                  {/* Equip Button */}
                  <button
                    onClick={() => handleEquipFrame(frame.frameId)}
                    disabled={frame.isEquipped}
                    style={{
                      width: '100%',
                      backgroundColor: frame.isEquipped ? '#10b981' : '#C671FF',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '12px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: frame.isEquipped ? 'default' : 'pointer',
                      opacity: frame.isEquipped ? 0.8 : 1
                    }}
                  >
                    {frame.isEquipped ? 'Equipped' : 'Equip Frame'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
