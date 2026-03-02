import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

interface GachaIconProps {
  size?: number;
  color?: string;
}

export default function GachaIcon({ size = 24, color = '#6b7280' }: GachaIconProps) {
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        {/* Main sparkle: straight inward sides with only slight rounding at inner corners */}
        <Path
          d="M12 2 L13.7 9.7 Q14 10 14.3 10.3 L22 12 L14.3 14.3 Q14 14 13.7 14.3 L12 22 L10.3 14.3 Q10 14 9.7 13.7 L2 12 L9.7 10.3 Q10 10 10.3 9.7 L12 2 Z"
          stroke={color}
          strokeWidth={2}
          strokeLinejoin="round"
        />
        {/* Small plus top-right, moved further out for more space */}
        <Path
          d="M20 3.5 L20 5.5 M18.5 4.5 L21.5 4.5"
          stroke={color}
          strokeWidth={1.2}
          strokeLinecap="round"
        />
        {/* Small hollow circle bottom-left, moved further out */}
        <Circle cx="4" cy="20" r="1.5" stroke={color} strokeWidth={1.2} fill="none" />
      </Svg>
    </View>
  );
}
