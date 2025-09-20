import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

interface GachaIconProps {
  size?: number;
  color?: string;
}

export default function GachaIcon({ size = 24, color = '#000000' }: GachaIconProps) {
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        {/* Gacha capsule shape */}
        <Path
          d="M12 2C8.13 2 5 5.13 5 9v6c0 3.87 3.13 7 7 7s7-3.13 7-7V9c0-3.87-3.13-7-7-7z"
          stroke={color}
          strokeWidth={1.5}
          fill="none"
        />
        {/* Capsule opening line */}
        <Path
          d="M5 9h14"
          stroke={color}
          strokeWidth={1.5}
          strokeLinecap="round"
        />
        {/* Sparkle effects */}
        <Circle cx="8" cy="6" r="1" fill={color} />
        <Circle cx="16" cy="6" r="1" fill={color} />
        <Circle cx="12" cy="18" r="1" fill={color} />
        {/* Star shape for gacha effect */}
        <Path
          d="M12 12l1.5 1.5L12 15l-1.5-1.5L12 12z"
          fill={color}
        />
      </Svg>
    </View>
  );
}
