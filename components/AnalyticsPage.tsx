import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getUserCollection } from '../lib/database/mobile-db-supabase';
import { useAuth } from './AuthContext';

interface ProfilePowerData {
  baseProfilePower: number;
  collectionBonus: number;
  totalProfilePower: number;
  rarityMultipliers: {
    mythic: number;
    legendary: number;
    epic: number;
    rare: number;
    uncommon: number;
    common: number;
  };
  collectionStats: {
    totalFrames: number;
    uniqueFrames: number;
    duplicateFrames: number;
    highestRarity: string;
    collectionValue: number;
  };
  powerBreakdown: Array<{
    rarity: string;
    count: number;
    powerContribution: number;
    percentage: number;
  }>;
  milestones: Array<{
    name: string;
    target: number;
    current: number;
    achieved: boolean;
    reward: string;
  }>;
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

interface AnalyticsPageProps {
  onClose: () => void;
}

export default function AnalyticsPage({ onClose }: AnalyticsPageProps) {
  const { user } = useAuth();
  const [profilePowerData, setProfilePowerData] = useState<ProfilePowerData>({
    baseProfilePower: 0,
    collectionBonus: 0,
    totalProfilePower: 0,
    rarityMultipliers: {
      mythic: 50,
      legendary: 25,
      epic: 15,
      rare: 10,
      uncommon: 5,
      common: 2,
    },
    collectionStats: {
      totalFrames: 0,
      uniqueFrames: 0,
      duplicateFrames: 0,
      highestRarity: 'common',
      collectionValue: 0,
    },
    powerBreakdown: [],
    milestones: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProfilePowerData();
  }, []);

  const loadProfilePowerData = async () => {
    try {
      setIsLoading(true);
      
      if (!user?.id) {
        console.log('No user ID available for profile power analytics');
        return;
      }

      // Load user's collection
      const collection = await getUserCollection(user.id);
      
      // Calculate profile power impact from collection
      const calculatedData = calculateProfilePowerImpact(collection, user);
      setProfilePowerData(calculatedData);
      
    } catch (error) {
      console.error('Error loading profile power data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateProfilePowerImpact = (collection: any[], user: any): ProfilePowerData => {
    // Base profile power from user stats
    const baseProfilePower = user.profilePower || 100;
    
    // Rarity multipliers for profile power bonus
    const rarityMultipliers = {
      mythic: 50,
      legendary: 25,
      epic: 15,
      rare: 10,
      uncommon: 5,
      common: 2,
    };

    // Calculate collection bonus
    let collectionBonus = 0;
    const rarityCounts = {
      mythic: 0,
      legendary: 0,
      epic: 0,
      rare: 0,
      uncommon: 0,
      common: 0,
    };

    collection.forEach(frame => {
      if (rarityCounts.hasOwnProperty(frame.rarity)) {
        rarityCounts[frame.rarity as keyof typeof rarityCounts]++;
        collectionBonus += rarityMultipliers[frame.rarity as keyof typeof rarityMultipliers];
      }
    });

    const totalProfilePower = baseProfilePower + collectionBonus;

    // Calculate collection stats
    const totalFrames = collection.reduce((sum, frame) => sum + (frame.quantity || 1), 0);
    const uniqueFrames = collection.length;
    const duplicateFrames = totalFrames - uniqueFrames;
    
    // Find highest rarity
    const rarityOrder = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic'];
    let highestRarity = 'common';
    for (const rarity of rarityOrder.reverse()) {
      if (rarityCounts[rarity as keyof typeof rarityCounts] > 0) {
        highestRarity = rarity;
        break;
      }
    }

    // Calculate collection value
    const rarityValues = { common: 50, uncommon: 100, rare: 200, epic: 400, legendary: 800, mythic: 1500 };
    const collectionValue = collection.reduce((sum, frame) => {
      return sum + ((rarityValues[frame.rarity as keyof typeof rarityValues] || 50) * (frame.quantity || 1));
    }, 0);

    // Calculate power breakdown
    const powerBreakdown = Object.entries(rarityCounts).map(([rarity, count]) => ({
      rarity,
      count: count as number,
      powerContribution: (count as number) * rarityMultipliers[rarity as keyof typeof rarityMultipliers],
      percentage: totalProfilePower > 0 ? (((count as number) * rarityMultipliers[rarity as keyof typeof rarityMultipliers]) / totalProfilePower) * 100 : 0,
    }));

    // Define milestones
    const milestones = [
      { name: 'First Frame', target: 1, current: uniqueFrames, achieved: uniqueFrames >= 1, reward: '+2 Profile Power' },
      { name: 'Rare Collector', target: 5, current: uniqueFrames, achieved: uniqueFrames >= 5, reward: '+10 Profile Power' },
      { name: 'Epic Hunter', target: 10, current: uniqueFrames, achieved: uniqueFrames >= 10, reward: '+25 Profile Power' },
      { name: 'Legendary Master', target: 20, current: uniqueFrames, achieved: uniqueFrames >= 20, reward: '+50 Profile Power' },
      { name: 'Mythic Legend', target: 50, current: uniqueFrames, achieved: uniqueFrames >= 50, reward: '+100 Profile Power' },
    ];

    return {
      baseProfilePower,
      collectionBonus,
      totalProfilePower,
      rarityMultipliers,
      collectionStats: {
        totalFrames,
        uniqueFrames,
        duplicateFrames,
        highestRarity,
        collectionValue,
      },
      powerBreakdown,
      milestones,
    };
  };

  const PowerCard = ({ title, value, subtitle, color = '#7c3aed', icon }: {
    title: string;
    value: string | number;
    subtitle?: string;
    color?: string;
    icon?: string;
  }) => (
    <View style={styles.powerCard}>
      {icon && <Text style={styles.powerCardIcon}>{icon}</Text>}
      <Text style={styles.powerCardTitle}>{title}</Text>
      <Text style={[styles.powerCardValue, { color }]}>{value}</Text>
      {subtitle && <Text style={styles.powerCardSubtitle}>{subtitle}</Text>}
    </View>
  );

  const PowerBar = ({ rarity, count, powerContribution, percentage }: {
    rarity: keyof typeof rarityColors;
    count: number;
    powerContribution: number;
    percentage: number;
  }) => (
    <View style={styles.powerBarContainer}>
      <View style={styles.powerBarHeader}>
        <View style={styles.powerBarInfo}>
          <View style={[styles.powerBarDot, { backgroundColor: rarityColors[rarity] }]} />
          <Text style={styles.powerBarLabel}>{rarityNames[rarity]}</Text>
          <Text style={styles.powerBarCount}>({count})</Text>
        </View>
        <Text style={styles.powerBarContribution}>+{powerContribution}</Text>
      </View>
      <View style={styles.powerBarBackground}>
        <View 
          style={[
            styles.powerBarFill, 
            { 
              backgroundColor: rarityColors[rarity],
              width: `${Math.min(percentage, 100)}%`
            }
          ]} 
        />
      </View>
    </View>
  );

  const MilestoneCard = ({ milestone }: { milestone: any }) => (
    <View style={[styles.milestoneCard, milestone.achieved && styles.milestoneCardAchieved]}>
      <View style={styles.milestoneHeader}>
        <Text style={[styles.milestoneName, milestone.achieved && styles.milestoneNameAchieved]}>
          {milestone.name}
        </Text>
        {milestone.achieved && <Text style={styles.milestoneCheckmark}>✓</Text>}
      </View>
      <Text style={styles.milestoneProgress}>
        {milestone.current}/{milestone.target} frames
      </Text>
      <Text style={styles.milestoneReward}>{milestone.reward}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onClose}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Profile Power Analytics</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Calculating profile power impact...</Text>
          </View>
        ) : (
          <>
            {/* Profile Power Overview */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Profile Power Impact</Text>
              <View style={styles.powerOverview}>
                <PowerCard 
                  title="Base Power" 
                  value={profilePowerData.baseProfilePower} 
                  subtitle="from profile stats"
                  color="#6b7280"
                  icon="⚡"
                />
                <PowerCard 
                  title="Collection Bonus" 
                  value={`+${profilePowerData.collectionBonus}`} 
                  subtitle="from frames"
                  color="#7c3aed"
                  icon="🎯"
                />
                <PowerCard 
                  title="Total Power" 
                  value={profilePowerData.totalProfilePower} 
                  subtitle="combined power"
                  color="#f59e0b"
                  icon="💪"
                />
              </View>
            </View>

            {/* Collection Stats */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Collection Statistics</Text>
              <View style={styles.statsGrid}>
                <PowerCard 
                  title="Total Frames" 
                  value={profilePowerData.collectionStats.totalFrames} 
                  subtitle="including duplicates"
                  color="#3b82f6"
                />
                <PowerCard 
                  title="Unique Frames" 
                  value={profilePowerData.collectionStats.uniqueFrames} 
                  subtitle="different frames"
                  color="#10b981"
                />
                <PowerCard 
                  title="Highest Rarity" 
                  value={rarityNames[profilePowerData.collectionStats.highestRarity as keyof typeof rarityNames]} 
                  subtitle="in collection"
                  color={rarityColors[profilePowerData.collectionStats.highestRarity as keyof typeof rarityColors]}
                />
                <PowerCard 
                  title="Collection Value" 
                  value={`${profilePowerData.collectionStats.collectionValue}`} 
                  subtitle="crystal value"
                  color="#f59e0b"
                />
              </View>
            </View>

            {/* Power Breakdown */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Power Contribution by Rarity</Text>
              <View style={styles.powerBreakdown}>
                {profilePowerData.powerBreakdown
                  .filter(item => item.count > 0)
                  .sort((a, b) => b.powerContribution - a.powerContribution)
                  .map((item) => (
                    <PowerBar 
                      key={item.rarity}
                      rarity={item.rarity as keyof typeof rarityColors}
                      count={item.count}
                      powerContribution={item.powerContribution}
                      percentage={item.percentage}
                    />
                  ))}
              </View>
            </View>

            {/* Milestones */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Collection Milestones</Text>
              <View style={styles.milestonesGrid}>
                {profilePowerData.milestones.map((milestone, index) => (
                  <MilestoneCard key={index} milestone={milestone} />
                ))}
              </View>
            </View>

            {/* Rarity Multipliers */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Power Multipliers</Text>
              <View style={styles.multipliersCard}>
                <Text style={styles.multipliersTitle}>Each frame adds this much power:</Text>
                <View style={styles.multipliersList}>
                  {Object.entries(profilePowerData.rarityMultipliers).map(([rarity, multiplier]) => (
                    <View key={rarity} style={styles.multiplierItem}>
                      <View style={[styles.multiplierDot, { backgroundColor: rarityColors[rarity as keyof typeof rarityColors] }]} />
                      <Text style={styles.multiplierLabel}>{rarityNames[rarity as keyof typeof rarityNames]}</Text>
                      <Text style={styles.multiplierValue}>+{multiplier}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  header: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e8ed',
    paddingBottom: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
  },
  backButtonText: {
    fontSize: 24,
    color: '#7c3aed',
    fontWeight: '600',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 16,
    backgroundColor: '#ffffff',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  powerOverview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  powerCard: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  powerCardIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  powerCardTitle: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
    marginBottom: 8,
    textAlign: 'center',
  },
  powerCardValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  powerCardSubtitle: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  powerBreakdown: {
    gap: 12,
  },
  powerBarContainer: {
    marginBottom: 8,
  },
  powerBarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  powerBarInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  powerBarDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  powerBarLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginRight: 4,
  },
  powerBarCount: {
    fontSize: 12,
    color: '#6b7280',
  },
  powerBarContribution: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  powerBarBackground: {
    height: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 4,
    overflow: 'hidden',
  },
  powerBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  milestonesGrid: {
    gap: 12,
  },
  milestoneCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  milestoneCardAchieved: {
    backgroundColor: '#f0fdf4',
    borderColor: '#10b981',
  },
  milestoneHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  milestoneName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  milestoneNameAchieved: {
    color: '#10b981',
  },
  milestoneCheckmark: {
    fontSize: 18,
    color: '#10b981',
    fontWeight: 'bold',
  },
  milestoneProgress: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  milestoneReward: {
    fontSize: 14,
    fontWeight: '500',
    color: '#7c3aed',
  },
  multipliersCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  multipliersTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  multipliersList: {
    gap: 12,
  },
  multiplierItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  multiplierDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  multiplierLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    flex: 1,
  },
  multiplierValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
  },
});