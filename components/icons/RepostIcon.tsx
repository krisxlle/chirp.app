import React from 'react';
import { View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface RepostIconProps {
  size?: number;
  color?: string;
}

export default function RepostIcon({ size = 20, color = '#657786' }: RepostIconProps) {
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
          d="M17 1l4 4-4 4"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M3 11v-1a4 4 0 014-4h14"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M7 23l-4-4 4-4"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M21 13v1a4 4 0 01-4 4H3"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  );
}