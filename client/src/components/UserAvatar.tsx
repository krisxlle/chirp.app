import React, { useEffect, useState } from 'react';
import ProfileFrame from './ProfileFrame';
import { useEquippedFrame } from '../contexts/EquippedFrameContext';

// Inline rarity determination function to avoid import issues
const determineUserRarity = (user: {
  id: string;
  handle?: string;
  firstName?: string;
  customHandle?: string;
}): 'mythic' | 'legendary' | 'epic' | 'rare' | 'uncommon' | 'common' => {
  if (!user) return 'common';
  
  const userHandle = (user.handle || '').toLowerCase();
  const userName = (user.firstName || user.customHandle || '').toLowerCase();
  
  // Bot detection with hardcoded rarities
  if (userHandle.includes('crimsontalon') || userName.includes('crimsontalon')) {
    return 'mythic';
  } else if (userHandle.includes('solarius') || userName.includes('solarius')) {
    return 'legendary';
  } else if (userHandle.includes('prisma') || userName.includes('prisma')) {
    return 'epic';
  } else if (userHandle.includes('skye') || userName.includes('skye')) {
    return 'rare';
  } else if (userHandle.includes('thorne') || userName.includes('thorne')) {
    return 'uncommon';
  } else if (userHandle.includes('obsidian') || userName.includes('obsidian')) {
    return 'common';
  }
  
  // For regular users, we need a consistent way to determine rarity
  // We'll use a hash of the user ID to ensure consistency
  const userId = user.id;
  const hash = userId.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  
  const rarityRoll = Math.abs(hash) % 100;
  
  if (rarityRoll < 1) return 'mythic';      // 1%
  else if (rarityRoll < 5) return 'legendary';  // 4%
  else if (rarityRoll < 15) return 'epic';      // 10%
  else if (rarityRoll < 35) return 'rare';      // 20%
  else if (rarityRoll < 65) return 'uncommon';  // 30%
  else return 'common';                           // 35%
};

interface User {
  id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  customHandle?: string;
  handle?: string;
  profileImageUrl?: string;
  avatarUrl?: string;
}

interface UserAvatarProps {
  user?: User | null;
  size?: 'sm' | 'md' | 'lg' | 'xl' | number;
  onPress?: () => void;
  showFrame?: boolean;
  style?: React.CSSProperties;
}

export default function UserAvatar({ user, size = 'md', onPress, showFrame = false, style }: UserAvatarProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const { equippedFrames, fetchEquippedFrame } = useEquippedFrame();
  const [equippedFrame, setEquippedFrame] = useState<any>(null);
  
  // Load equipped frame for the user
  useEffect(() => {
    if (user?.id) {
      loadEquippedFrame();
    }
  }, [user?.id]);

  const loadEquippedFrame = async () => {
    try {
      if (user?.id) {
        const frame = await fetchEquippedFrame(user.id);
        setEquippedFrame(frame);
      }
    } catch (error) {
      console.error('Error loading equipped frame:', error);
    }
  };
  const getSizeStyles = () => {
    if (typeof size === 'number') {
      return { width: `${size}px`, height: `${size}px` };
    }
    
    const sizeStyles = {
      sm: { width: '32px', height: '32px' },
      md: { width: '45px', height: '45px' }, // Increased from 40px for better visibility
      lg: { width: '64px', height: '64px' }, // Increased size for better profile visibility
      xl: { width: '96px', height: '96px' }, // Increased size for profile headers
    };
    
    return sizeStyles[size];
  };
  
  const getTextSizeStyles = () => {
    if (typeof size === 'number') {
      return { fontSize: `${Math.max(12, size * 0.35)}px` };
    }
    
    const textSizeStyles = {
      sm: { fontSize: '12px' },
      md: { fontSize: '14px' },
      lg: { fontSize: '16px' }, 
      xl: { fontSize: '20px' },
    };
    
    return textSizeStyles[size];
  };
  
  const sizeStyles = getSizeStyles();
  const textSizeStyles = getTextSizeStyles();

  if (!user) {
    const avatarContent = (
      <div style={{
        borderRadius: '50%',
        ...sizeStyles,
        backgroundColor: '#e5e7eb',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...style
      }}>
        <span style={{
          ...textSizeStyles,
          color: '#6b7280',
          fontWeight: '600'
        }}>
          ?
        </span>
      </div>
    );

    if (showFrame && equippedFrame) {
      return (
        <ProfileFrame 
          rarity={equippedFrame.rarity} 
          size={typeof size === 'number' ? size : parseInt(sizeStyles.width)}
          customFrameImage={equippedFrame.imageUrl}
        >
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

  // Generate a profile image URL for users without one
  const generateProfileImageUrl = (user: User): string => {
    const initials = user.firstName && user.lastName
      ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
      : (user.email ? user.email.split('@')[0].substring(0, 2).toUpperCase() : 'U');
    
    // Create a data URL for a simple gradient avatar
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 200;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      // Create gradient background
      const gradient = ctx.createLinearGradient(0, 0, 200, 200);
      gradient.addColorStop(0, startColor);
      gradient.addColorStop(1, endColor);
      
      // Draw background
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 200, 200);
      
      // Draw initials
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 80px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(initials, 100, 100);
    }
    
    return canvas.toDataURL();
  };
  // Handle backend image URLs with cache busting for OpenAI images
  const imageUrl = user.profileImageUrl || user.avatarUrl;
  let processedImageUrl = imageUrl;
  
  // Debug logging removed to reduce console noise
  
  if (imageUrl) {
    // Add cache-busting for OpenAI generated images to ensure fresh loads
    if (imageUrl.includes('oaidalleapiprodscus')) {
      processedImageUrl = `${imageUrl}&cache_bust=${Date.now()}`;
    } else if (imageUrl.startsWith('/generated-images/') || imageUrl.includes('/generated-images/')) {
      // Handle local backend storage images - access directly from assets
      const filename = imageUrl.split('/').pop();
      if (filename) {
        processedImageUrl = `/generated-images/${filename}`;
        // Loading image directly from static assets
      } else {
        processedImageUrl = undefined;
      }
    }
  } else {
    // Generate a profile image if none exists
    processedImageUrl = generateProfileImageUrl(user);
    // Generated profile image for user without image
  }

  const displayName = user.firstName && user.lastName 
    ? `${user.firstName} ${user.lastName}`
    : (user.email ? user.email.split('@')[0] : 'User');
  
  const initials = user.firstName && user.lastName
    ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    : displayName.substring(0, 2).toUpperCase();

  if (processedImageUrl && !imageError) {
    const avatarContent = (
      <div style={{ ...sizeStyles, ...style }}>
        <img
          src={processedImageUrl}
          alt={`${displayName}'s avatar`}
          style={{
            borderRadius: '50%',
            ...sizeStyles,
            objectFit: 'cover'
          }}
          onError={(error) => {
            // Avatar image failed to load, using fallback
            setImageError(true);
          }}
        />
      </div>
    );

    if (equippedFrame) {
      console.log('🖼️ UserAvatar equipped frame debug:', {
        userId: user.id,
        userHandle: user.handle,
        userName: user.firstName || user.customHandle,
        equippedFrame: equippedFrame,
        showFrame
      });
      return (
        <ProfileFrame 
          rarity={equippedFrame.rarity} 
          size={typeof size === 'number' ? size : parseInt(sizeStyles.width)}
          customFrameImage={equippedFrame.imageUrl}
        >
          {avatarContent}
        </ProfileFrame>
      );
    }

    return avatarContent;
  }

  const avatarContent = (
    <div style={{
      borderRadius: '50%',
      ...sizeStyles,
      backgroundColor: startColor, // Using start color as fallback
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      ...style
    }}>
      <span style={{
        ...textSizeStyles,
        color: '#ffffff',
        fontWeight: '600'
      }}>
        {initials}
      </span>
    </div>
  );

  if (equippedFrame) {
    console.log('🖼️ UserAvatar equipped frame debug (fallback):', {
      userId: user.id,
      userHandle: user.handle,
      userName: user.firstName || user.customHandle,
      equippedFrame: equippedFrame,
      showFrame
    });
    return (
      <ProfileFrame 
        rarity={equippedFrame.rarity} 
        size={(typeof size === 'number' ? size : parseInt(sizeStyles.width)) * 1.125}
        customFrameImage={equippedFrame.imageUrl}
      >
        {avatarContent}
      </ProfileFrame>
    );
  }

  return avatarContent;
}