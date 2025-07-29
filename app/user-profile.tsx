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
import { useRouter, useLocalSearchParams } from 'expo-router';
import { getUserById } from '../mobile-db';
import UserAvatar from '../components/UserAvatar';

export default function UserProfile() {
  console.log('🔥 USER PROFILE PAGE LOADED SUCCESSFULLY!');
  
  const router = useRouter();
  const { userId } = useLocalSearchParams();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      console.log('🔍 Loading user profile for ID:', userId);
      try {
        if (userId) {
          const userData = await getUserById(userId as string);
          console.log('👤 User data loaded:', userData);
          setUser(userData);
        }
      } catch (error) {
        console.error('❌ Error loading user:', error);
        Alert.alert('Error', 'Failed to load user profile');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [userId]);

  if (loading) {
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

  const displayName = user.first_name && user.last_name 
    ? `${user.first_name} ${user.last_name}`.trim()
    : (user.customHandle || user.handle || user.email?.split('@')[0] || 'User');

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
        <View style={styles.profileSection}>
          <UserAvatar 
            user={user} 
            size="xl"
          />
          <Text style={styles.userName}>{displayName}</Text>
          <Text style={styles.userHandle}>@{user.customHandle || user.handle || user.id}</Text>
          
          {user.bio && (
            <Text style={styles.userBio}>
              {user.bio.split(/(@\w+)/).map((part, index) => {
                if (part.startsWith('@')) {
                  return (
                    <TouchableOpacity 
                      key={index} 
                      onPress={async () => {
                        try {
                          const { getUserByHandle } = await import('../mobile-db');
                          const mentionedUser = await getUserByHandle(part);
                          if (mentionedUser) {
                            const { router } = await import('expo-router');
                            router.push(`/view-profile?userId=${mentionedUser.id}`);
                          } else {
                            Alert.alert('User Not Found', `User ${part} could not be found.`);
                          }
                        } catch (error) {
                          console.error('Error navigating to mentioned user:', error);
                          Alert.alert('Error', 'Failed to navigate to user profile.');
                        }
                      }}
                    >
                      <Text style={styles.mentionTextStyle}>{part}</Text>
                    </TouchableOpacity>
                  );
                }
                return <Text key={index}>{part}</Text>;
              })}
            </Text>
          )}
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Chirps</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Following</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    overflow: 'visible', // Prevent content clipping
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
  scrollView: {
    flex: 1,
  },
  profileSection: {
    alignItems: 'center',
    padding: 20,
    paddingTop: 40, // Extra padding at top to ensure avatar is visible
    minHeight: 200, // Ensure minimum height for avatar visibility
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 12,
  },
  userHandle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 12,
  },
  userBio: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingVertical: 20,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#6b7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: '#ef4444',
    marginBottom: 20,
  },
  mentionTextStyle: {
    color: '#7c3aed',
    fontWeight: '600',
  },
});