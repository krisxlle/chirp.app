import React from 'react';
import { Image, StyleSheet, View, ViewStyle } from 'react-native';

interface ProfileFrameProps {
  rarity: 'mythic' | 'legendary' | 'epic' | 'rare' | 'uncommon' | 'common';
  size?: number;
  children: React.ReactNode;
  style?: ViewStyle;
}

const rarityFrameImages = {
  mythic: require('../public/assets/Mystical Frame.png'),
  legendary: require('../public/assets/Legendary Frame.png'),
  epic: require('../public/assets/Epic Frame.png'),
  rare: require('../public/assets/Rare Frame.png'),
  uncommon: require('../public/assets/Uncommon Frame.png'),
  common: require('../public/assets/Common Frame.png'),
};

export default function ProfileFrame({ rarity, size = 60, children, style }: ProfileFrameProps) {
  const frameImage = rarityFrameImages[rarity];
  
  // Make frame bigger and profile picture smaller
  const frameSize = size * 1.8; // Keep frame size the same (80% larger)
  const profileSize = Math.max(frameSize * 0.18, frameSize - 110); // Make profile smaller (18% of frame size - 10% smaller)
  
  return (
    <View style={[styles.container, { width: frameSize, height: frameSize }, style]}>
      {/* Profile Picture Container */}
      <View style={[styles.profileContainer, { width: profileSize, height: profileSize }]}>
        {children}
      </View>
      
      {/* Frame Overlay */}
      <Image
        source={frameImage}
        style={[styles.frame, { width: frameSize, height: frameSize }]}
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
    alignSelf: 'center',
  },
  frame: {
    position: 'absolute',
    zIndex: 1,
  },
});
