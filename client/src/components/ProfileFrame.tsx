import React, { useState } from 'react';

interface ProfileFrameProps {
  rarity: 'mythic' | 'legendary' | 'epic' | 'rare' | 'uncommon' | 'common';
  size?: number; // Deprecated: use profilePictureSize instead
  profilePictureSize?: number; // Size of the profile picture in pixels
  children: React.ReactNode;
  style?: React.CSSProperties;
  customFrameImage?: string; // Allow custom frame image for equipped frames
}

const getRarityColor = (rarity: string) => {
  const colors = {
    mythic: '#FFD700',      // Gold
    legendary: '#FF6B35',    // Orange
    epic: '#8A2BE2',        // Blue Violet
    rare: '#00BFFF',        // Deep Sky Blue
    uncommon: '#32CD32',    // Lime Green
    common: '#C0C0C0',      // Silver
  };
  return colors[rarity as keyof typeof colors] || '#C0C0C0';
};

const getRarityFrameImage = (rarity: string) => {
  // Use Season 1 frame assets
  const frameImages = {
    mythic: '/assets/Season 1/Purple Bird Frame Mythic.png',
    legendary: '/assets/Season 1/Green Leaf Frame Legendary.png',
    epic: '/assets/Season 1/Red Cat Frame Epic.png',
    rare: '/assets/Season 1/Pink Fairy Frame Rare.png',
    uncommon: '/assets/Season 1/Green Mushroom Frame Uncommon.png',
    common: '/assets/Season 1/Simple Gray Frame Common.png',
  };
  
  // Also try with different base paths for different environments
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const imagePath = frameImages[rarity as keyof typeof frameImages];
  
  // Return the image path - we'll handle fallbacks in the component
  return imagePath;
};

export default function ProfileFrame({ rarity, size = 60, profilePictureSize, children, style, customFrameImage }: ProfileFrameProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  // Use custom frame image if provided, otherwise use rarity-based image
  const frameImage = customFrameImage || getRarityFrameImage(rarity);
  
  // Debug logging for asset loading
  console.log('🖼️ ProfileFrame debug:', {
    rarity,
    frameImage,
    hostname: typeof window !== 'undefined' ? window.location.hostname : 'server',
    protocol: typeof window !== 'undefined' ? window.location.protocol : 'server',
    fullUrl: typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.host}${frameImage}` : 'server',
    imageError,
    imageLoaded
  });
  
  // Calculate proper sizing for frame and profile picture
  // Use profilePictureSize if provided, otherwise fall back to size prop for backward compatibility
  const baseSize = profilePictureSize || size;
  const frameSize = baseSize * 1.8; // Frame is 80% larger than the profile picture size
  const profileSize = baseSize; // Profile picture size matches the passed size
  
  // Debug logging for profile page
  if (profilePictureSize === 80) {
    console.log('🔍 ProfileFrame debug:', {
      profilePictureSize,
      baseSize,
      frameSize,
      profileSize,
      rarity
    });
  }
  
  return (
    <div style={{
      position: 'relative',
      width: frameSize,
      height: frameSize,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'visible', // Ensure frame is not clipped
      // Don't override parent positioning
      ...style
    }}>
      {/* Profile Picture Container */}
      <div style={{
        position: 'absolute',
        width: profileSize,
        height: profileSize,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        top: '50%', // Centered vertically in the frame
        left: '50%', // Centered horizontally in the frame
        transform: 'translate(-50%, -50%)', // Center both horizontally and vertically
        zIndex: 0
      }}>
        {children}
      </div>
      
      {/* Frame Overlay */}
      {!imageError && (
        <img
          src={frameImage}
          alt={`${rarity} frame`}
          onError={(e) => {
            console.error('❌ ProfileFrame image failed to load:', {
              src: frameImage,
              rarity,
              error: e
            });
            setImageError(true);
          }}
          style={{
            position: 'absolute',
            width: frameSize,
            height: frameSize,
            objectFit: 'contain',
            zIndex: 1,
            pointerEvents: 'none'
          }}
          onLoad={() => {
            console.log('✅ ProfileFrame image loaded successfully:', frameImage);
            if (profilePictureSize === 80) {
              console.log('🔍 Frame image size debug:', {
                frameSize,
                imageElement: 'loaded',
                rarity
              });
            }
            setImageLoaded(true);
          }}
        />
      )}
      
      {/* Fallback: Show a colored border if image fails to load */}
      {imageError && (
        <div style={{
          position: 'absolute',
          width: frameSize,
          height: frameSize,
          border: `3px solid ${getRarityColor(rarity)}`,
          borderRadius: '50%',
          zIndex: 1,
          pointerEvents: 'none'
        }} />
      )}
    </div>
  );
}
