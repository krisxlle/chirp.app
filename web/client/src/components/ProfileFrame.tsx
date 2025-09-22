import React from 'react';

interface ProfileFrameProps {
  rarity: 'mythic' | 'legendary' | 'epic' | 'rare' | 'uncommon' | 'common';
  size?: number;
  children: React.ReactNode;
  className?: string;
}

const rarityFrameColors = {
  mythic: 'from-purple-600 via-pink-600 to-yellow-400',
  legendary: 'from-yellow-500 via-orange-500 to-red-500',
  epic: 'from-purple-500 via-blue-500 to-indigo-500',
  rare: 'from-blue-500 via-cyan-500 to-teal-500',
  uncommon: 'from-green-500 via-emerald-500 to-teal-500',
  common: 'from-gray-400 via-gray-500 to-gray-600',
};

export default function ProfileFrame({ rarity, size = 60, children, className = '' }: ProfileFrameProps) {
  const frameSize = size * 1.8; // Frame is 80% larger than the base size
  const profileSize = frameSize * 0.45; // Profile picture is 45% of frame size
  const frameThickness = (frameSize - profileSize) / 2; // Calculate frame thickness
  
  return (
    <div 
      className={`relative flex items-center justify-center ${className}`}
      style={{ width: frameSize, height: frameSize }}
    >
      {/* Profile Picture Container */}
      <div 
        className="relative z-10 rounded-full overflow-hidden"
        style={{ width: profileSize, height: profileSize }}
      >
        {children}
      </div>
      
      {/* Frame Ring - Only the border, not covering the center */}
      <div 
        className={`absolute inset-0 rounded-full bg-gradient-to-r ${rarityFrameColors[rarity]}`}
        style={{ width: frameSize, height: frameSize }}
      >
        {/* Inner circle to create the frame effect */}
        <div 
          className="absolute rounded-full bg-white"
          style={{ 
            width: profileSize, 
            height: profileSize,
            top: frameThickness,
            left: frameThickness
          }}
        ></div>
      </div>
    </div>
  );
}
