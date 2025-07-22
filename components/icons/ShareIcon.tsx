import React from 'react';
import { View } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';

interface ShareIconProps {
  size?: number;
  color?: string;
}

export default function ShareIcon({ size = 20, color = '#657786' }: ShareIconProps) {
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Circle cx={18} cy={5} r={3} stroke={color} strokeWidth={2} />
        <Circle cx={6} cy={12} r={3} stroke={color} strokeWidth={2} />
        <Circle cx={18} cy={19} r={3} stroke={color} strokeWidth={2} />
        <Path
          d="M8.59 13.51l6.83 3.98"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
        />
        <Path
          d="M15.41 6.51l-6.82 3.98"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
        />
      </Svg>
    </View>
  );
}