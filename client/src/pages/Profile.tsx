import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import ChirpCard from '../components/ChirpCard';
import UserAvatar from '../components/UserAvatar';
import { useAuth } from '../hooks/useAuth';

// Inline API functions to fetch real data from Supabase
const getUserChirps = async (userId: string) => {
  console.log('🔍 getUserChirps called with:', { userId });
  
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

    console.log('✅ Using real Supabase client for getUserChirps');
    
    // Fetch user's chirps from database with optimized query (limited results)
    const { data: chirps, error } = await supabase
      .from('chirps')
      .select(`
        id,
        content,
        created_at,
        reply_to_id,
        author_id,
        image_url,
        image_alt_text,
        image_width,
        image_height,
        users!inner (
          id,
          first_name,
          last_name,
          email,
          handle,
          custom_handle,
          profile_image_url,
          avatar_url
        )
      `)
      .eq('author_id', userId)
      .order('created_at', { ascending: false })
      .limit(20); // Limit to 20 most recent chirps to avoid timeout

    if (error) {
      console.error('❌ Supabase error fetching user chirps:', error);
      throw error;
    }

    if (chirps && chirps.length > 0) {
      console.log('✅ Fetched', chirps.length, 'real user chirps from database');
      
      // Transform the data to match expected format
      return chirps.map(chirp => {
        // Handle the case where users might be an array (shouldn't happen with !inner but safety first)
        const author = Array.isArray(chirp.users) ? chirp.users[0] : chirp.users;
        
        return {
          id: chirp.id,
          content: chirp.content,
          createdAt: chirp.created_at,
          replyToId: chirp.reply_to_id,
          imageUrl: chirp.image_url,
          imageAltText: chirp.image_alt_text,
          imageWidth: chirp.image_width,
          imageHeight: chirp.image_height,
          author: {
            id: author.id,
            firstName: author.first_name,
            lastName: author.last_name,
            email: author.email,
            handle: author.handle,
            customHandle: author.custom_handle,
            profileImageUrl: author.profile_image_url,
            avatarUrl: author.avatar_url,
            isChirpPlus: false,
            showChirpPlusBadge: false
          },
          likes: 0, // Default to 0 since column doesn't exist
          replies: 0, // Default to 0 since column doesn't exist
          reposts: 0, // Default to 0 since column doesn't exist
          isLiked: false, // Default to false since column doesn't exist
          isReposted: false, // Default to false since column doesn't exist
          reactionCounts: {}, // Default to empty object since column doesn't exist
          userReaction: null, // Default to null since column doesn't exist
          repostOf: null, // Default to null since column doesn't exist
          isAiGenerated: false, // Default to false since column doesn't exist
          isWeeklySummary: false, // Default to false since column doesn't exist
          threadId: null, // Default to null since column doesn't exist
          threadOrder: null, // Default to null since column doesn't exist
          isThreadStarter: true // Default to true since column doesn't exist
        };
      });
    } else {
      console.log('📭 No user chirps found in database');
      return [];
    }
  } catch (error) {
    console.error('❌ Error fetching real user chirps from Supabase:', error);
    console.error('❌ Supabase connection details:', {
      url: 'https://qrzbtituxxilnbgocdge.supabase.co',
      hasKey: true,
      errorMessage: error.message,
      errorCode: error.code
    });
    
    // Instead of falling back to mock data, throw the error
    throw new Error(`Failed to fetch user chirps from database: ${error.message}`);
  }
};

const getUserStats = async (userId: string) => {
  console.log('🔍 getUserStats called with:', { userId });
  
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

    console.log('✅ Using real Supabase client for getUserStats');
    
    // Calculate real stats from database
    const [chirpsResult, likesResult] = await Promise.all([
      // Count user's chirps
      supabase
        .from('chirps')
        .select('id', { count: 'exact', head: true })
        .eq('author_id', userId),
      
      // Count total likes received (from reactions table if it exists)
      supabase
        .from('reactions')
        .select('id', { count: 'exact', head: true })
        .eq('chirp_id', userId) // This might need adjustment based on actual schema
    ]);

    const totalChirps = chirpsResult.count || 0;
    const totalLikes = likesResult.count || 0;
    
    // Calculate profile power based on activity
    const profilePower = Math.floor((totalChirps * 10) + (totalLikes * 2));
    
    console.log('📊 Calculated stats:', { totalChirps, totalLikes, profilePower });
    
    return {
      following: 0, // Will be implemented when following system is added
      followers: 0, // Will be implemented when following system is added
      profilePower: profilePower,
      totalChirps: totalChirps,
      totalLikes: totalLikes
    };
  } catch (error) {
    console.error('❌ Error fetching user stats from Supabase:', error);
    // Return default stats on error
    return {
      following: 0,
      followers: 0,
      profilePower: 0,
      totalChirps: 0,
      totalLikes: 0
    };
  }
};

const getProfilePowerBreakdown = async (userId: string) => {
  console.log('🔍 getProfilePowerBreakdown called with:', { userId });
  
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

    console.log('✅ Using real Supabase client for getProfilePowerBreakdown');
    
    // For now, return default breakdown since we don't have likes/comments tables yet
    // TODO: Implement real profile power calculation system
    return {
      totalPower: 0, // Will be calculated based on user activity
      likesContribution: 0, // Will be calculated from likes received
      commentsContribution: 0, // Will be calculated from comments made
      collectionContribution: 0, // Will be calculated from collection activity
      rarityFactor: 1.0, // Will be based on user rarity
      totalLikes: 0, // Will be calculated from likes count
      totalComments: 0 // Will be calculated from comments count
    };
  } catch (error) {
    console.error('❌ Error fetching profile power breakdown from Supabase:', error);
    throw new Error(`Failed to fetch profile power breakdown from database: ${error.message}`);
  }
};

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
          
          // Fetch actual user data from Supabase
          const { createClient } = await import('@supabase/supabase-js');
          const SUPABASE_URL = 'https://qrzbtituxxilnbgocdge.supabase.co';
          const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFyemJ0aXR1eHhpbG5iZ29jZGdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyNDcxNDMsImV4cCI6MjA2NzgyMzE0M30.P-o5ND8qoiIpA1W-9WkM7RUOaGTjRtkEmPbCXGbrEI8';
          
          const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
          
          // Try to find user by ID first, then by handle/email
          let userData;
          const { data: userFromDb, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();
          
          if (userFromDb && !userError) {
            userData = {
              id: userFromDb.id,
              firstName: userFromDb.first_name,
              lastName: userFromDb.last_name,
              email: userFromDb.email,
              name: userFromDb.display_name || `${userFromDb.first_name} ${userFromDb.last_name}`,
              customHandle: userFromDb.custom_handle,
              handle: userFromDb.handle,
              profileImageUrl: userFromDb.profile_image_url,
              avatarUrl: userFromDb.avatar_url,
              bannerImageUrl: userFromDb.banner_image_url,
              bio: userFromDb.bio,
              linkInBio: userFromDb.link_in_bio || 'https://github.com/user',
              joinedAt: userFromDb.created_at || '2024-01-15T00:00:00Z',
              isChirpPlus: userFromDb.is_chirp_plus || false,
              showChirpPlusBadge: userFromDb.show_chirp_plus_badge || false
            };
          } else {
            // Fallback to authUser data if not found in database
            userData = authUser ? {
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
              linkInBio: authUser.linkInBio || 'https://github.com/user',
              joinedAt: authUser.joinedAt || '2024-01-15T00:00:00Z',
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
          }
          
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
          console.error('❌ Profile: Error loading user profile data:', error);
          console.error('❌ Profile: Clearing profile data due to error');
          // Clear the profile data to force a retry
          setUser(null);
          setUserChirps([]);
          setStats({
            following: 0,
            followers: 0,
            profilePower: 0
          });
        }
      } else {
        console.error('❌ Profile: No userId provided');
        setUser(null);
        setUserChirps([]);
        setStats({
          following: 0,
          followers: 0,
          profilePower: 0
        });
      }
    } catch (error) {
      console.error('❌ Profile: Failed to load user profile:', error);
      console.error('❌ Profile: Clearing profile data due to error');
      // Clear the profile data to force a retry
      setUser(null);
      setUserChirps([]);
      setStats({
        following: 0,
        followers: 0,
        profilePower: 0
      });
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
      paddingBottom: '80px', // Space for bottom navigation
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center' // Center content like Metro
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
        flexDirection: 'row',
        width: '100%',
        maxWidth: '600px' // Match Metro width
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
      <div style={{ 
        position: 'relative',
        width: '100%',
        maxWidth: '600px' // Match Metro width
      }}>
        {/* Banner */}
        <div 
          style={{
            height: '192px',
            background: user.bannerImageUrl 
              ? `url(${user.bannerImageUrl})` 
              : 'url(https://qrzbtituxxilnbgocdge.supabase.co/storage/v1/object/public/assets/chirp-banner-default.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            width: '100%'
          }}
        />
        
        {/* Profile Avatar - Positioned like Metro */}
        <div style={{
          position: 'absolute',
          top: '-44px', // Half overlap with banner like Metro
          left: '16px',
          width: '88px', // 80px avatar + 8px border
          height: '88px', // 80px avatar + 8px border
          borderRadius: '44px',
          border: '4px solid #ffffff',
          overflow: 'hidden',
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <UserAvatar user={user} size="lg" showFrame={true} />
        </div>
        
        {/* Profile Info */}
        <div style={{
          paddingLeft: '16px',
          paddingRight: '16px',
          paddingBottom: '16px',
          backgroundColor: '#ffffff',
          marginTop: '44px' // Account for avatar overlap
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'flex-end',
            gap: '16px'
          }}>
            <div style={{ flex: 1 }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '4px'
              }}>
                <h2 style={{
                  fontSize: '20px',
                  fontWeight: 'bold',
                  color: '#14171a',
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
                color: '#657786',
                marginBottom: '12px',
                margin: 0,
                fontSize: '15px'
              }}>@{user.handle}</p>
              {user.bio && (
                <p style={{
                  color: '#14171a',
                  marginBottom: '12px',
                  margin: 0,
                  fontSize: '15px',
                  lineHeight: '20px'
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
                    gap: '8px',
                    marginBottom: '12px',
                    fontSize: '14px'
                  }}
                >
                  <span style={{ fontSize: '14px' }}>🔗</span>
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
      <div style={{ 
        paddingLeft: '16px', 
        paddingRight: '16px',
        width: '100%',
        maxWidth: '600px' // Match Metro width
      }}>
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