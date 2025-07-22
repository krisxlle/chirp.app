import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image, RefreshControl } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface User {
  id: string;
  username: string;
  displayName: string;
  bio: string;
  followersCount: number;
  followingCount: number;
  chirpsCount: number;
  avatar?: string;
}

interface Chirp {
  id: string;
  content: string;
  timestamp: string;
  likes: number;
  replies: number;
}

export default function ProfileScreen() {
  const [user, setUser] = useState<User | null>(null);
  const [userChirps, setUserChirps] = useState<Chirp[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      console.log('Fetching authentic user profile from database...');
      const { getUserFromDB } = require('../../mobile-db');
      const dbUser = await getUserFromDB();
      
      if (dbUser) {
        const authenticUser: User = {
          id: dbUser.id,
          username: dbUser.custom_handle || 'user',
          displayName: dbUser.display_name || 'Chirp User',
          bio: dbUser.bio || 'Welcome to Chirp! 🐤',
          followersCount: 0, // TODO: Add follower count from database
          followingCount: 0, // TODO: Add following count from database
          chirpsCount: 0, // TODO: Add chirp count from database
          avatar: dbUser.avatar_url,
        };
        console.log('Loaded authentic user profile:', authenticUser.username);
        setUser(authenticUser);
      } else {
        // Fallback only if no user found in database
        const fallbackUser: User = {
          id: '1',
          username: 'guest_user',
          displayName: 'Guest User',
          bio: 'Please sign in to see your profile',
          followersCount: 0,
          followingCount: 0,
          chirpsCount: 0,
        };
        setUser(fallbackUser);
      }
      
      const sampleChirps: Chirp[] = [
        {
          id: '1',
          content: 'Just discovered some amazing privacy features in this app! The anonymous connections are game-changing.',
          timestamp: '2 hours ago',
          likes: 12,
          replies: 3,
        },
        {
          id: '2',
          content: 'Privacy-first social media is the future. Finally, a platform that respects user anonymity! 🚀',
          timestamp: '1 day ago',
          likes: 24,
          replies: 7,
        },
        {
          id: '3',
          content: 'The intelligent content recommendations here are incredible. AI-powered but privacy-preserving.',
          timestamp: '2 days ago',
          likes: 18,
          replies: 5,
        },
      ];

      setUser(sampleUser);
      setUserChirps(sampleChirps);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProfile();
    setRefreshing(false);
  };

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
        <Text style={styles.errorText}>Failed to load profile</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <View style={styles.profileInfo}>
          <View style={styles.avatar}>
            {user.avatar ? (
              <Image source={{ uri: user.avatar }} style={styles.avatarImage} />
            ) : (
              <MaterialIcons name="person" size={40} color="#9ca3af" />
            )}
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.displayName}>{user.displayName}</Text>
            <Text style={styles.username}>@{user.username}</Text>
          </View>
        </View>
        
        <TouchableOpacity style={styles.editButton}>
          <MaterialIcons name="edit" size={20} color="#9333ea" />
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Bio */}
      <View style={styles.bioSection}>
        <Text style={styles.bioText}>{user.bio}</Text>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{user.chirpsCount}</Text>
          <Text style={styles.statLabel}>Chirps</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{user.followersCount}</Text>
          <Text style={styles.statLabel}>Followers</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{user.followingCount}</Text>
          <Text style={styles.statLabel}>Following</Text>
        </View>
      </View>

      {/* Chirps */}
      <View style={styles.chirpsSection}>
        <Text style={styles.sectionTitle}>Your Chirps</Text>
        {userChirps.map((chirp) => (
          <View key={chirp.id} style={styles.chirpCard}>
            <Text style={styles.chirpContent}>{chirp.content}</Text>
            <View style={styles.chirpFooter}>
              <Text style={styles.chirpTimestamp}>{chirp.timestamp}</Text>
              <View style={styles.chirpActions}>
                <View style={styles.actionItem}>
                  <MaterialIcons name="favorite-border" size={16} color="#9ca3af" />
                  <Text style={styles.actionCount}>{chirp.likes}</Text>
                </View>
                <View style={styles.actionItem}>
                  <MaterialIcons name="chat-bubble-outline" size={16} color="#9ca3af" />
                  <Text style={styles.actionCount}>{chirp.replies}</Text>
                </View>
              </View>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
  },
  profileHeader: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  userInfo: {
    flex: 1,
  },
  displayName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  username: {
    fontSize: 16,
    color: '#6b7280',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#9333ea',
    alignSelf: 'flex-start',
  },
  editButtonText: {
    color: '#9333ea',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  bioSection: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  bioText: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 22,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
  },
  statLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  chirpsSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  chirpCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  chirpContent: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 22,
    marginBottom: 12,
  },
  chirpFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chirpTimestamp: {
    fontSize: 14,
    color: '#9ca3af',
  },
  chirpActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
  },
  actionCount: {
    fontSize: 14,
    color: '#9ca3af',
    marginLeft: 4,
  },
});