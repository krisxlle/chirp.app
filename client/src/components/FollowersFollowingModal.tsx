import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface User {
  id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  customHandle?: string;
  handle?: string;
  name?: string;
  profileImageUrl?: string;
  avatarUrl?: string;
  bannerImageUrl?: string;
  isChirpPlus?: boolean;
  showChirpPlusBadge?: boolean;
  bio?: string;
}

interface FollowersFollowingModalProps {
  visible: boolean;
  onClose: () => void;
  userId: string;
  type: 'followers' | 'following';
  title: string;
}

export default function FollowersFollowingModal({ 
  visible, 
  onClose, 
  userId, 
  type, 
  title 
}: FollowersFollowingModalProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && userId) {
      fetchUsers();
    }
  }, [visible, userId, type]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      console.log(`🔄 Fetching ${type} for user:`, userId);
      
      let userData: User[] = [];
      
      if (type === 'followers') {
        userData = await getFollowers(userId);
      } else {
        userData = await getFollowing(userId);
      }
      
      console.log(`✅ Fetched ${userData.length} ${type}`);
      setUsers(userData);
    } catch (error) {
      console.error(`❌ Error fetching ${type}:`, error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const getFollowers = async (userId: string): Promise<User[]> => {
    try {
      const { data, error } = await supabase
        .from('follows')
        .select(`
          follower_id,
          users!follows_follower_id_fkey (
            id,
            first_name,
            last_name,
            email,
            custom_handle,
            handle,
            profile_image_url,
            avatar_url,
            banner_image_url,
            bio
          )
        `)
        .eq('following_id', userId);

      if (error) {
        console.error('Error fetching followers:', error);
        return [];
      }

      return (data || []).map((item: any) => ({
        id: item.users.id,
        firstName: item.users.first_name,
        lastName: item.users.last_name,
        email: item.users.email,
        customHandle: item.users.custom_handle,
        handle: item.users.handle,
        name: `${item.users.first_name || ''} ${item.users.last_name || ''}`.trim(),
        profileImageUrl: item.users.profile_image_url,
        avatarUrl: item.users.avatar_url,
        bannerImageUrl: item.users.banner_image_url,
        bio: item.users.bio
      }));
    } catch (error) {
      console.error('Error in getFollowers:', error);
      return [];
    }
  };

  const getFollowing = async (userId: string): Promise<User[]> => {
    try {
      const { data, error } = await supabase
        .from('follows')
        .select(`
          following_id,
          users!follows_following_id_fkey (
            id,
            first_name,
            last_name,
            email,
            custom_handle,
            handle,
            profile_image_url,
            avatar_url,
            banner_image_url,
            bio
          )
        `)
        .eq('follower_id', userId);

      if (error) {
        console.error('Error fetching following:', error);
        return [];
      }

      return (data || []).map((item: any) => ({
        id: item.users.id,
        firstName: item.users.first_name,
        lastName: item.users.last_name,
        email: item.users.email,
        customHandle: item.users.custom_handle,
        handle: item.users.handle,
        name: `${item.users.first_name || ''} ${item.users.last_name || ''}`.trim(),
        profileImageUrl: item.users.profile_image_url,
        avatarUrl: item.users.avatar_url,
        bannerImageUrl: item.users.banner_image_url,
        bio: item.users.bio
      }));
    } catch (error) {
      console.error('Error in getFollowing:', error);
      return [];
    }
  };

  const handleUserClick = (user: User) => {
    onClose();
    // Navigate to user profile
    window.location.href = `/profile/${user.id}`;
  };

  const getDisplayName = (user: User) => {
    return user.firstName || user.customHandle || user.handle || 'User';
  };

  const getUserHandle = (user: User) => {
    return user.customHandle || user.handle || 'user';
  };

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        width: '90%',
        maxWidth: '400px',
        maxHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          borderBottom: '1px solid #e1e8ed'
        }}>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '18px',
              cursor: 'pointer',
              color: '#657786',
              padding: '4px'
            }}
          >
            ✕
          </button>
          <h2 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#14171a',
            margin: 0
          }}>
            {title}
          </h2>
          <div style={{ width: '24px' }} /> {/* Spacer */}
        </div>

        {/* Content */}
        {loading ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px 20px'
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              border: '2px solid #7c3aed',
              borderTop: '2px solid transparent',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
            <p style={{
              marginTop: '16px',
              color: '#657786',
              fontSize: '14px'
            }}>
              Loading {type}...
            </p>
          </div>
        ) : (
          <div style={{
            flex: 1,
            overflowY: 'auto',
            maxHeight: '60vh'
          }}>
            {users.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '40px 20px',
                color: '#657786'
              }}>
                <p style={{ margin: 0, fontSize: '16px' }}>
                  No {type} yet
                </p>
                <p style={{ margin: '8px 0 0 0', fontSize: '14px' }}>
                  {type === 'followers' ? 'This user has no followers yet.' : 'This user is not following anyone yet.'}
                </p>
              </div>
            ) : (
              users.map((user) => (
                <div
                  key={user.id}
                  onClick={() => handleUserClick(user)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '12px 20px',
                    cursor: 'pointer',
                    borderBottom: '1px solid #f7f9fa',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f7f9fa';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  {/* Avatar */}
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: '#e1e8ed',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '12px',
                    overflow: 'hidden'
                  }}>
                    {user.profileImageUrl || user.avatarUrl ? (
                      <img
                        src={user.profileImageUrl || user.avatarUrl}
                        alt={getDisplayName(user)}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                      />
                    ) : (
                      <span style={{
                        fontSize: '16px',
                        color: '#657786'
                      }}>
                        {getDisplayName(user).charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>

                  {/* User Info */}
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: '15px',
                      fontWeight: '600',
                      color: '#14171a',
                      marginBottom: '2px'
                    }}>
                      {getDisplayName(user)}
                    </div>
                    <div style={{
                      fontSize: '14px',
                      color: '#657786'
                    }}>
                      @{getUserHandle(user)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
