import { router } from 'expo-router';
import { forwardRef, useCallback, useEffect, useImperativeHandle, useState } from 'react';
import {
    Alert,
    Dimensions,
    ImageBackground,
    Linking,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { DEFAULT_BANNER_URL } from '../constants/DefaultBanner';
import { useAuth } from './AuthContext';
import ChirpCard from './ChirpCard';
import FollowersFollowingModal from './FollowersFollowingModal';
import BirdIcon from './icons/BirdIcon';
import GearIcon from './icons/GearIcon';
import LinkIcon from './icons/LinkIcon';
import SettingsPage from './SettingsPage';
import UserAvatar from './UserAvatar';

interface User {
  id: string;
  firstName?: string;
  email: string;
  customHandle?: string;
  handle?: string;
  profileImageUrl?: string;
  avatarUrl?: string;
  bannerImageUrl?: string;
  bio?: string;
  linkInBio?: string;
  joinedAt?: string;
}

interface ProfileStats {
  following: number;
  followers: number;
  profilePower: number;
}

interface ProfilePageProps {
  onNavigateToProfile?: (tab: string) => void;
}

export default forwardRef<any, ProfilePageProps>(function ProfilePage({ onNavigateToProfile }, ref) {
  const { user: authUser } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'chirps' | 'comments' | 'collection'>('chirps');
  const [userChirps, setUserChirps] = useState<any[]>([]);
  const [userReplies, setUserReplies] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<ProfileStats>({
    following: 0,
    followers: 0,
    profilePower: 0
  });
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    closeSettings: () => {
      setShowSettings(false);
    }
  }));

  const fetchUserChirps = useCallback(async () => {
    try {
      if (!authUser?.id) return;
      
      console.log('🔄 ProfilePage: Fetching data via API...');
      const startTime = Date.now();
      
      // Use API instead of direct database connection
      const { getUserChirps, getUserReplies, getUserStats } = await import('../lib/api/mobile-api');
      
      // Fetch data in parallel for better performance
      const [chirpsData, repliesData, statsData] = await Promise.all([
        getUserChirps(authUser.id),
        getUserReplies(authUser.id),
        getUserStats(authUser.id)
      ]);
      
      const loadTime = Date.now() - startTime;
      console.log(`✅ ProfilePage: Data loaded successfully in ${loadTime}ms`);
      
      setUserChirps(chirpsData || []);
      setUserReplies(repliesData || []);
      
      // Calculate profile power using the new comprehensive algorithm
      const calculatedPower = await calculateProfilePower(authUser.id);
      
      // Update stats with API data
      setStats({
        followers: statsData.followers || 0,
        following: statsData.following || 0,
        profilePower: calculatedPower
      });
      
      console.log('ProfilePage: Data loaded successfully');
    } catch (error) {
      console.error('❌ ProfilePage: Error loading data:', error);
      // Keep existing mock data if API fails
    }
  }, [authUser?.id]);

  // Use the new comprehensive profile power calculation
  const calculateProfilePower = async (userId: string) => {
    try {
      const { calculateProfilePower } = await import('../lib/database/mobile-db-supabase');
      return await calculateProfilePower(userId);
    } catch (error) {
      console.error('❌ Error calculating profile power:', error);
      return 100; // Fallback to base power
    }
  };

  useEffect(() => {
    // Use authenticated user data from AuthContext
    if (authUser) {
      console.log('ProfilePage: authUser updated:', authUser.profileImageUrl ? 'has image' : 'no image');
      setUser(authUser);
      fetchUserChirps();
    }
  }, [authUser?.id]); // Only depend on authUser.id, not the entire authUser object or fetchUserChirps

  // Function to update chirp reply count
  const handleChirpReplyUpdate = useCallback((chirpId: string) => {
    setUserChirps(prevChirps => 
      prevChirps.map(chirp => 
        chirp.id === chirpId 
          ? { ...chirp, replyCount: (chirp.replyCount || 0) + 1 }
          : chirp
      )
    );
  }, []);

  const displayName = user?.firstName || user?.customHandle || user?.handle || 'User';

  // Removed weekly summary and AI profile generation functionality

  const [showSettings, setShowSettings] = useState(false);

  const handleSettings = () => {
    setShowSettings(true);
  };

  const handleNavigateToProfile = () => {
    setShowSettings(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      // Refresh user chirps and replies (fetchUserChirps handles both)
      await fetchUserChirps();
    } catch (error) {
      console.error('Error refreshing profile:', error);
    } finally {
      setRefreshing(false);
    }
  };

  if (showSettings) {
    return <SettingsPage onClose={() => setShowSettings(false)} />;
  }

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
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
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => Alert.alert('Navigate', 'Go back to previous screen')}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>Profile</Text>
          <Text style={styles.headerSubtitle}>{userChirps.length} chirps</Text>
        </View>
      </View>

      {/* Banner */}
      <View style={styles.bannerContainer}>
        <View style={styles.bannerImageWrapper}>
          <ImageBackground
            source={{ uri: user.bannerImageUrl || DEFAULT_BANNER_URL }}
            style={styles.banner}
            defaultSource={{ uri: DEFAULT_BANNER_URL }}
            resizeMode="cover"
          >
            <View style={styles.bannerOverlay} />
          </ImageBackground>
        </View>
      </View>

      {/* Profile Section */}
      <View style={styles.profileSection}>
        {/* Profile Avatar */}
        <View style={styles.avatarContainer}>
          <UserAvatar user={user} size="xl" />
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.iconButton} onPress={handleSettings}>
            <GearIcon size={16} color="#7c3aed" />
          </TouchableOpacity>
        </View>

        {/* User Info */}
        <View style={styles.userInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.displayName}>{displayName}</Text>
          </View>
          <Text style={styles.handle}>@{user.customHandle || user.handle}</Text>
                 <View style={styles.bioContainer}>
           {user.bio && user.bio.split(/(@\w+)/).map((part, index) => {
             if (part.startsWith('@')) {
               return (
                 <TouchableOpacity 
                   key={index}
                   style={styles.mentionContainer}
                   onPress={async () => {
                     try {
                       const { getUserByHandle } = await import('../lib/database/mobile-db-supabase');
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
                   <Text style={styles.mentionText}>{part}</Text>
                 </TouchableOpacity>
               );
             }
             return <Text key={index} style={styles.bio}>{part}</Text>;
           })}
         </View>

        {/* Link in Bio */}
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
        </View>
      </View>

      {/* Stats Row */}
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

      {/* Profile Tabs */}
      <View style={styles.tabsContainer}>
        {(['chirps', 'comments', 'collection'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {tab === 'chirps' ? 'Chirps' : tab === 'comments' ? 'Comments' : 'Showcase'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab Content */}
      <View style={styles.tabContent}>
        {activeTab === 'chirps' && (
          <View style={styles.chirpsContainer}>
            {userChirps.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>💬</Text>
                <Text style={styles.emptyTitle}>No chirps yet</Text>
                <Text style={styles.emptySubtext}>Your chirps will appear here</Text>
              </View>
            ) : (
              userChirps.map((chirp) => (
                <ChirpCard 
                  key={chirp.id} 
                  chirp={chirp} 
                  onDeleteSuccess={fetchUserChirps}
                  onReplyPosted={handleChirpReplyUpdate}
                  onProfilePress={(userId) => router.push(`/profile/${userId}`)}
                />
              ))
            )}
          </View>
        )}
        
        {activeTab === 'comments' && (
          <View style={styles.repliesContainer}>
            {userReplies.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>💬</Text>
                <Text style={styles.emptyTitle}>No comments yet</Text>
                <Text style={styles.emptySubtext}>Your comments will appear here</Text>
              </View>
            ) : (
              userReplies.map((reply) => (
                <ChirpCard 
                  key={reply.id} 
                  chirp={reply} 
                  onDeleteSuccess={fetchUserChirps}
                  onReplyPosted={handleChirpReplyUpdate}
                  onProfilePress={(userId) => router.push(`/profile/${userId}`)}
                />
              ))
            )}
          </View>
        )}

        {activeTab === 'collection' && (
          <View style={styles.collectionContainer}>
            <View style={styles.emptyState}>
              <BirdIcon size={50} color="#7c3aed" />
              <Text style={styles.emptyTitle}>Collection Feed</Text>
              <Text style={styles.emptySubtext}>Chirps from your gacha collection profiles will appear here</Text>
            </View>
          </View>
        )}
      </View>
      
      {/* Followers/Following Modals */}
      <FollowersFollowingModal
        visible={showFollowersModal}
        onClose={() => setShowFollowersModal(false)}
        userId={authUser?.id || ''}
        type="followers"
        title="Followers"
      />

      <FollowersFollowingModal
        visible={showFollowingModal}
        onClose={() => setShowFollowingModal(false)}
        userId={authUser?.id || ''}
        type="following"
        title="Following"
      />
    </ScrollView>
  );
});

const { width: screenWidth } = Dimensions.get('window');
const bannerHeight = Math.round(screenWidth / 3); // 3:1 aspect ratio

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
    paddingTop: 20, // Add top padding
    paddingBottom: 40, // Increased bottom padding to avoid iPhone home indicator
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  loadingText: {
    fontSize: 16,
    color: '#657786',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 60, // Increased to avoid iPhone 16 dynamic island
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e8ed',
  },
  backButton: {
    padding: 8,
    marginRight: 16,
  },
  backIcon: {
    fontSize: 20,
    color: '#14171a',
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#14171a',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#657786',
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
  banner: {
    width: '100%',
    height: '100%',
  },
  bannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(124, 58, 237, 0.1)',
  },
  avatarContainer: {
    position: 'absolute',
    top: -44, // Position so only top half overlaps banner (half of avatar height)
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
  aiProfileButtonContainer: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    height: 40, // Fixed height for consistency
  },
  aiProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    height: 40, // Fixed height for consistency
  },
  aiProfileIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  aiProfileText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  settingsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e1e8ed',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    height: 40, // Fixed height for consistency
  },
  settingsIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  settingsText: {
    color: '#14171a',
    fontSize: 14,
    fontWeight: '600',
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
  bioContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  bio: {
    fontSize: 15,
    color: '#14171a',
    lineHeight: 20,
  },
  mentionContainer: {
    alignItems: 'baseline',
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
  joinedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  calendarIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  joinedText: {
    fontSize: 15,
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
  },
  statItem: {
    flex: 1,
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
  weeklySummaryCard: {
    margin: 16,
    padding: 20,
    backgroundColor: '#f8f4ff',
    borderRadius: 16,
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  weeklySummaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  weeklySummaryIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  weeklySummaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#14171a',
    flex: 1,
  },
  weeklySummaryDate: {
    alignItems: 'flex-end',
  },
  summaryDateText: {
    fontSize: 12,
    color: '#657786',
  },
  nextUpdateText: {
    fontSize: 12,
    color: '#7c3aed',
    marginTop: 2,
  },
  weeklySummaryContent: {
    fontSize: 14,
    lineHeight: 20,
    color: '#14171a',
  },
  statsCards: {
    paddingHorizontal: 16,
  },
  statsRow2: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e1e8ed',
    marginBottom: 12,
  },
  statCardIcon: {
    fontSize: 16,
    marginBottom: 8,
  },
  statCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#657786',
    marginBottom: 4,
  },
  statCardValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#14171a',
  },
  statCardSubtitle: {
    fontSize: 14,
    color: '#14171a',
    fontWeight: '500',
  },
  statCardContent: {
    fontSize: 14,
    color: '#14171a',
    lineHeight: 18,
  },
  reactionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  reactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reactionIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  reactionCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#14171a',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#7c3aed',
    color: '#ffffff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: '500',
  },
  feedNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  checkmarkIcon: {
    fontSize: 14,
    color: '#10b981',
    marginRight: 8,
  },
  feedNoticeText: {
    fontSize: 14,
    color: '#657786',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e8ed',
    paddingHorizontal: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#d946ef',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#657786',
  },
  activeTabText: {
    color: '#d946ef',
    fontWeight: '600',
  },
  tabContent: {
    minHeight: 200,
    backgroundColor: '#ffffff',
  },
  emptyState: {
    paddingVertical: 48,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#14171a',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#657786',
    textAlign: 'center',
  },
  chirpsContainer: {
    paddingHorizontal: 8,
    paddingBottom: 80, // Extra padding to clear navigation bar
  },
  repliesContainer: {
    paddingHorizontal: 8,
    paddingBottom: 80, // Extra padding to clear navigation bar
  },
  collectionContainer: {
    paddingHorizontal: 8,
    paddingBottom: 80, // Extra padding to clear navigation bar
  },
  analyticsContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e1e8ed',
  },
  analyticsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  analyticItem: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  analyticIcon: {
    fontSize: 16,
    marginBottom: 4,
  },
  analyticValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#14171a',
    marginBottom: 2,
  },
  analyticLabel: {
    fontSize: 12,
    color: '#657786',
    fontWeight: '500',
  },
  analyticSubtitle: {
    fontSize: 12,
    color: '#14171a',
    fontWeight: '500',
  },
  topChirpCard: {
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 12,
  },
  topChirpIcon: {
    fontSize: 16,
    marginBottom: 4,
  },
  topChirpTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#657786',
    marginBottom: 4,
  },
  topChirpContent: {
    fontSize: 14,
    color: '#14171a',
    lineHeight: 18,
  },
  reactionsAnalytics: {
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 12,
  },
  reactionsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#657786',
    marginBottom: 8,
  },
  commonWordsCard: {
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  commonWordsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#657786',
    marginBottom: 8,
  },
  promptOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  promptContainer: {
    backgroundColor: '#ffffff',
    margin: 20,
    borderRadius: 20,
    padding: 24,
    maxWidth: 400,
    width: '90%',
  },
  promptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  promptTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#14171a',
  },
  promptCloseButton: {
    padding: 8,
  },
  promptCloseText: {
    fontSize: 20,
    color: '#657786',
    fontWeight: 'bold',
  },
  promptDescription: {
    fontSize: 16,
    color: '#14171a',
    marginBottom: 16,
    textAlign: 'center',
  },
  promptInput: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#14171a',
    textAlignVertical: 'top',
    minHeight: 100,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e1e8ed',
  },
  promptButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#657786',
    fontWeight: '600',
    fontSize: 16,
  },
  generateButtonContainer: {
    flex: 1,
    borderRadius: 25,
  },
  generateButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  generateButtonDisabled: {
    backgroundColor: '#b8b8b8',
  },
  generateButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
  },
  generateProfileButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  generateProfileButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },
  settingsButtonRounded: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e1e8ed',
    marginLeft: 8,
  },
  summaryActionContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e1e8ed',
    alignItems: 'center',
  },
  postSummaryButton: {
    borderRadius: 12,
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  postSummaryButtonDisabled: {
    opacity: 0.6,
  },
  postSummaryGradient: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  postSummaryButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});