import React from 'react';
import { View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface NotificationIconProps {
  size?: number;
  color?: string;
}

export default function NotificationIcon({ size = 24, color = '#657786' }: NotificationIconProps) {
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
          d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"
          stroke={color}
          strokeWidth={2}
        />
        <Path
          d="M13.73 21a2 2 0 01-3.46 0"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
        />
      </Svg>
    </View>
  );
}