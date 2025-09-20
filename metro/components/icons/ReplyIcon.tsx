import React from 'react';
import { View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface ReplyIconProps {
  size?: number;
  color?: string;
}

export default function ReplyIcon({ size = 20, color = '#657786' }: ReplyIconProps) {
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
          d="M9 17l-4-4 4-4"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M20 18v-2a4 4 0 00-4-4H5"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  );
}