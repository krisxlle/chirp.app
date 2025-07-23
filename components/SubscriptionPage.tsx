import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Alert,
  ActivityIndicator 
} from 'react-native';
import { router } from 'expo-router';
import Svg, { Path } from 'react-native-svg';

interface SubscriptionPageProps {
  onClose?: () => void;
}

// Custom Icon Components
const CrownIcon = ({ size = 20, color = "#7c3aed" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path 
      d="M2 12l3-8 7 3 7-3 3 8-10 8z" 
      stroke={color} 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </Svg>
);

const CheckIcon = ({ size = 16, color = "#7c3aed" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path 
      d="M20 6L9 17l-5-5" 
      stroke={color} 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </Svg>
);

export default function SubscriptionPage({ onClose }: SubscriptionPageProps) {
  const [isLoading, setIsLoading] = useState(false);
  
  const features = [
    "Change your handle anytime",
    "Exclusive Chirp+ badge",
    "Unlimited AI profile generations (vs once daily for free)",
    "Premium AI models (GPT-4o & HD image quality)",
    "Early access to new features",
    "Priority customer support"
  ];

  const handleSubscribe = async () => {
    setIsLoading(true);
    
    try {
      // Call the in-app purchase API with the specific product ID
      const productId = "com.kriselle.chirp.plus.monthly";
      
      // Check if we're in a browser environment (for testing)
      if (typeof window !== 'undefined' && window.location) {
        // Browser fallback - redirect to Stripe checkout
        Alert.alert(
          "Subscription",
          "Redirecting to secure payment page...",
          [
            {
              text: "Continue",
              onPress: () => {
                // Call backend to create Stripe checkout session
                handleStripeCheckout();
              }
            },
            {
              text: "Cancel",
              style: "cancel"
            }
          ]
        );
      } else {
        // Mobile in-app purchase
        await handleInAppPurchase(productId);
      }
    } catch (error) {
      console.error('Subscription error:', error);
      Alert.alert(
        "Error",
        "Failed to start subscription process. Please try again.",
        [{ text: "OK" }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleInAppPurchase = async (productId: string) => {
    try {
      console.log(`Initiating in-app purchase for product: ${productId}`);
      
      // Import mobile database functions
      const { verifyPurchase } = await import('../mobile-db');
      
      // Simulate purchase receipt (in real implementation this comes from platform)
      const mockReceiptData = {
        transactionId: `tx_${Date.now()}`,
        productId: productId,
        purchaseDate: new Date().toISOString(),
        platform: 'ios' // or 'android'
      };
      
      // Verify purchase with backend
      const result = await verifyPurchase(mockReceiptData, productId);
      
      if (result.success) {
        Alert.alert(
          "Purchase Successful!",
          "Welcome to Chirp+! You now have access to all premium features.",
          [
            {
              text: "Start Using Chirp+",
              onPress: () => {
                if (onClose) onClose();
                router.back();
              }
            }
          ]
        );
      } else {
        throw new Error('Purchase verification failed');
      }
      
    } catch (error) {
      console.error('In-app purchase error:', error);
      throw error;
    }
  };

  const handleStripeCheckout = async () => {
    try {
      // Import mobile database functions
      const { createSubscription } = await import('../mobile-db');
      
      // Call backend to create Stripe checkout session with product ID
      const result = await createSubscription("com.kriselle.chirp.plus.monthly");
      
      if (result.url) {
        // Open Stripe checkout in browser
        if (typeof window !== 'undefined' && window.open) {
          window.open(result.url, '_blank');
        }
      } else if (result.clientSecret) {
        // Handle Stripe payment intent
        Alert.alert(
          "Payment Required",
          "Complete your payment to activate Chirp+",
          [{ text: "OK" }]
        );
      }
      
    } catch (error) {
      console.error('Stripe checkout error:', error);
      Alert.alert(
        "Error",
        "Failed to create payment session. Please try again.",
        [{ text: "OK" }]
      );
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => {
          if (onClose) onClose();
          else router.back();
        }}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chirp+ Subscription</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.iconContainer}>
            <CrownIcon size={48} color="#7c3aed" />
          </View>
          <Text style={styles.heroTitle}>Upgrade to Chirp+</Text>
          <Text style={styles.heroSubtitle}>
            Unlock exclusive features and premium AI models
          </Text>
        </View>

        {/* Pricing */}
        <View style={styles.pricingSection}>
          <Text style={styles.price}>$4.99</Text>
          <Text style={styles.pricePeriod}>per month</Text>
          <Text style={styles.cancelAnytime}>Cancel anytime</Text>
        </View>

        {/* Features */}
        <View style={styles.featuresSection}>
          <Text style={styles.featuresTitle}>What you get with Chirp+:</Text>
          {features.map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <CheckIcon size={16} color="#7c3aed" />
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>

        {/* Subscribe Button */}
        <TouchableOpacity
          style={[styles.subscribeButton, isLoading && styles.subscribeButtonDisabled]}
          onPress={handleSubscribe}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#ffffff" size="small" />
          ) : (
            <>
              <CrownIcon size={20} color="#ffffff" />
              <Text style={styles.subscribeButtonText}>Subscribe to Chirp+ - $4.99/month</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Terms */}
        <Text style={styles.termsText}>
          By subscribing, you agree to our Terms of Service and Privacy Policy. 
          Subscription automatically renews unless canceled at least 24 hours before 
          the end of the current period.
        </Text>
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
  pricingSection: {
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: '#ffffff',
    marginBottom: 16,
  },
  price: {
    fontSize: 48,
    fontWeight: '800',
    color: '#7c3aed',
  },
  pricePeriod: {
    fontSize: 18,
    color: '#657786',
    marginTop: -8,
  },
  cancelAnytime: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 4,
  },
  featuresSection: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 24,
    paddingVertical: 24,
    marginBottom: 24,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureText: {
    fontSize: 16,
    color: '#374151',
    marginLeft: 12,
    flex: 1,
  },
  subscribeButton: {
    backgroundColor: '#7c3aed',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 24,
    marginBottom: 24,
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  subscribeButtonDisabled: {
    backgroundColor: '#9ca3af',
    shadowOpacity: 0,
  },
  subscribeButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginLeft: 8,
  },
  termsText: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 24,
  },
});