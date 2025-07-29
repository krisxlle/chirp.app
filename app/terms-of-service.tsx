import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function TermsOfService() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Terms of Service</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Content */}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Terms of Service</Text>
        <Text style={styles.lastUpdated}>Last updated: January 29, 2025</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
          <Text style={styles.paragraph}>
            By accessing or using Chirp ("the Service"), you agree to be bound by these Terms of Service ("Terms"). 
            If you disagree with any part of these terms, then you may not access the Service.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Description of Service</Text>
          <Text style={styles.paragraph}>
            Chirp is a social media platform that allows users to share short messages ("chirps"), follow other users, 
            and engage with content through reactions and replies. The Service may include AI-generated content 
            and premium features available through subscription (Chirp+).
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. User Accounts</Text>
          <Text style={styles.paragraph}>
            You must provide accurate and complete information when creating an account. You are responsible for 
            maintaining the confidentiality of your account credentials and for all activities that occur under 
            your account. You must immediately notify us of any unauthorized use of your account.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. User Content</Text>
          <Text style={styles.paragraph}>
            You retain ownership of content you post on Chirp. However, by posting content, you grant us a worldwide, 
            non-exclusive, royalty-free license to use, display, reproduce, and distribute your content on the Service. 
            You are solely responsible for your content and must ensure it complies with applicable laws and these Terms.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Prohibited Conduct</Text>
          <Text style={styles.paragraph}>
            You agree not to:
          </Text>
          <Text style={styles.bulletPoint}>• Post illegal, harmful, or offensive content</Text>
          <Text style={styles.bulletPoint}>• Harass, threaten, or impersonate other users</Text>
          <Text style={styles.bulletPoint}>• Spam or send unsolicited messages</Text>
          <Text style={styles.bulletPoint}>• Violate intellectual property rights</Text>
          <Text style={styles.bulletPoint}>• Attempt to hack or compromise the Service</Text>
          <Text style={styles.bulletPoint}>• Use automated tools to access the Service</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. Chirp+ Premium Service</Text>
          <Text style={styles.paragraph}>
            Chirp+ is our premium subscription service offering enhanced features. Subscription fees are charged 
            monthly or annually as selected. You may cancel your subscription at any time, but refunds are not 
            provided for unused portions of paid periods.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>7. AI-Generated Content</Text>
          <Text style={styles.paragraph}>
            Our Service may include AI-generated content and features. This content is provided for informational 
            and entertainment purposes only. We make no guarantees about the accuracy, reliability, or appropriateness 
            of AI-generated content.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>8. Privacy and Data Protection</Text>
          <Text style={styles.paragraph}>
            Your privacy is important to us. Our Privacy Policy explains how we collect, use, and protect your 
            information. By using the Service, you also agree to our Privacy Policy.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>9. Intellectual Property</Text>
          <Text style={styles.paragraph}>
            The Service and its original content, features, and functionality are owned by Chirp and are protected 
            by international copyright, trademark, patent, trade secret, and other intellectual property laws.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>10. Disclaimers and Limitation of Liability</Text>
          <Text style={styles.paragraph}>
            The Service is provided "as is" without warranties of any kind. We shall not be liable for any indirect, 
            incidental, special, consequential, or punitive damages resulting from your use of the Service.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>11. Termination</Text>
          <Text style={styles.paragraph}>
            We may terminate or suspend your account and access to the Service immediately, without prior notice, 
            for any reason, including breach of these Terms. Upon termination, your right to use the Service 
            will cease immediately.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>12. Content Moderation</Text>
          <Text style={styles.paragraph}>
            We reserve the right to review, moderate, and remove content that violates these Terms or applicable laws. 
            We may use automated systems and human moderators to enforce our community guidelines.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>13. International Users</Text>
          <Text style={styles.paragraph}>
            The Service is operated from the United States. If you access the Service from other jurisdictions, 
            you are responsible for compliance with local laws and regulations.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>14. Governing Law</Text>
          <Text style={styles.paragraph}>
            These Terms shall be governed by and construed in accordance with the laws of the State of California, 
            United States, without regard to conflict of law principles. Any disputes shall be resolved in the 
            courts of California.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>15. Changes to Terms</Text>
          <Text style={styles.paragraph}>
            We reserve the right to modify these Terms at any time. If we make material changes, we will notify 
            users through the Service or by email. Continued use of the Service after changes constitutes 
            acceptance of the new Terms.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>16. Contact Information</Text>
          <Text style={styles.paragraph}>
            If you have any questions about these Terms, please contact us at:
          </Text>
          <Text style={styles.contactInfo}>Email: legal@chirp.com</Text>
          <Text style={styles.contactInfo}>Address: Chirp Inc., 123 Tech Street, San Francisco, CA 94105</Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By using Chirp, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
          </Text>
        </View>
      </ScrollView>
    </View>
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
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 50,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    padding: 8,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 24,
    color: '#7c3aed',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  headerSpacer: {
    width: 44,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  lastUpdated: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    color: '#374151',
    marginBottom: 8,
  },
  bulletPoint: {
    fontSize: 16,
    lineHeight: 24,
    color: '#374151',
    marginLeft: 16,
    marginBottom: 4,
  },
  contactInfo: {
    fontSize: 16,
    lineHeight: 24,
    color: '#374151',
    fontFamily: 'monospace',
    marginLeft: 16,
    marginBottom: 4,
  },
  footer: {
    marginTop: 32,
    padding: 20,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  footerText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#6b7280',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});