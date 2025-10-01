import React from 'react';

interface ProfileFrameProps {
  rarity: 'mythic' | 'legendary' | 'epic' | 'rare' | 'uncommon' | 'common';
  size?: number; // Deprecated: use profilePictureSize instead
  profilePictureSize?: number; // Size of the profile picture in pixels
  children: React.ReactNode;
  className?: string;
}

const rarityFrameImages = {
  mythic: '/assets/Season 1/Purple Bird Frame Mythic.png',
  legendary: '/assets/Season 1/Green Leaf Frame Legendary.png',
  epic: '/assets/Season 1/Red Cat Frame Epic.png',
  rare: '/assets/Season 1/Pink Fairy Frame Rare.png',
  uncommon: '/assets/Season 1/Green Mushroom Frame Uncommon.png',
  common: '/assets/Season 1/Simple Gray Frame Common.png',
};

export default function ProfileFrame({ rarity, size = 60, profilePictureSize, children, className = '' }: ProfileFrameProps) {
  const frameImage = rarityFrameImages[rarity];
  
  // Calculate proper sizing for frame and profile picture
  // Use profilePictureSize if provided, otherwise fall back to size prop for backward compatibility
  const baseSize = profilePictureSize || size;
  const frameSize = baseSize * 1.8; // Frame is 80% larger than the profile picture size
  const profileSize = baseSize; // Profile picture size matches the passed size
  
  console.log('🎯 WEB ProfileFrame render:', { rarity, frameImage, frameSize, profileSize, size });
  
  return (
    <div 
      className={`relative flex items-center justify-center border-4 border-red-500 ${className}`}
      style={{ width: frameSize, height: frameSize }}
    >
      {/* Profile Picture Container */}
      <div 
        className="absolute flex items-center justify-center border-2 border-blue-500"
        style={{ 
          width: profileSize, 
          height: profileSize,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)'
        }}
      >
        {children}
      </div>
      
      {/* Frame Overlay */}
      <img
        src={frameImage}
        alt={`${rarity} frame`}
        className="absolute inset-0 w-full h-full object-contain border-2 border-green-500"
        style={{ width: frameSize, height: frameSize }}
        onLoad={() => console.log('Frame image loaded:', frameImage)}
        onError={(e) => console.error('Frame image failed to load:', frameImage, e)}
      />
    </div>
  );
}
