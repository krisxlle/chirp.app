import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { submitFeedback } from '../mobile-db';

interface FeedbackFormProps {
  onClose?: () => void;
}

export default function FeedbackForm({ onClose }: FeedbackFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    'Bug Report',
    'Feature Request',
    'General Feedback',
    'Account Issue',
    'Other'
  ];

  const handleSubmit = async () => {
    if (!message.trim()) {
      Alert.alert('Error', 'Please enter your feedback message.');
      return;
    }

    setIsSubmitting(true);

    try {
      await submitFeedback({
        name: name.trim() || 'Anonymous',
        email: email.trim() || '',
        category: category || 'General Feedback',
        message: message.trim(),
      });

      Alert.alert(
        'Thank You!',
        'Your feedback has been sent successfully. We appreciate your input!',
        [
          {
            text: 'OK',
            onPress: () => {
              if (onClose) {
                onClose();
              } else {
                router.back();
              }
            },
          },
        ]
      );
      
      // Reset form
      setName('');
      setEmail('');
      setCategory('');
      setMessage('');
    } catch (error) {
      console.error('Feedback submission error:', error);
      Alert.alert(
        'Error',
        'Failed to send feedback. Please try again later or contact support directly at joinchirp@gmail.com'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    if (onClose) {
      onClose();
    } else {
      router.back();
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Feedback</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.description}>
          We'd love to hear from you! Share your thoughts, report bugs, or suggest new features.
        </Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Name (Optional)</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Your name"
            placeholderTextColor="#9ca3af"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email (Optional)</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="your@email.com"
            placeholderTextColor="#9ca3af"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryContainer}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryButton,
                  category === cat && styles.categoryButtonSelected
                ]}
                onPress={() => setCategory(cat)}
              >
                {category === cat ? (
                  <LinearGradient
                    colors={['#7c3aed', '#ec4899']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.categoryButtonGradient}
                  >
                    <Text style={styles.categoryButtonTextSelected}>
                      {cat}
                    </Text>
                  </LinearGradient>
                ) : (
                  <Text style={styles.categoryButtonText}>
                    {cat}
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Message *</Text>
          <TextInput
            style={[styles.input, styles.messageInput]}
            value={message}
            onChangeText={setMessage}
            placeholder="Tell us what's on your mind..."
            placeholderTextColor="#9ca3af"
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />
        </View>

        <TouchableOpacity
          style={[styles.submitButtonContainer, isSubmitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          <LinearGradient
            colors={['#7c3aed', '#ec4899']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.submitButton}
          >
            {isSubmitting ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.submitButtonText}>Send Feedback</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>

        <Text style={styles.contactInfo}>
          You can also reach us directly at joinchirp@gmail.com
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e8ed',
  },
  backButton: {
    padding: 8,
    marginRight: 16,
  },
  backButtonText: {
    fontSize: 16,
    color: '#7c3aed',
    fontWeight: '600',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#14171a',
  },
  form: {
    padding: 16,
  },
  description: {
    fontSize: 16,
    color: '#657786',
    marginBottom: 24,
    lineHeight: 22,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#14171a',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e1e8ed',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#14171a',
    backgroundColor: '#ffffff',
  },
  messageInput: {
    height: 120,
    textAlignVertical: 'top',
  },
  categoryContainer: {
    flexDirection: 'row',
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f7f9fa',
    borderWidth: 1,
    borderColor: '#e1e8ed',
    marginRight: 8,
    minHeight: 36, // Ensure consistent height
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden', // Prevent gradient from bleeding outside border radius
  },
  categoryButtonSelected: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    // Remove padding to avoid double padding with gradient
    padding: 0,
  },
  categoryButtonGradient: {
    // Use absolute positioning to fill the entire button
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryButtonText: {
    fontSize: 14,
    color: '#657786',
    fontWeight: '500',
  },
  categoryButtonTextSelected: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '500',
  },
  submitButtonContainer: {
    marginTop: 8,
    borderRadius: 8,
  },
  submitButton: {
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  contactInfo: {
    fontSize: 14,
    color: '#657786',
    textAlign: 'center',
    marginTop: 16,
    fontStyle: 'italic',
  },
});