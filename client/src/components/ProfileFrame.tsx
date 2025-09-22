import React, { useState } from 'react';

interface ProfileFrameProps {
  rarity: 'mythic' | 'legendary' | 'epic' | 'rare' | 'uncommon' | 'common';
  size?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
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
  // Try multiple approaches for better reliability
  const frameImages = {
    mythic: '/assets/Mystical Frame.png',
    legendary: '/assets/Legendary Frame.png',
    epic: '/assets/Epic Frame.png',
    rare: '/assets/Rare Frame.png',
    uncommon: '/assets/Uncommon Frame.png',
    common: '/assets/Common Frame.png',
  };
  
  // Also try with different base paths for different environments
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const imagePath = frameImages[rarity as keyof typeof frameImages];
  
  // Return the image path - we'll handle fallbacks in the component
  return imagePath;
};

export default function ProfileFrame({ rarity, size = 60, children, style }: ProfileFrameProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const frameImage = getRarityFrameImage(rarity);
  
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
  const frameSize = size * 1.8; // Frame is 80% larger than the base size
  const profileSize = frameSize * 0.45; // Profile picture size within frame
  
  return (
    <div style={{
      position: 'relative',
      width: frameSize,
      height: frameSize,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
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
        top: '30%', // Centered vertically in the frame
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
          onLoad={() => {
            console.log('✅ ProfileFrame image loaded successfully:', frameImage);
            setImageLoaded(true);
          }}
          style={{
            position: 'absolute',
            width: frameSize,
            height: frameSize,
            objectFit: 'contain',
            zIndex: 1,
            pointerEvents: 'none'
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
