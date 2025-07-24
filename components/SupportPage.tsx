import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  Alert,
  ActivityIndicator 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import Svg, { Path } from 'react-native-svg';

interface SupportPageProps {
  onClose?: () => void;
}

// Custom Icon Components
const MessageIcon = ({ size = 20, color = "#7c3aed" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path 
      d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" 
      stroke={color} 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </Svg>
);

const HelpIcon = ({ size = 20, color = "#7c3aed" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path 
      d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" 
      stroke={color} 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
    <Path 
      d="M12 17h.01" 
      stroke={color} 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
    <Path 
      d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" 
      stroke={color} 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </Svg>
);

const SendIcon = ({ size = 20, color = "#ffffff" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path 
      d="M22 2L11 13" 
      stroke={color} 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
    <Path 
      d="M22 2L15 22L11 13L2 9L22 2z" 
      stroke={color} 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </Svg>
);

export default function SupportPage({ onClose }: SupportPageProps) {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!subject.trim() || !message.trim()) {
      Alert.alert(
        "Missing Information",
        "Please fill in both subject and message fields.",
        [{ text: "OK" }]
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/support', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          subject: subject.trim(),
          message: message.trim(),
          email: email.trim() || undefined,
          category: 'general'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send support request');
      }

      Alert.alert(
        "Support Request Sent",
        "We'll get back to you within 24 hours.",
        [
          {
            text: "OK",
            onPress: () => {
              setSubject('');
              setMessage('');
              setEmail('');
              if (onClose) onClose();
              else {
                // Navigate back to settings page specifically
                if (typeof window !== 'undefined' && window.location) {
                  window.location.href = '/settings';
                } else {
                  router.push('/settings');
                }
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('Support request error:', error);
      Alert.alert(
        "Error",
        "Failed to send support request. Please try again.",
        [{ text: "OK" }]
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => {
          if (onClose) onClose();
          else {
            // Navigate back to settings page specifically
            if (typeof window !== 'undefined' && window.location) {
              window.location.href = '/settings';
            } else {
              router.push('/settings');
            }
          }
        }}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Support Center</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.iconContainer}>
            <HelpIcon size={48} color="#7c3aed" />
          </View>
          <Text style={styles.heroTitle}>Chirp Support Center</Text>
          <Text style={styles.heroSubtitle}>
            We're here to help you get the most out of your Chirp experience
          </Text>
        </View>

        {/* Quick Help */}
        <View style={styles.quickHelpSection}>
          <Text style={styles.sectionTitle}>Quick Help</Text>
          
          <View style={styles.helpCard}>
            <Text style={styles.helpCardTitle}>Getting Started</Text>
            <Text style={styles.helpCardText}>
              Take the personality quiz to unlock AI profile generation and connect with like-minded users.
            </Text>
          </View>

          <View style={styles.helpCard}>
            <Text style={styles.helpCardTitle}>Custom Handles</Text>
            <Text style={styles.helpCardText}>
              Invite 3 friends or use a VIP code to claim your custom handle. Chirp+ members can change handles anytime.
            </Text>
          </View>

          <View style={styles.helpCard}>
            <Text style={styles.helpCardTitle}>AI Features</Text>
            <Text style={styles.helpCardText}>
              Generate AI profiles, avatars, and bios. Free users get 1 generation daily, Chirp+ members get unlimited access.
            </Text>
          </View>
        </View>

        {/* Contact Information */}
        <View style={styles.contactSection}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          <Text style={styles.contactText}>📧 Email: joinchirp@gmail.com</Text>
          <Text style={styles.contactText}>⏰ Response time: Within 24 hours</Text>
          <Text style={styles.contactText}>🕒 Business hours: Monday - Friday, 9 AM - 6 PM PST</Text>
        </View>

        {/* Contact Form */}
        <View style={styles.formSection}>
          <View style={styles.formHeader}>
            <MessageIcon size={24} color="#7c3aed" />
            <Text style={styles.formTitle}>Send Support Request</Text>
          </View>
          <Text style={styles.formSubtitle}>
            Can't find what you're looking for? Send us a message and we'll help you out.
          </Text>

          {/* Email Field */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Email (Optional)</Text>
            <TextInput
              style={styles.textInput}
              value={email}
              onChangeText={setEmail}
              placeholder="your.email@example.com"
              placeholderTextColor="#9ca3af"
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <Text style={styles.inputNote}>
              Leave blank if you're signed in - we'll use your account email
            </Text>
          </View>

          {/* Subject Field */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Subject *</Text>
            <TextInput
              style={styles.textInput}
              value={subject}
              onChangeText={setSubject}
              placeholder="Brief description of your issue"
              placeholderTextColor="#9ca3af"
            />
          </View>

          {/* Message Field */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Message *</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={message}
              onChangeText={setMessage}
              placeholder="Please describe your issue in detail. Include any error messages or steps you've already tried."
              placeholderTextColor="#9ca3af"
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
          </View>

          {/* Submit Button */}
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
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <>
                  <SendIcon size={20} color="#ffffff" />
                  <Text style={styles.submitButtonText}>Send Support Request</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    paddingBottom: 12,
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e8ed',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#7c3aed',
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  placeholder: {
    width: 48,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  heroSection: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
    backgroundColor: '#ffffff',
    marginBottom: 16,
  },
  iconContainer: {
    backgroundColor: '#f3f4f6',
    borderRadius: 40,
    padding: 16,
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#657786',
    textAlign: 'center',
    lineHeight: 24,
  },
  quickHelpSection: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 24,
    paddingVertical: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  helpCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#7c3aed',
  },
  helpCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  helpCardText: {
    fontSize: 14,
    color: '#657786',
    lineHeight: 20,
  },
  contactSection: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 24,
    paddingVertical: 24,
    marginBottom: 16,
  },
  contactText: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 8,
    lineHeight: 24,
  },
  formSection: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginLeft: 8,
  },
  formSubtitle: {
    fontSize: 14,
    color: '#657786',
    marginBottom: 24,
    lineHeight: 20,
  },
  inputSection: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1a1a1a',
    backgroundColor: '#ffffff',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  inputNote: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
    lineHeight: 16,
  },
  submitButtonContainer: {
    borderRadius: 12,
    marginTop: 8,
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  submitButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  submitButtonDisabled: {
    backgroundColor: '#9ca3af',
    shadowOpacity: 0,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    marginLeft: 8,
  },
});