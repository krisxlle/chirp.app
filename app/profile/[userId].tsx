import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import UserAvatar from '../../components/UserAvatar';

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
  isChirpPlus?: boolean;
  showChirpPlusBadge?: boolean;
}

export default function UserProfileScreen() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [userChirps, setUserChirps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    following: 0,
    followers: 0,
    chirps: 0,
    reactions: 0
  });

  console.log('🔥 UserProfileScreen component loaded! UserId:', userId);
  console.log('🔥 All search params:', useLocalSearchParams());
  console.log('🔥 UserProfileScreen mounted at:', new Date().toISOString());

  const fetchUserProfile = async (id: string) => {
    try {
      setLoading(true);
      console.log('Fetching profile for user ID:', id);
      
      // Import database functions
      const { getUserById, getChirpsByUserId } = await import('../../mobile-db');
      
      // Fetch user data
      const userData = await getUserById(id);
      console.log('User data received:', userData);
      
      if (userData) {
        setUser({
          id: userData.id,
          firstName: (userData as any).first_name,
          lastName: (userData as any).last_name,
          email: (userData as any).email,
          customHandle: (userData as any).custom_handle,
          handle: (userData as any).handle,
          profileImageUrl: (userData as any).profile_image_url,
          avatarUrl: (userData as any).profile_image_url,
          bannerImageUrl: (userData as any).banner_image_url,
          bio: (userData as any).bio,
          isChirpPlus: (userData as any).is_chirp_plus,
          showChirpPlusBadge: (userData as any).show_chirp_plus_badge
        });

        // Fetch user's chirps
        const chirps = await getChirpsByUserId(id);
        console.log('User chirps received:', chirps?.length || 0);
        setUserChirps(chirps || []);
        
        // Set basic stats
        setStats({
          following: 1,
          followers: 1,
          chirps: chirps?.length || 0,
          reactions: Math.floor(Math.random() * 50) + 1
        });
      } else {
        console.log('No user data found for ID:', id);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      Alert.alert('Error', 'Failed to load user profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      console.log('UserProfileScreen useEffect triggered with userId:', userId);
      fetchUserProfile(userId);
    } else {
      console.log('No userId provided to UserProfileScreen');
      setLoading(false);
    }
  }, [userId]);

  const displayName = user?.firstName && user?.lastName 
    ? `${user.firstName} ${user.lastName}`
    : (user?.customHandle || user?.handle || user?.email?.split('@')[0] || 'User');

  const handleText = user?.customHandle || user?.handle || user?.id;

  if (loading) {
    console.log('🔥 Profile loading state - showing spinner');
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
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
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>User not found</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{displayName}</Text>
      </View>
      
      <ScrollView style={styles.scrollView}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <UserAvatar user={user} size="xl" />
          <View style={styles.profileInfo}>
            <Text style={styles.displayName}>{displayName}</Text>
            <Text style={styles.handle}>@{handleText}</Text>
            {user.bio && <Text style={styles.bio}>{user.bio}</Text>}
            {user.isChirpPlus && user.showChirpPlusBadge && (
              <View style={styles.chirpPlusBadge}>
                <Text style={styles.badgeText}>Chirp+</Text>
              </View>
            )}
          </View>
        </View>

        {/* Stats */}
        <View style={styles.stats}>
          <View style={styles.stat}>
            <Text style={styles.statNumber}>{stats.chirps}</Text>
            <Text style={styles.statLabel}>Chirps</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statNumber}>{stats.followers}</Text>
            <Text style={styles.statLabel}>Followers</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statNumber}>{stats.following}</Text>
            <Text style={styles.statLabel}>Following</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statNumber}>{stats.reactions}</Text>
            <Text style={styles.statLabel}>Reactions</Text>
          </View>
        </View>

        {/* User's Chirps */}
        <View style={styles.chirpsSection}>
          <Text style={styles.sectionTitle}>Recent Chirps</Text>
          {userChirps.length > 0 ? (
            userChirps.slice(0, 10).map((chirp) => (
              <View key={chirp.id} style={styles.simpleChirp}>
                <Text style={styles.chirpContent}>{chirp.content}</Text>
                <View style={styles.chirpFooter}>
                  <Text style={styles.chirpDate}>
                    {new Date(chirp.createdAt).toLocaleDateString()}
                  </Text>
                  <View style={styles.chirpStats}>
                    <Text style={styles.chirpStat}>
                      {chirp.reactionCount} reactions
                    </Text>
                    <Text style={styles.chirpStat}>
                      {chirp.replyCount} replies
                    </Text>
                  </View>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.noChirps}>No chirps yet</Text>
          )}
        </View>
      </ScrollView>
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
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginLeft: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 20,
  },
  backButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  backButtonText: {
    color: '#7c3aed',
    fontSize: 16,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  profileHeader: {
    padding: 20,
    alignItems: 'center',
  },
  profileInfo: {
    alignItems: 'center',
    marginTop: 16,
  },
  displayName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  handle: {
    fontSize: 18,
    color: '#6b7280',
    marginBottom: 12,
  },
  bio: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  chirpPlusBadge: {
    backgroundColor: '#7c3aed',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e5e7eb',
    marginHorizontal: 20,
  },
  stat: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
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
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  simpleChirp: {
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#7c3aed',
  },
  chirpContent: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 8,
    lineHeight: 22,
  },
  chirpFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chirpDate: {
    fontSize: 12,
    color: '#6b7280',
  },
  chirpStats: {
    flexDirection: 'row',
    gap: 12,
  },
  chirpStat: {
    fontSize: 12,
    color: '#6b7280',
  },
  noChirps: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 40,
    fontStyle: 'italic',
  },
});