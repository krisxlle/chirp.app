import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from './AuthContext';
import ChirpCrystalIcon from './icons/ChirpCrystalIcon';

interface AnalyticsData {
  totalProfiles: number;
  totalValue: number;
  averageRarity: number;
  completionRate: number;
  rarityBreakdown: {
    mythic: number;
    legendary: number;
    epic: number;
    rare: number;
    uncommon: number;
    common: number;
  };
  recentAcquisitions: Array<{
    name: string;
    rarity: string;
    date: string;
  }>;
  crystalStats: {
    totalEarned: number;
    totalSpent: number;
    currentBalance: number;
    rollsPerformed: number;
  };
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
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalProfiles: 8,
    totalValue: 1250,
    averageRarity: 3.2,
    completionRate: 45,
    rarityBreakdown: {
      mythic: 1,
      legendary: 2,
      epic: 2,
      rare: 1,
      uncommon: 1,
      common: 1,
    },
    recentAcquisitions: [
      { name: 'Cyber Ninja', rarity: 'mythic', date: '2025-01-15' },
      { name: 'Forest Guardian', rarity: 'legendary', date: '2025-01-14' },
      { name: 'Space Explorer', rarity: 'epic', date: '2025-01-13' },
    ],
    crystalStats: {
      totalEarned: 2500,
      totalSpent: 1200,
      currentBalance: 1300,
      rollsPerformed: 12,
    },
  });

  const StatCard = ({ title, value, subtitle, color = '#7c3aed' }: {
    title: string;
    value: string | number;
    subtitle?: string;
    color?: string;
  }) => (
    <View style={styles.statCard}>
      <Text style={styles.statTitle}>{title}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
    </View>
  );

  const RarityBar = ({ rarity, count, total }: {
    rarity: keyof typeof rarityColors;
    count: number;
    total: number;
  }) => {
    const percentage = total > 0 ? (count / total) * 100 : 0;
    
    return (
      <View style={styles.rarityBarContainer}>
        <View style={styles.rarityBarHeader}>
          <View style={styles.rarityInfo}>
            <View style={[styles.rarityDot, { backgroundColor: rarityColors[rarity] }]} />
            <Text style={styles.rarityLabel}>{rarityNames[rarity]}</Text>
          </View>
          <Text style={styles.rarityCount}>{count}</Text>
        </View>
        <View style={styles.rarityBarBackground}>
          <View 
            style={[
              styles.rarityBarFill, 
              { 
                backgroundColor: rarityColors[rarity],
                width: `${percentage}%`
              }
            ]} 
          />
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onClose}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Analytics</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Overview Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Collection Overview</Text>
          <View style={styles.statsGrid}>
                         <StatCard 
               title="Total Profiles" 
               value={analytics.totalProfiles} 
               subtitle="from capsules"
             />
            <StatCard 
              title="Collection Value" 
              value={`${analytics.totalValue}`} 
              subtitle="crystal value"
              color="#f59e0b"
            />
            <StatCard 
              title="Avg Rarity" 
              value={analytics.averageRarity.toFixed(1)} 
              subtitle="out of 6"
              color="#8b5cf6"
            />
            <StatCard 
              title="Completion" 
              value={`${analytics.completionRate}%`} 
              subtitle="of all profiles"
              color="#10b981"
            />
          </View>
        </View>

        {/* Rarity Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Rarity Distribution</Text>
          <View style={styles.rarityBreakdown}>
            {Object.entries(analytics.rarityBreakdown).map(([rarity, count]) => (
              <RarityBar 
                key={rarity}
                rarity={rarity as keyof typeof rarityColors}
                count={count}
                total={analytics.totalProfiles}
              />
            ))}
          </View>
        </View>

        {/* Crystal Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Crystal Statistics</Text>
          <View style={styles.crystalStatsCard}>
            <View style={styles.crystalStatsHeader}>
              <ChirpCrystalIcon size={24} color="#7c3aed" />
              <Text style={styles.crystalStatsTitle}>Crystal Activity</Text>
            </View>
            <View style={styles.crystalStatsGrid}>
              <View style={styles.crystalStatItem}>
                <Text style={styles.crystalStatLabel}>Total Earned</Text>
                <Text style={styles.crystalStatValue}>{analytics.crystalStats.totalEarned}</Text>
              </View>
              <View style={styles.crystalStatItem}>
                <Text style={styles.crystalStatLabel}>Total Spent</Text>
                <Text style={styles.crystalStatValue}>{analytics.crystalStats.totalSpent}</Text>
              </View>
              <View style={styles.crystalStatItem}>
                <Text style={styles.crystalStatLabel}>Current Balance</Text>
                <Text style={styles.crystalStatValue}>{analytics.crystalStats.currentBalance}</Text>
              </View>
                             <View style={styles.crystalStatItem}>
                 <Text style={styles.crystalStatLabel}>Capsules Opened</Text>
                 <Text style={styles.crystalStatValue}>{analytics.crystalStats.rollsPerformed}</Text>
               </View>
            </View>
          </View>
        </View>

                 {/* Recent Acquisitions */}
         <View style={styles.section}>
           <Text style={styles.sectionTitle}>Recent Capsule Openings</Text>
          <View style={styles.recentAcquisitions}>
            {analytics.recentAcquisitions.map((acquisition, index) => (
              <View key={index} style={styles.acquisitionItem}>
                <View style={styles.acquisitionInfo}>
                  <Text style={styles.acquisitionName}>{acquisition.name}</Text>
                  <Text style={styles.acquisitionDate}>
                    {new Date(acquisition.date).toLocaleDateString()}
                  </Text>
                </View>
                <View style={[
                  styles.acquisitionRarity, 
                  { backgroundColor: rarityColors[acquisition.rarity as keyof typeof rarityColors] }
                ]}>
                  <Text style={styles.acquisitionRarityText}>
                    {rarityNames[acquisition.rarity as keyof typeof rarityNames]}
                  </Text>
                </View>
              </View>
            ))}
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
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e8ed',
    paddingTop: 12,
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  statTitle: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
    marginBottom: 8,
    textAlign: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statSubtitle: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'center',
  },
  rarityBreakdown: {
    gap: 12,
  },
  rarityBarContainer: {
    marginBottom: 8,
  },
  rarityBarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  rarityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rarityDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  rarityLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  rarityCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  rarityBarBackground: {
    height: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 4,
    overflow: 'hidden',
  },
  rarityBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  crystalStatsCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  crystalStatsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  crystalStatsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginLeft: 8,
  },
  crystalStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  crystalStatItem: {
    width: '48%',
    marginBottom: 12,
  },
  crystalStatLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
  },
  crystalStatValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  recentAcquisitions: {
    gap: 12,
  },
  acquisitionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  acquisitionInfo: {
    flex: 1,
  },
  acquisitionName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  acquisitionDate: {
    fontSize: 14,
    color: '#64748b',
  },
  acquisitionRarity: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  acquisitionRarityText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
});
