import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Modal, Image } from 'react-native';
import { router } from 'expo-router';
import UserAvatar from './UserAvatar';
import { useAuth } from './AuthContext';
import { 
  getUserById, 
  getUserStats, 
  followUser, 
  unfollowUser, 
  checkFollowStatus, 
  blockUser, 
  unblockUser, 
  checkBlockStatus,
  getUserNotificationStatus
} from '../mobile-db';

interface User {
  id: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  custom_handle?: string;
  handle?: string;
  display_name?: string;
  bio?: string;
  profile_image_url?: string;
  banner_image_url?: string;
  is_chirp_plus?: boolean;
  show_chirp_plus_badge?: boolean;
}

interface UserStats {
  chirps: number;
  followers: number;
  following: number;
}

interface UserProfilePopupProps {
  visible: boolean;
  onClose: () => void;
  userId: string;
}

export default function UserProfilePopup({ visible, onClose, userId }: UserProfilePopupProps) {
  const { user: currentUser } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<UserStats>({ chirps: 0, followers: 0, following: 0 });
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [notificationsOn, setNotificationsOn] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);

  const isOwnProfile = currentUser?.id === userId;

  useEffect(() => {
    if (visible && userId) {
      fetchUserProfile();
    }
  }, [visible, userId]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const [userData, userStats, followStatus, blockStatus, notificationStatus] = await Promise.all([
        getUserById(userId),
        getUserStats(userId),
        currentUser?.id ? checkFollowStatus(currentUser.id, userId) : false,
        currentUser?.id ? checkBlockStatus(currentUser.id, userId) : false,
        currentUser?.id ? getUserNotificationStatus(currentUser.id, userId) : false,
      ]);

      setUser(userData);
      setStats(userStats);
      setIsFollowing(followStatus);
      setIsBlocked(blockStatus);
      setNotificationsOn(notificationStatus);
    } catch (error) {
      console.error('Error fetching user profile popup:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!currentUser?.id) return;
    
    try {
      if (isFollowing) {
        await unfollowUser(currentUser.id, userId);
        setIsFollowing(false);
        setStats(prev => ({ ...prev, followers: prev.followers - 1 }));
      } else {
        await followUser(currentUser.id, userId);
        setIsFollowing(true);
        setStats(prev => ({ ...prev, followers: prev.followers + 1 }));
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
    }
  };

  const handleBlock = async () => {
    if (!currentUser?.id) return;
    
    try {
      if (isBlocked) {
        await unblockUser(currentUser.id, userId);
        setIsBlocked(false);
      } else {
        await blockUser(currentUser.id, userId);
        setIsBlocked(true);
        setIsFollowing(false); // Unfollow when blocking
      }
      setShowOptionsMenu(false);
    } catch (error) {
      console.error('Error toggling block:', error);
    }
  };

  const handleNotificationToggle = async () => {
    if (!currentUser?.id) return;
    
    try {
      const newStatus = !notificationsOn;
      // Note: updateUserNotificationStatus function needs to be implemented in mobile-db.ts
      setNotificationsOn(newStatus);
      setShowOptionsMenu(false);
    } catch (error) {
      console.error('Error toggling notifications:', error);
    }
  };

  const handleViewProfile = () => {
    onClose();
    router.push(`/profile/${userId}`);
  };

  if (!visible) return null;

  const displayName = user?.custom_handle || user?.handle || user?.first_name || 'User';
  const userHandle = user?.custom_handle || user?.handle || 'user';

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} onPress={onClose} />
        <View style={styles.popup}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading...</Text>
            </View>
          ) : user ? (
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
              {/* Banner Image */}
              <View style={styles.bannerContainer}>
                {user.banner_image_url ? (
                  <Image source={{ uri: user.banner_image_url }} style={styles.bannerImage} />
                ) : (
                  <View style={styles.defaultBanner} />
                )}
              </View>

              {/* Profile Info */}
              <View style={styles.profileInfo}>
                {/* Avatar - positioned to overlap banner */}
                <View style={styles.avatarContainer}>
                  <UserAvatar user={{
                    id: user.id,
                    firstName: user.first_name || '',
                    lastName: user.last_name || '',
                    email: user.email || '',
                    profileImageUrl: user.profile_image_url
                  }} size="xl" />
                </View>

                {/* Action Buttons */}
                <View style={styles.actionButtons}>
                  {!isOwnProfile && (
                    <>
                      <TouchableOpacity
                        style={[styles.followButton, isFollowing && styles.followingButton]}
                        onPress={handleFollow}
                        disabled={isBlocked}
                      >
                        <Text style={[styles.followButtonText, isFollowing && styles.followingButtonText]}>
                          {isFollowing ? 'Following' : 'Follow'}
                        </Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity
                        style={styles.optionsButton}
                        onPress={() => setShowOptionsMenu(true)}
                      >
                        <Text style={styles.optionsButtonText}>•••</Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>

                {/* User Details */}
                <View style={styles.userDetails}>
                  <View style={styles.nameContainer}>
                    <Text style={styles.displayName}>{displayName}</Text>
                    {user.is_chirp_plus && user.show_chirp_plus_badge && (
                      <View style={styles.chirpPlusBadge}>
                        <Text style={styles.chirpPlusBadgeText}>+</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.handle}>@{userHandle}</Text>
                  
                  {user.bio && (
                    <Text style={styles.bio}>{user.bio}</Text>
                  )}

                  {/* Stats */}
                  <View style={styles.statsContainer}>
                    <View style={styles.statItem}>
                      <Text style={styles.statNumber}>{stats.chirps}</Text>
                      <Text style={styles.statLabel}>Chirps</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={styles.statNumber}>{stats.following}</Text>
                      <Text style={styles.statLabel}>Following</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={styles.statNumber}>{stats.followers}</Text>
                      <Text style={styles.statLabel}>Followers</Text>
                    </View>
                  </View>

                  {/* View Full Profile Button */}
                  <TouchableOpacity style={styles.viewProfileButton} onPress={handleViewProfile}>
                    <Text style={styles.viewProfileButtonText}>View Full Profile</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          ) : (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>User not found</Text>
            </View>
          )}

          {/* Options Menu Modal */}
          <Modal
            visible={showOptionsMenu}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setShowOptionsMenu(false)}
          >
            <View style={styles.optionsOverlay}>
              <TouchableOpacity style={styles.optionsBackdrop} onPress={() => setShowOptionsMenu(false)} />
              <View style={styles.optionsMenu}>
                <TouchableOpacity style={styles.optionItem} onPress={handleNotificationToggle}>
                  <Text style={styles.optionText}>
                    {notificationsOn ? 'Turn off notifications' : 'Turn on notifications'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.optionItem} onPress={handleBlock}>
                  <Text style={[styles.optionText, styles.blockText]}>
                    {isBlocked ? 'Unblock user' : 'Block user'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.optionItem} onPress={() => setShowOptionsMenu(false)}>
                  <Text style={styles.optionText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  popup: {
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  loadingContainer: {
    padding: 32,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  content: {
    flex: 1,
  },
  bannerContainer: {
    height: 100,
    backgroundColor: '#f3f4f6',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  defaultBanner: {
    width: '100%',
    height: '100%',
    backgroundColor: 'linear-gradient(135deg, #a855f7, #ec4899)',
  },
  profileInfo: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  avatarContainer: {
    marginTop: -40,
    marginBottom: 12,
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'white',
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  followButton: {
    backgroundColor: '#7c3aed',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  followingButton: {
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  followButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  followingButtonText: {
    color: '#374151',
  },
  optionsButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionsButtonText: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: 'bold',
  },
  userDetails: {
    gap: 8,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  displayName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  chirpPlusBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#7c3aed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chirpPlusBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  handle: {
    fontSize: 16,
    color: '#6b7280',
  },
  bio: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 22,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 20,
    marginTop: 8,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  statLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  viewProfileButton: {
    backgroundColor: '#7c3aed',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  viewProfileButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  errorContainer: {
    padding: 32,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
  },
  optionsOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  optionsBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  optionsMenu: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 8,
    minWidth: 200,
  },
  optionItem: {
    padding: 16,
    borderRadius: 8,
  },
  optionText: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
  },
  blockText: {
    color: '#ef4444',
  },
});