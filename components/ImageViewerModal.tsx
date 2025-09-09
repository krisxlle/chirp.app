import { LinearGradient } from 'expo-linear-gradient';
import React, { useRef, useState } from 'react';
import {
    Dimensions,
    Image,
    Modal,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import {
    GestureHandlerRootView,
    PanGestureHandler,
    PinchGestureHandler,
    State,
} from 'react-native-gesture-handler';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface ImageViewerModalProps {
  visible: boolean;
  imageUrl: string;
  imageAltText?: string;
  onClose: () => void;
}

export default function ImageViewerModal({ 
  visible, 
  imageUrl, 
  imageAltText, 
  onClose 
}: ImageViewerModalProps) {
  const [scale, setScale] = useState(1);
  const [translateX, setTranslateX] = useState(0);
  const [translateY, setTranslateY] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  const panRef = useRef(null);
  const pinchRef = useRef(null);

  const resetImageTransform = () => {
    setScale(1);
    setTranslateX(0);
    setTranslateY(0);
  };

  const handleClose = () => {
    resetImageTransform();
    setImageLoaded(false);
    setImageError(false);
    onClose();
  };

  const onPinchGestureEvent = (event: any) => {
    const newScale = Math.max(0.5, Math.min(5, event.nativeEvent.scale));
    setScale(newScale);
  };

  const onPanGestureEvent = (event: any) => {
    if (scale > 1) {
      const newTranslateX = event.nativeEvent.translationX;
      const newTranslateY = event.nativeEvent.translationY;
      
      // Limit panning to prevent image from going too far off screen
      const maxTranslateX = (screenWidth * (scale - 1)) / 2;
      const maxTranslateY = (screenHeight * (scale - 1)) / 2;
      
      setTranslateX(Math.max(-maxTranslateX, Math.min(maxTranslateX, newTranslateX)));
      setTranslateY(Math.max(-maxTranslateY, Math.min(maxTranslateY, newTranslateY)));
    }
  };

  const onPinchStateChange = (event: any) => {
    if (event.nativeEvent.state === State.END) {
      // Reset to minimum scale if pinched too small
      if (scale < 1) {
        setScale(1);
        setTranslateX(0);
        setTranslateY(0);
      }
    }
  };

  const onPanStateChange = (event: any) => {
    if (event.nativeEvent.state === State.END && scale <= 1) {
      // Reset pan when scale is 1 or less
      setTranslateX(0);
      setTranslateY(0);
    }
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(false);
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleClose}
      statusBarTranslucent={true}
    >
      <StatusBar hidden={true} />
      <GestureHandlerRootView style={styles.container}>
        {/* Close button */}
        <TouchableOpacity 
          style={styles.closeButton} 
          onPress={handleClose}
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
        >
          <LinearGradient
            colors={['rgba(0,0,0,0.6)', 'rgba(0,0,0,0.3)']}
            style={styles.closeButtonGradient}
          >
            <Text style={styles.closeButtonText}>✕</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Image container with gestures */}
        <PinchGestureHandler
          ref={pinchRef}
          onGestureEvent={onPinchGestureEvent}
          onHandlerStateChange={onPinchStateChange}
        >
          <PanGestureHandler
            ref={panRef}
            onGestureEvent={onPanGestureEvent}
            onHandlerStateChange={onPanStateChange}
            minPointers={1}
            maxPointers={1}
          >
            <View style={styles.imageContainer}>
              {imageError ? (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>Failed to load image</Text>
                  <TouchableOpacity onPress={handleClose}>
                    <Text style={styles.errorButtonText}>Close</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <Image
                  source={{ uri: imageUrl }}
                  style={[
                    styles.image,
                    {
                      transform: [
                        { scale: scale },
                        { translateX: translateX },
                        { translateY: translateY },
                      ],
                    },
                  ]}
                  resizeMode="contain"
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                  accessibilityLabel={imageAltText || 'Chirp image'}
                />
              )}
            </View>
          </PanGestureHandler>
        </PinchGestureHandler>

        {/* Loading indicator */}
        {!imageLoaded && !imageError && (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        )}

        {/* Instructions */}
        {imageLoaded && scale === 1 && (
          <View style={styles.instructionsContainer}>
            <LinearGradient
              colors={['rgba(0,0,0,0.6)', 'rgba(0,0,0,0.3)']}
              style={styles.instructionsGradient}
            >
              <Text style={styles.instructionsText}>
                Pinch to zoom • Drag to pan • Tap to close
              </Text>
            </LinearGradient>
          </View>
        )}
      </GestureHandlerRootView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    borderRadius: 20,
    overflow: 'hidden',
  },
  closeButtonGradient: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  closeButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  imageContainer: {
    flex: 1,
    width: screenWidth,
    height: screenHeight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: screenWidth,
    height: screenHeight,
  },
  loadingContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 16,
    textAlign: 'center',
  },
  errorButtonText: {
    color: '#7c3aed',
    fontSize: 16,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  instructionsContainer: {
    position: 'absolute',
    bottom: 50,
    left: 20,
    right: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  instructionsGradient: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  instructionsText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
});
