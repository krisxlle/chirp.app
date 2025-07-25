import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import UserAvatar from '../../components/UserAvatar';

// Add immediate console log to verify file is being imported
console.log('🔥🔥🔥 [UserProfileScreen] FILE LOADED - Profile page component importing');
console.log('🔥🔥🔥 Current route in profile page:', typeof window !== 'undefined' ? window.location?.pathname : 'Server side');

interface User {
  id: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  custom_handle?: string;
  handle?: string;
  display_name?: string;
  bio?: string;
  profile_image_url?: string;
  banner_image_url?: string;
  is_chirp_plus?: boolean;
  show_chirp_plus_badge?: boolean;
}

export default function UserProfileScreen() {
  console.log('🔥🔥🔥 UserProfileScreen component MOUNTED!');
  console.log('🔥🔥🔥 Component file loaded at:', new Date().toISOString());
  
  const params = useLocalSearchParams();
  const userId = Array.isArray(params.userId) ? params.userId[0] : params.userId;
  
  console.log('🔥🔥🔥 Raw params from useLocalSearchParams:', params);
  console.log('🔥🔥🔥 Extracted userId:', userId);
  console.log('🔥🔥🔥 Params type:', typeof userId, 'value:', userId);
  
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [chirps, setChirps] = useState([]);
  const [stats, setStats] = useState({
    chirps: 0,
    following: 0,
    followers: 0
  });

  console.log('🔥🔥🔥 Profile screen initialized with userId:', userId);

  useEffect(() => {
    const fetchUserProfile = async () => {
      console.log('🔥🔥🔥 useEffect triggered! userId:', userId);
      
      if (!userId) {
        console.error('❌ No userId provided to useEffect');
        setLoading(false);
        return;
      }

      try {
        console.log('🔄 Fetching profile for userId:', userId);
        const { getUserById, getUserChirps, getUserStats } = await import('../../mobile-db');
        
        // Fetch user data
        const userData = await getUserById(userId);
        console.log('User data fetched:', userData);
        
        if (userData) {
          setUser(userData);
          
          // Fetch user's chirps and stats
          const [userChirps, userStats] = await Promise.all([
            getUserChirps(userId),
            getUserStats(userId)
          ]);
          
          setChirps(userChirps);
          setStats(userStats);
          console.log('Profile data loaded successfully');
        } else {
          console.error('User not found');
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        Alert.alert('Error', 'Failed to load user profile');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [userId]);

  const handleBack = () => {
    try {
      console.log('Navigating back from profile');
      router.back();
    } catch (error) {
      console.error('Back navigation error:', error);
      router.push('/');
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
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
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
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
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{displayName}</Text>
      </View>
      
      <ScrollView style={styles.content}>
        {/* Banner */}
        <View style={styles.bannerContainer}>
          <View style={styles.banner}>
            <View style={styles.bannerOverlay} />
          </View>
          
          {/* Profile Avatar positioned on left between banner and white space */}
          <View style={styles.avatarContainer}>
            <UserAvatar user={user} size="xl" />
          </View>
        </View>

        <View style={styles.profileCard}>
          
          <Text style={styles.displayName}>{displayName}</Text>
          <Text style={styles.handle}>@{user.custom_handle || user.handle || user.id}</Text>
          
          {user.is_chirp_plus && user.show_chirp_plus_badge && (
            <View style={styles.chirpPlusBadge}>
              <Text style={styles.chirpPlusBadgeText}>👑 Chirp+</Text>
            </View>
          )}
          
          {user.bio && (
            <Text style={styles.bio}>{user.bio}</Text>
          )}
          
          <View style={styles.stats}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.chirps}</Text>
              <Text style={styles.statLabel}>Chirps</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.following}</Text>
              <Text style={styles.statLabel}>Following</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.followers}</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </View>
          </View>
        </View>
        
        {/* Recent Chirps Section */}
        <View style={styles.chirpsSection}>
          <Text style={styles.sectionTitle}>Recent Chirps</Text>
          {chirps.length === 0 ? (
            <Text style={styles.noChirpsText}>No chirps yet</Text>
          ) : (
            chirps.slice(0, 3).map((chirp: any, index: number) => (
              <View key={index} style={styles.chirpPreview}>
                <Text style={styles.chirpContent}>{chirp.content}</Text>
                <Text style={styles.chirpDate}>{new Date(chirp.createdAt).toLocaleDateString()}</Text>
              </View>
            ))
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
  backButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  backButtonText: {
    color: '#7c3aed',
    fontSize: 16,
    fontWeight: '600',
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
    padding: 32,
  },
  errorText: {
    fontSize: 18,
    color: '#ef4444',
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#7c3aed',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  profileCard: {
    backgroundColor: '#ffffff',
    marginTop: 40,
    paddingHorizontal: 16,
    paddingTop: 40,
    paddingBottom: 16,
  },
  successBanner: {
    backgroundColor: '#10b981',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  successText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  bannerContainer: {
    position: 'relative',
    height: 100, // Reduced by 50% from 200px
  },
  banner: {
    width: '100%',
    height: 100, // Reduced by 50% from 200px
    backgroundColor: '#7c3aed',
  },
  bannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(124, 58, 237, 0.1)',
  },
  avatarContainer: {
    position: 'absolute',
    bottom: -40,
    left: 16,
    borderRadius: 44, // (80px avatar + 8px border) / 2 = 44px for perfect circle
    borderWidth: 4,
    borderColor: '#ffffff',
    width: 88, // 80px avatar + 8px border (4px each side)
    height: 88, // 80px avatar + 8px border (4px each side)
    alignItems: 'center',
    justifyContent: 'center',
  },
  displayName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 4,
  },
  handle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 12,
  },
  chirpPlusBadge: {
    backgroundColor: '#7c3aed',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: 'center',
    marginBottom: 12,
  },
  chirpPlusBadgeText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  bio: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  statLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  chirpsSection: {
    margin: 16,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  noChirpsText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  chirpPreview: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  chirpContent: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 8,
  },
  chirpDate: {
    fontSize: 12,
    color: '#6b7280',
  },
});