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
        {/* Square outline with half-height left and right edges */}
        <Path
          d="M4 12v8 M20 12v8 M4 20h16"
          stroke={color}
          strokeWidth={2}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Upwards arrow extending much further up */}
        <Path
          d="M12 0v14M7 5l5-5 5 5"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  );
}