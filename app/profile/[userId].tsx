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
  // Chirp+ subscription fields
  isChirpPlus?: boolean;
  chirpPlusExpiresAt?: string;
  showChirpPlusBadge?: boolean;
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

  console.log('UserProfileScreen mounted with userId:', userId);
  console.log('Type of userId:', typeof userId);

  useEffect(() => {
    fetchUserProfile();
    fetchUserChirps();
  }, [userId]);

  const fetchUserProfile = async () => {
    try {
      console.log('Fetching profile for user ID:', userId);
      
      // Get user data from database
      const { sql } = await import('../../mobile-db');
      const users = await sql`
        SELECT 
          id::text,
          email,
          first_name,
          last_name,
          custom_handle,
          handle,
          COALESCE(first_name || ' ' || last_name, custom_handle, handle) as display_name,
          bio,
          profile_image_url,
          banner_image_url,
          is_chirp_plus,
          chirp_plus_expires_at,
          show_chirp_plus_badge,
          created_at
        FROM users 
        WHERE id = ${userId}
        LIMIT 1
      `;
      
      if (users.length === 0) {
        Alert.alert('Error', 'User not found');
        setLoading(false);
        return;
      }
      
      const dbUser = users[0];
      
      // Get user stats from database
      const [chirpsCount, followersCount, followingCount] = await Promise.all([
        sql`SELECT COUNT(*) as count FROM chirps WHERE author_id = ${userId}`,
        sql`SELECT COUNT(*) as count FROM follows WHERE followed_id = ${userId}`,
        sql`SELECT COUNT(*) as count FROM follows WHERE follower_id = ${userId}`
      ]);
      
      setUser({
        id: dbUser.id,
        firstName: dbUser.first_name,
        lastName: dbUser.last_name,
        email: dbUser.email || '',
        customHandle: dbUser.custom_handle,
        handle: dbUser.handle,
        bio: dbUser.bio,
        profileImageUrl: dbUser.profile_image_url,
        bannerImageUrl: dbUser.banner_image_url,
        joinedAt: dbUser.created_at ? new Date(dbUser.created_at).toLocaleDateString() : 'Recently',
        isChirpPlus: dbUser.is_chirp_plus,
        chirpPlusExpiresAt: dbUser.chirp_plus_expires_at,
        showChirpPlusBadge: dbUser.show_chirp_plus_badge
      });
      
      setStats({
        following: parseInt(followingCount[0]?.count || '0'),
        followers: parseInt(followersCount[0]?.count || '0'),
        chirps: parseInt(chirpsCount[0]?.count || '0'),
        reactions: 0 // Will be calculated separately if needed
      });
      
      console.log('Successfully loaded user profile:', dbUser.custom_handle || dbUser.handle);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      Alert.alert('Error', 'Failed to load user profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserChirps = async () => {
    try {
      console.log('Fetching chirps for user ID:', userId);
      
      const { sql } = await import('../../mobile-db');
      const chirps = await sql`
        SELECT 
          c.id::text,
          c.content,
          c.created_at as "createdAt",
          c.is_weekly_summary,
          c.author_id,
          c.reply_to_id,
          u.custom_handle,
          u.handle,
          u.first_name,
          u.last_name,
          u.profile_image_url,
          u.is_chirp_plus,
          u.show_chirp_plus_badge,
          (SELECT COUNT(*) FROM chirps WHERE reply_to_id = c.id) as reply_count,
          (SELECT COUNT(*) FROM reactions WHERE chirp_id = c.id) as reaction_count,
          COALESCE(
            ARRAY_AGG(
              DISTINCT jsonb_build_object(
                'emoji', r.emoji,
                'count', (SELECT COUNT(*) FROM reactions r2 WHERE r2.chirp_id = c.id AND r2.emoji = r.emoji)
              )
            ) FILTER (WHERE r.emoji IS NOT NULL),
            ARRAY[]::jsonb[]
          ) as reactions
        FROM chirps c
        JOIN users u ON c.author_id = u.id
        LEFT JOIN reactions r ON c.id = r.chirp_id
        WHERE c.author_id = ${userId} 
          AND c.reply_to_id IS NULL
        GROUP BY c.id, c.content, c.created_at, c.is_weekly_summary, c.author_id, c.reply_to_id,
                 u.custom_handle, u.handle, u.first_name, u.last_name, u.profile_image_url, u.is_chirp_plus, u.show_chirp_plus_badge
        ORDER BY c.created_at DESC
        LIMIT 20
      `;
      
      const formattedChirps = chirps.map(chirp => ({
        id: chirp.id,
        content: chirp.content,
        createdAt: chirp.createdAt,
        isWeeklySummary: chirp.is_weekly_summary,
        author: {
          id: chirp.author_id,
          firstName: chirp.first_name,
          lastName: chirp.last_name,
          email: `${chirp.custom_handle || chirp.handle}@chirp.com`,
          handle: chirp.handle,
          customHandle: chirp.custom_handle,
          profileImageUrl: chirp.profile_image_url,
          isChirpPlus: chirp.is_chirp_plus,
          showChirpPlusBadge: chirp.show_chirp_plus_badge
        },
        replyCount: parseInt(chirp.reply_count),
        reactionCount: parseInt(chirp.reaction_count),
        reactions: chirp.reactions || []
      }));
      
      setUserChirps(formattedChirps);
      console.log(`Successfully loaded ${formattedChirps.length} chirps for user`);
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
        <TouchableOpacity style={styles.backButton} onPress={() => {
          if (typeof window !== 'undefined' && window.history.length > 1) {
            window.history.back();
          } else {
            // Fallback navigation
            Alert.alert('Navigate', 'Go back to previous screen');
          }
        }}>
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
          {user.isChirpPlus && user.showChirpPlusBadge && (
            <Text style={styles.crownIcon}>👑</Text>
          )}
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
  crownIcon: {
    fontSize: 16,
    marginLeft: 8,
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