import React from 'react';
import { View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface ChirpPlusBadgeProps {
  size?: number;
  color?: string;
}

export default function ChirpPlusBadge({ size = 16, color = "#7c3aed" }: ChirpPlusBadgeProps) {
  return (
    <View style={{ marginLeft: 4 }}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        {/* Crown base */}
        <Path 
          d="M4 18h16v2H4z" 
          fill={color}
        />
        {/* Crown body */}
        <Path 
          d="M5 16l2-8 3 4 2-6 2 6 3-4 2 8H5z" 
          fill={color}
        />
        {/* Crown gems/jewels */}
        <circle cx="8" cy="10" r="1" fill="white" />
        <circle cx="12" cy="6" r="1" fill="white" />
        <circle cx="16" cy="10" r="1" fill="white" />
      </Svg>
    </View>
  );
}