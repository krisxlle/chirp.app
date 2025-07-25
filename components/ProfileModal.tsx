import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  StyleSheet,
  Alert
} from 'react-native';
import UserAvatar from './UserAvatar';
import ChirpCard from './ChirpCard';
import { useAuth } from './AuthContext';
import { getUserProfile, getUserChirps, getUserReplies, getUserStats, followUser, unfollowUser, blockUser, unblockUser, checkFollowStatus } from '../mobile-db';

interface ProfileModalProps {
  visible: boolean;
  userId: string | null;
  onClose: () => void;
}

export default function ProfileModal({ visible, userId, onClose }: ProfileModalProps) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [chirps, setChirps] = useState<any[]>([]);
  const [replies, setReplies] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'chirps' | 'replies'>('chirps');
  const [stats, setStats] = useState({
    chirps: 0,
    following: 0,
    followers: 0
  });
  const [followStatus, setFollowStatus] = useState({
    isFollowing: false,
    isBlocked: false,
    notificationsEnabled: false
  });
  const [showMoreOptions, setShowMoreOptions] = useState(false);

  const { user: currentUser } = useAuth();

  useEffect(() => {
    if (visible && userId) {
      fetchUserProfile();
    } else {
      // Reset state when modal closes
      setUser(null);
      setChirps([]);
      setReplies([]);
      setActiveTab('chirps');
      setLoading(true);
    }
  }, [visible, userId]);

  const fetchUserProfile = async () => {
    if (!userId) return;

    console.log('📥 Fetching profile data for user:', userId);
    try {
      setLoading(true);

      // Fetch user profile data
      const [profileData, chirpsData, repliesData, statsData, followData] = await Promise.all([
        getUserProfile(userId),
        getUserChirps(userId),
        getUserReplies(userId),
        getUserStats(userId),
        currentUser ? checkFollowStatus(userId) : null
      ]);

      console.log('✅ Profile data loaded:', {
        profile: !!profileData,
        chirps: chirpsData?.length || 0,
        replies: repliesData?.length || 0,
        stats: statsData
      });

      setUser(profileData);
      setChirps(chirpsData || []);
      setReplies(repliesData || []);
      setStats(statsData || { chirps: 0, following: 0, followers: 0 });
      
      if (followData) {
        setFollowStatus(followData);
      }

    } catch (error) {
      console.error('❌ Error fetching profile:', error);
      Alert.alert('Error', 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!currentUser || !userId) return;

    try {
      if (followStatus.isFollowing) {
        await unfollowUser(userId);
        setFollowStatus(prev => ({ ...prev, isFollowing: false }));
        setStats(prev => ({ ...prev, followers: prev.followers - 1 }));
      } else {
        await followUser(userId);
        setFollowStatus(prev => ({ ...prev, isFollowing: true }));
        setStats(prev => ({ ...prev, followers: prev.followers + 1 }));
      }
    } catch (error) {
      console.error('Follow error:', error);
      Alert.alert('Error', 'Failed to update follow status');
    }
  };

  const handleBlock = async () => {
    if (!currentUser || !userId) return;

    try {
      if (followStatus.isBlocked) {
        await unblockUser(userId);
        setFollowStatus(prev => ({ ...prev, isBlocked: false }));
      } else {
        await blockUser(userId);
        setFollowStatus(prev => ({ ...prev, isBlocked: true, isFollowing: false }));
      }
    } catch (error) {
      console.error('Block error:', error);
      Alert.alert('Error', 'Failed to update block status');
    }
  };

  if (!visible) return null;

  const displayName = user?.first_name || user?.last_name 
    ? `${user.first_name || ''} ${user.last_name || ''}`.trim() 
    : user?.custom_handle || user?.handle || 'User';

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
          <View style={styles.headerRight} />
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#7c3aed" />
            <Text style={styles.loadingText}>Loading profile...</Text>
          </View>
        ) : !user ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>User not found</Text>
            <TouchableOpacity style={styles.retryButton} onPress={onClose}>
              <Text style={styles.retryButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView style={styles.scrollView}>
            {/* Banner */}
            <View style={styles.bannerContainer}>
              {user.banner_image_url ? (
                <Image source={{ uri: user.banner_image_url }} style={styles.bannerImage} />
              ) : (
                <View style={styles.bannerPlaceholder} />
              )}
            </View>

            {/* Profile Info */}
            <View style={styles.profileSection}>
              <View style={styles.profileHeader}>
                <View style={styles.profileInfo}>
                  <UserAvatar 
                    user={{
                      id: user.id,
                      firstName: user.first_name || '',
                      lastName: user.last_name || '',
                      email: user.email || '',
                      handle: user.handle || '',
                      profileImageUrl: user.profile_image_url || undefined
                    }} 
                    size="xl"
                  />
                  
                  <View style={styles.profileDetails}>
                    <View style={styles.nameContainer}>
                      <Text style={styles.displayName}>{displayName}</Text>
                      {user.is_chirp_plus && user.show_chirp_plus_badge && (
                        <View style={styles.chirpPlusBadge}>
                          <Text style={styles.chirpPlusBadgeText}>Chirp+</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.handle}>@{user.custom_handle || user.handle}</Text>
                  </View>
                </View>

                {/* Action buttons */}
                {currentUser && currentUser.id !== userId && (
                  <View style={styles.actionButtons}>
                    <TouchableOpacity 
                      style={[styles.followButton, followStatus.isFollowing && styles.followingButton]} 
                      onPress={handleFollow}
                    >
                      <Text style={[styles.followButtonText, followStatus.isFollowing && styles.followingButtonText]}>
                        {followStatus.isFollowing ? 'Following' : 'Follow'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              {/* Bio */}
              {user.bio && (
                <View style={styles.bioContainer}>
                  <Text style={styles.bioText}>{user.bio}</Text>
                </View>
              )}

              {/* Stats */}
              <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{stats.chirps}</Text>
                  <Text style={styles.statLabel}>Chirps</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{stats.following}</Text>
                  <Text style={styles.statLabel}>Following</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{stats.followers}</Text>
                  <Text style={styles.statLabel}>Followers</Text>
                </View>
              </View>
            </View>

            {/* Tabs */}
            <View style={styles.tabsContainer}>
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
                <View style={styles.chirpsContainer}>
                  {chirps.length === 0 ? (
                    <View style={styles.emptyState}>
                      <Text style={styles.emptyStateText}>No chirps yet</Text>
                    </View>
                  ) : (
                    chirps.map((chirp: any, index: number) => (
                      <View key={chirp.id} style={[styles.chirpContainer, index > 0 && styles.chirpBorder]}>
                        <ChirpCard chirp={chirp} />
                      </View>
                    ))
                  )}
                </View>
              )}
              
              {activeTab === 'replies' && (
                <View style={styles.chirpsContainer}>
                  {replies.length === 0 ? (
                    <View style={styles.emptyState}>
                      <Text style={styles.emptyStateText}>No replies yet</Text>
                    </View>
                  ) : (
                    replies.map((reply: any, index: number) => (
                      <View key={reply.id} style={[styles.chirpContainer, index > 0 && styles.chirpBorder]}>
                        <ChirpCard chirp={reply} />
                      </View>
                    ))
                  )}
                </View>
              )}
            </View>
          </ScrollView>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  closeButton: {
    padding: 8,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: '#7c3aed',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  headerRight: {
    width: 44,
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
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#ef4444',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#7c3aed',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  bannerContainer: {
    height: 100,
    backgroundColor: '#f3f4f6',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  bannerPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#e5e7eb',
  },
  profileSection: {
    padding: 16,
  },
  profileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  profileInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  profileDetails: {
    marginLeft: 12,
    flex: 1,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  displayName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  chirpPlusBadge: {
    backgroundColor: '#7c3aed',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: 8,
  },
  chirpPlusBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  handle: {
    fontSize: 14,
    color: '#6b7280',
  },
  actionButtons: {
    flexDirection: 'row',
  },
  followButton: {
    backgroundColor: '#7c3aed',
    paddingHorizontal: 16,
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
    fontWeight: 'bold',
  },
  followingButtonText: {
    color: '#374151',
  },
  bioContainer: {
    marginBottom: 16,
  },
  bioText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#e5e7eb',
    marginHorizontal: 16,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#7c3aed',
  },
  tabText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#7c3aed',
    fontWeight: 'bold',
  },
  tabContent: {
    flex: 1,
  },
  chirpsContainer: {
    padding: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6b7280',
  },
  chirpContainer: {
    marginBottom: 16,
  },
  chirpBorder: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 16,
  },
});