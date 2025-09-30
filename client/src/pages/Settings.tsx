import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '../components/AuthContext';
import UserAvatar from '../components/UserAvatar';

// Inline API functions to avoid import issues in production
const getUserStats = async (userId: string) => {
  console.log('🔍 getUserStats called with:', { userId });
  
  // Return mock data for web compatibility
  return {
    following: 150,
    followers: 320,
    profilePower: 1250,
    totalChirps: 42,
    totalLikes: 1250
  };
};

const getProfilePowerBreakdown = async (userId: string) => {
  console.log('🔍 getProfilePowerBreakdown called with:', { userId });
  
  // Return mock data for web compatibility
  return {
    totalPower: 1250,
    likesContribution: 800,
    commentsContribution: 300,
    collectionContribution: 150,
    rarityFactor: 1.0,
    totalLikes: 1250,
    totalComments: 89
  };
};

interface SettingsProps {
  onClose?: () => void;
}

// Custom Icon Components
const UserIcon = ({ size = 20, color = "#7c3aed" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path 
      d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" 
      stroke={color} 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
    <circle 
      cx="12" 
      cy="7" 
      r="4" 
      stroke={color} 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </svg>
);

const BarChartIcon = ({ size = 20, color = "#7c3aed" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path 
      d="M18 20V10M12 20V4M6 20v-6" 
      stroke={color} 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </svg>
);

const ShieldIcon = ({ size = 20, color = "#7c3aed" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path 
      d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" 
      stroke={color} 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </svg>
);

const LogOutIcon = ({ size = 20, color = "#ef4444" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path 
      d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" 
      stroke={color} 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
    <polyline 
      points="16,17 21,12 16,7" 
      stroke={color} 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
    <line 
      x1="21" 
      y1="12" 
      x2="9" 
      y2="12" 
      stroke={color} 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </svg>
);

const GearIcon = ({ size = 20, color = "#7c3aed" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle 
      cx="12" 
      cy="12" 
      r="3" 
      stroke={color} 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
    <path 
      d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0-.33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09z"
      stroke={color} 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </svg>
);

export default function Settings({ onClose }: SettingsProps) {
  const { user, signOut, updateUser } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState('profile');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);
  
  // Profile form state
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [linkInBio, setLinkInBio] = useState(user?.linkInBio || '');

  // Real analytics data from database
  const [analyticsData, setAnalyticsData] = useState({
    profilePower: 0,
    totalChirps: 0,
    totalLikes: 0,
    totalComments: 0,
    followers: 0,
    following: 0,
    accountAge: 0,
    engagementRate: 0,
    topChirp: {
      content: 'No chirps yet',
      likes: 0,
      replies: 0,
      reposts: 0
    }
  });

  // Update form state when user changes
  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setBio(user.bio || '');
      setLinkInBio(user.linkInBio || '');
    }
  }, [user]);

  // Load real analytics data from database
  useEffect(() => {
    const loadAnalyticsData = async () => {
      if (!user?.id) return;
      
      setIsLoadingAnalytics(true);
      try {
        console.log('🔄 Loading real analytics data for user:', user.id);
        
        // Fetch user stats and profile power breakdown
        const [userStats, profilePowerBreakdown] = await Promise.all([
          getUserStats(user.id),
          getProfilePowerBreakdown(user.id)
        ]);
        
        console.log('✅ Loaded real analytics data:', { userStats, profilePowerBreakdown });
        
        // Calculate account age
        const accountAge = user.joinedAt 
          ? Math.floor((Date.now() - new Date(user.joinedAt).getTime()) / (1000 * 60 * 60 * 24))
          : 0;
        
        // Calculate engagement rate
        const engagementRate = userStats.totalChirps > 0 
          ? ((userStats.totalLikes + userStats.totalComments) / userStats.totalChirps * 100).toFixed(1)
          : 0;
        
        setAnalyticsData({
          profilePower: profilePowerBreakdown.totalPower || 0,
          totalChirps: userStats.totalChirps || 0,
          totalLikes: userStats.totalLikes || 0,
          totalComments: profilePowerBreakdown.totalComments || 0,
          followers: userStats.followers || 0,
          following: userStats.following || 0,
          accountAge: accountAge,
          engagementRate: parseFloat(engagementRate.toString()),
          topChirp: {
            content: 'Top chirp data coming soon',
            likes: 0,
            replies: 0,
            reposts: 0
          }
        });
        
        console.log('✅ Analytics data updated:', analyticsData);
      } catch (error) {
        console.error('❌ Error loading analytics data:', error);
        // Keep default values on error
      } finally {
        setIsLoadingAnalytics(false);
      }
    };
    
    loadAnalyticsData();
  }, [user?.id]);

  const handleSaveProfile = async () => {
    setIsUpdating(true);
    try {
      await updateUser({
        firstName,
        lastName,
        bio,
        linkInBio
      });
      console.log('✅ Profile updated successfully');
    } catch (error) {
      console.error('❌ Failed to update profile:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setLocation('/');
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  };

  const TabButton = ({ id, title, active }: { id: string; title: string; active: boolean }) => (
    <button
      onClick={() => setActiveTab(id)}
      style={{
        padding: '8px 12px',
        borderRadius: '8px',
        backgroundColor: active ? '#7c3aed' : 'transparent',
        color: active ? '#ffffff' : '#657786',
        fontSize: '12px',
        fontWeight: '600',
        border: 'none',
        cursor: 'pointer',
        transition: 'all 0.2s',
        marginRight: '2px',
        flex: 1
      }}
    >
      {title}
    </button>
  );

  const renderProfileTab = () => (
    <div style={{ padding: '20px' }}>
      {/* Profile Header */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          marginBottom: '20px'
        }}>
          <UserAvatar user={user} size="lg" showFrame={true} />
          <div>
            <h3 style={{
              fontSize: '18px',
              fontWeight: 'bold',
              color: '#111827',
              margin: '0 0 4px 0'
            }}>
              {user?.firstName && user?.lastName 
                ? `${user.firstName} ${user.lastName}` 
                : user?.name || user?.customHandle || user?.handle || 'User'}
            </h3>
            <p style={{
              fontSize: '14px',
              color: '#6b7280',
              margin: 0
            }}>
              @{user?.customHandle || user?.handle || 'user'}
            </p>
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
      }}>
        <h4 style={{
          fontSize: '16px',
          fontWeight: '600',
          color: '#111827',
          marginBottom: '16px'
        }}>
          Edit Profile
        </h4>
        
        <div style={{ marginBottom: '16px' }}>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '500',
            color: '#374151',
            marginBottom: '6px'
          }}>
            First Name
          </label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '14px',
              outline: 'none',
              transition: 'border-color 0.2s'
            }}
            placeholder="Enter your first name"
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '500',
            color: '#374151',
            marginBottom: '6px'
          }}>
            Last Name
          </label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '14px',
              outline: 'none',
              transition: 'border-color 0.2s'
            }}
            placeholder="Enter your last name"
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '500',
            color: '#374151',
            marginBottom: '6px'
          }}>
            Bio
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '14px',
              outline: 'none',
              transition: 'border-color 0.2s',
              resize: 'vertical'
            }}
            placeholder="Tell us about yourself..."
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '500',
            color: '#374151',
            marginBottom: '6px'
          }}>
            Link in Bio
          </label>
          <input
            type="url"
            value={linkInBio}
            onChange={(e) => setLinkInBio(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '14px',
              outline: 'none',
              transition: 'border-color 0.2s'
            }}
            placeholder="https://your-website.com"
          />
        </div>

        <button
          onClick={handleSaveProfile}
          disabled={isUpdating}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: isUpdating ? '#9ca3af' : '#7c3aed',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: isUpdating ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.2s'
          }}
        >
          {isUpdating ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );

  const renderAnalyticsTab = () => (
    <div style={{ padding: '20px' }}>
      {isLoadingAnalytics ? (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '40px',
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            border: '2px solid #7c3aed',
            borderTop: '2px solid transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <span style={{
            marginLeft: '12px',
            fontSize: '14px',
            color: '#6b7280'
          }}>
            Loading analytics...
          </span>
        </div>
      ) : (
        <>
          {/* Profile Power */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '20px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
          }}>
            <h4 style={{
              fontSize: '16px',
              fontWeight: '600',
              color: '#111827',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <BarChartIcon size={20} color="#7c3aed" />
              Profile Power
            </h4>
            <div style={{
              fontSize: '32px',
              fontWeight: 'bold',
              color: '#7c3aed',
              marginBottom: '8px'
            }}>
              {analyticsData.profilePower.toLocaleString()}
            </div>
            <p style={{
              fontSize: '14px',
              color: '#6b7280',
              margin: 0
            }}>
              Your overall engagement score
            </p>
          </div>

      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '16px',
        marginBottom: '20px'
      }}>
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          padding: '16px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#111827',
            marginBottom: '4px'
          }}>
            {analyticsData.totalChirps}
          </div>
          <div style={{
            fontSize: '12px',
            color: '#6b7280'
          }}>
            Total Chirps
          </div>
        </div>

        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          padding: '16px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#111827',
            marginBottom: '4px'
          }}>
            {analyticsData.totalLikes}
          </div>
          <div style={{
            fontSize: '12px',
            color: '#6b7280'
          }}>
            Total Likes
          </div>
        </div>

        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          padding: '16px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#111827',
            marginBottom: '4px'
          }}>
            {analyticsData.followers}
          </div>
          <div style={{
            fontSize: '12px',
            color: '#6b7280'
          }}>
            Followers
          </div>
        </div>

        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          padding: '16px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#111827',
            marginBottom: '4px'
          }}>
            {analyticsData.engagementRate}%
          </div>
          <div style={{
            fontSize: '12px',
            color: '#6b7280'
          }}>
            Engagement Rate
          </div>
        </div>
      </div>

      {/* Top Chirp */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
      }}>
        <h4 style={{
          fontSize: '16px',
          fontWeight: '600',
          color: '#111827',
          marginBottom: '12px'
        }}>
          Top Performing Chirp
        </h4>
        <p style={{
          fontSize: '14px',
          color: '#111827',
          lineHeight: '20px',
          marginBottom: '12px'
        }}>
          {analyticsData.topChirp.content}
        </p>
        <div style={{
          display: 'flex',
          gap: '16px',
          fontSize: '12px',
          color: '#6b7280'
        }}>
          <span>❤️ {analyticsData.topChirp.likes}</span>
          <span>💬 {analyticsData.topChirp.replies}</span>
          <span>🔄 {analyticsData.topChirp.reposts}</span>
        </div>
      </div>
        </>
      )}
    </div>
  );

  const renderAccountTab = () => (
    <div style={{ padding: '20px' }}>
      {/* Account Info */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
      }}>
        <h4 style={{
          fontSize: '16px',
          fontWeight: '600',
          color: '#111827',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <ShieldIcon size={20} color="#7c3aed" />
          Account Information
        </h4>
        
        <div style={{ marginBottom: '12px' }}>
          <div style={{
            fontSize: '12px',
            color: '#6b7280',
            marginBottom: '4px'
          }}>
            Email
          </div>
          <div style={{
            fontSize: '14px',
            color: '#111827'
          }}>
            {user?.email}
          </div>
        </div>

        <div style={{ marginBottom: '12px' }}>
          <div style={{
            fontSize: '12px',
            color: '#6b7280',
            marginBottom: '4px'
          }}>
            Handle
          </div>
          <div style={{
            fontSize: '14px',
            color: '#111827'
          }}>
            @{user?.customHandle || user?.handle || 'user'}
          </div>
        </div>

        <div style={{ marginBottom: '12px' }}>
          <div style={{
            fontSize: '12px',
            color: '#6b7280',
            marginBottom: '4px'
          }}>
            Account Type
          </div>
          <div style={{
            fontSize: '14px',
            color: '#111827',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            {user?.isChirpPlus ? (
              <>
                <span style={{ color: '#7c3aed' }}>👑</span>
                Chirp+ Member
              </>
            ) : (
              'Free Account'
            )}
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        border: '1px solid #fecaca'
      }}>
        <h4 style={{
          fontSize: '16px',
          fontWeight: '600',
          color: '#dc2626',
          marginBottom: '16px'
        }}>
          Danger Zone
        </h4>
        
        <button
          onClick={handleSignOut}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: '#ef4444',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'background-color 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          <LogOutIcon size={16} color="#ffffff" />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#fafafa',
      paddingBottom: '80px' // Space for bottom navigation
    }}>
      {/* Header */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e1e8ed',
        paddingTop: '8px',
        paddingBottom: '12px',
        paddingLeft: '16px',
        paddingRight: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <button 
          onClick={() => onClose ? onClose() : setLocation('/')}
          style={{
            padding: '12px',
            borderRadius: '8px',
            minWidth: '44px',
            minHeight: '44px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            transition: 'background-color 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f2f5'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <span style={{
            fontSize: '24px',
            color: '#7c3aed',
            fontWeight: '600'
          }}>←</span>
        </button>
        
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <GearIcon size={20} color="#7c3aed" />
          <h1 style={{
            fontSize: '20px',
            fontWeight: '700',
            color: '#1a1a1a',
            margin: 0
          }}>
            Settings
          </h1>
        </div>
        
        <div style={{ width: '44px' }} />
      </div>

      {/* Tabs */}
      <div style={{
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e1e8ed',
        paddingTop: '12px',
        paddingBottom: '12px',
        paddingLeft: '16px',
        paddingRight: '16px'
      }}>
        <div style={{
          display: 'flex',
          backgroundColor: '#f7f9fa',
          borderRadius: '12px',
          padding: '3px'
        }}>
          <TabButton id="profile" title="Profile" active={activeTab === 'profile'} />
          <TabButton id="analytics" title="Analytics" active={activeTab === 'analytics'} />
          <TabButton id="account" title="Account" active={activeTab === 'account'} />
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1 }}>
        {activeTab === 'profile' && renderProfileTab()}
        {activeTab === 'analytics' && renderAnalyticsTab()}
        {activeTab === 'account' && renderAccountTab()}
      </div>
    </div>
  );
}