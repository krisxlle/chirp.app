import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { getProfilePowerBreakdown, getUserProfile, getUserStats, updateUserProfile, uploadBannerImage, uploadProfileImage } from '../lib/database/mobile-db-supabase';
import { useAuth } from './AuthContext';
import GearIcon from './icons/GearIcon';
import UserAvatar from './UserAvatar';

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

// Replaced with consistent ChirpPlusBadge component

const LogOutIcon = ({ size = 20, color = "#9ca3af" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path 
      d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" 
      stroke={color} 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
    <Path 
      d="M16 17l5-5-5-5" 
      stroke={color} 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
    <Path 
      d="M21 12H9" 
      stroke={color} 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </Svg>
);

const SupportIcon = ({ size = 20, color = "#7c3aed" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path 
      d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" 
      stroke={color} 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </Svg>
);

const LegalIcon = ({ size = 20, color = "#7c3aed" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path 
      d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" 
      stroke={color} 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
    <Path 
      d="M14 2v6h6" 
      stroke={color} 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
    <Path 
      d="M16 13H8" 
      stroke={color} 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
    <Path 
      d="M16 17H8" 
      stroke={color} 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
    <Path 
      d="M10 9H8" 
      stroke={color} 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </Svg>
);

const CameraIcon = ({ size = 20, color = "#7c3aed" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path 
      d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" 
      stroke={color} 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
    <Path 
      d="M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" 
      stroke={color} 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </Svg>
);

const BannerIcon = ({ size = 20, color = "#7c3aed" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path 
      d="M3 3h18v18H3z" 
      stroke={color} 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
    <Path 
      d="M3 9h18" 
      stroke={color} 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
    <Path 
      d="M9 21V9" 
      stroke={color} 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </Svg>
);

export default function SettingsPage({ onClose }: SettingsPageProps) {
  const { user, signOut, updateUser } = useAuth();
  const router = useRouter();
  
  // State for profile editing
  const [firstName, setFirstName] = useState(user?.firstName || '');
  // lastName functionality removed per user request
  const [bio, setBio] = useState(user?.bio || '');
  const [linkInBio, setLinkInBio] = useState(user?.linkInBio || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [analyticsData, setAnalyticsData] = useState({
    profilePower: 0,
    totalChirps: 0,
    totalLikes: 0,
    totalComments: 0,
    followers: 0,
    following: 0,
    accountAge: 0,
    engagementRate: 0,
    topChirp: null as any,
    recentActivity: [] as any[],
    powerBreakdown: {
      likesContribution: 0,
      commentsContribution: 0,
      collectionContribution: 0,
      rarityFactor: 1
    }
  });
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [selectedBannerImage, setSelectedBannerImage] = useState<string | null>(null);
  const [isUploadingBannerImage, setIsUploadingBannerImage] = useState(false);

  // Load analytics data when analytics tab is selected
  useEffect(() => {
    if (activeTab === 'analytics') {
      loadAnalyticsData();
    }
  }, [activeTab]);

  const pickImage = async () => {
    try {
      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant permission to access your photo library.');
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
        // Automatically trigger upload after image selection
        await handleUploadProfileImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const pickBannerImage = async () => {
    try {
      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant permission to access your photo library.');
        return;
      }

      // Launch image picker for banner (wider aspect ratio)
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [3, 1], // Banner aspect ratio - 3:1 for wide banner display
        quality: 0.8,
        presentationStyle: ImagePicker.UIImagePickerPresentationStyle.FULL_SCREEN,
        allowsMultipleSelection: false,
        base64: false,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedBannerImage(result.assets[0].uri);
        // Automatically trigger upload after banner image selection
        await handleBannerImageUpload(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking banner image:', error);
      Alert.alert('Error', 'Failed to pick banner image. Please try again.');
    }
  };

  const handleUploadProfileImage = async (imageUri?: string) => {
    const uriToUpload = imageUri || selectedImage;
    if (!uriToUpload || !user) return;

    setIsUploadingImage(true);
    try {
      console.log('Starting profile image upload for user:', user.id);
      console.log('User object:', {
        id: user.id,
        handle: user.handle,
        customHandle: user.customHandle,
        email: user.email,
        profileImageUrl: user.profileImageUrl ? 'has image' : 'no image'
      });
      
      // Validate user ID
      if (!user.id || typeof user.id !== 'string') {
        throw new Error('Invalid user ID');
      }
      
      // Upload image to Supabase storage
      const imageUrl = await uploadProfileImage(user.id, uriToUpload);
      
      if (!imageUrl) {
        throw new Error('Failed to get image URL from upload');
      }
      
      console.log('Image uploaded successfully, updating profile with URL:', imageUrl ? 'success' : 'failed');
      
      // Update user profile with new image URL
      await updateUserProfile(user.id, {
        profile_image_url: imageUrl
      });
      
      // Update the user data in AuthContext to reflect the new profile image
      if (updateUser && typeof updateUser === 'function') {
        await updateUser({
          profileImageUrl: imageUrl,
          avatarUrl: imageUrl
        });
      } else {
        console.error('updateUser is not a function:', typeof updateUser, updateUser);
        throw new Error('updateUser function is not available');
      }
      
      Alert.alert('Success', 'Profile picture updated successfully!');
      setSelectedImage(null);
    } catch (error) {
      console.error('Error uploading profile image:', error);
      Alert.alert('Error', `Failed to upload profile image: ${error.message}`);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleBannerImageUpload = async (imageUri?: string) => {
    const uriToUpload = imageUri || selectedBannerImage;
    if (!uriToUpload || !user) return;

    setIsUploadingBannerImage(true);
    try {
      console.log('Starting banner image upload for user:', user.id);
      
      // Validate user ID
      if (!user.id || typeof user.id !== 'string') {
        throw new Error('Invalid user ID');
      }
      
      // Upload image to Supabase storage
      const imageUrl = await uploadBannerImage(user.id, uriToUpload);
      
      if (!imageUrl) {
        throw new Error('Failed to get banner image URL from upload');
      }
      
      console.log('Banner image uploaded successfully, updating profile with URL:', imageUrl ? 'success' : 'failed');
      
      // Update user profile with new banner image URL
      await updateUserProfile(user.id, {
        banner_image_url: imageUrl
      });
      
      // Update the user data in AuthContext to reflect the new banner image
      if (updateUser && typeof updateUser === 'function') {
        await updateUser({
          bannerImageUrl: imageUrl
        });
      } else {
        console.error('updateUser is not a function:', typeof updateUser, updateUser);
        throw new Error('updateUser function is not available');
      }
      
      Alert.alert('Success', 'Profile banner updated successfully!');
      setSelectedBannerImage(null);
    } catch (error) {
      console.error('Error uploading banner image:', error);
      Alert.alert('Error', `Failed to upload banner image: ${error.message}`);
    } finally {
      setIsUploadingBannerImage(false);
    }
  };

  const handleUpdateName = async () => {
    if (!user) return;
    
    setIsUpdating(true);
    try {
      // Update name in database
      await updateUserProfile(user.id, {
        first_name: firstName,
      });
      
      // Update the user data in AuthContext to reflect the name change
      if (updateUser && typeof updateUser === 'function') {
        await updateUser({
          firstName: firstName,
        });
      } else {
        console.error('updateUser is not a function:', typeof updateUser, updateUser);
        throw new Error('updateUser function is not available');
      }
      
      Alert.alert('Success', 'Name updated successfully!');
    } catch (error) {
      console.error('Error updating name:', error);
      Alert.alert('Error', 'Failed to update name. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!user) return;
    
    setIsUpdating(true);
    try {
      const updatedUser = await updateUserProfile(user.id, {
        first_name: firstName,
        // last_name field removed per user request
        bio: bio,
        link_in_bio: linkInBio
      });
      
      // Update the user data in AuthContext to reflect the changes
      if (updateUser && typeof updateUser === 'function') {
        await updateUser({
          firstName: firstName,
          bio: bio,
          linkInBio: linkInBio
        });
      } else {
        console.error('updateUser is not a function:', typeof updateUser, updateUser);
        throw new Error('updateUser function is not available');
      }
      
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const loadAnalyticsData = async () => {
    if (!user?.id) return;
    
    try {
      setIsLoadingAnalytics(true);
      
      // Load user stats, profile power breakdown, and user profile
      // Force refresh profile power to ensure latest calculation
      const [userStats, powerBreakdown, userProfile] = await Promise.all([
        getUserStats(user.id),
        getProfilePowerBreakdown(user.id, true), // Force refresh
        getUserProfile(user.id)
      ]);
      
      // Calculate account age using the correct creation date from database
      const accountAge = userProfile?.joinedAt ? 
        Math.floor((Date.now() - new Date(userProfile.joinedAt).getTime()) / (1000 * 60 * 60 * 24)) : 0;
      
      // Calculate engagement rate (likes + comments per chirp)
      const engagementRate = userStats.chirps > 0 ? 
        ((userStats.likes + userStats.followers) / userStats.chirps) : 0;
      
      setAnalyticsData({
        profilePower: powerBreakdown.totalPower,
        totalChirps: userStats.chirps,
        totalLikes: powerBreakdown.totalLikes,
        totalComments: powerBreakdown.totalComments,
        followers: userStats.followers,
        following: userStats.following,
        accountAge,
        engagementRate,
        topChirp: null, // Could be implemented later
        recentActivity: [], // Could be implemented later
        powerBreakdown: {
          likesContribution: powerBreakdown.likesContribution,
          commentsContribution: powerBreakdown.commentsContribution,
          collectionContribution: powerBreakdown.collectionContribution,
          rarityFactor: powerBreakdown.rarityFactor
        }
      });
      
    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setIsLoadingAnalytics(false);
    }
  };

  const TabButton = ({ id, title, active }: { id: string; title: string; active: boolean }) => (
    <TouchableOpacity
      style={styles.tabButton}
      onPress={() => setActiveTab(id)}
    >
      {active ? (
        <LinearGradient
          colors={['#7c3aed', '#ec4899']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.activeTabButton}
        >
          <Text style={[styles.tabButtonText, styles.activeTabButtonText]}>
            {title}
          </Text>
        </LinearGradient>
      ) : (
        <Text style={styles.tabButtonText}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );

  const renderProfileTab = () => (
    <View style={styles.tabContent}>
      {/* Profile Picture Section */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleContainer}>
            <CameraIcon size={20} color="#7c3aed" />
            <Text style={styles.cardTitle}>Profile Picture</Text>
          </View>
        </View>
        <View style={styles.cardContent}>
          <View style={styles.profilePictureContainer}>
            <View style={styles.currentPictureContainer}>
              <UserAvatar 
                user={{ 
                  ...user, 
                  profileImageUrl: selectedImage || user?.profileImageUrl 
                }} 
                size="xl" 
              />
              <Text style={styles.currentInfo}>
                Current profile picture
              </Text>
            </View>
            
            <View style={styles.uploadSection}>
              <TouchableOpacity
                style={styles.uploadButton}
                onPress={pickImage}
                disabled={isUploadingImage}
              >
                <CameraIcon size={16} color="#7c3aed" />
                <Text style={styles.uploadButtonText}>Upload Photo</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      {/* Profile Banner Section */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleContainer}>
            <BannerIcon size={20} color="#7c3aed" />
            <Text style={styles.cardTitle}>Profile Banner</Text>
          </View>
        </View>
        <View style={styles.cardContent}>
          <View style={styles.bannerContainer}>
            <View style={styles.currentBannerContainer}>
              <View style={styles.bannerPreview}>
                {selectedBannerImage ? (
                  <Image 
                    source={{ uri: selectedBannerImage }} 
                    style={styles.bannerPreviewImage}
                    resizeMode="cover"
                  />
                ) : user?.bannerImageUrl ? (
                  <Image 
                    source={{ uri: user.bannerImageUrl }} 
                    style={styles.bannerPreviewImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.bannerPlaceholder}>
                    <BannerIcon size={32} color="#9ca3af" />
                    <Text style={styles.bannerPlaceholderText}>No banner set</Text>
                  </View>
                )}
              </View>
              <Text style={styles.currentInfo}>
                Current profile banner
              </Text>
            </View>
            
                         <View style={styles.uploadSection}>
               <TouchableOpacity
                 style={styles.uploadButton}
                 onPress={pickBannerImage}
                 disabled={isUploadingBannerImage}
               >
                 <BannerIcon size={16} color="#7c3aed" />
                 <Text style={styles.uploadButtonText}>Upload Banner</Text>
               </TouchableOpacity>
               
               
             </View>
          </View>
        </View>
      </View>

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
            Current name: {user?.firstName || user?.customHandle || user?.handle || 'Not set'}
          </Text>
          
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Display Name</Text>
            <TextInput
              style={styles.textInput}
              value={firstName}
              onChangeText={setFirstName}
              placeholder="Enter your display name"
              placeholderTextColor="#9ca3af"
            />
          </View>
          
          {/* Last Name input removed per user request */}
          
                     <TouchableOpacity
             onPress={handleUpdateName}
             disabled={isUpdating}
           >
            <LinearGradient
              colors={['#7c3aed', '#ec4899']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.updateButton, isUpdating && styles.disabledButton]}
            >
              {isUpdating ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <Text style={styles.updateButtonText}>Update Name</Text>
              )}
            </LinearGradient>
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
           
           <TouchableOpacity
             onPress={handleUpdateProfile}
             disabled={isUpdating}
           >
             <LinearGradient
               colors={['#7c3aed', '#ec4899']}
               start={{ x: 0, y: 0 }}
               end={{ x: 1, y: 0 }}
               style={[styles.updateButton, isUpdating && styles.disabledButton]}
             >
               {isUpdating ? (
                 <ActivityIndicator color="#ffffff" size="small" />
               ) : (
                 <Text style={styles.updateButtonText}>Update Bio</Text>
               )}
             </LinearGradient>
           </TouchableOpacity>
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
            Current link: {user?.linkInBio || 'No link set'}
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
           
           <TouchableOpacity
             onPress={handleUpdateProfile}
             disabled={isUpdating}
           >
             <LinearGradient
               colors={['#7c3aed', '#ec4899']}
               start={{ x: 0, y: 0 }}
               end={{ x: 1, y: 0 }}
               style={[styles.updateButton, isUpdating && styles.disabledButton]}
             >
               {isUpdating ? (
                 <ActivityIndicator color="#ffffff" size="small" />
               ) : (
                 <Text style={styles.updateButtonText}>Update Link</Text>
               )}
             </LinearGradient>
           </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderAnalyticsTab = () => (
    <View style={styles.tabContent}>
      {/* Profile Power */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleContainer}>
            <Text style={styles.cardTitle}>Profile Power</Text>
          </View>
        </View>
        <View style={styles.cardContent}>
          <View style={styles.analyticsStatCard}>
            <Text style={styles.analyticsStatValue}>{analyticsData.profilePower}</Text>
            <Text style={styles.analyticsStatLabel}>Current Power</Text>
            <Text style={styles.analyticsStatDescription}>
              Based on likes, comments, and collection rarity
            </Text>
          </View>
        </View>
      </View>

      {/* Profile Power Breakdown */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleContainer}>
            <Text style={styles.cardTitle}>Power Breakdown</Text>
          </View>
        </View>
        <View style={styles.cardContent}>
          <View style={styles.breakdownContainer}>
            {/* Likes Contribution */}
            <View style={styles.breakdownItem}>
              <View style={styles.breakdownHeader}>
                <Text style={styles.breakdownLabel}>Likes</Text>
                <Text style={styles.breakdownValue}>{analyticsData.powerBreakdown.likesContribution}</Text>
              </View>
              <View style={styles.breakdownBar}>
                <View 
                  style={[
                    styles.breakdownBarFill, 
                    { 
                      width: `${Math.min(100, (analyticsData.powerBreakdown.likesContribution / analyticsData.profilePower) * 100)}%`,
                      backgroundColor: '#10b981'
                    }
                  ]} 
                />
              </View>
            </View>

            {/* Comments Contribution */}
            <View style={styles.breakdownItem}>
              <View style={styles.breakdownHeader}>
                <Text style={styles.breakdownLabel}>Comments (×2)</Text>
                <Text style={styles.breakdownValue}>{analyticsData.powerBreakdown.commentsContribution}</Text>
              </View>
              <View style={styles.breakdownBar}>
                <View 
                  style={[
                    styles.breakdownBarFill, 
                    { 
                      width: `${Math.min(100, (analyticsData.powerBreakdown.commentsContribution / analyticsData.profilePower) * 100)}%`,
                      backgroundColor: '#3b82f6'
                    }
                  ]} 
                />
              </View>
            </View>

            {/* Collection Contribution */}
            <View style={styles.breakdownItem}>
              <View style={styles.breakdownHeader}>
                <Text style={styles.breakdownLabel}>Collection Bonus</Text>
                <Text style={styles.breakdownValue}>+{analyticsData.powerBreakdown.collectionContribution}</Text>
              </View>
              <View style={styles.breakdownBar}>
                <View 
                  style={[
                    styles.breakdownBarFill, 
                    { 
                      width: `${Math.min(100, (analyticsData.powerBreakdown.collectionContribution / analyticsData.profilePower) * 100)}%`,
                      backgroundColor: '#8b5cf6'
                    }
                  ]} 
                />
              </View>
            </View>

            {/* Rarity Factor */}
            <View style={styles.rarityFactorContainer}>
              <Text style={styles.rarityFactorLabel}>Collection Rarity Factor</Text>
              <Text style={styles.rarityFactorValue}>{analyticsData.powerBreakdown.rarityFactor}x</Text>
              <Text style={styles.rarityFactorDescription}>
                {analyticsData.powerBreakdown.rarityFactor === 1.0 
                  ? 'No collection bonus' 
                  : `Multiplies base power by ${analyticsData.powerBreakdown.rarityFactor}`
                }
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Account Stats */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleContainer}>
            <Text style={styles.cardTitle}>Account Statistics</Text>
          </View>
        </View>
        <View style={styles.cardContent}>
          <View style={styles.analyticsGrid}>
            <View style={styles.analyticsStatItem}>
              <Text style={styles.analyticsStatValue}>{analyticsData.totalChirps}</Text>
              <Text style={styles.analyticsStatLabel}>Total Chirps</Text>
            </View>
            <View style={styles.analyticsStatItem}>
              <Text style={styles.analyticsStatValue}>{analyticsData.totalLikes}</Text>
              <Text style={styles.analyticsStatLabel}>Total Likes</Text>
            </View>
            <View style={styles.analyticsStatItem}>
              <Text style={styles.analyticsStatValue}>{analyticsData.followers}</Text>
              <Text style={styles.analyticsStatLabel}>Followers</Text>
            </View>
            <View style={styles.analyticsStatItem}>
              <Text style={styles.analyticsStatValue}>{analyticsData.following}</Text>
              <Text style={styles.analyticsStatLabel}>Following</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Engagement Metrics */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleContainer}>
            <Text style={styles.cardTitle}>Engagement Metrics</Text>
          </View>
        </View>
        <View style={styles.cardContent}>
          <View style={styles.analyticsGrid}>
            <View style={styles.analyticsStatItem}>
              <Text style={styles.analyticsStatValue}>{analyticsData.engagementRate.toFixed(1)}</Text>
              <Text style={styles.analyticsStatLabel}>Engagement Rate</Text>
              <Text style={styles.analyticsStatDescription}>Likes per chirp</Text>
            </View>
            <View style={styles.analyticsStatItem}>
              <Text style={styles.analyticsStatValue}>{analyticsData.accountAge}</Text>
              <Text style={styles.analyticsStatLabel}>Account Age</Text>
              <Text style={styles.analyticsStatDescription}>Days since joining</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Refresh Button */}
      <TouchableOpacity
        style={styles.refreshButton}
        onPress={loadAnalyticsData}
        disabled={isLoadingAnalytics}
      >
        <LinearGradient
          colors={['#7c3aed', '#ec4899']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.refreshButtonGradient}
        >
          {isLoadingAnalytics ? (
            <ActivityIndicator color="#ffffff" size="small" />
          ) : (
            <Text style={styles.refreshButtonText}>Refresh Analytics</Text>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  const renderAccountTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleContainer}>
            <UserIcon size={20} color="#7c3aed" />
            <Text style={styles.cardTitle}>Account</Text>
          </View>
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.currentInfo}>
            Email: {user?.email}
          </Text>
          <Text style={styles.currentInfo}>
            Handle: @{user?.customHandle || user?.handle}
          </Text>
          <Text style={styles.currentInfo}>
            Joined: January 2025
          </Text>
          
          <TouchableOpacity 
            style={styles.signOutButton}
            onPress={async () => {
              console.log('🔥 Sign out button pressed!');
              
              // For web environment, use window.confirm instead of Alert
              if (typeof window !== 'undefined' && window.confirm) {
                const confirmed = window.confirm("Are you sure you want to sign out?");
                if (!confirmed) {
                  console.log('❌ Sign out cancelled by user');
                  return;
                }
              }
              
              try {
                console.log('🚪 User confirmed sign out, starting process...');
                await signOut();
                console.log('✅ Sign out completed from AuthContext');
                
                // Close settings modal first
                onClose();
                console.log('📱 Settings modal closed');
                
                // Force refresh for web environment
                if (typeof window !== 'undefined' && window.location) {
                  console.log('🔄 Forcing page refresh to show login screen');
                  setTimeout(() => {
                    window.location.reload();
                  }, 500);
                } else {
                  console.log('🔄 Sign out process completed - user should see login screen');
                }
              } catch (error) {
                console.error('❌ Sign out error:', error);
                if (typeof window !== 'undefined' && window.alert) {
                  window.alert("Failed to sign out. Please try again.");
                }
              }
            }}
          >
            <LogOutIcon size={20} color="#9ca3af" />
            <Text style={styles.signOutButtonText}>Sign Out</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.supportButton}
            onPress={() => {
              // Navigate to support page using React Native router
              router.push('/support');
            }}
          >
            <SupportIcon size={20} color="#7c3aed" />
            <Text style={styles.supportButtonText}>Contact Support</Text>
          </TouchableOpacity>

          {/* Legal Links */}
          <TouchableOpacity 
            style={styles.supportButton}
            onPress={() => router.push('/terms-of-service')}
          >
            <LegalIcon size={20} color="#7c3aed" />
            <Text style={styles.supportButtonText}>Terms of Service</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.supportButton}
            onPress={() => router.push('/privacy-policy')}
          >
            <LegalIcon size={20} color="#7c3aed" />
            <Text style={styles.supportButtonText}>Privacy Policy</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fafafa' }}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onClose}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <View style={{ marginRight: 8 }}>
            <GearIcon size={20} color="#7c3aed" />
          </View>
          <Text style={styles.headerTitle}>Settings</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsScrollView}>
          <View style={styles.tabsButtonContainer}>
            <TabButton id="profile" title="Profile" active={activeTab === 'profile'} />
            <TabButton id="analytics" title="Analytics" active={activeTab === 'analytics'} />
            <TabButton id="account" title="Account" active={activeTab === 'account'} />
          </View>
        </ScrollView>
      </View>

      {/* Content with Keyboard Avoidance */}
      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <View style={styles.contentWrapper}>
          <ScrollView 
            style={styles.content} 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContentContainer}
            keyboardShouldPersistTaps="handled"
          >
            {activeTab === 'profile' && renderProfileTab()}
            {activeTab === 'analytics' && renderAnalyticsTab()}
            {activeTab === 'account' && renderAccountTab()}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
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
    paddingTop: 8,
    paddingBottom: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 12,
    borderRadius: 8,
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
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
    paddingVertical: 12,
    ...(Platform.OS === 'web' && {
      maxWidth: 600,
      alignSelf: 'center',
      width: '100%',
    }),
  },
  tabsScrollView: {
    paddingHorizontal: 16,
  },
  tabsButtonContainer: {
    flexDirection: 'row',
    backgroundColor: '#f7f9fa',
    borderRadius: 12,
    padding: 3,
  },
  tabButton: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 2,
    flex: 1,
  },
  activeTabButton: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  tabButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#657786',
  },
  activeTabButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  content: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  contentWrapper: {
    flex: 1,
    ...(Platform.OS === 'web' && {
      maxWidth: 600,
      alignSelf: 'center',
      width: '100%',
    }),
  },
  scrollContentContainer: {
    paddingBottom: 100, // Extra padding at bottom for keyboard clearance
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
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    marginTop: 8,
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  disabledButton: {
    backgroundColor: '#d1d5db',
  },
  updateButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
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
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  upgradeButton: {
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  upgradeButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
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
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    height: 48,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  signOutButtonText: {
    color: '#6b7280',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    textAlign: 'center',
  },
  supportButton: {
    backgroundColor: '#ede9fe',
    borderRadius: 8,
    height: 48,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#c4b5fd',
  },
  supportButtonText: {
    color: '#7c3aed',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    textAlign: 'center',
  },
  profilePictureContainer: {
    alignItems: 'center',
  },
  currentPictureContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  uploadSection: {
    width: '100%',
    gap: 12,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e1e8ed',
    gap: 8,
  },
  uploadButtonText: {
    color: '#7c3aed',
    fontSize: 16,
    fontWeight: '600',
  },
  uploadConfirmButton: {
    marginTop: 8,
  },
  uploadConfirmGradient: {
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  uploadConfirmButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  bannerContainer: {
    alignItems: 'center',
  },
  currentBannerContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  bannerPreview: {
    width: 300, // Increased width for better banner preview
    height: 100, // 3:1 aspect ratio (300/100 = 3:1)
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e1e8ed',
  },
  bannerPreviewImage: {
    width: '100%',
    height: '100%',
  },
  bannerPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e1e8ed',
    borderStyle: 'dashed',
  },
     bannerPlaceholderText: {
     color: '#9ca3af',
     fontSize: 12,
     marginTop: 4,
   },
   // Analytics styles
   analyticsStatCard: {
     backgroundColor: '#f8fafc',
     borderRadius: 16,
     padding: 20,
     alignItems: 'center',
     borderWidth: 1,
     borderColor: '#e2e8f0',
   },
   analyticsStatValue: {
     fontSize: 32,
     fontWeight: 'bold',
     color: '#7c3aed',
     marginBottom: 8,
   },
   analyticsStatLabel: {
     fontSize: 16,
     fontWeight: '600',
     color: '#1f2937',
     marginBottom: 4,
   },
   analyticsStatDescription: {
     fontSize: 14,
     color: '#64748b',
     textAlign: 'center',
   },
   analyticsGrid: {
     flexDirection: 'row',
     flexWrap: 'wrap',
     justifyContent: 'space-between',
   },
   analyticsStatItem: {
     width: '48%',
     backgroundColor: '#f8fafc',
     borderRadius: 12,
     padding: 16,
     marginBottom: 12,
     alignItems: 'center',
     borderWidth: 1,
     borderColor: '#e2e8f0',
   },
   refreshButton: {
     borderRadius: 12,
     marginTop: 16,
     shadowColor: '#7c3aed',
     shadowOffset: { width: 0, height: 2 },
     shadowOpacity: 0.3,
     shadowRadius: 4,
     elevation: 3,
   },
   refreshButtonGradient: {
     paddingHorizontal: 24,
     paddingVertical: 12,
     borderRadius: 12,
     alignItems: 'center',
     justifyContent: 'center',
   },
  refreshButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  // Breakdown styles
  breakdownContainer: {
    gap: 16,
  },
  breakdownItem: {
    marginBottom: 12,
  },
  breakdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  breakdownLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  breakdownValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#7c3aed',
  },
  breakdownBar: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
  },
  breakdownBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  rarityFactorContainer: {
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  rarityFactorLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  rarityFactorValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#7c3aed',
    marginBottom: 4,
  },
  rarityFactorDescription: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
});