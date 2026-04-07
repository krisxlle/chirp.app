import AsyncStorage from '@react-native-async-storage/async-storage';
import { Inter_400Regular, Inter_500Medium } from '@expo-google-fonts/inter';
import { Montserrat_700Bold } from '@expo-google-fonts/montserrat';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts } from 'expo-font';
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
    View,
    type ViewStyle,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { checkHandleAvailability, signInWithSupabase, signUp } from '../lib/database/mobile-db-supabase';
import { useAuth } from './AuthContext';

/** Chirp color guide (aligned with web Auth) */
const C = {
  deepPurple: '#6A4C92',
  vibrantPurple: '#A240D1',
  magentaPink: '#D94CC2',
  mediumLavender: '#9D8CD9',
  lightBlueGrey: '#BEC6EB',
  paleLavender: '#E2DAFF',
  softPeach: '#FDEADF',
  dustyRose: '#E1A0C3',
} as const;

/** Loaded via useFonts — matches brand guide (headings Montserrat bold, body Inter) */
const TYPO = {
  heading: { fontFamily: 'Montserrat_700Bold' },
  body: { fontFamily: 'Inter_400Regular' },
  bodyMedium: { fontFamily: 'Inter_500Medium' },
} as const;

/** Sky: smooth diagonal — extra #9D8CD9 in the mix (less heavy purple overall) */
const SKY_GRADIENT = [
  '#5d4f78',
  '#66558c',
  '#6A4C92',
  '#7460a6',
  '#826fb6',
  '#8f7fc6',
  '#9D8CD9',
  '#9D8CD9',
  '#9588ce',
  '#7d68aa',
  '#5d4f78',
] as const;
const SKY_LOCATIONS = [0, 0.11, 0.22, 0.33, 0.44, 0.52, 0.6, 0.66, 0.72, 0.82, 1] as const;
const SKY_START = { x: 0, y: 0 } as const;
const SKY_END = { x: 1, y: 1 } as const;

/** Single-path cloud — one fill, no stacked shapes or internal edges */
const CLOUD_PATH =
  'M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z';

function SolidCloudMark({
  size,
  opacity = 0.14,
  style,
}: {
  size: number;
  opacity?: number;
  style?: ViewStyle | ViewStyle[];
}) {
  const h = size * 0.65;
  return (
    <View style={[{ width: size, height: h }, style]} pointerEvents="none">
      <Svg width={size} height={h} viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet">
        <Path fill="#ffffff" fillOpacity={opacity} d={CLOUD_PATH} />
      </Svg>
    </View>
  );
}

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
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [customHandle, setCustomHandle] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [isForgotPasswordLoading, setIsForgotPasswordLoading] = useState(false);
  const [forgotPasswordMessage, setForgotPasswordMessage] = useState('');
  const [handleValidation, setHandleValidation] = useState<{
    available: boolean;
    message: string;
  } | null>(null);
  const [isValidatingHandle, setIsValidatingHandle] = useState(false);
  const { signIn } = useAuth();

  const [fontsLoaded] = useFonts({
    Montserrat_700Bold,
    Inter_400Regular,
    Inter_500Medium,
  });

  // Validate handle availability in real-time
  const validateHandle = async (handle: string) => {
    if (!handle.trim()) {
      setHandleValidation(null);
      return;
    }

    setIsValidatingHandle(true);
    try {
      const validation = await checkHandleAvailability(handle);
      setHandleValidation(validation);
    } catch (error) {
      console.error('Error validating handle:', error);
      setHandleValidation({
        available: false,
        message: 'Error checking handle availability'
      });
    } finally {
      setIsValidatingHandle(false);
    }
  };

  const handleSignIn = async () => {
    console.log('🚀 handleSignIn function called!');
    console.log('🚀 Email:', email);
    console.log('🚀 Password provided:', password ? 'Yes' : 'No');
    
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }

    if (!password.trim()) {
      Alert.alert('Error', 'Please enter a password');
      return;
    }

    setIsLoading(true);
    try {
      console.log('🔐 Attempting to sign in with email:', email);
      const result = await signIn(email, password);
      
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
          Alert.alert('Sign In Failed', 'Invalid email or password.');
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

    // Custom handle validation - use the new validation function
    if (!handleValidation || !handleValidation.available) {
      Alert.alert('Error', handleValidation?.message || 'Please enter a valid handle');
      return;
    }

    setIsLoading(true);
    try {
      console.log('📝 Attempting to sign up with email:', email);
      
      // Use Supabase sign up function
      const result = await signUp(email, password, name, customHandle);
      
      if (result.user) {
        console.log('✅ Sign up successful');
        
        // Check if email confirmation is required
        if (result.requires_email_confirmation) {
          console.log('📧 Email confirmation required');
          Alert.alert(
            'Check Your Email', 
            'We\'ve sent you a confirmation link. Please check your email and click the link to activate your account.',
            [
              {
                text: 'OK',
                onPress: () => {
                  // Switch back to sign in mode
                  setIsSignUp(false);
                }
              }
            ]
          );
          return;
        }
        
        // If email is already confirmed, proceed with auto sign-in
        try {
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

  const handleForgotPassword = async () => {
    if (!forgotPasswordEmail.trim()) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    setIsForgotPasswordLoading(true);
    setForgotPasswordMessage('');

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: forgotPasswordEmail.trim() }),
      });

      const data = await response.json();

      if (response.ok) {
        setForgotPasswordMessage('Password reset instructions have been sent to your email');
        setShowForgotPassword(false);
        setForgotPasswordEmail('');
      } else {
        setForgotPasswordMessage(data.message || 'Failed to send reset email');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      setForgotPasswordMessage('Failed to send reset email. Please try again.');
    } finally {
      setIsForgotPasswordLoading(false);
    }
  };

  if (!fontsLoaded) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={[...SKY_GRADIENT]}
          locations={[...SKY_LOCATIONS]}
          start={SKY_START}
          end={SKY_END}
          style={styles.backgroundGradient}
        />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator color={C.softPeach} size="large" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[...SKY_GRADIENT]}
        locations={[...SKY_LOCATIONS]}
        start={SKY_START}
        end={SKY_END}
        style={styles.backgroundGradient}
      />
      <LinearGradient
        colors={[
          'rgba(90, 74, 114, 0.08)',
          'rgba(255, 255, 255, 0.03)',
          'rgba(62, 44, 98, 0.08)',
        ]}
        locations={[0, 0.5, 1]}
        start={SKY_START}
        end={SKY_END}
        style={styles.atmosphereGradient}
        pointerEvents="none"
      />

      <View style={styles.cloudLayer} pointerEvents="none">
        <SolidCloudMark size={200} opacity={0.12} style={{ position: 'absolute', top: '5%', left: '-6%' }} />
        <SolidCloudMark size={160} opacity={0.11} style={{ position: 'absolute', top: '16%', right: '-4%' }} />
        <SolidCloudMark size={240} opacity={0.1} style={{ position: 'absolute', bottom: '14%', left: '4%' }} />
        <SolidCloudMark size={130} opacity={0.11} style={{ position: 'absolute', bottom: '26%', right: '12%' }} />
        <SolidCloudMark size={175} opacity={0.1} style={{ position: 'absolute', top: '3%', left: '38%' }} />
        <SolidCloudMark size={145} opacity={0.1} style={{ position: 'absolute', bottom: '8%', right: '-6%' }} />
        <SolidCloudMark size={115} opacity={0.11} style={{ position: 'absolute', top: '40%', left: '22%' }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
        <View style={styles.logoContainer}>
          <View style={styles.logoClip}>
            <Image
              source={require('../assets/chirp-mark.png')}
              style={styles.logoImage}
              resizeMode="cover"
            />
          </View>
          <Text style={styles.tagline}>Find Your Flock ✦</Text>
          <Text style={styles.appName}>Chirp</Text>
        </View>

        <View style={styles.featuresContainer}>
          <View style={[styles.feature, styles.featurePill1]}>
            <SparklesIcon size={24} color={C.paleLavender} />
            <Text style={styles.featureText}>Pull from the gacha</Text>
          </View>

          <View style={[styles.feature, styles.featurePill2]}>
            <HeartIcon size={24} color={C.softPeach} />
            <Text style={styles.featureText}>Engage with posts to earn crystals</Text>
          </View>

          <View style={[styles.feature, styles.featurePill3]}>
            <BotIcon size={24} color={C.lightBlueGrey} />
            <Text style={styles.featureText}>Raise your profile power and get more views</Text>
          </View>
        </View>

        <View style={styles.signInContainer}>
          <Text style={styles.signInTitle}>
            {isSignUp ? 'Join Chirp' : 'Welcome back'}
          </Text>
          <Text style={styles.signInSubtitle}>
            {isSignUp ? 'Create your account to get started' : 'Sign in to continue to Chirp'}
          </Text>

          <TextInput
            style={styles.emailInput}
            placeholder="Enter your email"
            placeholderTextColor={C.mediumLavender}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          
          <TextInput
            style={styles.emailInput}
            placeholder="Enter your password"
            placeholderTextColor={C.mediumLavender}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={true}
            autoCapitalize="none"
            autoCorrect={false}
          />

          {/* Forgot Password Link - only show for sign in */}
          {!isSignUp && (
            <TouchableOpacity
              style={styles.forgotPasswordButton}
              onPress={() => setShowForgotPassword(true)}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>
          )}

          {isSignUp && (
            <>
              <TextInput
                style={styles.emailInput}
                placeholder="Full name"
                placeholderTextColor={C.mediumLavender}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                autoCorrect={false}
              />
              
              <TextInput
                style={styles.emailInput}
                placeholder="Custom handle (e.g., @username)"
                placeholderTextColor={C.mediumLavender}
                value={customHandle}
                onChangeText={(text) => {
                  setCustomHandle(text);
                  // Debounce validation to avoid too many API calls
                  const timeoutId = setTimeout(() => {
                    validateHandle(text);
                  }, 500);
                  return () => clearTimeout(timeoutId);
                }}
                autoCapitalize="none"
                autoCorrect={false}
              />
              
              {/* Handle validation message */}
              {handleValidation && (
                <View style={styles.validationContainer}>
                  {isValidatingHandle ? (
                    <ActivityIndicator size="small" color={C.vibrantPurple} />
                  ) : (
                    <Text style={[
                      styles.validationText,
                      { color: handleValidation.available ? '#10b981' : '#ef4444' }
                    ]}>
                      {handleValidation.message}
                    </Text>
                  )}
                </View>
              )}
            </>
          )}
          
          <TouchableOpacity
            onPress={isSignUp ? handleSignUp : handleSignIn}
            disabled={isLoading}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={
                isLoading
                  ? [C.lightBlueGrey, C.lightBlueGrey]
                  : [C.mediumLavender, C.mediumLavender]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.signInButton}
            >
              {isLoading ? (
                <ActivityIndicator color={C.deepPurple} size="small" />
              ) : (
                <Text style={styles.signInButtonText}>
                  {isSignUp ? 'Create Account' : 'Sign In'}
                </Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.switchModeButton}
            onPress={() => setIsSignUp(!isSignUp)}
            disabled={isLoading}
          >
            <Text style={styles.switchModeText}>
              {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
            </Text>
          </TouchableOpacity>
          
        </View>

        {/* Forgot Password Modal */}
        {showForgotPassword && (
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Reset Password</Text>
              <Text style={styles.modalSubtitle}>
                Enter your email address and we'll send you instructions to reset your password.
              </Text>
              
              <TextInput
                style={styles.emailInput}
                placeholder="Enter your email"
                placeholderTextColor={C.mediumLavender}
                value={forgotPasswordEmail}
                onChangeText={setForgotPasswordEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
              
              {forgotPasswordMessage ? (
                <Text style={[
                  styles.forgotPasswordMessage,
                  forgotPasswordMessage.includes('sent') ? styles.successMessage : styles.errorMessage
                ]}>
                  {forgotPasswordMessage}
                </Text>
              ) : null}
              
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.modalCancelButton}
                  onPress={() => {
                    setShowForgotPassword(false);
                    setForgotPasswordEmail('');
                    setForgotPasswordMessage('');
                  }}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  onPress={handleForgotPassword}
                  disabled={isForgotPasswordLoading}
                  activeOpacity={0.85}
                  style={{ flex: 1, marginLeft: 8 }}
                >
                  <LinearGradient
                    colors={
                      isForgotPasswordLoading
                        ? [C.lightBlueGrey, C.lightBlueGrey]
                        : [C.mediumLavender, C.mediumLavender]
                    }
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.modalSubmitButton}
                  >
                    {isForgotPasswordLoading ? (
                      <ActivityIndicator color={C.deepPurple} size="small" />
                    ) : (
                      <Text style={styles.modalSubmitText}>Send Reset Email</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

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
  atmosphereGradient: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  cloudLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
    overflow: 'hidden',
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
    zIndex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoClip: {
    width: 88,
    height: 88,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 4,
    backgroundColor: '#6A4C92',
    shadowColor: '#1a0f2e',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  logoImage: {
    width: 88,
    height: 92,
    marginTop: -2,
  },
  appName: {
    fontSize: 32,
    color: '#ffffff',
    marginBottom: 8,
    ...TYPO.heading,
  },
  tagline: {
    fontSize: 15,
    color: C.softPeach,
    textAlign: 'center',
    marginBottom: 10,
    ...TYPO.heading,
  },
  featuresContainer: {
    marginBottom: 40,
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    width: '100%',
    marginBottom: 16,
  },
  featurePill1: {
    backgroundColor: 'rgba(253, 234, 223, 0.22)',
    borderWidth: 1,
    borderColor: 'rgba(190, 198, 235, 0.5)',
  },
  featurePill2: {
    backgroundColor: 'rgba(226, 218, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(157, 140, 217, 0.45)',
  },
  featurePill3: {
    backgroundColor: 'rgba(225, 160, 195, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(253, 234, 223, 0.45)',
  },
  featureText: {
    flex: 1,
    fontSize: 16,
    color: '#ffffff',
    marginLeft: 12,
    ...TYPO.bodyMedium,
  },
  signInContainer: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    maxWidth: 400,
    alignSelf: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: C.lightBlueGrey,
    backgroundColor: C.softPeach,
    shadowColor: C.deepPurple,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
  signInTitle: {
    fontSize: 24,
    color: C.deepPurple,
    textAlign: 'center',
    marginBottom: 8,
    ...TYPO.heading,
  },
  signInSubtitle: {
    fontSize: 16,
    color: C.mediumLavender,
    textAlign: 'center',
    marginBottom: 24,
    ...TYPO.body,
  },
  emailInput: {
    borderWidth: 2,
    borderColor: C.lightBlueGrey,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: C.deepPurple,
    backgroundColor: 'rgba(226, 218, 255, 0.45)',
    marginBottom: 16,
    ...TYPO.body,
  },
  validationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  validationText: {
    fontSize: 14,
    marginLeft: 8,
    ...TYPO.bodyMedium,
  },
  signInButton: {
    borderRadius: 12,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  signInButtonText: {
    color: C.deepPurple,
    fontSize: 16,
    ...TYPO.bodyMedium,
  },
  switchModeButton: {
    marginTop: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.mediumLavender,
    backgroundColor: 'transparent',
  },
  switchModeText: {
    color: C.deepPurple,
    fontSize: 16,
    textAlign: 'center',
    ...TYPO.bodyMedium,
  },
  footerText: {
    fontSize: 14,
    color: '#ffffff',
    textAlign: 'center',
    opacity: 0.9,
    lineHeight: 20,
    ...TYPO.body,
  },
  // Forgot Password Styles
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginBottom: 16,
  },
  forgotPasswordText: {
    color: C.mediumLavender,
    fontSize: 14,
    ...TYPO.bodyMedium,
  },
  // Modal Styles
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContainer: {
    backgroundColor: '#FFFCFA',
    borderRadius: 20,
    padding: 24,
    margin: 20,
    maxWidth: 400,
    width: '90%',
    borderWidth: 1,
    borderColor: C.lightBlueGrey,
  },
  modalTitle: {
    fontSize: 24,
    color: C.deepPurple,
    textAlign: 'center',
    marginBottom: 8,
    ...TYPO.heading,
  },
  modalSubtitle: {
    fontSize: 16,
    color: C.mediumLavender,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
    ...TYPO.body,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.vibrantPurple,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelText: {
    color: C.vibrantPurple,
    fontSize: 16,
    ...TYPO.bodyMedium,
  },
  modalSubmitButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  modalSubmitText: {
    color: C.deepPurple,
    fontSize: 16,
    ...TYPO.bodyMedium,
  },
  forgotPasswordMessage: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  successMessage: {
    color: '#059669',
    backgroundColor: '#d1fae5',
  },
  errorMessage: {
    color: '#dc2626',
    backgroundColor: '#fee2e2',
  },
});