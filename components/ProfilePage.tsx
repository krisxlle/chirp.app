import React, { useEffect, useState } from 'react';
import {
    Alert,
    ImageBackground,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useAuth } from './AuthContext';
import ChirpCard from './ChirpCard';
import FollowersFollowingModal from './FollowersFollowingModal';
import GearIcon from './icons/GearIcon';
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
  joinedAt?: string;
}

interface ProfileStats {
  following: number;
  followers: number;
  profilePower: number;
}

export default function ProfilePage() {
  const { user: authUser } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'chirps' | 'comments' | 'collection'>('chirps');
  const [userChirps, setUserChirps] = useState<any[]>([]);
  const [userReplies, setUserReplies] = useState<any[]>([]);
  const [stats, setStats] = useState<ProfileStats>({
    following: 0,
    followers: 0,
    profilePower: 0
  });
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);

  const fetchUserChirps = async () => {
    try {
      if (!authUser?.id) return;
      
      console.log('ProfilePage: Using mock data (database calls disabled)');
      
      // TEMPORARILY DISABLED: Database calls
      // const { getUserChirps, getUserReplies, getUserStats } = await import('../mobile-db');
      
      // Mock data for testing
      const mockChirps = [
        {
          id: '1',
          content: 'Welcome to Chirp! This is a test chirp to get you started. 🐦✨',
          createdAt: new Date().toISOString(),
          reactionCount: 5,
          replyCount: 2,
        },
        {
          id: '2',
          content: 'Testing the app with authentication disabled. Everything should work smoothly now! 🚀',
          createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          reactionCount: 12,
          replyCount: 3,
        }
      ];
      
      const mockReplies = [
        {
          id: '1',
          content: 'Great post!',
          createdAt: new Date().toISOString(),
          reactionCount: 2,
          replyCount: 1,
        }
      ];
      
      const mockStats = {
        followers: 125,
        following: 89,
      };
      
      setUserChirps(mockChirps);
      setUserReplies(mockReplies);
      
      // Calculate profile power based on mock data
      const profilePower = calculateProfilePower(mockChirps, mockReplies, mockStats);
      
      // Update stats with mock data
      setStats({
        followers: mockStats.followers,
        following: mockStats.following,
        profilePower: profilePower
      });
    } catch (error) {
      console.error('Error fetching user chirps:', error);
    }
  };

  // Algorithm to calculate profile power based on engagement
  const calculateProfilePower = (chirps: any[], replies: any[], stats: any) => {
    let totalPower = 0;
    
    // Base power from followers (each follower = 10 points)
    totalPower += (stats.followers || 0) * 10;
    
    // Power from chirps (each chirp = 5 points)
    totalPower += chirps.length * 5;
    
    // Power from replies (each reply = 3 points)
    totalPower += replies.length * 3;
    
    // Power from engagement on chirps
    chirps.forEach(chirp => {
      // Reaction power (each reaction = 1 point)
      totalPower += (chirp.reactionCount || 0) * 1;
      
      // Reply power (each reply = 2 points)
      totalPower += (chirp.replyCount || 0) * 2;
    });
    
    // Power from engagement on replies
    replies.forEach(reply => {
      // Reaction power (each reaction = 1 point)
      totalPower += (reply.reactionCount || 0) * 1;
      
      // Reply power (each reply = 2 points)
      totalPower += (reply.replyCount || 0) * 2;
    });
    
    // Activity bonus (more active users get bonus)
    const totalPosts = chirps.length + replies.length;
    if (totalPosts >= 10) totalPower += 100; // Active user bonus
    if (totalPosts >= 25) totalPower += 200; // Very active user bonus
    if (totalPosts >= 50) totalPower += 300; // Power user bonus
    
    // Engagement rate bonus (high engagement rate = more power)
    const totalEngagement = chirps.reduce((sum, chirp) => 
      sum + (chirp.reactionCount || 0) + (chirp.replyCount || 0), 0
    );
    const engagementRate = totalPosts > 0 ? totalEngagement / totalPosts : 0;
    
    if (engagementRate >= 5) totalPower += 150; // High engagement bonus
    if (engagementRate >= 10) totalPower += 300; // Very high engagement bonus
    
    // Minimum power of 100, maximum reasonable power of 2000
    return Math.max(100, Math.min(2000, Math.round(totalPower)));
  };

  useEffect(() => {
    // Use authenticated user data from AuthContext
    if (authUser) {
      setUser(authUser);
      fetchUserChirps();
    }
  }, [authUser]);

  const displayName = user?.firstName || user?.customHandle || user?.handle || 'User';

  // Removed weekly summary and AI profile generation functionality

  const [showSettings, setShowSettings] = useState(false);

  const handleSettings = () => {
    setShowSettings(true);
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
    <ScrollView style={styles.container}>
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
        <ImageBackground
          source={{ uri: user.bannerImageUrl || 'https://via.placeholder.com/400x200/7c3aed/ffffff' }}
          style={styles.banner}
          defaultSource={{ uri: 'https://via.placeholder.com/400x200/7c3aed/ffffff' }}
        >
          <View style={styles.bannerOverlay} />
        </ImageBackground>
        
        {/* Profile Avatar */}
        <View style={styles.avatarContainer}>
          <UserAvatar user={user} size="xl" />
        </View>
      </View>

            {/* User Info */}
      <View style={styles.userInfo}>
        <View style={styles.nameRow}>
          <View style={styles.nameContainer}>
            <Text style={styles.displayName}>{displayName}</Text>
            <Text style={styles.handle}>@{user.customHandle || user.handle}</Text>
          </View>
          <TouchableOpacity style={styles.settingsButtonRounded} onPress={handleSettings}>
            <GearIcon size={16} color="#7c3aed" />
            <Text style={styles.settingsText}>Settings</Text>
          </TouchableOpacity>
        </View>
                 <Text style={styles.bio}>
           {user.bio && user.bio.split(/(@\w+)/).map((part, index) => {
             if (part.startsWith('@')) {
               return (
                 <TouchableOpacity 
                   key={index} 
                   onPress={() => {
                     // TEMPORARILY DISABLED: Database calls
                     console.log('🔗 Mention clicked (database call disabled):', part);
                     Alert.alert('Feature Disabled', 'User profile navigation is temporarily disabled while database calls are disabled.');
                   }}
                 >
                   <Text style={styles.mentionText}>{part}</Text>
                 </TouchableOpacity>
               );
             }
             return <Text key={index}>{part}</Text>;
           })}
         </Text>
      </View>

      {/* Profile Power */}
      <View style={styles.profilePowerContainer}>
        <Text style={styles.profilePowerLabel}>Profile Power</Text>
        <Text style={styles.profilePowerNumber}>{stats.profilePower}</Text>
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
              {tab === 'chirps' ? 'Chirps' : tab === 'comments' ? 'Comments' : 'Collection'}
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
                />
              ))
            )}
          </View>
        )}

        {activeTab === 'collection' && (
          <View style={styles.collectionContainer}>
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🎮</Text>
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
}

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
    height: 100, // Reduced by 50% from 200px
  },
  banner: {
    width: '100%',
    height: 100, // Reduced by 50% from 200px
  },
  bannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(124, 58, 237, 0.1)',
  },
  avatarContainer: {
    position: 'absolute',
    bottom: -44, // Centers avatar vertically on bottom edge of banner (half avatar height)
    left: 16,
    borderRadius: 44, // (80px avatar + 8px border) / 2 = 44px for perfect circle
    borderWidth: 4,
    borderColor: '#ffffff',
    width: 88, // 80px avatar + 8px border (4px each side)
    height: 88, // 80px avatar + 8px border (4px each side) 
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 12,
    marginBottom: 16,
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
    paddingTop: 20, // Reduced from 40 to 20 (moved buttons up by 20px)
    paddingBottom: 16,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nameContainer: {
    flex: 1,
    marginLeft: 100, // Add left margin to account for the avatar
  },
  displayName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#14171a',
  },

  handle: {
    fontSize: 15,
    color: '#657786',
    marginTop: 2,
  },
  bio: {
    fontSize: 15,
    color: '#14171a',
    marginTop: 12,
    lineHeight: 24,
  },
  mentionText: {
    color: '#7c3aed',
    fontSize: 15,
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
  },
  repliesContainer: {
    paddingHorizontal: 8,
  },
  collectionContainer: {
    paddingHorizontal: 8,
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