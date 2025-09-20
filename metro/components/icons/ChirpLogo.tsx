import React from 'react';
import { View } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';

interface ChirpLogoProps {
  size?: number;
  color?: string;
}

export default function ChirpLogo({ size = 24, color = '#7c3aed' }: ChirpLogoProps) {
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
          d="M12 2C17.523 2 22 6.477 22 12s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2z"
          stroke={color}
          strokeWidth={2}
          fill="none"
        />
        <Circle cx={12} cy={10} r={2} fill={color} />
        <Path
          d="M8 15c1.5 1.5 3.5 2 6 1.5"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
        />
      </Svg>
    </View>
  );
}