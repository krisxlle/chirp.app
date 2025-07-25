import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView,
  Modal,
  Alert,
  ActivityIndicator
} from 'react-native';
import UserAvatar from './UserAvatar';
// Note: Removed ChirpCard import to avoid circular dependency

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
  isChirpPlus?: boolean;
  showChirpPlusBadge?: boolean;
}

interface UserProfileModalProps {
  visible: boolean;
  onClose: () => void;
  userId: string | null;
}

export default function UserProfileModal({ visible, onClose, userId }: UserProfileModalProps) {
  const [user, setUser] = useState<User | null>(null);
  const [userChirps, setUserChirps] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    following: 0,
    followers: 0,
    chirps: 0,
    reactions: 0
  });

  const fetchUserProfile = async (id: string) => {
    try {
      setLoading(true);
      
      // Import database functions
      const { getUserById, getChirpsByUserId } = await import('../mobile-db');
      
      // Fetch user data
      const userData = await getUserById(id);
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
          joinedAt: (userData as any).joined_at,
          isChirpPlus: (userData as any).is_chirp_plus,
          showChirpPlusBadge: (userData as any).show_chirp_plus_badge
        });

        // Fetch user's chirps
        const chirps = await getChirpsByUserId(id);
        setUserChirps(chirps || []);
        
        // Set basic stats (these would come from real queries in a full implementation)
        setStats({
          following: 1,
          followers: 1,
          chirps: chirps?.length || 0,
          reactions: Math.floor(Math.random() * 50) + 1
        });
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      Alert.alert('Error', 'Failed to load user profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible && userId) {
      fetchUserProfile(userId);
    }
  }, [visible, userId]);

  const displayName = user?.firstName && user?.lastName 
    ? `${user.firstName} ${user.lastName}`
    : (user?.customHandle || user?.handle || user?.email?.split('@')[0] || 'User');

  const handleText = user?.customHandle || user?.handle || user?.id;

  return (
    <Modal
      visible={visible}
      animationType="none"
      presentationStyle="pageSheet"
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
          <View style={styles.headerSpacer} />
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#7c3aed" />
            <Text style={styles.loadingText}>Loading profile...</Text>
          </View>
        ) : user ? (
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
                userChirps.slice(0, 5).map((chirp) => (
                  <View key={chirp.id} style={styles.simpleChirp}>
                    <Text style={styles.chirpContent}>{chirp.content}</Text>
                    <Text style={styles.chirpDate}>
                      {new Date(chirp.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                ))
              ) : (
                <Text style={styles.noChirps}>No chirps yet</Text>
              )}
            </View>
          </ScrollView>
        ) : (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>User not found</Text>
          </View>
        )}
      </View>
    </Modal>
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingTop: 50,
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 18,
    color: '#6b7280',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  headerSpacer: {
    width: 34,
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
  scrollView: {
    flex: 1,
  },
  profileHeader: {
    padding: 16,
    alignItems: 'center',
  },
  profileInfo: {
    alignItems: 'center',
    marginTop: 12,
  },
  displayName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  handle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 8,
  },
  bio: {
    fontSize: 14,
    color: '#374151',
    textAlign: 'center',
    marginBottom: 8,
  },
  chirpPlusBadge: {
    backgroundColor: '#7c3aed',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e5e7eb',
    marginHorizontal: 16,
  },
  stat: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  chirpsSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  noChirps: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#6b7280',
  },
  simpleChirp: {
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#7c3aed',
  },
  chirpContent: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 4,
  },
  chirpDate: {
    fontSize: 12,
    color: '#6b7280',
  },
});