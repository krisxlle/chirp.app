import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import UserAvatar from './UserAvatar';
import { useAuth } from './AuthContext';
import Svg, { Path } from 'react-native-svg';

interface ComposeChirpProps {
  onPost?: () => void;
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
  
  const { user: authUser } = useAuth();
  
  const maxLength = 280;
  const remainingChars = maxLength - content.length;

  // Convert auth user to expected User format for UserAvatar component
  const user = authUser ? {
    id: authUser.id,
    firstName: authUser.firstName || authUser.name || authUser.email?.split('@')[0] || 'User',
    lastName: authUser.lastName || '',
    email: authUser.email,
    profileImageUrl: authUser.profileImageUrl || authUser.avatarUrl,
    customHandle: authUser.customHandle,
    handle: authUser.handle,
    bio: authUser.bio,
  } : {
    id: "1",
    firstName: "User",
    lastName: "",
    email: "user@example.com",
    profileImageUrl: undefined,
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
  };

  const handleSubmit = async () => {
    if (isThreadMode) {
      // In thread mode, first add current content to thread if it exists
      if (content.trim()) {
        addToThread();
        return;
      }
      
      // If no current content but we have thread chirps, post the entire thread
      if (threadChirps.length === 0) {
        Alert.alert("Empty thread", "Please add some chirps to your thread before posting.");
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
      // Import the createChirp function from mobile-db
      const { createChirp } = await import('../mobile-db');
      
      // Get authenticated user's ID
      if (!user?.id) {
        throw new Error('You must be signed in to post a chirp');
      }
      
      if (isThreadMode) {
        // Post all chirps in the thread
        let previousChirpId: string | null = null;
        for (const chirpContent of threadChirps) {
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
      onPost?.();
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
            style={[
              styles.postButton,
              (threadChirps.length === 0 || isPosting) && styles.postButtonDisabled
            ]}
            onPress={handleSubmit}
            disabled={threadChirps.length === 0 || isPosting}
          >
            <Text style={styles.postButtonText}>
              {isPosting ? "Posting..." : "Post all"}
            </Text>
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
              style={[
                styles.postButton,
                (!content.trim() || content.length > maxLength || isPosting) && styles.postButtonDisabled
              ]}
              onPress={handleSubmit}
              disabled={!content.trim() || content.length > maxLength || isPosting}
            >
              <Text style={styles.postButtonText}>
                {isPosting ? "Posting..." : "Chirp"}
              </Text>
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
    backgroundColor: '#7c3aed',
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
});