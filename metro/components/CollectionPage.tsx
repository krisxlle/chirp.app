import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, Platform, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { getUserCollection } from '../lib/database/mobile-db-supabase';
import AnalyticsPage from './AnalyticsPage';
import { useAuth } from './AuthContext';
import AnalyticsIcon from './icons/AnalyticsIcon';
import ProfileFrame from './ProfileFrame';

interface ProfileCard {
  id: string;
  name: string;
  handle: string;
  rarity: 'mythic' | 'legendary' | 'epic' | 'rare' | 'uncommon' | 'common';
  imageUrl?: string | any; // Support both string URLs and require() objects
  bio: string;
  followers: number;
  profilePower: number;
  quantity: number; // Number of copies owned
  obtainedAt?: string;
  userId?: string; // The actual user ID for navigation
}


const rarityColors = {
  mythic: '#ff6b6b',
  legendary: '#f59e0b',
  epic: '#8b5cf6',
  rare: '#3b82f6',
  uncommon: '#10b981',
  common: '#6b7280',
};

const rarityNames = {
  mythic: 'Mythic',
  legendary: 'Legendary',
  epic: 'Epic',
  rare: 'Rare',
  uncommon: 'Uncommon',
  common: 'Common',
};

export default function CollectionPage() {
  const { user } = useAuth();
  const [collection, setCollection] = useState<ProfileCard[]>([]);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Load user's collection from database
  useEffect(() => {
    loadUserCollection();
  }, []);

  const loadUserCollection = async () => {
    try {
      setIsLoading(true);
      if (user?.id) {
        console.log('🎮 Loading collection for user:', user.id);
        const userCollection = await getUserCollection(user.id);
        console.log('🎮 Raw collection data:', userCollection);
        console.log('🎮 Collection length:', userCollection.length);
        
        // Log each profile's data structure
        userCollection.forEach((profile, index) => {
          console.log(`🎮 Profile ${index}:`, {
            id: profile.id,
            userId: profile.userId,
            name: profile.name,
            handle: profile.handle
          });
        });
        
        setCollection(userCollection);
        console.log('🎮 CollectionPage loaded user collection:', userCollection.length, 'items');
      } else {
        setCollection([]);
        console.log('🎮 CollectionPage no user ID, starting with empty collection');
      }
    } catch (error) {
      console.error('❌ Error loading user collection:', error);
      setCollection([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      if (user?.id) {
        const userCollection = await getUserCollection(user.id);
        setCollection(userCollection);
        console.log('🔄 CollectionPage refreshed user collection:', userCollection.length, 'items');
      }
    } catch (error) {
      console.error('❌ Error refreshing user collection:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  if (showAnalytics) {
    return <AnalyticsPage onClose={() => setShowAnalytics(false)} />;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>My Collection</Text>
          <Text style={styles.headerSubtitle}>Your collected profile cards</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={handleRefresh}
            disabled={isRefreshing}
          >
            <Text style={styles.refreshButtonText}>🔄</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.analyticsIconButton}
            onPress={() => setShowAnalytics(true)}
          >
            <AnalyticsIcon size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor="#C671FF"
            colors={["#C671FF", "#FF61A6"]}
          />
        }
      >

        {/* Collection Display */}
        <View style={styles.collectionSection}>
          <Text style={styles.sectionTitle}>Your Collection ({collection.length})</Text>
          {isLoading ? (
            <View style={styles.emptyCollection}>
              <Text style={styles.emptyText}>Loading your collection...</Text>
            </View>
          ) : collection.length === 0 ? (
            <View style={styles.emptyCollection}>
              <Text style={styles.emptyText}>No profile cards collected yet</Text>
              <Text style={styles.emptySubtext}>Open some capsules to get started!</Text>
            </View>
          ) : (
            <View style={styles.profileGrid}>
              {collection.map((profile) => (
                <TouchableOpacity 
                  key={profile.id} 
                  style={styles.profileCard}
                  onPress={() => {
                    console.log('🔍 Profile card clicked - Full profile object:', JSON.stringify(profile, null, 2));
                    console.log('🔍 Profile card clicked - Specific fields:', {
                      profileId: profile.id,
                      userId: profile.userId,
                      name: profile.name,
                      handle: profile.handle,
                      userIdType: typeof profile.userId,
                      userIdExists: profile.userId !== undefined
                    });
                    
                    // Try to navigate even if userId is undefined to see what happens
                    if (profile.userId) {
                      console.log('✅ Using profile.userId for navigation');
                      router.push(`/profile/${profile.userId}`);
                    } else {
                      console.log('⚠️ profile.userId is undefined, trying fallback...');
                      // Try using the profile.id as a fallback (it might be the user ID)
                      console.log('⚠️ Attempting navigation with profile.id as fallback');
                      router.push(`/profile/${profile.id}`);
                    }
                  }}
                  activeOpacity={0.8}
                >
                  <View style={[styles.rarityBadge, { backgroundColor: rarityColors[profile.rarity] }]}>
                    <Text style={styles.rarityText}>{rarityNames[profile.rarity]}</Text>
                  </View>
                  
                  <ProfileFrame rarity={profile.rarity} size={60}>
                    {profile.imageUrl ? (
                      <Image 
                        source={typeof profile.imageUrl === 'string' ? { uri: profile.imageUrl } : profile.imageUrl} 
                        style={styles.profileImage} 
                      />
                    ) : (
                      <View style={[styles.profileImagePlaceholder, { backgroundColor: rarityColors[profile.rarity] }]}>
                        <Text style={styles.profileImageText}>{profile.name.charAt(0)}</Text>
                      </View>
                    )}
                  </ProfileFrame>
                  
                  <Text style={styles.profileName}>{profile.name}</Text>
                  <Text style={styles.profileHandle}>{profile.handle}</Text>
                  <Text style={styles.profileBio}>{profile.bio}</Text>
                  
                  <View style={styles.profileStats}>
                    <View style={styles.statItem}>
                      <Text style={styles.statValue}>{(profile.followers || 0).toLocaleString()}</Text>
                      <Text style={styles.statLabel}>Followers</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={styles.statValue}>{profile.profilePower || 0}</Text>
                      <Text style={styles.statLabel}>Power</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={[styles.statValue, { color: rarityColors[profile.rarity] }]}>
                        {profile.quantity || 1}x
                      </Text>
                      <Text style={styles.statLabel}>Owned</Text>
                    </View>
                  </View>
                  
                  {profile.obtainedAt && (
                    <Text style={styles.obtainedDate}>
                      Opened: {new Date(profile.obtainedAt).toLocaleDateString()}
                    </Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
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
    paddingTop: 80,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#C671FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  refreshButtonText: {
    fontSize: 18,
    color: '#ffffff',
  },
  analyticsIconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#7c3aed',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 16,
  },
  content: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  collectionSection: {
    padding: 20,
    maxWidth: Platform.OS === 'web' ? 1600 : undefined, // Increased from 1200 to 1600 for larger cards
    alignSelf: 'center', // Center the collection section on web
  },
  emptyCollection: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#6b7280',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
  },
  profileGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  profileCard: {
    width: Platform.OS === 'web' ? 400 : '48%', // Fixed width on web, percentage on mobile
    backgroundColor: Platform.OS === 'web' ? '#f3e8ff' : '#f9fafb', // Light lilac purple on web
    borderRadius: 12,
    padding: Platform.OS === 'web' ? 20 : 12, // More padding on web for better spacing
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center', // Center content within the card
  },
  rarityBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    zIndex: 1,
  },
  rarityText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
  },
  profileImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignSelf: 'center',
    marginBottom: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileImageText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  profileName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 2,
  },
  profileHandle: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 6,
  },
  profileBio: {
    fontSize: 11,
    color: '#374151',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 14,
  },
  profileStats: {
    flexDirection: 'row',
    justifyContent: 'space-around', // Changed from space-between to space-around for better spacing
    marginBottom: 6,
    paddingHorizontal: Platform.OS === 'web' ? 10 : 0, // Add horizontal padding on web
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
    minWidth: Platform.OS === 'web' ? 60 : 40, // Ensure minimum width to prevent overlap
  },
  statValue: {
    fontSize: Platform.OS === 'web' ? 14 : 12, // Larger font on web
    fontWeight: 'bold',
    color: '#1f2937',
  },
  statLabel: {
    fontSize: Platform.OS === 'web' ? 12 : 10, // Larger font on web
    color: '#6b7280',
  },
  obtainedDate: {
    fontSize: 10,
    color: '#9ca3af',
    textAlign: 'center',
  },
});
