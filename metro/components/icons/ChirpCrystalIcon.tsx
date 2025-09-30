import React from 'react';
import { Image } from 'react-native';

interface ChirpCrystalIconProps {
  size?: number;
  color?: string;
}

export default function ChirpCrystalIcon({ size = 24 }: ChirpCrystalIconProps) {
  return (
    <Image
      source={require('../../public/assets/Season 1/Chirp Crystal v2.png')}
      style={{ width: size, height: size }}
      resizeMode="contain"
    />
  );
}
