import React from 'react';
import { View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface SpeechBubbleIconProps {
  size?: number;
  color?: string;
}

export default function SpeechBubbleIcon({ size = 20, color = '#657786' }: SpeechBubbleIconProps) {
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
          d="M8.5 19H8C4.134 19 1 15.866 1 12V8C1 4.134 4.134 1 8 1H16C19.866 1 23 4.134 23 8V12C23 15.866 19.866 19 16 19H13.5L8.5 23V19Z"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </Svg>
    </View>
  );
}