import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Linking, Image } from 'react-native';
import { useAuth } from './AuthContext';
import Svg, { Path } from 'react-native-svg';

// Custom Icon Components
const SparklesIcon = ({ size = 28, color = "#ffffff" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path 
      d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .962 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.582a.5.5 0 0 1 0 .962L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.962 0L9.937 15.5Z" 
      fill={color}
    />
    <Path 
      d="M19 8.5a.5.5 0 0 0-1 0v1a1 1 0 0 1-1 1h-1a.5.5 0 0 0 0 1h1a1 1 0 0 1 1 1v1a.5.5 0 0 0 1 0v-1a1 1 0 0 1 1-1h1a.5.5 0 0 0 0-1h-1a1 1 0 0 1-1-1v-1Z" 
      fill={color}
    />
  </Svg>
);

const HeartIcon = ({ size = 28, color = "#ffffff" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path 
      d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" 
      fill={color}
    />
  </Svg>
);

const BotIcon = ({ size = 28, color = "#ffffff" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path 
      d="M12 8a1 1 0 0 0-1 1v3a1 1 0 0 0 2 0V9a1 1 0 0 0-1-1Z" 
      fill={color}
    />
    <Path 
      d="M21 9v10c0 1.1-.9 2-2 2H5c-1.1 0-2-.9-2-2V9c0-1.1.9-2 2-2h14c1.1 0 2 .9 2 2ZM8 18a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm8 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" 
      fill={color}
    />
    <Path 
      d="M12 2a1 1 0 0 1 1 1v2a1 1 0 0 1-2 0V3a1 1 0 0 1 1-1Z" 
      fill={color}
    />
  </Svg>
);

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
            <View style={styles.featureIconContainer}>
              <SparklesIcon size={28} color="#ffffff" />
            </View>
            <Text style={styles.featureTitle}>Share Your Unfiltered Thoughts</Text>
            <Text style={styles.featureDescription}>
              Express yourself authentically without judgment
            </Text>
          </View>

          <View style={styles.feature}>
            <View style={styles.featureIconContainer}>
              <HeartIcon size={28} color="#ffffff" />
            </View>
            <Text style={styles.featureTitle}>React to Everything</Text>
            <Text style={styles.featureDescription}>
              Use extensive mood reactions to express how you really feel
            </Text>
          </View>

          <View style={styles.feature}>
            <View style={styles.featureIconContainer}>
              <BotIcon size={28} color="#ffffff" />
            </View>
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
    marginBottom: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoImage: {
    width: 120,
    height: 120,
    borderRadius: 20,
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
  featureIconContainer: {
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
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