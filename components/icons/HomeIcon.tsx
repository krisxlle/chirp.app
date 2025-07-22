import React from 'react';
import { View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface HomeIconProps {
  size?: number;
  color?: string;
  filled?: boolean;
}

export default function HomeIcon({ size = 24, color = '#657786', filled = false }: HomeIconProps) {
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
          d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"
          stroke={color}
          strokeWidth={2}
          fill={filled ? color : "none"}
        />
        <Path
          d="M9 22V12h6v10"
          stroke={color}
          strokeWidth={2}
          fill="none"
        />
      </Svg>
    </View>
  );
}