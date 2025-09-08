import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import UserAvatar from '../components/UserAvatar';
import { getUserById } from '../lib/database/mobile-db-supabase';

export default function ViewProfile() {
  console.log('🎯🎯🎯 VIEW PROFILE COMPONENT SUCCESSFULLY LOADED! 🎯🎯🎯');
  
  const router = useRouter();
  const params = useLocalSearchParams();
  const userId = params.userId || params.id;
  
  console.log('📋 Received params:', params);
  console.log('🆔 Using userId:', userId);
  
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserProfile = async () => {
      console.log('🔄 Starting profile load for user:', userId);
      
      if (!userId) {
        console.log('❌ No userId found in params');
        setLoading(false);
        return;
      }

      try {
        console.log('📞 Calling getUserById...');
        const userData = await getUserById(userId as string);
        console.log('✅ Profile data loaded:', userData);
        setUser(userData);
      } catch (error) {
        console.error('💥 Profile load error:', error);
        Alert.alert('Error', 'Could not load profile');
      } finally {
        setLoading(false);
        console.log('✅ Profile loading completed');
      }
    };

    loadUserProfile();
  }, [userId]);

  const handleBack = () => {
    console.log('🔙 Navigating back');
    router.back();
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
        <View style={styles.centered}>
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
        <View style={styles.centered}>
          <Text style={styles.errorText}>Profile not found</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleBack}>
            <Text style={styles.retryButtonText}>Go Back</Text>
          </TouchableOpacity>
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
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{displayName}</Text>
      </View>
      
      <ScrollView style={styles.content}>
        <View style={styles.profileCard}>
          <View style={styles.successBanner}>
            <Text style={styles.successText}>🎉 PROFILE NAVIGATION WORKING! 🎉</Text>
          </View>
          
          <View style={styles.avatarContainer}>
            <UserAvatar user={user} size="xl" />
          </View>
          
          <View style={styles.nameContainer}>
            <Text style={styles.displayName}>{displayName}</Text>
          </View>
          <Text style={styles.handle}>@{user.customHandle || user.handle || user.id}</Text>
          
          {user.bio && (
            <Text style={styles.bio}>
              {user.bio.split(/(@\w+)/).map((part, index) => {
                if (part.startsWith('@')) {
                  return (
                    <TouchableOpacity 
                      key={index} 
                      onPress={async () => {
                        try {
                          const { getUserByHandle } = await import('../lib/database/mobile-db-supabase');
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
                      <Text style={styles.mentionText}>{part}</Text>
                    </TouchableOpacity>
                  );
                }
                return <Text key={index}>{part}</Text>;
              })}
            </Text>
          )}
          
          <View style={styles.stats}>
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
    backgroundColor: '#fafafa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
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
  content: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
  },
  errorText: {
    fontSize: 18,
    color: '#ef4444',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#7c3aed',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  profileCard: {
    backgroundColor: '#ffffff',
    margin: 16,
    borderRadius: 16,
    padding: 20,
    paddingTop: 30, // Extra top padding for avatar space
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'visible', // Ensure content doesn't get clipped
  },
  successBanner: {
    backgroundColor: '#dcfce7',
    borderColor: '#16a34a',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  successText: {
    color: '#15803d',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 10, // Add vertical padding to prevent clipping
    minHeight: 100, // Ensure container has enough height
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
    marginBottom: 16,
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
    paddingTop: 20,
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
  mentionText: {
    color: '#7c3aed',
    fontWeight: '600',
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
});