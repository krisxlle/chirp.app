import { useEffect, useState } from 'react';
import { Alert, Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { DEFAULT_BANNER_URL } from '../constants/DefaultBanner';
import { getFollowers, getFollowing, getUserById, getUserChirps } from '../lib/database/mobile-db-supabase';
import { useAuth } from './AuthContext';
import UserAvatar from './UserAvatar';

interface UserProfileViewProps {
  userId: string;
  onClose: () => void;
}

interface UserData {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  display_name?: string;
  custom_handle?: string;
  handle: string;
  bio?: string;
  profile_image_url?: string;
  banner_image_url?: string;
  crystal_balance?: number;
  created_at: string;
}

export default function UserProfileView({ userId, onClose }: UserProfileViewProps) {
  const { user: currentUser } = useAuth();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [followers, setFollowers] = useState<any[]>([]);
  const [following, setFollowing] = useState<any[]>([]);
  const [userChirps, setUserChirps] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'chirps' | 'followers' | 'following'>('chirps');

  useEffect(() => {
    loadUserData();
  }, [userId]);

  const loadUserData = async () => {
    try {
      setIsLoading(true);
      
      // Load user data
      const user = await getUserById(userId);
      if (user) {
        setUserData(user);
      }

      // Load followers
      const followersData = await getFollowers(userId);
      setFollowers(followersData);

      // Load following
      const followingData = await getFollowing(userId);
      setFollowing(followingData);

      // Load user chirps
      const chirpsData = await getUserChirps(userId);
      setUserChirps(chirpsData);

    } catch (error) {
      console.error('Error loading user data:', error);
      Alert.alert('Error', 'Failed to load user profile');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateProfilePower = (user: UserData) => {
    if (!user) return 0;
    
    // Base power from followers and chirps
    let power = (followers.length * 2) + (userChirps.length * 5);
    
    // Bonus for crystal balance
    power += Math.floor((user.crystal_balance || 0) / 1000);
    
    // Bonus for having a custom handle
    if (user.custom_handle) {
      power += 50;
    }
    
    // Bonus for bio
    if (user.bio && user.bio.length > 0) {
      power += 25;
    }
    
    return power;
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </View>
    );
  }

  if (!userData) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.errorText}>User not found</Text>
        </View>
      </View>
    );
  }

  const profilePower = calculateProfilePower(userData);
  const displayName = userData.display_name || userData.custom_handle || userData.handle;
  const joinDate = new Date(userData.created_at).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long' 
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Banner */}
        <Image 
          source={{ uri: userData.banner_image_url || DEFAULT_BANNER_URL }} 
          style={styles.bannerImage} 
        />

        {/* Profile Info */}
        <View style={styles.profileSection}>
          <View style={styles.avatarSection}>
            <UserAvatar user={userData} size={80} />
            <View style={styles.profilePowerContainer}>
              <Text style={styles.profilePowerLabel}>Profile Power</Text>
              <Text style={styles.profilePowerValue}>{profilePower}</Text>
            </View>
          </View>

          <View style={styles.userInfo}>
            <Text style={styles.displayName}>{displayName}</Text>
            <Text style={styles.handle}>@{userData.handle}</Text>
            {userData.custom_handle && userData.custom_handle !== userData.handle && (
              <Text style={styles.customHandle}>@{userData.custom_handle}</Text>
            )}
            {userData.bio && <Text style={styles.bio}>{userData.bio}</Text>}
            <Text style={styles.joinDate}>Joined {joinDate}</Text>
          </View>

          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{userChirps.length}</Text>
              <Text style={styles.statLabel}>Chirps</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{followers.length}</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{following.length}</Text>
              <Text style={styles.statLabel}>Following</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{userData.crystal_balance?.toLocaleString() || '0'}</Text>
              <Text style={styles.statLabel}>Crystals</Text>
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
              Chirps ({userChirps.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'followers' && styles.activeTab]}
            onPress={() => setActiveTab('followers')}
          >
            <Text style={[styles.tabText, activeTab === 'followers' && styles.activeTabText]}>
              Followers ({followers.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'following' && styles.activeTab]}
            onPress={() => setActiveTab('following')}
          >
            <Text style={[styles.tabText, activeTab === 'following' && styles.activeTabText]}>
              Following ({following.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        <View style={styles.tabContent}>
          {activeTab === 'chirps' && (
            <View style={styles.chirpsContainer}>
              {userChirps.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>No chirps yet</Text>
                  <Text style={styles.emptySubtext}>@{userData.handle} hasn't posted any chirps</Text>
                </View>
              ) : (
                userChirps.map((chirp) => (
                  <View key={chirp.id} style={styles.chirpItem}>
                    <Text style={styles.chirpContent}>{chirp.content}</Text>
                    <Text style={styles.chirpDate}>
                      {new Date(chirp.created_at).toLocaleDateString()}
                    </Text>
                  </View>
                ))
              )}
            </View>
          )}

          {activeTab === 'followers' && (
            <View style={styles.followersContainer}>
              {followers.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>No followers yet</Text>
                  <Text style={styles.emptySubtext}>@{userData.handle} doesn't have any followers</Text>
                </View>
              ) : (
                followers.map((follower) => (
                  <View key={follower.id} style={styles.followerItem}>
                    <UserAvatar user={follower} size={40} />
                    <View style={styles.followerInfo}>
                      <Text style={styles.followerName}>
                        {follower.display_name || follower.custom_handle || follower.handle}
                      </Text>
                      <Text style={styles.followerHandle}>@{follower.handle}</Text>
                    </View>
                  </View>
                ))
              )}
            </View>
          )}

          {activeTab === 'following' && (
            <View style={styles.followingContainer}>
              {following.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>Not following anyone</Text>
                  <Text style={styles.emptySubtext}>@{userData.handle} isn't following anyone yet</Text>
                </View>
              ) : (
                following.map((followed) => (
                  <View key={followed.id} style={styles.followingItem}>
                    <UserAvatar user={followed} size={40} />
                    <View style={styles.followingInfo}>
                      <Text style={styles.followingName}>
                        {followed.display_name || followed.custom_handle || followed.handle}
                      </Text>
                      <Text style={styles.followingHandle}>@{followed.handle}</Text>
                    </View>
                  </View>
                ))
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const { width: screenWidth } = Dimensions.get('window');
const bannerHeight = Math.round(screenWidth / 3); // 3:1 aspect ratio

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  closeButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  closeButtonText: {
    fontSize: 16,
    color: '#7c3aed',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  placeholder: {
    width: 60,
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  bannerImage: {
    width: '100%',
    height: bannerHeight, // Dynamic 3:1 aspect ratio
    resizeMode: 'cover',
  },
  profileSection: {
    padding: 20,
  },
  avatarSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  profilePowerContainer: {
    marginLeft: 20,
    alignItems: 'center',
  },
  profilePowerLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  profilePowerValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#7c3aed',
  },
  userInfo: {
    marginBottom: 20,
  },
  displayName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  handle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 4,
  },
  customHandle: {
    fontSize: 14,
    color: '#7c3aed',
    marginBottom: 8,
  },
  bio: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 22,
    marginBottom: 8,
  },
  joinDate: {
    fontSize: 14,
    color: '#9ca3af',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
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
    fontWeight: '600',
  },
  tabContent: {
    flex: 1,
  },
  chirpsContainer: {
    padding: 20,
  },
  chirpItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  chirpContent: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 22,
    marginBottom: 8,
  },
  chirpDate: {
    fontSize: 12,
    color: '#9ca3af',
  },
  followersContainer: {
    padding: 20,
  },
  followerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  followerInfo: {
    marginLeft: 12,
    flex: 1,
  },
  followerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  followerHandle: {
    fontSize: 14,
    color: '#6b7280',
  },
  followingContainer: {
    padding: 20,
  },
  followingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  followingInfo: {
    marginLeft: 12,
    flex: 1,
  },
  followingName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  followingHandle: {
    fontSize: 14,
    color: '#6b7280',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#6b7280',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
});
