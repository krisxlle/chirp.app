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

const FRAME_FILL_SCALE_BY_RARITY: Record<string, number> = {
  common: 1.36,
  uncommon: 1.42,
  rare: 1.42,
  epic: 1.42,
  legendary: 1.44,
  mythic: 1.42,
};

export default function ProfileFrame({ rarity, size = 60, profilePictureSize, children, className = '' }: ProfileFrameProps) {
  const frameImage = rarityFrameImages[rarity];
  const scale = FRAME_FILL_SCALE_BY_RARITY[rarity] ?? 1.48;
  const baseSize = profilePictureSize || size;
  const effectiveScale = baseSize >= 100 ? scale * 0.90 : scale;
  const containerMultiplier = rarity === 'rare' ? 2.3 : 1.8;
  const containerSize = Math.round(baseSize * containerMultiplier);
  const profileSize = Math.round(baseSize * effectiveScale);
  const offset = rarity === 'rare' ? { x: 0, y: Math.max(1, Math.round(baseSize * 0.06)) } : { x: 0, y: 0 };
  const left = (containerSize - profileSize) / 2 + offset.x;
  const top = (containerSize - profileSize) / 2 + offset.y;

  return (
    <div className={`relative flex items-center justify-center ${className}`} style={{ width: containerSize, height: containerSize }}>
      <div className="absolute flex items-center justify-center overflow-hidden rounded-full" style={{ width: profileSize, height: profileSize, left, top }}>
        <div className="flex items-center justify-center" style={{ width: baseSize, height: baseSize, transform: `scale(${effectiveScale})`, transformOrigin: 'center center' }}>
          {children}
        </div>
      </div>
      <img
        src={frameImage}
        alt={`${rarity} frame`}
        className="absolute w-full h-full object-contain"
        style={{
          width: containerSize,
          height: containerSize,
          left: 0,
          top: rarity === 'rare' ? -2 : 0,
        }}
        onError={(e) => console.error('Frame image failed to load:', frameImage, e)}
      />
    </div>
  );
}
