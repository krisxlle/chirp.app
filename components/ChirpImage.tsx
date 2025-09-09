import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface ChirpImageProps {
  imageUrl: string;
  imageAltText?: string;
  imageWidth?: number;
  imageHeight?: number;
  onImagePress?: () => void;
  onRemoveImage?: () => void;
  showRemoveButton?: boolean;
  isUploading?: boolean;
  maxWidth?: number; // Allow custom max width
  maxHeight?: number; // Allow custom max height
}

const { width: screenWidth } = Dimensions.get('window');
const maxImageWidth = screenWidth - 20; // Reduced padding to allow wider images
const maxImageHeight = 300; // Increased to allow wider images

export default function ChirpImage({
  imageUrl,
  imageAltText = '',
  imageWidth = 400,
  imageHeight = 300,
  onImagePress,
  onRemoveImage,
  showRemoveButton = false,
  isUploading = false,
  maxWidth,
  maxHeight
}: ChirpImageProps) {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  // Use custom max dimensions or fallback to defaults
  const effectiveMaxWidth = maxWidth || maxImageWidth;
  const effectiveMaxHeight = maxHeight || maxImageHeight;


  // Calculate display dimensions while maintaining aspect ratio
  const aspectRatio = imageWidth / imageHeight;
  let displayWidth = imageWidth;
  let displayHeight = imageHeight;

  // Scale up if image is smaller than max width, or scale down if larger
  if (displayWidth < effectiveMaxWidth) {
    displayWidth = effectiveMaxWidth;
    displayHeight = displayWidth / aspectRatio;
  } else if (displayWidth > effectiveMaxWidth) {
    displayWidth = effectiveMaxWidth;
    displayHeight = displayWidth / aspectRatio;
  }

  if (displayHeight > effectiveMaxHeight) {
    displayHeight = effectiveMaxHeight;
    displayWidth = displayHeight * aspectRatio;
  }

  const handleImageLoad = () => {
    setImageLoading(false);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
  };

  const handleRemovePress = () => {
    Alert.alert(
      'Remove Image',
      'Are you sure you want to remove this image?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: onRemoveImage }
      ]
    );
  };

  if (isUploading) {
    return (
      <View style={[styles.container, { width: displayWidth, height: displayHeight }]}>
        <View style={styles.uploadingContainer}>
          <ActivityIndicator size="large" color="#7c3aed" />
          <Text style={styles.uploadingText}>Uploading image...</Text>
        </View>
      </View>
    );
  }

  if (imageError) {
    return (
      <View style={[styles.container, { width: displayWidth, height: displayHeight }]}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load image</Text>
          <TouchableOpacity onPress={() => {
            setImageError(false);
            setImageLoading(true);
          }} style={styles.retryButton}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { width: displayWidth, height: displayHeight }]}>
      <TouchableOpacity 
        onPress={onImagePress}
        style={styles.imageContainer}
        activeOpacity={0.9}
      >
        <Image
          source={{ uri: imageUrl }}
          style={[styles.image, { width: displayWidth, height: displayHeight }]}
          onLoad={handleImageLoad}
          onError={handleImageError}
          accessibilityLabel={imageAltText}
          resizeMode="cover"
        />
        
        {imageLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="small" color="#7c3aed" />
          </View>
        )}
        
        {showRemoveButton && (
          <TouchableOpacity 
            onPress={handleRemovePress}
            style={styles.removeButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
              <Path
                d="M18 6L6 18M6 6l12 12"
                stroke="white"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#ffffff', // Match ChirpCard background
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: '100%',
  },
  image: {
    borderRadius: 12,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
  },
  uploadingText: {
    marginTop: 8,
    fontSize: 14,
    color: '#6b7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    padding: 20,
  },
  errorText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 12,
  },
  retryButton: {
    backgroundColor: '#7c3aed',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  retryText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
