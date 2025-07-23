import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Linking, Image } from 'react-native';
import { useAuth } from './AuthContext';

export default function SignInScreenNew() {
  const { signIn } = useAuth();

  const handleSignIn = async () => {
    await signIn('demo-user', 'password');
  };

  const openTermsOfService = () => {
    Linking.openURL('https://chirp.com/terms');
  };

  const openPrivacyPolicy = () => {
    Linking.openURL('https://chirp.com/privacy');
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Logo and Header */}
        <View style={styles.logoContainer}>
          <View style={styles.logoBackground}>
            <Image 
              source={require('../assets/icon.png')} 
              style={styles.logoImage} 
              resizeMode="contain"
            />
          </View>
          <Text style={styles.title}>Welcome to Chirp</Text>
          <Text style={styles.subtitle}>
            The social network where looks don't matter. Go viral based on your personality.
          </Text>
        </View>

        {/* Features */}
        <View style={styles.featuresContainer}>
          <View style={styles.feature}>
            <Text style={styles.featureIcon}>✨</Text>
            <Text style={styles.featureTitle}>Share Your Unfiltered Thoughts</Text>
            <Text style={styles.featureDescription}>
              Express yourself authentically without judgment
            </Text>
          </View>

          <View style={styles.feature}>
            <Text style={styles.featureIcon}>💜</Text>
            <Text style={styles.featureTitle}>React to Everything</Text>
            <Text style={styles.featureDescription}>
              Use extensive mood reactions to express how you really feel
            </Text>
          </View>

          <View style={styles.feature}>
            <Text style={styles.featureIcon}>🤖</Text>
            <Text style={styles.featureTitle}>AI-Powered Profiles</Text>
            <Text style={styles.featureDescription}>
              Let AI help create your perfect profile based on your personality
            </Text>
          </View>
        </View>

        {/* Sign In Button */}
        <TouchableOpacity style={styles.signInButton} onPress={handleSignIn}>
          <Text style={styles.signInButtonText}>Enter Chirp</Text>
        </TouchableOpacity>

        <Text style={styles.signInSubtext}>sign in to claim your handle</Text>

        {/* Legal Agreement */}
        <View style={styles.legalContainer}>
          <Text style={styles.legalText}>By signing up, you agree to our </Text>
          <TouchableOpacity onPress={openTermsOfService}>
            <Text style={styles.legalLink}>Terms of Service</Text>
          </TouchableOpacity>
          <Text style={styles.legalText}> and </Text>
          <TouchableOpacity onPress={openPrivacyPolicy}>
            <Text style={styles.legalLink}>Privacy Policy</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#a855f7',
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 40,
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoBackground: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 50,
    padding: 20,
    marginBottom: 24,
    width: 160,
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoImage: {
    width: 120,
    height: 120,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 18,
    color: '#ffffff',
    textAlign: 'center',
    lineHeight: 26,
    opacity: 0.9,
  },
  featuresContainer: {
    width: '100%',
    marginBottom: 48,
  },
  feature: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
  },
  featureIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 14,
    color: '#ffffff',
    textAlign: 'center',
    opacity: 0.8,
    lineHeight: 20,
  },
  signInButton: {
    backgroundColor: '#ffffff',
    borderRadius: 25,
    paddingVertical: 16,
    paddingHorizontal: 48,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  signInButtonText: {
    color: '#a855f7',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  signInSubtext: {
    fontSize: 14,
    color: '#ffffff',
    opacity: 0.8,
    marginBottom: 32,
  },
  legalContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  legalText: {
    fontSize: 12,
    color: '#ffffff',
    opacity: 0.7,
    lineHeight: 18,
  },
  legalLink: {
    fontSize: 12,
    color: '#ffffff',
    textDecorationLine: 'underline',
    fontWeight: '500',
    lineHeight: 18,
  },
});