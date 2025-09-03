import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useAuth } from './AuthContext';
import UserAvatar from './UserAvatar';

interface ComposeChirpProps {
  onPost?: (content: string) => void;
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
  
  const { user: authUser, isLoading } = useAuth();
  
  const maxLength = 280;
  const remainingChars = maxLength - content.length;

  console.log('ComposeChirp: authUser available:', !!authUser, 'authUser.id:', authUser?.id);

  // Safety check - if user is not available, show a loading state
  if (!authUser) {
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
  const user = {
    id: authUser.id,
    firstName: authUser.firstName || authUser.name || authUser.email?.split('@')[0] || 'User',
    lastName: authUser.lastName || '',
    email: authUser.email,
    profileImageUrl: authUser.profileImageUrl || authUser.avatarUrl,
    customHandle: authUser.customHandle,
    handle: authUser.handle,
    bio: authUser.bio,
  };

  console.log('ComposeChirp: Final user object:', user.id);

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
  };

  const handleSubmit = async () => {
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
      if (!content.trim()) {
        Alert.alert("Empty chirp", "Please write something before posting.");
        return;
      }

      if (content.length > maxLength) {
        Alert.alert("Too long", `Chirps must be ${maxLength} characters or less.`);
        return;
      }
    }

    setIsPosting(true);
    
    try {
      // Use API instead of direct database connection
      console.log('Creating chirp via API...');
      console.log('User ID for chirp creation:', user.id);
      
      // Import the createChirp function from mobile-db
      const { createChirp } = await import('../mobile-db');
      
      if (isThreadMode) {
        // Create the complete thread content array
        const allThreadContent = [...threadChirps];
        if (content.trim()) {
          allThreadContent.push(content.trim());
        }
        
        // Post all chirps in the thread
        let previousChirpId: string | null = null;
        for (const chirpContent of allThreadContent) {
          const newChirp = await createChirp(chirpContent, user.id, previousChirpId);
          if (newChirp) {
            previousChirpId = newChirp.id;
          }
        }
        Alert.alert("Success!", "Your thread has been posted!");
        setThreadChirps([]);
        setIsThreadMode(false);
      } else {
        // Post single chirp
        const newChirp = await createChirp(content.trim(), user.id);
        if (newChirp) {
          Alert.alert("Success!", "Your chirp has been posted!");
        }
      }
      
      setContent("");
              // Call the onPost callback with the content
        onPost?.(content.trim());
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
    // Thread mode - use same formatting as normal compose field
    return (
      <View style={styles.threadModeContainer}>
        {/* Header with Cancel and Post All buttons */}
        <View style={styles.threadHeader}>
          <TouchableOpacity onPress={() => setIsThreadMode(false)} style={styles.cancelButton}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
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

        {/* Thread List with same styling as normal compose */}
        <View style={styles.threadList}>
          {threadChirps.map((chirp, index) => (
            <View key={index} style={styles.container}>
              <View style={styles.composeArea}>
                <UserAvatar user={user} size="md" />
                <View style={styles.inputContainer}>
                  <Text style={styles.threadChirpText}>{chirp}</Text>
                  <View style={styles.actionRow}>
                    <View style={styles.leftActions}>
                      <Text style={styles.threadIndexText}>Chirp {index + 1}</Text>
                    </View>
                    <TouchableOpacity 
                      onPress={() => removeFromThread(index)}
                      style={styles.removeThreadButton}
                    >
                      <Text style={styles.removeButtonText}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          ))}
          
          {/* Current compose area - exact same as normal compose */}
          <View style={styles.container}>
            <View style={styles.composeArea}>
              <UserAvatar user={user} size="md" />
              
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.textInput}
                  placeholder={threadChirps.length === 0 ? "Start a thread..." : "Add another chirp..."}
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
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Bottom notice */}
        <View style={styles.threadBottomNotice}>
          <Text style={styles.threadBottomNoticeText}>Everyone can reply to threads</Text>
        </View>
      </View>
    );
  }

  // Normal compose mode
  return (
    <View style={styles.container}>
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
          
          <View style={styles.actionRow}>
            <View style={styles.leftActions}>
              <TouchableOpacity 
                style={styles.threadButton}
                onPress={() => setIsThreadMode(true)}
              >
                <ThreadIcon size={16} color="#7c3aed" />
                <Text style={styles.threadButtonText}>Thread</Text>
              </TouchableOpacity>
              
              <Text style={[styles.charCount, { color: getCharCountColor() }]}>
                {remainingChars < 0 ? `${Math.abs(remainingChars)} over` : `${remainingChars}`}
              </Text>
            </View>
            
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={!content.trim() || content.length > maxLength || isPosting}
            >
              <LinearGradient
                colors={['#7c3aed', '#ec4899']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[
                  styles.postButton,
                  (!content.trim() || content.length > maxLength || isPosting) && styles.postButtonDisabled
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
    marginHorizontal: 16,
    marginTop: 0,
    marginBottom: 3,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 16,
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  composeArea: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  inputContainer: {
    flex: 1,
    marginLeft: 12,
  },
  textInput: {
    fontSize: 18,
    lineHeight: 24,
    minHeight: 80,
    padding: 0,
    color: '#1a1a1a',
    textAlignVertical: 'top',
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
  // Thread mode styles - matching normal compose field
  threadModeContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
    paddingTop: 50,
  },
  threadHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  cancelButton: {
    padding: 8,
  },
  cancelText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '600',
  },
  threadList: {
    flex: 1,
    paddingTop: 12,
  },
  threadChirpText: {
    fontSize: 18,
    lineHeight: 24,
    color: '#1a1a1a',
    marginBottom: 12,
  },
  threadIndexText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  removeThreadButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  removeButtonText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  threadBottomNotice: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  threadBottomNoticeText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
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