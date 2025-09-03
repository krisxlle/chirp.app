import React, { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AnalyticsPage from './AnalyticsPage';
import { useAuth } from './AuthContext';

interface ProfileCard {
  id: string;
  name: string;
  handle: string;
  rarity: 'mythic' | 'legendary' | 'epic' | 'rare' | 'uncommon' | 'common';
  imageUrl?: string;
  bio: string;
  followers: number;
  chirps: number;
  profilePower: number;
  obtainedAt?: string;
}

const mockProfileCards: ProfileCard[] = [
  {
    id: '1',
    name: 'Alex Chen',
    handle: '@alex_chen',
    rarity: 'mythic',
    imageUrl: require('../attached_assets/IMG_0653_1753250221773.png'),
    bio: 'Building the future, one algorithm at a time. AI enthusiast, coffee addict, and occasional philosopher.',
    followers: 125000,
    chirps: 2847,
    profilePower: 892,
  },
  {
    id: '2',
    name: 'Maya Rodriguez',
    handle: '@maya_rodriguez',
    rarity: 'legendary',
    imageUrl: require('../attached_assets/IMG_0654_1753256178546.png'),
    bio: 'Protecting our oceans, one coral reef at a time. Diver, scientist, and advocate for marine conservation.',
    followers: 89000,
    chirps: 1563,
    profilePower: 634,
  },
  {
    id: '3',
    name: 'Jordan Kim',
    handle: '@jordan_kim',
    rarity: 'epic',
    imageUrl: require('../attached_assets/IMG_0655_1753256178546.png'),
    bio: 'Gaming is life, life is gaming. Pro player turned commentator. Always chasing that perfect play.',
    followers: 67000,
    chirps: 2341,
    profilePower: 521,
  },
  {
    id: '4',
    name: 'Sarah Williams',
    handle: '@sarah_williams',
    rarity: 'rare',
    bio: 'Creating magic in the kitchen and sharing it with the world. Food is love, cooking is therapy.',
    followers: 45000,
    chirps: 892,
    profilePower: 234,
  },
  {
    id: '5',
    name: 'Marcus Johnson',
    handle: '@marcus_johnson',
    rarity: 'legendary',
    bio: 'From the field to the stage. Using sports to inspire and motivate others to reach their potential.',
    followers: 156000,
    chirps: 3421,
    profilePower: 987,
  },
  {
    id: '6',
    name: 'Luna Patel',
    handle: '@luna_patel',
    rarity: 'epic',
    bio: 'Exploring the cosmos from my backyard telescope. The universe is vast, and so are the possibilities.',
    followers: 78000,
    chirps: 1234,
    profilePower: 456,
  },
  {
    id: '7',
    name: 'David Thompson',
    handle: '@david_thompson',
    rarity: 'uncommon',
    bio: 'Strumming strings and teaching others to find their rhythm. Music connects us all.',
    followers: 23000,
    chirps: 567,
    profilePower: 123,
  },
  {
    id: '8',
    name: 'Emma Davis',
    handle: '@emma_davis',
    rarity: 'common',
    bio: 'Lost in stories, creating my own. Books are my escape and my inspiration.',
    followers: 12000,
    chirps: 234,
    profilePower: 67,
  },
  {
    id: '9',
    name: 'Zara Ahmed',
    handle: '@zara_ahmed',
    rarity: 'mythic',
    bio: 'Documenting human stories from around the world. Every photo tells a story of resilience and hope.',
    followers: 189000,
    chirps: 4123,
    profilePower: 1245,
  },
  {
    id: '10',
    name: 'Ryan O\'Connor',
    handle: '@ryan_oconnor',
    rarity: 'legendary',
    bio: 'Crafting visual stories that move hearts and change minds. Every frame is intentional.',
    followers: 134000,
    chirps: 2987,
    profilePower: 756,
  },
  {
    id: '11',
    name: 'Isabella Santos',
    handle: '@isabella_santos',
    rarity: 'epic',
    bio: 'Creating beautiful fashion that doesn\'t cost the earth. Style with substance.',
    followers: 92000,
    chirps: 1876,
    profilePower: 543,
  },
  {
    id: '12',
    name: 'Kevin Park',
    handle: '@kevin_park',
    rarity: 'rare',
    bio: 'Building tools that make the world better. Code is poetry, bugs are features.',
    followers: 38000,
    chirps: 654,
    profilePower: 198,
  },
];

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

  // Simulate loading user's collection
  useEffect(() => {
    // In a real app, this would load from the database
    const userCollection = mockProfileCards.slice(0, 6); // User has first 6 profile cards
    setCollection(userCollection);
  }, []);

  if (showAnalytics) {
    return <AnalyticsPage onClose={() => setShowAnalytics(false)} />;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Collection</Text>
        <Text style={styles.headerSubtitle}>Your collected profile cards</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Analytics Button */}
        <View style={styles.analyticsSection}>
          <TouchableOpacity 
            style={styles.analyticsButton}
            onPress={() => setShowAnalytics(true)}
          >
            <Text style={styles.analyticsButtonText}>📊 View Analytics</Text>
          </TouchableOpacity>
        </View>

        {/* Collection Display */}
        <View style={styles.collectionSection}>
          <Text style={styles.sectionTitle}>Your Collection ({collection.length})</Text>
          {collection.length === 0 ? (
            <View style={styles.emptyCollection}>
              <Text style={styles.emptyText}>No profile cards collected yet</Text>
              <Text style={styles.emptySubtext}>Open some capsules to get started!</Text>
            </View>
          ) : (
            <View style={styles.profileGrid}>
              {collection.map((profile) => (
                <View key={profile.id} style={styles.profileCard}>
                  <View style={[styles.rarityBadge, { backgroundColor: rarityColors[profile.rarity] }]}>
                    <Text style={styles.rarityText}>{rarityNames[profile.rarity]}</Text>
                  </View>
                  
                  {profile.imageUrl ? (
                    <Image source={profile.imageUrl} style={styles.profileImage} />
                  ) : (
                    <View style={[styles.profileImagePlaceholder, { backgroundColor: rarityColors[profile.rarity] }]}>
                      <Text style={styles.profileImageText}>{profile.name.charAt(0)}</Text>
                    </View>
                  )}
                  
                  <Text style={styles.profileName}>{profile.name}</Text>
                  <Text style={styles.profileHandle}>{profile.handle}</Text>
                  <Text style={styles.profileBio}>{profile.bio}</Text>
                  
                                     <View style={styles.profileStats}>
                     <View style={styles.statItem}>
                       <Text style={styles.statValue}>{(profile.followers || 0).toLocaleString()}</Text>
                       <Text style={styles.statLabel}>Followers</Text>
                     </View>
                     <View style={styles.statItem}>
                       <Text style={styles.statValue}>{(profile.chirps || 0).toLocaleString()}</Text>
                       <Text style={styles.statLabel}>Chirps</Text>
                     </View>
                     <View style={styles.statItem}>
                       <Text style={styles.statValue}>{profile.profilePower || 0}</Text>
                       <Text style={styles.statLabel}>Power</Text>
                     </View>
                   </View>
                  
                  {profile.obtainedAt && (
                    <Text style={styles.obtainedDate}>
                      Opened: {new Date(profile.obtainedAt).toLocaleDateString()}
                    </Text>
                  )}
                </View>
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
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
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
  content: {
    flex: 1,
  },
  analyticsSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  analyticsButton: {
    backgroundColor: '#7c3aed',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  analyticsButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  collectionSection: {
    padding: 20,
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
    width: '48%',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
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
    width: 60,
    height: 60,
    borderRadius: 30,
    alignSelf: 'center',
    marginBottom: 8,
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
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  statLabel: {
    fontSize: 10,
    color: '#6b7280',
  },
  obtainedDate: {
    fontSize: 10,
    color: '#9ca3af',
    textAlign: 'center',
  },
});
