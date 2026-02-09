import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

interface GachaIconProps {
  size?: number;
  color?: string;
}

export default function GachaIcon({ size = 24, color = '#6b7280' }: GachaIconProps) {
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        {/* Main four-pointed sparkle (rounded points via strokeLinecap) */}
        <Path
          d="M12 2 L12 6 M12 18 L12 22 M2 12 L6 12 M18 12 L22 12"
          stroke={color}
          strokeWidth={1.5}
          strokeLinecap="round"
        />
        {/* Small sparkle upper right */}
        <Path
          d="M17 5 L17 6.5 M17 7.5 L17 9 M15 7 L16.5 7 M17.5 7 L19 7"
          stroke={color}
          strokeWidth={1.2}
          strokeLinecap="round"
        />
        {/* Small circle lower right */}
        <Circle cx="18" cy="16" r="1.5" stroke={color} strokeWidth={1.2} fill="none" />
      </Svg>
    </View>
  );
}
