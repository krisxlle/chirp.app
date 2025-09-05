import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { signInWithSupabase, signUp } from '../mobile-db-supabase';
import { useAuth } from './AuthContext';

// Custom Icon Components
const SparklesIcon = ({ size = 24, color = "#7c3aed" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path 
      d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .962 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.582a.5.5 0 0 1 0 .962L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.962 0z" 
      fill={color}
    />
    <Path 
      d="M20 3v4M22 5h-4M6 16v2M7 17H5" 
      stroke={color} 
      strokeWidth="2" 
      strokeLinecap="round"
    />
  </Svg>
);

const HeartIcon = ({ size = 24, color = "#ec4899" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path 
      d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" 
      fill={color}
    />
  </Svg>
);

const BotIcon = ({ size = 24, color = "#7c3aed" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path 
      d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7v1a7 7 0 0 1-7 7H10a7 7 0 0 1-7-7v-1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z" 
      stroke={color} 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
    <Path 
      d="M8 12h.01M16 12h.01" 
      stroke={color} 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
    <Path 
      d="M9 16s1 1 3 1 3-1 3-1" 
      stroke={color} 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </Svg>
);

export default function SignInScreen() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [customHandle, setCustomHandle] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const { signIn } = useAuth();

  const handleSignIn = async () => {
    if (!username.trim()) {
      Alert.alert('Error', 'Please enter your username');
      return;
    }

    if (!password.trim()) {
      Alert.alert('Error', 'Please enter a password');
      return;
    }

    setIsLoading(true);
    try {
      console.log('🔐 Attempting to sign in with username:', username);
      const result = await signIn(username, password);
      
      if (result.success) {
        console.log('✅ Sign in successful');
        // AuthContext will handle the state update
      } else {
        // Check if this is an email confirmation issue
        if (result.error === 'EMAIL_NOT_CONFIRMED') {
          Alert.alert(
            'Email Confirmation Required', 
            'Please check your email and click the confirmation link before signing in.',
            [
              { text: 'OK', style: 'default' }
            ]
          );
        } else {
          Alert.alert('Sign In Failed', 'Invalid username or password.');
        }
      }
    } catch (error) {
      console.error('Sign in error:', error);
      Alert.alert('Error', 'Sign in failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter an email address');
      return;
    }

    if (!password.trim()) {
      Alert.alert('Error', 'Please enter a password');
      return;
    }

    if (!name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    if (!customHandle.trim()) {
      Alert.alert('Error', 'Please enter a custom handle');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    // Custom handle validation
    if (customHandle.length < 3) {
      Alert.alert('Error', 'Custom handle must be at least 3 characters long');
      return;
    }

    if (customHandle.length > 20) {
      Alert.alert('Error', 'Custom handle must be less than 20 characters');
      return;
    }

    // Check for valid characters in handle (alphanumeric, hyphen, period)
    const handleRegex = /^[a-zA-Z0-9.-]+$/;
    if (!handleRegex.test(customHandle.replace('@', ''))) {
      Alert.alert('Error', 'Custom handle can only contain letters, numbers, hyphens, and periods');
      return;
    }

    setIsLoading(true);
    try {
      console.log('📝 Attempting to sign up with email:', email);
      
      // Use Supabase sign up function
      const result = await signUp(email, password, name, customHandle);
      
      if (result.user) {
        console.log('✅ Sign up successful, now automatically signing in...');
        
        try {
          // Automatically sign in the user after successful sign-up using Supabase
          const signInResult = await signInWithSupabase(email, password);
          
          if (signInResult.user && signInResult.profile) {
            console.log('✅ Auto sign-in successful after sign-up');
            
            // Create user object in the same format as AuthContext expects
            const user = {
              id: signInResult.user.id,
              email: signInResult.user.email || email,
              name: signInResult.profile.first_name && signInResult.profile.last_name 
                ? `${signInResult.profile.first_name} ${signInResult.profile.last_name}`.trim()
                : signInResult.profile.custom_handle || signInResult.profile.handle || email.split('@')[0],
              firstName: signInResult.profile.first_name,
              lastName: signInResult.profile.last_name,
              customHandle: signInResult.profile.custom_handle,
              handle: signInResult.profile.handle,
              profileImageUrl: signInResult.profile.profile_image_url,
              avatarUrl: signInResult.profile.profile_image_url,
              bannerImageUrl: signInResult.profile.banner_image_url,
              bio: signInResult.profile.bio
            };
            
            // Store user data in AsyncStorage (same as AuthContext does)
            await AsyncStorage.setItem('user', JSON.stringify(user));
            await AsyncStorage.removeItem('userSignedOut');
            
            // Use the AuthContext's updateUser method to set the user state
            const { updateUser } = useAuth();
            await updateUser(user);
            
            console.log('✅ User automatically signed in after sign-up:', user.customHandle || user.handle || user.id);
            Alert.alert('Welcome!', 'Your account has been created and you are now signed in!');
          } else {
            throw new Error('Sign in result missing user or profile data');
          }
        } catch (signInError) {
          console.error('⚠️ Auto sign-in failed after sign-up:', signInError);
          Alert.alert('Account Created', 'Your account has been created successfully! Please sign in to continue.', [
            {
              text: 'OK',
              onPress: () => setIsSignUp(false)
            }
          ]);
        }
      } else {
        Alert.alert('Sign Up Failed', 'Failed to create account. Please try again.');
      }
    } catch (error) {
      console.error('Sign up error:', error);
      Alert.alert('Error', 'Sign up failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <View style={styles.container}>
      {/* Background Gradient */}
      <LinearGradient
        colors={['#7c3aed', '#ec4899', '#f59e0b']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.backgroundGradient}
      />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image 
            source={require('../assets/icon.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.appName}>Chirp</Text>
          <Text style={styles.tagline}>The social media gacha app.</Text>
        </View>

        {/* Features */}
        <View style={styles.featuresContainer}>
          <View style={styles.feature}>
            <SparklesIcon size={24} color="#ffffff" />
            <Text style={styles.featureText}>Pull for your friends from the gacha</Text>
          </View>
          
          <View style={styles.feature}>
            <HeartIcon size={24} color="#ffffff" />
            <Text style={styles.featureText}>Engage with posts to earn crystals</Text>
          </View>
          
          <View style={styles.feature}>
            <BotIcon size={24} color="#ffffff" />
            <Text style={styles.featureText}>Raise your profile power</Text>
          </View>
        </View>

        {/* Sign In Form */}
        <View style={styles.signInContainer}>
          <Text style={styles.signInTitle}>
            {isSignUp ? 'Create Account' : 'Welcome back'}
          </Text>
          <Text style={styles.signInSubtitle}>
            {isSignUp ? 'Sign up to join Chirp' : 'Sign in to continue to Chirp'}
          </Text>
          
          <TextInput
            style={styles.emailInput}
            placeholder={isSignUp ? "Enter your email" : "Enter your username"}
            placeholderTextColor="#9ca3af"
            value={isSignUp ? email : username}
            onChangeText={isSignUp ? setEmail : setUsername}
            keyboardType={isSignUp ? "email-address" : "default"}
            autoCapitalize="none"
            autoCorrect={false}
          />
          
          <TextInput
            style={styles.emailInput}
            placeholder="Enter your password"
            placeholderTextColor="#9ca3af"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={true}
            autoCapitalize="none"
            autoCorrect={false}
          />

          {isSignUp && (
            <>
              <TextInput
                style={styles.emailInput}
                placeholder="Full name"
                placeholderTextColor="#9ca3af"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                autoCorrect={false}
              />
              
              <TextInput
                style={styles.emailInput}
                placeholder="Custom handle (e.g., @username)"
                placeholderTextColor="#9ca3af"
                value={customHandle}
                onChangeText={setCustomHandle}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </>
          )}
          
          <TouchableOpacity
            style={styles.signInButton}
            onPress={isSignUp ? handleSignUp : handleSignIn}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text style={styles.signInButtonText}>
                {isSignUp ? 'Create Account' : 'Sign In'}
              </Text>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.switchModeButton}
            onPress={() => setIsSignUp(!isSignUp)}
            disabled={isLoading}
          >
            <Text style={styles.switchModeText}>
              {isSignUp ? 'Already have an account? Sign In' : 'New to Chirp? Create Account'}
            </Text>
          </TouchableOpacity>
          
        </View>

        {/* Footer */}
        <Text style={styles.footerText}>
          New to Chirp? Start building your profile collection now.
        </Text>
      </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
    justifyContent: 'space-between',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 16,
    borderRadius: 20,
  },
  appName: {
    fontSize: 32,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: '#ffffff',
    opacity: 0.9,
    textAlign: 'center',
  },
  featuresContainer: {
    marginBottom: 40,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  featureText: {
    fontSize: 16,
    color: '#ffffff',
    marginLeft: 12,
    opacity: 0.9,
  },
  signInContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
  },
  signInTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 8,
  },
  signInSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  emailInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1a1a1a',
    backgroundColor: '#ffffff',
    marginBottom: 16,
  },
  signInButton: {
    backgroundColor: '#7c3aed',
    borderRadius: 12,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  signInButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  switchModeButton: {
    marginTop: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  switchModeText: {
    color: '#7c3aed',
    fontSize: 16,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
  footerText: {
    fontSize: 14,
    color: '#ffffff',
    textAlign: 'center',
    opacity: 0.8,
    lineHeight: 20,
  },
});