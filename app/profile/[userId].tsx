import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    ImageBackground,
    Linking,
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
import LinkIcon from '../../components/icons/LinkIcon';
import NotificationIcon from '../../components/icons/NotificationIcon';
import ShowcaseSelector from '../../components/ShowcaseSelector';
import UserAvatar from '../../components/UserAvatar';
import { DEFAULT_BANNER_URL } from '../../constants/DefaultBanner';

interface User {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  customHandle?: string;
  handle?: string;
  profileImageUrl?: string;
  bannerImageUrl?: string;
  bio?: string;
  joinedAt?: string;
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
  const [loadingChirps, setLoadingChirps] = useState(false);
  const [loadingShowcase, setLoadingShowcase] = useState(false);
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
  const [showcase, setShowcase] = useState<any[]>([]);
  const [showShowcaseSelector, setShowShowcaseSelector] = useState(false);
  const [profileDataLoaded, setProfileDataLoaded] = useState(false);

  const router = useRouter();

  // Helper functions for rarity
  const getRarityColor = (rarity: string) => {
    const colors: { [key: string]: string } = {
      'common': '#9CA3AF',
      'uncommon': '#10B981', 
      'rare': '#3B82F6',
      'epic': '#8B5CF6',
      'legendary': '#F59E0B',
      'mythic': '#EF4444'
    };
    return colors[rarity] || '#9CA3AF';
  };

  const getRarityName = (rarity: string) => {
    const names: { [key: string]: string } = {
      'common': 'Common',
      'uncommon': 'Uncommon',
      'rare': 'Rare', 
      'epic': 'Epic',
      'legendary': 'Legendary',
      'mythic': 'Mythic'
    };
    return names[rarity] || 'Common';
  };

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

        // Import database functions
        const { 
          getUserById, 
          getUserStats, 
          checkFollowStatus,
          checkBlockStatus
        } = await import('../../lib/database/mobile-db-supabase');

        // Fetch essential profile data first (fast)
        const [
          userData, 
          userStats,
          followStatusData,
          isBlocked
        ] = await Promise.all([
          getUserById(userId),
          getUserStats(userId),
          // Only check follow status if viewing someone else's profile
          currentUserId && currentUserId !== userId ? checkFollowStatus(userId, currentUserId) : Promise.resolve({ isFollowing: false, isBlocked: false, notificationsEnabled: false }),
          currentUserId && currentUserId !== userId ? checkBlockStatus(currentUserId, userId) : false
        ]);
        
        // Update profile state immediately
        setUser(userData);
        setStats({
          profilePower: Math.floor((userStats.chirps * 10) + (userStats.likes * 5) + (userStats.followers * 2) + (userStats.following * 1)),
          following: userStats.following,
          followers: userStats.followers
        });
        setFollowStatus({
          isFollowing: followStatusData.isFollowing || false,
          isBlocked: isBlocked || false,
          notificationsEnabled: followStatusData.notificationsEnabled || false
        });
        
        setProfileDataLoaded(true);
        setLoading(false);
        console.log('✅ Profile data loaded, UI ready for interaction');
        
        // Load chirps and showcase in background (non-blocking)
        loadUserChirps(userId);
        // Only load showcase if user switches to showcase tab
        // loadShowcase(userId);
      } catch (error) {
        console.error('❌ Error fetching user profile:', error);
      } finally {
        setLoading(false);
        console.log('⏹️ Profile loading completed');
      }
    };

    fetchUserProfile();
  }, [userId, currentUserId]);

  // Load showcase data when user switches to showcase tab
  useEffect(() => {
    if (activeTab === 'gacha' && profileDataLoaded && showcase.length === 0 && !loadingShowcase) {
      console.log('🎮 Loading showcase data for tab switch');
      loadShowcase(userId);
    }
  }, [activeTab, profileDataLoaded, showcase.length, loadingShowcase, userId]);

  const loadUserChirps = async (targetUserId: string) => {
    try {
      setLoadingChirps(true);
      console.log('📥 Loading chirps for user:', targetUserId);
      
      const { getUserChirps, getUserReplies } = await import('../../lib/database/mobile-db-supabase');
      
      const [userChirps, userReplies] = await Promise.all([
        getUserChirps(targetUserId),
        getUserReplies(targetUserId)
      ]);
      
      setChirps(userChirps);
      setReplies(userReplies);
      setLoadingChirps(false);
      console.log('✅ Chirps loaded successfully');
    } catch (error) {
      console.error('❌ Error loading chirps:', error);
      setLoadingChirps(false);
    }
  };

  const loadShowcase = async (targetUserId: string) => {
    try {
      setLoadingShowcase(true);
      console.log('🎮 Loading showcase for user:', targetUserId);
      const { getUserShowcase } = await import('../../lib/database/mobile-db-supabase');
      const userShowcase = await getUserShowcase(targetUserId);
      setShowcase(userShowcase);
      console.log('✅ Showcase loaded successfully:', userShowcase.length, 'profiles');
    } catch (error) {
      console.error('❌ Error loading showcase:', error);
      setShowcase([]);
    } finally {
      setLoadingShowcase(false);
    }
  };

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
      const { followUser, unfollowUser } = await import('../../lib/database/mobile-db-supabase');
      
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
      const { blockUser, unblockUser } = await import('../../lib/database/mobile-db-supabase');
      
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
      const { toggleUserNotifications } = await import('../../lib/database/mobile-db-supabase');
      
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
            const { getUserById, getUserStats, checkFollowStatus, checkBlockStatus } = await import('../../lib/database/mobile-db-supabase');
            
            // Fetch essential data first
            const [userData, statsData, followData, isBlocked] = await Promise.all([
              getUserById(userId),
              getUserStats(userId),
              currentUserId && currentUserId !== userId ? checkFollowStatus(userId, currentUserId) : Promise.resolve({ isFollowing: false, isBlocked: false, notificationsEnabled: false }),
              currentUserId && currentUserId !== userId ? checkBlockStatus(currentUserId, userId) : false
            ]);
            
            if (userData) {
              setUser(userData);
            }
            
            setStats({
              profilePower: statsData ? Math.floor((statsData.chirps * 10) + (statsData.likes * 5) + (statsData.followers * 2) + (statsData.following * 1)) : 0,
              following: statsData?.following || 0,
              followers: statsData?.followers || 0
            });
            
            setFollowStatus({
              isFollowing: followData.isFollowing || false,
              isBlocked: isBlocked || false,
              notificationsEnabled: followData.notificationsEnabled || false
            });
            
            // Load chirps separately
            await loadUserChirps(userId);
            
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

  const displayName = user.firstName && user.lastName 
    ? `${user.firstName} ${user.lastName}`.trim()
    : (user.customHandle || user.handle || user.email?.split('@')[0] || 'User');

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
          <View style={styles.bannerImageWrapper}>
            <ImageBackground 
              source={{ uri: user.bannerImageUrl || DEFAULT_BANNER_URL }} 
              style={styles.bannerImage}
              resizeMode="cover"
              defaultSource={{ uri: DEFAULT_BANNER_URL }}
              onError={(error) => {
                console.log('Banner image failed to load:', error.nativeEvent.error);
                console.log('Banner URL:', user.bannerImageUrl || DEFAULT_BANNER_URL);
              }}
              onLoad={() => {
                console.log('Banner image loaded successfully');
              }}
            />
          </View>
        </View>

        {/* Profile Info Section - Traditional Social Media Layout */}
        <View style={styles.profileSection}>
          {/* Avatar positioned to overlap banner */}
          <View style={styles.avatarContainer}>
            <UserAvatar 
              user={{
                id: user.id,
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                email: user.email || '',
                profileImageUrl: user.profileImageUrl || undefined
              }} 
              size="xl"
            />
          </View>

          {/* Action buttons positioned to the right */}
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.iconButton} onPress={() => setShowMoreOptions(true)}>
              <Text style={styles.iconButtonText}>⋯</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.iconButton}
              onPress={handleNotificationToggle}
            >
              <NotificationIcon 
                size={16} 
                color={followStatus.notificationsEnabled ? "#7c3aed" : "#9ca3af"} 
              />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.followButton, followStatus.isFollowing && styles.followingButton]} 
              onPress={handleFollow}
            >
              {followStatus.isFollowing ? (
                <Text style={[styles.followButtonText, followStatus.isFollowing && styles.followingButtonText]}>
                  {followStatus.isFollowing ? 'Following' : 'Follow'}
                </Text>
              ) : (
                <LinearGradient
                  colors={['#7c3aed', '#ec4899']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.followButtonGradient}
                >
                  <Text style={styles.followButtonText}>
                    Follow
                  </Text>
                </LinearGradient>
              )}
            </TouchableOpacity>
          </View>

          {/* User info section */}
          <View style={styles.userInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.displayName}>{displayName}</Text>
            </View>
            
            <Text style={styles.handle}>@{user.customHandle || user.handle}</Text>

            {/* Bio */}
            {user.bio && (
              <Text style={styles.bio}>
                {user.bio.split(/(@\w+)/).map((part, index) => {
                  if (part.startsWith('@')) {
                    return (
                      <Text 
                        key={index} 
                        style={styles.mentionText}
                        onPress={async () => {
                          try {
                            const { getUserByHandle } = await import('../../lib/database/mobile-db-supabase');
                            const mentionedUser = await getUserByHandle(part);
                            if (mentionedUser) {
                              const { router } = await import('expo-router');
                              router.push(`/profile/${mentionedUser.id}`);
                            } else {
                              Alert.alert('User Not Found', `User ${part} could not be found.`);
                            }
                          } catch (error) {
                            console.error('Error navigating to mentioned user:', error);
                            Alert.alert('Error', 'Failed to navigate to user profile.');
                          }
                        }}
                      >
                        {part}
                      </Text>
                    );
                  }
                  return <Text key={index}>{part}</Text>;
                })}
              </Text>
            )}

            {/* Additional info row - only show if user has a link */}
            {user.linkInBio && (
              <View style={styles.infoRow}>
                <LinkIcon size={14} color="#657786" />
                <TouchableOpacity onPress={() => {
                  // Open the link
                  const url = user.linkInBio.startsWith('http') ? user.linkInBio : `https://${user.linkInBio}`;
                  Linking.openURL(url).catch(err => console.error('Failed to open URL:', err));
                }}>
                  <Text style={styles.linkText}>{user.linkInBio}</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Profile Power */}
            <View style={styles.profilePowerContainer}>
              <Text style={styles.profilePowerLabel}>Profile Power</Text>
              <Text style={styles.profilePowerNumber}>{stats.profilePower}</Text>
            </View>

            {/* Stats row */}
            <View style={styles.statsRow}>
              <TouchableOpacity style={styles.statItem} onPress={() => setShowFollowingModal(true)}>
                <Text style={styles.statNumber}>{stats.following}</Text>
                <Text style={styles.statLabel}>Following</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.statItem} onPress={() => setShowFollowersModal(true)}>
                <Text style={styles.statNumber}>{stats.followers}</Text>
                <Text style={styles.statLabel}>Followers</Text>
              </TouchableOpacity>
            </View>
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
              Showcase
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content - exactly like original with borders */}
        <View style={styles.tabContent}>
          {activeTab === 'chirps' && (
            <View style={styles.chirpsContainer}>
              {loadingChirps ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#7c3aed" />
                  <Text style={styles.loadingText}>Loading chirps...</Text>
                </View>
              ) : chirps.length === 0 ? (
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
            <View style={styles.showcaseContainer}>
              <View style={styles.showcaseHeader}>
                <Text style={styles.showcaseTitle}>Showcase</Text>
                <Text style={styles.showcaseSubtitle}>
                  {userId === currentUserId 
                    ? "Your featured profiles" 
                    : `Featured profiles by ${user?.custom_handle || user?.handle}`
                  }
                </Text>
                {userId === currentUserId && (
                  <TouchableOpacity 
                    style={styles.editShowcaseButton}
                    onPress={() => setShowShowcaseSelector(true)}
                  >
                    <Text style={styles.editShowcaseButtonText}>Edit Showcase</Text>
                  </TouchableOpacity>
                )}
              </View>
              
              {loadingShowcase ? (
                <View style={styles.loadingShowcaseState}>
                  <ActivityIndicator size="small" color="#7c3aed" />
                  <Text style={styles.loadingShowcaseText}>Loading showcase...</Text>
                </View>
              ) : showcase.length === 0 ? (
                <View style={styles.emptyShowcaseState}>
                  <Text style={styles.emptyShowcaseIcon}>🎴</Text>
                  <Text style={styles.emptyShowcaseTitle}>
                    {userId === currentUserId ? "No profiles showcased yet" : "No profiles showcased"}
                  </Text>
                  <Text style={styles.emptyShowcaseText}>
                    {userId === currentUserId 
                      ? "Select up to 6 profiles from your collection to showcase them here."
                      : "This user hasn't selected any profiles for their showcase yet."
                    }
                  </Text>
                </View>
              ) : (
                <View style={styles.showcaseGrid}>
                  {showcase.map((profile, index) => (
                    <View key={profile.id} style={styles.showcaseCard}>
                      <View style={[styles.rarityBadge, { backgroundColor: getRarityColor(profile.rarity) }]}>
                        <Text style={styles.rarityText}>{getRarityName(profile.rarity)}</Text>
                      </View>
                      
                      <View style={styles.profileFrameContainer}>
                        {profile.imageUrl ? (
                          <Image 
                            source={{ uri: profile.imageUrl }} 
                            style={styles.showcaseProfileImage} 
                          />
                        ) : (
                          <View style={[styles.showcaseProfilePlaceholder, { backgroundColor: getRarityColor(profile.rarity) }]}>
                            <Text style={styles.showcaseProfileText}>{profile.name.charAt(0)}</Text>
                          </View>
                        )}
                      </View>
                      
                      <Text style={styles.showcaseProfileName} numberOfLines={1}>{profile.name}</Text>
                      <Text style={styles.showcaseProfileHandle} numberOfLines={1}>@{profile.handle}</Text>
                      <Text style={styles.showcaseProfileBio} numberOfLines={2}>{profile.bio}</Text>
                    </View>
                  ))}
                </View>
              )}
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

      {/* Showcase Selector Modal */}
      {userId === currentUserId && (
        <ShowcaseSelector
          visible={showShowcaseSelector}
          onClose={() => setShowShowcaseSelector(false)}
          onShowcaseUpdated={() => loadShowcase(userId)}
        />
      )}
    </View>
  );
}

const { width: screenWidth } = Dimensions.get('window');
const bannerHeight = Math.round(screenWidth / 3); // Proper 3:1 aspect ratio

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
    position: 'relative',
    height: bannerHeight, // Dynamic 3:1 aspect ratio
    backgroundColor: '#7c3aed',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerImageWrapper: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  bannerPlaceholder: {
    width: '100%',
    height: bannerHeight, // Dynamic 3:1 aspect ratio
    backgroundColor: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #d946ef 100%)',
  },
  profileSection: {
    backgroundColor: '#ffffff',
    marginTop: -(bannerHeight * 0.25), // 25% overlap for proper 3:1 aspect ratio
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  avatarContainer: {
    position: 'absolute',
    top: -(bannerHeight * 0.25) - 22, // Position so only top half overlaps banner (half of avatar height)
    left: 16,
    borderRadius: 44, // (80px avatar + 8px border) / 2 = 44px for perfect circle
    borderWidth: 4,
    borderColor: '#ffffff',
    width: 88, // 80px avatar + 8px border (4px each side)
    height: 88, // 80px avatar + 8px border (4px each side) 
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10, // Ensure avatar is above other elements
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 8, // Reduced top padding
    paddingBottom: 8,
    marginTop: 10,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#e1e8ed',
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButtonText: {
    fontSize: 16,
    color: '#7c3aed',
  },
  followButton: {
    borderRadius: 20,
    marginLeft: 8,
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  followButtonGradient: {
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  followingButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e1e8ed',
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  followButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  followingButtonText: {
    color: '#6b7280',
    fontSize: 14,
    fontWeight: 'bold',
  },
  userInfo: {
    paddingHorizontal: 16,
    paddingTop: 8, // Further reduced padding for tighter layout
    paddingBottom: 16,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  displayName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#14171a',
  },
  handle: {
    fontSize: 15,
    color: '#657786',
    marginBottom: 12,
  },
  bio: {
    fontSize: 15,
    color: '#14171a',
    marginBottom: 12,
    lineHeight: 20,
  },
  mentionText: {
    fontSize: 15,
    color: '#7c3aed',
    lineHeight: 20,
  },
  linkText: {
    fontSize: 14,
    color: '#7c3aed',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  infoItem: {
    fontSize: 14,
    color: '#657786',
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
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e8ed',
    justifyContent: 'center',
    gap: 48, // Increased gap for better centering
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#14171a',
  },
  statLabel: {
    fontSize: 13,
    color: '#657786',
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
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 8,
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
  // Showcase styles
  showcaseContainer: {
    padding: 20,
  },
  showcaseHeader: {
    marginBottom: 20,
  },
  showcaseTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  showcaseSubtitle: {
    fontSize: 16,
    color: '#657786',
    marginBottom: 12,
  },
  editShowcaseButton: {
    backgroundColor: '#7c3aed',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  editShowcaseButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyShowcaseState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingShowcaseState: {
    alignItems: 'center',
    paddingVertical: 40,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  loadingShowcaseText: {
    fontSize: 14,
    color: '#657786',
    marginLeft: 8,
  },
  emptyShowcaseIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyShowcaseTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  emptyShowcaseText: {
    fontSize: 14,
    color: '#657786',
    textAlign: 'center',
    lineHeight: 20,
  },
  showcaseGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  showcaseCard: {
    width: (screenWidth - 60) / 2,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
  },
  rarityBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 1,
  },
  rarityText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  profileFrameContainer: {
    width: 60,
    height: 60,
    alignSelf: 'center',
    marginVertical: 8,
  },
  showcaseProfileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
  },
  showcaseProfilePlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  showcaseProfileText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  showcaseProfileName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 2,
  },
  showcaseProfileHandle: {
    fontSize: 12,
    color: '#657786',
    textAlign: 'center',
    marginBottom: 4,
  },
  showcaseProfileBio: {
    fontSize: 11,
    color: '#657786',
    textAlign: 'center',
    lineHeight: 16,
  },
});
