import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import UserAvatar from './UserAvatar';

interface ComposeChirpProps {
  onPost?: () => void;
}

export default function ComposeChirp({ onPost }: ComposeChirpProps) {
  const [content, setContent] = useState("");
  const [isThreadMode, setIsThreadMode] = useState(false);
  const [isPosting, setIsPosting] = useState(false);

  const maxLength = 280;
  const remainingChars = maxLength - content.length;

  // Mock user data - in real app would come from auth context
  const user = {
    id: "1",
    firstName: "Anonymous",
    lastName: "User",
    email: "user@example.com",
    profileImageUrl: undefined,
  };

  const handleSubmit = async () => {
    if (!content.trim()) {
      Alert.alert("Empty chirp", "Please write something before posting.");
      return;
    }

    if (content.length > maxLength) {
      Alert.alert("Too long", `Chirps must be ${maxLength} characters or less.`);
      return;
    }

    setIsPosting(true);
    
    // Simulate API call
    setTimeout(() => {
      Alert.alert("Success!", "Your chirp has been posted!");
      setContent("");
      setIsPosting(false);
      onPost?.();
    }, 1000);
  };

  const getCharCountColor = () => {
    if (remainingChars < 0) return '#ef4444'; // red
    if (remainingChars < 20) return '#f59e0b'; // yellow
    return '#6b7280'; // gray
  };

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
                onPress={() => setIsThreadMode(!isThreadMode)}
              >
                <Text style={styles.threadButtonIcon}>✨</Text>
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
      
      {isThreadMode && (
        <View style={styles.threadNotice}>
          <Text style={styles.threadNoticeText}>
            ✨ Thread mode enabled - create multiple connected chirps
          </Text>
          <TouchableOpacity onPress={() => setIsThreadMode(false)}>
            <Text style={styles.threadNoticeClose}>✕</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    marginHorizontal: 12,
    marginTop: 12,
    marginBottom: 8,
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
  },
  threadButtonIcon: {
    fontSize: 16,
    marginRight: 6,
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
  threadNotice: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  threadNoticeText: {
    fontSize: 14,
    color: '#4b5563',
    flex: 1,
  },
  threadNoticeClose: {
    fontSize: 18,
    color: '#6b7280',
    fontWeight: '600',
    paddingHorizontal: 8,
  },
});