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
  
  // Calculate proper sizing for frame and profile picture
  const frameSize = size * 1.8; // Frame is 80% larger than the base size
  const profileSize = frameSize * 0.45; // Increased from 0.5 to 0.65 for better fit
  
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
