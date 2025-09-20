import { Dimensions } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Base design dimensions (assuming iPhone 14 Pro as base)
const baseWidth = 393;
const baseHeight = 852;

// Calculate scale factors
const widthScale = screenWidth / baseWidth;
const heightScale = screenHeight / baseHeight;
const scale = Math.min(widthScale, heightScale);

export const useResponsive = () => {
  const isTablet = screenWidth >= 768;
  const isLargeScreen = screenWidth >= 1024;
  const isSmallScreen = screenWidth < 375;

  // Responsive padding functions
  const getPadding = (basePadding: number) => Math.round(basePadding * scale);
  const getHorizontalPadding = (basePadding: number) => Math.round(basePadding * widthScale);
  const getVerticalPadding = (basePadding: number) => Math.round(basePadding * heightScale);

  // Responsive font sizes
  const getFontSize = (baseSize: number) => Math.round(baseSize * scale);

  // Responsive spacing
  const spacing = {
    xs: getPadding(4),
    sm: getPadding(8),
    md: getPadding(12),
    lg: getPadding(16),
    xl: getPadding(20),
    xxl: getPadding(24),
    xxxl: getPadding(32),
  };

  // Responsive padding presets
  const padding = {
    screen: {
      horizontal: isTablet ? getHorizontalPadding(40) : getHorizontalPadding(20),
      vertical: getVerticalPadding(16),
    },
    card: {
      horizontal: isTablet ? getHorizontalPadding(24) : getHorizontalPadding(16),
      vertical: getVerticalPadding(12),
    },
    content: {
      horizontal: isTablet ? getHorizontalPadding(24) : getHorizontalPadding(12),
      vertical: getVerticalPadding(8),
    },
    header: {
      horizontal: isTablet ? getHorizontalPadding(32) : getHorizontalPadding(20),
      vertical: getVerticalPadding(8),
    },
  };

  return {
    // Screen info
    screenWidth,
    screenHeight,
    isTablet,
    isLargeScreen,
    isSmallScreen,
    scale,
    
    // Responsive functions
    getPadding,
    getHorizontalPadding,
    getVerticalPadding,
    getFontSize,
    
    // Preset values
    spacing,
    padding,
  };
};
