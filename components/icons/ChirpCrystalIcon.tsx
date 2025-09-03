import React from 'react';
import { View } from 'react-native';
import Svg, { Path, Polygon, Circle } from 'react-native-svg';

interface ChirpCrystalIconProps {
  size?: number;
  color?: string;
}

export default function ChirpCrystalIcon({ size = 24, color = '#7c3aed' }: ChirpCrystalIconProps) {
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        {/* Main crystal body - hexagonal diamond shape */}
        <Path
          d="M12 2L16 8L12 14L8 8L12 2Z"
          fill={color}
          stroke={color}
          strokeWidth={0.5}
        />
        
        {/* Crystal facets for depth */}
        <Path
          d="M12 4L14.5 8L12 12L9.5 8L12 4Z"
          fill="rgba(255,255,255,0.3)"
          stroke="none"
        />
        
        {/* Bottom crystal point */}
        <Path
          d="M12 14L14 18L12 22L10 18L12 14Z"
          fill={color}
          stroke={color}
          strokeWidth={0.5}
        />
        
        {/* Sparkle effects */}
        <Path
          d="M6 6L7 7L6 8L5 7L6 6Z"
          fill="rgba(255,255,255,0.8)"
        />
        <Path
          d="M18 6L19 7L18 8L17 7L18 6Z"
          fill="rgba(255,255,255,0.8)"
        />
        <Path
          d="M12 18L13 19L12 20L11 19L12 18Z"
          fill="rgba(255,255,255,0.8)"
        />
        
        {/* Center highlight */}
        <Circle
          cx="12"
          cy="12"
          r="1"
          fill="rgba(255,255,255,0.6)"
        />
      </Svg>
    </View>
  );
}
