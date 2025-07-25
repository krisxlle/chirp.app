import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert, Image, Modal } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import UserAvatar from '../../components/UserAvatar';
import ChirpCard from '../../components/ChirpCard';
import { AuthContext } from '../../components/AuthContext';

// UserProfileScreen component

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

export default function UserProfileScreen() {
  const params = useLocalSearchParams();
  const userId = Array.isArray(params.userId) ? params.userId[0] : params.userId;
  
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [chirps, setChirps] = useState([]);
  const [replies, setReplies] = useState([]);
  const [activeTab, setActiveTab] = useState('chirps');
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [followStatus, setFollowStatus] = useState({
    isFollowing: false,
    isBlocked: false,
    notificationsEnabled: true
  });
  const [stats, setStats] = useState({
    chirps: 0,
    following: 0,
    followers: 0
  });

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        const { 
          getUserById, 
          getUserChirps, 
          getUserStats, 
          checkFollowStatus, 
          checkBlockStatus,
          getUserReplies,
          getCurrentUserId
        } = await import('../../mobile-db');
        
        // Fast parallel loading - load user data first, then everything else
        const userData = await getUserById(userId);
        
        if (userData) {
          setUser(userData);
          
          // Load everything else in parallel for maximum speed
          const currentUserId = await getCurrentUserId();
          
          const [userChirps, userReplies, userStats, isFollowing, isBlocked] = await Promise.all([
            getUserChirps(userId),
            getUserReplies(userId), 
            getUserStats(userId),
            currentUserId ? checkFollowStatus(currentUserId, userId) : false,
            currentUserId ? checkBlockStatus(currentUserId, userId) : false
          ]);
          
          // Update all state at once to minimize re-renders
          setChirps(userChirps);
          setReplies(userReplies);
          setStats(userStats);
          setFollowStatus({
            isFollowing: isFollowing || false,
            isBlocked: isBlocked || false,
            notificationsEnabled: false
          });
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [userId]);

  const handleBack = () => {
    try {
      console.log('Navigating back from profile');
      router.back();
    } catch (error) {
      console.error('Back navigation error:', error);
      router.push('/');
    }
  };

  const handleFollow = async () => {
    try {
      const { followUser, unfollowUser } = await import('../../mobile-db');
      
      if (followStatus.isFollowing) {
        await unfollowUser(userId);
        setFollowStatus(prev => ({ ...prev, isFollowing: false }));
      } else {
        await followUser(userId);
        setFollowStatus(prev => ({ ...prev, isFollowing: true }));
      }
    } catch (error) {
      console.error('Error updating follow status:', error);
      Alert.alert('Error', 'Failed to update follow status');
    }
  };

  const handleBlock = async () => {
    try {
      const { blockUser, unblockUser } = await import('../../mobile-db');
      
      if (followStatus.isBlocked) {
        await unblockUser(userId);
        setFollowStatus(prev => ({ ...prev, isBlocked: false }));
      } else {
        await blockUser(userId);
        setFollowStatus(prev => ({ ...prev, isBlocked: true, isFollowing: false }));
      }
    } catch (error) {
      console.error('Error updating block status:', error);
      Alert.alert('Error', 'Failed to update block status');
    }
  };

  const handleNotificationToggle = async () => {
    try {
      const { toggleUserNotifications, getCurrentUserId } = await import('../../mobile-db');
      
      const currentUserId = await getCurrentUserId();
      if (!currentUserId) return;
      
      await toggleUserNotifications(currentUserId, userId, !followStatus.notificationsEnabled);
      setFollowStatus(prev => ({ ...prev, notificationsEnabled: !prev.notificationsEnabled }));
    } catch (error) {
      console.error('Error updating notification status:', error);
      Alert.alert('Error', 'Failed to update notification settings');
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7c3aed" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>User not found</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => setLoading(true)}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const displayName = user.first_name && user.last_name 
    ? `${user.first_name} ${user.last_name}`.trim()
    : (user.custom_handle || user.handle || user.email?.split('@')[0] || 'User');

  console.log('🔥🔥🔥 About to render UserProfileScreen with:', { user, loading, chirps: chirps.length });

  if (loading) {
    console.log('⏳ Showing loading state for profile');
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7c3aed" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  if (!user) {
    console.log('❌ No user data found');
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>User not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  console.log('✅ Rendering profile for user:', user.custom_handle || user.handle);

  const isOwnProfile = false; // For now, assume this is always another user's profile

  return (
    <View style={styles.container}>
      {/* Header with back and options */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{displayName}</Text>
        {!isOwnProfile && (
          <TouchableOpacity 
            style={styles.moreButton} 
            onPress={() => setShowMoreOptions(true)}
          >
            <Text style={styles.moreButtonText}>⋯</Text>
          </TouchableOpacity>
        )}
      </View>
      
      <ScrollView style={styles.content}>
        {/* Banner */}
        {user.banner_image_url && (
          <Image source={{ uri: user.banner_image_url }} style={styles.banner} />
        )}
        
        {/* Profile Section */}
        <View style={styles.profileSection}>
          {/* Avatar positioned to overlap banner */}
          <View style={styles.avatarContainer}>
            <UserAvatar 
              user={user} 
              size={80} 
              style={styles.avatar}
            />
          </View>
          
          {/* Follow button */}
          {!isOwnProfile && !followStatus.isBlocked && (
            <TouchableOpacity 
              style={[styles.followButton, followStatus.isFollowing && styles.followingButton]} 
              onPress={handleFollow}
            >
              <Text style={[styles.followButtonText, followStatus.isFollowing && styles.followingButtonText]}>
                {followStatus.isFollowing ? 'Following' : 'Follow'}
              </Text>
            </TouchableOpacity>
          )}
          
          {/* Profile Info */}
          <View style={styles.profileInfo}>
            <Text style={styles.displayName}>{displayName}</Text>
            <Text style={styles.handle}>@{user.custom_handle || user.handle}</Text>
            
            {user.bio && (
              <Text style={styles.bio}>{user.bio}</Text>
            )}
            
            {user.is_chirp_plus && user.show_chirp_plus_badge && (
              <View style={styles.chirpPlusBadge}>
                <Text style={styles.chirpPlusBadgeText}>Chirp+ Member</Text>
              </View>
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
          </View>
        </View>
        
        {/* Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'chirps' && styles.activeTab]} 
            onPress={() => setActiveTab('chirps')}
          >
            <Text style={[styles.tabText, activeTab === 'chirps' && styles.activeTabText]}>
              Chirps
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'replies' && styles.activeTab]} 
            onPress={() => setActiveTab('replies')}
          >
            <Text style={[styles.tabText, activeTab === 'replies' && styles.activeTabText]}>
              Replies
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Tab Content */}
        <View style={styles.tabContent}>
          {activeTab === 'chirps' && (
            <View>
              {chirps.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>No chirps yet</Text>
                </View>
              ) : (
                chirps.map((chirp: any, index: number) => (
                  <ChirpCard key={chirp.id} chirp={chirp} />
                ))
              )}
            </View>
          )}
          
          {activeTab === 'replies' && (
            <View>
              {replies.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>No replies yet</Text>
                </View>
              ) : (
                replies.map((reply: any, index: number) => (
                  <ChirpCard key={reply.id} chirp={reply} />
                ))
              )}
            </View>
          )}
        </View>
      </ScrollView>
      
      {/* More Options Modal */}
      <Modal
        visible={showMoreOptions}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowMoreOptions(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          onPress={() => setShowMoreOptions(false)}
        >
          <View style={styles.moreOptionsMenu}>
            <TouchableOpacity style={styles.menuItem} onPress={() => {
              setShowMoreOptions(false);
              handleNotificationToggle();
            }}>
              <Text style={styles.menuItemText}>
                {followStatus.notificationsEnabled ? '🔕 Turn off notifications' : '🔔 Turn on notifications'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.menuItem} onPress={() => {
              setShowMoreOptions(false);
              handleBlock();
            }}>
              <Text style={[styles.menuItemText, styles.destructiveText]}>
                {followStatus.isBlocked ? '✓ Unblock user' : '🚫 Block user'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.menuItem} onPress={() => setShowMoreOptions(false)}>
              <Text style={styles.menuItemText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginLeft: 16,
  },
  backButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  backButtonText: {
    color: '#7c3aed',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorText: {
    fontSize: 18,
    color: '#ef4444',
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#7c3aed',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  profileCard: {
    backgroundColor: '#ffffff',
    marginTop: 40,
    paddingHorizontal: 16,
    paddingTop: 40,
    paddingBottom: 16,
  },
  successBanner: {
    backgroundColor: '#10b981',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  successText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  bannerContainer: {
    position: 'relative',
    height: 100, // Reduced by 50% from 200px
  },
  banner: {
    width: '100%',
    height: 100, // Reduced by 50% from 200px
    backgroundColor: '#7c3aed',
  },
  bannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(124, 58, 237, 0.1)',
  },
  avatarContainer: {
    position: 'absolute',
    bottom: -40,
    left: 16,
    borderRadius: 44, // (80px avatar + 8px border) / 2 = 44px for perfect circle
    borderWidth: 4,
    borderColor: '#ffffff',
    width: 88, // 80px avatar + 8px border (4px each side)
    height: 88, // 80px avatar + 8px border (4px each side)
    alignItems: 'center',
    justifyContent: 'center',
  },
  displayName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 4,
  },
  handle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 12,
  },
  chirpPlusBadge: {
    backgroundColor: '#7c3aed',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: 'center',
    marginBottom: 12,
  },
  chirpPlusBadgeText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  bio: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  statLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  chirpsSection: {
    margin: 16,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  noChirpsText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  chirpPreview: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  chirpContent: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 8,
  },
  chirpDate: {
    fontSize: 12,
    color: '#6b7280',
  },
});