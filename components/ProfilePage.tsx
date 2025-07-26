import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  Image,
  ImageBackground,
  Alert,
  TextInput
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import UserAvatar from './UserAvatar';
import ChirpCard from './ChirpCard';
import ChirpPlusBadge from './ChirpPlusBadge';
import SettingsPage from './SettingsPage';
import { useAuth } from './AuthContext';
import { getChirpsFromDB } from '../mobile-db';

interface User {
  id: string;
  firstName?: string;
  email: string;
  customHandle?: string;
  handle?: string;
  profileImageUrl?: string;
  avatarUrl?: string;
  bannerImageUrl?: string;
  bio?: string;
  joinedAt?: string;
  // Chirp+ subscription fields
  isChirpPlus?: boolean;
  chirpPlusExpiresAt?: string;
  showChirpPlusBadge?: boolean;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
}

interface ProfileStats {
  following: number;
  followers: number;
  chirps: number;
  reactions: number;
}

export default function ProfilePage() {
  const { user: authUser } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'chirps' | 'replies' | 'reactions'>('chirps');
  const [userChirps, setUserChirps] = useState<any[]>([]);
  const [userReplies, setUserReplies] = useState<any[]>([]);
  const [stats, setStats] = useState<ProfileStats>({
    following: 1,
    followers: 1,
    chirps: 6,
    reactions: 3
  });

  const fetchUserChirps = async () => {
    try {
      if (!authUser?.id) return;
      
      console.log('Fetching chirps for user:', authUser.id);
      const { getChirpsByUserId } = await import('../mobile-db');
      const allChirps = await getChirpsByUserId(authUser.id);
      
      // Separate original chirps from replies
      const originalChirps = allChirps.filter(chirp => !chirp.replyToId);
      const replies = allChirps.filter(chirp => chirp.replyToId);
      
      setUserChirps(originalChirps);
      setUserReplies(replies);
      
      // Update stats based on actual data
      setStats(prev => ({
        ...prev,
        chirps: originalChirps.length
      }));
    } catch (error) {
      console.error('Error fetching user chirps:', error);
    }
  };

  useEffect(() => {
    // Use authenticated user data from AuthContext
    if (authUser) {
      setUser(authUser);
      fetchUserChirps();
    }
  }, [authUser]);

  const displayName = user?.firstName || user?.customHandle || user?.handle || 'User';

  const [showAIPrompt, setShowAIPrompt] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

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
      const { updateUserProfile } = await import('../mobile-db');
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
        ...updateData
      } : null);
      
    } catch (error) {
      console.error('Error generating AI profile:', error);
      Alert.alert('Error', `Profile generation failed: ${error.message}. Please try again.`);
    } finally {
      setIsGenerating(false);
    }
  };

  const [showSettings, setShowSettings] = useState(false);

  const handleSettings = () => {
    setShowSettings(true);
  };

  if (showSettings) {
    return <SettingsPage onClose={() => setShowSettings(false)} />;
  }

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => Alert.alert('Navigate', 'Go back to previous screen')}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>Profile</Text>
          <Text style={styles.headerSubtitle}>{stats.chirps} chirps</Text>
        </View>
      </View>

      {/* Banner */}
      <View style={styles.bannerContainer}>
        <ImageBackground
          source={{ uri: user.bannerImageUrl || 'https://via.placeholder.com/400x200/7c3aed/ffffff' }}
          style={styles.banner}
          defaultSource={{ uri: 'https://via.placeholder.com/400x200/7c3aed/ffffff' }}
        >
          <View style={styles.bannerOverlay} />
        </ImageBackground>
        
        {/* Profile Avatar */}
        <View style={styles.avatarContainer}>
          <UserAvatar user={user} size="xl" />
        </View>
      </View>

      {/* User Info with Action Buttons */}
      <View style={styles.userInfo}>
        {/* Action Buttons positioned in white area */}
        <View style={styles.actionButtons}>
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
          
          <TouchableOpacity style={styles.settingsButtonRounded} onPress={handleSettings}>
            <Text style={styles.settingsIcon}>⚙️</Text>
            <Text style={styles.settingsText}>Settings</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.nameRow}>
          <Text style={styles.displayName}>{displayName}</Text>
          {user.isChirpPlus && user.showChirpPlusBadge && (
            <ChirpPlusBadge size={18} />
          )}
        </View>
        <Text style={styles.handle}>@{user.customHandle || user.handle}</Text>
        <Text style={styles.bio}>
          {user.bio && user.bio.split(/(@\w+)/).map((part, index) => {
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
        
        <View style={styles.joinedRow}>
          <Text style={styles.calendarIcon}>📅</Text>
          <Text style={styles.joinedText}>Joined January 2025</Text>
        </View>
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <TouchableOpacity style={styles.statItem} onPress={() => Alert.alert('Following', 'Show list of people you follow')}>
          <Text style={styles.statNumber}>{stats.following}</Text>
          <Text style={styles.statLabel}>Following</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.statItem} onPress={() => Alert.alert('Followers', 'Show list of your followers')}>
          <Text style={styles.statNumber}>{stats.followers}</Text>
          <Text style={styles.statLabel}>Followers</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.statItem}>
          <Text style={styles.statNumber}>{stats.chirps}</Text>
          <Text style={styles.statLabel}>Chirps</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.statItem}>
          <Text style={styles.statNumber}>{stats.reactions}</Text>
          <Text style={styles.statLabel}>Reactions</Text>
        </TouchableOpacity>
      </View>

      {/* Weekly Summary Card */}
      <View style={styles.weeklySummaryCard}>
        <View style={styles.weeklySummaryHeader}>
          <Text style={styles.weeklySummaryIcon}>✨</Text>
          <Text style={styles.weeklySummaryTitle}>Weekly Summary</Text>
          <View style={styles.weeklySummaryDate}>
            <Text style={styles.summaryDateText}>Jul 12 - Jul 18</Text>
            <Text style={styles.nextUpdateText}>⏰ Next: 4d 0h 38m</Text>
          </View>
        </View>
        
        <Text style={styles.weeklySummaryContent}>
          This week the @chirp account posted **5 chirps** showcasing all the platform features! From welcome messages to thread demonstrations - giving **main character energy** with that premium Chirp+ flex 👑 Those reaction tutorials and hashtag tips? **Pure educational vibes** helping users master the app ✨ Official account but make it relatable
        </Text>

        {/* Analytics within Weekly Summary */}
        <View style={styles.analyticsContainer}>
          <View style={styles.analyticsRow}>
            <View style={styles.analyticItem}>
              <Text style={styles.analyticIcon}>📊</Text>
              <Text style={styles.analyticValue}>5</Text>
              <Text style={styles.analyticLabel}>Chirps Posted</Text>
            </View>
            
            <View style={styles.analyticItem}>
              <Text style={styles.analyticIcon}>✨</Text>
              <Text style={styles.analyticLabel}>Weekly Vibe</Text>
              <Text style={styles.analyticSubtitle}>Tech-Savvy Chaos</Text>
            </View>
          </View>

          <View style={styles.topChirpCard}>
            <Text style={styles.topChirpIcon}>🏆</Text>
            <Text style={styles.topChirpTitle}>Top Chirp</Text>
            <Text style={styles.topChirpContent}>
              "Welcome to Chirp! 🐤 This is the official preview account. Explore all the features and discover your authentic social voice."
            </Text>
          </View>

          <View style={styles.reactionsAnalytics}>
            <Text style={styles.reactionsTitle}>🔥 Top Reactions</Text>
            <View style={styles.reactionsRow}>
              <View style={styles.reactionItem}>
                <Text style={styles.reactionIcon}>🔥</Text>
                <Text style={styles.reactionCount}>1</Text>
              </View>
              <View style={styles.reactionItem}>
                <Text style={styles.reactionIcon}>👏</Text>
                <Text style={styles.reactionCount}>1</Text>
              </View>
              <View style={styles.reactionItem}>
                <Text style={styles.reactionIcon}>❤️</Text>
                <Text style={styles.reactionCount}>1</Text>
              </View>
            </View>
          </View>

          <View style={styles.commonWordsCard}>
            <Text style={styles.commonWordsTitle}>📈 Common Words</Text>
            <View style={styles.tagsContainer}>
              <Text style={styles.tag}>chirp</Text>
              <Text style={styles.tag}>features</Text>
              <Text style={styles.tag}>premium</Text>
              <Text style={styles.tag}>welcome</Text>
              <Text style={styles.tag}>reactions</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Profile Tabs */}
      <View style={styles.tabsContainer}>
        {(['chirps', 'replies', 'reactions'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {tab === 'chirps' ? 'Chirps' : tab === 'replies' ? 'Replies' : 'Reactions'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab Content */}
      <View style={styles.tabContent}>
        {activeTab === 'chirps' && (
          <View style={styles.chirpsContainer}>
            {userChirps.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>💬</Text>
                <Text style={styles.emptyTitle}>No chirps yet</Text>
                <Text style={styles.emptySubtext}>Your chirps will appear here</Text>
              </View>
            ) : (
              userChirps.map((chirp) => (
                <ChirpCard 
                  key={chirp.id} 
                  chirp={chirp} 
                  onDeleteSuccess={fetchUserChirps}
                />
              ))
            )}
          </View>
        )}
        
        {activeTab === 'replies' && (
          <View style={styles.repliesContainer}>
            {userReplies.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>↩️</Text>
                <Text style={styles.emptyTitle}>No replies yet</Text>
                <Text style={styles.emptySubtext}>Your replies will appear here</Text>
              </View>
            ) : (
              userReplies.map((reply) => (
                <ChirpCard 
                  key={reply.id} 
                  chirp={reply} 
                  onDeleteSuccess={fetchUserChirps}
                />
              ))
            )}
          </View>
        )}
        
        {activeTab === 'reactions' && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>❤️</Text>
            <Text style={styles.emptyTitle}>No reactions yet</Text>
            <Text style={styles.emptySubtext}>Posts you've reacted to will appear here</Text>
          </View>
        )}
      </View>
      
      {/* AI Prompt Overlay */}
      {showAIPrompt && (
        <View style={styles.promptOverlay}>
          <View style={styles.promptContainer}>
            <View style={styles.promptHeader}>
              <Text style={styles.promptTitle}>AI Profile Generation</Text>
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  loadingText: {
    fontSize: 16,
    color: '#657786',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e8ed',
  },
  backButton: {
    padding: 8,
    marginRight: 16,
  },
  backIcon: {
    fontSize: 20,
    color: '#14171a',
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#14171a',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#657786',
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
    bottom: -20, // Moved down from -40 to -20 (20px closer to banner)
    left: 16,
    borderRadius: 44, // (80px avatar + 8px border) / 2 = 44px for perfect circle
    borderWidth: 4,
    borderColor: '#ffffff',
    width: 88, // 80px avatar + 8px border (4px each side)
    height: 88, // 80px avatar + 8px border (4px each side) 
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 12,
    marginBottom: 16,
  },
  aiProfileButtonContainer: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    height: 40, // Fixed height for consistency
  },
  aiProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    height: 40, // Fixed height for consistency
  },
  aiProfileIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  aiProfileText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  settingsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e1e8ed',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    height: 40, // Fixed height for consistency
  },
  settingsIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  settingsText: {
    color: '#14171a',
    fontSize: 14,
    fontWeight: '600',
  },
  userInfo: {
    paddingHorizontal: 16,
    paddingTop: 20, // Reduced from 40 to 20 (moved buttons up by 20px)
    paddingBottom: 16,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  displayName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#14171a',
  },

  handle: {
    fontSize: 15,
    color: '#657786',
    marginTop: 2,
  },
  bio: {
    fontSize: 15,
    color: '#14171a',
    marginTop: 12,
    lineHeight: 24,
  },
  mentionText: {
    color: '#7c3aed',
    fontSize: 15,
  },
  joinedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  calendarIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  joinedText: {
    fontSize: 15,
    color: '#657786',
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e8ed',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#14171a',
  },
  statLabel: {
    fontSize: 13,
    color: '#657786',
    marginTop: 2,
  },
  weeklySummaryCard: {
    margin: 16,
    padding: 20,
    backgroundColor: '#f8f4ff',
    borderRadius: 16,
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  weeklySummaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  weeklySummaryIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  weeklySummaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#14171a',
    flex: 1,
  },
  weeklySummaryDate: {
    alignItems: 'flex-end',
  },
  summaryDateText: {
    fontSize: 12,
    color: '#657786',
  },
  nextUpdateText: {
    fontSize: 12,
    color: '#7c3aed',
    marginTop: 2,
  },
  weeklySummaryContent: {
    fontSize: 14,
    lineHeight: 20,
    color: '#14171a',
  },
  statsCards: {
    paddingHorizontal: 16,
  },
  statsRow2: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e1e8ed',
    marginBottom: 12,
  },
  statCardIcon: {
    fontSize: 16,
    marginBottom: 8,
  },
  statCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#657786',
    marginBottom: 4,
  },
  statCardValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#14171a',
  },
  statCardSubtitle: {
    fontSize: 14,
    color: '#14171a',
    fontWeight: '500',
  },
  statCardContent: {
    fontSize: 14,
    color: '#14171a',
    lineHeight: 18,
  },
  reactionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  reactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reactionIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  reactionCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#14171a',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#7c3aed',
    color: '#ffffff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: '500',
  },
  feedNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  checkmarkIcon: {
    fontSize: 14,
    color: '#10b981',
    marginRight: 8,
  },
  feedNoticeText: {
    fontSize: 14,
    color: '#657786',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e8ed',
    paddingHorizontal: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#d946ef',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#657786',
  },
  activeTabText: {
    color: '#d946ef',
    fontWeight: '600',
  },
  tabContent: {
    minHeight: 200,
    backgroundColor: '#ffffff',
  },
  emptyState: {
    paddingVertical: 48,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#14171a',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#657786',
    textAlign: 'center',
  },
  chirpsContainer: {
    paddingHorizontal: 8,
  },
  repliesContainer: {
    paddingHorizontal: 8,
  },
  analyticsContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e1e8ed',
  },
  analyticsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  analyticItem: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  analyticIcon: {
    fontSize: 16,
    marginBottom: 4,
  },
  analyticValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#14171a',
    marginBottom: 2,
  },
  analyticLabel: {
    fontSize: 12,
    color: '#657786',
    fontWeight: '500',
  },
  analyticSubtitle: {
    fontSize: 12,
    color: '#14171a',
    fontWeight: '500',
  },
  topChirpCard: {
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 12,
  },
  topChirpIcon: {
    fontSize: 16,
    marginBottom: 4,
  },
  topChirpTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#657786',
    marginBottom: 4,
  },
  topChirpContent: {
    fontSize: 14,
    color: '#14171a',
    lineHeight: 18,
  },
  reactionsAnalytics: {
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 12,
  },
  reactionsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#657786',
    marginBottom: 8,
  },
  commonWordsCard: {
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  commonWordsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#657786',
    marginBottom: 8,
  },
  promptOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  promptContainer: {
    backgroundColor: '#ffffff',
    margin: 20,
    borderRadius: 20,
    padding: 24,
    maxWidth: 400,
    width: '90%',
  },
  promptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  promptTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#14171a',
  },
  promptCloseButton: {
    padding: 8,
  },
  promptCloseText: {
    fontSize: 20,
    color: '#657786',
    fontWeight: 'bold',
  },
  promptDescription: {
    fontSize: 16,
    color: '#14171a',
    marginBottom: 16,
    textAlign: 'center',
  },
  promptInput: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#14171a',
    textAlignVertical: 'top',
    minHeight: 100,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e1e8ed',
  },
  promptButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#657786',
    fontWeight: '600',
    fontSize: 16,
  },
  generateButtonContainer: {
    flex: 1,
    borderRadius: 25,
  },
  generateButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  generateButtonDisabled: {
    backgroundColor: '#b8b8b8',
  },
  generateButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
  },
  generateProfileButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  generateProfileButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },
  settingsButtonRounded: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e1e8ed',
    marginLeft: 8,
  },
});