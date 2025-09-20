import { View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

interface BirdIconProps {
  size?: number;
  color?: string;
}

export default function BirdIcon({ size = 50, color = '#7c3aed' }: BirdIconProps) {
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        {/* Bird body */}
        <Path
          d="M12 2C17.523 2 22 6.477 22 12s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2z"
          stroke={color}
          strokeWidth={1.5}
          fill="none"
        />
        {/* Bird head */}
        <Circle cx={12} cy={9} r={2.5} fill={color} />
        {/* Bird beak */}
        <Path
          d="M14.5 9L16 9"
          stroke={color}
          strokeWidth={1.5}
          strokeLinecap="round"
        />
        {/* Bird body curve */}
        <Path
          d="M8 15c1.5 1.5 3.5 2 6 1.5"
          stroke={color}
          strokeWidth={1.5}
          strokeLinecap="round"
        />
        {/* Bird wing */}
        <Path
          d="M10 12c1-1 2.5-1.5 4-1"
          stroke={color}
          strokeWidth={1.5}
          strokeLinecap="round"
        />
      </Svg>
    </View>
  );
}
