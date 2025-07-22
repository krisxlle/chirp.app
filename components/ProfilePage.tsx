import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  Image,
  ImageBackground,
  Alert 
} from 'react-native';
import UserAvatar from './UserAvatar';

interface User {
  id: string;
  firstName?: string;
  lastName?: string;
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
  chirps: number;
  reactions: number;
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'chirps' | 'replies' | 'reactions'>('chirps');
  const [stats, setStats] = useState<ProfileStats>({
    following: 1,
    followers: 1,
    chirps: 6,
    reactions: 3
  });

  useEffect(() => {
    // Mock user data for now - will be replaced with real data
    setUser({
      id: '1',
      firstName: 'Chirp',
      lastName: '',
      email: 'user@example.com',
      customHandle: '@Chirp',
      bio: 'Welcome to Chirp | @kriselle',
      joinedAt: '5 days ago',
      profileImageUrl: null,
      bannerImageUrl: null
    });
  }, []);

  const displayName = user?.firstName || user?.customHandle || 'User';

  const handleAIProfile = () => {
    Alert.alert('AI Profile', 'AI Profile generation coming soon!');
  };

  const handleSettings = () => {
    Alert.alert('Settings', 'Settings page coming soon!');
  };

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
        <TouchableOpacity style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>Profile</Text>
          <Text style={styles.headerSubtitle}>{stats.chirps} chirps</Text>
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
        
        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.aiProfileButton} onPress={handleAIProfile}>
            <Text style={styles.aiProfileIcon}>✨</Text>
            <Text style={styles.aiProfileText}>AI Profile</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingsButton} onPress={handleSettings}>
            <Text style={styles.settingsIcon}>⚙️</Text>
            <Text style={styles.settingsText}>Settings</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* User Info */}
      <View style={styles.userInfo}>
        <View style={styles.nameRow}>
          <Text style={styles.displayName}>{displayName}</Text>
          <Text style={styles.crownIcon}>👑</Text>
        </View>
        <Text style={styles.handle}>{user.customHandle || user.handle}</Text>
        <Text style={styles.bio}>{user.bio}</Text>
        
        <View style={styles.joinedRow}>
          <Text style={styles.calendarIcon}>📅</Text>
          <Text style={styles.joinedText}>Joined {user.joinedAt}</Text>
        </View>
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <TouchableOpacity style={styles.statItem}>
          <Text style={styles.statNumber}>{stats.following}</Text>
          <Text style={styles.statLabel}>Following</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.statItem}>
          <Text style={styles.statNumber}>{stats.followers}</Text>
          <Text style={styles.statLabel}>Followers</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.statItem}>
          <Text style={styles.statNumber}>{stats.chirps}</Text>
          <Text style={styles.statLabel}>Chirps</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.statItem}>
          <Text style={styles.statNumber}>{stats.reactions}</Text>
          <Text style={styles.statLabel}>Reactions</Text>
        </TouchableOpacity>
      </View>

      {/* Weekly Summary Card */}
      <View style={styles.weeklySummaryCard}>
        <View style={styles.weeklySummaryHeader}>
          <Text style={styles.weeklySummaryIcon}>✨</Text>
          <Text style={styles.weeklySummaryTitle}>Weekly Summary</Text>
          <View style={styles.weeklySummaryDate}>
            <Text style={styles.summaryDateText}>Jul 12 - Jul 18</Text>
            <Text style={styles.nextUpdateText}>⏰ Next: 4d 0h 38m</Text>
          </View>
        </View>
        
        <Text style={styles.weeklySummaryContent}>
          This week you posted 5 times and honestly? Peak tech anxiety energy ⚡ That chirp about AI stealing jobs hit different - giving main character meets existential crisis vibes 🦋 Plus all those notification tests? You're basically running QA for the whole platform ⭐ Tech-savvy chaos but make it relatable
        </Text>
      </View>

      {/* Profile Tabs */}
      <View style={styles.tabsContainer}>
        {(['chirps', 'replies', 'reactions'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {tab === 'chirps' ? 'Chirps' : tab === 'replies' ? 'Replies' : 'Reactions'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab Content */}
      <View style={styles.tabContent}>
        {activeTab === 'chirps' && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>💬</Text>
            <Text style={styles.emptyTitle}>No chirps yet</Text>
            <Text style={styles.emptySubtext}>Your chirps will appear here</Text>
          </View>
        )}
        
        {activeTab === 'replies' && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>↩️</Text>
            <Text style={styles.emptyTitle}>No replies yet</Text>
            <Text style={styles.emptySubtext}>Your replies will appear here</Text>
          </View>
        )}
        
        {activeTab === 'reactions' && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>❤️</Text>
            <Text style={styles.emptyTitle}>No reactions yet</Text>
            <Text style={styles.emptySubtext}>Posts you've reacted to will appear here</Text>
          </View>
        )}
      </View>

      {/* Stats Cards */}
      <View style={styles.statsCards}>
        <View style={styles.statsRow2}>
          <View style={styles.statCard}>
            <Text style={styles.statCardIcon}>📊</Text>
            <Text style={styles.statCardTitle}>Chirps Posted</Text>
            <Text style={styles.statCardValue}>5</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statCardIcon}>✨</Text>
            <Text style={styles.statCardTitle}>Weekly Vibe</Text>
            <Text style={styles.statCardSubtitle}>Tech-Savvy Chaos</Text>
          </View>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statCardIcon}>🏆</Text>
          <Text style={styles.statCardTitle}>Top Chirp</Text>
          <Text style={styles.statCardContent}>
            "I did not even get to chirp the first reply , Al stole this moment from me they are stealing our jobs 🤖"
          </Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statCardIcon}>🔥</Text>
          <Text style={styles.statCardTitle}>Top Reactions</Text>
          <View style={styles.reactionsRow}>
            <View style={styles.reactionItem}>
              <Text style={styles.reactionIcon}>🔥</Text>
              <Text style={styles.reactionCount}>1</Text>
            </View>
            <View style={styles.reactionItem}>
              <Text style={styles.reactionIcon}>👏</Text>
              <Text style={styles.reactionCount}>1</Text>
            </View>
            <View style={styles.reactionItem}>
              <Text style={styles.reactionIcon}>❤️</Text>
              <Text style={styles.reactionCount}>1</Text>
            </View>
          </View>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statCardIcon}>📈</Text>
          <Text style={styles.statCardTitle}>Common Words</Text>
          <View style={styles.tagsContainer}>
            <Text style={styles.tag}>chirp</Text>
            <Text style={styles.tag}>reply</Text>
            <Text style={styles.tag}>AI</Text>
            <Text style={styles.tag}>jobs</Text>
            <Text style={styles.tag}>notifications</Text>
            <Text style={styles.tag}>mention</Text>
            <Text style={styles.tag}>feature</Text>
            <Text style={styles.tag}>cool</Text>
          </View>
        </View>
      </View>

      {/* Feed Posted Notice */}
      <View style={styles.feedNotice}>
        <Text style={styles.checkmarkIcon}>✓</Text>
        <Text style={styles.feedNoticeText}>Weekly summary has been posted to your feed</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
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
    height: 200,
  },
  banner: {
    width: '100%',
    height: 200,
  },
  bannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(124, 58, 237, 0.1)',
  },
  avatarContainer: {
    position: 'absolute',
    bottom: -30,
    left: 16,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: '#ffffff',
  },
  actionButtons: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    flexDirection: 'row',
    gap: 12,
  },
  aiProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#7c3aed',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
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
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e1e8ed',
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
    paddingTop: 40,
    paddingBottom: 16,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  displayName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#14171a',
  },
  crownIcon: {
    fontSize: 16,
    marginLeft: 4,
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
    lineHeight: 20,
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
    padding: 16,
    backgroundColor: '#f8f4ff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e1e8ed',
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
});