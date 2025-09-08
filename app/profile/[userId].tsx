import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    Modal,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useAuth } from '../../components/AuthContext';
import ChirpCard from '../../components/ChirpCard';
import FollowersFollowingModal from '../../components/FollowersFollowingModal';
import UserAvatar from '../../components/UserAvatar';

interface User {
  id: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  custom_handle?: string;
  handle?: string;
  profile_image_url?: string;
  banner_image_url?: string;
  bio?: string;
  created_at?: string;
}

export default function UserProfileScreen() {
  const params = useLocalSearchParams();
  const userId = Array.isArray(params.userId) ? params.userId[0] : params.userId;
  
  // Get current user from auth context at the top level
  const { user: currentUser } = useAuth();
  const currentUserId = currentUser?.id;
  
  // Add early return if no userId
  if (!userId) {
    console.error('❌ No userId provided to profile screen');
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>User not found</Text>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [chirps, setChirps] = useState<any[]>([]);
  const [replies, setReplies] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'chirps' | 'gacha'>('chirps');
  const [stats, setStats] = useState({
    profilePower: 0,
    following: 0,
    followers: 0
  });
  const [followStatus, setFollowStatus] = useState({
    isFollowing: false,
    isBlocked: false,
    notificationsEnabled: false
  });
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);

  const router = useRouter();

  useEffect(() => {
    console.log('🚀 Profile useEffect triggered with userId:', userId, 'currentUserId:', currentUserId);
    
    const fetchUserProfile = async () => {
      if (!userId) {
        console.log('❌ No userId provided, stopping fetch');
        setLoading(false);
        return;
      }

      console.log('📥 Starting profile data fetch for user:', userId);
      console.log('🔍 Current user context:', { currentUserId, hasCurrentUser: !!currentUserId });
      try {
        setLoading(true);

        // Import all database functions
        const { 
          getUserById, 
          getUserChirps, 
          getUserReplies, 
          getUserStats, 
          checkFollowStatus,
          checkBlockStatus
        } = await import('../../mobile-db-supabase');


        // Fetch all data in parallel for optimal performance
        const [
          userData, 
          userChirps, 
          userReplies, 
          userStats,
          followStatusData,
          isBlocked
        ] = await Promise.all([
          getUserById(userId),
          getUserChirps(userId),
          getUserReplies(userId), 
          getUserStats(userId),
          // Only check follow status if viewing someone else's profile
          currentUserId && currentUserId !== userId ? checkFollowStatus(userId, currentUserId) : Promise.resolve({ isFollowing: false, isBlocked: false, notificationsEnabled: false }),
          currentUserId && currentUserId !== userId ? checkBlockStatus(currentUserId, userId) : false
        ]);
        
        // Update all state at once to minimize re-renders
        console.log('🔍 Profile fetch debug:', {
          currentUserId,
          targetUserId: userId,
          isOwnProfile: currentUserId === userId,
          willCheckFollowStatus: currentUserId && currentUserId !== userId
        });
        console.log('🔍 Follow status check:', {
          currentUserId,
          targetUserId: userId,
          followStatusData,
          isFollowing: followStatusData.isFollowing
        });
        setUser(userData);
        setChirps(userChirps);
        setReplies(userReplies);
        setStats({
          profilePower: Math.floor((userStats.chirps * 10) + (userStats.moodReactions * 5) + (userStats.followers * 2) + (userStats.following * 1)),
          following: userStats.following,
          followers: userStats.followers
        });
        console.log('🔍 User stats data:', userStats);
        console.log('🎯 Profile Power calculation V2.0:', {
          chirps: userStats.chirps,
          moodReactions: userStats.moodReactions,
          followers: userStats.followers,
          following: userStats.following,
          profilePower: Math.floor((userStats.chirps * 10) + (userStats.moodReactions * 5) + (userStats.followers * 2) + (userStats.following * 1))
        });
        setFollowStatus({
          isFollowing: followStatusData.isFollowing || false,
          isBlocked: isBlocked || false,
          notificationsEnabled: followStatusData.notificationsEnabled || false
        });
        console.log('🎯 Profile state updated');
      } catch (error) {
        console.error('❌ Error fetching user profile:', error);
      } finally {
        setLoading(false);
        console.log('⏹️ Profile loading completed');
      }
    };

    fetchUserProfile();
  }, [userId, currentUserId]);

  const handleBack = () => {
    try {
      console.log('Back button pressed - navigating to home');
      router.push('/');
    } catch (error) {
      console.error('Back navigation error:', error);
      // Fallback: force navigation to home
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    }
  };

  const handleFollow = async () => {
    try {
      console.log('🔔 Follow button pressed for user:', userId);
      const { followUser, unfollowUser } = await import('../../mobile-db-supabase');
      
      console.log('🔔 Current user ID:', currentUserId);
      if (!currentUserId) {
        console.log('❌ No current user ID found');
        return;
      }
      
      if (followStatus.isFollowing) {
        console.log('🔔 Unfollowing user:', userId);
        await unfollowUser(currentUserId, userId);
        setFollowStatus(prev => ({ ...prev, isFollowing: false }));
        console.log('✅ Successfully unfollowed user');
      } else {
        console.log('🔔 Following user:', userId);
        await followUser(currentUserId, userId);
        setFollowStatus(prev => ({ ...prev, isFollowing: true }));
        console.log('✅ Successfully followed user');
      }
    } catch (error) {
      console.error('❌ Error updating follow status:', error);
      Alert.alert('Error', 'Failed to update follow status');
    }
  };

  const handleBlock = async () => {
    try {
      const { blockUser, unblockUser } = await import('../../mobile-db-supabase');
      
      if (!currentUserId) return;
      
      if (followStatus.isBlocked) {
        await unblockUser(currentUserId, userId);
        setFollowStatus(prev => ({ ...prev, isBlocked: false }));
      } else {
        await blockUser(currentUserId, userId);
        setFollowStatus(prev => ({ ...prev, isBlocked: true, isFollowing: false }));
      }
    } catch (error) {
      console.error('Error updating block status:', error);
      Alert.alert('Error', 'Failed to update block status');
    }
  };

  const handleNotificationToggle = async () => {
    try {
      const { toggleUserNotifications } = await import('../../mobile-db-supabase');
      
      if (!currentUserId) return;
      
      await toggleUserNotifications(currentUserId, userId);
      setFollowStatus(prev => ({ ...prev, notificationsEnabled: !prev.notificationsEnabled }));
    } catch (error) {
      console.error('Error updating notification status:', error);
      Alert.alert('Error', 'Failed to update notification settings');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      // Refresh all profile data by calling the main fetch function
      if (userId) {
        const fetchUserProfile = async () => {
          console.log('📥 Refreshing profile data for user:', userId);
          try {
            const { getUserById, getUserChirps, getUserReplies, getUserStats, checkFollowStatus } = await import('../../mobile-db-supabase');
            
            // Fetch user data
            const userData = await getUserById(userId);
            if (userData) {
              setUser(userData);
            }
            
            // Fetch chirps and replies
            const [chirpsData, repliesData, statsData] = await Promise.all([
              getUserChirps(userId),
              getUserReplies(userId),
              getUserStats(userId)
            ]);
            
            setChirps(chirpsData || []);
            setReplies(repliesData || []);
            console.log('🔄 Refresh - User stats data:', statsData);
            setStats({
              profilePower: statsData ? Math.floor((statsData.chirps * 10) + (statsData.moodReactions * 5) + (statsData.followers * 2) + (statsData.following * 1)) : 0,
              following: statsData?.following || 0,
              followers: statsData?.followers || 0
            });
            console.log('🔄 Refresh - Calculated Profile Power:', statsData ? Math.floor((statsData.chirps * 10) + (statsData.moodReactions * 5) + (statsData.followers * 2) + (statsData.following * 1)) : 0);
            
            // Fetch follow status if not own profile
            if (currentUserId && currentUserId !== userId) {
              const followData = await checkFollowStatus(userId, currentUserId);
              setFollowStatus(followData);
            }
            
          } catch (error) {
            console.error('Error refreshing profile data:', error);
          }
        };
        
        await fetchUserProfile();
      }
    } catch (error) {
      console.error('Error refreshing profile:', error);
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={handleBack}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
          <View style={styles.headerRight} />
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
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={handleBack}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
          <View style={styles.headerRight} />
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

  return (
    <View style={styles.container}>
      {/* Header - exactly like original web client */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={handleBack}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#7c3aed', '#ec4899']}
            tintColor="#7c3aed"
            title="Pull to refresh"
            titleColor="#657786"
          />
        }
      >
        {/* Banner Section - exactly like original */}
        <View style={styles.bannerContainer}>
          {user.banner_image_url ? (
            <Image source={{ uri: user.banner_image_url }} style={styles.bannerImage} />
          ) : (
            <View style={styles.bannerPlaceholder} />
          )}
        </View>

        {/* Profile Info Section - exactly like original layout */}
        <View style={styles.profileSection}>
          <View style={styles.profileHeader}>
            {/* Avatar and basic info */}
            <View style={styles.profileInfo}>
              <UserAvatar 
                user={{
                  id: user.id,
                  firstName: user.first_name || '',
                  lastName: user.last_name || '',
                  email: user.email || '',
                  profileImageUrl: user.profile_image_url || undefined
                }} 
                size="xl"
              />
              
              <View style={styles.profileDetails}>
                <View style={styles.nameContainer}>
                  <Text style={styles.displayName}>{displayName}</Text>
                </View>
                <Text style={styles.handle}>@{user.custom_handle || user.handle}</Text>
              </View>
            </View>

            {/* Action buttons - exactly like original */}
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={[styles.followButton, followStatus.isFollowing && styles.followingButton]} 
                onPress={handleFollow}
              >
                <Text style={[styles.followButtonText, followStatus.isFollowing && styles.followingButtonText]}>
                  {followStatus.isFollowing ? 'Following' : 'Follow'}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.moreButton} onPress={() => setShowMoreOptions(true)}>
                <Text style={styles.moreButtonText}>⋯</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Bio - exactly like original */}
          {user.bio && (
            <View style={styles.bioContainer}>
              <Text style={styles.bioText}>{user.bio}</Text>
            </View>
          )}

          {/* Profile Power - prominent display like own profile */}
          <View style={styles.profilePowerContainer}>
            <Text style={styles.profilePowerLabel}>Profile Power</Text>
            <Text style={styles.profilePowerNumber}>{stats.profilePower}</Text>
          </View>

          {/* Stats - exactly like original with dividers */}
          <View style={styles.statsContainer}>
            <TouchableOpacity style={styles.statItem} onPress={() => setShowFollowingModal(true)}>
              <Text style={styles.statNumber}>{stats.following}</Text>
              <Text style={styles.statLabel}>Following</Text>
            </TouchableOpacity>
            <View style={styles.statDivider} />
            <TouchableOpacity style={styles.statItem} onPress={() => setShowFollowersModal(true)}>
              <Text style={styles.statNumber}>{stats.followers}</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tabs - exactly like original */}
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
            style={[styles.tab, activeTab === 'gacha' && styles.activeTab]} 
            onPress={() => setActiveTab('gacha')}
          >
            <Text style={[styles.tabText, activeTab === 'gacha' && styles.activeTabText]}>
              Collection
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content - exactly like original with borders */}
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
                    <ChirpCard 
                      chirp={chirp} 
                      onProfilePress={(userId) => router.push(`/profile/${userId}`)}
                    />
                  </View>
                ))
              )}
            </View>
          )}
          
          {activeTab === 'gacha' && (
            <View style={styles.gachaContainer}>
              <View style={styles.collectionHeader}>
                <Text style={styles.collectionTitle}>Collection</Text>
                <Text style={styles.collectionSubtitle}>Profile cards collected by {user?.custom_handle || user?.handle}</Text>
              </View>
              
              <View style={styles.emptyCollectionState}>
                <Text style={styles.emptyCollectionIcon}>🎴</Text>
                <Text style={styles.emptyCollectionTitle}>No cards collected yet</Text>
                <Text style={styles.emptyCollectionText}>
                  This user hasn't collected any profile cards from the gacha system yet.
                </Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
      
      {/* More Options Modal - exactly like original */}
      <Modal
        visible={showMoreOptions}
        transparent={true}
        animationType="none"
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

      {/* Followers/Following Modals */}
      <FollowersFollowingModal
        visible={showFollowersModal}
        onClose={() => setShowFollowersModal(false)}
        userId={userId}
        type="followers"
        title="Followers"
      />

      <FollowersFollowingModal
        visible={showFollowingModal}
        onClose={() => setShowFollowingModal(false)}
        userId={userId}
        type="following"
        title="Following"
      />
    </View>
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
    paddingTop: 50,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    padding: 12,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 24,
    color: '#7c3aed',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  headerPlaceholder: {
    width: 36, // Same width as the removed more button
  },
  headerRight: {
    width: 36,
  },
  moreButton: {
    padding: 8,
  },
  moreButtonText: {
    fontSize: 20,
    color: '#6b7280',
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
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
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  bannerContainer: {
    height: 128,
    backgroundColor: '#7c3aed',
  },
  bannerImage: {
    width: '100%',
    height: 128,
  },
  bannerPlaceholder: {
    width: '100%',
    height: 100, // Match ProfilePage banner height
    backgroundColor: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #d946ef 100%)',
  },
  profileSection: {
    padding: 16,
    backgroundColor: '#ffffff',
    marginTop: -50, // Adjusted for 100px banner to maintain half-overlap
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  profileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  profileInfo: {
    flex: 1,
    marginTop: -30, // Adjusted for 100px banner to maintain half-overlap
  },
  profileDetails: {
    marginTop: 30, // Increased to account for higher avatar overlap
    marginLeft: 12, // Added left margin to separate from avatar
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 4,
  },
  displayName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginRight: 8,
  },
  handle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12, // Add spacing between buttons
  },
  followButton: {
    backgroundColor: '#7c3aed',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginLeft: 12,
  },
  followingButton: {
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  followButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  followingButtonText: {
    color: '#374151',
  },
  bioContainer: {
    marginBottom: 16,
  },
  bioText: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
  },
  profilePowerContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e8ed',
  },
  profilePowerLabel: {
    fontSize: 16,
    color: '#657786',
    fontWeight: '600',
    marginBottom: 8,
  },
  profilePowerNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#7c3aed',
    textShadowColor: 'rgba(124, 58, 237, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 20,
    backgroundColor: '#e5e7eb',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  statLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: '#ffffff',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#7c3aed',
  },
  tabText: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#7c3aed',
    fontWeight: '600',
  },
  tabContent: {
    backgroundColor: '#ffffff',
  },
  chirpsContainer: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  gachaContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 16,
  },
  collectionHeader: {
    marginBottom: 24,
    alignItems: 'center',
  },
  collectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  collectionSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  emptyCollectionState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyCollectionIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyCollectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  emptyCollectionText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 280,
  },
  chirpContainer: {
    backgroundColor: '#ffffff',
  },
  chirpBorder: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6b7280',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreOptionsMenu: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 8,
    margin: 20,
    minWidth: 250,
  },
  menuItem: {
    padding: 16,
    borderRadius: 8,
  },
  menuItemText: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
  },
  destructiveText: {
    color: '#ef4444',
  },
});
