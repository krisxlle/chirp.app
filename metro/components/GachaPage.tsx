import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Animated, Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { addToUserCollection, getRandomUsers, getUserCollection } from '../lib/database/mobile-db-supabase';
import AnalyticsPage from './AnalyticsPage';
import { useAuth } from './AuthContext';
import BirdIcon from './icons/BirdIcon';
import ChirpCrystalIcon from './icons/ChirpCrystalIcon';
import ChirpLogo from './icons/ChirpLogo';
import CollectionIcon from './icons/CollectionIcon';
import GachaIcon from './icons/GachaIcon';
import HeartIcon from './icons/HeartIcon';
import PhotocardProfileModal from './PhotocardProfileModal';
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
    profilePower: 892,
    quantity: 1,
  },
  {
    id: '2',
    name: 'Maya Rodriguez',
    handle: '@maya_rodriguez',
    rarity: 'legendary',
    imageUrl: require('../attached_assets/IMG_0654_1753256178546.png'),
    bio: 'Protecting our oceans, one coral reef at a time. Diver, scientist, and advocate for marine conservation.',
    followers: 89000,
    profilePower: 634,
    quantity: 1,
  },
  {
    id: '3',
    name: 'Jordan Kim',
    handle: '@jordan_kim',
    rarity: 'epic',
    imageUrl: require('../attached_assets/IMG_0655_1753256178546.png'),
    bio: 'Creating digital art that bridges reality and imagination. NFT artist, designer, and tech enthusiast.',
    followers: 67000,
    profilePower: 487,
    quantity: 1,
  },
  {
    id: '4',
    name: 'Sam Taylor',
    handle: '@sam_taylor',
    rarity: 'rare',
    imageUrl: require('../attached_assets/IMG_0653_1753250221773.png'),
    bio: 'Musician, producer, and sound engineer. Always chasing the perfect beat.',
    followers: 45000,
    profilePower: 312,
    quantity: 1,
  },
  {
    id: '5',
    name: 'Riley Park',
    handle: '@riley_park',
    rarity: 'uncommon',
    imageUrl: require('../attached_assets/IMG_0654_1753256178546.png'),
    bio: 'Food blogger and chef. Sharing recipes and culinary adventures from around the world.',
    followers: 28000,
    profilePower: 198,
    quantity: 1,
  },
  {
    id: '6',
    name: 'Casey Lee',
    handle: '@casey_lee',
    rarity: 'common',
    imageUrl: require('../attached_assets/IMG_0655_1753256178546.png'),
    bio: 'Student, gamer, and aspiring developer. Learning to code one bug at a time.',
    followers: 12000,
    profilePower: 89,
    quantity: 1,
  },
];

const rarityColors = {
  mythic: '#ef4444',
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
  const { user, updateUser } = useAuth();
  const [collection, setCollection] = useState<ProfileCard[]>([]);
  const [isRolling, setIsRolling] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [pulledCard, setPulledCard] = useState<ProfileCard | null>(null);
  const [showPulledCard, setShowPulledCard] = useState(false);
  const [pulledCards, setPulledCards] = useState<ProfileCard[]>([]);
  const [showPulledCards, setShowPulledCards] = useState(false);
  const [showPhotocardProfile, setShowPhotocardProfile] = useState(false);
  const [selectedPhotocard, setSelectedPhotocard] = useState<ProfileCard | null>(null);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showCrystalInfoModal, setShowCrystalInfoModal] = useState(false);
  
  // Animation values for loading
  const fadeAnim = useState(new Animated.Value(0))[0];
  const scaleAnim = useState(new Animated.Value(0.8))[0];
  
  // Floating icons animations
  const floatingAnims = useState(() => 
    Array.from({ length: 10 }, () => ({
      translateY: new Animated.Value(0),
      translateX: new Animated.Value(0),
      rotate: new Animated.Value(0),
      scale: new Animated.Value(0.5),
      opacity: new Animated.Value(0),
    }))
  )[0];
  
  // Sparkle animations
  const sparkleAnims = useState(() => 
    Array.from({ length: 15 }, () => ({
      translateY: new Animated.Value(0),
      translateX: new Animated.Value(0),
      rotate: new Animated.Value(0),
      scale: new Animated.Value(0),
      opacity: new Animated.Value(0),
    }))
  )[0];

  // Animation functions
  const startLoadingAnimation = () => {
    // Reset main animations
    fadeAnim.setValue(0);
    scaleAnim.setValue(0.8);
    
    // Reset floating animations
    floatingAnims.forEach(anim => {
      anim.translateY.setValue(0);
      anim.translateX.setValue(0);
      anim.rotate.setValue(0);
      anim.scale.setValue(0.5);
      anim.opacity.setValue(0);
    });
    
    // Reset sparkle animations
    sparkleAnims.forEach(anim => {
      anim.translateY.setValue(0);
      anim.translateX.setValue(0);
      anim.rotate.setValue(0);
      anim.scale.setValue(0);
      anim.opacity.setValue(0);
    });
    
    // Start main fade animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
    
    // Start floating animations with staggered timing
    floatingAnims.forEach((anim, index) => {
      const delay = index * 200; // Stagger each icon by 200ms
      
      setTimeout(() => {
        Animated.parallel([
          // Fade in
          Animated.timing(anim.opacity, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          // Scale up
          Animated.timing(anim.scale, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          // Start floating movement
          Animated.loop(
            Animated.sequence([
              Animated.timing(anim.translateY, {
                toValue: -20,
                duration: 1000,
                useNativeDriver: true,
              }),
              Animated.timing(anim.translateY, {
                toValue: 20,
                duration: 1000,
                useNativeDriver: true,
              }),
            ])
          ),
          // Start horizontal drift
          Animated.loop(
            Animated.timing(anim.translateX, {
              toValue: secureRandomFloat(-20, 20), // Random drift between -20 and 20
              duration: 2000 + secureRandomFloat(0, 1000), // Random duration between 2-3 seconds
              useNativeDriver: true,
            })
          ),
          // Start rotation
          Animated.loop(
            Animated.timing(anim.rotate, {
              toValue: 1,
              duration: 3000 + secureRandomFloat(0, 2000), // Random rotation speed
              useNativeDriver: true,
            })
          ),
        ]).start();
      }, delay);
    });
    
    // Start sparkle animations with coordinated timing
    sparkleAnims.forEach((anim, index) => {
      const delay = index * 100; // Faster stagger for sparkles
      
      setTimeout(() => {
        Animated.parallel([
          // Fade in and scale up
          Animated.timing(anim.opacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(anim.scale, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          // Coordinated circular motion
          Animated.loop(
            Animated.sequence([
              Animated.timing(anim.translateY, {
                toValue: Math.sin(index * 0.5) * 30,
                duration: 2000,
                useNativeDriver: true,
              }),
              Animated.timing(anim.translateY, {
                toValue: Math.sin(index * 0.5 + Math.PI) * 30,
                duration: 2000,
                useNativeDriver: true,
              }),
            ])
          ),
          Animated.loop(
            Animated.sequence([
              Animated.timing(anim.translateX, {
                toValue: Math.cos(index * 0.5) * 30,
                duration: 2000,
                useNativeDriver: true,
              }),
              Animated.timing(anim.translateX, {
                toValue: Math.cos(index * 0.5 + Math.PI) * 30,
                duration: 2000,
                useNativeDriver: true,
              }),
            ])
          ),
          // Fast rotation
          Animated.loop(
            Animated.timing(anim.rotate, {
              toValue: 1,
              duration: 1000,
              useNativeDriver: true,
            })
          ),
        ]).start();
      }, delay);
    });
  };

  const stopLoadingAnimation = () => {
    // Fade out main overlay
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
    
    // Fade out floating icons
    floatingAnims.forEach(anim => {
      Animated.timing(anim.opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });
    
    // Fade out sparkles
    sparkleAnims.forEach(anim => {
      Animated.timing(anim.opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });
  };

  // Helper function to get current crystal balance
  const getCurrentCrystalBalance = (): number => {
    const crystalBalance = user?.crystalBalance;
    
    if (!crystalBalance) return 0;
    
    // Handle object with balance property
    if (typeof crystalBalance === 'object' && crystalBalance !== null) {
      const balanceObj = crystalBalance as Record<string, any>;
      if ('balance' in balanceObj && typeof balanceObj.balance === 'number') {
        return balanceObj.balance || 0;
      }
    }
    
    // Handle number
    if (typeof crystalBalance === 'number') {
      return crystalBalance;
    }
    
    return 0;
  };

  // Load user's collection from database
  useEffect(() => {
    loadUserCollection();
    refreshCrystalBalance(); // Refresh crystal balance when component loads
  }, []);

  // Refresh crystal balance when user changes
  useEffect(() => {
    if (user?.id) {
      refreshCrystalBalance();
    }
  }, [user?.id]);

  const loadUserCollection = async () => {
    try {
      if (user?.id) {
        const userCollection = await getUserCollection(user.id);
        setCollection(userCollection);
        console.log('🎮 Loaded user collection:', userCollection.length, 'items');
      } else {
        setCollection([]);
        console.log('🎮 No user ID, starting with empty collection');
      }
    } catch (error) {
      console.error('❌ Error loading user collection:', error);
      setCollection([]);
    }
  };

  // Refresh crystal balance from database
  const refreshCrystalBalance = async () => {
    if (user?.id) {
      try {
        console.log('💎 Refreshing crystal balance for user:', user.id);
        const { getUserCrystalBalance } = await import('../lib/database/mobile-db-supabase');
        const crystalBalance = await getUserCrystalBalance(user.id);
        
        console.log('💎 Database crystal balance:', crystalBalance);
        console.log('💎 Current user crystal balance:', user.crystalBalance);
        
        // Always update the user object to ensure it's current
        await updateUser({ crystalBalance });
        console.log('💎 Updated crystal balance to:', crystalBalance);
      } catch (error) {
        console.error('Error refreshing crystal balance:', error);
      }
    }
  };

  const handleProfileCardPress = (profileCard: ProfileCard) => {
    setSelectedPhotocard(profileCard);
    setShowPhotocardProfile(true);
  };

  const openCapsule = async (): Promise<ProfileCard | null> => {
    try {
      // Get random users from database, excluding current user
      const randomUsers = await getRandomUsers(20, user?.id);
      
      if (randomUsers.length === 0) {
        console.log('⚠️ No users found in database, falling back to mock data');
        // Fallback to mock data if no real users
        const randomMockCard = mockProfileCards[secureRandomInt(0, mockProfileCards.length - 1)];
        return randomMockCard;
      }
      
      // Simple gacha logic - weighted towards common cards
      const weights = {
        mythic: 1,
        legendary: 3,
        epic: 8,
        rare: 15,
        uncommon: 25,
        common: 48,
      };
      
      const totalWeight = Object.values(weights).reduce((sum, weight) => sum + weight, 0);
      const random = secureRandomFloat(0, totalWeight);
      
      let currentWeight = 0;
      for (const [rarity, weight] of Object.entries(weights)) {
        currentWeight += weight;
        if (random <= currentWeight) {
          // Find a card of this rarity
          const cardsOfRarity = randomUsers.filter(card => card.rarity === rarity);
          if (cardsOfRarity.length > 0) {
            const randomCard = cardsOfRarity[secureRandomInt(0, cardsOfRarity.length - 1)];
            return randomCard;
          }
        }
      }
      
      // Fallback to random user
      return randomUsers[secureRandomInt(0, randomUsers.length - 1)];
    } catch (error) {
      console.error('❌ Error in openCapsule:', error);
      // Fallback to mock data
      const randomMockCard = mockProfileCards[secureRandomInt(0, mockProfileCards.length - 1)];
      return randomMockCard;
    }
  };

  const rollForProfile = async (rollCount: number = 1) => {
    if (isRolling) return;
    
    const cost = rollCount === 10 ? 950 : 100;
    
    // Check if user has enough crystals
    const currentBalance = getCurrentCrystalBalance();
    
    if (currentBalance < cost) {
      Alert.alert('Insufficient Crystals', `You need ${cost} crystals to open a capsule. Like chirps (+1) or comment (+5) to earn crystals!`);
      return;
    }

    setIsRolling(true);
    startLoadingAnimation();
    
    // Simulate capsule opening animation
    setTimeout(async () => {
      try {
        console.log('🎲 Starting capsule opening animation...');
        const results: ProfileCard[] = [];
        
        for (let i = 0; i < rollCount; i++) {
          const newProfile = await openCapsule();
          console.log('🎲 Capsule result:', newProfile?.name, newProfile?.rarity);
          
          if (newProfile) {
            const profileWithTimestamp = {
              ...newProfile,
              obtainedAt: new Date().toISOString(),
            };
            results.push(profileWithTimestamp);
          }
        }
        
        if (results.length > 0) {
          // Show different modals based on roll count
          if (rollCount === 10) {
            // Show multi-card results for 10-roll
            setPulledCards(results);
            setShowPulledCards(true);
          } else {
            // Show single card result for 1-roll
            setPulledCard(results[0]);
            setShowPulledCard(true);
          }
          
          // Add to database collection and track results
          let newProfilesAdded = 0;
          let duplicateProfiles = 0;
          
          for (const newCard of results) {
            try {
              const success = await addToUserCollection(user.id, newCard.id, newCard.rarity);
              if (success) {
                // Check if this was actually a new profile or a duplicate
                const existingProfile = collection.find(existing => existing.id === newCard.id);
                if (existingProfile) {
                  duplicateProfiles++;
                  console.log(`✅ Increased quantity for existing profile: ${newCard.name} (now ${existingProfile.quantity + 1})`);
                } else {
                  newProfilesAdded++;
                  console.log('✅ Added NEW profile to collection:', newCard.name);
                }
              } else {
                console.error('❌ Failed to add profile to collection:', newCard.name);
              }
            } catch (error) {
              console.error('❌ Error adding profile to collection:', error);
            }
          }
          
          // Reload collection to get updated data
          await loadUserCollection();
          
          // Show user feedback about the roll results
          if (duplicateProfiles > 0) {
            console.log(`📊 Roll Results: ${newProfilesAdded} new profiles, ${duplicateProfiles} quantity increases`);
          }
          
          try {
            // Deduct crystal balance from database
            console.log('💎 Deducting crystals from database...');
            
            const { deductCrystalBalance } = await import('../lib/database/mobile-db-supabase');
            const success = await deductCrystalBalance(user.id, cost);
            
            if (success) {
              // Refresh crystal balance from database to update UI
              await refreshCrystalBalance();
              console.log('💎 Crystal balance updated successfully');
            } else {
              console.error('Failed to deduct crystal balance');
              // If database deduction fails, still update local state as fallback
              const currentBalance = getCurrentCrystalBalance();
              const newBalance = currentBalance - cost;
              await updateUser({ crystalBalance: newBalance });
              console.log('💎 Fallback: Updated crystal balance in AuthContext');
            }
          } catch (error) {
            console.error('Error deducting crystal balance:', error);
            // Fallback to local state update if database fails
            const currentBalance = getCurrentCrystalBalance();
            const newBalance = currentBalance - cost;
            await updateUser({ crystalBalance: newBalance });
            console.log('💎 Fallback: Updated crystal balance in AuthContext');
          }
        }
        
        setIsRolling(false);
        stopLoadingAnimation();
      } catch (error) {
        console.error('Error in capsule opening:', error);
        setIsRolling(false);
        stopLoadingAnimation();
      }
    }, 2000); // 2 second animation
  };

  if (showAnalytics) {
    return <AnalyticsPage onClose={() => setShowAnalytics(false)} />;
  }


  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Chirp Gacha</Text>
        <TouchableOpacity
          style={styles.helpButton}
          onPress={() => setShowHelpModal(true)}
        >
          <Text style={styles.helpButtonText}>?</Text>
        </TouchableOpacity>
      </View>

      {/* Crystal Balance */}
      <View style={styles.crystalBalanceContainer}>
        <TouchableOpacity
          style={styles.crystalBalanceCard}
          onPress={() => {
            setShowCrystalInfoModal(true);
            refreshCrystalBalance(); // Refresh when tapped
          }}
          activeOpacity={0.7}
        >
          <View style={styles.crystalBalanceContent}>
            <ChirpCrystalIcon size={60} />
            <Text style={styles.crystalBalanceAmount}>
              {getCurrentCrystalBalance().toLocaleString()}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Gacha Banner */}
      <View style={styles.bannerContainer}>
        <Image
          source={require('../public/assets/Gacha banner.png')}
          style={styles.bannerImage}
          resizeMode="contain"
        />
        
        {/* Loading Animation Overlay */}
        {isRolling && (
          <Animated.View 
            style={[
              styles.loadingOverlay,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <LinearGradient
              colors={['#C671FF', '#FF61A6', '#f5a5e0']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.loadingGradient}
            >
            {/* Floating Icons */}
            {floatingAnims.map((anim, index) => {
              const icons = [
                <ChirpCrystalIcon key="crystal" size={28} color="#C671FF" />,
                <GachaIcon key="gacha" size={28} color="#FF61A6" />,
                <CollectionIcon key="collection" size={28} color="#f5a5e0" />,
                <HeartIcon key="heart" size={28} color="#C671FF" />,
                <BirdIcon key="bird" size={28} color="#FF61A6" />,
                <ChirpLogo key="logo" size={28} color="#f5a5e0" />,
                <ChirpCrystalIcon key="crystal2" size={28} color="#f5a5e0" />,
                <GachaIcon key="gacha2" size={28} color="#C671FF" />,
                <CollectionIcon key="collection2" size={28} color="#FF61A6" />,
                <HeartIcon key="heart2" size={28} color="#f5a5e0" />,
              ];
              
              return (
                <Animated.View
                  key={index}
                  style={[
                    styles.floatingIcon,
                    {
                      left: `${10 + (index * 9)}%`, // Distribute icons across the screen
                      top: `${15 + (index * 8)}%`,
                      opacity: anim.opacity,
                      transform: [
                        { translateY: anim.translateY },
                        { translateX: anim.translateX },
                        { scale: anim.scale },
                        {
                          rotate: anim.rotate.interpolate({
                            inputRange: [0, 1],
                            outputRange: ['0deg', '360deg'],
                          }),
                        },
                      ],
                    },
                  ]}
                >
                  {icons[index]}
                </Animated.View>
              );
            })}
            
            {/* Sparkles */}
            {sparkleAnims.map((anim, index) => (
              <Animated.View
                key={`sparkle-${index}`}
                style={[
                  styles.sparkle,
                  {
                    left: `${secureRandomFloat(10, 90)}%`, // Random horizontal position
                    top: `${secureRandomFloat(20, 80)}%`, // Random vertical position
                    opacity: anim.opacity,
                    transform: [
                      { translateY: anim.translateY },
                      { translateX: anim.translateX },
                      { scale: anim.scale },
                      {
                        rotate: anim.rotate.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0deg', '360deg'],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <Text style={styles.sparkleText}>✨</Text>
              </Animated.View>
            ))}
            
              {/* Loading Text */}
              <View style={styles.loadingTextContainer}>
                <Text style={styles.loadingText}>Drawing capsules...</Text>
                <Text style={styles.loadingSubtext}>Please wait</Text>
              </View>
            </LinearGradient>
          </Animated.View>
        )}
        
        {/* Capsule Buttons Overlay */}
        <View style={styles.capsuleButtonsOverlay}>
          <LinearGradient
            colors={['#9ca3af', '#6b7280']}
            style={styles.openOneButton}
          >
            <TouchableOpacity
              style={styles.buttonContent}
              onPress={() => rollForProfile()}
              disabled={isRolling || getCurrentCrystalBalance() < 100}
              activeOpacity={0.7}
            >
              <Text style={styles.openOneText}>Open 1</Text>
              <View style={styles.crystalCostContainer}>
                <ChirpCrystalIcon size={16} />
                <Text style={[
                  styles.crystalCostText,
                  { color: getCurrentCrystalBalance() >= 100 ? 'white' : '#ef4444' }
                ]}>100</Text>
              </View>
            </TouchableOpacity>
          </LinearGradient>
          
          <LinearGradient
            colors={['#C671FF', '#FF61A6']}
            style={styles.openTenButton}
          >
            <TouchableOpacity
              style={styles.buttonContent}
              onPress={() => rollForProfile(10)}
              disabled={isRolling || getCurrentCrystalBalance() < 950}
              activeOpacity={0.7}
            >
              <Text style={styles.openTenText}>Open 10</Text>
              <View style={styles.crystalCostContainer}>
                <ChirpCrystalIcon size={16} />
                <Text style={[
                  styles.crystalCostText,
                  { color: getCurrentCrystalBalance() >= 950 ? 'white' : '#ef4444' }
                ]}>950</Text>
              </View>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </View>

      {/* Help Modal */}
      {showHelpModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>How It Works</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowHelpModal(false)}
              >
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalBody}>
              <View style={styles.instructionContainer}>
                <View style={styles.instructionNumber}>
                  <Text style={styles.instructionNumberText}>1</Text>
                </View>
                <Text style={styles.instructionText}>
                  Like chirps to earn 1 crystal each
                </Text>
              </View>
              
              <View style={styles.instructionContainer}>
                <View style={styles.instructionNumber}>
                  <Text style={styles.instructionNumberText}>2</Text>
                </View>
                <Text style={styles.instructionText}>
                  Comment on chirps to earn 2 crystals each
                </Text>
              </View>
              
              <View style={styles.instructionContainer}>
                <View style={styles.instructionNumber}>
                  <Text style={styles.instructionNumberText}>3</Text>
                </View>
                <Text style={styles.instructionText}>
                  Use crystals to open capsules and collect rare profiles
                </Text>
              </View>
              
              <View style={styles.instructionContainer}>
                <View style={styles.instructionNumber}>
                  <Text style={styles.instructionNumberText}>4</Text>
                </View>
                <Text style={styles.instructionText}>
                  Build your collection and discover amazing people
                </Text>
              </View>
            </ScrollView>
          </View>
        </View>
      )}

      {/* Crystal Info Modal */}
      {showCrystalInfoModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>How to Collect Crystals</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowCrystalInfoModal(false)}
              >
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalBody}>
              <View style={styles.instructionContainer}>
                <View style={styles.instructionNumber}>
                  <Text style={styles.instructionNumberText}>1</Text>
                </View>
                <Text style={styles.instructionText}>
                  Like chirps to earn 1 crystal each
                </Text>
              </View>
              
              <View style={styles.instructionContainer}>
                <View style={styles.instructionNumber}>
                  <Text style={styles.instructionNumberText}>2</Text>
                </View>
                <Text style={styles.instructionText}>
                  Comment on chirps to earn 2 crystals each
                </Text>
              </View>
            </ScrollView>
          </View>
        </View>
      )}

      {/* Pulled Card Modal */}
      {showPulledCard && pulledCard && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>You Got a New Profile!</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowPulledCard(false)}
              >
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.pulledCardContainer}>
              <ProfileFrame rarity={pulledCard.rarity} size={120}>
                <Image
                  source={typeof pulledCard.imageUrl === 'string' ? { uri: pulledCard.imageUrl } : pulledCard.imageUrl}
                  style={styles.pulledCardImage}
                />
              </ProfileFrame>
              <Text style={styles.pulledCardName}>{pulledCard.name}</Text>
              <Text style={styles.pulledCardHandle}>{pulledCard.handle}</Text>
              <Text style={[styles.pulledCardRarity, { color: rarityColors[pulledCard.rarity] }]}>
                {rarityNames[pulledCard.rarity]}
              </Text>
              <Text style={styles.pulledCardBio}>{pulledCard.bio}</Text>
              
              <TouchableOpacity
                style={styles.viewProfileButton}
                onPress={() => {
                  setShowPulledCard(false);
                  router.push(`/profile/${pulledCard.id}`);
                }}
              >
                <Text style={styles.viewProfileButtonText}>View Profile</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Multi-Card Results Modal */}
      {showPulledCards && pulledCards.length > 0 && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>10-Roll Results!</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowPulledCards(false)}
              >
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.multiCardContainer} showsVerticalScrollIndicator={false}>
              <Text style={styles.multiCardSubtitle}>You pulled {pulledCards.length} profiles!</Text>
              
              <View style={styles.cardsGrid}>
                {pulledCards.map((card, index) => (
                  <TouchableOpacity
                    key={`${card.id}-${index}`}
                    style={styles.cardItem}
                    onPress={() => {
                      setShowPulledCards(false);
                      setSelectedPhotocard(card);
                      setShowPhotocardProfile(true);
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={styles.cardImageContainer}>
                      <ProfileFrame rarity={card.rarity} size={80}>
                        <Image
                          source={typeof card.imageUrl === 'string' ? { uri: card.imageUrl } : card.imageUrl}
                          style={styles.cardImage}
                        />
                      </ProfileFrame>
                      <View style={[styles.rarityBadge, { backgroundColor: rarityColors[card.rarity] }]}>
                        <Text style={styles.rarityBadgeText}>{rarityNames[card.rarity]}</Text>
                      </View>
                    </View>
                    <Text style={styles.cardName} numberOfLines={1}>{card.name}</Text>
                    <Text style={styles.cardHandle} numberOfLines={1}>{card.handle}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              
              <TouchableOpacity
                style={styles.closeResultsButton}
                onPress={() => setShowPulledCards(false)}
              >
                <Text style={styles.closeResultsButtonText}>Close</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      )}

      {/* Photocard Profile Modal */}
      {showPhotocardProfile && selectedPhotocard && (
        <PhotocardProfileModal
          visible={showPhotocardProfile}
          photocard={selectedPhotocard as any}
          onClose={() => setShowPhotocardProfile(false)}
        />
      )}
    </ScrollView>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  helpButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#C671FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  helpButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  crystalBalanceContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  crystalBalanceCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: '#C671FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  crystalBalanceContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  crystalBalanceAmount: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#C671FF',
    marginLeft: 12,
    lineHeight: 56,
  },
  bannerContainer: {
    marginHorizontal: -150,
    width: width + 300,
    height: 500,
    alignSelf: 'center',
    position: 'relative',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },
  capsuleButtonsOverlay: {
    position: 'absolute',
    bottom: 50,
    left: 150,
    right: 150,
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 10,
    gap: 20,
  },
  openOneButton: {
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    minWidth: 120,
  },
  openTenButton: {
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    minWidth: 120,
  },
  buttonContent: {
    alignItems: 'center',
    width: '100%',
  },
  openOneText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  openTenText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  crystalCostContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  crystalCostText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    width: width - 40,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6b7280',
  },
  modalBody: {
    padding: 20,
  },
  instructionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  instructionNumber: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#C671FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  instructionNumberText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  instructionText: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
  },
  pulledCardContainer: {
    padding: 20,
    alignItems: 'center',
  },
  pulledCardImage: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
  },
  pulledCardName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  pulledCardHandle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 8,
  },
  pulledCardRarity: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  pulledCardBio: {
    fontSize: 14,
    color: '#374151',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  viewProfileButton: {
    backgroundColor: '#C671FF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  viewProfileButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Multi-card modal styles
  multiCardContainer: {
    padding: 20,
    maxHeight: '70%',
  },
  multiCardSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 20,
  },
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  cardItem: {
    width: '48%',
    marginBottom: 16,
    alignItems: 'center',
  },
  cardImageContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  cardImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  rarityBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    minWidth: 20,
    alignItems: 'center',
  },
  rarityBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  cardName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 2,
  },
  cardHandle: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  closeResultsButton: {
    backgroundColor: '#C671FF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    alignSelf: 'center',
    marginTop: 10,
  },
  closeResultsButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Loading animation styles
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  loadingGradient: {
    flex: 1,
    opacity: 0.9,
  },
  floatingIcon: {
    position: 'absolute',
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sparkle: {
    position: 'absolute',
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sparkleText: {
    fontSize: 20,
    textShadowColor: 'rgba(255, 255, 255, 0.8)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  loadingTextContainer: {
    position: 'absolute',
    bottom: '30%',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  loadingSubtext: {
    fontSize: 18,
    color: 'white',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});