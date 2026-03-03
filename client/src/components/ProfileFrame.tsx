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
  
  const FRAME_FILL_SCALE_BY_RARITY: Record<string, number> = {
    common: 1.36,
    uncommon: 1.42,
    rare: 1.42,
    epic: 1.42,
    legendary: 1.44,
    mythic: 1.42,
  };
  const scale = FRAME_FILL_SCALE_BY_RARITY[rarity] ?? 1.42;
  const baseSize = profilePictureSize || size;
  // At large sizes (profile header), the assets' inner openings don't scale perfectly.
  // Slightly reduce the effective scale so the photo doesn't exceed the frame.
  const effectiveScale = baseSize >= 100 ? scale * 0.90 : scale;
  const containerMultiplier = rarity === 'rare' ? 2.3 : 1.8;
  const containerSize = Math.round(baseSize * containerMultiplier);
  const profileSize = Math.round(baseSize * effectiveScale);
  const offset = rarity === 'rare' ? { x: 0, y: Math.max(1, Math.round(baseSize * 0.06)) } : { x: 0, y: 0 };
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
            width: containerSize,
            height: containerSize,
            top: rarity === 'rare' ? -2 : 0,
            objectFit: 'contain',
            zIndex: 1,
            pointerEvents: 'none'
          }}
          onLoad={() => setImageLoaded(true)}
        />
      )}
      {imageError && (
        <div style={{
          position: 'absolute',
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
