import { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { determineUserRarity } from '../utils/rarityUtils';
import ProfileFrame from './ProfileFrame';

interface UserAvatarProps {
  user?: {
    id: string;
    firstName?: string;
    lastName?: string;
    email: string;
    profileImageUrl?: string;
    avatarUrl?: string;
    handle?: string;
    customHandle?: string;
  } | null;
  size?: "sm" | "md" | "lg" | "xl" | number;
  style?: any;
  showFrame?: boolean;
}

export default function UserAvatar({ user, size = "md", style, showFrame = false }: UserAvatarProps) {
  const [imageError, setImageError] = useState(false);
  
  // Handle numeric size values
  const getSizeStyles = () => {
    if (typeof size === 'number') {
      return { width: size, height: size };
    }
    
    const sizeStyles = {
      sm: { width: 32, height: 32 },
      md: { width: 40, height: 40 }, 
      lg: { width: 64, height: 64 }, // Increased size for better profile visibility
      xl: { width: 96, height: 96 }, // Increased size for profile headers
    };
    
    return sizeStyles[size];
  };
  
  const getTextSizeStyles = () => {
    if (typeof size === 'number') {
      return { fontSize: Math.max(12, size * 0.35) };
    }
    
    const textSizeStyles = {
      sm: { fontSize: 12 },
      md: { fontSize: 14 },
      lg: { fontSize: 16 }, 
      xl: { fontSize: 20 },
    };
    
    return textSizeStyles[size];
  };
  
  const sizeStyles = getSizeStyles();
  const textSizeStyles = getTextSizeStyles();

  if (!user) {
    const avatarContent = (
      <View style={[
        styles.avatar,
        sizeStyles,
        { backgroundColor: '#e5e7eb' },
        style
      ]}>
        <Text style={[styles.fallbackText, textSizeStyles, { color: '#6b7280' }]}>
          ?
        </Text>
      </View>
    );

    if (showFrame) {
      return (
        <ProfileFrame rarity="common" profilePictureSize={typeof size === 'number' ? size : parseInt(sizeStyles.width)}>
          {avatarContent}
        </ProfileFrame>
      );
    }

    return avatarContent;
  }

  // Generate a consistent color based on user ID
  const colors = [
    ['#a855f7', '#ec4899'], // purple to pink
    ['#3b82f6', '#8b5cf6'], // blue to purple
    ['#10b981', '#3b82f6'], // green to blue
    ['#ec4899', '#ef4444'], // pink to red
    ['#6366f1', '#8b5cf6'], // indigo to purple
    ['#f59e0b', '#f97316'], // yellow to orange
    ['#14b8a6', '#3b82f6'], // teal to blue
    ['#ef4444', '#ec4899'], // red to pink
  ];

  // Safe color calculation with proper fallbacks
  let colorIndex = 0;
  if (user?.id) {
    const numericId = user.id.replace(/\D/g, '');
    if (numericId && numericId.length > 0) {
      colorIndex = parseInt(numericId, 10) % colors.length;
      // Handle NaN case
      if (isNaN(colorIndex)) {
        colorIndex = 0;
      }
    }
  }
  
  const selectedColors = colors[colorIndex] || colors[0];
  const startColor = selectedColors?.[0] || '#a855f7';
  const endColor = selectedColors?.[1] || '#ec4899';

  // Handle backend image URLs with cache busting for OpenAI images
  const imageUrl = user.profileImageUrl || user.avatarUrl;
  let processedImageUrl = imageUrl;
  
  if (imageUrl) {
    // Add cache-busting for OpenAI generated images to ensure fresh loads
    if (imageUrl.includes('oaidalleapiprodscus')) {
      processedImageUrl = `${imageUrl}&cache_bust=${Date.now()}`;
    } else if (imageUrl.startsWith('/generated-images/') || imageUrl.includes('/generated-images/')) {
      // Handle local backend storage images - access directly from assets
      const filename = imageUrl.split('/').pop();
      if (filename) {
        processedImageUrl = `/generated-images/${filename}`;
        console.log('Loading image directly from static assets');
      } else {
        processedImageUrl = undefined;
      }
    }
  }

  const displayName = user.firstName && user.lastName 
    ? `${user.firstName} ${user.lastName}`
    : (user.email ? user.email.split('@')[0] : 'User');
  
  const initials = user.firstName && user.lastName
    ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    : displayName.substring(0, 2).toUpperCase();

  if (processedImageUrl && !imageError) {
    const avatarContent = (
      <View style={[sizeStyles, style]}>
        <Image
          source={{ uri: processedImageUrl }}
          style={[styles.avatar, sizeStyles]}
          resizeMode="cover" // Use cover to fill the space without cropping
          onError={(error) => {
            console.log('Avatar image failed to load:', error.message || 'unknown error');
            setImageError(true);
          }}
        />
      </View>
    );

    if (showFrame) {
      const rarity = determineUserRarity(user);
      return (
        <ProfileFrame rarity={rarity} profilePictureSize={typeof size === 'number' ? size : parseInt(sizeStyles.width)}>
          {avatarContent}
        </ProfileFrame>
      );
    }

    return avatarContent;
  }

  const avatarContent = (
    <View style={[
      styles.avatar,
      sizeStyles,
      { backgroundColor: startColor }, // Using start color as fallback
      style
    ]}>
      <Text style={[styles.fallbackText, textSizeStyles]}>
        {initials}
      </Text>
    </View>
  );

  if (showFrame) {
    const rarity = determineUserRarity(user);
    return (
      <ProfileFrame rarity={rarity} size={(typeof size === 'number' ? size : sizeStyles.width) * 1.125}>
        {avatarContent}
      </ProfileFrame>
    );
  }

  return avatarContent;
}

const styles = StyleSheet.create({
  avatar: {
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackText: {
    color: '#ffffff',
    fontWeight: '600',
  },
});