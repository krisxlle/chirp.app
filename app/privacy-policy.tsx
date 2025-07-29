import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function PrivacyPolicy() {
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
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Content */}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Privacy Policy</Text>
        <Text style={styles.lastUpdated}>Last updated: January 29, 2025</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Information We Collect</Text>
          <Text style={styles.subsectionTitle}>Personal Information:</Text>
          <Text style={styles.bulletPoint}>• Email address and account credentials</Text>
          <Text style={styles.bulletPoint}>• Display name and profile information</Text>
          <Text style={styles.bulletPoint}>• Profile and banner images</Text>
          <Text style={styles.bulletPoint}>• Bio and custom handle</Text>
          
          <Text style={styles.subsectionTitle}>Content and Activity:</Text>
          <Text style={styles.bulletPoint}>• Chirps, replies, and reactions you post</Text>
          <Text style={styles.bulletPoint}>• Accounts you follow and followers</Text>
          <Text style={styles.bulletPoint}>• Hashtags and mentions you use</Text>
          <Text style={styles.bulletPoint}>• Your interaction history on the platform</Text>
          
          <Text style={styles.subsectionTitle}>Technical Information:</Text>
          <Text style={styles.bulletPoint}>• Device type, operating system, and app version</Text>
          <Text style={styles.bulletPoint}>• IP address and general location</Text>
          <Text style={styles.bulletPoint}>• Usage analytics and performance data</Text>
          <Text style={styles.bulletPoint}>• Crash reports and error logs</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. How We Use Your Information</Text>
          <Text style={styles.paragraph}>
            We use your information to:
          </Text>
          <Text style={styles.bulletPoint}>• Provide and maintain the Chirp service</Text>
          <Text style={styles.bulletPoint}>• Personalize your content feed and recommendations</Text>
          <Text style={styles.bulletPoint}>• Enable social features like following and messaging</Text>
          <Text style={styles.bulletPoint}>• Generate AI-powered content and insights</Text>
          <Text style={styles.bulletPoint}>• Process Chirp+ premium subscriptions</Text>
          <Text style={styles.bulletPoint}>• Send notifications about activity and updates</Text>
          <Text style={styles.bulletPoint}>• Improve our services and develop new features</Text>
          <Text style={styles.bulletPoint}>• Prevent abuse, spam, and security threats</Text>
          <Text style={styles.bulletPoint}>• Comply with legal obligations</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Information Sharing</Text>
          <Text style={styles.paragraph}>
            We may share your information in the following circumstances:
          </Text>
          <Text style={styles.bulletPoint}>• Public content is visible to all users</Text>
          <Text style={styles.bulletPoint}>• With service providers who help operate our platform</Text>
          <Text style={styles.bulletPoint}>• When required by law or legal process</Text>
          <Text style={styles.bulletPoint}>• To protect safety and prevent harm</Text>
          <Text style={styles.bulletPoint}>• In connection with business transfers or mergers</Text>
          <Text style={styles.bulletPoint}>• With your explicit consent</Text>
          
          <Text style={styles.paragraph}>
            We do NOT sell your personal information to third parties for advertising purposes.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. AI and Machine Learning</Text>
          <Text style={styles.paragraph}>
            We use artificial intelligence to enhance your experience:
          </Text>
          <Text style={styles.bulletPoint}>• Content recommendation algorithms</Text>
          <Text style={styles.bulletPoint}>• Automated content moderation</Text>
          <Text style={styles.bulletPoint}>• AI-generated profile summaries and insights</Text>
          <Text style={styles.bulletPoint}>• Spam and abuse detection</Text>
          <Text style={styles.bulletPoint}>• Trending topic identification</Text>
          
          <Text style={styles.paragraph}>
            Your content may be used to train and improve our AI systems, but personal 
            identifiers are removed or anonymized in this process.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Data Storage and Security</Text>
          <Text style={styles.paragraph}>
            We implement industry-standard security measures to protect your information:
          </Text>
          <Text style={styles.bulletPoint}>• Encrypted data transmission (HTTPS/TLS)</Text>
          <Text style={styles.bulletPoint}>• Secure database storage with access controls</Text>
          <Text style={styles.bulletPoint}>• Regular security audits and monitoring</Text>
          <Text style={styles.bulletPoint}>• Employee access restrictions and training</Text>
          
          <Text style={styles.paragraph}>
            Your data is stored on secure servers in the United States and may be transferred 
            internationally for service operation.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. Your Privacy Rights</Text>
          <Text style={styles.paragraph}>
            Depending on your location, you may have the following rights:
          </Text>
          <Text style={styles.bulletPoint}>• Access: Request a copy of your personal data</Text>
          <Text style={styles.bulletPoint}>• Correction: Update or correct inaccurate information</Text>
          <Text style={styles.bulletPoint}>• Deletion: Request deletion of your account and data</Text>
          <Text style={styles.bulletPoint}>• Portability: Export your data in a standard format</Text>
          <Text style={styles.bulletPoint}>• Objection: Opt out of certain data processing</Text>
          <Text style={styles.bulletPoint}>• Restriction: Limit how we process your data</Text>
          
          <Text style={styles.paragraph}>
            To exercise these rights, contact us at privacy@chirp.com or use the in-app settings.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>7. Cookies and Tracking</Text>
          <Text style={styles.paragraph}>
            We use cookies and similar technologies to:
          </Text>
          <Text style={styles.bulletPoint}>• Keep you logged in to your account</Text>
          <Text style={styles.bulletPoint}>• Remember your preferences and settings</Text>
          <Text style={styles.bulletPoint}>• Analyze usage patterns and performance</Text>
          <Text style={styles.bulletPoint}>• Provide personalized content</Text>
          
          <Text style={styles.paragraph}>
            You can control cookie settings through your device or browser preferences.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>8. Children's Privacy</Text>
          <Text style={styles.paragraph}>
            Chirp is not intended for children under 13 years of age. We do not knowingly 
            collect personal information from children under 13. If we become aware that we 
            have collected such information, we will take steps to delete it promptly.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>9. International Transfers</Text>
          <Text style={styles.paragraph}>
            Your information may be transferred to and processed in countries other than your 
            own. We ensure appropriate safeguards are in place to protect your data during 
            international transfers, in compliance with applicable data protection laws.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>10. Data Retention</Text>
          <Text style={styles.paragraph}>
            We retain your information for as long as necessary to provide our services and 
            comply with legal obligations:
          </Text>
          <Text style={styles.bulletPoint}>• Account data: Until you delete your account</Text>
          <Text style={styles.bulletPoint}>• Public content: May remain visible after account deletion</Text>
          <Text style={styles.bulletPoint}>• Analytics data: Up to 3 years in anonymized form</Text>
          <Text style={styles.bulletPoint}>• Legal/safety data: As required by applicable laws</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>11. Third-Party Services</Text>
          <Text style={styles.paragraph}>
            Our service integrates with third-party providers:
          </Text>
          <Text style={styles.bulletPoint}>• Payment processing (Stripe) for Chirp+ subscriptions</Text>
          <Text style={styles.bulletPoint}>• Email delivery services for notifications</Text>
          <Text style={styles.bulletPoint}>• Cloud infrastructure providers</Text>
          <Text style={styles.bulletPoint}>• Analytics and performance monitoring tools</Text>
          
          <Text style={styles.paragraph}>
            These providers have their own privacy policies and data handling practices.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>12. California Privacy Rights</Text>
          <Text style={styles.paragraph}>
            California residents have additional rights under the CCPA:
          </Text>
          <Text style={styles.bulletPoint}>• Right to know what personal information is collected</Text>
          <Text style={styles.bulletPoint}>• Right to delete personal information</Text>
          <Text style={styles.bulletPoint}>• Right to opt-out of sale of personal information</Text>
          <Text style={styles.bulletPoint}>• Right to non-discrimination for exercising privacy rights</Text>
          
          <Text style={styles.paragraph}>
            We do not sell personal information and do not discriminate against users who 
            exercise their privacy rights.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>13. Changes to This Policy</Text>
          <Text style={styles.paragraph}>
            We may update this Privacy Policy periodically. We will notify you of material 
            changes through the app or by email. Your continued use of Chirp after changes 
            take effect constitutes acceptance of the updated policy.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>14. Contact Us</Text>
          <Text style={styles.paragraph}>
            If you have questions about this Privacy Policy or our data practices, contact us:
          </Text>
          <Text style={styles.contactInfo}>Email: privacy@chirp.com</Text>
          <Text style={styles.contactInfo}>Data Protection Officer: dpo@chirp.com</Text>
          <Text style={styles.contactInfo}>Address: Chirp Inc., 123 Tech Street, San Francisco, CA 94105</Text>
          
          <Text style={styles.paragraph}>
            For EU residents, you may also contact your local data protection authority.
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            This Privacy Policy explains how Chirp collects, uses, and protects your information. 
            By using our service, you agree to the collection and use of information in accordance with this policy.
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
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginTop: 12,
    marginBottom: 8,
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