import React from 'react';

interface ProfileFrameProps {
  rarity: 'mythic' | 'legendary' | 'epic' | 'rare' | 'uncommon' | 'common';
  size?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

const getAssetBaseUrl = () => {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:5000';
    }
    // Use the same domain for production assets
    return `${window.location.protocol}//${window.location.host}`;
  }
  return 'http://localhost:5000';
};

const getRarityFrameImage = (rarity: string) => {
  // Use static imports for better reliability on Vercel
  const frameImages = {
    mythic: '/assets/Mystical Frame.png',
    legendary: '/assets/Legendary Frame.png',
    epic: '/assets/Epic Frame.png',
    rare: '/assets/Rare Frame.png',
    uncommon: '/assets/Uncommon Frame.png',
    common: '/assets/Common Frame.png',
  };
  return frameImages[rarity as keyof typeof frameImages];
};

export default function ProfileFrame({ rarity, size = 60, children, style }: ProfileFrameProps) {
  const frameImage = getRarityFrameImage(rarity);
  
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
      <img
        src={frameImage}
        alt={`${rarity} frame`}
        style={{
          position: 'absolute',
          width: frameSize,
          height: frameSize,
          objectFit: 'contain',
          zIndex: 1,
          pointerEvents: 'none'
        }}
      />
    </div>
  );
}
