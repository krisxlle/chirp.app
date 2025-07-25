import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  StyleSheet,
  Alert,
  TextInput,
  ImageBackground
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import UserAvatar from './UserAvatar';
import ChirpCard from './ChirpCard';
import { useAuth } from './AuthContext';
import { getUserProfile, getUserChirps, getUserReplies, getUserStats, followUser, unfollowUser, blockUser, unblockUser, checkFollowStatus, updateUserProfile } from '../mobile-db';

interface ProfileModalProps {
  visible: boolean;
  userId: string | null;
  onClose: () => void;
}

export default function ProfileModal({ visible, userId, onClose }: ProfileModalProps) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [chirps, setChirps] = useState<any[]>([]);
  const [replies, setReplies] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'chirps' | 'replies'>('chirps');
  const [stats, setStats] = useState({
    chirps: 0,
    following: 0,
    followers: 0
  });
  const [followStatus, setFollowStatus] = useState({
    isFollowing: false,
    isBlocked: false,
    notificationsEnabled: false
  });
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [showAIPrompt, setShowAIPrompt] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const { user: currentUser } = useAuth();

  // Check if viewing own profile
  const isOwnProfile = currentUser?.id === userId;

  useEffect(() => {
    if (visible && userId) {
      fetchUserProfile();
    } else {
      // Reset state when modal closes
      setUser(null);
      setChirps([]);
      setReplies([]);
      setActiveTab('chirps');
      setLoading(true);
    }
  }, [visible, userId]);

  const fetchUserProfile = async () => {
    if (!userId) return;

    console.log('📥 Fetching profile data for user:', userId);
    try {
      setLoading(true);

      // Fetch user profile data
      const [profileData, chirpsData, repliesData, statsData, followData] = await Promise.all([
        getUserProfile(userId),
        getUserChirps(userId),
        getUserReplies(userId),
        getUserStats(userId),
        currentUser ? checkFollowStatus(userId) : null
      ]);

      console.log('✅ Profile data loaded:', {
        profile: !!profileData,
        chirps: chirpsData?.length || 0,
        replies: repliesData?.length || 0,
        stats: statsData
      });

      setUser(profileData);
      
      // Transform chirps data to match ChirpCard expected format
      const transformedChirps = (chirpsData || []).map((chirp: any) => ({
        ...chirp,
        author: {
          id: profileData.id,
          firstName: profileData.first_name || '',
          lastName: profileData.last_name || '',
          email: profileData.email,
          customHandle: profileData.custom_handle || profileData.handle,
          handle: profileData.handle,
          profileImageUrl: profileData.profile_image_url
        },
        replyCount: parseInt(chirp.reply_count) || 0,
        reactionCount: parseInt(chirp.reaction_count) || 0,
        repostCount: 0
      }));
      
      // Transform replies data to match ChirpCard expected format
      const transformedReplies = (repliesData || []).map((reply: any) => ({
        ...reply,
        author: {
          id: profileData.id,
          firstName: profileData.first_name || '',
          lastName: profileData.last_name || '',
          email: profileData.email,
          customHandle: profileData.custom_handle || profileData.handle,
          handle: profileData.handle,
          profileImageUrl: profileData.profile_image_url
        },
        replyCount: parseInt(reply.reply_count) || 0,
        reactionCount: parseInt(reply.reaction_count) || 0,
        repostCount: 0
      }));
      
      setChirps(transformedChirps);
      setReplies(transformedReplies);
      setStats(statsData || { chirps: 0, following: 0, followers: 0 });
      
      if (followData) {
        setFollowStatus(followData);
      }

    } catch (error) {
      console.error('❌ Error fetching profile:', error);
      Alert.alert('Error', 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!currentUser || !userId) return;

    try {
      if (followStatus.isFollowing) {
        await unfollowUser(currentUser.id, userId);
        setFollowStatus(prev => ({ ...prev, isFollowing: false }));
        setStats(prev => ({ ...prev, followers: prev.followers - 1 }));
      } else {
        await followUser(currentUser.id, userId);
        setFollowStatus(prev => ({ ...prev, isFollowing: true }));
        setStats(prev => ({ ...prev, followers: prev.followers + 1 }));
      }
    } catch (error) {
      console.error('Follow error:', error);
      Alert.alert('Error', 'Failed to update follow status');
    }
  };

  const handleBlock = async () => {
    if (!currentUser || !userId) return;

    try {
      if (followStatus.isBlocked) {
        await unblockUser(currentUser.id, userId);
        setFollowStatus(prev => ({ ...prev, isBlocked: false }));
      } else {
        await blockUser(currentUser.id, userId);
        setFollowStatus(prev => ({ ...prev, isBlocked: true, isFollowing: false }));
      }
    } catch (error) {
      console.error('Block error:', error);
      Alert.alert('Error', 'Failed to update block status');
    }
  };

  const handleAIProfile = () => {
    setShowAIPrompt(true);
    setAiPrompt('');
  };

  const generateProfile = async () => {
    if (!aiPrompt.trim()) {
      Alert.alert('Error', 'Please enter a description for your profile generation.');
      return;
    }

    if (!user?.id) {
      Alert.alert('Error', 'User not found. Please sign in again.');
      return;
    }

    try {
      setIsGenerating(true);
      console.log('Generating AI profile with prompt:', aiPrompt);
      
      // Import the AI generation function
      const { generateAIProfile } = await import('../mobile-ai');
      
      // Generate AI profile using direct OpenAI integration
      const result = await generateAIProfile(aiPrompt);
      
      if (!result.avatar && !result.banner) {
        throw new Error('AI profile generation returned no images');
      }
      
      // Update user profile in database with new images
      const updateData: any = {};
      
      if (result.avatar) {
        updateData.profileImageUrl = result.avatar;
      }
      if (result.banner) {
        updateData.bannerImageUrl = result.banner;
      }
      if (result.bio) {
        updateData.bio = result.bio;
      }
      
      // Update profile in database
      await updateUserProfile(user.id, updateData);
      
      setShowAIPrompt(false);
      setAiPrompt('');
      Alert.alert('Success!', 'Your AI profile has been generated and saved!');
      
      // Update local user state to show new images immediately
      setUser(prev => prev ? {
        ...prev,
        profile_image_url: result.avatar || prev.profile_image_url,
        banner_image_url: result.banner || prev.banner_image_url,
        bio: result.bio || prev.bio
      } : null);
      
    } catch (error) {
      console.error('Error generating AI profile:', error);
      Alert.alert('Error', `Profile generation failed: ${error.message}. Please try again.`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSettings = () => {
    // Close modal and navigate to settings
    onClose();
    // TODO: Navigate to settings page
    Alert.alert('Settings', 'Navigate to settings page');
  };

  if (!visible) return null;

  const displayName = user?.first_name || user?.last_name 
    ? `${user.first_name || ''} ${user.last_name || ''}`.trim() 
    : user?.custom_handle || user?.handle || 'User';

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
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
          <View style={styles.headerRight} />
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#7c3aed" />
            <Text style={styles.loadingText}>Loading profile...</Text>
          </View>
        ) : !user ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>User not found</Text>
            <TouchableOpacity style={styles.retryButton} onPress={onClose}>
              <Text style={styles.retryButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView style={styles.scrollView}>
            {/* Banner */}
            <View style={styles.bannerContainer}>
              <ImageBackground
                source={{ uri: user.banner_image_url || 'https://via.placeholder.com/400x200/7c3aed/ffffff' }}
                style={styles.banner}
                defaultSource={{ uri: 'https://via.placeholder.com/400x200/7c3aed/ffffff' }}
              >
                <View style={styles.bannerOverlay} />
              </ImageBackground>
              
              {/* Profile Avatar */}
              <View style={styles.avatarContainer}>
                <UserAvatar 
                  user={{
                    id: user.id,
                    firstName: user.first_name || '',
                    lastName: user.last_name || '',
                    email: user.email || '',
                    profileImageUrl: user.profile_image_url || undefined
                  }} 
                  size="xl" 
                />
              </View>
            </View>

            {/* User Info with Action Buttons */}
            <View style={styles.userInfo}>
              {/* Action Buttons positioned in white area */}
              <View style={styles.actionButtons}>
                {isOwnProfile ? (
                  // Show AI Profile and Settings buttons for own profile
                  <>
                    <TouchableOpacity onPress={handleAIProfile}>
                      <LinearGradient
                        colors={['#7c3aed', '#ec4899']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.generateProfileButton}
                      >
                        <Text style={styles.generateProfileButtonText}>Generate Profile</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                    
                    <TouchableOpacity style={styles.settingsButton} onPress={handleSettings}>
                      <Text style={styles.settingsIcon}>⚙️</Text>
                      <Text style={styles.settingsText}>Settings</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  // Show follow button and three dots menu for other users
                  <>
                    <TouchableOpacity 
                      style={[
                        styles.followButton, 
                        followStatus.isFollowing && styles.followingButton
                      ]} 
                      onPress={handleFollow}
                    >
                      <Text style={[
                        styles.followButtonText, 
                        followStatus.isFollowing && styles.followingButtonText
                      ]}>
                        {followStatus.isFollowing ? 'Following' : 'Follow'}
                      </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={styles.moreButton} 
                      onPress={() => setShowMoreOptions(!showMoreOptions)}
                    >
                      <Text style={styles.moreButtonText}>⋯</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
              
              <View style={styles.nameRow}>
                <Text style={styles.displayName}>{displayName}</Text>
                {user.is_chirp_plus && user.show_chirp_plus_badge && (
                  <Text style={styles.crownIcon}>👑</Text>
                )}
              </View>
              <Text style={styles.handle}>@{user.custom_handle || user.handle}</Text>
              
              {user.bio && (
                <Text style={styles.bio}>
                  {user.bio.split(/(@\w+)/).map((part, index) => {
                    if (part.startsWith('@')) {
                      return (
                        <TouchableOpacity 
                          key={index} 
                          onPress={() => Alert.alert('Mention Navigation', `Navigate to ${part}'s profile`)}
                        >
                          <Text style={styles.mentionText}>{part}</Text>
                        </TouchableOpacity>
                      );
                    }
                    return <Text key={index}>{part}</Text>;
                  })}
                </Text>
              )}
              
              <View style={styles.joinedRow}>
                <Text style={styles.calendarIcon}>📅</Text>
                <Text style={styles.joinedText}>Joined January 2025</Text>
              </View>
            </View>

            {/* Stats Row */}
            <View style={styles.statsRow}>
              <TouchableOpacity style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.following}</Text>
                <Text style={styles.statLabel}>Following</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.followers}</Text>
                <Text style={styles.statLabel}>Followers</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.chirps}</Text>
                <Text style={styles.statLabel}>Chirps</Text>
              </TouchableOpacity>
            </View>

            {/* Tabs */}
            <View style={styles.tabsContainer}>
              <TouchableOpacity 
                style={[styles.tab, activeTab === 'chirps' && styles.activeTab]} 
                onPress={() => setActiveTab('chirps')}
              >
                <Text style={[styles.tabText, activeTab === 'chirps' && styles.activeTabText]}>
                  Chirps
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.tab, activeTab === 'replies' && styles.activeTab]} 
                onPress={() => setActiveTab('replies')}
              >
                <Text style={[styles.tabText, activeTab === 'replies' && styles.activeTabText]}>
                  Replies
                </Text>
              </TouchableOpacity>
            </View>

            {/* Tab Content */}
            <View style={styles.tabContent}>
              {activeTab === 'chirps' && (
                <View style={styles.chirpsContainer}>
                  {chirps.length === 0 ? (
                    <View style={styles.emptyState}>
                      <Text style={styles.emptyStateText}>No chirps yet</Text>
                    </View>
                  ) : (
                    chirps.map((chirp: any, index: number) => (
                      <View key={chirp.id} style={[styles.chirpContainer, index > 0 && styles.chirpBorder]}>
                        <ChirpCard chirp={chirp} />
                      </View>
                    ))
                  )}
                </View>
              )}
              
              {activeTab === 'replies' && (
                <View style={styles.chirpsContainer}>
                  {replies.length === 0 ? (
                    <View style={styles.emptyState}>
                      <Text style={styles.emptyStateText}>No replies yet</Text>
                    </View>
                  ) : (
                    replies.map((reply: any, index: number) => (
                      <View key={reply.id} style={[styles.chirpContainer, index > 0 && styles.chirpBorder]}>
                        <ChirpCard chirp={reply} />
                      </View>
                    ))
                  )}
                </View>
              )}
            </View>
          </ScrollView>
        )}

        {/* AI Profile Generation Popup */}
        {showAIPrompt && (
          <View style={styles.promptOverlay}>
            <View style={styles.promptContainer}>
              <View style={styles.promptHeader}>
                <Text style={styles.promptTitle}>Generate AI Profile</Text>
                <TouchableOpacity
                  style={styles.promptCloseButton}
                  onPress={() => setShowAIPrompt(false)}
                >
                  <Text style={styles.promptCloseText}>✕</Text>
                </TouchableOpacity>
              </View>
              
              <Text style={styles.promptDescription}>
                Describe the style you want for your avatar and banner image:
              </Text>
              
              <TextInput
                style={styles.promptInput}
                placeholder="e.g., cartoon character with purple hair, aesthetic anime style, futuristic cyberpunk look..."
                placeholderTextColor="#657786"
                multiline
                numberOfLines={4}
                value={aiPrompt}
                onChangeText={setAiPrompt}
                maxLength={500}
              />
              
              <View style={styles.promptButtons}>
                <TouchableOpacity 
                  style={styles.cancelButton}
                  onPress={() => setShowAIPrompt(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.generateButtonContainer, isGenerating && styles.generateButtonDisabled]}
                  onPress={generateProfile}
                  disabled={isGenerating}
                >
                  <LinearGradient
                    colors={['#7c3aed', '#ec4899']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.generateButton}
                  >
                    <Text style={styles.generateButtonText}>
                      {isGenerating ? 'Generating...' : 'Generate'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
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
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  closeButton: {
    padding: 8,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: '#7c3aed',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  headerRight: {
    width: 44,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#ef4444',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#7c3aed',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  bannerContainer: {
    position: 'relative',
    height: 100, // Reduced by 50% from 200px
  },
  banner: {
    width: '100%',
    height: 100, // Reduced by 50% from 200px
  },
  bannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(124, 58, 237, 0.1)',
  },
  avatarContainer: {
    position: 'absolute',
    bottom: -40,
    left: 16,
    borderRadius: 44, // (80px avatar + 8px border) / 2 = 44px for perfect circle
    borderWidth: 4,
    borderColor: '#ffffff',
    width: 88, // 80px avatar + 8px border (4px each side)
    height: 88, // 80px avatar + 8px border (4px each side) 
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10, // Ensure avatar appears above banner
    elevation: 10, // For Android
  },
  userInfo: {
    paddingHorizontal: 16,
    paddingTop: 56, // Account for avatar overlap
    paddingBottom: 16,
    backgroundColor: '#ffffff',
  },
  profileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  profileInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  profileDetails: {
    marginLeft: 12,
    flex: 1,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  displayName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#14171a',
  },
  chirpPlusBadge: {
    backgroundColor: '#7c3aed',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: 8,
  },
  chirpPlusBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  handle: {
    fontSize: 15,
    color: '#657786',
    marginBottom: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 12,
    marginBottom: 16,
  },
  generateProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    height: 40,
  },
  generateProfileButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  settingsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    height: 40,
  },
  settingsIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  settingsText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '600',
  },
  moreButton: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  moreButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: 'bold',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  crownIcon: {
    fontSize: 16,
    marginLeft: 6,
  },
  bio: {
    fontSize: 15,
    color: '#14171a',
    lineHeight: 20,
    marginBottom: 8,
  },
  mentionText: {
    color: '#7c3aed',
  },
  joinedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  calendarIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  joinedText: {
    fontSize: 14,
    color: '#657786',
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e1e8ed',
  },
  followButton: {
    backgroundColor: '#7c3aed',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  followingButton: {
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  followButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  followingButtonText: {
    color: '#374151',
  },
  bioContainer: {
    marginBottom: 16,
  },
  bioText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#e5e7eb',
    marginHorizontal: 16,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#14171a',
  },
  statLabel: {
    fontSize: 12,
    color: '#657786',
    marginTop: 2,
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#7c3aed',
  },
  tabText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#7c3aed',
    fontWeight: 'bold',
  },
  tabContent: {
    flex: 1,
  },
  chirpsContainer: {
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6b7280',
  },
  chirpContainer: {
    marginBottom: 16,
  },
  chirpBorder: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 16,
  },
  // AI Prompt Modal Styles
  promptOverlay: {
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
  promptContainer: {
    backgroundColor: '#ffffff',
    margin: 20,
    borderRadius: 16,
    padding: 20,
    maxWidth: 400,
    width: '90%',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  promptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  promptTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#14171a',
  },
  promptCloseButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
  },
  promptCloseText: {
    fontSize: 16,
    color: '#657786',
    fontWeight: 'bold',
  },
  promptDescription: {
    fontSize: 14,
    color: '#657786',
    marginBottom: 12,
    lineHeight: 20,
  },
  promptInput: {
    backgroundColor: '#f7f9fa',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: '#14171a',
    textAlignVertical: 'top',
    minHeight: 80,
    borderWidth: 1,
    borderColor: '#e1e8ed',
    marginBottom: 20,
  },
  promptButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e1e8ed',
  },
  cancelButtonText: {
    color: '#657786',
    fontSize: 14,
    fontWeight: '600',
  },
  generateButtonContainer: {
    flex: 1,
  },
  generateButtonDisabled: {
    opacity: 0.6,
  },
  generateButton: {
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  generateButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});