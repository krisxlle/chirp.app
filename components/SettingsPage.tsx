import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  Switch,
  Alert,
  ActivityIndicator 
} from 'react-native';
import UserAvatar from './UserAvatar';
import { useAuth } from './AuthContext';
import { updateUserProfile, cancelSubscription } from '../mobile-db';
import Svg, { Path } from 'react-native-svg';

interface SettingsPageProps {
  onClose: () => void;
}

// Custom Icon Components
const UserIcon = ({ size = 20, color = "#7c3aed" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path 
      d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" 
      stroke={color} 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
    <Path 
      d="M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" 
      fill={color}
    />
  </Svg>
);

const EditIcon = ({ size = 20, color = "#7c3aed" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path 
      d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" 
      stroke={color} 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
    <Path 
      d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" 
      stroke={color} 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </Svg>
);

const LinkIcon = ({ size = 20, color = "#7c3aed" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path 
      d="M9 17H7A5 5 0 0 1 7 7h2" 
      stroke={color} 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
    <Path 
      d="M15 7h2a5 5 0 1 1 0 10h-2" 
      stroke={color} 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
    <Path 
      d="M9 12h6" 
      stroke={color} 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </Svg>
);

const CrownIcon = ({ size = 20, color = "#7c3aed" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path 
      d="M2 20h20l-2-6-4 2-4-4-4 4-4-2-2 6z" 
      fill={color}
    />
    <Path 
      d="M6 14l4-4 4 4 4-2-2-6H4l2 6 4 2z" 
      fill={color}
    />
  </Svg>
);

export default function SettingsPage({ onClose }: SettingsPageProps) {
  const { user } = useAuth();
  
  // State for profile editing
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [linkInBio, setLinkInBio] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  const handleUpdateProfile = async () => {
    if (!user) return;
    
    setIsUpdating(true);
    try {
      const updatedUser = await updateUserProfile(user.id, {
        first_name: firstName,
        last_name: lastName,
        bio: bio,
        link_in_bio: linkInBio
      });
      
      // updateUser(updatedUser); // TODO: Add updateUser method to AuthContext
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!user?.isChirpPlus) return;
    
    Alert.alert(
      'Cancel Subscription',
      'Are you sure you want to cancel your Chirp+ subscription? You will lose access to premium features.',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              await cancelSubscription(user.id);
              // Update user state to reflect cancelled subscription
              // updateUser({ ...user, isChirpPlus: false }); // TODO: Add updateUser method to AuthContext
              Alert.alert('Subscription Cancelled', 'Your Chirp+ subscription has been cancelled.');
            } catch (error) {
              console.error('Error cancelling subscription:', error);
              Alert.alert('Error', 'Failed to cancel subscription. Please try again.');
            }
          }
        }
      ]
    );
  };

  const TabButton = ({ id, title, active }: { id: string; title: string; active: boolean }) => (
    <TouchableOpacity
      style={[styles.tabButton, active && styles.activeTabButton]}
      onPress={() => setActiveTab(id)}
    >
      <Text style={[styles.tabButtonText, active && styles.activeTabButtonText]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  const renderProfileTab = () => (
    <View style={styles.tabContent}>
      {/* Profile Name Section */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleContainer}>
            <UserIcon size={20} color="#7c3aed" />
            <Text style={styles.cardTitle}>Profile Name</Text>
          </View>
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.currentInfo}>
            Current name: {user?.firstName && user?.lastName 
              ? `${user.firstName} ${user.lastName}`
              : user?.customHandle || user?.handle || 'Not set'
            }
          </Text>
          
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>First Name</Text>
            <TextInput
              style={styles.textInput}
              value={firstName}
              onChangeText={setFirstName}
              placeholder="Enter your first name"
              placeholderTextColor="#9ca3af"
            />
          </View>
          
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Last Name</Text>
            <TextInput
              style={styles.textInput}
              value={lastName}
              onChangeText={setLastName}
              placeholder="Enter your last name"
              placeholderTextColor="#9ca3af"
            />
          </View>
          
          <TouchableOpacity
            style={[styles.updateButton, isUpdating && styles.disabledButton]}
            onPress={handleUpdateProfile}
            disabled={isUpdating}
          >
            {isUpdating ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text style={styles.updateButtonText}>Update Name</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Bio Section */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleContainer}>
            <EditIcon size={20} color="#7c3aed" />
            <Text style={styles.cardTitle}>Bio</Text>
          </View>
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.currentInfo}>
            Current bio: {user?.bio || 'No bio set'}
          </Text>
          
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Bio</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={bio}
              onChangeText={setBio}
              placeholder="Tell the world about yourself..."
              placeholderTextColor="#9ca3af"
              multiline
              numberOfLines={4}
            />
          </View>
        </View>
      </View>

      {/* Link in Bio Section */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleContainer}>
            <LinkIcon size={20} color="#7c3aed" />
            <Text style={styles.cardTitle}>Link in Bio</Text>
          </View>
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.currentInfo}>
            Current link: No link set
          </Text>
          
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Link URL</Text>
            <TextInput
              style={styles.textInput}
              value={linkInBio}
              onChangeText={setLinkInBio}
              placeholder="https://your-website.com"
              placeholderTextColor="#9ca3af"
              autoCapitalize="none"
              keyboardType="url"
            />
          </View>
        </View>
      </View>
    </View>
  );

  const renderChirpPlusTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleContainer}>
            <CrownIcon size={20} color="#7c3aed" />
            <Text style={styles.cardTitle}>Chirp+ Subscription</Text>
          </View>
        </View>
        <View style={styles.cardContent}>
          {user?.isChirpPlus ? (
            <View>
              <Text style={styles.subscriptionStatus}>✅ Active Chirp+ Member</Text>
              <Text style={styles.subscriptionBenefits}>
                You have access to premium features including unlimited AI generations and premium models.
              </Text>
              
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleCancelSubscription}
              >
                <Text style={styles.cancelButtonText}>Cancel Subscription</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View>
              <Text style={styles.subscriptionStatus}>❌ Not a Chirp+ Member</Text>
              <Text style={styles.subscriptionBenefits}>
                Upgrade to Chirp+ for unlimited AI generations, premium models, and exclusive features.
              </Text>
              
              <TouchableOpacity 
                style={styles.upgradeButton}
                onPress={() => {
                  // Navigate to subscription page
                  if (typeof window !== 'undefined' && window.location) {
                    // Browser environment
                    window.location.href = '/subscription';
                  } else {
                    // React Native environment
                    const { router } = require('expo-router');
                    router.push('/subscription');
                  }
                }}
              >
                <Text style={styles.upgradeButtonText}>Upgrade to Chirp+</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
      
      {/* Badge Visibility */}
      {user?.isChirpPlus && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>🏆 Badge Visibility</Text>
          </View>
          <View style={styles.cardContent}>
            <View style={styles.switchRow}>
              <View style={styles.switchTextContainer}>
                <Text style={styles.switchLabel}>Show Chirp+ Badge</Text>
                <Text style={styles.switchDescription}>
                  Display your premium status on your profile and posts
                </Text>
              </View>
              <Switch
                value={user?.showChirpPlusBadge !== false}
                onValueChange={(value) => {
                  // TODO: Implement badge visibility toggle
                  console.log('Toggle badge visibility:', value);
                }}
                trackColor={{ false: '#d1d5db', true: '#7c3aed' }}
                thumbColor="#ffffff"
              />
            </View>
          </View>
        </View>
      )}
    </View>
  );

  const renderAccountTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>🔐 Account</Text>
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.currentInfo}>
            Email: {user?.email}
          </Text>
          <Text style={styles.currentInfo}>
            Handle: @{user?.customHandle || user?.handle}
          </Text>
          
          <TouchableOpacity style={styles.signOutButton}>
            <Text style={styles.signOutButtonText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onClose}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerIcon}>⚙️</Text>
          <Text style={styles.headerTitle}>Settings</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsScrollView}>
          <TabButton id="profile" title="Profile" active={activeTab === 'profile'} />
          <TabButton id="chirpplus" title="Chirp+" active={activeTab === 'chirpplus'} />
          <TabButton id="account" title="Account" active={activeTab === 'account'} />
        </ScrollView>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'profile' && renderProfileTab()}
        {activeTab === 'chirpplus' && renderChirpPlusTab()}
        {activeTab === 'account' && renderAccountTab()}
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
  headerIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  headerSpacer: {
    width: 40,
  },
  tabsContainer: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e8ed',
    paddingVertical: 8,
  },
  tabsScrollView: {
    paddingHorizontal: 16,
  },
  tabButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: '#f7f9fa',
    borderWidth: 1,
    borderColor: '#e1e8ed',
  },
  activeTabButton: {
    backgroundColor: '#7c3aed',
    borderColor: '#7c3aed',
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#657786',
  },
  activeTabButtonText: {
    color: '#ffffff',
  },
  content: {
    flex: 1,
  },
  tabContent: {
    padding: 16,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  cardTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  cardContent: {
    padding: 16,
  },
  currentInfo: {
    fontSize: 14,
    color: '#657786',
    marginBottom: 16,
  },
  inputSection: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1a1a1a',
    backgroundColor: '#ffffff',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  updateButton: {
    backgroundColor: '#7c3aed',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  disabledButton: {
    backgroundColor: '#d1d5db',
  },
  updateButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  subscriptionStatus: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#1a1a1a',
  },
  subscriptionBenefits: {
    fontSize: 14,
    color: '#657786',
    lineHeight: 20,
    marginBottom: 16,
  },
  cancelButton: {
    backgroundColor: '#6b7280',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  upgradeButton: {
    backgroundColor: '#7c3aed',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  upgradeButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  switchTextContainer: {
    flex: 1,
    marginRight: 16,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  switchDescription: {
    fontSize: 14,
    color: '#657786',
    lineHeight: 18,
  },
  signOutButton: {
    backgroundColor: '#6b7280',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  signOutButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});