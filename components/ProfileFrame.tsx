import React from 'react';
import { Image, StyleSheet, View, ViewStyle } from 'react-native';

interface ProfileFrameProps {
  rarity: 'mythic' | 'legendary' | 'epic' | 'rare' | 'uncommon' | 'common';
  size?: number; // Deprecated: use profilePictureSize instead
  profilePictureSize?: number; // Size of the profile picture in pixels
  children: React.ReactNode;
  style?: ViewStyle;
}

const rarityFrameImages = {
  mythic: require('../public/assets/Season 1/Purple Bird Frame Mythic.png'),
  legendary: require('../public/assets/Season 1/Green Leaf Frame Legendary.png'),
  epic: require('../public/assets/Season 1/Red Cat Frame Epic.png'),
  rare: require('../public/assets/Season 1/Pink Fairy Frame Rare.png'),
  uncommon: require('../public/assets/Season 1/Green Mushroom Frame Uncommon.png'),
  common: require('../public/assets/Season 1/Simple Gray Frame Common.png'),
};

// Scale circle per frame so it fills the opening. All frames same outer size (containerSize). Fairy: smaller circle so photo fits.
const FRAME_FILL_SCALE_BY_RARITY: Record<string, number> = {
  common: 1.36,
  uncommon: 1.42,
  rare: 1.42,   // Fairy: keep PFP same size as others
  epic: 1.42,
  legendary: 1.44,
  mythic: 1.42,
};

export default function ProfileFrame({ rarity, size = 60, profilePictureSize, children, style }: ProfileFrameProps) {
  const frameImage = rarityFrameImages[rarity];
  const scale = FRAME_FILL_SCALE_BY_RARITY[rarity] ?? 1.42;
  const baseSize = profilePictureSize || size;
  const effectiveScale = baseSize >= 100 ? scale * 0.90 : scale;
  // Fairy frame has a tight/winged opening; allow the frame to extend further out.
  const containerMultiplier = rarity === 'rare' ? 2.3 : 1.8;
  const containerSize = Math.round(baseSize * containerMultiplier);
  const profileSize = Math.round(baseSize * effectiveScale);
  // The fairy frame's inner ring is slightly offset in the PNG; use a proportional nudge
  // so it stays aligned at small feed sizes and larger profile sizes.
  const offset = rarity === 'rare' ? { x: 0, y: Math.max(1, Math.round(baseSize * 0.06)) } : { x: 0, y: 0 };
  const left = (containerSize - profileSize) / 2 + offset.x;
  const top = (containerSize - profileSize) / 2 + offset.y;

  return (
    <View style={[styles.container, { width: containerSize, height: containerSize }, style]}>
      <View
        style={[
          styles.profileContainer,
          {
            width: profileSize,
            height: profileSize,
            borderRadius: profileSize / 2,
            left,
            top,
          },
        ]}
      >
        <View style={[styles.profileInner, { width: baseSize, height: baseSize, transform: [{ scale: effectiveScale }] }]}>
          {children}
        </View>
      </View>
      <Image
        source={frameImage}
        style={[
          styles.frame,
          {
            width: containerSize,
            height: containerSize,
            top: rarity === 'rare' ? -2 : 0,
          },
        ]}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  profileInner: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  frame: {
    position: 'absolute',
    zIndex: 1,
  },
});
