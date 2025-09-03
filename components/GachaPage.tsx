import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AnalyticsPage from './AnalyticsPage';
import { useAuth } from './AuthContext';
import ChirpCrystalIcon from './icons/ChirpCrystalIcon';
import ProfileModal from './ProfileModal';

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

export default function GachaPage() {
  const { user } = useAuth();
  const [collection, setCollection] = useState<ProfileCard[]>([]);
  const [isRolling, setIsRolling] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [pulledCard, setPulledCard] = useState<ProfileCard | null>(null);
  const [showPulledCard, setShowPulledCard] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);

  // Simulate loading user's collection
  useEffect(() => {
    // In a real app, this would load from the database
    const userCollection = mockProfileCards.slice(0, 2); // User has first 2 profile cards
    setCollection(userCollection);
  }, []);

  const handleProfileCardPress = (profileCard: ProfileCard) => {
    // Convert the profile card ID to a user ID for the ProfileModal
    // In a real app, this would be the actual user ID from the database
    setSelectedProfileId(profileCard.id);
    setShowProfileModal(true);
  };

  const rollForProfile = (rollCount: number = 1) => {
    if (isRolling) return;
    
    const cost = rollCount === 10 ? 950 : 100;
    
         // Check if user has enough crystals
     if ((user?.crystalBalance || 0) < cost) {
       Alert.alert('Insufficient Crystals', `You need ${cost} crystals to open a capsule. Like chirps (+1) or comment (+5) to earn crystals!`);
       return;
     }

    setIsRolling(true);
    
              // Simulate capsule opening animation
     setTimeout(() => {
       const results: ProfileCard[] = [];
       
               for (let i = 0; i < rollCount; i++) {
          const capsuleResult = openCapsule();
          console.log('🎲 Capsule result:', capsuleResult);
          const newProfile = mockProfileCards.find(p => p.id === capsuleResult.toString());
          console.log('📱 Found profile:', newProfile);
          
          if (newProfile) {
            const profileWithTimestamp = {
              ...newProfile,
              obtainedAt: new Date().toISOString(),
            };
            results.push(profileWithTimestamp);
          } else {
            console.log('❌ No profile found for result:', capsuleResult);
          }
        }
      
             // Add all results to collection
       setCollection(prev => [...prev, ...results]);
       
       // Set the first result as the pulled card to show
       if (results.length > 0) {
         console.log('🎉 Setting pulled card:', results[0]);
         setPulledCard(results[0]);
         setShowPulledCard(true);
       } else {
         console.log('❌ No results to show');
       }
       
               // Deduct crystals from user balance
        if (user) {
          const newBalance = (user.crystalBalance || 0) - cost;
          // In a real app, this would update the database
          // For now, we'll just update the local state
          user.crystalBalance = newBalance;
        }
        
        setIsRolling(false);
    }, 2000);
  };

        const openCapsule = (): number => {
     const random = Math.random();
     
     // Rarity distribution (total 100%)
     if (random < 0.01) return 1; // 1% mythic
     if (random < 0.05) return 2; // 4% legendary
     if (random < 0.15) return 3; // 10% epic
     if (random < 0.35) return 4; // 20% rare
     if (random < 0.65) return 7; // 30% uncommon
     return 8; // 34% common
   };

  if (showAnalytics) {
    return <AnalyticsPage onClose={() => setShowAnalytics(false)} />;
  }

  if (showPulledCard && pulledCard) {
    return (
      <View style={styles.container}>
        <View style={styles.pulledCardContainer}>
          <View style={styles.pulledCardHeader}>
            <Text style={styles.pulledCardTitle}>🎉 You Got!</Text>
            <Text style={styles.pulledCardSubtitle}>A new photocard has been added to your collection!</Text>
          </View>
          
          <View style={styles.pulledCardDisplay}>
            <View style={[styles.rarityBadgeLarge, { backgroundColor: rarityColors[pulledCard.rarity] }]}>
              <Text style={styles.rarityTextLarge}>{rarityNames[pulledCard.rarity]}</Text>
            </View>
            
            {pulledCard.imageUrl ? (
              <Image source={pulledCard.imageUrl} style={styles.pulledCardImage} />
            ) : (
              <View style={[styles.pulledCardImagePlaceholder, { backgroundColor: rarityColors[pulledCard.rarity] }]}>
                <Text style={styles.pulledCardImageText}>{pulledCard.name.charAt(0)}</Text>
              </View>
            )}
            
            <Text style={styles.pulledCardName}>{pulledCard.name}</Text>
            <Text style={styles.pulledCardHandle}>{pulledCard.handle}</Text>
            <Text style={styles.pulledCardBio}>{pulledCard.bio}</Text>
            
            <View style={styles.pulledCardStats}>
              <View style={styles.pulledCardStatItem}>
                <Text style={styles.pulledCardStatValue}>{(pulledCard.followers || 0).toLocaleString()}</Text>
                <Text style={styles.pulledCardStatLabel}>Followers</Text>
              </View>
              <View style={styles.pulledCardStatItem}>
                <Text style={styles.pulledCardStatValue}>{(pulledCard.chirps || 0).toLocaleString()}</Text>
                <Text style={styles.pulledCardStatLabel}>Chirps</Text>
              </View>
              <View style={styles.pulledCardStatItem}>
                <Text style={styles.pulledCardStatValue}>{pulledCard.profilePower || 0}</Text>
                <Text style={styles.pulledCardStatLabel}>Power</Text>
              </View>
            </View>
          </View>
          
          <TouchableOpacity
            style={styles.addToCollectionButton}
            onPress={() => {
              setShowPulledCard(false);
              setPulledCard(null);
            }}
          >
            <Text style={styles.addToCollectionButtonText}>Add to Collection</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
             {/* Header */}
       <View style={styles.header}>
         <Text style={styles.headerTitle}>Crystal Capsules</Text>
         <Text style={styles.headerSubtitle}>Draw crystal capsules to collect photocards of your friends (their chirp profiles) and make your profile stronger!</Text>
       </View>

       {/* Instructions Section */}
       <View style={styles.instructionsContainer}>
         <View style={styles.instructionsCard}>
           <Text style={styles.instructionsTitle}>How It Works</Text>
           <View style={styles.instructionItem}>
             <Text style={styles.instructionNumber}>1</Text>
             <Text style={styles.instructionText}>Open crystal capsules using chirp crystals</Text>
           </View>
           <View style={styles.instructionItem}>
             <Text style={styles.instructionNumber}>2</Text>
             <Text style={styles.instructionText}>Collect photocards of your friends' profiles</Text>
           </View>
           <View style={styles.instructionItem}>
             <Text style={styles.instructionNumber}>3</Text>
             <Text style={styles.instructionText}>Each photocard adds power to your profile</Text>
           </View>
           <View style={styles.instructionItem}>
             <Text style={styles.instructionNumber}>4</Text>
             <Text style={styles.instructionText}>Rarer photocards give more profile power!</Text>
           </View>
         </View>
       </View>

      {/* Crystal Balance Display */}
      <View style={styles.crystalBalanceContainer}>
        <View style={styles.crystalBalanceCard}>
          <View style={styles.crystalBalanceHeader}>
            <ChirpCrystalIcon size={24} color="#7c3aed" />
            <Text style={styles.crystalBalanceLabel}>Chirp Crystals</Text>
          </View>
          <Text style={styles.crystalBalanceAmount}>{user?.crystalBalance || 0}</Text>
          <Text style={styles.crystalBalanceInfo}>
            💎 Like a chirp: +1 crystal | 💬 Comment: +5 crystals
          </Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Roll Section */}
        <View style={styles.rollSection}>
          <LinearGradient
            colors={['#7c3aed', '#ec4899']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.rollButton}
          >
            <TouchableOpacity
              style={styles.rollButtonInner}
              onPress={() => rollForProfile()}
              disabled={isRolling || (user?.crystalBalance || 0) < 100}
            >
                           <Text style={styles.rollButtonText}>
               {isRolling ? 'Opening...' : '💎 Open Capsule (100 crystals)'}
             </Text>
            </TouchableOpacity>
          </LinearGradient>
          
                     <Text style={styles.rollInfo}>
             {user && user.crystalBalance && user.crystalBalance >= 100 
               ? 'Open a capsule for a chance to get rare profile themes!' 
               : 'You need 100 crystals to open a capsule. Like chirps (+1) or comment (+5) to earn crystals!'}
           </Text>
          
          {/* 10-Roll Option */}
          <TouchableOpacity
            style={[
              styles.tenRollButton,
              { opacity: (user?.crystalBalance || 0) >= 950 ? 1 : 0.5 }
            ]}
            onPress={() => rollForProfile(10)}
            disabled={isRolling || (user?.crystalBalance || 0) < 950}
          >
                         <Text style={styles.tenRollButtonText}>
               💎 10x Capsules (950 crystals)
             </Text>
          </TouchableOpacity>
        </View>

        {/* Analytics Button */}
        <View style={styles.analyticsSection}>
          <TouchableOpacity 
            style={styles.analyticsButton}
            onPress={() => setShowAnalytics(true)}
          >
            <LinearGradient
              colors={['#7c3aed', '#ec4899']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.analyticsButtonGradient}
            >
              <Text style={styles.analyticsButtonText}>📊 View Analytics</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

                          {/* Collection Display */}
         <View style={styles.collectionSection}>
           <Text style={styles.sectionTitle}>Your Collection</Text>
           {collection.length === 0 ? (
             <View style={styles.emptyCollection}>
               <Text style={styles.emptyText}>No profile cards collected yet</Text>
               <Text style={styles.emptySubtext}>Open your first capsule!</Text>
             </View>
           ) : (
             <View style={styles.profileGrid}>
               {collection.map((profile) => (
                 <TouchableOpacity
                   key={profile.id}
                   style={styles.profileCard}
                   onPress={() => handleProfileCardPress(profile)}
                   activeOpacity={0.7}
                 >
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
                 </TouchableOpacity>
               ))}
             </View>
                      )}
         </View>
       </ScrollView>
       
       {/* Profile Modal for viewing collected profile cards */}
       <ProfileModal
         visible={showProfileModal}
         userId={selectedProfileId}
         onClose={() => {
           setShowProfileModal(false);
           setSelectedProfileId(null);
         }}
       />
       
       {/* Profile Modal for viewing collected profile cards */}
       <ProfileModal
         visible={showProfileModal}
         userId={selectedProfileId}
         onClose={() => {
           setShowProfileModal(false);
           setSelectedProfileId(null);
         }}
       />
            </View>
     );
 }

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingTop: 80, // Increased from 60 to 80 for more top padding
    paddingBottom: 40, // Increased bottom padding to avoid iPhone home indicator
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
    lineHeight: 22,
  },
  instructionsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  instructionsCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  instructionNumber: {
    backgroundColor: '#7c3aed',
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
    width: 24,
    height: 24,
    borderRadius: 12,
    textAlign: 'center',
    lineHeight: 24,
    marginRight: 12,
    marginTop: 2,
  },
  instructionText: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
    lineHeight: 20,
  },
  crystalBalanceContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
     crystalBalanceCard: {
     backgroundColor: '#f8fafc',
     borderRadius: 16,
     padding: 20,
     borderWidth: 1,
     borderColor: '#e2e8f0',
     alignItems: 'center',
   },
   crystalBalanceHeader: {
     flexDirection: 'row',
     alignItems: 'center',
     marginBottom: 8,
   },
  crystalBalanceLabel: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
    marginBottom: 8,
  },
  crystalBalanceAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#7c3aed',
    marginBottom: 8,
  },
  crystalBalanceInfo: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 16,
  },
  content: {
    flex: 1,
  },
  rollSection: {
    padding: 20,
    alignItems: 'center',
  },
  rollButton: {
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  rollButtonInner: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
  },
  rollButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  rollInfo: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  tenRollButton: {
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  tenRollButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  analyticsSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  analyticsButton: {
    borderRadius: 16,
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  analyticsButtonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
  },
  analyticsButtonText: {
    color: '#ffffff',
    fontSize: 18,
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
  pulledCardContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 40,
    justifyContent: 'center',
  },
  pulledCardHeader: {
    alignItems: 'center',
    marginBottom: 30,
  },
  pulledCardTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  pulledCardSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  pulledCardDisplay: {
    backgroundColor: '#f8fafc',
    borderRadius: 20,
    padding: 24,
    marginBottom: 30,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    position: 'relative',
  },
  rarityBadgeLarge: {
    position: 'absolute',
    top: 16,
    right: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    zIndex: 1,
  },
  rarityTextLarge: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  pulledCardImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
  },
  pulledCardImagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulledCardImageText: {
    color: '#ffffff',
    fontSize: 48,
    fontWeight: 'bold',
  },
  pulledCardName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
    textAlign: 'center',
  },
  pulledCardHandle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 12,
    textAlign: 'center',
  },
  pulledCardBio: {
    fontSize: 14,
    color: '#374151',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  pulledCardStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 20,
  },
  pulledCardStatItem: {
    alignItems: 'center',
    flex: 1,
  },
  pulledCardStatValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  pulledCardStatLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  addToCollectionButton: {
    backgroundColor: '#7c3aed',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  addToCollectionButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
