import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, ImageBackground } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import UserAvatar from '../../components/UserAvatar';
import ChirpCard from '../../components/ChirpCard';

interface User {
  id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  customHandle?: string;
  handle?: string;
  bio?: string;
  profileImageUrl?: string;
  bannerImageUrl?: string;
  joinedAt?: string;
}

interface ProfileStats {
  following: number;
  followers: number;
  chirps: number;
  reactions: number;
}

export default function UserProfileScreen() {
  const { userId } = useLocalSearchParams();
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'chirps' | 'replies' | 'reactions'>('chirps');
  const [userChirps, setUserChirps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<ProfileStats>({
    following: 0,
    followers: 0,
    chirps: 0,
    reactions: 0
  });

  useEffect(() => {
    fetchUserProfile();
    fetchUserChirps();
  }, [userId]);

  const fetchUserProfile = async () => {
    try {
      // In a real app, this would fetch the user data from your backend
      setUser({
        id: userId as string,
        firstName: 'User',
        lastName: 'Name',
        email: 'user@example.com',
        customHandle: '@user',
        bio: 'This is a sample user profile',
        joinedAt: '3 days ago',
      });
      
      setStats({
        following: 42,
        followers: 128,
        chirps: 15,
        reactions: 89
      });
    } catch (error) {
      console.error('Error fetching user profile:', error);
      Alert.alert('Error', 'Failed to load user profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserChirps = async () => {
    try {
      // Mock chirps for now
      setUserChirps([]);
    } catch (error) {
      console.error('Error fetching user chirps:', error);
    }
  };

  const displayName = user?.customHandle || 
                     user?.handle ||
                     (user?.firstName && user?.lastName 
                       ? `${user.firstName} ${user.lastName}`
                       : user?.email?.split('@')[0] || 'Anonymous User');

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>User not found</Text>
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
          <Text style={styles.headerTitle}>{displayName}</Text>
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
        
        {/* Follow Button */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.followButton}>
            <Text style={styles.followButtonText}>Follow</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* User Info */}
      <View style={styles.userInfo}>
        <View style={styles.nameRow}>
          <Text style={styles.displayName}>{displayName}</Text>
        </View>
        <Text style={styles.handle}>{user.customHandle || user.handle}</Text>
        <Text style={styles.bio}>
          {user.bio && user.bio.split(/(@\w+)/).map((part, index) => {
            if (part.startsWith('@')) {
              return (
                <Text key={index} style={styles.mentionText}>{part}</Text>
              );
            }
            return <Text key={index}>{part}</Text>;
          })}
        </Text>
        
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
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'reactions' && styles.activeTab]}
          onPress={() => setActiveTab('reactions')}
        >
          <Text style={[styles.tabText, activeTab === 'reactions' && styles.activeTabText]}>
            Reactions
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {activeTab === 'chirps' && (
          <View>
            {userChirps.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No chirps yet</Text>
              </View>
            ) : (
              userChirps.map((chirp) => (
                <ChirpCard key={chirp.id} chirp={chirp} />
              ))
            )}
          </View>
        )}
        
        {activeTab === 'replies' && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No replies yet</Text>
          </View>
        )}
        
        {activeTab === 'reactions' && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No reactions yet</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    fontSize: 16,
    color: '#657786',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  errorText: {
    fontSize: 16,
    color: '#e0245e',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e8ed',
  },
  backButton: {
    marginRight: 16,
    padding: 8,
  },
  backIcon: {
    fontSize: 20,
    color: '#7c3aed',
    fontWeight: 'bold',
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
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  avatarContainer: {
    position: 'absolute',
    bottom: -40,
    left: 16,
  },
  actionButtons: {
    position: 'absolute',
    bottom: 16,
    right: 16,
  },
  followButton: {
    backgroundColor: '#7c3aed',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  followButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },
  userInfo: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingTop: 50,
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
  handle: {
    fontSize: 15,
    color: '#657786',
    marginTop: 2,
  },
  bio: {
    fontSize: 15,
    color: '#14171a',
    lineHeight: 20,
    marginTop: 12,
  },
  mentionText: {
    color: '#7c3aed',
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
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e8ed',
  },
  statItem: {
    marginRight: 20,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#14171a',
  },
  statLabel: {
    fontSize: 13,
    color: '#657786',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e8ed',
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
    fontSize: 15,
    fontWeight: '500',
    color: '#657786',
  },
  activeTabText: {
    color: '#7c3aed',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  emptyState: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 15,
    color: '#657786',
  },
});