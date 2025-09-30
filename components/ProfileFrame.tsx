import React from 'react';
import { Image, StyleSheet, View, ViewStyle } from 'react-native';

interface ProfileFrameProps {
  rarity: 'mythic' | 'legendary' | 'epic' | 'rare' | 'uncommon' | 'common';
  size?: number;
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

export default function ProfileFrame({ rarity, size = 60, children, style }: ProfileFrameProps) {
  const frameImage = rarityFrameImages[rarity];
  
  // Calculate proper sizing for frame and profile picture
  const frameSize = size * 1.8; // Frame is 80% larger than the base size
  const profileSize = frameSize * 0.45; // Profile picture is 45% of frame size
  
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
    top: '30%', // Centered vertically in the frame
  },
  frame: {
    position: 'absolute',
    zIndex: 1,
  },
});
