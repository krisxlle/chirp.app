import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { Alert, Keyboard, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useResponsive } from '../hooks/useResponsive';
import { createThread, uploadChirpImage } from '../lib/database/mobile-db-supabase';
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

// Thread Icon Component
const ThreadIcon = ({ size = 16, color = "#7c3aed" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path 
      d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .962 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.582a.5.5 0 0 1 0 .962L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.962 0L9.937 15.5Z" 
      fill={color}
    />
  </Svg>
);

export default function ComposeChirp({ onPost }: ComposeChirpProps) {
  const [content, setContent] = useState("");
  const [isThreadMode, setIsThreadMode] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [threadChirps, setThreadChirps] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  
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

  const addToThread = () => {
    if (!content.trim()) {
      Alert.alert("Empty chirp", "Please write something before adding to thread.");
      return;
    }

    if (content.length > maxLength) {
      Alert.alert("Too long", `Chirps must be ${maxLength} characters or less.`);
      return;
    }

    setThreadChirps([...threadChirps, content.trim()]);
    setContent("");
    // Note: Images are not supported in threads for now
    if (selectedImage) {
      Alert.alert("Thread Mode", "Images are not supported in threads. The image will be removed.");
      setSelectedImage(null);
    }
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
      
      if (isThreadMode) {
        // Create the complete thread content array
        const allThreadContent = [...threadChirps];
        if (content.trim()) {
          allThreadContent.push(content.trim());
        }
        
        console.log('🔄 Creating thread with', allThreadContent.length, 'parts');
        
        // Create the thread using the proper thread creation function
        const createdThread = await createThread(allThreadContent, user.id);
        console.log('✅ Thread created with', createdThread.length, 'chirps');
        
        setThreadChirps([]);
        setIsThreadMode(false);
      } else {
        // Post single chirp with image data
        const newChirp = await createChirp(content.trim(), user.id, null, imageData);
        if (newChirp) {
          // Call the onPost callback to update the UI (but don't create another chirp)
          await onPost?.(content.trim(), imageData);
        }
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

  const removeFromThread = (index: number) => {
    const newThreadChirps = threadChirps.filter((_, i) => i !== index);
    setThreadChirps(newThreadChirps);
  };

  const getCharCountColor = () => {
    if (remainingChars < 0) return '#ef4444'; // red
    if (remainingChars < 20) return '#f59e0b'; // yellow
    return '#6b7280'; // gray
  };

  if (isThreadMode) {
    // Thread mode - extend the compose field
    return (
      <View style={[styles.container, { marginHorizontal: padding.screen.horizontal }]}>
        <View style={styles.composeArea}>
          <UserAvatar user={user} size="md" />
          
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="Start a thread..."
              placeholderTextColor="#9ca3af"
              value={content}
              onChangeText={setContent}
              multiline
              maxLength={maxLength}
              textAlignVertical="top"
            />
            
            <View style={styles.actionRow}>
              <View style={styles.leftActions}>
                <TouchableOpacity 
                  style={styles.threadButton}
                  onPress={addToThread}
                  disabled={!content.trim() || content.length > maxLength}
                >
                  <ThreadIcon size={16} color="#7c3aed" />
                  <Text style={styles.threadButtonText}>Add</Text>
                </TouchableOpacity>
                
                <Text style={[styles.charCount, { color: getCharCountColor() }]}>
                  {remainingChars < 0 ? `${Math.abs(remainingChars)} over` : `${remainingChars}`}
                </Text>
              </View>
              
              <TouchableOpacity
                onPress={handleSubmit}
                disabled={(threadChirps.length === 0 && !content.trim()) || isPosting}
              >
                <LinearGradient
                  colors={['#7c3aed', '#ec4899']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[
                    styles.postButton,
                    ((threadChirps.length === 0 && !content.trim()) || isPosting) && styles.postButtonDisabled
                  ]}
                >
                  <Text style={styles.postButtonText}>
                    {isPosting ? "Posting..." : "Post all"}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Thread List */}
        {threadChirps.length > 0 && (
          <View style={styles.threadList}>
            {threadChirps.map((chirp, index) => (
              <View key={index} style={styles.threadItem}>
                <View style={styles.threadContent}>
                  <Text style={styles.threadChirpText}>{chirp}</Text>
                  <View style={styles.threadItemActions}>
                    <Text style={styles.threadIndexText}>Chirp {index + 1}</Text>
                    <TouchableOpacity 
                      onPress={() => removeFromThread(index)}
                      style={styles.removeThreadButton}
                    >
                      <Text style={styles.removeButtonText}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  }

  // Normal compose mode
  return (
    <View style={[styles.container, { marginHorizontal: padding.screen.horizontal }]}>
      <View style={styles.composeArea}>
        <UserAvatar user={user} size="md" />
        
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="What's on your mind?"
            placeholderTextColor="#9ca3af"
            value={content}
            onChangeText={setContent}
            multiline
            maxLength={maxLength}
            textAlignVertical="top"
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
              <TouchableOpacity 
                style={styles.threadButton}
                onPress={() => setIsThreadMode(true)}
              >
                <ThreadIcon size={16} color="#7c3aed" />
                <Text style={styles.threadButtonText}>Thread</Text>
              </TouchableOpacity>
              
              <ImagePickerButton
                onImageSelected={handleImageSelected}
                disabled={isThreadMode || isPosting}
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
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
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
  threadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#ffffff',
    marginRight: 12,
    gap: 6,
  },

  threadButtonText: {
    fontSize: 14,
    color: '#7c3aed',
    fontWeight: '600',
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
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
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
  // Thread mode styles - simplified inline thread list
  threadList: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  threadItem: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  threadContent: {
    flex: 1,
  },
  threadChirpText: {
    fontSize: 16,
    lineHeight: 22,
    color: '#1a1a1a',
    marginBottom: 8,
  },
  threadItemActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  threadIndexText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  removeThreadButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#fee2e2',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  removeButtonText: {
    fontSize: 12,
    color: '#dc2626',
    fontWeight: '500',
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