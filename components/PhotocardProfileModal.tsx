import React from 'react';
import {
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import ProfileFrame from './ProfileFrame';

interface ProfileCard {
  id: string;
  name: string;
  handle: string;
  rarity: 'mythic' | 'legendary' | 'epic' | 'rare' | 'uncommon' | 'common';
  imageUrl?: any;
  bio: string;
  followers: number;
  profilePower: number;
  quantity: number; // Number of copies owned
  obtainedAt?: string;
}

interface PhotocardProfileModalProps {
  visible: boolean;
  photocard: ProfileCard | null;
  onClose: () => void;
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

export default function PhotocardProfileModal({ visible, photocard, onClose }: PhotocardProfileModalProps) {
  if (!photocard) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Photocard Profile</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Profile Card Display */}
          <View style={styles.profileCardContainer}>
            <View style={[styles.rarityBadge, { backgroundColor: rarityColors[photocard.rarity] }]}>
              <Text style={styles.rarityText}>{rarityNames[photocard.rarity]}</Text>
            </View>
            
            <ProfileFrame rarity={photocard.rarity} size={120}>
              {photocard.imageUrl ? (
                <Image source={photocard.imageUrl} style={styles.profileImage} />
              ) : (
                <View style={[styles.profileImagePlaceholder, { backgroundColor: rarityColors[photocard.rarity] }]}>
                  <Text style={styles.profileImageText}>{photocard.name.charAt(0)}</Text>
                </View>
              )}
            </ProfileFrame>
            
            <Text style={styles.profileName}>{photocard.name}</Text>
            <Text style={styles.profileHandle}>{photocard.handle}</Text>
            <Text style={styles.profileBio}>{photocard.bio}</Text>
          </View>

          {/* Stats Section */}
          <View style={styles.statsSection}>
            <Text style={styles.sectionTitle}>Profile Stats</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{(photocard.followers || 0).toLocaleString()}</Text>
                <Text style={styles.statLabel}>Followers</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{photocard.profilePower || 0}</Text>
                <Text style={styles.statLabel}>Power</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: rarityColors[photocard.rarity] }]}>
                  {photocard.quantity || 1}x
                </Text>
                <Text style={styles.statLabel}>Owned</Text>
              </View>
            </View>
          </View>

          {/* Collection Info */}
          <View style={styles.collectionSection}>
            <Text style={styles.sectionTitle}>Collection Info</Text>
            <View style={styles.collectionInfo}>
              <Text style={styles.collectionLabel}>Rarity:</Text>
              <View style={[styles.rarityChip, { backgroundColor: rarityColors[photocard.rarity] }]}>
                <Text style={styles.rarityChipText}>{rarityNames[photocard.rarity]}</Text>
              </View>
            </View>
            {photocard.obtainedAt && (
              <View style={styles.collectionInfo}>
                <Text style={styles.collectionLabel}>Obtained:</Text>
                <Text style={styles.collectionValue}>
                  {new Date(photocard.obtainedAt).toLocaleDateString()}
                </Text>
              </View>
            )}
          </View>

          {/* Description */}
          <View style={styles.descriptionSection}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.descriptionText}>{photocard.bio}</Text>
          </View>
        </ScrollView>
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
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: '#ffffff',
  },
  closeButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  closeButtonText: {
    fontSize: 16,
    color: '#7c3aed',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  placeholder: {
    width: 60,
  },
  content: {
    flex: 1,
  },
  profileCardContainer: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
    position: 'relative',
  },
  rarityBadge: {
    position: 'absolute',
    top: 20,
    right: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    zIndex: 1,
  },
  rarityText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
  },
  profileImagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileImageText: {
    color: '#ffffff',
    fontSize: 48,
    fontWeight: 'bold',
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
    textAlign: 'center',
  },
  profileHandle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 12,
    textAlign: 'center',
  },
  profileBio: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  statsSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  collectionSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  collectionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  collectionLabel: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
    marginRight: 12,
    minWidth: 80,
  },
  collectionValue: {
    fontSize: 16,
    color: '#1f2937',
  },
  rarityChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  rarityChipText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  descriptionSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  descriptionText: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
  },
});
