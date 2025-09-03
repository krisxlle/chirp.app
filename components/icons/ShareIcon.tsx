import React from 'react';
import { View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface ShareIconProps {
  size?: number;
  color?: string;
}

export default function ShareIcon({ size = 20, color = '#657786' }: ShareIconProps) {
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        {/* Square background */}
        <Path
          d="M3 3h18v18H3z"
          stroke={color}
          strokeWidth={2}
          fill="none"
        />
        {/* Upwards arrow */}
        <Path
          d="M12 7v10M7 12l5-5 5 5"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  );
}