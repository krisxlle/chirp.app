import React from 'react';

interface ProfileFrameProps {
  rarity: 'mythic' | 'legendary' | 'epic' | 'rare' | 'uncommon' | 'common';
  size?: number;
  children: React.ReactNode;
  className?: string;
}

const rarityFrameImages = {
  mythic: '/assets/Mystical Frame.png',
  legendary: '/assets/Legendary Frame.png',
  epic: '/assets/Epic Frame.png',
  rare: '/assets/Rare Frame.png',
  uncommon: '/assets/Uncommon Frame.png',
  common: '/assets/Common Frame.png',
};

export default function ProfileFrame({ rarity, size = 60, children, className = '' }: ProfileFrameProps) {
  const frameImage = rarityFrameImages[rarity];
  
  // Calculate proper sizing for frame and profile picture
  const frameSize = size * 1.8; // Frame is 80% larger than the base size
  const profileSize = frameSize * 0.45; // Profile picture is 45% of frame size
  
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
