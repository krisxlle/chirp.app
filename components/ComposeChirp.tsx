import { LinearGradient } from 'expo-linear-gradient';
import React, { useRef, useState } from 'react';
import { Alert, Keyboard, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useResponsive } from '../hooks/useResponsive';
import { uploadChirpImage } from '../lib/database/mobile-db-supabase';
import { useAuth } from './AuthContext';
import ChirpImage from './ChirpImage';
import ImagePickerButton from './ImagePickerButton';
import UserAvatar from './UserAvatar';

interface ComposeChirpProps {
  onPost?: (content: string, imageData?: {
    imageUrl?: string;
    imageAltText?: string;
    imageWidth?: number;
    imageHeight?: number;
  }) => Promise<void> | void;
}


export default function ComposeChirp({ onPost }: ComposeChirpProps) {
  const [content, setContent] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  
  const textInputRef = useRef<TextInput>(null);
  
  const { user: authUser, isLoading } = useAuth();
  const { padding } = useResponsive();
  
  const maxLength = 280;
  const remainingChars = maxLength - content.length;

  console.log('ComposeChirp: authUser available:', !!authUser, 'authUser.id:', authUser?.id);

  // Safety check - if user is not available, show a loading state
  if (!authUser || !authUser.id) {
    console.log('ComposeChirp: User not available, showing loading state');
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading compose...</Text>
        </View>
      </View>
    );
  }

  // Convert auth user to expected User format for UserAvatar component
  const user = React.useMemo(() => ({
    id: authUser.id,
    firstName: authUser.firstName || authUser.name || authUser.email?.split('@')[0] || 'User',
    lastName: authUser.lastName || '',
    email: authUser.email,
    profileImageUrl: authUser.profileImageUrl || authUser.avatarUrl,
    customHandle: authUser.customHandle,
    handle: authUser.handle,
    bio: authUser.bio,
  }), [authUser]);

  console.log('ComposeChirp: Final user object:', user.id);
  console.log('ComposeChirp: User profile image:', user.profileImageUrl ? 'has image' : 'no image');

  const handleImageSelected = (imageUri: string) => {
    setSelectedImage(imageUri);
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
  };

  const handleSubmit = async () => {
    // Dismiss keyboard first
    Keyboard.dismiss();
    
    // Check if user is available
    if (!user?.id) {
      Alert.alert("Authentication Error", "Please sign in to post a chirp.");
      return;
    }

    if (isThreadMode) {
      // In thread mode, we're posting the entire thread
      // First check if we have any content at all
      const hasCurrentContent = content.trim();
      const hasThreadChirps = threadChirps.length > 0;
      
      if (!hasCurrentContent && !hasThreadChirps) {
        Alert.alert("Empty thread", "Please write something before posting your thread.");
        return;
      }
      
      // Validate current content if it exists
      if (hasCurrentContent && content.length > maxLength) {
        Alert.alert("Too long", `Current chirp must be ${maxLength} characters or less.`);
        return;
      }
    } else {
      // Normal mode - just check for content
      if (!content.trim() && !selectedImage) {
        Alert.alert("Empty chirp", "Please write something or add an image before posting.");
        return;
      }

      if (content.length > maxLength) {
        Alert.alert("Too long", `Chirps must be ${maxLength} characters or less.`);
        return;
      }
    }

    setIsPosting(true);
    
    try {
      let imageData = null;
      
      // Upload image if one is selected
      if (selectedImage && !isThreadMode) {
        setIsUploadingImage(true);
        try {
          const uploadResult = await uploadChirpImage(selectedImage, user.id);
          imageData = {
            imageUrl: uploadResult.imageUrl,
            imageAltText: content.trim() || 'Chirp image',
            imageWidth: uploadResult.imageWidth,
            imageHeight: uploadResult.imageHeight
          };
        } catch (uploadError) {
          console.error('Error uploading image:', uploadError);
          Alert.alert("Upload Error", "Failed to upload image. Please try again.");
          return;
        } finally {
          setIsUploadingImage(false);
        }
      }
      
      // Use API instead of direct database connection
      console.log('Creating chirp via API...');
      console.log('User ID for chirp creation:', user.id);
      
      // Import the createChirp function from mobile-api
      const { createChirp } = await import('../lib/api/mobile-api');
      
      console.log('🔍 Debug: User object for chirp creation:', {
        userId: user.id,
        userEmail: user.email,
        userType: typeof user.id,
        isUUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(user.id)
      });
      
      // Post single chirp with image data
      const newChirp = await createChirp(content.trim(), user.id, null, imageData);
      if (newChirp) {
        // Call the onPost callback to update the UI (but don't create another chirp)
        await onPost?.(content.trim(), imageData);
      }
      
      setContent("");
      setSelectedImage(null);
    } catch (error) {
      console.error('Error posting chirp:', error);
      Alert.alert("Error", error instanceof Error ? error.message : "Failed to post. Please try again.");
    } finally {
      setIsPosting(false);
    }
  };

  const getCharCountColor = () => {
    if (remainingChars < 0) return '#ef4444'; // red
    if (remainingChars < 20) return '#f59e0b'; // yellow
    return '#6b7280'; // gray
  };

  // Normal compose mode
  return (
    <View style={[styles.container, { marginHorizontal: padding.screen.horizontal }]}>
      <View style={styles.composeArea}>
        <UserAvatar user={user} size="md" />
        
        <View style={styles.inputContainer}>
          <TextInput
            ref={textInputRef}
            style={styles.textInput}
            placeholder="What's on your mind?"
            placeholderTextColor="#9ca3af"
            value={content}
            onChangeText={setContent}
            multiline
            maxLength={maxLength}
            textAlignVertical="top"
            scrollEnabled={true}
            onContentSizeChange={(event) => {
              // Auto-scroll to bottom when content changes to keep cursor visible
              const { height } = event.nativeEvent.contentSize;
              if (height > 80) { // Only scroll if content exceeds minHeight
                setTimeout(() => {
                  textInputRef.current?.scrollToEnd({ animated: true });
                }, 100);
              }
            }}
            onSelectionChange={(event) => {
              // Ensure cursor stays visible when typing
              const { start, end } = event.nativeEvent.selection;
              if (start === end && start === content.length) {
                // Cursor is at the end, scroll to bottom
                setTimeout(() => {
                  textInputRef.current?.scrollToEnd({ animated: true });
                }, 50);
              }
            }}
          />
          
          {/* Image Preview */}
          {selectedImage && (
            <View style={styles.imagePreviewContainer}>
              <ChirpImage
                imageUrl={selectedImage}
                imageAltText={content.trim() || 'Chirp image'}
                onRemoveImage={handleRemoveImage}
                showRemoveButton={true}
                isUploading={isUploadingImage}
                maxWidth={300} // Constrain width for compose context
                maxHeight={200} // Constrain height for compose context
              />
            </View>
          )}
          
          <View style={styles.actionRow}>
            <View style={styles.leftActions}>
              <ImagePickerButton
                onImageSelected={handleImageSelected}
                disabled={isPosting}
                size={20}
                color="#7c3aed"
              />
              
              <Text style={[styles.charCount, { color: getCharCountColor() }]}>
                {remainingChars < 0 ? `${Math.abs(remainingChars)} over` : `${remainingChars}`}
              </Text>
            </View>
            
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={(!content.trim() && !selectedImage) || content.length > maxLength || isPosting}
            >
              <LinearGradient
                colors={['#7c3aed', '#ec4899']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[
                  styles.postButton,
                  ((!content.trim() && !selectedImage) || content.length > maxLength || isPosting) && styles.postButtonDisabled
                ]}
              >
                <Text style={styles.postButtonText}>
                  {isPosting ? "Posting..." : "Chirp"}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    marginTop: 0,
    marginBottom: 3,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 16, // Use hardcoded value instead of padding.screen.horizontal
    boxShadow: '0 2px 8px rgba(124, 58, 237, 0.08)',
    elevation: 3,
    maxWidth: 600, // Max width for web responsiveness
    alignSelf: 'center', // Center the component horizontally
    width: '100%', // Full width up to max width
  },
  composeArea: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  inputContainer: {
    flex: 1,
    marginLeft: 12,
    overflow: 'hidden', // Prevent content from overflowing
  },
  textInput: {
    fontSize: 18,
    lineHeight: 24,
    minHeight: 80,
    padding: 0,
    color: '#1a1a1a',
    textAlignVertical: 'top',
  },
  imagePreviewContainer: {
    marginTop: 12,
    marginBottom: 8,
    overflow: 'hidden',
    borderRadius: 12,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  leftActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  charCount: {
    fontSize: 14,
    fontWeight: '500',
  },
  postButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 3px 8px rgba(124, 58, 237, 0.3)',
    elevation: 5,
  },
  postButtonDisabled: {
    backgroundColor: '#d1d5db',
  },
  postButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    fontSize: 18,
    color: '#6b7280',
    fontWeight: '600',
  },
});