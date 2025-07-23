import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { ThemedText } from './ThemedText';

// Wave Hand Icon Component
const WaveIcon = ({ size = 28 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path 
      d="M5.5 13.5L9 17l1.5-1.5L7 12l1-1.5L6 9 4.5 10.5 3 9l-1.5 1.5L3 12l2.5 1.5zM21 9l-1.5-1.5L18 9l-1.5-1.5L15 9l2.5 3-1.5 1.5L14.5 12 13 13.5l1.5 1.5L17 13l2.5 2.5L21 14l-2.5-2.5L21 9z" 
      fill="#7c3aed"
    />
    <Path 
      d="M7 5a1 1 0 0 1 2 0v6a1 1 0 0 1-2 0V5zM11 3a1 1 0 0 1 2 0v8a1 1 0 0 1-2 0V3zM15 4a1 1 0 0 1 2 0v7a1 1 0 0 1-2 0V4zM19 6a1 1 0 0 1 2 0v5a1 1 0 0 1-2 0V6z" 
      fill="#7c3aed"
    />
  </Svg>
);

export function HelloWave() {
  const rotationAnimation = useSharedValue(0);

  useEffect(() => {
    rotationAnimation.value = withRepeat(
      withSequence(withTiming(25, { duration: 150 }), withTiming(0, { duration: 150 })),
      4 // Run the animation 4 times
    );
  }, [rotationAnimation]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotationAnimation.value}deg` }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <WaveIcon size={28} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  text: {
    fontSize: 28,
    lineHeight: 32,
    marginTop: -6,
  },
});
