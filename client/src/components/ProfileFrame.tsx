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
  
  // Use custom frame image if provided, otherwise use rarity-based image
  const frameImage = customFrameImage || getRarityFrameImage(rarity);

  const FRAME_FILL_SCALE_BY_RARITY: Record<string, number> = {
    common: 1.30,
    uncommon: 1.36,
    rare: 1.38,
    epic: 1.36,
    legendary: 1.38,
    // Same fill + slot as common so ornate mythic art scales into the same feed footprint (no clipping).
    mythic: 1.30,
  };
  const scale = FRAME_FILL_SCALE_BY_RARITY[rarity] ?? 1.42;
  const baseSize = profilePictureSize || size;
  // At large sizes (profile header), the assets' inner openings don't scale perfectly.
  // Slightly reduce the effective scale so the photo doesn't exceed the frame.
  const effectiveScale = baseSize >= 100 ? scale * 0.90 : scale;
  // One layout slot for all non-rare frames in the feed: mythic PNG scales down inside the same box as common.
  const containerMultiplier = rarity === 'rare' ? 2.3 : 1.92;
  const containerSize = Math.round(baseSize * containerMultiplier);
  const profileSize = Math.round(baseSize * effectiveScale);
  // Season 1 holes sit slightly left of center — same horizontal bias for every tier (including mythic).
  const leftBias = Math.round(baseSize * 0.05);
  const offset =
    rarity === 'rare'
      ? { x: 0, y: Math.max(1, Math.round(baseSize * 0.06)) }
      : { x: -leftBias, y: 0 };
  const left = (containerSize - profileSize) / 2 + offset.x;
  const top = (containerSize - profileSize) / 2 + offset.y;

  return (
    <div style={{
      position: 'relative',
      width: containerSize,
      height: containerSize,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'visible',
      ...style
    }}>
      <div style={{
        position: 'absolute',
        width: profileSize,
        height: profileSize,
        borderRadius: '50%',
        overflow: 'hidden',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        left,
        top,
        zIndex: 0
      }}>
        <div style={{
          width: baseSize,
          height: baseSize,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          transform: `scale(${effectiveScale})`,
          transformOrigin: 'center center'
        }}>
          {children}
        </div>
      </div>
      {!imageError && (
        <img
          src={frameImage}
          alt={`${rarity} frame`}
          onError={(e) => {
            console.error('❌ ProfileFrame image failed to load:', { src: frameImage, rarity, error: e });
            setImageError(true);
          }}
          style={{
            position: 'absolute',
            left: 0,
            top: rarity === 'rare' ? -2 : 0,
            width: containerSize,
            height: containerSize,
            objectFit: 'contain',
            zIndex: 1,
            pointerEvents: 'none'
          }}
        />
      )}
      {imageError && (
        <div style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: containerSize,
          height: containerSize,
          border: `3px solid ${getRarityColor(rarity)}`,
          borderRadius: '50%',
          zIndex: 1,
          pointerEvents: 'none'
        }} />
      )}
    </div>
  );
}
