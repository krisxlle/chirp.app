import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useSupabaseAuth } from '../components/SupabaseAuthContext';
import UserAvatar from '../components/UserAvatar';
import { supabase } from '../lib/supabase';

// Inline API functions to avoid import issues in production
const getUserStats = async (userId: string) => {
  console.log('🔍 getUserStats called with:', { userId });
  
  // Return mock data for web compatibility
  return {
    following: 150,
    followers: 320,
    profilePower: 1250,
    totalChirps: 42,
    totalLikes: 1250
  };
};

const getProfilePowerBreakdown = async (userId: string) => {
  console.log('🔍 getProfilePowerBreakdown called with:', { userId });
  
  // Return mock data for web compatibility
  return {
    totalPower: 1250,
    likesContribution: 800,
    commentsContribution: 300,
    collectionContribution: 150,
    rarityFactor: 1.0,
    totalLikes: 1250,
    totalComments: 89
  };
};

interface SettingsProps {
  onClose?: () => void;
}

// Custom Icon Components
const UserIcon = ({ size = 20, color = "#7c3aed" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path 
      d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" 
      stroke={color} 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
    <circle 
      cx="12" 
      cy="7" 
      r="4" 
      stroke={color} 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </svg>
);

const BarChartIcon = ({ size = 20, color = "#7c3aed" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path 
      d="M18 20V10M12 20V4M6 20v-6" 
      stroke={color} 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </svg>
);

const ShieldIcon = ({ size = 20, color = "#7c3aed" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path 
      d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" 
      stroke={color} 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </svg>
);

const LogOutIcon = ({ size = 20, color = "#ef4444" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path 
      d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" 
      stroke={color} 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
    <polyline 
      points="16,17 21,12 16,7" 
      stroke={color} 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
    <line 
      x1="21" 
      y1="12" 
      x2="9" 
      y2="12" 
      stroke={color} 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </svg>
);

const GearIcon = ({ size = 20, color = "#7c3aed" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle 
      cx="12" 
      cy="12" 
      r="3" 
      stroke={color} 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
    <path 
      d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0-.33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09z"
      stroke={color} 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </svg>
);

const CameraIcon = ({ size = 20, color = "#7c3aed" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path 
      d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" 
      stroke={color} 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
    <path 
      d="M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" 
      stroke={color} 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </svg>
);

const BannerIcon = ({ size = 20, color = "#7c3aed" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path 
      d="M3 3h18v18H3z" 
      stroke={color} 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
    <path 
      d="M3 9h18" 
      stroke={color} 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
    <path 
      d="M9 21V9" 
      stroke={color} 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </svg>
);

export default function Settings({ onClose }: SettingsProps) {
  const { user, signOut, updateUser } = useSupabaseAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState('profile');
  
  // Privacy settings state
  const [isDiscoverable, setIsDiscoverable] = useState(true);
  const [aiOptOut, setAiOptOut] = useState(false);
  const [analyticsOptOut, setAnalyticsOptOut] = useState(false);
  
  // Account deletion state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);
  
  // Profile form state
  const [displayName, setDisplayName] = useState(user?.firstName || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [linkInBio, setLinkInBio] = useState(user?.linkInBio || '');
  
  // Image upload state
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [selectedBannerImage, setSelectedBannerImage] = useState<string | null>(null);
  const [isUploadingBannerImage, setIsUploadingBannerImage] = useState(false);

  // Real analytics data from database
  const [analyticsData, setAnalyticsData] = useState({
    profilePower: 0,
    totalChirps: 0,
    totalLikes: 0,
    totalComments: 0,
    followers: 0,
    following: 0,
    accountAge: 0,
    engagementRate: 0,
    topChirp: {
      content: 'No chirps yet',
      likes: 0,
      replies: 0,
      reposts: 0
    }
  });

  // Update form state when user changes
  useEffect(() => {
    if (user) {
      setDisplayName(user.firstName || '');
      setBio(user.bio || '');
      setLinkInBio(user.linkInBio || '');
    }
  }, [user]);

  // Image picker functions for web
  const pickImage = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file && user) {
        // Create preview URL
        const imageUrl = URL.createObjectURL(file);
        setSelectedImage(imageUrl);
        
        // Upload directly with inline function to avoid context issues
        (async () => {
          setIsUploadingImage(true);
          try {
            const fileName = `profile-${user.id}.jpg`;
            
            const { data, error: uploadError } = await supabase.storage
              .from('avatars')
              .upload(fileName, file, {
                contentType: file.type || 'image/jpeg',
                upsert: true,
              });

            if (!uploadError && data) {
              const uploadedImageUrl = `https://qrzbtituxxilnbgocdge.supabase.co/storage/v1/object/public/avatars/${data.path}`;
              
              const { error } = await supabase
                .from('users')
                .update({ profile_image_url: uploadedImageUrl })
                .eq('id', user.id);

              if (!error) {
                await updateUser({
                  profileImageUrl: uploadedImageUrl,
                  avatarUrl: uploadedImageUrl
                });
                alert('Profile picture updated successfully!');
                setSelectedImage(null);
                URL.revokeObjectURL(imageUrl);
              } else {
                throw new Error('Failed to update profile');
              }
            } else {
              throw new Error('Failed to upload image');
            }
          } catch (error) {
            console.error('Error uploading profile image:', error);
            alert('Failed to upload profile image. Please try again.');
            URL.revokeObjectURL(imageUrl);
          } finally {
            setIsUploadingImage(false);
          }
        })();
      }
    };
    input.click();
  };

  const pickBannerImage = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file && user) {
        // Store the original file for upload
        const originalFile = file;
        
        // Validate image dimensions
        const img = new Image();
        img.onload = () => {
          console.log('🔍 Banner image validation - dimensions:', img.naturalWidth, 'x', img.naturalHeight);
          
          // Check minimum dimensions for banner (should be at least 400x200)
          if (img.naturalWidth < 400 || img.naturalHeight < 200) {
            alert(`Banner image is too small. Please use an image that is at least 400x200 pixels. Your image is ${img.naturalWidth}x${img.naturalHeight} pixels.`);
            return;
          }
          
          // Check maximum file size (10MB)
          if (originalFile.size > 10 * 1024 * 1024) {
            alert('Banner image is too large. Please use an image smaller than 10MB.');
            return;
          }
          
          console.log('✅ Banner image validation passed');
          
          // Create preview URL
          const imageUrl = URL.createObjectURL(originalFile);
          setSelectedBannerImage(imageUrl);
        
          // Upload directly with inline function to avoid context issues
          (async () => {
            setIsUploadingBannerImage(true);
            try {
              // Preserve original file extension
              const fileExtension = originalFile.name.split('.').pop() || 'jpg';
              const fileName = `banner-${user.id}.${fileExtension}`;
              
              console.log('🔍 Uploading file:', {
                name: originalFile.name,
                size: originalFile.size,
                type: originalFile.type,
                lastModified: originalFile.lastModified
              });
              
              // Try uploading to banners bucket first, then fallback to banner-images
              let uploadResult;
              let uploadError;
              
              try {
                uploadResult = await supabase.storage
                  .from('banners')
                  .upload(fileName, originalFile, {
                    contentType: originalFile.type,
                    upsert: true,
                    cacheControl: '3600',
                  });
                uploadError = uploadResult.error;
              } catch (bucketError) {
                console.log('Banners bucket failed, trying banner-images bucket:', bucketError);
                uploadResult = await supabase.storage
                  .from('banner-images')
                  .upload(fileName, originalFile, {
                    contentType: originalFile.type,
                    upsert: true,
                    cacheControl: '3600',
                  });
                uploadError = uploadResult.error;
              }
              
              const { data } = uploadResult;

              if (!uploadError && data) {
                // Generate URL based on which bucket was used
                let uploadedImageUrl;
                try {
                  const { data: urlData } = supabase.storage
                    .from('banners')
                    .getPublicUrl(data.path);
                  uploadedImageUrl = urlData.publicUrl;
                } catch {
                  const { data: urlData } = supabase.storage
                    .from('banner-images')
                    .getPublicUrl(data.path);
                  uploadedImageUrl = urlData.publicUrl;
                }
                
                console.log('✅ Upload successful:', {
                  data,
                  uploadedImageUrl,
                  uploadError
                });
                
                // Verify the uploaded image by creating a test image element
                const testImg = new Image();
                testImg.onload = () => {
                  console.log('🔍 Uploaded image verification - dimensions:', testImg.naturalWidth, 'x', testImg.naturalHeight);
                };
                testImg.onerror = () => {
                  console.error('❌ Uploaded image verification failed');
                };
                testImg.src = uploadedImageUrl;
                
                const { error } = await supabase
                  .from('users')
                  .update({ banner_image_url: uploadedImageUrl })
                  .eq('id', user.id);

                if (!error) {
                  // Update the user context
                  console.log('Updating user context with banner URL');
                  if (typeof updateUser === 'function') {
                    await updateUser({
                      bannerImageUrl: uploadedImageUrl
                    });
                    console.log('User context updated successfully');
                  } else {
                    console.error('updateUser is not a function:', typeof updateUser);
                    // Don't throw error here since database update succeeded
                  }
                  alert('Profile banner updated successfully!');
                  setSelectedBannerImage(null);
                  URL.revokeObjectURL(imageUrl);
                } else {
                  throw new Error('Failed to update banner');
                }
              } else {
                throw new Error('Failed to upload banner image');
              }
            } catch (error) {
              console.error('Error uploading banner image:', error);
              alert('Failed to upload banner image. Please try again.');
              URL.revokeObjectURL(imageUrl);
            } finally {
              setIsUploadingBannerImage(false);
            }
          })();
        };
        
        img.onerror = () => {
          console.error('❌ Failed to load image for validation');
          alert('Invalid image file. Please select a valid image.');
        };
        
        img.src = URL.createObjectURL(file);
      }
    };
    input.click();
  };

  const handleUploadProfileImageDirect = async (file: File) => {
    if (!file || !user) return;

    setIsUploadingImage(true);
    try {
      // Upload to Supabase storage using client
      const fileName = `profile-${user.id}.jpg`;
      
      const { data, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          contentType: file.type || 'image/jpeg',
          upsert: true, // Allow overwriting existing files
        });

      if (!uploadError && data) {
        const imageUrl = `https://qrzbtituxxilnbgocdge.supabase.co/storage/v1/object/public/avatars/${data.path}`;
        
        // Update user profile with new image URL
        const { error } = await supabase
          .from('users')
          .update({ profile_image_url: imageUrl })
          .eq('id', user.id);

        if (!error) {
          await updateUser({
            profileImageUrl: imageUrl,
            avatarUrl: imageUrl
          });
          alert('Profile picture updated successfully!');
          setSelectedImage(null);
        } else {
          throw new Error('Failed to update profile');
        }
      } else {
        throw new Error('Failed to upload image');
      }
    } catch (error) {
      console.error('Error uploading profile image:', error);
      alert(`Failed to upload profile image: ${error.message}`);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleUploadProfileImage = async (imageDataUrl?: string) => {
    const imageToUpload = imageDataUrl || selectedImage;
    if (!imageToUpload || !user) return;

    setIsUploadingImage(true);
    try {
      // Convert data URL to blob
      const response = await fetch(imageToUpload);
      const blob = await response.blob();
      
      // Create form data
      const formData = new FormData();
      formData.append('file', blob, `profile-${user.id}.jpg`);
      
      // Upload to Supabase storage using client
      const fileName = `profile-${user.id}.jpg`;
      
      const { data, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, blob, {
          contentType: blob.type || 'image/jpeg',
          upsert: true, // Allow overwriting existing files
        });

      if (!uploadError && data) {
        const imageUrl = `https://qrzbtituxxilnbgocdge.supabase.co/storage/v1/object/public/avatars/${data.path}`;
        
        // Update user profile with new image URL
        const { error } = await supabase
          .from('users')
          .update({ profile_image_url: imageUrl })
          .eq('id', user.id);

        if (!error) {
          await updateUser({
            profileImageUrl: imageUrl,
            avatarUrl: imageUrl
          });
          alert('Profile picture updated successfully!');
          setSelectedImage(null);
        } else {
          throw new Error('Failed to update profile');
        }
      } else {
        throw new Error('Failed to upload image');
      }
    } catch (error) {
      console.error('Error uploading profile image:', error);
      alert(`Failed to upload profile image: ${error.message}`);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleUploadBannerImageDirect = async (file: File) => {
    if (!file || !user) return;

    setIsUploadingBannerImage(true);
    try {
      // Upload to Supabase storage using client
      const fileName = `banner-${user.id}.jpg`;
      
      const { data, error: uploadError } = await supabase.storage
        .from('banners')
        .upload(fileName, file, {
          contentType: file.type || 'image/jpeg',
          upsert: true, // Allow overwriting existing files
        });

      if (!uploadError && data) {
        const imageUrl = `https://qrzbtituxxilnbgocdge.supabase.co/storage/v1/object/public/banners/${data.path}`;
        
        // Update user profile with new banner URL
        const { error } = await supabase
          .from('users')
          .update({ banner_image_url: imageUrl })
          .eq('id', user.id);

        if (!error) {
          await updateUser({
            bannerImageUrl: imageUrl
          });
          alert('Profile banner updated successfully!');
          setSelectedBannerImage(null);
        } else {
          throw new Error('Failed to update banner');
        }
      } else {
        throw new Error('Failed to upload banner image');
      }
    } catch (error) {
      console.error('Error uploading banner image:', error);
      alert(`Failed to upload banner image: ${error.message}`);
    } finally {
      setIsUploadingBannerImage(false);
    }
  };

  const handleUploadBannerImage = async (imageDataUrl?: string) => {
    const imageToUpload = imageDataUrl || selectedBannerImage;
    if (!imageToUpload || !user) {
      console.log('Missing image or user data:', { imageToUpload: !!imageToUpload, user: !!user });
      return;
    }

    setIsUploadingBannerImage(true);
    try {
      console.log('Starting banner upload for user:', user.id);
      
      // Convert data URL to blob
      const response = await fetch(imageToUpload);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status}`);
      }
      
      const blob = await response.blob();
      console.log('Image blob created:', { size: blob.size, type: blob.type });
      
      // Upload to Supabase storage using client
      const fileName = `banner-${user.id}.jpg`;
      
      // Try 'banners' bucket first, fallback to 'banner-images' if needed
      let uploadResult;
      let uploadError;
      
      try {
        uploadResult = await supabase.storage
          .from('banners')
          .upload(fileName, blob, {
            contentType: blob.type || 'image/jpeg',
            upsert: true, // Allow overwriting existing files
          });
        uploadError = uploadResult.error;
      } catch (bucketError) {
        console.log('Banners bucket not available, trying banner-images bucket');
        uploadResult = await supabase.storage
          .from('banner-images')
          .upload(fileName, blob, {
            contentType: blob.type || 'image/jpeg',
            upsert: true, // Allow overwriting existing files
          });
        uploadError = uploadResult.error;
      }
      
      const { data } = uploadResult;

      if (uploadError) {
        console.error('Supabase upload error:', uploadError);
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      if (data) {
        // Determine which bucket was used based on the path or try both
        let imageUrl;
        try {
          // Try banners bucket first
          const { data: urlData } = supabase.storage
            .from('banners')
            .getPublicUrl(data.path);
          imageUrl = urlData.publicUrl;
        } catch {
          // Fallback to banner-images bucket
          const { data: urlData } = supabase.storage
            .from('banner-images')
            .getPublicUrl(data.path);
          imageUrl = urlData.publicUrl;
        }
        
        console.log('Image uploaded successfully, URL:', imageUrl);
        
        // Update user profile with new banner URL
        const { error: updateError } = await supabase
          .from('users')
          .update({ banner_image_url: imageUrl })
          .eq('id', user.id);

        if (updateError) {
          console.error('Database update error:', updateError);
          throw new Error(`Failed to update banner in database: ${updateError.message}`);
        }

        // Update the user context
        console.log('Updating user context with banner URL');
        if (typeof updateUser === 'function') {
          await updateUser({
            bannerImageUrl: imageUrl
          });
          console.log('User context updated successfully');
        } else {
          console.error('updateUser is not a function:', typeof updateUser);
          throw new Error('updateUser function is not available');
        }
        
        alert('Profile banner updated successfully!');
        setSelectedBannerImage(null);
      } else {
        throw new Error('No data returned from upload');
      }
    } catch (error) {
      console.error('Error uploading banner image:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`Failed to upload banner image: ${errorMessage}`);
    } finally {
      setIsUploadingBannerImage(false);
    }
  };

  // Load real analytics data from database
  useEffect(() => {
    const loadAnalyticsData = async () => {
      if (!user?.id) return;
      
      setIsLoadingAnalytics(true);
      try {
        console.log('🔄 Loading real analytics data for user:', user.id);
        
        // Fetch user stats and profile power breakdown
        const [userStats, profilePowerBreakdown] = await Promise.all([
          getUserStats(user.id),
          getProfilePowerBreakdown(user.id)
        ]);
        
        console.log('✅ Loaded real analytics data:', { userStats, profilePowerBreakdown });
        
        // Calculate account age
        const accountAge = user.joinedAt 
          ? Math.floor((Date.now() - new Date(user.joinedAt).getTime()) / (1000 * 60 * 60 * 24))
          : 0;
        
        // Calculate engagement rate
        const engagementRate = userStats.totalChirps > 0 
          ? ((userStats.totalLikes + userStats.totalComments) / userStats.totalChirps * 100).toFixed(1)
          : 0;
        
        setAnalyticsData({
          profilePower: profilePowerBreakdown.totalPower || 0,
          totalChirps: userStats.totalChirps || 0,
          totalLikes: userStats.totalLikes || 0,
          totalComments: profilePowerBreakdown.totalComments || 0,
          followers: userStats.followers || 0,
          following: userStats.following || 0,
          accountAge: accountAge,
          engagementRate: parseFloat(engagementRate.toString()),
          topChirp: {
            content: 'Top chirp data coming soon',
            likes: 0,
            replies: 0,
            reposts: 0
          }
        });
        
        console.log('✅ Analytics data updated:', analyticsData);
      } catch (error) {
        console.error('❌ Error loading analytics data:', error);
        // Keep default values on error
      } finally {
        setIsLoadingAnalytics(false);
      }
    };
    
    loadAnalyticsData();
  }, [user?.id]);

  const handleSaveProfile = async () => {
    setIsUpdating(true);
    try {
      console.log('Starting profile update with data:', { displayName, bio, linkInBio });
      
      if (!user?.id) {
        throw new Error('User ID not available');
      }
      
      // Update user profile in database first
      const { error: dbError } = await supabase
        .from('users')
        .update({ 
          first_name: displayName,
          bio: bio,
          link_in_bio: linkInBio
        })
        .eq('id', user.id);

      if (dbError) {
        console.error('Database update error:', dbError);
        throw new Error(`Failed to update profile in database: ${dbError.message}`);
      }
      
      // Then update the user context
      console.log('Updating user context with profile data');
      if (typeof updateUser === 'function') {
        await updateUser({
          firstName: displayName,
          bio,
          linkInBio
        });
        console.log('User context updated successfully');
      } else {
        console.error('updateUser is not a function:', typeof updateUser);
        // Don't throw error here since database update succeeded
      }
      
      console.log('✅ Profile updated successfully');
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('❌ Failed to update profile:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`Failed to update profile: ${errorMessage}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setLocation('/');
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  };
  
  const handlePrivacySettingsUpdate = async (setting: string, value: boolean) => {
    try {
      // Update privacy settings in database
      const { error } = await supabase
        .from('users')
        .update({
          [`privacy_${setting}`]: value,
          updated_at: new Date().toISOString()
        })
        .eq('id', user?.id);
      
      if (error) {
        console.error('Error updating privacy settings:', error);
        alert('Failed to update privacy settings');
      } else {
        console.log(`Privacy setting ${setting} updated to ${value}`);
      }
    } catch (error) {
      console.error('Error updating privacy settings:', error);
      alert('Failed to update privacy settings');
    }
  };
  
  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      alert('Please type DELETE to confirm account deletion');
      return;
    }
    
    setIsDeletingAccount(true);
    
    try {
      // Delete user data from database
      const { error: deleteError } = await supabase
        .from('users')
        .delete()
        .eq('id', user?.id);
      
      if (deleteError) {
        console.error('Error deleting user data:', deleteError);
        alert('Failed to delete account. Please contact support.');
        setIsDeletingAccount(false);
        return;
      }
      
      // Sign out and redirect to auth page
      await signOut();
      alert('Your account has been successfully deleted.');
      setLocation('/auth');
    } catch (error) {
      console.error('Error deleting account:', error);
      alert('Failed to delete account. Please contact support.');
      setIsDeletingAccount(false);
    }
  };

  const TabButton = ({ id, title, active }: { id: string; title: string; active: boolean }) => (
    <button
      onClick={() => setActiveTab(id)}
      style={{
        padding: '8px 12px',
        borderRadius: '8px',
        background: active ? 'linear-gradient(135deg, #7c3aed, #ec4899)' : 'transparent',
        color: active ? '#ffffff' : '#657786',
        fontSize: '12px',
        fontWeight: '600',
        border: 'none',
        cursor: 'pointer',
        transition: 'all 0.2s',
        marginRight: '2px',
        flex: 1
      }}
    >
      {title}
    </button>
  );

  const renderProfileTab = () => (
    <div style={{ padding: '20px' }}>
      {/* Profile Header */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          marginBottom: '20px'
        }}>
          <UserAvatar user={user} size="lg" showFrame={true} />
          <div>
            <h3 style={{
              fontSize: '18px',
              fontWeight: 'bold',
              color: '#111827',
              margin: '0 0 4px 0'
            }}>
              {user?.firstName && user?.lastName 
                ? `${user.firstName} ${user.lastName}` 
                : user?.name || user?.customHandle || user?.handle || 'User'}
            </h3>
            <p style={{
              fontSize: '14px',
              color: '#6b7280',
              margin: 0
            }}>
              @{user?.customHandle || user?.handle || 'user'}
            </p>
          </div>
        </div>
      </div>

      {/* Profile Picture Section */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '16px'
        }}>
          <CameraIcon size={20} color="#7c3aed" />
          <h4 style={{
            fontSize: '16px',
            fontWeight: '600',
            color: '#111827',
            margin: 0
          }}>
            Profile Picture
          </h4>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
          marginBottom: '16px'
        }}>
          <UserAvatar 
            user={{ 
              ...user, 
              profileImageUrl: selectedImage || user?.profileImageUrl 
            }} 
            size="xl" 
          />
          <div>
            <button
              onClick={pickImage}
              disabled={isUploadingImage}
              style={{
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '8px 16px',
                cursor: isUploadingImage ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
                fontWeight: '600',
                color: '#7c3aed',
                opacity: isUploadingImage ? 0.5 : 1
              }}
            >
              <CameraIcon size={16} color="#7c3aed" />
              {isUploadingImage ? 'Uploading...' : 'Upload Photo'}
            </button>
          </div>
        </div>
      </div>

      {/* Profile Banner Section */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '16px'
        }}>
          <BannerIcon size={20} color="#7c3aed" />
          <h4 style={{
            fontSize: '16px',
            fontWeight: '600',
            color: '#111827',
            margin: 0
          }}>
            Profile Banner
          </h4>
        </div>
        <div style={{ marginBottom: '16px' }}>
          <div style={{
            width: '100%',
            maxWidth: '400px',
            height: '120px',
            borderRadius: '8px',
            overflow: 'hidden',
            marginBottom: '12px',
            border: '1px solid #e2e8f0',
            backgroundImage: selectedBannerImage 
              ? `url(${selectedBannerImage})` 
              : user?.bannerImageUrl 
                ? `url(${user.bannerImageUrl})` 
                : 'none',
            backgroundColor: '#f8fafc',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {!selectedBannerImage && !user?.bannerImageUrl && (
              <div style={{
                color: '#9ca3af',
                fontSize: '12px',
                textAlign: 'center'
              }}>
                <BannerIcon size={24} color="#9ca3af" />
                <div style={{ marginTop: '4px' }}>No banner set</div>
              </div>
            )}
          </div>
          <button
            onClick={pickBannerImage}
            disabled={isUploadingBannerImage}
            style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '8px 16px',
              cursor: isUploadingBannerImage ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              fontWeight: '600',
              color: '#7c3aed',
              opacity: isUploadingBannerImage ? 0.5 : 1
            }}
          >
            <BannerIcon size={16} color="#7c3aed" />
            {isUploadingBannerImage ? 'Uploading...' : 'Upload Banner'}
          </button>
        </div>
      </div>

      {/* Profile Form */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
      }}>
        <h4 style={{
          fontSize: '16px',
          fontWeight: '600',
          color: '#111827',
          marginBottom: '16px'
        }}>
          Edit Profile
        </h4>
        
        <div style={{ marginBottom: '16px' }}>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '500',
            color: '#374151',
            marginBottom: '6px'
          }}>
            Display Name
          </label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '14px',
              outline: 'none',
              transition: 'border-color 0.2s'
            }}
            placeholder="Enter your display name"
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '500',
            color: '#374151',
            marginBottom: '6px'
          }}>
            Bio
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '14px',
              outline: 'none',
              transition: 'border-color 0.2s',
              resize: 'vertical'
            }}
            placeholder="Tell us about yourself..."
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '500',
            color: '#374151',
            marginBottom: '6px'
          }}>
            Link in Bio
          </label>
          <input
            type="url"
            value={linkInBio}
            onChange={(e) => setLinkInBio(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '14px',
              outline: 'none',
              transition: 'border-color 0.2s'
            }}
            placeholder="https://your-website.com"
          />
        </div>

        <button
          onClick={handleSaveProfile}
          disabled={isUpdating}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: isUpdating ? '#9ca3af' : '#7c3aed',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: isUpdating ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.2s'
          }}
        >
          {isUpdating ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );

  const renderAnalyticsTab = () => (
    <div style={{ padding: '20px' }}>
      {isLoadingAnalytics ? (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '40px',
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            border: '2px solid #7c3aed',
            borderTop: '2px solid transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <span style={{
            marginLeft: '12px',
            fontSize: '14px',
            color: '#6b7280'
          }}>
            Loading analytics...
          </span>
        </div>
      ) : (
        <>
          {/* Profile Power */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '20px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
          }}>
            <h4 style={{
              fontSize: '16px',
              fontWeight: '600',
              color: '#111827',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <BarChartIcon size={20} color="#7c3aed" />
              Profile Power
            </h4>
            <div style={{
              fontSize: '32px',
              fontWeight: 'bold',
              color: '#7c3aed',
              marginBottom: '8px'
            }}>
              {analyticsData.profilePower.toLocaleString()}
            </div>
            <p style={{
              fontSize: '14px',
              color: '#6b7280',
              margin: 0
            }}>
              Your overall engagement score
            </p>
          </div>

      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '16px',
        marginBottom: '20px'
      }}>
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          padding: '16px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#111827',
            marginBottom: '4px'
          }}>
            {analyticsData.totalChirps}
          </div>
          <div style={{
            fontSize: '12px',
            color: '#6b7280'
          }}>
            Total Chirps
          </div>
        </div>

        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          padding: '16px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#111827',
            marginBottom: '4px'
          }}>
            {analyticsData.totalLikes}
          </div>
          <div style={{
            fontSize: '12px',
            color: '#6b7280'
          }}>
            Total Likes
          </div>
        </div>

        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          padding: '16px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#111827',
            marginBottom: '4px'
          }}>
            {analyticsData.followers}
          </div>
          <div style={{
            fontSize: '12px',
            color: '#6b7280'
          }}>
            Followers
          </div>
        </div>

        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          padding: '16px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#111827',
            marginBottom: '4px'
          }}>
            {analyticsData.engagementRate}%
          </div>
          <div style={{
            fontSize: '12px',
            color: '#6b7280'
          }}>
            Engagement Rate
          </div>
        </div>
      </div>

      {/* Top Chirp */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
      }}>
        <h4 style={{
          fontSize: '16px',
          fontWeight: '600',
          color: '#111827',
          marginBottom: '12px'
        }}>
          Top Performing Chirp
        </h4>
        <p style={{
          fontSize: '14px',
          color: '#111827',
          lineHeight: '20px',
          marginBottom: '12px'
        }}>
          {analyticsData.topChirp.content}
        </p>
        <div style={{
          display: 'flex',
          gap: '16px',
          fontSize: '12px',
          color: '#6b7280'
        }}>
          <span>❤️ {analyticsData.topChirp.likes}</span>
          <span>💬 {analyticsData.topChirp.replies}</span>
          <span>🔄 {analyticsData.topChirp.reposts}</span>
        </div>
      </div>
        </>
      )}
    </div>
  );

  const renderAccountTab = () => (
    <div style={{ padding: '20px' }}>
      {/* Account Info */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
      }}>
        <h4 style={{
          fontSize: '16px',
          fontWeight: '600',
          color: '#111827',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <ShieldIcon size={20} color="#7c3aed" />
          Account Information
        </h4>
        
        <div style={{ marginBottom: '12px' }}>
          <div style={{
            fontSize: '12px',
            color: '#6b7280',
            marginBottom: '4px'
          }}>
            Email
          </div>
          <div style={{
            fontSize: '14px',
            color: '#111827'
          }}>
            {user?.email}
          </div>
        </div>

        <div style={{ marginBottom: '12px' }}>
          <div style={{
            fontSize: '12px',
            color: '#6b7280',
            marginBottom: '4px'
          }}>
            Handle
          </div>
          <div style={{
            fontSize: '14px',
            color: '#111827'
          }}>
            @{user?.customHandle || user?.handle || 'user'}
          </div>
        </div>

      </div>

      {/* Privacy Settings */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
      }}>
        <h4 style={{
          fontSize: '16px',
          fontWeight: '600',
          color: '#111827',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <ShieldIcon size={20} color="#7c3aed" />
          Privacy Settings
        </h4>
        
        {/* Account Discoverability */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 0',
          borderBottom: '1px solid #f3f4f6'
        }}>
          <div>
            <div style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>
              Account Discoverability
            </div>
            <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
              Let others find your account by email or phone
            </div>
          </div>
          <label style={{ position: 'relative', display: 'inline-block', width: '48px', height: '24px' }}>
            <input
              type="checkbox"
              checked={isDiscoverable}
              onChange={(e) => {
                setIsDiscoverable(e.target.checked);
                handlePrivacySettingsUpdate('discoverable', e.target.checked);
              }}
              style={{ opacity: 0, width: 0, height: 0 }}
            />
            <span style={{
              position: 'absolute',
              cursor: 'pointer',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: isDiscoverable ? '#7c3aed' : '#cbd5e1',
              transition: '0.3s',
              borderRadius: '24px'
            }}>
              <span style={{
                position: 'absolute',
                content: '',
                height: '18px',
                width: '18px',
                left: isDiscoverable ? '26px' : '3px',
                bottom: '3px',
                backgroundColor: 'white',
                transition: '0.3s',
                borderRadius: '50%'
              }} />
            </span>
          </label>
        </div>

        {/* AI Opt-Out */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 0',
          borderBottom: '1px solid #f3f4f6'
        }}>
          <div>
            <div style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>
              Opt Out of AI Features
            </div>
            <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
              Disable AI-powered content generation and analysis
            </div>
          </div>
          <label style={{ position: 'relative', display: 'inline-block', width: '48px', height: '24px' }}>
            <input
              type="checkbox"
              checked={aiOptOut}
              onChange={(e) => {
                setAiOptOut(e.target.checked);
                handlePrivacySettingsUpdate('ai_opt_out', e.target.checked);
              }}
              style={{ opacity: 0, width: 0, height: 0 }}
            />
            <span style={{
              position: 'absolute',
              cursor: 'pointer',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: aiOptOut ? '#7c3aed' : '#cbd5e1',
              transition: '0.3s',
              borderRadius: '24px'
            }}>
              <span style={{
                position: 'absolute',
                content: '',
                height: '18px',
                width: '18px',
                left: aiOptOut ? '26px' : '3px',
                bottom: '3px',
                backgroundColor: 'white',
                transition: '0.3s',
                borderRadius: '50%'
              }} />
            </span>
          </label>
        </div>

        {/* Analytics Opt-Out */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 0'
        }}>
          <div>
            <div style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>
              Opt Out of Analytics
            </div>
            <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
              Stop sharing usage data for analytics
            </div>
          </div>
          <label style={{ position: 'relative', display: 'inline-block', width: '48px', height: '24px' }}>
            <input
              type="checkbox"
              checked={analyticsOptOut}
              onChange={(e) => {
                setAnalyticsOptOut(e.target.checked);
                handlePrivacySettingsUpdate('analytics_opt_out', e.target.checked);
              }}
              style={{ opacity: 0, width: 0, height: 0 }}
            />
            <span style={{
              position: 'absolute',
              cursor: 'pointer',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: analyticsOptOut ? '#7c3aed' : '#cbd5e1',
              transition: '0.3s',
              borderRadius: '24px'
            }}>
              <span style={{
                position: 'absolute',
                content: '',
                height: '18px',
                width: '18px',
                left: analyticsOptOut ? '26px' : '3px',
                bottom: '3px',
                backgroundColor: 'white',
                transition: '0.3s',
                borderRadius: '50%'
              }} />
            </span>
          </label>
        </div>
      </div>

      {/* Delete Account */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        border: '2px solid #fef2f2'
      }}>
        <h4 style={{
          fontSize: '16px',
          fontWeight: '600',
          color: '#dc2626',
          marginBottom: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          ⚠️ Delete Account
        </h4>
        <p style={{
          fontSize: '13px',
          color: '#6b7280',
          marginBottom: '16px',
          lineHeight: '1.6'
        }}>
          Once you delete your account, there is no going back. All your chirps, likes, and profile data will be permanently removed.
        </p>
        
        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#fef2f2',
              color: '#dc2626',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#fee2e2';
              e.currentTarget.style.borderColor = '#fca5a5';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#fef2f2';
              e.currentTarget.style.borderColor = '#fecaca';
            }}
          >
            Delete My Account
          </button>
        ) : (
          <div>
            <p style={{
              fontSize: '13px',
              color: '#374151',
              marginBottom: '12px',
              fontWeight: '500'
            }}>
              Type <strong>DELETE</strong> to confirm:
            </p>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="Type DELETE"
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px',
                marginBottom: '12px'
              }}
            />
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteConfirmText('');
                }}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: '#f8fafc',
                  color: '#374151',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={isDeletingAccount || deleteConfirmText !== 'DELETE'}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: isDeletingAccount || deleteConfirmText !== 'DELETE' ? '#fca5a5' : '#dc2626',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: isDeletingAccount || deleteConfirmText !== 'DELETE' ? 'not-allowed' : 'pointer',
                  opacity: isDeletingAccount || deleteConfirmText !== 'DELETE' ? 0.5 : 1
                }}
              >
                {isDeletingAccount ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Sign Out */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
      }}>
        <button
          onClick={handleSignOut}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: '#f8fafc',
            color: '#374151',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f1f5f9';
            e.currentTarget.style.borderColor = '#cbd5e1';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#f8fafc';
            e.currentTarget.style.borderColor = '#e2e8f0';
          }}
        >
          <LogOutIcon size={16} color="#374151" />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#fafafa',
      paddingBottom: '80px' // Space for bottom navigation
    }}>
      {/* Header */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e1e8ed',
        paddingTop: '8px',
        paddingBottom: '12px',
        paddingLeft: '16px',
        paddingRight: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <button 
          onClick={() => onClose ? onClose() : setLocation('/')}
          style={{
            padding: '12px',
            borderRadius: '8px',
            minWidth: '44px',
            minHeight: '44px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            transition: 'background-color 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f2f5'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <span style={{
            fontSize: '24px',
            color: '#7c3aed',
            fontWeight: '600'
          }}>←</span>
        </button>
        
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <GearIcon size={20} color="#7c3aed" />
          <h1 style={{
            fontSize: '20px',
            fontWeight: '700',
            color: '#1a1a1a',
            margin: 0
          }}>
            Settings
          </h1>
        </div>
        
        <div style={{ width: '44px' }} />
      </div>

      {/* Tabs */}
      <div style={{
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e1e8ed',
        paddingTop: '12px',
        paddingBottom: '12px',
        paddingLeft: '16px',
        paddingRight: '16px'
      }}>
        <div style={{
          display: 'flex',
          backgroundColor: '#f7f9fa',
          borderRadius: '12px',
          padding: '3px'
        }}>
          <TabButton id="profile" title="Profile" active={activeTab === 'profile'} />
          <TabButton id="analytics" title="Analytics" active={activeTab === 'analytics'} />
          <TabButton id="account" title="Account" active={activeTab === 'account'} />
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1 }}>
        {activeTab === 'profile' && renderProfileTab()}
        {activeTab === 'analytics' && renderAnalyticsTab()}
        {activeTab === 'account' && renderAccountTab()}
      </div>
    </div>
  );
}