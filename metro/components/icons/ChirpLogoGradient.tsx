import React from 'react';
import { View } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Path, Circle } from 'react-native-svg';

interface ChirpLogoGradientProps {
  size?: number;
}

export default function ChirpLogoGradient({ size = 48 }: ChirpLogoGradientProps) {
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 200 200" fill="none">
        <Defs>
          <LinearGradient id="chirpGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#a855f7" stopOpacity={1} />
            <Stop offset="50%" stopColor="#d946ef" stopOpacity={1} />
            <Stop offset="100%" stopColor="#ec4899" stopOpacity={1} />
          </LinearGradient>
        </Defs>
        <Path
          d="M160 80c0 44.18-35.82 80-80 80s-80-35.82-80-80c0-20 7.5-38.2 19.8-52C35.2 12.5 56.8 0 80 0c44.18 0 80 35.82 80 80z"
          fill="url(#chirpGradient)"
        />
        <Circle cx="80" cy="80" r="12" fill="#a855f7" />
        <Path
          d="M140 60c8 0 15 5 18 12 2 5 1 10-2 14l-8 8c-3 3-7 5-12 5-8 0-15-5-18-12-2-5-1-10 2-14l8-8c3-3 7-5 12-5z"
          fill="url(#chirpGradient)"
        />
      </Svg>
    </View>
  );
}