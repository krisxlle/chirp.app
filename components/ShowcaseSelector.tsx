import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  Image, 
  Alert,
  Modal,
  Dimensions 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from './AuthContext';
import { getUserCollection, updateUserShowcase } from '../lib/database/mobile-db-supabase';
import ProfileFrame from './ProfileFrame';
import BirdIcon from './icons/BirdIcon';

const { width: screenWidth } = Dimensions.get('window');

interface Profile {
  id: string;
  name: string;
  handle: string;
  bio: string;
  imageUrl?: string;
  rarity: string;
  quantity: number;
}

interface ShowcaseSelectorProps {
  visible: boolean;
  onClose: () => void;
  onShowcaseUpdated: () => void;
}

const rarityColors: { [key: string]: string } = {
  'common': '#9CA3AF',
  'uncommon': '#10B981', 
  'rare': '#3B82F6',
  'epic': '#8B5CF6',
  'legendary': '#F59E0B',
  'mythic': '#EF4444'
};

const rarityNames: { [key: string]: string } = {
  'common': 'Common',
  'uncommon': 'Uncommon',
  'rare': 'Rare', 
  'epic': 'Epic',
  'legendary': 'Legendary',
  'mythic': 'Mythic'
};

export default function ShowcaseSelector({ visible, onClose, onShowcaseUpdated }: ShowcaseSelectorProps) {
  const { user } = useAuth();
  const [collection, setCollection] = useState<Profile[]>([]);
  const [selectedProfiles, setSelectedProfiles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const MAX_SHOWCASE_PROFILES = 6;

  useEffect(() => {
    if (visible && user?.id) {
      loadCollection();
    }
  }, [visible, user?.id]);

  const loadCollection = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      const userCollection = await getUserCollection(user.id);
      setCollection(userCollection);
      
      // Pre-select profiles that are already in showcase
      const showcaseProfiles = userCollection
        .filter((profile: any) => profile.isShowcase)
        .sort((a: any, b: any) => (a.showcaseOrder || 0) - (b.showcaseOrder || 0))
        .map((profile: any) => profile.id);
      
      setSelectedProfiles(showcaseProfiles);
    } catch (error) {
      console.error('Error loading collection:', error);
      Alert.alert('Error', 'Failed to load your collection');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleProfileSelection = (profileId: string) => {
    setSelectedProfiles(prev => {
      if (prev.includes(profileId)) {
        return prev.filter(id => id !== profileId);
      } else if (prev.length < MAX_SHOWCASE_PROFILES) {
        return [...prev, profileId];
      } else {
        Alert.alert(
          'Maximum Reached', 
          `You can only showcase up to ${MAX_SHOWCASE_PROFILES} profiles. Remove one first to add another.`
        );
        return prev;
      }
    });
  };

  const handleSave = async () => {
    if (!user?.id) return;
    
    setIsSaving(true);
    try {
      const success = await updateUserShowcase(user.id, selectedProfiles);
      if (success) {
        Alert.alert('Success', 'Your showcase has been updated!');
        onShowcaseUpdated();
        onClose();
      } else {
        Alert.alert('Error', 'Failed to update showcase. Please try again.');
      }
    } catch (error) {
      console.error('Error updating showcase:', error);
      Alert.alert('Error', 'Failed to update showcase. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const renderProfileCard = (profile: Profile) => {
    const isSelected = selectedProfiles.includes(profile.id);
    const isDisabled = !isSelected && selectedProfiles.length >= MAX_SHOWCASE_PROFILES;
    
    return (
      <TouchableOpacity
        key={profile.id}
        style={[
          styles.profileCard,
          isSelected && styles.selectedCard,
          isDisabled && styles.disabledCard
        ]}
        onPress={() => toggleProfileSelection(profile.id)}
        disabled={isDisabled}
      >
        <View style={styles.cardHeader}>
          <View style={[styles.rarityBadge, { backgroundColor: rarityColors[profile.rarity] }]}>
            <Text style={styles.rarityText}>{rarityNames[profile.rarity]}</Text>
          </View>
          {isSelected && (
            <View style={styles.selectedBadge}>
              <Text style={styles.selectedText}>✓</Text>
            </View>
          )}
        </View>
        
        <ProfileFrame rarity={profile.rarity} size={50}>
          {profile.imageUrl ? (
            <Image 
              source={{ uri: profile.imageUrl }} 
              style={styles.profileImage} 
            />
          ) : (
            <View style={[styles.profileImagePlaceholder, { backgroundColor: rarityColors[profile.rarity] }]}>
              <Text style={styles.profileImageText}>{profile.name.charAt(0)}</Text>
            </View>
          )}
        </ProfileFrame>
        
        <Text style={styles.profileName} numberOfLines={1}>{profile.name}</Text>
        <Text style={styles.profileHandle} numberOfLines={1}>@{profile.handle}</Text>
        <Text style={styles.profileBio} numberOfLines={2}>{profile.bio}</Text>
        
        <View style={styles.quantityBadge}>
          <Text style={styles.quantityText}>x{profile.quantity}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <LinearGradient
          colors={['#C671FF', '#FF61A6', '#f5a5e0']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Select Showcase</Text>
            <TouchableOpacity 
              onPress={handleSave} 
              style={[styles.saveButton, isSaving && styles.savingButton]}
              disabled={isSaving}
            >
              <Text style={styles.saveButtonText}>
                {isSaving ? 'Saving...' : 'Save'}
              </Text>
            </TouchableOpacity>
          </View>
          
          <Text style={styles.headerSubtitle}>
            Choose up to {MAX_SHOWCASE_PROFILES} profiles to showcase ({selectedProfiles.length}/{MAX_SHOWCASE_PROFILES})
          </Text>
        </LinearGradient>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading your collection...</Text>
            </View>
          ) : collection.length === 0 ? (
            <View style={styles.emptyState}>
              <BirdIcon size={60} color="#7c3aed" />
              <Text style={styles.emptyTitle}>No Profiles Collected</Text>
              <Text style={styles.emptySubtext}>Open some gacha capsules to collect profiles for your showcase!</Text>
            </View>
          ) : (
            <View style={styles.profilesGrid}>
              {collection.map(renderProfileCard)}
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  savingButton: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'white',
    textAlign: 'center',
    opacity: 0.9,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#657786',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#657786',
    textAlign: 'center',
    lineHeight: 24,
  },
  profilesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  profileCard: {
    width: (screenWidth - 60) / 2,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedCard: {
    borderColor: '#7c3aed',
    shadowColor: '#7c3aed',
    shadowOpacity: 0.2,
  },
  disabledCard: {
    opacity: 0.5,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  rarityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  rarityText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  selectedBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#7c3aed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 25,
  },
  profileImagePlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileImageText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  profileName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 8,
    textAlign: 'center',
  },
  profileHandle: {
    fontSize: 12,
    color: '#657786',
    textAlign: 'center',
    marginBottom: 4,
  },
  profileBio: {
    fontSize: 11,
    color: '#657786',
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: 8,
  },
  quantityBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  quantityText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
});
