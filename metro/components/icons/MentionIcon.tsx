import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

interface MentionIconProps {
  size?: number;
  color?: string;
}

export default function MentionIcon({ size = 24, color = '#657786' }: MentionIconProps) {
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Circle cx={12} cy={12} r={10} stroke={color} strokeWidth={2} />
        <Path
          d="M16 8v5a3 3 0 0 1-6 0v-1a3 3 0 1 1 6 0"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  );
}