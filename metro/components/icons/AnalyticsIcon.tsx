import React from 'react';
import { Path, Svg } from 'react-native-svg';

interface AnalyticsIconProps {
  size?: number;
  color?: string;
}

export default function AnalyticsIcon({ size = 24, color = '#000000' }: AnalyticsIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Bar chart bars */}
      <Path
        d="M3 3V21H21"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M9 9L12 6L16 10L20 2"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Individual bars */}
      <Path
        d="M6 12V18"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <Path
        d="M9 8V18"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <Path
        d="M12 4V18"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <Path
        d="M15 10V18"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <Path
        d="M18 6V18"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </Svg>
  );
}
