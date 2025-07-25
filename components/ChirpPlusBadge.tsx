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
        <Path 
          d="M5 16L3 14V9l5.5-1L12 2l3.5 6L21 9v5l-2 2-7 3-7-3z" 
          stroke={color} 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          fill="none"
        />
      </Svg>
    </View>
  );
}